let sketch = function (s) { 
    let div = window.document.getElementsByClassName('sketchContainer')[0];

    s.setup = function () {
        s.createCanvas(Utils.elementWidth(div), (Utils.elementWidth(div)/16) * 10);
        s.background(0);
    }

    s.draw = function () {
        
    }

    s.windowResized = function () {
        s.resizeCanvas(Utils.elementWidth(div), (Utils.elementWidth(div)/16) * 10);
        s.background(0);
    }
    
}