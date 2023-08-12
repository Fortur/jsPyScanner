const {spawn} = require('child_process');


const runPy = (funcName, imageBase64, jsonDocString) => new Promise(function (resolve, reject) {
    const pyLib = spawn('C:/Users/andre/AppData/Local/Programs/Python/Python311/python.exe', ['./server/bridgeJs2Py.py', funcName, jsonDocString]);

    pyLib.stdin.write(imageBase64);
    pyLib.stdin.end();

    pyLib.stdout.on('data', function (data) {
        resolve(data);
    });

    pyLib.stderr.on('data', (data) => {

        reject(data);
    });
});

async function getDocumentProcessed(docBase64) {
    try {
        const result = await runPy('lib_process_image', docBase64);
        return result.toString('ascii');
    } catch (err) {
        console.log('err:', err.toString('ascii'));
        return {success: false};
    }
}

async function registerResult(docBase64, docData) {
    try {
        const result = await runPy('lib_register_result', docBase64, JSON.stringify(docData));
        return result.toString('ascii');
    } catch (err) {
        console.log('err:', err.toString('ascii'));
        return {success: false};
    }
}


module.exports = {getDocumentProcessed, registerResult};
