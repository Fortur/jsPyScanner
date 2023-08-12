const {spawn} = require('child_process');


const runPy = (funcName, param1, param2) => new Promise(function (resolve, reject) {
    const pyLib = spawn('C:/Users/andre/AppData/Local/Programs/Python/Python311/python.exe', ['./server/bridgeJs2Py.py', funcName]);

    pyLib.stdin.write(param1);
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
        throw(err);
    }
}


module.exports = {getDocumentProcessed};
