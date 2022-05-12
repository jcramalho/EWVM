var animation
var instructions = {}

function on_ready(animation){
	this.animation = animation
	manual.map( x => {
		if(Array.isArray(x[1])) x[1].map( y => { instructions = Object.assign({}, instructions, y[1]) } )
		else instructions = Object.assign({}, instructions, x[1])
	})


	// create lined text
	$(".lined").linedtextarea(
        {selectedLine: -1, animation: animation}
      );


  	// create operand stack pointers
	var offsetHeight = document.getElementById('square').offsetHeight;
	var element = document.getElementById(`operand_stack`)
	var translate = element.offsetHeight - offsetHeight
	if (translate <= 0) translate = 0
	$(`<div id="square" class="square" style="position:relative; border-color:white; border-image: linear-gradient(to right, blue 50%, green 50% ) 3; background-color:transparent; top:${translate}px; min-width:100%; height:${offsetHeight}px"></div>`).appendTo('#operand_stack');
		

	// lined text accept tab
	document.getElementById('code').addEventListener("keydown", function(e) {
		if (e.key==='Tab') {
			// get caret position/selection
			var start = this.selectionStart;
			var end = this.selectionEnd;
	
			var target = e.target;
			var value = target.value;
	
			// set textarea value to: text before caret + tab + text after caret
			target.value = value.substring(0, start)
						+ "\t"
						+ value.substring(end);
	
			// put caret at right position again (add one for the tab)
			this.selectionStart = this.selectionEnd = start + 1;
	
			// prevent the focus lose
			e.preventDefault();

		}
	}, false);
	

	// keeps animation in its last place
	var index = parseInt($(".index").text())
	goToIndex(animation, 0, index)
}


// when file is uploaded, print text
$(document).ready(function() {
    $('#file').change(function(e) {
        if (e.target.files != undefined) {
            var reader = new FileReader();
            
            reader.onload = function(e) {
                $('#code').text(e.target.result);
            };

            reader.readAsText(e.target.files.item(0));
        }
    });
});


// resize code window when window size is changed
window.addEventListener('resize', function(event) {

	// resize code height
    $(".linedwrap").height("70%")
    $(".lines").height("100%")
	$(".lineno").remove()
	fillOutLines( $(".codelines"), $(".lines").height(), 1, -1 )
	clickable_numbers(animation)

	// resize code width
	var sidebarWidth = $(".lines").outerWidth();
	var paddingHorizontal = parseInt( $(".linedwrap").css("border-left-width") ) + parseInt( $(".linedwrap").css("border-right-width") ) + parseInt( $(".linedwrap").css("padding-left") ) + parseInt( $(".linedwrap").css("padding-right") );
	var originalTextAreaWidth = $("#form").width() - sidebarWidth - paddingHorizontal - 20
    $("#code").width(`${originalTextAreaWidth}px`)
    $(".linedwrap").width(`${$("#form").width() - paddingHorizontal}px`)

	// resize animations
	var index = parseInt($(".index").text())
	goToIndex(animation, 0, index)

}, true);


// button enter submits read form
$(function(){	
	$("#input").keypress(function(e){
		if(e.keyCode == 13)
			e.currentTarget.closest('form').submit()
		});
});


// clickable code words
var stopCharacters = [' ', '\n', '\r', '\t']
$(function(){	
	$("#code").on('click', function() {
		var text = $(this).val();
		var start = $(this)[0].selectionStart;
		var end = $(this)[0].selectionEnd;
		while (start >= 0) {
			if (stopCharacters.indexOf(text[start]) == -1) {
				--start;
			} else {
				break;
			}                        
		};
		++start;
		while (end < text.length) {
			if (stopCharacters.indexOf(text[end]) == -1) {
				++end;
			} else {
				break;
			}
		}
		var currentWord = text.substr(start, end - start);

		// if clicked on instruction, display explanation
		if ( currentWord.toUpperCase() in instructions){
			var description = instructions[currentWord.toUpperCase()]
			var info = description.split(' ::')
			if (info.length > 1) $('#explanation').html(`
				<div style="margin-right:25px">
					<b class="w3-text-blue-grey">${currentWord} ${info[0]}:</b> ${info[1]}
				</div>
				<b class="w3-text-blue-grey w3-display-topright" style="margin-right:8px; cursor:pointer" onclick="close_explanation()">x</b>
			`)
			else $('#explanation').html(`
				<div style="margin-right:25px">
					<b class="w3-text-blue-grey">${currentWord}:</b> ${description}
				</div>
				<b class="w3-text-blue-grey w3-display-topright" style="margin-right:8px; cursor:pointer" onclick="close_explanation()">x</b>
			`)
		}
		
	});
});


//x button - close explanation window
function close_explanation(){
	$('#explanation').empty()
}


// button save
function download_file(){
	var textcontent = document.getElementById("code").value;
	var downloadableLink = document.createElement('a');
	downloadableLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(textcontent));
	downloadableLink.download = "myFile" + ".vm";
	document.body.appendChild(downloadableLink);
	downloadableLink.click();
	document.body.removeChild(downloadableLink);
}


function open_manual(){
	window.open('/manual');
}

// ---------------------------- ANIMATION ------------------------

function scrollToLine(line){
	var offsetHeight = document.getElementById('line1').offsetHeight;
	document.getElementById(`code`).scrollTop = 0;
	document.getElementById(`code`).scrollTop += (offsetHeight * line) + 5;
}

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

		scrollToLine(new_line-1)
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
		$(`<div id="square" class="square" style="position:relative; border-color:white; border-image: linear-gradient(to right, blue 50%, green 50% ) 3; background-color:transparent; top:${translate}px; min-width:100%; height:${offsetHeight}px"></div>`).appendTo('#operand_stack');
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
				border_bottom = `border-image: linear-gradient(to right ${colors_string} ) 3;`
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



