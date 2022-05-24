var express = require('express');
var router = express.Router();
const fs = require('fs');
const path = require('path');

const catalogo = require('../catalogo.json');


router.get('/', function(req, res, next) {
  
  var exemplos = catalogo["examples"].sort( (a, b) => a.title.localeCompare(b.title) )
  
  var info = []
  exemplos.forEach(e => {
    const absPath = path.join(__dirname, "../exemplos/" + e.file);
    e["code"] = fs.readFileSync(absPath, {encoding:'utf8', flag:'r'})
    info.push(e)
  })

  res.render('examples', { title: 'EWVM-Examples', exemplos:info });
});

router.post('/:title', function(req, res, next) {

  var exemplo = {
    title: req.params.title,
    category: req.body.category,
    code: req.body.code,
    difficulty: req.body.difficulty,
    description: req.body.description
  }

  res.render('example', { title: 'EWVM-Example', exemplo:exemplo });
});


module.exports = router;
