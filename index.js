const express = require('express');
const cors = require('cors');
const logger = require('./server/modules/logger');
const asyncWrap = require('./server/modules/asyncWrap');

const {getDocumentProcessed, registerResult} = require('./server');

if (!process.env.PYTHON_PATH){
    throw new Error('env PYTHON_PATH is required')
}

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({limit: '20mb'}));


app.post('/startDocumentProcessed', asyncWrap(async (req, res) => {
    if (!req.body.image) {
        throw {status: 400, message: 'encodedData required'};
    }
    const result = await getDocumentProcessed(req.body.image);
    res.json(result);
}));

app.post('/registerResult', asyncWrap(async (req, res) => {
    if (!req.body.image) {
        throw {status: 400, message: 'image required'};
    }
    if (!req.body.document_data_fields) {
        throw {status: 400, message: 'document_data required'};
    }

    await registerResult(req.body.image, req.body.document_data_fields);
    res.json({success: true});
}));

app.listen(port, () => {
    logger.info(`Example app listening on port ${port}`);
});
