let sketch = function (s) {
    let div = window.document.getElementsByClassName('sketchContainer')[0];
    let canvas;
    let background, texture;
    const Engine = Matter.Engine,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Common = Matter.Common,
        Composite = Matter.Composite,
        World = Matter.World;
    Common.setDecomp(decomp);
    let engine = Engine.create();
    let world = engine.world;
    let turtle;

    class Turtle {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.size = 10;
            this.memory = [];
            this.internalNoiseCounter = s.random(144000);
            this.internalNoiseGap = s.random(144000);
        }

        setSize(size) {
            this.size = size
        }

        moveTo(x, y) {
            this.x = x;
            this.y = y;
        }

        drawSub(cm, cy, direction, maxLength) {
            //direction: 0: left(upper) 1:right(lower)
            //c should be a p5 canvas or a p5 graphics instance
            const length = maxLength * cm.random(0.8, 1);
            const x0 = this.x;
            const f = 0.005;
            const col = [180, 150, 50];
            const times = 5;

            cy.push();
            cm.push();
            cm.fill(0);
            cm.noStroke();
            cm.angleMode(s.DEGREES);
            cm.translate(this.x, this.y);

            cy.noStroke();
            cy.angleMode(s.DEGREES);
            cy.translate(this.x, this.y);

            //
            cm.rotate(direction ? -45 : 45);
            cy.rotate(direction ? -45 : 45);
            //
            let x = 0, y = 0;
            while (x < length) {
                let size = this.size * (cm.map(cm.noise(this.internalNoiseCounter), 0, 1, 0.8, 1, true));
                cm.ellipse(x, y, size, size);
                x += this.size / 10;
                y = cm.map(cm.noise(this.internalNoiseCounter + this.internalNoiseGap), 0, 1, - this.size / 5, this.size / 5, true);
                this.internalNoiseCounter += f;
            }
            //
            let xx = x, yy = y;
            for (let i = 0; i < times; i++) {
                let uc = [col[0] + Math.floor(cy.random(-5, 5)), col[1] + Math.floor(cy.random(-5, 5)), col[2] + Math.floor(cy.random(-5, 5)), 100];
                cy.fill(uc)
                cy.ellipse(xx, yy, this.size * 0.9);
                xx += cy.random(- this.size / 5, this.size / 5);
                yy += cy.random(- this.size / 5, this.size / 5);
            }
            //
            cy.pop();
            cm.pop();
        }

        drawMid(c, length) {
            const l = length * c.random(0.9, 1.1);
            const x0 = this.x;
            const f = 0.005;
            c.push();
            c.fill(0);
            c.noStroke();
            c.translate(this.bleeding, c.height / 2);
            c.rectMode(c.CENTER);
            while (this.x - x0 < l) {
                let size = this.size * (c.map(c.noise(this.internalNoiseCounter), 0, 1, 0.8, 1, true));
                c.rect(this.x, this.y, size, size);
                this.x += this.size / 10;
                this.internalNoiseCounter += f;
            }
            c.pop();
        }

        remember() {
            this.memory.push([this.x, this.y]);
        }

        return() {
            let last = this.memory.pop();
            this.x = last[0];
            this.y = last[1];
        }

        reset() {
            this.x = 0;
            this.y = 0;
            this.memory = [];
            this.internalNoiseCounter = s.random(144000);
            this.internalNoiseGap = s.random(144000);
        }
    }

    class Branch {
        constructor(x, y) {
            this.rootX = x;
            this.rootY = y;
            this.numOfSubBranch = Math.floor(s.random(5, 8));
            this.bleeding = 5;
            this.rigidBody = undefined;
            this.renderBuffer = undefined;
            this.maskBuffer = undefined;
            this._createBranch(this.numOfSubBranch);
            //this._createBranch(1);
            World.add(world, this.rigidBody);
            //this._debugDraw();
        }

        _debugDraw() {
            s.push();
            s.strokeWeight(10);
            s.stroke(255, 0, 0);
            s.point(this.rootX, this.rootY);
            s.stroke(0, 0, 255);
            s.point(this.rigidBody.position.x, this.rigidBody.position.y);
            s.strokeWeight(2);
            s.stroke(0, 255, 0);
            s.noFill();
            s.beginShape();
            this.rigidBody.vertices.forEach(p => {
                s.vertex(p.x, p.y);
            });
            s.endShape(s.CLOSE);
            s.image(this.maskBuffer, this.rootX - this.bleeding, this.rootY - this.maskBuffer.height / 2);
            s.image(this.renderBuffer, this.rootX - this.bleeding, this.rootY - this.renderBuffer.height / 2);

            s.pop();
        }

        _createBranch(n) {
            const strokeW = 10;
            const sectionLength = 35;
            let rigidBodyPointSet = [];
            let pg1 = s.createGraphics(sectionLength * n + 2 * this.bleeding, sectionLength * 2 + 2 * this.bleeding); //for mask
            let pg2 = s.createGraphics(sectionLength * n + 2 * this.bleeding, sectionLength * 2 + 2 * this.bleeding); //for yf
            turtle.setSize(strokeW);
            turtle.moveTo(this.bleeding, pg1.height / 2);
            for (let i = 0; i < n; i++) {
                // upper
                rigidBodyPointSet.push({ x: i * sectionLength, y: - strokeW / 2 });
                rigidBodyPointSet.push({ x: (i + 1) * sectionLength, y: - sectionLength });
                rigidBodyPointSet.push({ x: (i + 1) * sectionLength, y: - (sectionLength - strokeW) });
                rigidBodyPointSet.push({ x: i * sectionLength + strokeW, y: - strokeW / 2 });
                rigidBodyPointSet.push({ x: (i + 1) * sectionLength, y: - strokeW / 2 });

                //turtle drawing
                turtle.remember();
                turtle.drawSub(pg1, pg2, false, sectionLength);
                turtle.return();
                turtle.remember();
                turtle.drawSub(pg1, pg2, true, sectionLength);
                turtle.return();
                turtle.drawMid(pg1, sectionLength);
            }

            for (let i = n - 1; i > -1; i--) {
                // lower
                rigidBodyPointSet.push({ x: (i + 1) * sectionLength, y: strokeW / 2 });
                rigidBodyPointSet.push({ x: i * sectionLength + strokeW, y: strokeW / 2 });
                rigidBodyPointSet.push({ x: (i + 1) * sectionLength, y: sectionLength - strokeW });
                rigidBodyPointSet.push({ x: (i + 1) * sectionLength, y: sectionLength });
                rigidBodyPointSet.push({ x: i * sectionLength, y: strokeW / 2 });
            }
            this.rigidBody = Bodies.fromVertices(this.rootX, this.rootY, [rigidBodyPointSet], {});
            this.rootMassOffset = { x: this.rootX - this.rigidBody.bounds.min.x, y: 0 };
            this.rootX = this.rigidBody.position.x - this.rootMassOffset.x;
            this.maskBuffer = pg1;
            this.renderBuffer = pg2;
            turtle.reset();
        }

        render() {
            let cornerX = this.rootX - this.bleeding;
            let cornerY = this.rootY - this.renderBuffer.height / 2;
            s.push();
            //s.blendMode(s.HARD_LIGHT);
            s.image(this.renderBuffer, cornerX, cornerY);
            s.pop();
        }
    }

    const branchesNo = 40;
    let branches = [];
    s.setup = function () {
        canvas = s.createCanvas(1600, 1000);
        s.angleMode(s.DEGREES);
        s.frameRate(30);
        Utils.applyScalling(div, canvas.canvas);
        turtle = new Turtle();
        background = genBackground();
        texture = genTexture();
        s.background(background);
        for (let i = 0; i < branchesNo; i++) {
            branches.push(new Branch(200 + 300 * (i % 5), 100 + 100 *  Math.floor( i / 5)))
        }
    }

    s.draw = function () {
        let pg = s.createGraphics(s.width, s.height);
        let toBeMasked = s.createImage(s.width, s.height);
        toBeMasked.copy(texture, 0, 0, s.width, s.height, 0, 0, s.width, s.height);
        branches.forEach(b => { 
            let cornerX = b.rootX - b.bleeding;
            let cornerY = b.rootY - b.maskBuffer.height / 2;
            pg.image(b.maskBuffer, cornerX, cornerY);
        })
        toBeMasked.mask(pg);
        s.image(toBeMasked, 0, 0);
        branches.forEach(b => { 
            b.render();
        })
    }

    s.windowResized = function () {
        Utils.applyScalling(div, canvas.canvas);
        //s.background(background);
    }

    genBackground = function () {
        const parameter1 = 100;
        const factor = 0.25;
        const contrast = 2;
        const hh = s.height;
        const hw = s.width;
        let huge = s.createImage(hw, hh);
        for (let x = 0; x < hw; x++) {
            for (let y = 0; y < hh; y++) {
                let phase = Math.sin(((x / -(Math.SQRT2 / 2)) + (y / (Math.SQRT2 / 2))) % parameter1);
                if (phase < 0) {
                    let noiseV = (s.noise(x * factor, y * factor) - 0.5) * contrast;
                    if (noiseV < -contrast / 4) {
                        phase = 1;
                    }
                    else {
                        phase *= s.map(noiseV, -contrast / 4, contrast / 2, 0, 1);
                    }
                }
                let c = [s.map(phase, -1, 1, 63 + s.random(-5, 5), 81 + s.random(-5, 5)), s.map(phase, -1, 1, 56 + s.random(-5, 5), 70 + s.random(-5, 5)), s.map(phase, -1, 1, 72 + s.random(-5, 5), 87 + s.random(-5, 5)), 255]
                huge.set(x, y, c)
            }
        }
        huge.updatePixels();
        return huge;
    }

    genTexture = function () {
        const h = s.height;
        const w = s.width;
        const parameter1 = 20;
        const factor = 0.25;
        const contrast = 2;
        let t = s.createImage(w, h);
        for (let x = 0; x < t.width; x++) {
            for (let y = 0; y < t.height; y++) {
                let phase = Math.sin(((x / (Math.SQRT2 / 2)) + (y / (Math.SQRT2 / 2))) % parameter1);
                if (phase < 0) {
                    let noiseV = (s.noise(x * factor, y * factor) - 0.5) * contrast;
                    if (noiseV < -contrast / 4) {
                        phase = 1;
                    }
                    else {
                        phase *= s.map(noiseV, -contrast / 4, contrast / 2, 0, 1);
                    }
                }
                let c = [s.map(phase, -1, 1, 170 + s.random(-5, 5), 119 + s.random(-5, 5)), s.map(phase, -1, 1, 166 + s.random(-5, 5), 118 + s.random(-5, 5)), s.map(phase, -1, 1, 180 + s.random(-5, 5), 140 + s.random(-5, 5)), 255]
                t.set(x, y, c);
            }
        }
        t.updatePixels();
        return t;

    }

    // drawBackground = function (deg) {
    //     s.push();
    //     s.translate(s.width / 2, s.height / 2);
    //     s.rotate(deg);
    //     s.image(background, -background.width / 2, -background.height / 2);
    //     s.pop();
    // }
}