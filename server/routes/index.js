var express = require('express');
var router = express.Router();
var peggy = require("peggy");


var parser = peggy.generate(`
// Simple Arithmetics Grammar
// ==========================
//
// Accepts expressions like "2 * (3 + 4)" and computes their value.

{
    var labelsRead = [];
    var labelsUsed = []
    var codigos = []
    var lines = 1
    var temp_lines = 0
    
    function result(){
    	let labelsMissing = labelsUsed.filter(x => !Object.keys(labelsRead).includes(x))
    	if (labelsMissing.length != 0) return "ERROR labels undefined: " + labelsMissing
        
        let cods = replaceEnderecos()
        return cods
    }
    
    function getInd(){
    	return codigos.length
    }
    
    function replaceEnderecos(label){
    	return codigos.map(x => {
        	if (x[0] >= 60 && x[0] <= 63) return [x[0], labelsRead[x[1]] ]
            else return x
        }) 
    }
}

Code = (_ Line _)* 								{ return result() }
      
Line
  = info:Instruction _ Comment* 				{ temp_lines = 0 }
  / Comment 									{ temp_lines = 0 }

Instruction
  = info:Label _ ":" 							{ labelsRead[info] = getInd(); }
  / func:Inst_Atom 								{ lines += temp_lines }
  / func:Inst_Int _ info:Integer				{ codigos.push([lines, func, info]) }
  / "pushf" _ info:Float						{ codigos.push([lines, 57, info]) }
  / "pushs" _ info:String        				{ codigos.push([lines, 58, info]) }
  / "err" _ info:String        					{ codigos.push([lines, 59, info]) }
  / "check" _ info:(Integer _ "," _ Integer)    { codigos.push([lines, 60, info[0], info[1]]) }
  / "jump" _ info:Label 						{ labelsUsed.push(info);codigos.push([lines, 61, info]) }
  / "jz" _ info:Label 							{ labelsUsed.push(info);codigos.push([lines, 62, info]) }
  / "pusha" _ info:Label 						{ labelsUsed.push(info);codigos.push([lines, 63, info]) }
  
 Inst_Atom = "stop" {codigos.push([lines, 0])} / "start" {codigos.push([lines, 1])} 
  / "add" {codigos.push([lines, 2])} / "sub" {codigos.push([lines, 3])} / "mul" {codigos.push([lines, 4])} 
  / "div" {codigos.push([lines, 5])} / "mod" {codigos.push([lines, 6])} / "not" {codigos.push([lines, 7])} 
  / "infeq" {codigos.push([lines, 9])} / "inf" {codigos.push([lines, 8])}  / "supeq" {codigos.push([lines, 11])}
  / "sup" {codigos.push([lines, 10])} / "fadd" {codigos.push([lines, 12])} / "fsub" {codigos.push([lines, 13])} 
  / "fmul" {codigos.push([lines, 14])} / "fdiv" {codigos.push([lines, 15])} / "fcos" {codigos.push([lines, 16])} 
  / "fsin" {codigos.push([lines, 17])} / "finfeq" {codigos.push([lines, 19])} / "finf" {codigos.push([lines, 18])} 
  / "fsupeq" {codigos.push([lines, 21])}/ "fsup" {codigos.push([lines, 20])}  / "concat" {codigos.push([lines, 22])} 
  / "equal" {codigos.push([lines, 23])} / "atoi" {codigos.push([lines, 24])} / "atof" {codigos.push([lines, 25])} 
  / "itof" {codigos.push([lines, 26])} / "ftoi" {codigos.push([lines, 27])} / "stri" {codigos.push([lines, 28])} 
  / "strf" {codigos.push([lines, 29])} / "pushsp" {codigos.push([lines, 30])} / "pushfp" {codigos.push([lines, 31])} 
  / "pushgp" {codigos.push([lines, 32])} / "loadn" {codigos.push([lines, 33])} / "storen" {codigos.push([lines, 34])} 
  / "swap" {codigos.push([lines, 35])} / "writei" {codigos.push([lines, 36])} / "writef" {codigos.push([lines, 37])} 
  / "writes" {codigos.push([lines, 38])} / "read" {codigos.push([lines, 39])} / "call" {codigos.push([lines, 40])} 
  / "return" {codigos.push([lines, 41])} / "allocn" {codigos.push([lines, 42])} / "free" {codigos.push([lines, 43])} 
  / "dupn" {codigos.push([lines, 44])} / "popn" {codigos.push([lines, 45])} / "padd" {codigos.push([lines, 46])} 
  / "nop" {codigos.push([lines, 64])}
  
  
Inst_Int = "pushi" {return 47} / "pushn" {return 48} / "pushg" {return 49} 
  / "pushl" {return 50} / "load" {return 51} / "dup" {return 52} / "pop" {return 53} 
  / "storel" {return 54} / "storeg" {return 55} / "alloc" {return 56} 


Comment = "//" [^\\n]*

Label "label" = [a-zA-Z0-9]+ { return text(); }

String = '"' [^\\n"]* '"' { return text(); }

Integer "integer" = ("+"/"-")? _ [0-9]+ { return parseInt(text(), 10); }

Float = ("+"/"-")? _ Integer(.Integer)? { return parseFloat(text(), 10); }

_ "whitespace" = (info:Space {temp_lines += info})*

Space = [\\n] { return 1 } 
	  / [ \\t\\r] { return 0 }
`)

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', code: '', result: '' });
});

router.post('/run', function(req, res, next) {
  console.log(req.body.code)
  console.log(parser.parse(req.body.code))
  res.render('index', { title: 'Express', code: req.body.code, result: parser.parse(req.body.code).toString() });
});

module.exports = router;
