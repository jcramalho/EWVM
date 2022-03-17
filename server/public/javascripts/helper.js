
$(document).ready(function() {
	$(".lined").linedtextarea(
	  {selectedLine: 3}
	);
 });

$(function(){
	$("#input").keypress(function(e){
		if(e.keyCode == 13)
			e.currentTarget.closest('form').submit()
		});
});