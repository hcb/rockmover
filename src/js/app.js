/*jslint browser:true */
window.onload = function() {

    var canvas = document.getElementById("canvas"),
        ctx = canvas.getContext("2d"),
        blockScale = 30,
        spriteScale = 40,
        blocks = [],
        blockAtPointer = null;

    canvas.height = 600;
    canvas.width = 900;

    var columnCount = canvas.width / blockScale,
        rowCount = canvas.height / blockScale,
        startDragPosition,
        endDragPosition,
        delta,
        bestScore = null;

    if (localStorage.getItem("rockmvrScore")) {
        bestScore = localStorage.getItem("rockmvrScore");
    }

    var bindEvents = function() {
        var buttonContainer = document.getElementById("buttons");
        var newGameButton = document.getElementById("new");
        var active = null;
        var mouseDown = false;

        canvas.addEventListener("mousemove", function() {
            // highlight the mouseover target
            var position = getPointerVector();
            if (getBlockAtPosition(position)) {
                blockAtPointer = getBlockAtPosition(position);
            } else {

                blockAtPointer = null;
            }

            if (mouseDown) {
                endDragPosition = getPointerVector();
                var deltaX = endDragPosition.x - startDragPosition.x;
                if (Math.abs(deltaX) >= 1 && active !== null) {
                    var newX = deltaX > 0 ? active.pos.x + 1 : active.pos.x - 1;
                    if (newX < 0) {
                        newX = 0;
                    } else if (newX + active.dim.width > columnCount) {
                        newX = columnCount - active.dim.width;
                    }
                    var newPos = createVector(newX, active.pos.y);
                    if (couldBlockBeMoved(active, newPos)) {
                        active.pos = newPos;
                        drawBlocks();
                        active = null;
                    }
                }
            }

        }, false);

        canvas.addEventListener("mousedown", function() {
            startDragPosition = getPointerVector();
            if (getBlockAtPosition(startDragPosition)) {
                active = getBlockAtPosition(startDragPosition);
                mouseDown = true;
            }
        }, false);

        canvas.addEventListener("mouseup", function(sc) {
            mouseDown = false;
            active = null;
        }, false);

        if (!bestScore) {
            document.getElementById("best-score").style.display = "none";
        } else {
            (document.getElementById("best-score__number")).innerHTML = bestScore
        }

        newGameButton.addEventListener("click", function() {
            cancelAnimationFrame(loop);
            var score = getScore();
            if (bestScore === null || score < bestScore) {
                bestScore = score;
            }
            localStorage.setItem("rockmvrScore", bestScore);
            document.getElementById("best-score").style.display = "inline-block";
            (document.getElementById("best-score__number")).innerHTML = bestScore;
            (document.getElementById("current-score__number")).innerHTML = 0;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            blocks = [];
            canvas.style.pointerEvents = "auto";
            requestAnimationFrame(loop);
        });
    };

    // Block class
    var Block = function(pos, dim, spriteVector) {
        this.pos = pos;
        this.dim = dim;
        this.spriteVector = spriteVector
    };

    // Creates a new block with a random height, width, and coordinates
    var generateBlock = function() {
        var blockSet = [{
            dim: {
                width: 1,
                height: 1
            },
            spriteVector: createVector(40, 40),
            weight: 1
        }, {
            dim: {
                width: 1,
                height: 2
            },
            spriteVector: createVector(40, 200),
            weight: 1
        }, {
            dim: {
                width: 1,
                height: 3
            },
            spriteVector: createVector(120, 200),
            weight: 1
        }, {
            dim: {
                width: 2,
                height: 1
            },
            spriteVector: createVector(120, 40),
            weight: 1
        }, {
            dim: {
                width: 3,
                height: 1
            },
            spriteVector: createVector(120, 120),
            weight: 1.35
        }];

        var totalWeight = 0;
        blockSet.forEach(function(el) {
            totalWeight += el.weight;
        });

        var randomValue = Math.random() * totalWeight;
        var randomBlock = blockSet[0];

        for (var i = 0; i < blockSet.length; i++) {
            if (randomValue < blockSet[i].weight) {
                randomBlock = blockSet[i];
                break;
            } else {
                randomValue -= blockSet[i].weight;
            }
        }

        var x = Math.floor(Math.random() * columnCount);
        // If x places the block outside the canvas, modify the position
        if (x + randomBlock.dim.width > columnCount)
            x -= randomBlock.dim.width;
        var y = Math.floor(Math.random() * 3);

        return new Block({
            x: x,
            y: -randomBlock.dim.height
        }, randomBlock.dim, randomBlock.spriteVector);
    };

    // Returns number of empty blocks remaining on the board (the scoring metric)
    var getScore = function() {
        var x,
            y,
            count = 0;
        for (x = 0; x < columnCount; x += 1) {
            for (y = 0; y < rowCount; y += 1) {
                var blockAtPosition = getBlockAtPosition(createVector(x, y));
                if (blockAtPosition !== null) {
                    count++;
                }
            }
        }
        return columnCount * rowCount - count;
    };


    // Returns block at a specific position, otherwise returns null
    var getBlockAtPosition = function(pos) {
        var i;
        for (i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            if (pos.x >= block.pos.x && pos.x < block.pos.x + block.dim.width &&
                pos.y >= block.pos.y && pos.y < block.pos.y + block.dim.height) {
                return block;
            }
        }

        return null;
    };

    // Create blocks to populate the board
    var createNewBlocks = function() {
        var block = generateBlock();
        var tries = 0;

        while (tries < 5) {
            if (couldBlockBeMoved(block, block.pos)) {
                blocks.push(block);
                return;
            }
            tries++;
        }
    };

    // Returns true if block could be placed at newPosition without overlapping another block
    var couldBlockBeMoved = function(block, newPosition) {
        // Let's handle cases where y = canvas.height
        if (newPosition.y + block.dim.height > rowCount) {
            return false;
        }

        for (var x = newPosition.x; x < newPosition.x + block.dim.width; x += 1) {
            for (var y = newPosition.y; y < newPosition.y + block.dim.height; y += 1) {
                var blockAtPosition = getBlockAtPosition(createVector(x, y));
                if (blockAtPosition !== null && blockAtPosition != block) {
                    return false;
                }
            }
        }

        return true;
    };

    // Update block's y position by one grid unit, if it can be moved
    var moveBlocksDown = function() {
        blocks.sort(function(a, b) {
            return b.pos.y - a.pos.y;
        });

        blocks.forEach(function(block) {
            var newPosition = addVectors(block.pos, createVector(0, 1));
            if (couldBlockBeMoved(block, newPosition)) {
                block.pos = newPosition;
            }
        });
    };

    var createVector = function(x, y) {
        return {
            "x": x,
            "y": y
        };
    };

    var addVectors = function(a, b) {
        return {
            "x": a.x + b.x,
            "y": a.y + b.y
        };
    };

    // Returns a vector pair based on the mouse/pointer coordinates
    var getPointerVector = function() {
        var rect = canvas.getBoundingClientRect();
        return createVector(Math.floor((event.clientX - rect.left) / blockScale),
            Math.floor((event.clientY - rect.top) / blockScale));
    };

    /*
     * Canvas / Drawing
     */
    var drawBlock = function(block, color) {
        ctx.beginPath();
        var spritePosX = blockAtPointer !== null && blockAtPointer == block ? block.spriteVector.x + 6 * spriteScale : block.spriteVector.x;

        ctx.drawImage(spriteImage,
            spritePosX,
            block.spriteVector.y,
            block.dim.width * spriteScale,
            block.dim.height * spriteScale,
            block.pos.x * blockScale,
            block.pos.y * blockScale,
            block.dim.width * blockScale,
            block.dim.height * blockScale);

        ctx.lineWidth = 1;
        //ctx.strokeRect(block.pos.x * blockScale, block.pos.y * blockScale, block.dim.width * blockScale, block.dim.height * blockScale);
        ctx.closePath();
    };

    var drawGrid = function() {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#ddd";
        for (var i = 0; i < columnCount; i++) {
            ctx.beginPath();
            ctx.moveTo(0, blockScale * i);
            ctx.lineTo(canvas.width, blockScale * i);
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.moveTo(blockScale * i, 0);
            ctx.lineTo(blockScale * i, canvas.height);
            ctx.stroke();
            ctx.closePath();
        }
    };

    var drawBlocks = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        blocks.forEach(drawBlock);
    };

    /*
     * game loop
     */
    var startTime = Date.now();
    var framesPerSecond = 20;
    var interval = 1000 / framesPerSecond;

    var loop = function() {
        requestAnimationFrame(loop);

        var now = Date.now();
        var delta = now - startTime;

        if (delta > interval) {

            startTime = now - (delta % interval);

            drawBlocks();
            moveBlocksDown();
            createNewBlocks();
            (document.getElementById("current-score__number")).innerHTML = getScore();
        }
    };

    var init = function() {
        bindEvents();
        //startInt = setInterval(loop, 100);
        requestAnimationFrame(loop);
    };


    var spriteImage = new Image();
    spriteImage.src = "img/PAVE.png";

    init();

};
