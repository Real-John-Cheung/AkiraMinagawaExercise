let sketch = function (s) {
    let div = window.document.getElementsByClassName('sketchContainer')[0];
    let canvas;
    const Delaunay = d3.Delaunay;
    let background;
    let timeForPerlin1 = 100;

    class PointSet {
        constructor(numOfPoints, minDistance) {
            this.numOfPoints = numOfPoints;
            this.points = this._initPoints(numOfPoints, minDistance);
        }

        _debugDraw() {
            s.push();
            s.strokeWeight(5);
            s.stroke(255, 0, 0);
            this.points.forEach(p => {
                s.point(p[0], p[1]);
            })
            s.pop();
        }

        _debugDrawB(maxD) {
            s.push();
            s.stroke(0);
            let delaunay = Delaunay.from(this.points);
            const { points, halfedges, triangles } = delaunay;
            for (let i = 0, n = halfedges.length; i < n; ++i) {
                const j = halfedges[i];
                if (j < i) continue;
                const ti = triangles[i];
                const tj = triangles[j];
                if (s.dist(points[ti * 2], points[ti * 2 + 1], points[tj * 2], points[tj * 2 + 1]) < maxD)s.line(points[ti * 2], points[ti * 2 + 1], points[tj * 2], points[tj * 2 + 1]);
            }
            s.pop();
        }

        _initPoints = function (numOfPoints, minDistance) {
            const factor = 0.007;
            const contrast = 1.5;
            let tree;
            let set = [], cache = [];
            while (set.length < numOfPoints) {
                let x = Math.floor(s.random(s.width)), y = Math.floor(s.random(s.height));
                while (cache.includes(x + ',' + y)) {
                    x = Math.floor(s.random(s.width));
                    y = Math.floor(s.random(s.height));
                }
                while ((s.noise(x * factor, y * factor) - 0.5) * contrast < s.random(-0.5, 0.5)) {
                    x = Math.floor(s.random(s.width));
                    y = Math.floor(s.random(s.height));
                }

                if (!tree) {
                    tree = new KdTree([x, y], null, 2);
                    set.push([x, y]);
                    cache.push(x + ',' + y);
                } else {
                    let nearest = tree.nearest([x, y], 1)[0];
                    if (nearest[1] >= minDistance * minDistance) {
                        tree.insert([x, y]);
                        set.push([x, y]);
                        cache.push(x + ',' + y);
                    }
                }
            }
            set.push(...[[-100, 0], [0, -100], [s.width + 100, s.height], [s.width, s.height + 100]]);
            return set;
        }

    }

    const numOfPoints = 1500;
    const minDistance = 10;
    let pointSet;
    s.setup = function () {
        canvas = s.createCanvas(1600, 1000);
        background = genBackground();
        s.background(background);
        s.frameRate(30);
        Utils.applyScalling(div, canvas.canvas);

        pointSet = new PointSet(numOfPoints, minDistance);
        pointSet._debugDrawB(100);

    }

    s.draw = function () {
        //s.background(0);
    }

    s.windowResized = function () {
        Utils.applyScalling(div, canvas.canvas);
        s.background(background);
    }

    genBackground = function () {
        let offset = Math.floor(s.random(4));
        let pg = s.createImage(s.width, s.height);
        for (let x = 0; x < pg.width; x++) {
            for (let y = 0; y < pg.height; y++) {
                let base;
                if ((x + offset) % 4 > 0 && ((y + offset) % 4 === 1 || (y + offset) % 4 === 3)) {
                    base = 248;
                } else if ((y + offset) % 4 === 2 && ((x + offset) % 4 === 1 || (x + offset) % 4 === 3)) {
                    base = 248;
                } else if ((x + offset) % 4 === 0 || (y + offset) % 4 === 0) {
                    if (s.random() > 0.3) {
                        base = Math.floor(s.random(144, 206));
                    } else {
                        base = 248;
                    }
                } else {
                    if (s.random() > 0.7) {
                        base = Math.floor(s.random(144, 206));
                    } else {
                        base = 248;
                    }
                }
                let c = [base + Math.floor(s.random(-3, 3)), base + Math.floor(s.random(-3, 3)), base + Math.floor(s.random(-3, 3)), 255];
                pg.set(x, y, c);
            }
        }
        pg.updatePixels();
        return pg;
    }

}