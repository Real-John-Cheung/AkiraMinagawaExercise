
// JohnC 2022, based on https://github.com/ubilabs/kd-tree-javascript
class KdTree {
    constructor(points, metric, dimentions) {
        //points: [[p],[],.... ]
        //dimentions: 2,3 .... 
        if (Array.isArray(points) && points.length && typeof points[0] === 'number') {
            points = [points];
        }
        this.self = this;
        this.points = points;
        this.metric = metric;

        if (!this.metric) this.metric = (pointA, pointB) => Math.pow(pointA[0] - pointB[0], 2) + Math.pow(pointA[1] - pointB[1], 2);
        this.dimentions = dimentions;

        this.root = this.buildTree(points, 0, null)
    }

    buildTree(points, depth, partent) {
        let dim = depth % this.dimentions;
        let median, node;
        if (!points || !points.length) {
            return null;
        }
        if (points.length === 1) {
            return new Node(points[0], dim, partent);
        }

        points.sort(function (a, b) {
            return a[dim] - b[dim];
        });

        median = Math.floor(points.length / 2);
        node = new Node(points[median], dim, parent);
        node.left = this.buildTree(points.slice(0, median), depth + 1, node);
        node.right = this.buildTree(points.slice(median + 1), depth + 1, node);

        return node;
    }

    insert(point) {
        const innerSearch = function (node, parent) {
            if (node === null) {
                return parent;
            }
            let dimension = node.dimension; // 0, 1, 2, etc
            if (point[dimension] < node.obj[dimension]) {
                return innerSearch(node.left, node);
            } else {
                return innerSearch(node.right, node);
            }
        }

        let insertPosition = innerSearch(this.root, null);
        let newNode, dimension;

        if (insertPosition === null) {
            this.root = new Node(point, 0, null);
            return;
        }

        newNode = new Node(point, (insertPosition.dimension + 1) % this.dimentions, insertPosition);
        dimension = insertPosition.dimension;

        if (point[dimension] < insertPosition.obj[dimension]) {
            insertPosition.left = newNode;
        } else {
            insertPosition.right = newNode;
        }
    }

    remove(point) {
        let node;
        const nodeSearch = function (node) {
            if (node === null) return null;

            if (node.obj === point) {
                return node;
            }
            let dimension = node.dimension;
            if (point[dimension] < node.obj[dimension]) {
                return nodeSearch(node.left, node);
            } else {
                return nodeSearch(node.right, node);
            }
        }

        const removeNode = function (node) {
            let nextNode, nextObj, pDimension;
            const findMin = function (node, dim) {
                let dimension, own, left, right, min;
                if (node === null) return null;
                dimension = dim;
                if (node.dimension === dim) {
                    if (node.left != null) {
                        return findMin(node.left, dim);
                    }
                    return node;
                }

                own = node.obj[dimension];
                left = findMin(node.left, dim);
                right = findMin(node.right, dim);
                min = node;
                if (left !== null && left.obj[dimension] < own) {
                    min = left;
                }
                if (right !== null && right.obj[dimension] < min.obj[dimension]) {
                    min = right;
                }
                return min;
            }

            if (node.left === null && node.right === null) {
                if (node.parent === null) {
                    self.root = null;
                    return;
                }

                pDimension = node.parent.dimension;

                if (node.obj[pDimension] < node.parent.obj[pDimension]) {
                    node.parent.left = null;
                } else {
                    node.parent.right = null;
                }
                return;
            }
            //
            if (node.right !== null) {
                nextNode = findMin(node.right, node.dimension);
                nextObj = nextNode.obj;
                removeNode(nextNode);
                node.obj = nextObj;
            } else {
                nextNode = findMin(node.left, node.dimension);
                nextObj = nextNode.obj;
                removeNode(nextNode);
                node.right = node.left;
                node.left = null;
                node.obj = nextObj;
            }
            //
        }

        node = nodeSearch(this.root);

        if (node === null) return;

        removeNode(node);
    }

    nearest = function (point, maxNodes, maxDistance) {
        let i, result, bestNodes;

        bestNodes = new BinaryHeap(e => -e[1])

        const nearestSearch = function (node, metric, dimensions) {
            let bestChild;
            let dimension = node.dimension;
            let ownDistance = metric(point, node.obj);
            let linearPoint = [], linearDistance, otherChild, i;

            const saveNode = function (node, distance) {
                bestNodes.push([node, distance]);
                if (bestNodes.size() > maxNodes) {
                    bestNodes.pop();
                }
            }

            for (i = 0; i < dimensions; i++) {
                if (i === node.dimension) {
                    linearPoint[i] = point[i];
                } else {
                    linearPoint[i] = node.obj[i];
                }
            }

            linearDistance = metric(linearPoint, node.obj);

            if (node.right === null && node.left === null) {
                if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
                    saveNode(node, ownDistance);
                }
                return;
            }

            if (node.right === null) {
                bestChild = node.left;
            } else if (node.left === null) {
                bestChild = node.right;
            } else {
                if (point[dimension] < node.obj[dimension]) {
                    bestChild = node.left;
                } else {
                    bestChild = node.right;
                }
            }

            nearestSearch(bestChild, metric, dimensions);

            if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
                saveNode(node, ownDistance);
            }

            if (bestNodes.size() < maxNodes || Math.abs(linearDistance) < bestNodes.peek()[1]) {
                if (bestChild === node.left) {
                    otherChild = node.right;
                } else {
                    otherChild = node.left;
                }
                if (otherChild !== null) {
                    nearestSearch(otherChild, metric, dimensions);
                }
            }
        }

        if (maxDistance) {
            for (i = 0; i < maxNodes; i++) {
                bestNodes.push([null, maxDistance]);
            }
        }

        if (this.root) nearestSearch(this.root, this.metric, this.dimensions);

        result = [];

        for (i = 0; i < Math.min(maxNodes, bestNodes.content.length); i++) {
            if (bestNodes.content[i][0]) {
                result.push([bestNodes.content[i][0].obj, bestNodes.content[i][1]]);
            }
        }
        return result;
    }
}

class Node {
    constructor(obj, dimension, parent) {
        this.obj = obj;
        this.left = null;
        this.right = null;
        this.parent = parent;
        this.dimension = dimension;
    }
}

class BinaryHeap {
    constructor(scoreFunction) {
        this.content = [];
        this.scoreFunction = scoreFunction;
    }

    push(element) {
        this.content.push(element);

        this.bubbleUp(this.content.length - 1);
    }

    pop() {
        let result = this.content[0];
        let end = this.content.pop();
        if (this.content.length > 0) {
            this.content[0] = end;
            this.sinkDown(0);
        }
        return result;
    }

    peek() {
        return this.content[0];
    }

    remove(node) {
        let len = this.content.length;
        for (let i = 0; i < len; i++) {
            if (this.content[i] == node) {
                let end = this.content.pop();
                if (i !== len - 1) {
                    this.content[i] = end;
                    if (this.scoreFunction(end) < this.scoreFunction(node)) {
                        this.bubbleUp(i);
                    } else {
                        this.sinkDown(i);
                    }
                }
                return;
            }
        }
        throw Error("[Binary heap]: remove: node not found");
    }

    size() {
        return this.content.length;
    }

    bubbleUp(n) {
        let element = this.content[n];
        while (n > 0) {
            let parentN = Math.floor((n + 1) / 2) - 1, parent = this.content[parentN];
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                n = parentN
            } else {
                break;
            }
        }
    }

    sinkDown(n) {
        let length = this.content.length, element = this.content[n], elemScore = this.scoreFunction(element);
        while (1) {
            let child2N = (n + 1) * 2, child1N = child2N - 1;

            let swap = null;
            if (child1N < length) {
                let child1 = this.content[child1N], child1Score = this.scoreFunction(child1);
                if (child1Score < elemScore) swap = child1N;
            }
            if (child2N < length) {
                let child2 = this.content[child2N], child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N
                }
            }
            if (swap != null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap
            } else {
                break;
            }
        }
    }
}