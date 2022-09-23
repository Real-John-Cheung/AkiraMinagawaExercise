let sketch = function (s) { 
    let div = window.document.getElementsByClassName('sketchContainer')[0];
    let canvas;

    s.setup = function () {
        canvas = s.createCanvas(1600, 1000);
        s.background(0);
        s.frameRate(30);
        Utils.applyScalling(div, canvas.canvas);
    }

    s.draw = function () {
    }

    s.windowResized = function () {
        Utils.applyScalling(div, canvas.canvas);
        s.background(0);
    }
    
}