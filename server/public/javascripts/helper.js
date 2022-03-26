
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
	}
}

function goBack(animation){
	var index = parseInt($(".index").text())

	if (index > 0){
		$(`.line${animation[index-1][0]}`).css('color', "#AAAAAA")
		$(".index").html(index - 1)
	}
	if (index > 1)
		$(`.line${animation[index-2][0]}`).css('color', 'red')
}

function goLast(animation){
	var index = parseInt($(".index").text())

	if(index > 0) $(`.line${animation[index-1][0]}`).css('color', "#AAAAAA")
	$(`.line${animation[animation.length-1][0]}`).css('color', 'red')
	$(".index").html(animation.length)
}

function goFirst(animation){
	var index = parseInt($(".index").text())

	if(index > 0) $(`.line${animation[index-1][0]}`).css('color', "#AAAAAA")
	$(".index").html(0)
}

