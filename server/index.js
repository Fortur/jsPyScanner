const logger = require('./modules/logger');

const {spawn} = require('child_process');

const runPy = (funcName, imageBase64, jsonDocString) => new Promise(function (resolve, reject) {
    const pyLib = spawn(process.env.PYTHON_PATH, ['./server/bridgeJs2Py.py', funcName, jsonDocString]);

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
        logger.info('getDocumentProcessed init');
        const result = await runPy('lib_process_image', docBase64);
        const stringResult = JSON.parse(String.fromCharCode(...result));

        logger.info(`getDocumentProcessed success`);

        if (!stringResult || !stringResult.document_type || !stringResult.fields) {
            throw new Error('invalid python function lib_process_image response');
        }

        return JSON.stringify(stringResult);
    } catch (err) {
        logger.error('err:', err.toString('ascii'));
        throw err;
    }
}

async function registerResult(docBase64, docData) {
    try {
        logger.info(`registerResult init`);
        const result = await runPy('lib_register_result', docBase64, JSON.stringify(docData));
        const stringResult = result.toString('ascii');

        const changedFields = Object.entries(docData).filter(([, {verified_value: newValue}]) => newValue).map(([field, {
            verified_value: newValue,
            value,
        }]) => `field: ${field}, old value: ${value}, new value: ${newValue}`);

        logger.info(`registerResult success with doc data, fields was changed by user: ${changedFields}`);

        return stringResult;
    } catch (err) {
        logger.error('err:', err.toString('ascii'));
        throw err;
    }
}


module.exports = {getDocumentProcessed, registerResult};
