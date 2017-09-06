const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router();
const path = require('path');

router.get('/', function(req, res) {
    // send index.html from the public folder
    // sendfile (fileName, filePath)
    res.sendFile('index.html', {root: path.join(__dirname, '../../public/')});
});

module.exports = router;