module.exports = {
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
      var ref = x.split('#')
      if ( ref[0] === 'stack') return parseInt(ref[1], 16)
      else return -1
    },
    toStringRef: function(x){
      return 'string#'.concat(x)
    },
    getStringRef: function(x){
      var ref = x.split('#')
      if ( ref[0] === 'string') return ref.slice(1).join('#')
      else return -1
    },

    run: function(code) {
      var code_stack = code
      var pointer_code = 0
      var call_stack = []
      var operand_stack = []
      var frame_pointer = 0
      var string_healp = []

      var stop = 0
      var error = ''

      console.log(code)
      for (const c of code){
        console.log(c)
        console.log(c[1])

        if (!stop && error===''){
          line = c[0]

          switch(c[1]){
            case 0: //stop                  //
              stop = 1
              break
            case 1: //start                  //
              break
            case 2: //add
              console.log("here")
              var x1 = operand_stack.pop()
              var x2 = operand_stack.pop()
              if(Number.isInteger(x1) && Number.isInteger(x2))
                operand_stack.push(x2 + x1)
              else error = 'add: elements not Integer'
              break
            case 3: //sub
              var x1 = operand_stack.pop()
              var x2 = operand_stack.pop()
              if(Number.isInteger(x1) && Number.isInteger(x2))
                operand_stack.push(x2 - x1)
              else error = 'sub: elements not Integer'
              break
            case 4: //mul
              var x1 = operand_stack.pop()
              var x2 = operand_stack.pop()
              if(Number.isInteger(x1) && Number.isInteger(x2))
                operand_stack.push(x2 * x1)
              else error = 'mul: elements not Integer'
              break
            case 5: //div
              var x1 = operand_stack.pop()
              var x2 = operand_stack.pop()
              if(Number.isInteger(x1) && Number.isInteger(x2))
                operand_stack.push(x2 / x1)
              else error = 'div: elements not Integer'
              break
            case 6: //mod
              var x1 = operand_stack.pop()
              var x2 = operand_stack.pop()
              if(Number.isInteger(x1) && Number.isInteger(x2))
                operand_stack.push(x2 % x1)
              else error = 'mod: elements not Integer'
              break

            case 7: //not                  
              var x = operand_stack.pop()
              if(Number.isInteger(x))
                operand_stack.push( +(x == 0) )
              else error = 'not: element not Integer'
              break
            case 8: //inf
              var x1 = operand_stack.pop()
              var x2 = operand_stack.pop()
              if(Number.isInteger(x1) && Number.isInteger(x2))
                operand_stack.push( +(x2 < x1) )
              else error = 'inf: elements not Integer'
              break
            case 9: //infeq
              var x1 = operand_stack.pop()
              var x2 = operand_stack.pop()
              if(Number.isInteger(x1) && Number.isInteger(x2))
                operand_stack.push( +(x2 <= x1) )
              else error = 'infeq: elements not Integer'
              break
            case 10: //sup
              var x1 = operand_stack.pop()
              var x2 = operand_stack.pop()
              if(Number.isInteger(x1) && Number.isInteger(x2))
                operand_stack.push( +(x2 > x1) )
              else error = 'sup: elements not Integer'
              break
            case 11: //supeq
              var x1 = operand_stack.pop()
              var x2 = operand_stack.pop()
              if(Number.isInteger(x1) && Number.isInteger(x2))
                operand_stack.push( +(x2 >= x1) )
              else error = 'supeq: elements not Integer'
              break

            case 12: //fadd
              var x1 = operand_stack.pop()
              var x2 = operand_stack.pop()
              if(this.isNumber(x1) && this.isNumber(x2))
                operand_stack.push(x2 + x1)
              else error = 'fadd: elements not Real Number' 
              break           
            case 13: //fsub
              var x1 = operand_stack.pop()
              var x2 = operand_stack.pop()
              if(this.isNumber(x1) && this.isNumber(x2))
                operand_stack.push(x2 - x1)
              else error = 'fsub: elements not Real Number'
              break
            case 14: //fmul
              var x1 = operand_stack.pop()
              var x2 = operand_stack.pop()
              if(this.isNumber(x1) && this.isNumber(x2))
                operand_stack.push(x2 * x1)
              else error = 'fmul: elements not Real Number'
              break
            case 15: //fdiv
              var x1 = operand_stack.pop()
              var x2 = operand_stack.pop()
              if(this.isNumber(x1) && this.isNumber(x2))
                operand_stack.push(x2 / x1)
              else error = 'fdiv: elements not Real Number'
              break

            case 16: //fcos
              var x = operand_stack.pop()
              if(this.isNumber(x))
                operand_stack.push( Math.cos(x) )
              else error = 'fcos: element not Real Number'
              break
            case 17: //fsin
              var x = operand_stack.pop()
              if(this.isNumber(x))
                operand_stack.push( Math.sin(x) )
              else error = 'fsin: element not Real Number'
              break
              
            case 18: //finf
              var x1 = operand_stack.pop()
              var x2 = operand_stack.pop()
              if(this.isNumber(x1) && this.isNumber(x2))
                operand_stack.push( +(x2 < x1) )
              else error = 'finf: elements not Real Number'  
              break          
            case 19: //finfeq
              var x1 = operand_stack.pop()
              var x2 = operand_stack.pop()
              if(this.isNumber(x1) && this.isNumber(x2))
                operand_stack.push( +(x2 <= x1) )
              else error = 'finfeq: elements not Real Number'
              break
            case 20: //fsup
              var x1 = operand_stack.pop()
              var x2 = operand_stack.pop()
              if(this.isNumber(x1) && this.isNumber(x2))
                operand_stack.push( +(x2 > x1) )
              else error = 'fsup: elements not Real Number'
              break
            case 21: //fsupeq
              var x1 = operand_stack.pop()
              var x2 = operand_stack.pop()
              if(this.isNumber(x1) && this.isNumber(x2))
                operand_stack.push( +(x2 >= x1) )
              else error = 'fsupeq: elements not Real Number'
              break

            case 22: //concat
              var x1 = operand_stack.pop()
              var x2 = operand_stack.pop()
              if(this.isString(x1) && this.isString(x2))
                operand_stack.push( x1.concat(x2) )
              else error = 'concat: elements not String'
              break

            case 23: //equal
              var x1 = operand_stack.pop()
              var x2 = operand_stack.pop()
              operand_stack.push( +(x2 == x1) )
              break

            case 24: //atoi
              var x = operand_stack.pop()
              if(this.isString(x)){
                i = parseInt(x)
                if (i!=NaN) operand_stack.push(i)
                else error = 'atoi: String does not represent Integer'
              }
              else error = 'atoi: element not String'
              break
            case 25: //atof
              var x = operand_stack.pop()
              if(this.isString(x)){
                i = parseFloat(x)
                if (i!=NaN) operand_stack.push(i)
                else error = 'atof: String does not represent Real Number'
              }
              else error = 'atof: element not String'
              break
              
            case 26: //itof
              var x = operand_stack.pop()
              if(Number.isInteger(x))
                operand_stack.push( parseFloat(x) )
              else error = 'itof: element not Integer'
              break
            case 27: //ftoi
              var x = operand_stack.pop()
              if(this.isNumber(x))
                operand_stack.push( parseInt(x) )
              else error = 'ftoi: element not Real Number'
              break

            case 28: //stri
              var x = operand_stack.pop()
              if(Number.isInteger(x))
                operand_stack.push( x.toString() )
              else error = 'stri: element not Integer'
              break
            case 29: //strf
              var x = operand_stack.pop()
              if(this.isNumber(x))
                operand_stack.push( x.toString() )
              else error = 'strf: element not Real Number'
              break

            case 30: //pushsp
            case 31: //pushfp
            case 32: //pushgp
            case 33: //loadn
            case 34: //storen
            case 35: //swap
            case 36: //writei
            case 37: //writef
            case 38: //writes
            case 39: //read
            case 40: //call
            case 41: //return
            case 42: //allocn
            case 43: //free
            case 44: //dupn
            case 45: //popn
            case 46: //padd
            case 47: //pushi
            case 48: //pushn
            case 49: //pushg
            case 50: //pushl
            case 51: //load
            case 52: //dup
            case 53: //pop
            case 54: //storel
            case 55: //storeg
            case 56: //alloc
            case 57: //pushf
            case 58: //pushs
            case 59: //err
            case 60: //check
            case 61: //jump
            case 62: //jz
            case 63: //pusha
            case 64: //nop
            default: 
              console.log('Default case');
          }
        }
        else console.log('break')
      }
      if (error != '') console.log(error)
    }
 }