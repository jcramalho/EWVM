/* -- Metadados de controlo -- */
const metadados = { version: "1.4", vdate: "2025-04-17" }
/* -- Metadados de controlo -- */

const express = require('express');
const router = express.Router();
const peggy = require("peggy");
const fs = require('fs');
const path = require('path');

const grammar = require('../public/javascripts/grammar.js');
const { manual } = require('../public/javascripts/manual.js');
const vm = require('../public/javascripts/vm.js');
const catalogo = require('../catalogo.json');
const EphemeralStorage = require('../util/EphemeralStorage.js');
const makeId = require('../util/makeId.js');

const parser = peggy.generate(grammar.grammar());

const sessionStorage = new EphemeralStorage({
  autoPrune: {
    // interval: 15 * 60000 // 15m
    interval: 500
  },
  ttl: 15 * 60000 // 15m
  // ttl: 1000
});

class SessionData {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.reset();
  }

  reset() {
    this.pointer_code = 0;
    this.call_stack = [];
    this.operand_stack = [];
    this.frame_pointer = 0;
    this.code_stack = [];
    this.string_heap = [];
    this.struct_heap = [];
    this.code = "";
    this.animation = [];

    this.result = undefined;
    this.index = 0;
    this.input = 0;
    this.terminal = [];
  }

  loadCode(code) {
    this.code = code;

    const preparedCode = grammar.lowerGrammar(code)
    try {
      this.code_stack = parser.parse(preparedCode)
      return true;
    } catch (error) {
      this.result = [`GRAMMAR - ${error}`];
      this.animation = ["error"];
      return false;
    }
  }

  run(input = null) {
    try {
      const results = vm.run(
        input, 
        this.code_stack, 
        this.pointer_code, 
        this.call_stack, 
        this.operand_stack, 
        this.frame_pointer, 
        this.string_heap, 
        this.struct_heap, 
        this.animation, 
        this.terminal.length - 1
      ); 

      this.input = results[0];
      if (Array.isArray(results[1])) this.result = this.terminal.concat(results[1])  // keep terminal info + new results
      else this.result = [results[1]]    // result is an error

      this.pointer_code = results[2];
      this.call_stack = results[3];
      this.operand_stack = results[4];
      this.frame_pointer = results[5];
      this.string_heap = results[6];
      this.struct_heap = results[7];
      this.animation = results[8];
    } catch(e) {
      this.result = [`Anomaly: ${e?.message ?? e ?? "Unknown"}`];
      this.animation = ["error"];
    }
  }

  out() {
    return { 
      title: 'EWVM', 
      code: this.code, 
      terminal: this.result, 
      input: this.input, 
      animation: JSON.stringify(this.animation), 
      index: this.index, 
      metadados: metadados, 
      sessionId: this.sessionId
    };
  }

  error(result) {
    this.animation = ["error"];
    this.result = [result];

    return this.out();
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  const sessionId = req.query._q ?? makeId(64);
  res.render('index', { 
    title: 'EWVM', 
    code: '', 
    terminal: [], 
    input: 0, 
    animation: [], 
    index: 0, 
    metadados: metadados, 
    sessionId: sessionId 
  });
});

router.get('/manual', function(req, res) {
  res.render('manual', { title: 'EWVM-Manual', manual:manual });
})

router.get('/credits', function(req, res) {
  res.render('credits', { metadados: metadados });
})

router.get('/run', function(req, res, next) {
  const sessionId = req.query._q;
  res.redirect(`/${sessionId !== undefined ? `?_q=${sessionId}` : ""}`);
});

router.post('/run', function(req, res) {
  const sessionId = req.body.sessionId ?? makeId(64);
  /** @type {SessionData} */
  let sessionData, ressurected = false;
  if (!sessionStorage.has(sessionId)) {
    const _sessionData = new SessionData(sessionId);
    sessionStorage.add(sessionId, _sessionData);

    sessionData = _sessionData;
  } else {
    sessionData = sessionStorage.get(req.body.sessionId);
    ressurected = true;
  }

  // Supposedly, req.file could also be handled here, but I haven't looked at the file processing leftovers yet.
  // if (req.body.code !== undefined && (!req.body.input || (req.body.input && !ressurected))) {
  if (req.body.code !== undefined && (!req.body.input || !ressurected)) {
    sessionData.reset();

    let lCodeRes;
    lCodeRes = sessionData.loadCode(req.body.code);
    if (lCodeRes !== true) {
      return res.render("index", sessionData.out());
    }

    // Grammar error
    if (!Array.isArray(sessionData.code_stack)) {
      return res.render("index", sessionData.error(sessionData.code_stack));
    }
  }
  
  // Process input. If it wasn't ressurected, start from 0.
  if (req.body.input != undefined && ressurected) {
    sessionData.index = req.body.index;
    sessionData.terminal = req.body.terminal.replace(/\\n/g,'\n').split('"');
    sessionData.run(req.body.input);
  } else {
    sessionData.run();
  }

  return res.render("index", sessionData.out());
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
