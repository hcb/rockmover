window.onload = function () {

    var canvas = document.getElementById("canvas"),
        ctx = canvas.getContext("2d"),
        blockScale = 30,
        blocks = [],
        colors = ["#6813AA", "#FFFF49", "#1962D1", "#DEBDCF", "#7D2866", "#46646A", "#D95C48", "#A52180", "#25EE2B", "#EA802F", "#665CBC", "#785C59"];
    canvas.height = 600;
    canvas.width = 600;

    var columnCount = canvas.width / blockScale,
        rowCount = canvas.height / blockScale;

    var Block = function (pos, dim) {
        this.pos = pos;
        this.dim = dim;
    };

    var generateBlock = function () {
        var vertical = Math.round(Math.random()) === 0;
        var height = vertical ? Math.floor(Math.random() * 3) + 1 : 1;
        var width = vertical ? 1 : Math.floor(Math.random() * 3) + 1;
        return new Block({
            x: Math.floor(Math.random() * columnCount),
            y: Math.floor(Math.random() * rowCount)
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
        blocks.forEach(function (block) {
            var newPosition = addVectors(block.pos, createVector(0, 1));
            if (couldBlockBeMoved(block, newPosition)) {
                block.pos = newPosition;
            }
        });
    };

    var createBlocks = function () {
        while (blocks.length < 20) {
            var block = generateBlock();
            if (couldBlockBeMoved(block, block.pos)) {
                 blocks.push(block);
            }
        }
    };

    var drawBlock = function (block) {
        ctx.beginPath();
        ctx.rect(block.pos.x * blockScale, block.pos.y * blockScale, block.dim.width * blockScale, block.dim.height * blockScale);
        ctx.strokeRect(block.pos.x * blockScale, block.pos.y * blockScale, block.dim.width * blockScale, block.dim.height * blockScale);
        //ctx.fillStyle = colors[Math.round(Math.random() * (colors.length - 1))];
        ctx.fillStyle = colors[2];
        ctx.fill();
        ctx.closePath();
    };

    var drawBlocks = function () {
        ctx.clearRect(0,0, canvas.width, canvas.height);
        blocks.forEach(drawBlock);
    };


    var loop = function () {
        drawBlocks();
        moveBlocksDown();
        //requestAnimationFrame(loop);
    };

    createBlocks();

    setInterval(function () {
        loop();
    }, 1000);
    //requestAnimationFrame(loop);

};
