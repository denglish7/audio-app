const express = require("express");

const fs = require('fs');

const multer  = require('multer')

const upload = multer()

const PORT = process.env.PORT || 3001;

const app = express();

const uploadLocation = __dirname + 'blob.ogg';

app.post('/upload', upload.single('recording'), (req, res) => {
  fs.writeFile(uploadLocation, Buffer.from(new Uint8Array(req.file.buffer)), (err) => {
    if (err) {
      res.status(500).sendFile('Could not write to disk');
    } else {
      res.sendStatus(200);
    }
  });
});

app.get('/audio', (req, res) => {
  fs.readFile(uploadLocation, 'base64', (err, data) => {
    if (err) {
      res.status(500).send('Could not retrieve response');
    } else {
      res.status(200).send(data);
    }
  })
})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});