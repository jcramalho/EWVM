var express = require('express');
var router = express.Router();
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
var get_git = require('get-file');
const util = require('util');
const getChuckNorrisFact = util.promisify(get_git);

var catalogo = require('../catalogo.json');


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
  
  var exemplos = catalogo["examples"].sort( (a, b) => a.title.localeCompare(b.title) )
  
  var info = []
  exemplos.forEach(e => {
    const absPath = path.join(__dirname, "../examples/" + e.file);
    try{
      e["code"] = fs.readFileSync(absPath, {encoding:'utf8', flag:'r'})
      info.push(e)
    }
    catch(err){
      console.log("MISSING FILE: " + e.file + " not found")
    }
  })

  res.render('examples', { title: 'EWVM-Examples', exemplos:info });
});


module.exports = router;
