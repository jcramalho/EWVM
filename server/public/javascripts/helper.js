var animation = []
var instructions = {}
var z = 4

function on_ready(animation){
	if(animation) this.animation = animation

  	// create operand stack pointers
	var offsetHeight = document.getElementById('square').offsetHeight;
	var element = document.getElementById(`operand_stack`)
	var translate = element.offsetHeight - offsetHeight
	if (translate <= 0) translate = 0
	$(`<div id="square" class="square" style="position:relative; border-bottom:7px solid; border-color:white; border-image: linear-gradient(to right, blue 50%, green 50% ) 3; background-color:transparent; top:${translate}px; min-width:100%; height:${offsetHeight}px"></div>`).appendTo('#operand_stack');
}

$(function(){	
	$("#input").keypress(function(e){
		if(e.keyCode == 13)
			e.currentTarget.closest('form').submit()
		});
});

// run code example
function run_example(id){
	$('#input_code').val($(`#code${id}`).text())
	$('#form').attr('action', '/run');
	$('#form').submit();
}


// open example new window
function open_example(id, title, category, difficulty){
	$('#input_code').val($(`#code${id}`).text())
	$('#form').attr('action', `/examples/${title}`);
	$('#form').attr('target', "_blank");
	$('#form').append(`<input class="temporary" type="hidden" name="category" value="${category}" />`);
	$('#form').append(`<input class="temporary" type="hidden" name="difficulty" value="${difficulty}" />`);
	$('#form').append(`<input class="temporary" type="hidden" name="description" value="${$(`#description${id}`).text()}" />`);
	$('#form').submit();

	//clean form
	const elements = document.getElementsByClassName("temporary");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}


// reorder examples asc/desc
function reorder_examples(order) {
	if(order === 1) {
		$("#arrow1").toggleClass('fa-long-arrow-down fa-long-arrow-up');

		var items=$("#examples .examples_block").toArray();
		if(items.length == 0) items=$("#examples .example").toArray();
		items.reverse()
		$.each(items,function(){
			$("#examples").append(this); 
		});
	}

	else if (order === 2){
		$("#arrow2").toggleClass('fa-long-arrow-down fa-long-arrow-up');

		var blocks = document.getElementsByClassName("examples_block")
		$.each(blocks,function(){
			const b = this
			var list = b.getElementsByClassName("example")
			var items = Array.prototype.slice.call( list, 0 );
			items.reverse()
			$.each(items,function(){
				b.append(this); 
			});
		});
	}
}

// ---------------------------- ANIMATION ------------------------

function update_terminal(new_index, animation){
	var terminal_index = [-1, 0]
	if (new_index > 0) terminal_index = animation[new_index-1][6]
	
	var current_index = terminal_index[0]	
	var is_new = terminal_index[1]

	$('.terminal').each(function(i, obj) {
		if (animation.length == 1 && animation[0] === "error") $(this).css('color', "black")
		else if (i <= current_index){
			if (i == current_index){
				$(this).css('color', "#425660")
				if (is_new) $(this).html(`<b>${$(this).text()}</b>`)
				else $(this).html(`${$(this).text()}`)
				$('#terminal').animate({ scrollTop: $(this).position().top }, 500);	// scroll terminal
			}
			else{
				$(this).css('color', "black")
				$(this).html(`${$(this).text()}`)
			}
		}
		else {
			$(this).css('color', "#AAAAAA")
			$(this).html(`${$(this).text()}`)
		}
	});
}

function goToIndex(animation, ex_index, new_index){
	var ex_line = 0
	var new_line = 0
	if (ex_index > 0 && ex_index <= animation.length) ex_line = animation[ex_index-1][0]
	if (new_index >= 0 && new_index <= animation.length){
		if(new_index > 0) new_line = animation[new_index-1][0]
		$(".index").html(new_index)
		$('input[name=index]').val(new_index);
	}

	if(new_index <= animation.length){

		if(ex_line > 0){
			$(`.line${ex_line}`).css('color', "#AAAAAA")
			$(`.line${ex_line}`).css('text-shadow', "")
			$(`.line${ex_line}`).html(`${ex_line}`)
		}
		if(new_line > 0 ){
			$(`.line${new_line}`).css('color', '#425660')
			$(`.line${new_line}`).css('text-shadow', '0 0 3px #AAAAAA')
			$(`.line${new_line}`).html(`<b>${new_line}</b>`)
		}

		CodeEditor.highlightLine(new_line);
		update_terminal(new_index, animation)
		build_stacks(new_index, animation)
	}
}

function goToTerminal(terminal_index, animation){
	var index = parseInt($(".index").text())
	for(var i=0; i < animation.length; i++)
		if (animation[i][6][0] === terminal_index && animation[i][6][1] === 1){
			goToIndex(animation, index, i+1 )
			break
		}
}

function goFoward(animation){
	var index = parseInt($(".index").text())
	goToIndex(animation, index, index +1)
}

function goBack(animation){
	var index = parseInt($(".index").text())
	goToIndex(animation, index, index-1)
}

function goLast(animation){
	var index = parseInt($(".index").text())
	goToIndex(animation, index, animation.length)
}

function goFirst(animation){
	var index = parseInt($(".index").text())
	goToIndex(animation, index, 0)
}

function build_stacks(index, animation){
	var offsetHeight = document.getElementById('square').offsetHeight;
	$(".square").remove()

	if (index <= 0){
		document.getElementById('fp').innerText = ' -'
		document.getElementById('sp').innerText = ' 0'
		var element = document.getElementById(`operand_stack`)
		var translate = element.offsetHeight - offsetHeight
		if (translate <= 0) translate = 0
		$(`<div id="square" class="square" style="position:relative; border-bottom:7px solid; border-color:white; border-image: linear-gradient(to right, blue 50%, green 50% ) 3; background-color:transparent; top:${translate}px; min-width:100%; height:${offsetHeight}px"></div>`).appendTo('#operand_stack');
	}

	else if (index > 0){
		var state = animation[index-1]

		var operand_stack = state[1]
		var call_stack = state[2]
		var string_heap = state[3]
		var struct_heap = state[4]
		var fp = state[5]

		// update fp and sp
		if (fp != -1) document.getElementById('fp').innerText = ' '.concat(fp)
		else document.getElementById('fp').innerText = ' -'
		document.getElementById('sp').innerText = ' '.concat(operand_stack.length)
		
		// call stack
		$(`<div id="square" class="square" style="position:relative; top:0px; min-width:100%; visibility:hidden">}</div>`).appendTo('#call_stack');
		var element = document.getElementById(`call_stack`)
		var translate = element.offsetHeight - offsetHeight*(call_stack.length +1)
		if (translate <= 0) translate = 0
		for(var e=0; e < call_stack.length; e++){
			$(`<div id="square" class="square w3-border w3-half" style="position:relative; top:${translate}px; display:inline">${call_stack[e][0]}</div>`).appendTo('#call_stack');
			$(`<div id="square" class="square w3-border w3-half" style="position:relative; top:${translate}px; display:inline">${call_stack[e][1]}</div>`).appendTo('#call_stack');
		}

		// operand stack
		var element = document.getElementById(`operand_stack`)
		var translate = element.offsetHeight - offsetHeight*(operand_stack.length +1)
		if (translate <= 0) translate = 0
		for(var e=0; e <= operand_stack.length; e++){
			var colors = []
			var border_bottom = 'border-bottom: 1px solid #ccc;'
			var info = ''
			var background = ''
			if ( operand_stack.length-e === fp) colors.push('red')
			if ( operand_stack.length-e === 0) colors.push('blue')
			if ( e === 0 ){ colors.push('green') ; background="background-color:transparent;"}
			else info = operand_stack[operand_stack.length-e]
			if ( colors.length != 0 ){
				var colors_string = '' 
				for(var c = 0; c < colors.length; c++) colors_string = colors_string.concat(`, ${colors[c]} ${100/colors.length * c}%, ${colors[c]} ${100/colors.length * (c+1)}%`)
				border_bottom = `border-bottom:7px solid; border-image: linear-gradient(to right ${colors_string} ) 3;`
			}
			
			$(`<div id="square" class="square" style="position:relative; ${background} top:${translate}px; ${border_bottom} min-width:100%; height:${offsetHeight}px; overflow-y:auto">${info}</div>`).appendTo('#operand_stack');
		}

		// string heap
		$(`<div id="square" class="square w3-border" style="position:relative; top:0px; min-width:100%; visibility:hidden">}</div>`).appendTo('#string_heap');
		var element = document.getElementById(`string_heap`)
		var translate = element.offsetHeight - offsetHeight*(string_heap.length +1)
		if (translate <= 0) translate = 0
		for(var e=0; e < string_heap.length; e++){
			$(`<div id="square" class="square" style="position:relative; border-bottom:1px solid #ccc; top:${translate}px; min-width:100%; overflow-y:auto; height:${offsetHeight}px">${string_heap[string_heap.length-1-e].replace('\n', '\\n')}</div>`).appendTo('#string_heap');
		}
		
		// struct heap
		var element = document.getElementById(`struct_heap`)
		// iterate all arrays
		for(var e=0; e < struct_heap.length; e++){
			var translate = element.offsetHeight - offsetHeight*(struct_heap.length)
			if (translate <= 0) translate = 0
			$(`<div id="struct_container${e}" class="w3-container" style="position:relative; padding:0px; top: ${translate}px"; min-width:100%; overflow-y:auto>`).appendTo('#struct_heap');
			// build one array
			for(var i=0; i < struct_heap[struct_heap.length-1-e].length; i++){
				$(`<div id="struct${e}${i}" class="square w3-border" style="position:relative; border-bottom:1px solid #ccc; padding-right:5px; padding-left:5px; display:inline">${struct_heap[struct_heap.length-1-e][i]}</div>`).appendTo(`#struct_container${e}`);
			}
			$(`</div>`).appendTo('#struct_heap');

		}
	}

	if(!$('.square').length)
		$(`<div id="square" class="square" style="position:absolute; border-bottom:1px solid #ccc; visibility: hidden;">cell</div>`).appendTo('#string_heap');
}
