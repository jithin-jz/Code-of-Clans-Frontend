/* eslint-disable no-undef */
importScripts("https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.js");

let pyodide = null;

async function loadPyodideAndPackages() {
    try {
        pyodide = await loadPyodide();
        // Redirect stdout to main thread
        pyodide.setStdout({
            batched: (msg) => {
                postMessage({ type: 'log', content: msg });
            }
        });
        postMessage({ type: 'ready' });
    } catch (err) {
        postMessage({ type: 'error', content: `Failed to load Pyodide: ${err}` });
    }
}

loadPyodideAndPackages();

self.onmessage = async (event) => {
    const { type, code, testCode } = event.data;

    if (type === 'run') {
        if (!pyodide) {
             postMessage({ type: 'error', content: "Pyodide is not ready yet." });
             return;
        }

        try {
            // Run User Code and capture the globals (scope)
            await pyodide.runPythonAsync(code);
            
            // Run Test Code if exists
            if (testCode) {
                 try {
                     // Run test code to define the check() function
                     await pyodide.runPythonAsync(testCode);
                     
                     // Now call check() with the user's code scope (globals)
                     // The user's code has already populated the global namespace
                     await pyodide.runPythonAsync(`
# Get the current global scope which contains user's functions/classes
_user_scope = globals().copy()
# Call the check function with the scope
check(_user_scope)
`);
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
