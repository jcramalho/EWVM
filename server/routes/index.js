var express = require('express');
var router = express.Router();
var peggy = require("peggy");
const fs = require('fs');
const path = require('path');

const grammar = require('../public/javascripts/grammar.js');
const { manual } = require('../public/javascripts/manual.js');
const vm = require('../public/javascripts/vm.js');
var counter_path = '../instruction_counter.json'
const counter_file = require(counter_path);
const catalogo = require('../catalogo.json');

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


/* GET home page. */

router.get('/manual', function(req, res, next) {
  // render page
  res.render('manual', { title: 'EWVM-Manual', manual:manual });
})


router.get('/', function(req, res, next) {
  res.render('index', { title: 'EWVM', code: '', terminal: [], input:0, animation:[], index:0});
  // clean components
  Components.change(0, [], [], 0, [], [], [])
});


router.get('/run', function(req, res, next) {
  res.redirect('/')
});


router.post('/run', function(req, res, next) {
  var result = null
  var read = 0
  var input = null
  var index = 0
  var terminal = []

  // New code submitted
  if (req.file != undefined || req.body.code != undefined){
    // new program, clean components
    Components.change(0, [], [], 0, [], [], [])

    // Written code submitted
    if (req.body.code != undefined) code = req.body.code

    // Run Assembler
    var prepared_code = grammar.lowerGrammar(code)
    try{
      code_stack = parser.parse(prepared_code)
    } catch (error) { // Grammar Error
      result = ["GRAMMAR - ".concat(error)]
      animation = ["error"]
    }

    // textarea in front end deletes one \n if at first
    code = '\n'.concat(code)
  }

  // Grammar Error
  if (!Array.isArray(code_stack)) result = code_stack
  // Assembly Code done
  else if (result == null) 
    try{ 
      // input submitted
      if (req.body.input != undefined){
        input = req.body.input
        index = req.body.index
        terminal = req.body.terminal.replace(/\\n/g,'\n').split('"')
      }
      // run vm
      results = vm.run(input, code_stack, pointer_code, call_stack, operand_stack, frame_pointer, string_heap, struct_heap, animation, terminal.length - 1) 

      read = results[0]
      if (Array.isArray(results[1])) result = terminal.concat(results[1])  // keep terminal info + new results
      else result = [results[1]]    // result is an error

      Components.change(results[2], results[3], results[4], results[5], results[6], results[7], results[8])

    } catch(error){ 
      result = ["Anomaly: ".concat(error)]
      animation = ["error"]
    }
  // render page
  res.render('index', { title: 'EWVM', code: code, terminal: result, input: read, animation:JSON.stringify(animation), index:index });
});


router.post('/save', function(req, res, next) {
  
  // delete strings
  var code = req.body.code.replace( /[^"]+|".*?"/g, function(match){
    if(match.charAt(0) != '"' || match.charAt(match.length - 1) != '"') {
      return match.toUpperCase(); 
    }
    else return ''
  })

  // take off tabs and enters ; split words
  var code_divided = code.split('\n').join(' ').split('\t').join(' ').split(' ')

  // increment instructions counter in json data
  code_divided.forEach( c => {
    if(c!='' && isNaN(parseInt(c)) ) {
      if(counter_file.hasOwnProperty(c))
        counter_file[c] += 1
    }
  })

  // update json file
  const absPath = path.join(__dirname, counter_path);
  fs.writeFile(absPath, JSON.stringify(counter_file, null, 4), (err) => {
    if (err)
      console.log(err);
  });
  
  res.sendStatus(200);
});


router.get('/examples', function(req, res, next) {
  
  var exemplos = catalogo["examples"].sort( (a, b) => a.title.localeCompare(b.title) )
  
  var info = []
  exemplos.forEach(e => {
    const absPath = path.join(__dirname, "../exemplos/" + e.file);
    e["code"] = fs.readFileSync(absPath, {encoding:'utf8', flag:'r'})
    info.push(e)
  })

  res.render('examples', { title: 'EWVM-Examples', exemplos:info });
});

router.post('/examples/:title', function(req, res, next) {
  
  var exemplo = {
    title: req.body.title,
    category: req.body.category,
    title: req.body.title,
    code: req.body.code
  }

  res.render('example', { title: 'EWVM-Example', exemplo:exemplo });
});


module.exports = router;
