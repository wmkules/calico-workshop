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
var timing_bf = document.getElementById("Timing_b_f");


function rbg() {
	UART.write(`rbgLed(${green.value},${red.value},${blue.value});\n`);
	console.log(red.value, " ", green.value, " ", blue.value);
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

function back_n_forward(v){
	UART.write(`back_n_forward(${v});\n`);
	console.log(v);
}


// function for the color picker
function color_picker () {

	// create canvas and context objects
	var canvas = document.getElementById('picker');
	var ctx = canvas.getContext('2d');

	// setting these directly because the window doest scale, but once
	// you add scaling you can set these to dynamically change
	image_width  = 300;
	image_height = 300;

	var image = new Image();
	image.onload = function () {
		ctx.drawImage(image, 0, 0, image_width, image_height); // draw the image on the canvas
	}

	var imageSrc = 'images/colorwheel1.png';
	image.src = imageSrc;


	$('#picker').click(function(e) { // mouse move handler
		// get coordinates of current position
		var canvasOffset = $(canvas).offset();
		var canvasX = Math.floor(e.pageX - canvasOffset.left);
		var canvasY = Math.floor(e.pageY - canvasOffset.top);

		// get current pixel
		var imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
		var pixel = imageData.data;

		// update controls
		$('#rgbVal').val(pixel[0]+','+pixel[1]+','+pixel[2]);

		// send color to calico
		// 1 0 2 because the pixel element is RGB and the UART uses GRB
		UART.write(`rbgLed(${pixel[1]},${pixel[0]},${pixel[2]});\n`);
	});
}

color_picker();

function swapColorPickingOptions() {
	// grab all required elements
	bars = document.getElementsByName("colorpickerbars");
	wheel = document.getElementById("colorpickerwheel");
	button = document.getElementById("colorOptionsButton");

	// if they want to go to the color wheel do that, otherwise go the other way
	if(button.innerText == "color wheel") {
		bars.forEach(item => item.style.display = "none");
		wheel.style.display = "revert";
		button.innerText = "color bars";
	} else {
		bars.forEach(item => item.style.display = "revert");
		wheel.style.display = "none";
		button.innerText = "color wheel";
	}
}