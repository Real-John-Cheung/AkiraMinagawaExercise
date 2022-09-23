let sketch = function (s) { 
    let div = window.document.getElementsByClassName('sketchContainer')[0];
    let canvas;
    const colorPalette = [
        [218, 128, 126], // red
        [221, 183, 177], // pink
        [57, 90, 70], // dark green
        [7, 97, 145], // dark bule
        [81, 139, 179], // light bule
        [229, 185, 88], // yellow 1
        [198, 171, 121], // yellow 2
    ];

    class Pen{
        constructor(color, startingPoint) {
            this.color = color;
            this.x = startingPoint.x;
            this.y = startingPoint.y;
        }
    }

    s.setup = function () {
        canvas = s.createCanvas(1600, 1000);
        s.background(217, 212, 209);
        s.frameRate(30);
        Utils.applyScalling(div, canvas.canvas);
    }

    s.draw = function () {
        s.background(217, 212, 209);
    }

    s.windowResized = function () {
        Utils.applyScalling(div, canvas.canvas);
        s.background(217, 212, 209);
    }
    
}