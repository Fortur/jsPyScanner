const {spawn} = require('child_process');


const runPy = new Promise(function (success, nosuccess) {
    const pyLib = spawn('C:/Users/andre/AppData/Local/Programs/Python/Python311/python.exe', ['./bridgeJs2Py.py', 'lib_register_result', 'param1' , 'param2']);

    pyLib.stdout.on('data', function (data) {
        success(data);
    });

    pyLib.stderr.on('data', (data) => {

        nosuccess(data);
    });
});

runPy.then(function (fromRunPy) {
    console.log('result:', fromRunPy.toString('ascii'));
}).catch(e => {
    console.log('err:', e.toString('ascii'));
})
