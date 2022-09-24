let sketch = function (s) {
    let div = window.document.getElementsByClassName('sketchContainer')[0];
    let canvas;
    const colorPalette = [
        [219, 125, 125], // red
        [216, 155, 153], // pink
        [41, 84, 68], // dark green
        [7, 97, 145], // dark bule
        [81, 139, 174], // light bule
        [229, 185, 88], // yellow 1
        [198, 171, 121], // yellow 2
    ];

    class Pen {
        constructor(color, stokeSize, mesh) {
            this.mesh = mesh;
            this.color = color;
            let start = mesh.randomStartPoint();
            this.currentPointIdx = [start[0],start[1]];
            this.mesh.fix(this.currentPointIdx);
            this.position = mesh.points[this.currentPointIdx[0]][this.currentPointIdx[1]].location.copy();
            let direHeading = start[2];

            this.direction;
            switch (direHeading) {
                case 0:
                    this.direction = s.createVector(1, 0);
                    break;
                case 90:
                    this.direction = s.createVector(0, 1);
                    break;
                case 180:
                    this.direction = s.createVector(-1, 0);
                    break;
                case 270:
                    this.direction = s.createVector(0, -1);
                    break;
                default:
                    break;
            }
            this.targetPointIdx = [NaN, NaN];
            this._changeTarget();

            this.stokeSize = stokeSize;
            this.nextTurn = Math.floor(s.random(1, 6));
            this.innerPerlinCounter1 = s.random(new Date().getTime()) / 1000000;
            this.innerPerlinCounter2 = s.random(new Date().getTime()) / 1000000;
            this.innerPerlinCounter3 = s.random(new Date().getTime()) / 1000000;
            this.innerPerlinCounter4 = s.random(new Date().getTime()) / 1000000;

            this.life = Math.floor(s.random(4));
        }

        _debugDraw() {
            s.push();
            s.fill(255, 0, 0);
            s.ellipse(this.position.x, this.position.y, 5);
            s.pop();
        }

        _changeTarget() {
            switch (this.direction.heading()) {
                case 0:
                    this.targetPointIdx[0] = this.currentPointIdx[0] + 1;
                    this.targetPointIdx[1] = this.currentPointIdx[1];
                    break;
                case 90:
                    this.targetPointIdx[0] = this.currentPointIdx[0];
                    this.targetPointIdx[1] = this.currentPointIdx[1] + 1;
                    break;
                case 180:
                    this.targetPointIdx[0] = this.currentPointIdx[0] - 1;
                    this.targetPointIdx[1] = this.currentPointIdx[1];
                    break;
                default:
                    this.targetPointIdx[0] = this.currentPointIdx[0];
                    this.targetPointIdx[1] = this.currentPointIdx[1] - 1;
                    break;
            }

            if (s.abs(this.targetPointIdx[0] - this.currentPointIdx[0]) + s.abs(this.targetPointIdx[1] - this.currentPointIdx[1]) > 1) this.life = 0;
        }

        _drawStep(size, transparent, position) {
            s.fill(...this.color, transparent);
            s.noStroke();
            s.ellipse(position.x, position.y, size);
            s.fill(...this.color, transparent * 2)
            s.ellipse(position.x, position.y, size / 3);
            s.fill(...this.color, transparent * 0.5)
            s.ellipse(position.x, position.y, size*1.5);
        }

        _turn() {
            this.direction.rotate(s.random([-90, 90]));
        }

        go() {
            let dire = this.direction.copy();
            // pen find target
            let targetPoint = this.mesh.points[this.targetPointIdx[0]][this.targetPointIdx[1]];
            dire.rotate((s.noise(this.innerPerlinCounter1) - 0.5) * 10); // To adjust
            if (s.dist(this.position.x, this.position.y, targetPoint.location.x, targetPoint.location.y) < targetPoint.radiusB) {
                let attr = s.createVector(targetPoint.location.x - this.position.x, targetPoint.location.y - this.position.y);
                let deg = (attr.heading() - dire.heading()) * s.map(s.dist(this.position.x, this.position.y, targetPoint.location.x, targetPoint.location.y), mesh.gridSize / 2, 0, 0.5, 1);
                dire.rotate(deg);
            }

            // close enough
            if (s.dist(this.position.x, this.position.y, targetPoint.location.x, targetPoint.location.y) < targetPoint.radiusA) {
                if (targetPoint.fixed) {
                    // die
                    if (s.dist(this.position.x, this.position.y, targetPoint.location.x, targetPoint.location.y) <= 5) {
                        this.life = 0;
                        return;
                    }
                } else {
                    // fix target, change target
                    this.mesh.fixTo(this.targetPointIdx, this.position, this.direction.heading());
                    this.currentPointIdx[0] = this.targetPointIdx[0];
                    this.currentPointIdx[1] = this.targetPointIdx[1];
                    if (this.currentPointIdx[0] === 0 || this.currentPointIdx[0] === this.mesh.points.length - 1 || this.currentPointIdx[1] === 0 || this.currentPointIdx[1] === this.mesh.points[0].length - 1) {
                        this.life = 0;
                        return;
                    }
                    this.nextTurn--;
                    if (this.nextTurn <= 0) {
                        this._turn();
                        this.life--;
                        this.nextTurn = Math.floor(s.random(1, 6));
                    }
                    this._changeTarget();
                }
            }

            //over
            let dh = s.abs(this.direction.heading() % 360);

            if (s.abs(dh - 0) < 1) {
                if (this.position.x - targetPoint.location.x > 5) {
                    this.life = 0;
                    return;
                }
            } else if (s.abs(dh - 90) < 1) {
                if (this.position.y - targetPoint.location.y > 5) {
                    this.life = 0;
                    return;
                }
            } else if (s.abs(dh - 180) < 1) {
                if (targetPoint.location.x - this.position.x > 5) {
                    this.life = 0;
                    return;
                }
            } else if (s.abs(dh - 270) < 1) {
                if (targetPoint.location.y - this.position.y > 5) {
                    this.life = 0;
                    return;
                }
            }

            //final
            if (this.position.x < -2 * gridSize || this.position.y < -2 * gridSize || this.position.x > s.width + 2 * gridSize || this.position.y > s.height + 2 * gridSize) this.life = 0;
            if (s.dist(s.dist(this.position.x, this.position.y, targetPoint.location.x, targetPoint.location.y)) > 2 * this.mesh.gridSize) this.life = 0;

            this.position.add(dire.mult(this.stokeSize / 2));

            this._drawStep(this.stokeSize * (0.9 + s.noise(this.innerPerlinCounter4) * 0.2), 75 + 180 * (s.noise(this.innerPerlinCounter2) - 0.5), this.position);

            this.innerPerlinCounter2 += 0.5;
            this.innerPerlinCounter1 += 0.001 + 0.029 * (s.noise(this.innerPerlinCounter3));
            this.innerPerlinCounter3 += 0.03;
            this.innerPerlinCounter4 += 0.03;
        }
    }

    class Mesh {
        constructor(gridSize) {
            this.gridSize = gridSize;
            this.points = this._initDisplace();
            this.resetRandomCache();
            // [[col],[col],[col],...]
        }

        randomStartPoint() {
            let resultIdxInAva = Math.floor(s.random(this.avaliables.length));
            let result = this.avaliables[resultIdxInAva];
            this.avaliables.splice(resultIdxInAva, 1);
            let resultArr = result.split("|");
            let col = parseInt(resultArr[0]);
            let point = parseInt(resultArr[1]);
            let direction = parseInt(resultArr[2]);
            return [col, point, direction];
        }

        resetRandomCache() {
            this.avaliables = [];
            this.points.forEach((e, i) => { 
                e.forEach((ee, j) => { 
                    if (i > 0 && j > 0 && i < this.points.length - 1 && j < this.points[0].length - 1) {
                        this.avaliables.push(...[i + "|" + j + "|0", i + "|" + j + "|90", i + "|" + j + "|180", i + "|" + j + "|270"]);
                    } else {
                    }
                })
            })
        }

        fix(point) {
            if (point instanceof MeshPoint) {
                point.fixed = true;
            } else if (Array.isArray(point)) {
                let p = this.points[point[0]][point[1]];
                p.fixed = true;
            }
        }

        fixTo(idx, pos, from) {
            let h = parseInt((from + 180) % 360);
            let p = this.points[idx[0]][idx[1]];
            p.fixedTo(pos);
            let hash = idx[0] + "|" + idx[1] + "|" + h;
            let hashidx = this.avaliables.indexOf(hash);
            if (hashidx > -1) this.avaliables.splice(hashidx, 1);
        }

        _initDisplace() {
            let points = [];
            let factor = s.random(0.003, 0.01);
            let noiseSectionGap = 14400;
            for (let x = -1.5 * this.gridSize; x < 1600 + 1.5 * this.gridSize; x += this.gridSize) {
                let col = []
                for (let y = -1.5 * this.gridSize; y < 1000 + 1.5 * this.gridSize; y += this.gridSize) {
                    let displacedX = x + (s.noise(x * factor) - 0.5) * this.gridSize;
                    let displacedY = y + (s.noise(y * factor + noiseSectionGap) - 0.5) * this.gridSize;
                    col.push(new MeshPoint(s.createVector(displacedX, displacedY), this.gridSize));
                }
                points.push(col);
            }
            return points;
        }

        _debugDraw() {
            s.push();
            s.stroke(0, 100);
            s.strokeWeight(1);
            for (let i = 0; i < this.points.length; i++) {
                const col = this.points[i];
                for (let j = 0; j < col.length; j++) {
                    const point = col[j];
                    point._debugDraw();
                    if (j > 0) s.line(point.location.x, point.location.y, col[j - 1].location.x, col[j - 1].location.y);
                    if (i > 0) {
                        s.line(point.location.x, point.location.y, this.points[i - 1][j].location.x, this.points[i - 1][j].location.y);
                    }
                }
            }
            s.pop();
        }
    }

    class MeshPoint {
        constructor(location, gridSize) {
            this.location = location;
            this.radiusA = gridSize * s.random(0.1, 0.2);
            this.radiusB = gridSize * s.random(0.2, 0.4);
            this.fixed = false;
        }

        _debugDraw() {
            s.push();
            s.strokeWeight(5);
            s.stroke(0, 100);
            s.point(this.location.x, this.location.y);
            s.pop();
        }

        fixedTo(location) {
            this.location.x = location.x;
            this.location.y = location.y;
            this.fixed = true;
        }
    }

    const numOfPen = 100;
    let pens = new Array(numOfPen);
    const gridSize = 50;
    let mesh = new Mesh(gridSize);
    let animationFinished = false;
    s.setup = function () {
        canvas = s.createCanvas(1600, 1000);
        s.background(222, 217, 214);
        s.frameRate(30);
        Utils.applyScalling(div, canvas.canvas);
        s.angleMode(s.DEGREES);
        for (let i = 0; i < pens.length; i++) {
            let c = s.random(colorPalette);
            let stokeSize = s.random(2, 4);
            pens[i] = new Pen(c, stokeSize, mesh);
            //pens[i]._debugDraw();
        }
    }

    s.draw = function () {
        //s.background(222, 217, 214);
        let movedcount = 0;
        for (let i = 0; i < pens.length; i++) {
            const pen = pens[i];
            if (pen.life <= 0) {

                if (mesh.avaliables.length < numOfPen * 4) {
                    pens.splice(i, 1);
                    i--;
                    continue;
                } else {
                    let c = s.random(colorPalette);
                    let stokeSize = s.random(2, 4);
                    pens[i] = new Pen(c, stokeSize, mesh);
                }
            }
            pen.go();
            movedcount++;
        }
        console.log(movedcount);
        if (movedcount < 1) {
            animationFinished = true;
            s.noLoop();
        }
        //mesh._debugDraw();
    }

    s.windowResized = function () {
        Utils.applyScalling(div, canvas.canvas);
        //s.background(222, 217, 214);
    }

    s.mouseClicked = function () {
        if (animationFinished && s.mouseX > 0 && s.mouseX < s.width && s.mouseY > 0 && s.mouseY < s.height) {
            s.background(222, 217, 214);
            s.resetAnimation();
            console.log("c");
        }
    }

    s.resetAnimation = function () {
        mesh = new Mesh(gridSize);
        pens = new Array(numOfPen);
        for (let i = 0; i < pens.length; i++) {
            let c = s.random(colorPalette);
            let stokeSize = s.random(2, 4);
            pens[i] = new Pen(c, stokeSize, mesh);
            //pens[i]._debugDraw();
        }
        animationFinished = false;
        s.loop();
    }
}