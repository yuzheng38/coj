const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const problemService = require('../services/problemService');


// GET /api/v1/problems
router.get('/problems', function(req, res){
    problemService.getProblems()
        .then(problems => res.json(problems));
});

// GET /api/v1/problems/:id
router.get('/problems/:id', function(req, res){
    const id = req.params.id;
    problemService.getProblem(+id)
        .then(problem => res.json(problem));
});

// POST /api/v1/problems
router.post('/problems', jsonParser, function(req, res){  
    problemService.addProblem(req.body)
        .then(function(problem){
            res.json(problem);
        }, function(error){
            res.status(400).send('Problem already exists');
        });
});


const nodeRestClient = require('node-rest-client').Client;
const restClient = new nodeRestClient();
const EXECUTOR_SERVER_URL = 'http://executor/repl';
restClient.registerMethod('repl', EXECUTOR_SERVER_URL, 'POST');
// repl
router.post('/repl', jsonParser, function(req, res){
    const userCodes = req.body.code;
    const lang = req.body.lang;
    restClient.methods.repl(
        {
            data: {
                code: userCodes,
                lang: lang
            },
            headers: {
                'Content-Type': 'application/json'
            }
        },
        (data, response) => {
            const result = `Build output: ${data['build']}  Execute output: ${data['run']}`;
            console.log('result is ', result);
            data['result'] = result;
            res.json(data);
        }
    );
});

module.exports = router;