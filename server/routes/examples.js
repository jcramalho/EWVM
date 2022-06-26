var express = require('express');
var router = express.Router();
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
var get_git = require('get-file');
const util = require('util');
const getChuckNorrisFact = util.promisify(get_git);
const sortJson = require('sort-json');

var catalogo = require('../catalogo.json');
var catalogo_coded = 0


function add_examples_code(){

  if(!catalogo_coded){
    catalogo["examples"].forEach(e => {
      const absPath = path.join(__dirname, "../examples/" + e.file);
      try{
        e["code"] = fs.readFileSync(absPath, {encoding:'utf8', flag:'r'})
      }
      catch(err){
        console.log("MISSING FILE: " + e.file + " not found")
      }
    })
  }
}

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


router.get('/categories/:cat', function(req, res, next) {

  add_examples_code()
  let exemplos = catalogo["examples"].sort( (a, b) => a.title.localeCompare(b.title) ).filter(function(item){
    return item.category == req.params.cat;         
  });
  
  let order = "Title"
  if ( req.query.orderBy === 'dif'){
    order = "Difficulty"
    // categorize
    const result = {}
    exemplos.forEach( e => {
      let div = e.difficulty ?? "undefined"
      result[div] = result[div] ?? []
      result[div].push(e)
    });
    // order categories
    exemplos = sortJson(result, { ignoreCase: true, reverse: false, depth: 1});
  }
    
  res.render('categories', { title: 'EWVM-Category', exemplos:exemplos, category:req.params.cat, order:order });

});


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))


router.get('/update', function(req, res, next){

  catalogo_coded = 0

  delete require.cache[require.resolve('../catalogo.json')]

  catalogo = require('../catalogo.json')

  res.redirect('/examples')
})




router.get('/', function(req, res, next) {

  // get code from files
  add_examples_code()

  let orderBy1 = req.query.orderBy?.split(',')[0]
  let orderBy2 = req.query.orderBy?.split(',')[1]

  if ( orderBy1 === 'dif' || orderBy1 === 'cat'){

    // categorize
    const result = {}
    catalogo["examples"].forEach( e => {
      let div = "undefined"
      if (orderBy1 === "dif") div = e.difficulty
      else if (orderBy1 === "cat") div = e.category
      if (div){
        result[div] = result[div] ?? []
        result[div].push(e)
      }
    });
    // order categories
    var exemplos = sortJson(result, { ignoreCase: true, reverse: false, depth: 1});
    // order inside categories
    for (let i = 0; i < Object.keys(exemplos).length; i++){
      arr = exemplos[Object.keys(exemplos)[i]]
      if (orderBy2 === "dif")       arr = arr.sort( (a, b) => a.difficulty - b.difficulty )
      else if (orderBy2 === "cat")  arr = arr.sort( (a, b) => a.category.localeCompare(b.category) )
      else                          arr = arr.sort( (a, b) => a.title.localeCompare(b.title) )
    }
    
    
  }
  // order by title
  else{
    var exemplos = catalogo["examples"].sort( (a, b) => a.title.localeCompare(b.title) )
  }

  let order1 = "Title"
  if (orderBy1 === "dif") order1 = "Difficulty"
  else if (orderBy1 === "cat") order1 = "Category"
  let order2 = "Title"
  if (orderBy2 === "dif") order2 = "Difficulty"
  else if (orderBy2 === "cat") order2 = "Category"

  res.render('examples', { title: 'EWVM-Examples', exemplos:exemplos, order1:order1, order2:order2, orderBy1:orderBy1 });

});


module.exports = router;
