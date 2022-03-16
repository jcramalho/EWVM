var express = require('express');
var router = express.Router();
var peggy = require("peggy");

const grammar = require('../public/javascripts/grammar.js');
const vm = require('../public/javascripts/vm.js');

var parser = peggy.generate(grammar.grammar())


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', code: '', result: '' });
});

router.post('/run', function(req, res, next) {
  var result = null
  var code_stack
  try{
    code_stack = parser.parse(req.body.code.toLowerCase())
  } catch (error) {
    result = "GRAMMAR - ".concat(error)
  }
  if (result == null) 
  try{ 
    result = vm.run(code_stack) 
  } catch(error){ 
    result = "Anomaly: ".concat(error) 
  }

  res.render('index', { title: 'Express', code: req.body.code, result: result });
});

module.exports = router;
