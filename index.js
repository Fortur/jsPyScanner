const express = require('express');
const app = express();
const cors = require('cors');
const {getDocumentProcessed, registerResult} = require('./server');

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({limit: '20mb'}));

app.use(function (err, req, res, next) {
    res.status(err.status || 500).json({status: err.status, message: err.message});
});

app.post('/startDocumentProcessed', async (req, res) => {
    if (!req.body.image) {
        throw {status: 400, message: 'encodedData required'};
    }
    const result = await getDocumentProcessed(req.body.image);
    res.json(result);
});

app.post('/registerResult', async (req, res) => {
    if (!req.body.image) {
        throw {status: 400, message: 'image required'};
    }
    if (!req.body.document_data_fields) {
        throw {status: 400, message: 'document_data required'};
    }

    await registerResult(req.body.image, req.body.document_data_fields);
    res.json({success: true});
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
