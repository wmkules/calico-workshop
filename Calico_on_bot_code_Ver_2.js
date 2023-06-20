var notify_interval;
var bf_interval;
var bf_interval_status = false;
var fade_rise_interval;
var fade_down_interval;
var fade_rise_status = false;
var fade_down_status = false;
var rbgAuto;
var rbgAuto_Status = false;
var rbgFade_Status = false;
var in_function_led_timeout_1;
var in_function_led_timeout_2;
var in_function_led_timeout_3;
var in_function_led_timeout_4;


function mf() {
    stop_b_f();
    digitalWrite(D22, 1);
    digitalWrite(D25, 0);
    digitalWrite(D19, 1);
    digitalWrite(D17, 0);
}


function mb() {
    stop_b_f();
    D22.write(0);
    D25.write(1);
    D19.write(0);
    D17.write(1);
}


function locoStop() {
    stop_b_f();
    D22.write(0);
    D25.write(0);
    D19.write(0);
    D17.write(0);
}


function moveForward(a) {
    setTimeout(function () {
        D22.write(0);
        D25.write(0);
        D19.write(0);
        D17.write(0);
    }, a);
    D22.write(1);
    D25.write(0);
    D19.write(1);
    D17.write(0);
}


function moveBackward(a) {
    setTimeout(function () {
        D22.write(0);
        D25.write(0);
        D19.write(0);
        D17.write(0);
    }, a);
    D22.write(0);
    D25.write(1);
    D19.write(0);
    D17.write(1);
}

function notification(a) {
    notify_interval = setInterval(function () {
        moveForward(30);
        setTimeout('moveBackward(30);', 40);
    }, 100);
    setTimeout('clearInterval(notify_interval); locoStop();', a);
}


function back_n_forward(a) {
    stop_b_f();
    bf_interval_status = true;
    var period = 2 * a + 250;
    bf_interval = setInterval(function (a) {
        in_function_led_timeout_3 = setTimeout(function (a) {
            moveBackward(a);
        }, a + 125, a);
        moveForward(a);
    }, period, a);
    in_function_led_timeout_4 = setTimeout(function (a) {
        moveBackward(a);
    }, a + 125, a);
    moveBackward(a + 125);
}

function stop_b_f() {
    if (bf_interval_status == true) {
        clearInterval(bf_interval);
        if (typeof in_function_led_timeout_3 !== 'undefined') {
            clearTimeout(in_function_led_timeout_3);
        }
        if (typeof in_function_led_timeout_4 !== 'undefined') {
            clearTimeout(in_function_led_timeout_4);
        }
        bf_interval_status = false;
        D22.write(0);
        D25.write(0);
        D19.write(0);
        D17.write(0);
        for (let i = 0; i < 50; i++) {
            console.log('b_f_waiting-' + i);
        }
    }
}

function rbgLed(x, y, z) {
    stopPreviousLED();
    let led_data = [x, y, z, x, y, z, x, y, z];
    require("neopixel").write(5, led_data);
}


function rbgOff() {
    stopPreviousLED();
    require("neopixel").write(5, [0, 0, 0, 0, 0, 0, 0, 0, 0]);
    for (let i = 0; i < 100; i++) {
        console.log('waiting-' + i);
    }
}


function rgbAutoChanging_slow() {
    rbgOff();
    rbgAuto_Status = true;
    rbgAuto = setInterval(function () {
        require("neopixel").write(5, [255, 0, 0, 255, 0, 0, 255, 0, 0]);
        in_function_led_timeout_1 = setTimeout('require("neopixel").write(5, [0, 255, 0, 0, 255, 0, 0, 255, 0]);', 1000);
        in_function_led_timeout_2 = setTimeout('require("neopixel").write(5, [0, 0, 255, 0, 0, 255, 0, 0, 255]);', 2000);
    }, 1500);
    setTimeout('require("neopixel").write(5, [0, 255, 0, 0, 255, 0, 0, 255, 0]);', 500);
    setTimeout('require("neopixel").write(5, [0, 0, 255, 0, 0, 255, 0, 0, 255]);', 1000);
    require("neopixel").write(5, [255, 0, 0, 255, 0, 0, 255, 0, 0]);
}


function rgbAutoChanging_fast() {
    rbgOff();
    rbgAuto_Status = true;
    rbgAuto = setInterval(function () {
        require("neopixel").write(5, [255, 0, 0, 255, 0, 0, 255, 0, 0]);
        in_function_led_timeout_1 = setTimeout('require("neopixel").write(5, [0, 255, 0, 0, 255, 0, 0, 255, 0]);', 100);
        in_function_led_timeout_2 = setTimeout('require("neopixel").write(5, [0, 0, 255, 0, 0, 255, 0, 0, 255]);', 200);
    }, 300);
    setTimeout('require("neopixel").write(5, [0, 255, 0, 0, 255, 0, 0, 255, 0]);', 100);
    setTimeout('require("neopixel").write(5, [0, 0, 255, 0, 0, 255, 0, 0, 255]);', 200);
    require("neopixel").write(5, [255, 0, 0, 255, 0, 0, 255, 0, 0]);
}



var a = 0;
var b = 0;
var c = 0;
var led_data = [0, 0, 0];


function rgbFading(x, y, z) {
    rbgOff();
    rbgFade_Status = true;
    led_data = [x, y, z];
    fade_rise();
}


function fade_rise() {
    fade_rise_interval = setInterval(function () {
        fade_rise_status = true;
        a = a + 5;
        b = b + 5;
        c = c + 5;
        if (a >= led_data[0]) {
            a = led_data[0];
        }
        if (b >= led_data[1]) {
            b = led_data[1];
        }
        if (c >= led_data[2]) {
            c = led_data[2];
        }
        //console.log([a, b, c]);
        require("neopixel").write(5, [a, b, c, a, b, c, a, b, c]);
        if (a >= led_data[0] && b >= led_data[1] && c >= led_data[2]) {
            in_function_led_timeout_1 = setTimeout(function () {
                fade_down();
            }, 750);
            clearInterval(fade_rise_interval);
            require("neopixel").write(5, [a, b, c, a, b, c, a, b, c]);
            fade_rise_status = false;
        }
    }, 150);
}


function fade_down() {
    fade_down_interval = setInterval(function () {
        fade_down_status = true;
        a = a - 5;
        b = b - 5;
        c = c - 5;
        if (a < 0) {
            a = 0;
        }
        if (b < 0) {
            b = 0;
        }
        if (c < 0) {
            c = 0;
        }
        //console.log([a, b, c]);
        require("neopixel").write(5, [a, b, c, a, b, c, a, b, c]);
        if (a <= 0 && b <= 0 && c <= 0) {
            in_function_led_timeout_2 = setTimeout(function () {
                fade_rise();
            }, 750);
            clearInterval(fade_down_interval);
            require("neopixel").write(5, [a, b, c, a, b, c, a, b, c]);
            fade_down_status = false;
        }
    }, 150);
}

function stopFading() {
    rbgFade_Status = false;
    if (fade_rise_status == true) {
        fade_rise_status = false;
        clearInterval(fade_rise_interval);
    }
    if (fade_down_status == true) {
        fade_down_status = false;
        clearInterval(fade_down_interval);
    }
    clearTimeout(in_function_led_timeout_1);
    clearTimeout(in_function_led_timeout_2);
}


function stopPreviousLED() {
    if (rbgAuto_Status == true) {
        rbgAuto_Status = false;
        clearTimeout(in_function_led_timeout_1);
        clearTimeout(in_function_led_timeout_2);
        clearInterval(rbgAuto);
    }
    if (rbgFade_Status == true) {
        stopFading();
    }
}