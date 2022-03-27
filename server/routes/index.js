var express = require('express');
var router = express.Router();
var peggy = require("peggy");
var fs = require('fs') ;
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });

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
var animation

Components = {
  change: function(pc, call_s, operand_s, fp, string_h, struct_h, a){
    pointer_code = pc
    call_stack = call_s
    operand_stack = operand_s
    frame_pointer = fp
    string_heap = string_h
    struct_heap = struct_h
    animation = a
  },
}

async function getFileCode(path) {
  code = await fs.readFile(path, 'utf8', function(err, data) {
    console.log("aqui 3")
    if (err) console.log( err );
    return data
  })
  return
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', code: '', terminal: '', input:0 });
  // clean components
  Components.change(0, [], [], 0, [], [], [])
});

router.post('/run', upload.single('file'), function(req, res, next) {
  var result = null
  var read = 0
  var input = 0

  // New code submitted
  if (req.file != undefined || req.body.code != undefined){
    // new program, clean components
    Components.change(0, [], [], 0, [], [], [])

    //File submitted
    if (req.file != undefined){
      const fileCode = fs.readFileSync(req.file.path, 'utf8', function(err, data) {
        if (err) console.log( err );
        return data;
      })
      code = fileCode
      fs.unlinkSync(req.file.path)
    }

    // Written code submitted
    else if (req.body.code != undefined) code = req.body.code

    // Run Assembler
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
      results = vm.run(input, code_stack, pointer_code, call_stack, operand_stack, frame_pointer, string_heap, struct_heap, animation) 

      read = results[0]
      result = results[1]

      Components.change(results[2], results[3], results[4], results[5], results[6], results[7], animation)

    } catch(error){ 
      result = "Anomaly: ".concat(error) 
    }

  // Read input submitted
  if (req.body.input != undefined){
    input = req.body.input
    // keep terminal info
    result = req.body.terminal.concat(result)
  }

  // program done executing, clean components
  if (!read) Components.change(0, [], [], 0, [], [], [])

  res.render('index', { title: 'Express', code: code, terminal: result, input: read, animation:JSON.stringify(animation) });
});

module.exports = router;
