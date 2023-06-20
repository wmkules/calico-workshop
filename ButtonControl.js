var value = 0;
var up = 38;
var down = 40;
var fired = false;

window.onkeydown = function (gfg) {
    if (!fired) {
        fired = true;
        // do something

        if (gfg.keyCode === up) {
            UART.write('mf();\n');
        };
        if (gfg.keyCode === down) {
            UART.write('mb();\n');
        };
    }
};

window.onkeyup = function (gfg) {
    fired = false;
    UART.write('locoStop();\n');
};