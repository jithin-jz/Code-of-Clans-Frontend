/* eslint-disable no-undef */
importScripts("https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.js");

let pyodide = null;
const EXECUTION_TIMEOUT = 10000; // 10 seconds timeout

async function loadPyodideAndPackages() {
    try {
        pyodide = await loadPyodide();
        
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

            // Run User Code with timeout protection
            await executeWithTimeout(
                () => pyodide.runPythonAsync(code),
                EXECUTION_TIMEOUT
            );
            
            // Run Test Code if exists
            if (testCode) {
                try {
                    // Expose captured output to Python scope
                    pyodide.globals.set("output", stdoutBuffer.join("\n"));
                    
                    // Run test code to define the check() function (or run assertions directly)
                    await executeWithTimeout(
                        () => pyodide.runPythonAsync(testCode),
                        EXECUTION_TIMEOUT
                    );
                    
                    // Call check() if it was defined, otherwise we assume assertions in testCode were enough
                    await executeWithTimeout(
                        () => pyodide.runPythonAsync(`
# Check if 'check' function exists
if 'check' in globals() and callable(globals()['check']):
    _user_scope = {k: v for k, v in globals().items() if not k.startswith('_')}
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
