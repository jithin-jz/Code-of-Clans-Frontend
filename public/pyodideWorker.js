/* eslint-disable no-undef */
importScripts("https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.js");

let pyodide = null;
let isReady = false;

const EXECUTION_TIMEOUT = 5000; // Increased to 5 seconds

/* ================= PYODIDE INITIALIZATION ================= */

async function initPyodide() {
    try {
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/"
        });
        
        await pyodide.loadPackage("micropip");

        // Set up stdout/stderr handlers
        pyodide.setStdout({
            batched: (msg) => postMessage({ type: "log", content: msg })
        });

        pyodide.setStderr({
            batched: (msg) => postMessage({ type: "error", content: msg })
        });

        // Bootstrap security and utility functions
        await bootstrapPython();
        
        isReady = true;
        postMessage({ type: "ready" });
    } catch (err) {
        postMessage({ 
            type: "error", 
            content: `Failed to initialize Pyodide: ${err.toString()}` 
        });
    }
}

/* ================= BOOTSTRAP PYTHON ENVIRONMENT ================= */

const BOOTSTRAP_SCRIPT = `
import ast
import sys

# Blocked imports and builtins for security
BLOCKED_IMPORTS = {
    'os', 'sys', 'subprocess', 'shutil', 'socket', 
    'requests', 'urllib', 'http', 'pathlib', 'glob'
}

BLOCKED_BUILTINS = {
    'exec', 'eval', 'compile', 'open', '__import__'
}

class SecurityAnalyzer(ast.NodeVisitor):
    """AST visitor to detect disallowed operations"""
    def __init__(self):
        self.errors = []

    def visit_Import(self, node):
        for alias in node.names:
            module_name = alias.name.split('.')[0]
            if module_name in BLOCKED_IMPORTS:
                self.errors.append(f"Import '{alias.name}' is not allowed")
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        if node.module:
            module_name = node.module.split('.')[0]
            if module_name in BLOCKED_IMPORTS:
                self.errors.append(f"Import from '{node.module}' is not allowed")
        self.generic_visit(node)

    def visit_Call(self, node):
        if isinstance(node.func, ast.Name):
            if node.func.id in BLOCKED_BUILTINS:
                self.errors.append(f"Builtin '{node.func.id}()' is not allowed")
        self.generic_visit(node)

def is_safe_code(code):
    """Check if code is safe to execute"""
    try:
        tree = ast.parse(code)
        analyzer = SecurityAnalyzer()
        analyzer.visit(tree)
        
        if analyzer.errors:
            return False, "; ".join(analyzer.errors)
        return True, ""
    except SyntaxError as e:
        return False, f"Syntax Error: {str(e)}"
    except Exception as e:
        return False, f"Parse Error: {str(e)}"

# Store initial global state
_SAFE_GLOBALS = {
    'is_safe_code': is_safe_code,
    'ast': ast,
    'sys': sys,
    'BLOCKED_IMPORTS': BLOCKED_IMPORTS,
    'BLOCKED_BUILTINS': BLOCKED_BUILTINS,
    'SecurityAnalyzer': SecurityAnalyzer,
    '_SAFE_GLOBALS': None  # Will be set after
}

def cleanup_globals():
    """Clean up user-defined globals while preserving safe functions"""
    current_globals = list(globals().keys())
    for key in current_globals:
        if key not in _SAFE_GLOBALS and not key.startswith('_'):
            try:
                del globals()[key]
            except:
                pass

# Add cleanup to safe globals
_SAFE_GLOBALS['cleanup_globals'] = cleanup_globals

print("Python environment bootstrapped successfully")
`;

async function bootstrapPython() {
    try {
        await pyodide.runPythonAsync(BOOTSTRAP_SCRIPT);
    } catch (err) {
        throw new Error(`Bootstrap failed: ${err.toString()}`);
    }
}

/* ================= TIMEOUT WRAPPER ================= */

function executeWithTimeout(fn, timeoutMs) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`⏱️ Execution timeout after ${timeoutMs / 1000}s`));
        }, timeoutMs);

        Promise.resolve(fn())
            .then((result) => {
                clearTimeout(timeoutId);
                resolve(result);
            })
            .catch((err) => {
                clearTimeout(timeoutId);
                reject(err);
            });
    });
}

/* ================= SAFE CODE EXECUTION ================= */

async function executeSafely(code, timeoutMs = EXECUTION_TIMEOUT) {
    if (!pyodide || !isReady) {
        throw new Error("Pyodide is not ready");
    }

    // Check code safety
    const checkResult = await pyodide.runPythonAsync(`
safe, msg = is_safe_code("""${code.replace(/"/g, '\\"')}""")
(safe, msg)
    `);
    
    const [isSafe, errorMsg] = checkResult.toJs();
    
    if (!isSafe) {
        throw new Error(`🛡️ Security check failed: ${errorMsg}`);
    }

    // Clean previous execution state
    await pyodide.runPythonAsync("cleanup_globals()");

    // Execute code with timeout
    return await executeWithTimeout(
        () => pyodide.runPythonAsync(code),
        timeoutMs
    );
}

/* ================= MESSAGE HANDLER ================= */

self.onmessage = async (event) => {
    const { type, code, testCode } = event.data;

    if (!pyodide || !isReady) {
        postMessage({ 
            type: "error", 
            content: "⚠️ Pyodide is not ready yet. Please wait..." 
        });
        return;
    }

    try {
        switch (type) {
            case "run":
                await handleRun(code);
                break;
            
            case "validate":
                await handleValidate(code, testCode);
                break;
            
            default:
                postMessage({ 
                    type: "error", 
                    content: `Unknown message type: ${type}` 
                });
        }
    } catch (err) {
        postMessage({ 
            type: "error", 
            content: err.message || err.toString() 
        });
        postMessage({ type: "completed", passed: false });
    }
};

/* ================= RUN MODE ================= */

async function handleRun(code) {
    try {
        await executeSafely(code);
        postMessage({ type: "completed", passed: false }); // 'run' shouldn't complete challenges
    } catch (err) {
        postMessage({ 
            type: "error", 
            content: err.message || err.toString() 
        });
        postMessage({ type: "completed", passed: false });
    }
}

/* ================= VALIDATE MODE ================= */

async function handleValidate(code, testCode) {
    if (!testCode) {
        postMessage({ 
            type: "error", 
            content: "No test code provided for validation" 
        });
        postMessage({ type: "completed", passed: false });
        return;
    }

    try {
        console.log("Validation started: Executing user code...");
        // Capture output from user code
        let capturedOutput = [];
        
        pyodide.setStdout({
            batched: (msg) => {
                capturedOutput.push(msg);
                postMessage({ type: "log", content: msg });
            }
        });

        // Execute user code
        await executeSafely(code);

        // Store output for tests
        const outputStr = capturedOutput.join("\n");
        pyodide.globals.set("output", outputStr);

        console.log("Validation: Executing test suite...");
        // Execute test code
        try {
            await executeWithTimeout(
                () => pyodide.runPythonAsync(testCode),
                EXECUTION_TIMEOUT
            );
        } catch (testErr) {
            // Specific handling for AssertionErrors
            const errorMsg = testErr.message || testErr.toString();
            console.error("Test execution failed:", errorMsg);
            throw new Error(errorMsg);
        }

        // Run check function if it exists
        const hasCheck = await pyodide.runPythonAsync(
            "'check' in globals() and callable(check)"
        );

        if (hasCheck) {
            await executeWithTimeout(
                () => pyodide.runPythonAsync("check(globals())"),
                EXECUTION_TIMEOUT
            );
        }

        console.log("Validation: SUCCESS");
        postMessage({ type: "success", content: "✅ All tests passed!" });
        postMessage({ type: "completed", passed: true });

    } catch (err) {
        const errorMsg = err.message || err.toString();
        // Categorize error type
        const isSecurityError = errorMsg.includes("🛡️");
        const isTimeout = errorMsg.includes("⏱️");
        
        const displayMsg = isSecurityError ? errorMsg : `❌ Test failed: ${errorMsg}`;
        
        console.warn("Validation: FAILED", displayMsg);
        postMessage({ 
            type: "error", 
            content: displayMsg 
        });
        postMessage({ type: "completed", passed: false });
    } finally {
        // Restore stdout handler
        pyodide.setStdout({
            batched: (msg) => postMessage({ type: "log", content: msg })
        });
    }
}

/* ================= START INITIALIZATION ================= */

initPyodide();