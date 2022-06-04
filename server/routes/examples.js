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


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))


async function update_examples(){

  catalogo_coded = 0
  var erros = []
  var exs = catalogo["examples"]

  for await( var e of exs ) {
    var error = 0
    const resp = await getChuckNorrisFact('sotexera6/EWVM-Examples', e["file"]).catch(err => { erros.push(err); error = 1 } )
    if (!error){
      var file = fs.createWriteStream('examples/'+ e["file"]);
      resp.pipe(file)
    }
  }
  return erros.join(' | ')

}



router.get('/git', function(req, res, next){

  var erros = []

  get_git('sotexera6/EWVM-Examples', 'catalogo.json', async function(err, resp) {
    if (err) res.send("Catalogo not found")

    else{

      delete require.cache[require.resolve('../catalogo.json')]
      var file = fs.createWriteStream('catalogo.json');
      resp.pipe(file);
      
      file.on('finish', async () => {
        file.close() 
        catalogo = require('../catalogo.json')

        const absPath = path.join(__dirname, "../examples");
        fsExtra.emptyDirSync(absPath)

        erros = await update_examples()
        console.log(erros)

        res.redirect('/examples')
      })     
    }
  });
})


router.get('/', function(req, res, next) {

  if(!catalogo_coded){
    var info = []
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
      if (orderBy2 === "dif")       arr = arr.sort( (a, b) => a.difficulty.localeCompare(b.difficulty) )
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
