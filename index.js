
let runPy = new Promise(function(success, nosuccess) {

    const { spawn } = require('child_process');
    const pyprog = spawn('C:/Users/andre/AppData/Local/Programs/Python/Python311/python.exe', ['./library.py', 1]);

    pyprog.stdout.on('data', function(data) {

        success(data);
    });

    pyprog.stderr.on('data', (data) => {

        nosuccess(data.toString('ascii'));
    });
});

runPy.then(function(fromRunpy) {
    console.log(fromRunpy.toString());
}).catch(e=>{
    console.log('err:', e);
})
