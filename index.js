const express = require('express');
const app = express();
const cors = require('cors');
const {getDocumentProcessed} = require('./server');

const port = 3000;


app.use(cors());
app.use(express.json({limit: '20mb'}));


app.post('/', async (req, res) => {
    if (!req.body.image) {
        throw new Error('encodedData required');
    }
    const result = await getDocumentProcessed(req.body.image);
    res.json(result);
    // res.send(JSON.stringify(result))
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
