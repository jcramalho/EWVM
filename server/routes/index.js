var express = require('express');
var router = express.Router();
var peggy = require("peggy");

const grammar = require('../public/javascripts/grammar.js');
const vm = require('../public/javascripts/vm.js');

var parser = peggy.generate(grammar.grammar())

var pointer_code = 0
var call_stack = []
var operand_stack = []
var frame_pointer = 0
var code_stack = []
var code

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', code: '', terminal: '', input:0 });
  pointer_code = 0
  call_stack = []
  operand_stack = []
  frame_pointer = 0
});

router.post('/run', function(req, res, next) {
  var result = null
  var read = 0
  var input = 0

  if (req.body.code != undefined){
    code = req.body.code
    try{
      code_stack = parser.parse(req.body.code.toLowerCase())
    } catch (error) {
      result = "GRAMMAR - ".concat(error)
    }
  }
  if (!Array.isArray(code_stack)) result = code_stack
  else if (result == null) 
    try{ 
      if (req.body.input != undefined){
        input = req.body.input
        req.body.terminal = req.body.terminal.concat(input).concat('\n')
      }
      results = vm.run(input, code_stack, pointer_code, call_stack, operand_stack, frame_pointer) 

      read = results[0]
      result = results[1]
      pointer_code = results[2]
      call_stack = results[3]
      operand_stack = results[4]
      frame_pointer = results[5]

    } catch(error){ 
      result = "Anomaly: ".concat(error) 
    }

    if (!read){
      pointer_code = 0
      call_stack = []
      operand_stack = []
      frame_pointer = 0
      code_stack = []
    }

    if (req.body.terminal != undefined) result = req.body.terminal.concat(result)
  res.render('index', { title: 'Express', code: code, terminal: result, input: read });
});

module.exports = router;
