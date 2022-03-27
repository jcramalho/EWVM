
$(document).ready(function() {
	$(".lined").linedtextarea(
	  {selectedLine: -1}
	);
 });

$(function(){
	$("#input").keypress(function(e){
		if(e.keyCode == 13)
			e.currentTarget.closest('form').submit()
		});
});

function goFoward(animation){
	var index = parseInt($(".index").text())

	if (animation.length > index){
		if(index > 0) $(`.line${animation[index-1][0]}`).css('color', "#AAAAAA")
		$(`.line${animation[index][0]}`).css('color', 'red')
		$(".index").html(index + 1)

		build_stacks(index + 1, animation)
	}
}

function goBack(animation){
	var index = parseInt($(".index").text())

	if (index > 0){
		$(`.line${animation[index-1][0]}`).css('color', "#AAAAAA")
		$(".index").html(index - 1)

		if (index > 1)
			$(`.line${animation[index-2][0]}`).css('color', 'red')
		
		build_stacks(index - 1, animation)
	}
}

function goLast(animation){
	var index = parseInt($(".index").text())

	if (animation.length > index){
		if(index > 0) $(`.line${animation[index-1][0]}`).css('color', "#AAAAAA")
		$(`.line${animation[animation.length-1][0]}`).css('color', 'red')
		$(".index").html(animation.length)

		build_stacks(animation.length, animation)
	}
}

function goFirst(animation){
	var index = parseInt($(".index").text())

	if(index > 0){ 
		$(`.line${animation[index-1][0]}`).css('color', "#AAAAAA")
		$(".index").html(0)

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

		for(var e=0; e < call_stack.length; e++){
			$(`<div id="square" class="square w3-border" style="position:absolute; bottom: ${offsetHeight*e}px; left:0px; width:50%;">${call_stack[e][0]}</div>`).appendTo('#call_stack');
			$(`<div id="square" class="square w3-border" style="position:absolute; bottom: ${offsetHeight*e}px; right:0px; width:50%;">${call_stack[e][1]}</div>`).appendTo('#call_stack');
		}
		for(var e=0; e < operand_stack.length; e++)
			$(`<div id="square" class="square w3-border" style="position:absolute; bottom: ${offsetHeight*e}px; width:100%">${operand_stack[e]}</div>`).appendTo('#operand_stack');

		for(var e=0; e < string_heap.length; e++)
			$(`<div id="square" class="square w3-border" style="position:absolute; bottom: ${offsetHeight*e}px; height:${offsetHeight}px; width:100%">${string_heap[e]}</div>`).appendTo('#string_heap');
		
		for(var e=0; e < struct_heap.length; e++){
			var left = 0
			for(var i=0; i < struct_heap[e].length; i++){
				if(i > 0) left += document.getElementById(`struct${e}${i-1}`).offsetWidth;
				$(`<div id="struct${e}${i}" class="square w3-border" style="position:absolute; bottom: ${offsetHeight*e}px; left:${left}px; padding-right:5px; padding-left:5px; display:inline">${struct_heap[e][i]}</div>`).appendTo('#struct_heap');
			}
		}
	}
	if(!$('.square').length)
		$(`<div id="square" class="square" style="position:absolute; bottom: 0px; visibility: hidden;">cell</div>`).appendTo('#string_heap');
	//anime({
	//	targets: ".square1",
	//	translateY:  '+=100%',
	//  });
}