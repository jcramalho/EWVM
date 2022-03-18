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
    toRef: function(type, x){
      return type.concat('#').concat(x.toString())
    },
    changeStructRefIndex: function(x, index){
      var ref = x.split('#')
      ref[2] = index
      return ref.join('#')
    },
    getRef: function(x){
      if (!this.isString(x)) return [0]
      var ref = x.split('#')
      var type = ref[0]
      if (type === 'struct') return [ type, parseInt(ref[1]), parseInt(ref[2]) ]
      else if (type === 'stack' || type === "code" || type === 'string') return [ type, parseInt(ref[1]) ]
      else return [0]
    },
    putString: function(string_heap, x){
      string_heap.push(x)
      return this.toRef("string", string_heap.length-1)
    },
    putStruct: function(struct_heap, x){
      struct_heap.push(x)
      return this.toRef("struct", (struct_heap.length-1).toString().concat('#0') )
    },

    run: function(input, code, pointer_code, call_stack, operand_stack, frame_pointer, string_heap, struct_heap) {

      var code_stack = code
      var stop = 0
      var error = ''
      var result = ''
      var read = 0

      // stack input read
      if (input) operand_stack.push(this.putString(string_heap, input))

      // execute the code
      for (; pointer_code < code_stack.length; pointer_code++){

        c = code[pointer_code]

        if (!stop && !read && error===''){
          var line = c[0]
          var instruction = c[1]

          switch(instruction){
            case 0: //stop                  
              stop = 1
              break
            case 1: //start  
              frame_pointer = operand_stack.length                
              break
            case 2: //add
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(Number.isInteger(n) && Number.isInteger(m))
                  operand_stack.push(m + n)
                else error = 'Illegal Operand: add - elements not Integer'
              } else error = 'Segmentation Fault: add - elements missing'
              break
            case 3: //sub
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(Number.isInteger(n) && Number.isInteger(m))
                  operand_stack.push(m - n)
                else error = 'Illegal Operand: sub - elements not Integer'
              } else error = 'Segmentation Fault: sub - elements missing'
              break
            case 4: //mul
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(Number.isInteger(n) && Number.isInteger(m))
                  operand_stack.push(m * n)
                else error = 'Illegal Operand: mul - elements not Integer'
              } else error = 'Segmentation Fault: mul - elements missing'
              break
            case 5: //div
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if (n == 0) error = 'Division By Zero: div'
                else if(Number.isInteger(n) && Number.isInteger(m))
                  operand_stack.push(m / n)
                else error = 'Illegal Operand: div - elements not Integer'
              } else error = 'Segmentation Fault: div - elements missing'
              break
            case 6: //mod
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(Number.isInteger(n) && Number.isInteger(m))
                  operand_stack.push(m % n)
                else error = 'Illegal Operand: mod - elements not Integer'
              } else error = 'Segmentation Fault: mod - elements missing'
              break

            case 7: //not                  
              if (operand_stack.length >= frame_pointer + 1){
                var n = operand_stack.pop()
                if(Number.isInteger(n))
                  operand_stack.push( +(n == 0) )
                else error = 'Illegal Operand: not - element not Integer'
              } else error = 'Segmentation Fault: not - elements missing'
              break
            case 8: //inf
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(Number.isInteger(n) && Number.isInteger(m))
                  operand_stack.push( +(m < n) )
                else error = 'Illegal Operand: inf - elements not Integer'
              } else error = 'Segmentation Fault: inf - elements missing'
              break
            case 9: //infeq
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(Number.isInteger(n) && Number.isInteger(m))
                  operand_stack.push( +(m <= n) )
                else error = 'Illegal Operand: infeq - elements not Integer'
              } else error = 'Segmentation Fault: infeq - elements missing'
              break
            case 10: //sup
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(Number.isInteger(n) && Number.isInteger(m))
                  operand_stack.push( +(m > n) )
                else error = 'Illegal Operand: sup - elements not Integer'
              } else error = 'Segmentation Fault: sup - elements missing'
              break
            case 11: //supeq
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(Number.isInteger(n) && Number.isInteger(m))
                  operand_stack.push( +(m >= n) )
                else error = 'Illegal Operand: supeq - elements not Integer'
              } else error = 'Segmentation Fault: supeq - elements missing'
              break

            case 12: //fadd
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(this.isNumber(n) && this.isNumber(m))
                  operand_stack.push(m + n)
                else error = 'Illegal Operand: fadd - elements not Real Number' 
              } else error = 'Segmentation Fault: fadd - elements missing'
              break           
            case 13: //fsub
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(this.isNumber(n) && this.isNumber(m))
                  operand_stack.push(m - n)
                else error = 'Illegal Operand: fsub - elements not Real Number'
              } else error = 'Segmentation Fault: fsub - elements missing'
              break
            case 14: //fmul
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(this.isNumber(n) && this.isNumber(m))
                  operand_stack.push(m * n)
                else error = 'Illegal Operand: fmul - elements not Real Number'
              } else error = 'Segmentation Fault: fmul - elements missing'
              break
            case 15: //fdiv
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(this.isNumber(n) && this.isNumber(m))
                  operand_stack.push(m / n)
                else error = 'Illegal Operand: fdiv - elements not Real Number'
              } else error = 'Segmentation Fault: div - elements missing'
              break

            case 16: //fcos
              if (operand_stack.length >= frame_pointer + 1){
                var n = operand_stack.pop()
                if(this.isNumber(n))
                  operand_stack.push( Math.cos(n) )
                else error = 'Illegal Operand: fcos - element not Real Number'
              } else error = 'Segmentation Fault: fcos - elements missing'
              break
            case 17: //fsin
              if (operand_stack.length >= frame_pointer + 1){
                var n = operand_stack.pop()
                if(this.isNumber(n))
                  operand_stack.push( Math.sin(n) )
                else error = 'Illegal Operand: fsin - element not Real Number'
              } else error = 'Segmentation Fault: fsin - elements missing'
              break
              
            case 18: //finf
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(this.isNumber(n) && this.isNumber(m))
                  operand_stack.push( +(m < n) )
                else error = 'Illegal Operand: finf - elements not Real Number'  
              } else error = 'Segmentation Fault: finf - elements missing'
              break          
            case 19: //finfeq
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(this.isNumber(n) && this.isNumber(m))
                  operand_stack.push( +(m <= n) )
                else error = 'Illegal Operand: finfeq - elements not Real Number'
              } else error = 'Segmentation Fault: finfeq - elements missing'
              break
            case 20: //fsup
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(this.isNumber(n) && this.isNumber(m))
                  operand_stack.push( +(m > n) )
                else error = 'Illegal Operand: fsup - elements not Real Number'
              } else error = 'Segmentation Fault: fsup - elements missing'
              break
            case 21: //fsupeq
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                if(this.isNumber(n) && this.isNumber(m))
                  operand_stack.push( +(m >= n) )
                else error = 'Illegal Operand: fsupeq - elements not Real Number'
              } else error = 'Segmentation Fault: fsupeq - elements missing'
              break

            case 22: //concat
              if (operand_stack.length >= frame_pointer + 2){
                var s1 = this.getRef( operand_stack.pop() )
                var s2 = this.getRef( operand_stack.pop() )
                if( s1[0] === "string" && s2[0] === "String" )
                  operand_stack.push( this.putString( string_heap, string_heap[s1[1]].concat(string_heap[s2[1]])) )
                else error = 'Illegal Operand: concat - elements not String'
              } else error = 'Segmentation Fault: concat - elements missing'
              break

            case 23: //equal
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                operand_stack.push( +(m == n) )
              } else error = 'Segmentation Fault: equal - elements missing'
              break

            case 24: //atoi
              if (operand_stack.length >= frame_pointer + 1){
                var s = this.getRef( operand_stack.pop() )
                if(s[0] === "string"){
                  i = parseInt(string_heap[s[1]])
                  if (i!=NaN) operand_stack.push(i)
                  else error = 'Illegal Operand: atoi - String does not represent Integer'
                }
                else error = 'Illegal Operand: atoi - element not String Reference'
              } else error = 'Segmentation Fault: atoi - elements missing'
              break
            case 25: //atof
              if (operand_stack.length >= frame_pointer + 1){
                var s = this.getRef( operand_stack.pop() )
                if(s[0] === "string"){
                  i = parseFloat(string_heap[s[1]])
                  if (i!=NaN) operand_stack.push(i)
                  else error = 'Illegal Operand: atof - String does not represent Real Number'
                }
                else error = 'Illegal Operand: atof - element not String Reference'
              } else error = 'Segmentation Fault: atof - elements missing'
              break
              
            case 26: //itof
              if (operand_stack.length >= frame_pointer + 1){
                var n = operand_stack.pop()
                if(Number.isInteger(n))
                  operand_stack.push( parseFloat(n) )
                else error = 'Illegal Operand: itof - element not Integer'
              } else error = 'Segmentation Fault: itof - elements missing'
              break
            case 27: //ftoi
              if (operand_stack.length >= frame_pointer + 1){
                var n = operand_stack.pop()
                if(this.isNumber(n))
                  operand_stack.push( parseInt(n) )
                else error = 'Illegal Operand: ftoi - element not Real Number'
              } else error = 'Segmentation Fault: ftoi - elements missing'
              break

            case 28: //stri
              if (operand_stack.length >= frame_pointer + 1){
                var n = operand_stack.pop()
                if(Number.isInteger(n))
                  operand_stack.push( this.putString(string_heap, n.toString()) )
                else error = 'Illegal Operand: stri - element not Integer'
              } else error = 'Segmentation Fault: stri - elements missing'
              break
            case 29: //strf
              if (operand_stack.length >= frame_pointer + 1){
                var n = operand_stack.pop()
                if(this.isNumber(n))
                  operand_stack.push( this.putString(string_heap, n.toString()) )
                else error = 'Illegal Operand: strf - element not Real Number'
              } else error = 'Segmentation Fault: strf - elements missing'
              break

            case 30: //pushsp
              operand_stack.push( this.toRef("stack", operand_stack.length - 1) )
              break
            case 31: //pushfp
              operand_stack.push( this.toRef("stack", frame_pointer) )
              break
            case 32: //pushgp
              operand_stack.push( this.toRef("stack", 0) )
              break

            case 33: //loadn
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var a = operand_stack.pop()
                var ref = this.getRef(a)
                if (ref[0] === "stack")
                  operand_stack.push( operand_stack[ref[1]+n] )
                else if (ref[0] === "struct"){                                      // heap
                  var struct = struct_heap[ref[1]]
                  var index = ref[2] + n
                  if (struct.length > index && index >= 0) operand_stack.push( struct[index] )
                  else error = "Segmentation Fault: loadn - index out of Struct"
                } else error = 'Illegal Operand: loadn - element not Address'
              } else error = 'Segmentation Fault: loadn - elements missing'
              break
            case 34: //storen
              if (operand_stack.length >= frame_pointer + 3){
                var v = operand_stack.pop()
                var n = operand_stack.pop()
                var a = operand_stack.pop()
                var ref = this.getRef(a)
                if (Number.isInteger(v))
                  if (ref[0] === "stack")
                    operand_stack[ref[1]+n] = v
                  else if (ref[0] === "struct"){                                    // heap
                    var struct = struct_heap[ref[1]]
                    var index = ref[2] + n
                    if (struct.length > index && index >= 0) struct[index] = v
                    else error = "Segmentation Fault: storen - index out of Struct"
                  } else error = "Illegal Operand: storen - element not Address"
                else error = "Illegal Operand: storen - element not Integer"
              } else error = 'Segmentation Fault: storen - elements missing'
              break

            case 35: //swap
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var m = operand_stack.pop()
                operand_stack.push(m)
                operand_stack.push(n)
              } else error = 'Segmentation Fault: swap - elements missing'
              break

            case 36: //writei
              if (operand_stack.length >= frame_pointer + 1){
                var n = operand_stack.pop()
                if (Number.isInteger(n))
                  result = result.concat( n.toString() )
                else error = 'Illegal Operand: writei - element not Integer'
              } else error = 'Segmentation Fault: writei - elements missing'
              break
            case 37: //writef
              if (operand_stack.length >= frame_pointer + 1){
                var n = operand_stack.pop()
                if (this.isNumber(n))
                  result = result.concat( n.toString() )
                else error = 'Illegal Operand: writef - element not Real Number'
              } else error = 'Segmentation Fault: writef - elements missing'
              break
            case 38: //writes
              if (operand_stack.length >= frame_pointer + 1){
                var n = operand_stack.pop()
                var ref = this.getRef(n)
                if (ref[0] === "string")
                  result = result.concat( string_heap[ref[1]] )
                else error = 'Illegal Operand: writes - element not String Reference'
              } else error = 'Segmentation Fault: writes - elements missing'
              break
            case 39: //read                                                 // interaction
              read = 1
              break

            case 40: //call                                                 // call stack
            if (operand_stack.length >= frame_pointer + 1){
                var ref = this.getRef( operand_stack.pop() )
                if (ref[0] === "code"){
                  call_stack.push([pointer_code, frame_pointer])
                  pointer_code = ref[1] - 1
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
              if (operand_stack.length >= frame_pointer + 1){
                var n = operand_stack.pop()
                var struct = []
                struct.length = n
                operand_stack.push( this.putStruct(struct_heap, h) )
              } else error = 'Segmentation Fault: allocn - elements missing'
              break
            case 43: //free                                                 // heap
              if (operand_stack.length >= frame_pointer + 1){
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
              if (operand_stack.length >= frame_pointer + 1){
                var n = operand_stack.pop()
                if (operand_stack.length >= frame_pointer + n){
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
              if (operand_stack.length >= frame_pointer + 1){
                var n = operand_stack.pop()
                if (operand_stack.length >= frame_pointer + n)
                  for (let i=0; i < n; i++)
                    operand_stack.pop()
                else error = 'Segmentation Fault: popn - elements missing'
              } else error = 'Segmentation Fault: popn - elements missing'
              break

            case 46: //padd
              if (operand_stack.length >= frame_pointer + 2){
                var n = operand_stack.pop()
                var a = operand_stack.pop()
                var ref = this.getRef(a)
                if (ref[0] === "stack")
                  operand_stack.push( this.toRef("stack", ref[1]+n) )
                else if (ref[0] === "struct") {                                      // heap
                  var struct = struct_heap[ref[1]]
                  var index = ref[2] + n
                  if (struct.length > index && index >= 0) operand_stack.push( this.changeStructRefIndex(a, index) )
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
              if (operand_stack.length >= c[2])
                operand_stack.push( operand_stack[c[2]] )
              else error = 'Segmentation Fault: pushg - elements missing'
              break
            case 50: //pushl
              if (operand_stack.length >= frame_pointer + c[2])
                operand_stack.push( operand_stack[frame_pointer+c[2]] )
              else error = 'Segmentation Fault: pushg - elements missing'
              break

            case 51: //load
              if (operand_stack.length >= frame_pointer + 1){
                var a = operand_stack.pop()
                var ref = this.getRef(a)
                if (ref[0] === "stack")
                  operand_stack.push( operand_stack[ref[1]+c[2]] )
                else if (ref[0] === "struct"){                                       // heap
                  var struct = struct_heap[ref[1]]
                  var index = ref[2] + c[2]
                  if (struct.length > index) operand_stack.push( struct[index] )
                  else error = 'Segmentation Fault: load - index out of Struct'
                } else error = 'Illegal Operand: load - element not Address'
              } else error = 'Segmentation Fault: load - elements missing'
              break

            case 52: //dup
              var values = []
              if (operand_stack.length >= frame_pointer + c[2]){
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
              if (operand_stack.length >= frame_pointer + c[2]){
                for (let i=0; i < c[2]; i++)
                  operand_stack.pop()
              } else error = 'Segmentation Fault: pop - elements missing'
              break

            case 54: //storel
              if (operand_stack.length >= frame_pointer + 1){
                var v = operand_stack.pop()
                operand_stack[frame_pointer+c[2]] = v
              } else error = 'Segmentation Fault: storel - elements missing'
              break
            case 55: //storeg
              if (operand_stack.length >= frame_pointer + 1){
                var v = operand_stack.pop()
                operand_stack[c[2]] = v
              } else error = 'Segmentation Fault: storeg - elements missing'
              break
            case 56: //store
              if (operand_stack.length >= frame_pointer + 2){
                var v = operand_stack.pop()
                var a = operand_stack.pop()
                var ref = this.getRef(a)
                if (ref[0] === "stack")
                  operand_stack[ ref[1]+c[2] ] = v
                else if (ref[0] === "struct"){                                       // heap
                  var struct = struct_heap[ref[1]]
                  var index = ref[2] + c[2]
                  if (struct.length > index) struct[index] = v
                  else error = "Segmentation Fault: store - index out of Struct"
                } else error = "Illegal Operand: store - element not Address"
              } else error = 'Segmentation Fault: store - elements missing'
              break

            case 57: //alloc                                                  // heap
              var struct = []
              struct.length = c[2]
              operand_stack.push( this.putStruct(struct_heap, struct) )
              break

            case 58: //pushf
              operand_stack.push(c[2])
              break
            case 59: //pushs
              operand_stack.push( this.putString( string_heap, c[2] ) )
              break

            case 60: //err
              error = "Error: ".concat(c[2])
              break

            case 61: //check
              if (operand_stack.length >= frame_pointer + 1){
                var v = operand_stack.pop()
                operand_stack.push(v)
                if ( !(c[2] <= v && v <= c[3]) )
                  error = 'Illegal Operand: check - element not between given values' 
              } else error = 'Segmentation Fault: check - elements missing'
              break

            case 62: //jump
              var ref = this.getRef(c[2])
              pointer_code = ref[1] - 1
              break
            case 63: //jz
              if (operand_stack.length >= frame_pointer + 1){
                if (operand_stack.pop() === 0){
                  var ref = this.getRef(c[2])
                  pointer_code = ref[1] - 1
                }
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
      if (error != '') return [0, error, pointer_code, call_stack, operand_stack, frame_pointer, string_heap, struct_heap]
      return [read, result, pointer_code, call_stack, operand_stack, frame_pointer, string_heap, struct_heap]
    }
 }