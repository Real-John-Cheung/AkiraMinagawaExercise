let sketch = function (s) {
    let div = window.document.getElementsByClassName('sketchContainer')[0];
    let canvas;

    class Root {
        constructor(x, y, direction) {
            this.x = x;
            this.y = y;
            this.direction = direction || Math.random() * 360;
        }
    }

    class Br {
        constructor(from, generation, direction) {
            this.x = 0;
            this.y = 0;
            this.gen = generation || 0;
            this.width = 10 + Math.random() * 10;
            this.step = 5;
            this.end = Math.random() > s.map(this.gen, 0, 5, 1, 0.3, true);
            this.length = s.random(100, 150);
            if (!this.end) this.breachPoint = [];
            if (this.breachPoint !== undefined) {
                let n = Math.floor(s.random(1, 3));
                for (let i = 0; i < n; i++) {
                    this.breachPoint.push(s.random(0.3, 0.9));
                }
                this.breachPoint.sort((a, b) => a - b);
            }
            this.internalNoiseCounter = Math.random() * 144000;
            this.internalNoiseCounter1 = Math.random() * 144000;
            this.internalNoiseCounter2 = Math.random() * 144000;
            this.root = new Root(from.x, from.y, direction);
            this.currentAngle;
            this.done = false;
            this.bd = 1;

            if (this.gen === 0) this.drawEnd();
        }

        draw() {
            const c = [156, 180, 190];
            s.push();
            s.fill(c);
            s.translate(this.root.x, this.root.y);
            s.rotate(this.root.direction);
            s.translate(this.x, this.y);
            this.currentAngle = (s.noise(this.internalNoiseCounter) - 0.5) * 90;
            s.rotate(this.currentAngle);
            s.rect(0, 0, this.step * 2 * (1 + (s.noise(this.internalNoiseCounter2) - 0.5) * 2), this.width * (1 + (s.noise(this.internalNoiseCounter1) - 0.5) * 1));
            s.pop();
        }

        grow() {
            this.x += s.cos(this.currentAngle) * this.step;
            this.y += s.sin(this.currentAngle) * this.step;
            this.internalNoiseCounter += 0.01;
            this.internalNoiseCounter1 += 0.03;
            this.internalNoiseCounter2 += 0.03;
            let lengSq = this.x * this.x + this.y * this.y;
            if (this.breachPoint && this.breachPoint.length > 0) {
                let nextBrL = this.length * this.breachPoint[0];
                if (lengSq > nextBrL * nextBrL) {
                    this.bd *= -1;
                    this.breachPoint.shift();
                    // s.push();
                    // s.fill(0, 250, 0);
                    // s.translate(this.root.x, this.root.y);
                    // s.rotate(this.root.direction);
                    // s.rect(0,0,500,5)
                    // s.ellipse(this.x,this.y,20)
                    // s.pop();
                    let x1 = this.x, a = this.root.direction, y1 = this.y;
                    // s.push();
                    // s.fill(0, 0, 255);
                    // s.translate(this.root.x, this.root.y);
                    // s.ellipse(x1 * s.cos(a) - y1 * s.sin(a), x1 * s.sin(a) + y1 * s.cos(a), 20)
                    // s.pop();
                    return new Br({ x: this.root.x + x1 * s.cos(a) - y1 * s.sin(a), y: this.root.y + x1 * s.sin(a) + y1 * s.cos(a) }, this.gen + 1, this.root.direction + (this.currentAngle + 90 * this.bd));
                }
            }
            if (lengSq > this.length * this.length) {
                this.drawEnd();
                this.done = true;
            }
        }

        drawEnd() {
            const col = [156, 180, 190];
            let ballsize = Math.min(s.random(50, 70), this.width * s.random(3, 5));
            let cx = this.x + (ballsize * 0.5) * s.cos(this.currentAngle);
            let cy = this.y + (ballsize * 0.5) * s.sin(this.currentAngle);
            const ballnum = Math.floor(s.random(5, 7));
            let p = 360 / ballnum;
            let c = Math.random() * 360;
            s.push();
            s.fill(col);
            s.translate(this.root.x, this.root.y);
            s.rotate(this.root.direction);
            s.translate(cx, cy);
            s.rotate(this.currentAngle);
            for (let i = 0; i < ballnum; i++) {
                s.ellipse(s.cos(c) * ballsize * 0.1, s.sin(c) * ballsize * 0.1, ballsize);
                c += Math.floor(p + s.random(-10, 10));
            }
            s.pop();
            if (Math.random() > 0.8) this.drawF();
        }

        drawF() {
            const c1 = [118, 7, 0];
            const c2 = [40, 31, 24];
            let cx = this.x + 60 * s.cos(this.currentAngle);
            let cy = this.y + 60 * s.sin(this.currentAngle);
            const n = Math.floor(s.random(3, 5));
            let gap = 15;
            let c = - (n * gap) / 2;
            s.push();
            s.translate(this.root.x, this.root.y);
            s.rotate(this.root.direction);
            for (let i = 0; i < n; i++) {
                let x = cx + Math.random() * 2 + 3;
                let y = cy + c;
                s.push();
                s.translate(x, y);
                s.rotate((i - n) * 5);
                s.fill(c2);
                s.rect(0, 0, s.random(15, 20), s.random(3, 5));
                s.fill(c1);
                s.ellipse(15, 0, s.random(3, 5));
                s.pop();
                c += gap + Math.random() - 0.5;
            }
            s.pop();
        }

    }

    let background;
    const lf = 2000;
    let ti, gw;
    const initNumOfBranch = 10;
    let branches = [], rps = [];
    s.setup = function () {
        canvas = s.createCanvas(1600, 1000);
        background = genBackground();
        s.background(background);
        s.frameRate(12);
        s.blendMode(s.BURN);
        s.rectMode(s.CENTER);
        s.angleMode(s.DEGREES);
        s.noStroke();
        Utils.applyScalling(div, canvas.canvas);
        rps = _initPointsWithPoissonDisc(initNumOfBranch, 350);
        for (let i = 0; i < rps.length; i++) {
            branches.push(new Br(rps[i]));
        }
        ti = s.millis();
        gw = true;
    }

    s.draw = function () {
        for (let i = 0; i < branches.length; i++) {
            branches[i].draw();
            if (branches[i].done) {
                branches.splice(i, 1);
                i--;
                continue;
            }
            let nb = branches[i].grow();
            if (nb) branches.splice(i, 0, nb);
        }
        if (gw && !branches.length) {
            gw = false;
            ti = s.millis();
        }
        if (!gw && s.millis() - ti > lf) {
            s.blendMode(s.NORMAL)
            s.background(255,255,255,255)
            s.background(background);
            s.blendMode(s.BURN)
            rps = _initPointsWithPoissonDisc(initNumOfBranch, 350);
            for (let i = 0; i < rps.length; i++) {
                branches.push(new Br(rps[i]));
            }
            gw = true;
        }
        //s.noLoop();
    }

    s.windowResized = function () {
        Utils.applyScalling(div, canvas.canvas);
    }

    genBackground = function () {
        let bg = s.createImage(s.width, s.height);
        let offsetX = Math.floor(Math.random() * 4);
        let offsetY = Math.floor(Math.random() * 8) - 4;
        for (let y = 0; y < bg.height; y++) {
            if ((y + offsetY) % 8 === 0) offsetX += Math.floor(Math.random() * 2) - 1;
            for (let x = 0; x < bg.width; x++) {
                let ux = (x + offsetX) % 8;
                let uy = (y + offsetY) % 8;
                if (ux < 0) ux += 8;
                if (uy < 0) uy += 8;
                let cBase;
                if ((ux === 6 || ux === 7) || ((ux === 2 || ux === 3) && (uy === 2 || uy === 3 || uy === 6 || uy === 7))) {
                    cBase = [207, 201, 189];
                } else {
                    cBase = [236, 230, 218];
                }
                let coff = Math.floor(Math.random() * 100) - 50;
                let alpha = s.random(0.6, 1);
                let c = [(cBase[0] + coff) * alpha + (1 - alpha) * 255, (cBase[1] + coff) * alpha + (1 - alpha) * 255, (cBase[2] + coff) * alpha + (1 - alpha) * 255, 255];
                bg.set(x, y, c);
            }
        }
        bg.updatePixels();
        return bg;
    }

    // s.mouseClicked = function () {
    //     s.loop();
    // }

    _initPointsWithPoissonDisc = function (numOfPoints, minDistance) {
        let r = minDistance;
        const k = 30;
        let grid = [], active = [], res = [], lowDenIdxs = [];
        let w = r / Math.SQRT2
        let numOfCol = Math.floor(s.width / w);
        let numOfRow = Math.floor(s.height / w);
        grid = new Array(numOfCol * numOfRow);

        //init point 
        let firstX = Math.floor(s.random(100, s.width - 100)), firstY = Math.floor(s.random(100, s.height - 100));
        let pos = s.createVector(firstX, firstY);
        grid[Math.floor(firstX / w) + (Math.floor(firstY / w)) * numOfCol] = pos;
        res.push({ x: pos.x, y: pos.y });
        active.push(pos);

        //start
        while (active.length > 0) {
            let idx = Math.floor(s.random(active.length));
            let pos = active[idx];
            let found = false;
            let usingR = r;
            for (let n = 0; n < k; n++) {
                let sample = p5.Vector.random2D();
                let m = s.random(usingR, 2 * usingR);
                sample.setMag(m);
                sample.add(pos);
                if (sample.x < 0 || sample.y < 0 || sample.x > s.width || sample.y > s.height) continue;
                let col = Math.floor(sample.x / w);
                let row = Math.floor(sample.y / w);
                if (col > -1 && row > -1 && col < numOfCol && row < numOfCol && !grid[col + row * numOfCol]) {
                    let ok = true;
                    for (let i = -1; i < 2; i++) {
                        for (let j = -1; j < 2; j++) {
                            let index = col + i + (row + j) * numOfCol;
                            let neighbor = grid[index];
                            if (neighbor) {
                                let d = p5.Vector.dist(sample, neighbor);
                                let theirR = r;
                                //let theirR = r;
                                if (d < Math.min(theirR, usingR)) {
                                    ok = false;
                                    break;
                                }
                            }
                        }
                    }
                    if (ok) {
                        //let sqDist = [[0,Number.MAX_SAFE_INTEGER]]


                        res.push({ x: sample.x, y: sample.y });

                        if (res.length > numOfPoints) return res;

                        grid[col + row * numOfCol] = sample;
                        active.push(sample);
                        found = true;
                        break;

                    }
                }
            }
            if (!found) active.splice(idx, 1);
        }
        return res;
    }

}