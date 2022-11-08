let sketch = function (s) { 
    let div = window.document.getElementsByClassName('sketchContainer')[0];
    let canvas;

    class Knot{
        constructor(location) {
            this.x = location.x;
            this.y = location.y;
            this.size = s.random(15, 20);
        }

        draw() {
            
        }
    }

    class Stroke{
        constructor(from, to) {
            this.knotA = from;
            this.knotB = to;
        }
    }

    class Figure{
        constructor(location) {
            this.cx = location.x;
            this.cy = location.y;
        }
    }

    let background;
    s.setup = function () {
        canvas = s.createCanvas(1600, 1000);
        background = genbackground();
        s.background(background);
        s.frameRate(30);
        Utils.applyScalling(div, canvas.canvas);
    }

    s.draw = function () {
    }

    s.windowResized = function () {
        Utils.applyScalling(div, canvas.canvas);
    }
    
    genbackground = function(){
        let bg = s.createImage(s.width, s.height);
        let cbase = [212, 203, 192, 255];
        for (let x = 0; x < bg.width; x++) {
            for (let y = 0; y < bg.height; y++) {
                if (Math.random() > 0.7) {
                    let c = [cbase[0] + Math.floor(s.random(-5, 5)), cbase[1] + Math.floor(s.random(-5, 5)), cbase[2] + Math.floor(s.random(-5, 5)), cbase[3]];
                    bg.set(x, y, c)
                } else {
                    bg.set(x, y, cbase);
                }
            }
        }
        bg.updatePixels();
        return bg;
    }
}