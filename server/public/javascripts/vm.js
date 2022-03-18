const grammar = require("./grammar")

module.exports = {
    lowerGrammar: function(code){
      return code.replace( /[^"]+|".*?"/g, function(match){
        if(match.charAt(0) != '"' || match.charAt(match.length - 1) != '"') {
          return match.toLowerCase(); 
        }
        else return match
      })
    },
    isNumber: function(x){
      return typeof x === 'number'
    },
    isString: function(x){
      return typeof x === 'string'
    },
    toStackRef: function(x){
      return 'stack#'.concat(x.toString(16))
    },
    getStackRef: function(x){
      if (!this.isString(x)) return -1
      var ref = x.split('#')
      if ( ref[0] === 'stack') return parseInt(ref[1], 16)
      else return -1
    },
    toStringRef: function(x){
      return 'string#'.concat(x)
    },
    getStringRef: function(x){
      if (!this.isString(x)) return -1
      var ref = x.split('#')
      if ( ref[0] === 'string') return ref.slice(1).join('#')
      else return 0
    },
    toCodeRef: function(x){
      return 'code#'.concat(x.toString(16))
    },
    getCodeRef: function(x){
      if (!this.isString(x)) return -1
      var ref = x.split('#')
      if ( ref[0] === 'code') return parseInt(ref[1], 16)
      else return -1
    },
    pop: function(x){
      if (operand_stack.length > 0) 
        return operand_stack.pop()
      else
      if ( ref[0] === 'code') return parseInt(ref[1], 16)
      else return -1
    },

    run: function(input, code, pointer_code, call_stack, operand_stack, frame_pointer) {

      var code_stack = code
      var stop = 0
      var error = ''
      var result = ''
      var read = 0


      if (input) operand_stack.push(this.toStringRef(input))

      for (; pointer_code < code_stack.length; pointer_code++){

        c = code[pointer_code]

        if (!stop && !read && error===''){
          line = c[0]

          switch(c[1]){
            case 0: //stop                  //
              stop = 1
              break
            case 1: //start                  //
              break
            case 2: //add
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(Number.isInteger(n) && Number.isInteger(m))
                  operand_stack.push(m + n)
                else error = 'Illegal Operand: add - elements not Integer'
              } else error = 'Segmentation Fault: add - elements missing'
              break
            case 3: //sub
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(Number.isInteger(n) && Number.isInteger(m))
                  operand_stack.push(m - n)
                else error = 'Illegal Operand: sub - elements not Integer'
              } else error = 'Segmentation Fault: sub - elements missing'
              break
            case 4: //mul
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(Number.isInteger(n) && Number.isInteger(m))
                  operand_stack.push(m * n)
                else error = 'Illegal Operand: mul - elements not Integer'
              } else error = 'Segmentation Fault: mul - elements missing'
              break
            case 5: //div
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if (n == 0) error = 'Division By Zero: div'
                else if(Number.isInteger(n) && Number.isInteger(m))
                  operand_stack.push(n / m)
                else error = 'Illegal Operand: div - elements not Integer'
              } else error = 'Segmentation Fault: div - elements missing'
              break
            case 6: //mod
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(Number.isInteger(n) && Number.isInteger(m))
                  operand_stack.push(m % n)
                else error = 'Illegal Operand: mod - elements not Integer'
              } else error = 'Segmentation Fault: mod - elements missing'
              break

            case 7: //not                  
              if (operand_stack.length >= 1){
                var n = operand_stack.pop()
                if(Number.isInteger(n))
                  operand_stack.push( +(n == 0) )
                else error = 'Illegal Operand: not - element not Integer'
              } else error = 'Segmentation Fault: not - elements missing'
              break
            case 8: //inf
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(Number.isInteger(n) && Number.isInteger(m))
                  operand_stack.push( +(m < n) )
                else error = 'Illegal Operand: inf - elements not Integer'
              } else error = 'Segmentation Fault: inf - elements missing'
              break
            case 9: //infeq
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(Number.isInteger(n) && Number.isInteger(m))
                  operand_stack.push( +(m <= n) )
                else error = 'Illegal Operand: infeq - elements not Integer'
              } else error = 'Segmentation Fault: infeq - elements missing'
              break
            case 10: //sup
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(Number.isInteger(n) && Number.isInteger(m))
                  operand_stack.push( +(m > n) )
                else error = 'Illegal Operand: sup - elements not Integer'
              } else error = 'Segmentation Fault: sup - elements missing'
              break
            case 11: //supeq
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(Number.isInteger(n) && Number.isInteger(m))
                  operand_stack.push( +(m >= n) )
                else error = 'Illegal Operand: supeq - elements not Integer'
              } else error = 'Segmentation Fault: supeq - elements missing'
              break

            case 12: //fadd
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(this.isNumber(n) && this.isNumber(m))
                  operand_stack.push(m + n)
                else error = 'Illegal Operand: fadd - elements not Real Number' 
              } else error = 'Segmentation Fault: fadd - elements missing'
              break           
            case 13: //fsub
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(this.isNumber(n) && this.isNumber(m))
                  operand_stack.push(m - n)
                else error = 'Illegal Operand: fsub - elements not Real Number'
              } else error = 'Segmentation Fault: fsub - elements missing'
              break
            case 14: //fmul
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(this.isNumber(n) && this.isNumber(m))
                  operand_stack.push(m * n)
                else error = 'Illegal Operand: fmul - elements not Real Number'
              } else error = 'Segmentation Fault: fmul - elements missing'
              break
            case 15: //fdiv
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(this.isNumber(n) && this.isNumber(m))
                  operand_stack.push(m / n)
                else error = 'Illegal Operand: fdiv - elements not Real Number'
              } else error = 'Segmentation Fault: div - elements missing'
              break

            case 16: //fcos
              if (operand_stack.length >= 1){
                var n = operand_stack.pop()
                if(this.isNumber(n))
                  operand_stack.push( Math.cos(n) )
                else error = 'Illegal Operand: fcos - element not Real Number'
              } else error = 'Segmentation Fault: fcos - elements missing'
              break
            case 17: //fsin
              if (operand_stack.length >= 1){
                var n = operand_stack.pop()
                if(this.isNumber(n))
                  operand_stack.push( Math.sin(n) )
                else error = 'Illegal Operand: fsin - element not Real Number'
              } else error = 'Segmentation Fault: fsin - elements missing'
              break
              
            case 18: //finf
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(this.isNumber(n) && this.isNumber(m))
                  operand_stack.push( +(m < n) )
                else error = 'Illegal Operand: finf - elements not Real Number'  
              } else error = 'Segmentation Fault: finf - elements missing'
              break          
            case 19: //finfeq
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(this.isNumber(n) && this.isNumber(m))
                  operand_stack.push( +(m <= n) )
                else error = 'Illegal Operand: finfeq - elements not Real Number'
              } else error = 'Segmentation Fault: finfeq - elements missing'
              break
            case 20: //fsup
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(this.isNumber(n) && this.isNumber(m))
                  operand_stack.push( +(m > n) )
                else error = 'Illegal Operand: fsup - elements not Real Number'
              } else error = 'Segmentation Fault: fsup - elements missing'
              break
            case 21: //fsupeq
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(this.isNumber(n) && this.isNumber(m))
                  operand_stack.push( +(m >= n) )
                else error = 'Illegal Operand: fsupeq - elements not Real Number'
              } else error = 'Segmentation Fault: fsupeq - elements missing'
              break

            case 22: //concat
              if (operand_stack.length >= 2){
                var s1 = this.getStringRef( operand_stack.pop() )
                var s2 = this.getStringRef( operand_stack.pop() )
                if( s1 && s2)
                  operand_stack.push( this.toStringRef(s1.concat(s2)) )
                else error = 'Illegal Operand: concat - elements not String'
              } else error = 'Segmentation Fault: concat - elements missing'
              break

            case 23: //equal
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                operand_stack.push( +(m == n) )
              } else error = 'Segmentation Fault: equal - elements missing'
              break

            case 24: //atoi
              if (operand_stack.length >= 1){
                var s = this.getStringRef( operand_stack.pop() )
                if(s){
                  i = parseInt(s)
                  if (i!=NaN) operand_stack.push(i)
                  else error = 'Illegal Operand: atoi - String does not represent Integer'
                }
                else error = 'Illegal Operand: atoi - element not String'
              } else error = 'Segmentation Fault: atoi - elements missing'
              break
            case 25: //atof
              if (operand_stack.length >= 1){
                var s = this.getStringRef( operand_stack.pop() )
                if(s){
                  i = parseFloat(s)
                  if (i!=NaN) operand_stack.push(i)
                  else error = 'Illegal Operand: atof - String does not represent Real Number'
                }
                else error = 'Illegal Operand: atof - element not String'
              } else error = 'Segmentation Fault: atof - elements missing'
              break
              
            case 26: //itof
              if (operand_stack.length >= 1){
                var n = operand_stack.pop()
                if(Number.isInteger(n))
                  operand_stack.push( parseFloat(n) )
                else error = 'Illegal Operand: itof - element not Integer'
              } else error = 'Segmentation Fault: itof - elements missing'
              break
            case 27: //ftoi
              if (operand_stack.length >= 1){
                var n = operand_stack.pop()
                if(this.isNumber(n))
                  operand_stack.push( parseInt(n) )
                else error = 'Illegal Operand: ftoi - element not Real Number'
              } else error = 'Segmentation Fault: ftoi - elements missing'
              break

            case 28: //stri
              if (operand_stack.length >= 1){
                var n = operand_stack.pop()
                if(Number.isInteger(n))
                  operand_stack.push( this.toStringRef(n.toString()) )
                else error = 'Illegal Operand: stri - element not Integer'
              } else error = 'Segmentation Fault: stri - elements missing'
              break
            case 29: //strf
              if (operand_stack.length >= 1){
                var n = operand_stack.pop()
                if(this.isNumber(n))
                  operand_stack.push( this.toStringRef(n.toString()) )
                else error = 'Illegal Operand: strf - element not Real Number'
              } else error = 'Segmentation Fault: strf - elements missing'
              break

            case 30: //pushsp
              operand_stack.push( this.toStackRef(operand_stack.length - 1) )
              break
            case 31: //pushfp
              operand_stack.push( this.toStackRef(frame_pointer) )
              break
            case 32: //pushgp
              operand_stack.push( this.toStackRef(0) )
              break

            case 33: //loadn
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var a = operand_stack.pop()
                var stack_ref = this.getStackRef(a)
                if (stack_ref >= 0)
                  operand_stack.push( operand_stack[stack_ref+n] )
                else if (Array.isArray(a)){                                      // heap
                  var index = a[1] + n
                  var struct = a[0]
                  if (struct.length > index && index >= 0) operand.push( struct[index] )
                  else error = "Segmentation Fault: loadn - index out of Struct"
                } else error = 'Illegal Operand: loadn - element not Address'
              } else error = 'Segmentation Fault: loadn - elements missing'
              break
            case 34: //storen
              if (operand_stack.length >= 3){
                var v = operand_stack.pop()
                var n = operand_stack.pop()
                var a = operand_stack.pop()
                var stack_ref = this.getStackRef(a)
                if (Number.isInteger(v))
                  if (stack_ref >= 0)
                    operand_stack[stack_ref+n] = v
                  else if (Array.isArray(a)){                                    // heap
                    var index = a[1] + n
                    var struct = a[0]
                    if (struct.length > index && index >= 0) struct[index] = v
                    else error = "Segmentation Fault: storen - index out of Struct"
                  } else error = "Illegal Operand: storen - element not Address"
                else error = "Illegal Operand: storen - element not Integer"
              } else error = 'Segmentation Fault: storen - elements missing'
              break

            case 35: //swap
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                operand_stack.push(m)
                operand_stack.push(n)
              } else error = 'Segmentation Fault: swap - elements missing'
              break

            case 36: //writei
              if (operand_stack.length >= 1){
                var n = operand_stack.pop()
                if (Number.isInteger(n))
                  result = result.concat( n.toString() )
                else error = 'Illegal Operand: writei - element not Integer'
              } else error = 'Segmentation Fault: writei - elements missing'
              break
            case 37: //writef
              if (operand_stack.length >= 1){
                var n = operand_stack.pop()
                if (this.isNumber(n))
                  result = result.concat( n.toString() )
                else error = 'Illegal Operand: writef - element not Real Number'
              } else error = 'Segmentation Fault: writef - elements missing'
              break
            case 38: //writes
              if (operand_stack.length >= 1){
                var n = operand_stack.pop()
                if (this.isString(n))
                  result = result.concat( this.getStringRef(n) )
                else error = 'Illegal Operand: writes - element not String'
              } else error = 'Segmentation Fault: writes - elements missing'
              break
            case 39: //read                                                 // interaction
              read = 1
              break

            case 40: //call                                                 // call stack
            if (operand_stack.length >= 1){
                var code_ref = this.getCodeRef( operand_stack.pop() )
                if (code_ref >= 0){
                  call_stack.push([pointer_code, frame_pointer])
                  pointer_code = code_ref - 1
                  frame_pointer = operand_stack.length
                } else error = 'Illegal Operand: call - element not Label' 
              } else error = 'Segmentation Fault: call - elements missing'
              break
            case 41: //return                                               // call stack 
              if (call_stack.length >= 1){
                var called = call_stack.pop()
                pointer_code = called[0] 
                frame_pointer = called[1]
              } else error = 'Segmentation Fault: return - elements missing'
              break

            case 42: //allocn                                               // heap
              if (operand_stack.length >= 1){
                var n = operand_stack.pop()
                var h = []
                h.length = n
                operand_stack.push([h, 0])
              } else error = 'Segmentation Fault: allocn - elements missing'
              break
            case 43: //free                                                 // heap
              if (operand_stack.length >= 1){
                var a = operand_stack.pop()
                if (Array.isArray(a))
                  a = null
                else if (a == null)
                  error = 'Illegal Operand: free - element null'
                else
                  error = 'Illegal Operand: free - element not Struct Address'
              } else error = 'Segmentation Fault: free - elements missing'
              break

            case 44: //dupn
              if (operand_stack.length >= 1){
                var n = operand_stack.pop()
                if (operand_stack.length >= n){
                  var values = []
                  for (let i=0; i < n; i++){
                    var v = operand_stack.pop()
                    values.push(v)
                    operand_stack.push(v)
                  }
                  for (const v of values)
                    operand_stack.push(v)
                } else error = 'Segmentation Fault: dupn - elements missing'
              } else error = 'Segmentation Fault: dupn - elements missing'
              break
            case 45: //popn
              if (operand_stack.length >= 1){
                var n = operand_stack.pop()
                if (operand_stack.length >= n)
                  for (let i=0; i < n; i++)
                    operand_stack.pop()
                else error = 'Segmentation Fault: popn - elements missing'
              } else error = 'Segmentation Fault: popn - elements missing'
              break

            case 46: //padd
              if (operand_stack.length >= 2){
                var n = operand_stack.pop()
                var a = operand_stack.pop()
                var stack_ref = this.getStackRef(a)
                if (stack_ref >= 0)
                  operand_stack.push( this.toStackRef(stack_ref+n) )
                else if (Array.isArray(a)) {                                      // heap
                  var index = a[1] + n
                  var struct = a[0]
                  if (struct.length > index && index >= 0) operand_stack.push( [struct, index] )
                  else error = 'Segmentation Fault: padd - index out of Struct'
                } else error = 'Illegal Operand: padd - element not Address'
              } else error = 'Segmentation Fault: padd - elements missing'
              break

            case 47: //pushi
              operand_stack.push(c[2])
              break
            case 48: //pushn
              for (let i=0; i < c[2]; i++)
                operand_stack.push(0)
              break
            case 49: //pushg
              operand_stack.push( operand_stack[c[2]] )
              break
            case 50: //pushl
              operand_stack.push( operand_stack[frame_pointer+c[2]] )
              break

            case 51: //load
              if (operand_stack.length >= 1){
                var a = operand_stack.pop()
                var stack_ref = this.getStackRef(a)
                if (stack_ref >= 0)
                  operand_stack.push( operand_stack[stack_ref+c[2]] )
                else if (Array.isArray(a)){                                       // heap
                  var index = a[1] + c[2]
                  var struct = a[0]
                  if (struct.length > index) operand_stack.push( struct[index] )
                  else error = 'Segmentation Fault: load - index out of Struct'
                } else error = 'Illegal Operand: load - element not Address'
              } else error = 'Segmentation Fault: load - elements missing'
              break

            case 52: //dup
              var values = []
              if (operand_stack.length >= c[2]){
                for (let i=0; i < c[2]; i++){
                  var v = operand_stack.pop()
                  values.push(v)
                  operand_stack.push(v)
                }
                for (const v of values)
                  operand_stack.push(v)
              } else error = 'Segmentation Fault: dup - elements missing'
              break
            case 53: //pop
              if (operand_stack.length >= c[2]){
                for (let i=0; i < c[2]; i++)
                  operand_stack.pop()
              } else error = 'Segmentation Fault: pop - elements missing'
              break

            case 54: //storel
              if (operand_stack.length >= 1){
                var v = operand_stack.pop()
                operand_stack[frame_pointer+c[2]] = v
              } else error = 'Segmentation Fault: storel - elements missing'
              break
            case 55: //storeg
              if (operand_stack.length >= 1){
                var v = operand_stack.pop()
                operand_stack[c[2]] = v
              } else error = 'Segmentation Fault: storeg - elements missing'
              break
            case 56: //store
              if (operand_stack.length >= 2){
                var v = operand_stack.pop()
                var a = operand_stack.pop()
                var stack_ref = this.getStackRef(a)
                if (stack_ref >= 0)
                  operand_stack[stack_ref+c[2]] = v
                else if (Array.isArray(a)){                                       // heap
                  var index = a[1] + c[2]
                  var struct = a[0]
                  if (struct.length > index) struct[index] = v
                  else error = "Segmentation Fault: store - index out of Struct"
                } else error = "Illegal Operand: store - element not Address"
              } else error = 'Segmentation Fault: store - elements missing'
              break

            case 57: //alloc                                                  // heap
              var h = []
              h.length = c[2]
              operand_stack.push([h, 0])
              break

            case 58: //pushf
              operand_stack.push(c[2])
              break
            case 59: //pushs
              operand_stack.push( this.toStringRef(c[2]) )
              break

            case 60: //err
              error = "Error: ".concat(c[2])
              break

            case 61: //check
              if (operand_stack.length >= 1){
                var v = operand_stack.pop()
                operand_stack.push(v)
                if ( !(c[2] <= v && v <= c[3]) )
                  error = 'Illegal Operand: check - element not between given values' 
              } else error = 'Segmentation Fault: check - elements missing'
              break

            case 62: //jump
              pointer_code = this.getCodeRef(c[2]) - 1
              break
            case 63: //jz
              if (operand_stack.length >= 1){
                if (operand_stack.pop() === 0) 
                  pointer_code = this.getCodeRef(c[2]) - 1
              } else error = 'Segmentation Fault: jz - elements missing'
              break
            case 64: //pusha
              operand_stack.push( c[2] )
              break

            case 65: //nop
              break
            default: 
              error = 'Anomaly: Default case'
          }
        }
        else break
      }
      if (error != '') return [0, error, pointer_code, call_stack, operand_stack, frame_pointer]
      console.log(operand_stack)
      return [read, result, pointer_code, call_stack, operand_stack, frame_pointer]
    }
 }