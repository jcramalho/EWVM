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
var string_heap = []
var struct_heap = []
var code

Components = {
  change: function(pc, call_s, operand_s, fp, string_h, struct_h){
    pointer_code = pc
    call_stack = call_s
    operand_stack = operand_s
    frame_pointer = fp
    string_heap = string_h
    struct_heap = struct_h
  },
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', code: '', terminal: '', input:0 });
  // clean components
  Components.change(0, [], [], 0, [], [])
});

router.post('/run', function(req, res, next) {
  var result = null
  var read = 0
  var input = 0

  // Code submitted
  if (req.body.code != undefined){
    code = req.body.code
    var prepared_code = vm.lowerGrammar(code)

    try{
      code_stack = parser.parse(prepared_code)
    } catch (error) { // Grammar Error
      result = "GRAMMAR - ".concat(error)
    }
  }

  // Grammar Error
  if (!Array.isArray(code_stack)) result = code_stack

  // Assembly Code done
  else if (result == null) 
    try{ 
      // input submitted
      if (req.body.input != undefined) input = req.body.input
      
      // run vm
      results = vm.run(input, code_stack, pointer_code, call_stack, operand_stack, frame_pointer, string_heap, struct_heap) 

      read = results[0]
      result = results[1]
      Components.change(results[2], results[3], results[4], results[5], results[6], results[7])

    } catch(error){ 
      result = "Anomaly: ".concat(error) 
    }

    // program executed, clean components
    if (!read) Components.change(0, [], [], 0, [], [])

    // if input keep terminal info
    if (req.body.terminal != undefined) result = req.body.terminal.concat(result)

  res.render('index', { title: 'Express', code: code, terminal: result, input: read });
});

module.exports = router;
