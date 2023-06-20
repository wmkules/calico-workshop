var speedx;

function formChanged()
{
window.speedx = document.getElementsByName("speed")[0].value;
console.log(speedx);
}

var red = document.getElementById("Red");
var green = document.getElementById("Green");
var blue = document.getElementById("Blue");
var timing_buggy = document.getElementById("Timing_buggy");
// var timing_bf = document.getElementById("Timing_b_f");
var timing_bf = 50;


function rbg() {
	UART.write(`rbgLed(${green.value},${red.value},${blue.value});\n`);
	console.log(red.value);
	console.log(green.value);
	console.log(blue.value);
}


function rbgFading() {
	UART.write(`rgbFading(${green.value/5},${red.value/5},${blue.value/5});\n`);
	console.log(red.value);
	console.log(green.value);
	console.log(blue.value);
}


function notify(){
	UART.write(`notification(${timing_buggy.value});\n`);
	console.log(timing_buggy.value);
}


function back_n_forward(){
	UART.write(`back_n_forward(${timing_bf.value});\n`);
	console.log(timing_bf.value);
}
