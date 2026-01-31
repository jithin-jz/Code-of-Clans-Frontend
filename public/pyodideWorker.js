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
            // Run User Code with timeout protection
            await executeWithTimeout(
                () => pyodide.runPythonAsync(code),
                EXECUTION_TIMEOUT
            );
            
            // Run Test Code if exists
            if (testCode) {
                try {
                    // Run test code to define the check() function
                    await executeWithTimeout(
                        () => pyodide.runPythonAsync(testCode),
                        EXECUTION_TIMEOUT
                    );
                    
                    // Call check() with the user's code scope (globals)
                    await executeWithTimeout(
                        () => pyodide.runPythonAsync(`
# Get the current global scope which contains user's functions/classes
_user_scope = globals().copy()
# Call the check function with the scope
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
