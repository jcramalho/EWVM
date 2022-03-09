var express = require('express');
var router = express.Router();
var peggy = require("peggy");

const grammar = require('../public/javascripts/grammar.js');
const vm = require('../public/javascripts/vm.js');

var parser = peggy.generate(grammar.grammar())


/* GET home page. */
router.get('/', function(req, res, next) {
  var x = 'sou uma string'
  var x1 = 'string#sou uma string'
  console.log(vm.toStringRef(x))
  console.log(vm.toStringRef(x1))
  console.log(vm.getStringRef(vm.toStringRef(x)))
  console.log(vm.getStringRef(vm.toStringRef(x1)))
  res.render('index', { title: 'Express', code: '', result: '' });
});

router.post('/run', function(req, res, next) {
  console.log(req.body.code)
  console.log(parser.parse(req.body.code))
  vm.run(parser.parse(req.body.code))
  res.render('index', { title: 'Express', code: req.body.code, result: parser.parse(req.body.code).toString() });
});

module.exports = router;
