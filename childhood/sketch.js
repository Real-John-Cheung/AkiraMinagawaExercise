let sketch = function (s) {
    let div = window.document.getElementsByClassName('sketchContainer')[0];
    let canvas;
    const Delaunay = d3.Delaunay;
    let background;

    class Point {
        constructor(x, y, r, b) {
            this.initPosition = [x, y];
            this.currentPosition = [x, y];
            this.moveableR = r;
            this.onSmallTri = b;
        }

        randomWalk() {
            const step = 1;
            if (this.moveableR > 0) {
                let newPosition = [this.currentPosition[0] + s.random(-1, 1) * step, this.currentPosition[1] + s.random(-1, 1) * step];
                if ((newPosition[0] - this.initPosition[0]) * (newPosition[0] - this.initPosition[0]) + (newPosition[1] - this.initPosition[1]) * (newPosition[1] - this.initPosition[1]) < this.moveableR * this.moveableR) {
                    this.currentPosition = [newPosition[0], newPosition[1]];
                }
            }
        }
    }

    class PointSet {
        constructor(numOfPoints, minDistance) {
            this.minDistance = minDistance;
            this.numOfPoints = numOfPoints;
            this.points = this._initPointsWithPoissonDisc(numOfPoints, minDistance);
            while (this.points.length < 100) {
                this.points = this._initPointsWithPoissonDisc(numOfPoints, minDistance);
            }
            this.delaunay = this._initDelaunay();
            this.innerPerlinTimer1 = 0;
            this.innerPerlinTimer2 = 0;
            this.innerPerlinGap = Math.floor(s.random(14400));
            this.fillColor = [[80, 71, 0], [8, 24, 5], [37, 11, 14], [24, 14, 8], [2, 2, 1], [44, 36, 18], [50, 50, 50]];
            this.filledIdx = [];
            this.textureBuffer = []; //[[x,y,maskedImage, tri],]
        }

        _drawPoly(polygon, textureIdx, alpha) {
            if (this.textureBuffer[textureIdx] === undefined) this._generatePoly(polygon, s.random(this.fillColor), textureIdx);
            s.push();
            s.blendMode(s.BURN);
            s.tint(255, alpha)
            s.image(this.textureBuffer[textureIdx][2], this.textureBuffer[textureIdx][0], this.textureBuffer[textureIdx][1]);
            s.pop();
        }

        _generatePoly(polygon, color, triIdx) {
            let xMin, yMin, xMax, yMax;
            polygon.forEach(p => {
                if (!xMin) xMin = p[0];
                if (p[0] < xMin) xMin = p[0];
                if (!xMax) xMax = p[0];
                if (p[0] > xMax) xMax = p[0];
                if (!yMin) yMin = p[1];
                if (p[1] < yMin) yMin = p[1];
                if (!yMax) yMax = p[1];
                if (p[1] > yMax) yMax = p[1];
            })
            let img = s.createImage(Math.ceil(xMax - xMin), Math.ceil(yMax - yMin));
            const xoffset = s.random(14400, 144000);
            const yoffset = s.random(14400, 144000);
            const factor = 0.2;
            const contrast = 2;
            for (let x = 0; x < img.width; x++) {
                for (let y = 0; y < img.height; y++) {
                    let noiseV = s.noise((x + xoffset) * factor, (y + yoffset) * factor)
                    let alpha = (noiseV - 0.5) * contrast < -0.3 ? 0 : Math.floor(s.map((noiseV - 0.5) * contrast, -0.3, contrast / 2, 50, 255, true));
                    if (alpha > 0) alpha = s.lerp(alpha, 255, 0.25);
                    let c = s.color(color[0], color[1], color[2], alpha);
                    img.set(x, y, c);
                }
            }
            img.updatePixels();
            let pg = s.createGraphics(Math.ceil(xMax - xMin), Math.ceil(yMax - yMin));
            pg.fill(0);
            pg.stroke(255, 50);
            pg.strokeWeight(4);
            pg.beginShape();
            polygon.forEach(p => {
                pg.vertex(p[0] - xMin, p[1] - yMin);
            })
            pg.endShape(s.CLOSE);
            img.mask(pg);
            this.textureBuffer.push([xMin, yMin, img, polygon, triIdx]);
            this.filledIdx.push(triIdx);
        }

        _updateTextureBuffer() {
            const factor = 0.002, contrast = 2;
            for (let i = 0; i < this.textureBuffer.length; i++) {
                const polygon = this.textureBuffer[i][3];
                let shouldRemove = false;
                for (let j = 0; j < polygon.length; j++) {
                    const point = polygon[j];
                    let colorPerlinValue = (s.noise(point[0] * factor + this.innerPerlinGap, point[1] * factor + this.innerPerlinGap, this.innerPerlinTimer2) - 0.5) * contrast;
                    if (colorPerlinValue <= 0.1) {
                        shouldRemove = true;
                        break;
                    }
                }
                if (shouldRemove) {
                    let idx = this.filledIdx.indexOf(this.textureBuffer[i][4]);
                    if (idx > -1) this.filledIdx.splice(idx, 1);
                    this.textureBuffer.splice(i, 1);

                }
            }
        }

        _initDelaunay() {
            let currentPoints = this.points.map(p => p.currentPosition);
            return Delaunay.from(currentPoints);
        }

        _updateDelaunay() {
            this.delaunay.points = this._formatPoints();
            this.delaunay.update();
        }

        _formatPoints() {
            let r = [];
            this.points.forEach(p => r.push(...p.currentPosition));
            return r;
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
            const { points, halfedges, triangles } = this.delaunay;
            for (let i = 0, n = halfedges.length; i < n; ++i) {
                const j = halfedges[i];
                if (j < i) continue;
                const ti = triangles[i];
                const tj = triangles[j];
                if (s.dist(points[ti * 2], points[ti * 2 + 1], points[tj * 2], points[tj * 2 + 1]) < maxD) s.line(points[ti * 2], points[ti * 2 + 1], points[tj * 2], points[tj * 2 + 1]);
            }
            s.pop();
        }

        animation1() {
            // for (let i = 0; i < this.points.length; i++) {
            //     this.points[i].randomWalk();
            // }
            this.innerPerlinTimer2 += 0.003;
            //this._updateDelaunay();
        }

        drawMesh(maxDistance, overallAlpha) {
            // s.push();
            // s.blendMode(s.BURN);
            // s.image(this.textureBuffer[0][2], 10, 10, this.textureBuffer[0][2].width * 10, this.textureBuffer[0][2].height * 10);
            // s.pop();
            const { points, halfedges, triangles } = this.delaunay;
            const factor = 0.002, contrast = 2;
            for (let i = 0, n = halfedges.length; i < n; ++i) {
                const j = halfedges[i];
                if (j < i) continue;
                const ti = triangles[i];
                const tj = triangles[j];
                let dist = s.dist(points[ti * 2], points[ti * 2 + 1], points[tj * 2], points[tj * 2 + 1]);
                if (dist > maxDistance) continue;
                let colorPerlinValue1 = (s.noise(points[ti * 2] * factor + this.innerPerlinGap, points[ti * 2 + 1] * factor + this.innerPerlinGap, this.innerPerlinTimer2) - 0.5) * contrast;
                let colorPerlinValue2 = (s.noise(points[tj * 2] * factor + this.innerPerlinGap, points[tj * 2 + 1] * factor + this.innerPerlinGap, this.innerPerlinTimer2) - 0.5) * contrast;
                let baseC, strokeWeight;
                if (colorPerlinValue1 > 0.1 && colorPerlinValue2 > 0.1) {
                    baseC = [45 + Math.floor(s.random(-10, 10)), 64 + Math.floor(s.random(-10, 10)), 81 + Math.floor(s.random(-10, 10)), overallAlpha];
                    strokeWeight = 3;
                }
                // else if (colorPerlinValue1 > 0.1 || colorPerlinValue2 > 0.1) {
                //     baseC = [60 + Math.floor(s.random(-10, 10)), 70 + Math.floor(s.random(-10, 10)), 80 + Math.floor(s.random(-10, 10)), 255];
                //     strokeWeight = 2;
                // } 
                else {
                    baseC = [50 + Math.floor(s.random(-10, 10)), 50 + Math.floor(s.random(-10, 10)), 70 + Math.floor(s.random(-10, 10)), overallAlpha];
                    strokeWeight = 1.5;
                }
                this.drawLine(points[ti * 2], points[ti * 2 + 1], points[tj * 2], points[tj * 2 + 1], baseC, strokeWeight);
            }
            //console.log(triangles[3]);
            for (let i = 0; i < Math.floor(triangles.length / 3); i++) {
                const t0 = triangles[i * 3 + 0];
                const t1 = triangles[i * 3 + 1];
                const t2 = triangles[i * 3 + 2];
                let colorPerlinValue0 = (s.noise(points[t0 * 2] * factor + this.innerPerlinGap, points[t0 * 2 + 1] * factor + this.innerPerlinGap, this.innerPerlinTimer2) - 0.5) * contrast;
                if (colorPerlinValue0 < 0.1) continue; 
                let colorPerlinValue1 = (s.noise(points[t1 * 2] * factor + this.innerPerlinGap, points[t1 * 2 + 1] * factor + this.innerPerlinGap, this.innerPerlinTimer2) - 0.5) * contrast;
                if (colorPerlinValue1 < 0.1) continue; 
                let colorPerlinValue2 = (s.noise(points[t2 * 2] * factor + this.innerPerlinGap, points[t2 * 2 + 1] * factor + this.innerPerlinGap, this.innerPerlinTimer2) - 0.5) * contrast;
                if (colorPerlinValue2 < 0.1) continue; 

                if (this.textureBuffer.length < numOfFill && s.random() > 0.3 && this.filledIdx.indexOf(i) === -1) {
                    this._generatePoly([[points[t0 * 2], points[t0 * 2 + 1]], [points[t1 * 2], points[t1 * 2 + 1]], [points[t2 * 2], points[t2 * 2 + 1]]], s.random(this.fillColor), i);
                }
            }
            this._updateTextureBuffer();
            this.textureBuffer.forEach((p, i) => {
                this._drawPoly(p[2], i, overallAlpha);
            });
            //console.log(this.textureBuffer.length);
        }

        drawLine(x1, x2, y1, y2, c, sw) {
            s.push();
            s.stroke(c);
            s.strokeWeight(sw);
            s.blendMode(s.BURN);
            s.line(x1, x2, y1, y2);
            s.pop();
        }

        // _initPoints = function (numOfPoints, minDistance) {
        //     const factor = 0.005;
        //     const contrast = 1.7;
        //     let tree;
        //     let set = [], cache = [];
        //     while (set.length < numOfPoints) {
        //         let x = Math.floor(s.random(s.width)), y = Math.floor(s.random(s.height));
        //         while (cache.includes(x + ',' + y)) {
        //             x = Math.floor(s.random(s.width));
        //             y = Math.floor(s.random(s.height));
        //         }
        //         while ((s.noise(x * factor, y * factor, this.innerPerlinTimer1) - 0.5) * contrast < s.random(-0.5, 0.5)) {
        //             x = Math.floor(s.random(s.width));
        //             y = Math.floor(s.random(s.height));
        //         }

        //         if (!tree) {
        //             tree = new KdTree([x, y]);
        //             set.push([x, y]);
        //             cache.push(x + ',' + y);
        //         } else {
        //             let nearest = tree.nearest([x, y], 1)[0];
        //             if (nearest[1] >= minDistance * minDistance) {
        //                 tree.insert([x, y]);
        //                 set.push([x, y]);
        //                 cache.push(x + ',' + y);
        //             }
        //         }
        //     }
        //     set.push(...[[-100, 0], [0, -100], [s.width + 100, s.height], [s.width, s.height + 100]]);
        //     return set;
        // }

        _initPointsWithPoissonDisc(numOfPoints, minDistance) {
            const distControlFunction = (r, df) => s.abs(r * df * 200);
            const threshold = 0.1;
            const factor = 0.01;
            const contrast = 2;
            const deductRatio = 0.6;
            let r = minDistance;
            const k = 30;
            let grid = [], active = [], res = [], lowDenIdxs = [];
            let w = r / Math.SQRT2
            let numOfCol = Math.floor(s.width / w);
            let numOfRow = Math.floor(s.height / w);
            grid = new Array(numOfCol * numOfRow);

            //init point 
            let firstX = Math.floor(s.random(s.width)), firstY = Math.floor(s.random(s.width));
            let pos = s.createVector(firstX, firstY);
            let tree = new KdTree([pos.x, pos.y]);
            grid[Math.floor(firstX / w) + (Math.floor(firstY / w)) * numOfCol] = pos;
            res.push(new Point(pos.x, pos.y, 0));
            active.push(pos);

            //start
            while (active.length > 0) {
                let idx = Math.floor(s.random(active.length));
                let pos = active[idx];
                let found = false;
                let df = (s.noise(pos.x * factor, pos.y * factor, this.innerPerlinTimer1) - 0.5) * contrast;
                let usingR = r;
                if (df < threshold) {
                    usingR = distControlFunction(r, df); //tba
                }

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
                                    let tdf = (s.noise(neighbor.x * factor, neighbor.y * factor, this.innerPerlinTimer1) - 0.5) * contrast;
                                    let theirR = tdf < threshold ? distControlFunction(r, df) : r;
                                    //let theirR = r;
                                    if (d < Math.min(theirR, usingR)) {
                                        ok = false;
                                        break;
                                    }
                                }
                            }
                        }
                        if (ok) {
                            let sqDist = tree.nearest([sample.x, sample.y], 1);
                            //let sqDist = [[0,Number.MAX_SAFE_INTEGER]]
                            if (sqDist[0][1] > minDistance * minDistance) {
                                if (usingR !== r) {
                                    if (s.random() > deductRatio) res.push(new Point(sample.x, sample.y, usingR / 4, usingR <= r));
                                } else {
                                    res.push(new Point(sample.x, sample.y, usingR / 4, usingR <= r));
                                }
                                if (res.length > numOfPoints) return res;

                                grid[col + row * numOfCol] = sample;
                                active.push(sample);
                                tree.insert([sample.x, sample.y]);
                                found = true;
                                break;
                            }
                        }
                    }
                }
                if (!found) active.splice(idx, 1);
            }
            return res;
        }
    }

    const numOfPoints = 3000;
    const minDistance = 15;
    const fadeInOutTime = 1.5;
    const displayTimeEach = 60;
    const numOfFill = 200;
    const fr = 12;
    let timer = 0;
    let pointSet;
    s.setup = function () {
        canvas = s.createCanvas(1600, 1000);
        background = genBackground();
        //s.background(background);
        s.frameRate(12);
        Utils.applyScalling(div, canvas.canvas);

        pointSet = new PointSet(numOfPoints, minDistance);
        //pointSet._debugDrawB(50);
        //pointSet.drawMesh(100)

    }

    s.draw = function () {
        s.background(background);
        let st = s.frameCount - timer, overallAlpha, skip = false;
        if (st > fadeInOutTime * fr && st <= fadeInOutTime * fr + displayTimeEach * fr) {
            overallAlpha = 255;
        } else if (st <= fadeInOutTime * fr) {
            overallAlpha = s.map(st, 0, fadeInOutTime * fr, 0, 255, true);
        } else if (st > fadeInOutTime * fr + displayTimeEach * fr && st <= fadeInOutTime * 2 * fr + displayTimeEach * fr) {
            overallAlpha = s.map(st, fadeInOutTime * fr + displayTimeEach * fr, fadeInOutTime * 2 * fr + displayTimeEach * fr, 255, 0, true);
        } else {
            reset();
            skip = true;
        }
        if (!skip) pointSet.drawMesh(100, overallAlpha);
        //s.image(foreground,0,0)
        pointSet.animation1();
    }

    s.windowResized = function () {
        Utils.applyScalling(div, canvas.canvas);
        s.background(background);
    }

    reset = function () {
        pointSet = new PointSet(numOfPoints, minDistance);
        timer = s.frameCount;
    }

    genBackground = function () {
        const light = 240; //248
        const strokeL = 144, strokeH = 206
        let offset = Math.floor(s.random(4));
        let pg = s.createImage(s.width, s.height);
        for (let x = 0; x < pg.width; x++) {
            for (let y = 0; y < pg.height; y++) {
                let base;
                if ((x + offset) % 4 > 0 && ((y + offset) % 4 === 1 || (y + offset) % 4 === 3)) {
                    //base = 248;
                    base = light;
                } else if ((y + offset) % 4 === 2 && ((x + offset) % 4 === 1 || (x + offset) % 4 === 3)) {
                    //base = 248;
                    base = light;
                } else if ((x + offset) % 4 === 0 || (y + offset) % 4 === 0) {
                    if (s.random() > 0.3) {
                        base = Math.floor(s.random(strokeL, strokeH));
                    } else {
                        base = light;
                    }
                } else {
                    if (s.random() > 0.7) {
                        base = Math.floor(s.random(strokeL, strokeH));
                    } else {
                        base = light;
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