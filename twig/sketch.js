p5.disableFriendlyErrors = true;
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
            this.initRootX = x;
            this.initRootY = y;
            this.numOfSubBranch = Math.floor(s.random(5, 8));
            this.bleeding = 5;
            this.rigidBody = undefined;
            this.renderBuffer = undefined;
            this.maskBuffer = undefined;
            this._createBranch(this.numOfSubBranch);
            //this._createBranch(1);
            World.add(world, this.rigidBody, { restitution: 1, friction: 0 });
            //this._debugDraw();
        }

        _debugDraw() {
            s.push();
            s.strokeWeight(10);
            // s.stroke(255, 0, 0);
            // s.point(this.initRootX, this.initRootY);
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
            s.angleMode(s.RADIANS);
            s.translate(this.rigidBody.position.x, this.rigidBody.position.y);
            s.rotate(this.rigidBody.angle);
            s.image(this.maskBuffer, -this.maskBuffer.width / 2, - this.maskBuffer.height / 2);
            s.image(this.renderBuffer, -this.renderBuffer.width / 2, - this.renderBuffer.height / 2);

            s.pop();
        }

        _createBranch(n) {
            const strokeW = 10;
            const sectionLength = 30;
            let rigidBodyPointSet = [];
            let pg1 = s.createGraphics(sectionLength * n + 2 * this.bleeding, sectionLength * 2 + 2 * this.bleeding); //for mask
            let pg2 = s.createGraphics(sectionLength * n + 2 * this.bleeding, sectionLength * 2 + 2 * this.bleeding); //for yf
            turtle.setSize(strokeW);
            turtle.moveTo(this.bleeding, pg1.height / 2);
            for (let i = 0; i < n; i++) {
                // upper
                if (i === 0) rigidBodyPointSet.push({ x: i * sectionLength, y: - strokeW / 2 });
                if (i === n - 1 || i === 0) rigidBodyPointSet.push({ x: (i + 1) * sectionLength, y: - sectionLength * 1 });

                //turtle drawing
                turtle.remember();
                turtle.drawSub(pg1, pg2, false, sectionLength);
                turtle.return();
                turtle.remember();
                turtle.drawSub(pg1, pg2, true, sectionLength);
                turtle.return();
                turtle.drawMid(pg1, sectionLength);
            }
            rigidBodyPointSet.push({ x: n * sectionLength, y: sectionLength * 1 });
            rigidBodyPointSet.push({ x: sectionLength, y: sectionLength * 1 });
            rigidBodyPointSet.push({ x: 0, y: strokeW / 2 });
            // for (let i = n - 1; i > -1; i--) {
            //     // lower
            //     rigidBodyPointSet.push({ x: (i + 1) * sectionLength, y: sectionLength * 1 });
            //     if (i === 0) rigidBodyPointSet.push({ x: i * sectionLength, y: strokeW / 2 });
            // }
            this.rigidBody = Bodies.fromVertices(this.initRootX, this.initRootY, [rigidBodyPointSet], {});
            this.rootMassOffset = { x: this.initRootX - this.rigidBody.bounds.min.x, y: 0 };
            this.initRootX = this.rigidBody.position.x - this.rootMassOffset.x;
            this.initRootY = this.rigidBody.position.y;
            this.maskBuffer = pg1;
            this.renderBuffer = pg2;
            turtle.reset();
        }

        render() {
            s.push();
            //s.blendMode(s.HARD_LIGHT);
            s.angleMode(s.RADIANS);
            s.translate(this.rigidBody.position.x, this.rigidBody.position.y);
            s.rotate(this.rigidBody.angle);
            let cornerX = - this.renderBuffer.width / 2;
            let cornerY = - this.renderBuffer.height / 2;
            s.image(this.renderBuffer, cornerX, cornerY);
            s.pop();
        }

        // update() {
        //     const outage = this.renderBuffer.width / 2;
        //     if (this.rigidBody.position.x < -outage) this.rigidBody.position.x = s.width + outage;
        //     if (this.rigidBody.position.y < -outage) this.rigidBody.position.y = s.height + outage;
        //     if (this.rigidBody.position.x > s.width + outage) this.rigidBody.position.x = - outage;
        //     if (this.rigidBody.position.y > s.height + outage) this.rigidBody.position.y = - outage;
        // }

        applyF(ff) {
            const xx = Math.floor(this.rigidBody.position.x / scl);
            const yy = Math.floor(this.rigidBody.position.y / scl);
            const f = ff[xx + yy * cols];
            if (!f) return
            const mm = this.rigidBody.mass * 0.0001
            let force = { x: f.x * mm, y: f.y * mm };
            Body.applyForce(this.rigidBody, {x: xx, y: yy}, force)
        }
    }

    const branchesNo = 100;
    let branches = [];
    // s.background = function (img) {
    //     s.image(img, -s.width / 2, -s.height / 2);
    // }
    let flowField, scl = 50, cols, rows, inc = 0.1, magInc = 0.02, zOff = 0, magOff = 0, incStart = 0.1;
    s.setup = function () {
        canvas = s.createCanvas(1600, 1000);
        s.angleMode(s.DEGREES);
        s.frameRate(24);
        Utils.applyScalling(div, canvas.canvas);
        turtle = new Turtle();
        background = genBackground();
        texture = genTexture();
        s.background(background);
        for (let i = 0; i < branchesNo; i++) {
            // branches.push(new Branch(300 * (i % 5), 50 * Math.floor(i / 5)))
            branches.push(new Branch(s.random(s.width), s.random(s.height)));
        }
        //walls
        World.add(world, Bodies.rectangle(-50, s.height / 2, 100, s.height + 20, { isStatic: true, restitution: 1, friction: 0 }));
        World.add(world, Bodies.rectangle(s.width / 2, -50, s.width + 20, 100, { isStatic: true, restitution: 1, friction: 0 }));
        World.add(world, Bodies.rectangle(s.width + 50, s.height / 2, 100, s.height + 20, { isStatic: true, restitution: 1, friction: 0 }));
        World.add(world, Bodies.rectangle(s.width / 2, s.height + 50, s.width + 20, 100, { isStatic: true, restitution: 1, friction: 0 }));
        // ff
        cols = Math.floor(s.width / scl);
        rows = Math.floor(s.height / scl);
        flowField = new Array(rows * cols);
        // forces
        engine.gravity.scale = 0;
        engine.gravity.x = 0;
        engine.gravity.y = 0;
        branches.forEach(b => {
            Body.setAngle(b.rigidBody, s.random(0, 2 * Math.PI));
        })
    }

    s.draw = function () {
        s.background(background);
        updateFF();
        let pg = s.createGraphics(s.width, s.height);
        let toBeMasked = texture.get();
        branches.forEach(b => {
            pg.push();
            pg.angleMode(s.RADIANS);
            pg.translate(b.rigidBody.position.x, b.rigidBody.position.y);
            pg.rotate(b.rigidBody.angle);
            pg.image(b.maskBuffer,- b.renderBuffer.width / 2,- b.renderBuffer.height / 2);
            pg.pop();
        })
        toBeMasked.mask(pg);
        s.image(toBeMasked, 0, 0);
        branches.forEach(b => {
            b.render();
            b.applyF(flowField);
            //b._debugDraw();
        })
        // engine xy
        // engine.gravity.x = (s.noise(engineGXNoiseC) - 0.5) * 2;
        // engine.gravity.y = (s.noise(engineGYNoiseC) - 0.5) * 2;

        // engineGXNoiseC += Math.random() < 0.9 ? 0.03 : 1;
        // engineGYNoiseC += Math.random() < 0.9 ? 0.03 : 1;
        Engine.update(engine);
    }

    s.windowResized = function () {
        Utils.applyScalling(div, canvas.canvas);
        //s.background(background);
    }

    updateFF = function () {
        const db = true;
        let yoff = 0;
        for (let y = 0; y < rows; y++) {
            let xoff = 0;
            for (let x = 0; x < cols; x++) {
                let idx = x + y * cols;
                let angle = s.noise(xoff, yoff, zOff) * Math.PI * 2;
                s.angleMode(s.RADIANS);
                let v = {x: Math.cos(angle), y: Math.sin(angle)};
                let m = s.map(s.noise(xoff, yoff, magOff), 0, 1, -2, -2);
                v.x *= m;
                v.y *= m;
                flowField[idx] = v;
                xoff += inc;
            }
            yoff += inc
        }
        magOff += magInc;
        zOff += incStart;
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