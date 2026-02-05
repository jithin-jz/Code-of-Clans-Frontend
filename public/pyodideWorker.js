/* eslint-disable no-undef */
importScripts("https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.js");

let pyodide = null;
const EXECUTION_TIMEOUT = 10000; // 10 seconds timeout

async function loadPyodideAndPackages() {
    try {
        pyodide = await loadPyodide();
        
        // Load Micropip (Package Manager) for future flexibility
        await pyodide.loadPackage("micropip");
        
        // Redirect stdout to main thread
        pyodide.setStdout({
            batched: (msg) => {
                postMessage({ type: 'log', content: msg });
            }
        });
        
        // Redirect stderr for better error capture
        pyodide.setStderr({
            batched: (msg) => {
                postMessage({ type: 'error', content: msg });
            }
        });
        
        postMessage({ type: 'ready' });
    } catch (err) {
        postMessage({ type: 'error', content: `Failed to load Pyodide: ${err}` });
    }
}

loadPyodideAndPackages();

// Execute code with timeout protection
function executeWithTimeout(asyncFn, timeoutMs) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`⏱️ Execution timed out after ${timeoutMs / 1000} seconds. Check for infinite loops!`));
        }, timeoutMs);

        asyncFn()
            .then((result) => {
                clearTimeout(timeoutId);
                resolve(result);
            })
            .catch((error) => {
                clearTimeout(timeoutId);
                reject(error);
            });
    });
}

// Helper: Python Security & Cleanup Script
// This mirrors services/ai/sandbox.py
const BOOTSTRAP_SCRIPT = `
import ast
import sys

# 1. Security Configuration
BLOCKED_IMPORTS = {'os', 'sys', 'subprocess', 'shutil', 'importlib', 'socket', 'requests', 'urllib', 'http', 'ftplib'}
BLOCKED_BUILTINS = {'exec', 'eval', 'compile', 'open', 'input'}

class SecurityAnalyzer(ast.NodeVisitor):
    def __init__(self):
        self.unsafe_found = []

    def visit_Import(self, node):
        for alias in node.names:
            if alias.name.split('.')[0] in BLOCKED_IMPORTS:
                self.unsafe_found.append(f"Importing '{alias.name}' is not allowed.")
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        if node.module and node.module.split('.')[0] in BLOCKED_IMPORTS:
            self.unsafe_found.append(f"Importing from '{node.module}' is not allowed.")
        self.generic_visit(node)

    def visit_Call(self, node):
        if isinstance(node.func, ast.Name):
            if node.func.id in BLOCKED_BUILTINS:
                self.unsafe_found.append(f"Calling function '{node.func.id}' is not allowed.")
        self.generic_visit(node)

def is_safe_code(code):
    try:
        tree = ast.parse(code)
        analyzer = SecurityAnalyzer()
        analyzer.visit(tree)
        if analyzer.unsafe_found:
            return False, "; ".join(analyzer.unsafe_found)
        return True, None
    except SyntaxError as e:
        return False, f"Syntax Error: {e}"

# 2. State Management
_INITIAL_GLOBALS = set(globals().keys())

def cleanup_globals():
    current_keys = set(globals().keys())
    # Keep initial globals + the cleanup function itself + security stuff
    keep = _INITIAL_GLOBALS | {'cleanup_globals', 'is_safe_code', 'SecurityAnalyzer', 'BLOCKED_IMPORTS', 'BLOCKED_BUILTINS'} 
    for key in current_keys:
        if key not in keep and not key.startswith('_'):
             del globals()[key]
`;

self.onmessage = async (event) => {
    const { type, code, testCode } = event.data;

    if (type === 'run') {
        if (!pyodide) {
            postMessage({ type: 'error', content: "Pyodide is not ready yet." });
            return;
        }

        try {
            // Buffer to capture stdout for tests
            let stdoutBuffer = [];
            pyodide.setStdout({
                batched: (msg) => {
                    stdoutBuffer.push(msg);
                    postMessage({ type: 'log', content: msg });
                }
            });

            // 1. Initialize Helper (Idempotent)
            if (!self.isBootstrapped) {
                await pyodide.runPythonAsync(BOOTSTRAP_SCRIPT);
                self.isBootstrapped = true;
            }

            // 2. Security Check (Python AST)
            // We escape the code to pass it safely as a string literal
            // Using globals().get() to call safely
            const checkSafe = pyodide.globals.get("is_safe_code");
            const [isSafe, errorMsg] = checkSafe(code).toJs();
            
            if (!isSafe) {
                 postMessage({ type: 'error', content: `🛡️ Security Violation: ${errorMsg}` });
                 postMessage({ type: 'completed', passed: false });
                 return;
            }

            // 3. Clean Slate (Cleanup from previous run)
            const cleanup = pyodide.globals.get("cleanup_globals");
            cleanup();

            // 4. Run User Code
            await executeWithTimeout(
                () => pyodide.runPythonAsync(code),
                EXECUTION_TIMEOUT
            );
            
            // 5. Run Tests
            if (testCode) {
                try {
                    // Set output BEFORE running test code (for check function definition)
                    const currentOutput = stdoutBuffer.join("\n") || "";
                    pyodide.globals.set("output", currentOutput);
                    
                    // Run test code (defines check function)
                    await executeWithTimeout(
                        () => pyodide.runPythonAsync(testCode),
                        EXECUTION_TIMEOUT
                    );
                    
                    // Update output AFTER test code runs (captures prints from function calls within test code)
                    const finalOutput = stdoutBuffer.join("\n") || "";
                    pyodide.globals.set("output", finalOutput);
                    
                    // Call check() with robust output handling
                    // - Ensure output is in scope dict
                    // - Fallback to empty string if check expects scope['output']
                    await executeWithTimeout(
                        () => pyodide.runPythonAsync(`
if 'check' in globals() and callable(globals()['check']):
    _output = output if 'output' in globals() else ''
    _user_scope = {k: v for k, v in globals().items() if not k.startswith('_')}
    _user_scope['output'] = _output
    # Make output also available for tests that access it directly
    globals()['output'] = _output
    check(_user_scope)
`),
                        EXECUTION_TIMEOUT
                    );
                    
                    postMessage({ type: 'success', content: "✅ Tests Passed!" });
                    postMessage({ type: 'completed', passed: true });
                } catch (testError) {
                    postMessage({ type: 'error', content: `❌ Test Failed: ${testError.toString()}` });
                    postMessage({ type: 'completed', passed: false });
                }
            } else {
                postMessage({ type: 'log', content: "⚠️ No tests defined. Code ran successfully." });
                postMessage({ type: 'completed', passed: false });
            }
        } catch (error) {
            postMessage({ type: 'error', content: `❌ ${error.toString()}` });
            postMessage({ type: 'completed', passed: false });
        }
    }
};
