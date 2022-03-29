
$(document).ready(function() {
	$(".lined").linedtextarea(
	  {selectedLine: -1}
	);

	scrollToLine(10000)
	scrollToLine(0)

 });

$(function(){
	$("#input").keypress(function(e){
		if(e.keyCode == 13)
			e.currentTarget.closest('form').submit()
		});
});

function scrollToLine(line){
	var offsetHeight = document.getElementById('line1').offsetHeight;
	document.getElementById(`code`).scrollTop = 0;
	document.getElementById(`code`).scrollTop += (offsetHeight * line) + 5;
}

function goFoward(animation){
	var index = parseInt($(".index").text())

	if (animation.length > index){
		if(index > 0) $(`.line${animation[index-1][0]}`).css('color', "#AAAAAA")
		$(`.line${animation[index][0]}`).css('color', 'red')
		$(".index").html(index + 1)

		scrollToLine(animation[index][0]-1)

		build_stacks(index + 1, animation)
	}
}

function goBack(animation){
	var index = parseInt($(".index").text())

	if (index > 0){
		$(`.line${animation[index-1][0]}`).css('color', "#AAAAAA")
		$(".index").html(index - 1)
		scrollToLine(0)

		if (index > 1)
			$(`.line${animation[index-2][0]}`).css('color', 'red')
			scrollToLine(animation[index-2][0]-1)
		
		build_stacks(index - 1, animation)
	}
}

function goLast(animation){
	var index = parseInt($(".index").text())

	$(`.line${animation[animation.length-1][0]}`).css('color', 'red')

	if (animation.length > index){
		if(index > 0) $(`.line${animation[index-1][0]}`).css('color', "#AAAAAA")
		$(".index").html(animation.length)

		scrollToLine(animation[animation.length-1][0]-1)

		build_stacks(animation.length, animation)
	}
}

function goFirst(animation){
	var index = parseInt($(".index").text())

	if(index > 0){ 
		$(`.line${animation[index-1][0]}`).css('color', "#AAAAAA")
		$(".index").html(0)

		scrollToLine(0)

		build_stacks(0, animation)
	}
}

function build_stacks(index, animation){

	var offsetHeight = document.getElementById('square').offsetHeight;

	$(".square").remove()

	if (index > 0){
		var state = animation[index-1]

		var operand_stack = state[1]
		var call_stack = state[2]
		var string_heap = state[3]
		var struct_heap = state[4]

		// call stack
		$(`<div id="square" class="square w3-border" style="position:relative; top:0px; min-width:100%; visibility:hidden">}</div>`).appendTo('#call_stack');
		var element = document.getElementById(`call_stack`)
		var translate = element.offsetHeight - offsetHeight*(call_stack.length +1)
		if (translate <= 0) translate = 0
		for(var e=0; e < call_stack.length; e++){
			$(`<div id="square" class="square w3-border w3-half" style="position:relative; top:${translate}px; display:inline">${call_stack[e][0]}</div>`).appendTo('#call_stack');
			$(`<div id="square" class="square w3-border w3-half" style="position:relative; top:${translate}px; display:inline">${call_stack[e][1]}</div>`).appendTo('#call_stack');
		}

		// operand stack
		$(`<div id="square" class="square w3-border" style="position:relative; top:0px; min-width:100%; visibility:hidden">}</div>`).appendTo('#operand_stack');
		var element = document.getElementById(`operand_stack`)
		var translate = element.offsetHeight - offsetHeight*(operand_stack.length +1)
		if (translate <= 0) translate = 0
		for(var e=0; e < operand_stack.length; e++)
			$(`<div id="square" class="square w3-border" style="position:relative; top:${translate}px; min-width:100%; overflow-y:auto">${operand_stack[operand_stack.length-1-e]}</div>`).appendTo('#operand_stack');

		// string heap
		$(`<div id="square" class="square w3-border" style="position:relative; top:0px; min-width:100%; visibility:hidden">}</div>`).appendTo('#string_heap');
		var element = document.getElementById(`string_heap`)
		var translate = element.offsetHeight - offsetHeight*(string_heap.length +1)
		if (translate <= 0) translate = 0
		for(var e=0; e < string_heap.length; e++){
			$(`<div id="square" class="square w3-border" style="position:relative; top:${translate}px; min-width:100%; overflow-y:auto">${string_heap[string_heap.length-1-e]}</div>`).appendTo('#string_heap');
		}
		
		// struct heap
		var element = document.getElementById(`struct_heap`)
		for(var e=0; e < struct_heap.length; e++){
			var left = 0
			var translate = element.offsetHeight - offsetHeight*(struct_heap.length)
			if (translate <= 0) translate = 0
			//alert(translate)
			$(`<div id="struct_container${e}" class="w3-container" style="position:relative; padding:0px; top: ${translate}px"; min-width:100%; overflow-y:auto>`).appendTo('#struct_heap');
			for(var i=0; i < struct_heap[struct_heap.length-1-e].length; i++){
				if(i > 0) left += document.getElementById(`struct${e}${i-1}`).offsetWidth;
				$(`<div id="struct${e}${i}" class="square w3-border" style="position:relative; padding-right:5px; padding-left:5px; display:inline">${struct_heap[struct_heap.length-1-e][i]}</div>`).appendTo(`#struct_container${e}`);
			}
			$(`</div>`).appendTo('#struct_heap');

		}
	}
	if(!$('.square').length)
		$(`<div id="square" class="square" style="position:absolute; bottom: 0px; visibility: hidden;">cell</div>`).appendTo('#string_heap');
	//anime({
	//	targets: ".square1",
	//	translateY:  '+=100%',
	//  });
}