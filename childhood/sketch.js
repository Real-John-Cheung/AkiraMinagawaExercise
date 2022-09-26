let sketch = function (s) { 
    let div = window.document.getElementsByClassName('sketchContainer')[0];
    let canvas;
    const Delaunay = d3.Delaunay;
    const bgc = [];

    s.setup = function () {
        canvas = s.createCanvas(1600, 1000);
        s.background(0);
        s.frameRate(30);
        Utils.applyScalling(div, canvas.canvas);
    }

    s.draw = function () {
        s.background(0);
    }

    s.windowResized = function () {
        Utils.applyScalling(div, canvas.canvas);
        s.background(217, 212, 209);
    }
    
}