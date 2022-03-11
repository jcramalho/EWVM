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

    run: function(code) {
      var code_stack = code
      var pointer_code
      var call_stack = []
      var operand_stack = []
      var frame_pointer = 0

      var stop = 0
      var error = ''
      var result = ''

      for (pointer_code = 0; pointer_code < code_stack.length; pointer_code++){
        c = code[pointer_code]

        if (!stop && error===''){
          line = c[0]

          console.log(operand_stack)
          console.log(c[1])
          switch(c[1]){
            case 0: //stop                  //
              stop = 1
              break
            case 1: //start                  //
              break
            case 2: //add
              var n = operand_stack.pop()
              var m = operand_stack.pop()
              if(Number.isInteger(n) && Number.isInteger(m))
                operand_stack.push(m + n)
              else error = 'add - elements not Integer'
              break
            case 3: //sub
              var n = operand_stack.pop()
              var m = operand_stack.pop()
              if(Number.isInteger(n) && Number.isInteger(m))
                operand_stack.push(m - n)
              else error = 'sub - elements not Integer'
              break
            case 4: //mul
              var n = operand_stack.pop()
              var m = operand_stack.pop()
              if(Number.isInteger(n) && Number.isInteger(m))
                operand_stack.push(m * n)
              else error = 'mul - elements not Integer'
              break
            case 5: //div
              var n = operand_stack.pop()
              var m = operand_stack.pop()
              console.log(m)
              console.log(n)
              console.log(m/n)
              if (m == 0) error = 'div - 0 division'
              else if(Number.isInteger(n) && Number.isInteger(m))
                operand_stack.push(n / m)
              else error = 'div - elements not Integer'
              break
            case 6: //mod
              var n = operand_stack.pop()
              var m = operand_stack.pop()
              if(Number.isInteger(n) && Number.isInteger(m))
                operand_stack.push(m % n)
              else error = 'mod - elements not Integer'
              break

            case 7: //not                  
              var n = operand_stack.pop()
              if(Number.isInteger(n))
                operand_stack.push( +(n == 0) )
              else error = 'not - element not Integer'
              break
            case 8: //inf
              var n = operand_stack.pop()
              var m = operand_stack.pop()
              if(Number.isInteger(n) && Number.isInteger(m))
                operand_stack.push( +(m < n) )
              else error = 'inf - elements not Integer'
              break
            case 9: //infeq
              var n = operand_stack.pop()
              var m = operand_stack.pop()
              if(Number.isInteger(n) && Number.isInteger(m))
                operand_stack.push( +(m <= n) )
              else error = 'infeq - elements not Integer'
              break
            case 10: //sup
              var n = operand_stack.pop()
              var m = operand_stack.pop()
              if(Number.isInteger(n) && Number.isInteger(m))
                operand_stack.push( +(m > n) )
              else error = 'sup - elements not Integer'
              break
            case 11: //supeq
              var n = operand_stack.pop()
              var m = operand_stack.pop()
              if(Number.isInteger(n) && Number.isInteger(m))
                operand_stack.push( +(m >= n) )
              else error = 'supeq - elements not Integer'
              break

            case 12: //fadd
              var n = operand_stack.pop()
              var m = operand_stack.pop()
              if(this.isNumber(n) && this.isNumber(m))
                operand_stack.push(m + n)
              else error = 'fadd - elements not Real Number' 
              break           
            case 13: //fsub
              var n = operand_stack.pop()
              var m = operand_stack.pop()
              if(this.isNumber(n) && this.isNumber(m))
                operand_stack.push(m - n)
              else error = 'fsub - elements not Real Number'
              break
            case 14: //fmul
              var n = operand_stack.pop()
              var m = operand_stack.pop()
              if(this.isNumber(n) && this.isNumber(m))
                operand_stack.push(m * n)
              else error = 'fmul - elements not Real Number'
              break
            case 15: //fdiv
              var n = operand_stack.pop()
              var m = operand_stack.pop()
              if(this.isNumber(n) && this.isNumber(m))
                operand_stack.push(m / n)
              else error = 'fdiv - elements not Real Number'
              break

            case 16: //fcos
              var n = operand_stack.pop()
              if(this.isNumber(n))
                operand_stack.push( Math.cos(n) )
              else error = 'fcos - element not Real Number'
              break
            case 17: //fsin
              var n = operand_stack.pop()
              if(this.isNumber(n))
                operand_stack.push( Math.sin(n) )
              else error = 'fsin - element not Real Number'
              break
              
            case 18: //finf
              var n = operand_stack.pop()
              var m = operand_stack.pop()
              if(this.isNumber(n) && this.isNumber(m))
                operand_stack.push( +(m < n) )
              else error = 'finf - elements not Real Number'  
              break          
            case 19: //finfeq
              var n = operand_stack.pop()
              var m = operand_stack.pop()
              if(this.isNumber(n) && this.isNumber(m))
                operand_stack.push( +(m <= n) )
              else error = 'finfeq - elements not Real Number'
              break
            case 20: //fsup
              var n = operand_stack.pop()
              var m = operand_stack.pop()
              if(this.isNumber(n) && this.isNumber(m))
                operand_stack.push( +(m > n) )
              else error = 'fsup - elements not Real Number'
              break
            case 21: //fsupeq
              var n = operand_stack.pop()
              var m = operand_stack.pop()
              if(this.isNumber(n) && this.isNumber(m))
                operand_stack.push( +(m >= n) )
              else error = 'fsupeq - elements not Real Number'
              break

            case 22: //concat
              var s1 = this.getStringRef( operand_stack.pop() )
              var s2 = this.getStringRef( operand_stack.pop() )
              if( s1 && s2)
                operand_stack.push( this.toStringRef(s1.concat(s2)) )
              else error = 'concat - elements not String'
              break

            case 23: //equal
              var n = operand_stack.pop()
              var m = operand_stack.pop()
              operand_stack.push( +(m == n) )
              break

            case 24: //atoi
              var s = this.getStringRef( operand_stack.pop() )
              if(s){
                i = parseInt(s)
                if (i!=NaN) operand_stack.push(i)
                else error = 'atoi - String does not represent Integer'
              }
              else error = 'atoi - element not String'
              break
            case 25: //atof
              var s = this.getStringRef( operand_stack.pop() )
              if(s){
                i = parseFloat(s)
                if (i!=NaN) operand_stack.push(i)
                else error = 'atof: String does not represent Real Number'
              }
              else error = 'atof - element not String'
              break
              
            case 26: //itof
              var n = operand_stack.pop()
              if(Number.isInteger(n))
                operand_stack.push( parseFloat(n) )
              else error = 'itof - element not Integer'
              break
            case 27: //ftoi
              var n = operand_stack.pop()
              if(this.isNumber(n))
                operand_stack.push( parseInt(n) )
              else error = 'ftoi - element not Real Number'
              break

            case 28: //stri
              var n = operand_stack.pop()
              if(Number.isInteger(n))
                operand_stack.push( this.toStringRef(n.toString()) )
              else error = 'stri - element not Integer'
              break
            case 29: //strf
              var n = operand_stack.pop()
              if(this.isNumber(n))
                operand_stack.push( this.toStringRef(n.toString()) )
              else error = 'strf - element not Real Number'
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
              var n = operand_stack.pop()
              var a = operand_stack.pop()
              var stack_ref = this.getStackRef(a)
              if (stack_ref >= 0)
                operand_stack.push( operand_stack[stack_ref+n] )
              else if (Array.isArray(a)){                                      // heap
                var index = a[1] + n
                var struct = a[0]
                if (struct.length > index) operand.push( struct[index] )
                else error = "loadn - index out of Struct"
              }else error = 'loadn - element not Address'
              break
            case 34: //storen
              var v = operand_stack.pop()
              var n = operand_stack.pop()
              var a = operand_stack.pop()
              var stack_ref = this.getStackRef(a)
              if (Number.isInteger(v))
                if (stack_ref >= 0)
                  operand_stack[a+n] = v
                else if (Array.isArray(a)){                                    // heap
                  var index = a[1] + n
                  var struct = a[0]
                  if (struct.length > index) struct[index] = v
                  else error = "storen - index out of Struct"
                } else error = "storen - element not Address"
              else error = "storen - element not Integer"
              break

            case 35: //swap
              var n = operand_stack.pop()
              var m = operand_stack.pop()
              operand_stack.push(m)
              operand_stack.push(n)
              break

            case 36: //writei
              var n = operand_stack.pop()
              if (Number.isInteger(n))
                result = result.concat( n.toString().concat('\n') )
              else error = 'writei - element not Integer'
              break
            case 37: //writef
              var n = operand_stack.pop()
              if (this.isNumber(n))
                result = result.concat( n.toString().concat('\n') )
              else error = 'writef - element not Real Number'
              break
            case 38: //writes
              var n = operand_stack.pop()
              if (this.isString(n))
                result = result.concat( this.getStringRef(n).concat('\n') )
              else error = 'writes - element not String'
              break
            case 39: //read                                                 // interaction

            case 40: //call                                                 // call stack
              var code_ref = this.getCodeRef( operand_stack.pop() )
              if (code_ref >= 0){
                call_stack.push([pointer_code, frame_pointer])
                pointer_code = code_ref - 1
                frame_pointer = operand_stack.length
              } else error = 'call - element not Label' 
              break
            case 41: //return                                               // call stack 
              var called = call_stack.pop()
              pointer_code = called[0]
              frame_pointer = called[1]
              break

            case 42: //allocn                                               // heap
              var n = operand_stack.pop()
              var h = []
              h.length = n
              operand_stack.push([h, 0])
              break
            case 43: //free                                                 // heap
              var a = operand_stack.pop()
              if (Array.isArray(a))
                a = null
              else if (a == null)
                error = 'free - element already freed'
              else
                error = 'free - element not Struct Address'
              break

            case 44: //dupn
              var n = operand_stack.pop()
              var values = []
              for (let i=0; i < n; i++){
                var v = operand_stack.pop()
                values.push(v)
                operand_stack.push(v)
              }
              for (const v of values)
                operand_stack.push(v)
              break
            case 45: //popn
              var n = operand_stack.pop()
              for (let i=0; i < n; i++)
                operand_stack.pop()
              break

            case 46: //padd
              var n = operand_stack.pop()
              var a = operand_stack.pop()
              var stack_ref = this.getStackRef(a)
              if (stack_ref >= 0)
                operand_stack.push( this.toStackRef(stack_ref+n) )
              else if (Array.isArray(a)) {                                      // heap
                var index = a[1] + n
                var struct = a[0]
                if (struct.length > index && index >= 0) operand_stack.push( [struct, index] )
                else error = 'padd - index out of Struct'
              } else error = 'padd - element not Address'
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
              var a = operand_stack.pop()
              var stack_ref = this.getStackRef(a)
              if (stack_ref >= 0)
                operand_stack.push( operand_stack[stack_ref+c[2]] )
              else if (Array.isArray(a)){                                       // heap
                var index = a[1] + c[2]
                var struct = a[0]
                if (struct.length > index) operand_stack.push( struct[index] )
                else error = 'load - index out of Struct'
              } else error = 'load - element not Address'
              break

            case 52: //dup
              var values = []
              for (let i=0; i < c[2]; i++){
                var v = operand_stack.pop()
                values.push(v)
                operand_stack.push(v)
              }
              for (const v of values)
                operand_stack.push(v)
              break
            case 53: //pop
              for (let i=0; i < c[2]; i++)
                operand_stack.pop()
              break

            case 54: //storel
              var v = operand_stack.pop()
              operand_stack[frame_pointer+c[2]] = v
              break
            case 55: //storeg
              var v = operand_stack.pop()
              operand_stack[c[2]] = v
              break
            case 56: //store
              var v = operand_stack.pop()
              var a = operand_stack.pop()
              var stack_ref = this.getStackRef(a)
              if (stack_ref >= 0)
                operand_stack[a+c[2]] = v
              else if (Array.isArray(a)){                                       // heap
                var index = a[1] + c[2]
                var struct = a[0]
                if (struct.length > index) struct[index] = v
                else error = "store - index out of Struct"
              } else error = "store - element not Address"
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
              error = c[2]
              break

            case 61: //check
              var v = operand_stack.pop()
              operand_stack.push(v)
              if ( !(c[2] <= v && v <= c[3]) )
                error = 'check - element not between given values' 
              break

            case 62: //jump
              pointer_code = c[2] - 1
              break
            case 63: //jz
              if (operand_stack.pop() === 0) 
                pointer_code = c[2] - 1
              break
            case 64: //pusha
              operand_stack.push( this.toCodeRef(c[2]) )
              break

            case 65: //nop
              break
            default: 
              console.log('Default case');
          }
        }
        else break
      }
      if (error != '') return 'ERROR: '.concat(error)
      return result
    }
 }