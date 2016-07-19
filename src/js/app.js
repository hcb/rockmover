window.onload = function () {

    var canvas = document.getElementById("canvas"),
        ctx = canvas.getContext("2d"),
        blockScale = 30,
        blocks = [],
        activeBlock = null,
        colors = ["#6813AA", "#FFFF49", "#1962D1", "#DEBDCF", "#7D2866", "#46646A", "#D95C48", "#A52180", "#25EE2B", "#EA802F", "#665CBC", "#785C59"];
    canvas.height = 600;
    canvas.width = 600;

    var columnCount = canvas.width / blockScale,
        rowCount = canvas.height / blockScale;
        console.log(columnCount, rowCount);
    var startDragPosition,
        endDragPosition,
        delta;

    canvas.addEventListener("mousemove", function (event) {
        // highlight the mouseover target
        var rect = canvas.getBoundingClientRect();
        var position = getPointerVector();
        if(getBlockAtPosition(position)) {
            activeBlock = getBlockAtPosition(position);
        } else {
            activeBlock = null;
        }
    }, false);


    var getPointerVector = function() {
        var rect = canvas.getBoundingClientRect();
        return createVector(Math.floor((event.clientX - rect.left) / blockScale),
                            Math.floor((event.clientY - rect.top) / blockScale));
    };

    var bindDrag = function() {
        var active = null;
        canvas.addEventListener("mousedown", function(event){

            startDragPosition = getPointerVector();

            if (getBlockAtPosition(startDragPosition)) {
                active = getBlockAtPosition(startDragPosition);
            }

        }, false);

        canvas.addEventListener("mouseup", function(event){

            endDragPosition = getPointerVector();

            var deltaX = endDragPosition.x - startDragPosition.x;

            if (Math.abs(deltaX) >= 1 && active != null) {
                var newX = deltaX > 0 ? active.pos.x + 1 : active.pos.x - 1;
                var newPos = createVector(newX, active.pos.y);

                if (couldBlockBeMoved(active, newPos)) {
                    active.pos = newPos;
                    drawBlocks();
                }

            }

            active = null;

        }, false);
    };

    var Block = function (pos, dim) {
        this.pos = pos;
        this.dim = dim;
    };

    var generateBlock = function () {
        var vertical = Math.round(Math.random()) === 0;
        var height = vertical ? Math.floor(Math.random() * 3) + 1 : 1;
        var width = vertical ? 1 : Math.floor(Math.random() * 3) + 1;
        var x = Math.floor(Math.random() * columnCount);
        if (x + width > columnCount) {
            x -= width;
        }
        var y = Math.floor(Math.random() * rowCount);
        if (y + height > rowCount) {
            y -= width;
        }

        return new Block({
            x: x,
            y: y
        },
        {
            width: width,
            height: height
        });
    };

    var getBlockAtPosition = function (pos) {
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            if (pos.x >= block.pos.x && pos.x < block.pos.x + block.dim.width &&
                pos.y >= block.pos.y && pos.y < block.pos.y + block.dim.height) {
                return block;
            }
        }

        return null;
    };

    var couldBlockBeMoved = function (block, newPosition) {
        // returns true if block could be placed at newPosition without overlapping another block

        // Let's handle cases where y = canvas.height
        // You ain't going nowhere
        if (newPosition.y + block.dim.height > rowCount) {
            return false;
        }

        for (var x = newPosition.x; x < newPosition.x + block.dim.width; x += 1) {
            for (var y = newPosition.y; y < newPosition.y + block.dim.height; y += 1) {
                var blockAtPosition = getBlockAtPosition(createVector(x, y));
                if (blockAtPosition != null && blockAtPosition != block) {
                    return false;
                }
            }
        }

        return true;
    };

    var createVector = function (x, y) {
        return {
            "x": x,
            "y": y
        };
    };

    var addVectors = function (a, b) {
        return {
            "x": a.x + b.x,
            "y": a.y + b.y
        };
    };

    var moveBlocksDown = function () {
        blocks.sort(function(a, b) {
            return b.pos.y - a.pos.y;
        });

        blocks.forEach(function (block) {
            var newPosition = addVectors(block.pos, createVector(0, 1));
            if (couldBlockBeMoved(block, newPosition)) {
                block.pos = newPosition;
            }
        });
    };

    var createBlocks = function () {
        while (blocks.length < 100) {
            var block = generateBlock();
            if (couldBlockBeMoved(block, block.pos)) {
                 blocks.push(block);
            }
        }
    };

    var drawBlock = function (block, color) {
        var fillColor = activeBlock != null && activeBlock == block ? colors[1] : colors[2];
        ctx.strokeStyle = "#444";
        ctx.beginPath();
        ctx.rect(block.pos.x * blockScale, block.pos.y * blockScale, block.dim.width * blockScale, block.dim.height * blockScale);
        ctx.strokeRect(block.pos.x * blockScale, block.pos.y * blockScale, block.dim.width * blockScale, block.dim.height * blockScale);
        //ctx.fillStyle = colors[Math.round(Math.random() * (colors.length - 1))];
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.closePath();
    };

    var drawGrid = function() {
       ctx.lineWidth = 1;
       ctx.strokeStyle = "#ddd";
        for (var i = 0; i < rowCount; i++){
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

    var drawBlocks = function () {
        ctx.clearRect(0,0, canvas.width, canvas.height);
        drawGrid();
        blocks.forEach(drawBlock);
    };


    var loop = function () {
        drawBlocks();
        moveBlocksDown();
        //requestAnimationFrame(loop);
    };

    createBlocks();
    bindDrag();

    setInterval(function () {
        loop();
        //console.log(blocks);
    }, 200);

    //requestAnimationFrame(loop);

};
