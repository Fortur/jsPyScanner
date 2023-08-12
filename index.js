const express = require('express');
const app = express();
const cors = require('cors');
const {getDocumentProcessed, registerResult} = require('./server');

const port = 3000;


app.use(cors());
app.use(express.json({limit: '20mb'}));


app.post('/startDocumentProcessed', async (req, res) => {
    if (!req.body.image) {
        throw new Error('encodedData required');
    }
    const result = await getDocumentProcessed(req.body.image);
    res.json(result);
});

app.post('/registerResult', async (req, res) => {
    if (!req.body.image) {
        throw new Error('image required');
    }
    if (!req.body.document_data_fields) {
        throw new Error('document_data required');
    }

    const result = await registerResult(req.body.image, req.body.document_data_fields);
    res.json(result);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
