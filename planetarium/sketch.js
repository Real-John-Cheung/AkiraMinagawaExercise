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
        //s.background(0);
    }

    s.windowResized = function () {
        Utils.applyScalling(div, canvas.canvas);
    }

    genBackground = function () {
        let bg = s.createImage(s.width, s.height);
        const d = [170, 162, 138], l = [202, 193, 167];
        let noisep = Math.random() * 14400;
        for (let x = 0; x < bg.width; x++) {
            for (let y = 0; y < bg.height; y++) {
                const c = [];
                bg.set(x, y, c);
            }
        }
        bg.updatePixels();
        return bg
    }
    
}