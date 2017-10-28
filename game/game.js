var MouseHandler = (function () {
    var x = 0;
    var y = 0;
    var mouseIn = false;

    var init = function (eventSrc) {
        eventSrc.addEventListener('mousemove', onMouseMove);
        eventSrc.addEventListener('mouseout', onMouseOut);
        eventSrc.addEventListener('mouseover', onMouseOver);
    };

    var onMouseOut = function () {
        mouseIn = false;
    };

    var onMouseOver = function () {
        mouseIn = true;
    };

    var onMouseMove = function (e) {
        x = e.clientX;
        y = e.clientY;
    };

    var getPos = function () {
        return {
            x: x,
            y: y
        };
    };

    var isMouseIn = function () {
        return mouseIn;
    };

    return {
        init: init,
        getPos: getPos,
        isMouseIn: isMouseIn
    };
}());

Quadtree.MAX_OBJECTS = 5;
Quadtree.MAX_LEVEL = 5;

function Quadtree(lvl, bnds) {
    var level = lvl;
    var bounds = bnds;
    var objects = [];
    var nodes = [];

    var xMiddle = bounds.x + (bounds.width / 2);
    var yMiddle = bounds.y + (bounds.height / 2);

    var clear = function () {
        objects = [];
        nodes = [];
    };

    var split = function () {
        nodes[0] = new Quadtree(level + 1, {
            x: xMiddle,
            y: bounds.y,
            width: bounds.width / 2,
            height: bounds.height / 2
        });
        nodes[1] = new Quadtree(level + 1, {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width / 2,
            height: bounds.height / 2
        });
        nodes[2] = new Quadtree(level + 1, {
            x: bounds.x,
            y: yMiddle,
            width: bounds.width / 2,
            height: bounds.height / 2
        });
        nodes[3] = new Quadtree(level + 1, {
            x: xMiddle,
            y: yMiddle,
            width: bounds.width / 2,
            height: bounds.height / 2
        });
    };

    var getIndex = function (rec) {
        var top = (rec.y > bounds.y && (rec.y + rec.height) < yMiddle);
        var bottom = (rec.y > yMiddle && (rec.y + rec.height) < (bounds.y + bounds.height));

        if (rec.x > bounds.x && (rec.x + rec.width) < xMiddle) {
            if (top) {
                return 1;
            } else if (bottom) {//LEFT
                return 2;
            }
        } else if (rec.x > xMiddle && (rec.x + rec.width) < (bounds.x + bounds.width)) {
            if (top) {
                return 0;
            } else if (bottom) {//RIGHT
                return 3;
            }
        }
        return -1;
    };

    var insert = function (ent) {
        var rec = ent.getBounds();
        var index = getIndex(rec);
        var len = 0;
        var i = 0;

        if (nodes[0] && index !== -1) {
            nodes[index].insert(ent);
            return;
        }

        objects.push(ent);

        if (objects.length > Quadtree.MAX_OBJECTS && level < Quadtree.MAX_LEVEL) {
            if (!nodes[0]) {
                split();
            }

            len = objects.length;
            while (i < objects.length) {
                index = getIndex(objects[i].getBounds());

                if (index !== -1) {
                    nodes[index].insert(objects[i]);
                    objects.splice(i, 1);
                } else {
                    i += 1;
                }
            }

        }
    };

    var retrieve = function (list, ent) {
        var rec1 = bounds;
        var rec2 = ent.getBounds();

        if (rec2.x < (rec1.x + rec1.width) && (rec2.x + rec2.width) > rec1.x &&
            rec2.y < (rec1.y + rec1.height) && (rec2.y + rec2.height) > rec1.y) {

            for (var o in objects) {
                if (objects[o] !== ent) {
                    list.push(objects[o]);
                }
            }

            if (nodes.length) {
                nodes[0].retrieve(list, ent);
                nodes[1].retrieve(list, ent);
                nodes[2].retrieve(list, ent);
                nodes[3].retrieve(list, ent);
            }
        }

        return list;
    };

    var drawTree = function (ctx) {
        draw(ctx);
        if (nodes[0]) {
            nodes[0].drawTree(ctx);
            nodes[1].drawTree(ctx);
            nodes[2].drawTree(ctx);
            nodes[3].drawTree(ctx);
        }
    };

    var draw = function (ctx) {
        var entAttr = null
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.strokeRect(bounds.x / 20, bounds.y / 20, bounds.width / 20, bounds.height / 20);

        ctx.fillStyle = 'gray';
        for (o in objects) {
            entAttr = objects[o].getAttr();
            ctx.fillRect(entAttr.x / 20, entAttr.y / 20, 3, 3);
        }
    };

    var toString = function () {
        return '(' + bounds.x + ',' + bounds.y + ')' + '[' + bounds.width + ',' + bounds.height + ']';
    };

    return {
        clear: clear,
        insert: insert,
        retrieve: retrieve,
        drawTree: drawTree,
        toString: toString,
    };
}

function Car(attr) {
    // Player object
    attr = attr || {};

    var x = attr.x || 0;
    var y = attr.y || 0;
    var mass = attr.mass || 25000;
    var texture = attr.texture || 'dmc-12';
    var velX = attr.velX || 0;
    var velY = attr.velY || 0;
    var droplet = attr.droplet || false;
    var rotation = attr.rotation || 0;

    var width = 80;
    var height = 180;

    var maxVel = 80 * (80 / Math.sqrt(mass));

    var image = new Image();
    image.src = "image/car-" + texture + ".png";

    var halfPI = (Math.PI / 2);

    var getAttr = function () {
        return {
            x: x,
            y: y,
            mass: mass,
            texture: texture,
            velX: velX,
            velY: velY,
            rotation: rotation,
            maxVel: maxVel
        };
    };

    var setAttr = function (attr) {
        x = (attr.x !== undefined) ? attr.x : x;
        y = (attr.y !== undefined) ? attr.y : y;
        mass = (attr.mass !== undefined) ? attr.mass : mass;
        texture = (attr.texture !== undefined) ? attr.texture : texture;
        velX = (attr.velX !== undefined) ? attr.velX : velX;
        velY = (attr.velY !== undefined) ? attr.velY : velY;
        rotation = (attr.rotation !== undefined) ? attr.rotation : rotation;
    };

    var setRotation = function (value) {
        rotation = (value !== undefined) ? value : rotation;
    };

    var incMass = function (dMass) {
        // increasing mass
        mass += dMass;
        maxVel = 100 * (100 / Math.sqrt(mass));
    };

    var isCollided = function (rect) {
        // collision detection:
        // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection

        var rectAttr = rect.getAttr();
        return x < rectAttr.x + rectAttr.width &&
            x + width > rectAttr.x &&
            y < rectAttr.y + rectAttr.height &&
            height + y > rectAttr.y;
    };

    var getRadius = function () {
        // return half of the hypotenuses of the rect
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) / 2;
    };

    var draw = function (ctx, cam) {
        var camSize = cam.getSize();
        var camRealPos = cam.getRelPos(getAttr());

        //if outside Cam view
        if ((camRealPos.x + getRadius()) < 0 ||
            (camRealPos.y + getRadius()) < 0 ||
            (camRealPos.x - getRadius()) > camSize.width ||
            (camRealPos.y - getRadius()) > camSize.height) {
            return;
        }

        ctx.save();
        ctx.translate(camSize.width / 2, camSize.height / 2);
        ctx.rotate(rotation + halfPI); // render with 90 degree more rotated
        ctx.drawImage(image, -(width / 2), -(height / 2));
        ctx.translate(-(camSize.width / 2), -(camSize.height / 2));
        ctx.restore();
    };

    var getBounds = function () {
        return {
            x: x - (width / 2),
            y: y - (height / 2),
            width: width,
            height: height,
        };
    };

    var update = !droplet && function (dTime) {
        x += velX * dTime;
        y += velY * dTime;
    };

    return {
        getAttr: getAttr,
        setAttr: setAttr,
        setRotation: setRotation,
        incMass: incMass,
        isCollided: isCollided,
        draw: draw,
        getBounds: getBounds,
        update: update,
    };
}

var canvasEntId = "";
var canvasGridId = "";

var gameManager = (function () {
    var canvasGrid = null;
    var canvasEnt = null;
    var canvasQuadtree = null;
    var ctxGrid = null;
    var ctxEnt = null;
    var ctxQuadTree = null;
    var dTime = 1 / 60;
    var player = null;
    var entityBag = [];
    var qTree = null;
    var drwQuad = 0;

    var addEntity = function (ent) {
        entityBag.push(ent);
    };

    var removeEntity = function (ent) {
        var len = entityBag.length;
        var i = 0;

        for (i = 0; i < len; i += 1) {
            if (ent === entityBag[i]) {
                entityBag.splice(i, 1);
                return;
            }
        }
    };

    var init = function (cvsGridId, cvsEntId, cvsQuadtree) {
        canvasGrid = document.getElementById(cvsGridId);
        canvasGridId = cvsGridId;
        canvasEnt = document.getElementById(cvsEntId);
        canvasEntId = cvsEntId;
        canvasQuadtree = document.getElementById(cvsQuadtree);
        ctxGrid = canvasGrid.getContext('2d');
        ctxEnt = canvasEnt.getContext('2d');
        ctxQuadtree = canvasQuadtree.getContext('2d');

        fitToContainer(canvasGrid);
        fitToContainer(canvasEnt);

        ctxGrid.fillStyle = '#700459';
        ctxGrid.strokeStyle = '#FFFFFF';
        ctxGrid.lineWidth = 2;

        MouseHandler.init(document);

        qTree = new Quadtree(0, {x: 0, y: 0, width: 5000, height: 5000});

        player = new Car({
            x: 2500,
            y: 5000,
            texture: 'dmc-12',
            mass: 25000,
            velX: 500,
            velY: 1000
        });

        Camera.init(ctxEnt, player);

        addEntity(player);
        gameloop();
    };

    var handleInput = function () {
        if (MouseHandler.isMouseIn() === false) {
            player.setAttr({velX: 0, velY: 0});
            return;
        }

        var pAttr = player.getAttr();
        var rPlycamRealPos = Camera.getRelPos(player.getAttr());
        var mPos = MouseHandler.getPos();
        var dX = mPos.x - rPlycamRealPos.x;
        var dY = mPos.y - rPlycamRealPos.y;

        var vLength = Math.sqrt((dX * dX) + (dY * dY));

        var normX = dX / vLength;
        var normY = dY / vLength;

        var newVelX = normX * (pAttr.maxVel * vLength / 50);
        var newVelY = normY * (pAttr.maxVel * vLength / 50);

        player.setAttr({
            velX: newVelX,
            velY: newVelY
        });
    };

    var drawGrid = function () {
        var element = document.getElementById(canvasGridId);
        console.log("Grid resized [" + element.width + ", " + element.height + "]");
        ctxGrid = element.getContext('2d');

        var gridSize = 64;
        var camPos = Camera.getPos();
        var camSize = Camera.getSize();

        var start = Math.floor(camPos.x / gridSize);
        var relX = Camera.getRelPos({x: (start * gridSize), y: 0}).x;

        var numLines = camSize.width / gridSize;
        var i = 0;

        ctxGrid.fillRect(0, 0, canvasGrid.width, canvasGrid.height);

        for (i = 0; i < numLines; i += 1) {
            ctxGrid.beginPath();
            ctxGrid.moveTo(relX + (gridSize * i), 0);
            ctxGrid.lineTo(relX + (gridSize * i), camSize.height);
            ctxGrid.stroke();
        }

        start = Math.floor(camPos.y / gridSize);
        var relY = Camera.getRelPos({x: 0, y: (start * gridSize)}).y;
        numLines = camSize.height / gridSize;

        for (i = 0; i < numLines; i += 1) {
            ctxGrid.beginPath();
            ctxGrid.moveTo(0, relY + (gridSize * i));
            ctxGrid.lineTo(camSize.width, relY + (gridSize * i));
            ctxGrid.stroke();
        }
    };

    var handleCollisions = function () {
        var possibleColl = [];
        var collisions = [];
        var coll = null;
        var ent = null;
        var plyMass = player.getAttr().mass
        var entMass = 0;

        qTree.clear();
        for (ent in entityBag) {
            qTree.insert(entityBag[ent]);
        }

        possibleColl = qTree.retrieve([], player);

        while (ent = possibleColl.pop()) {

            if (player.isCollided(ent)) {
                entMass = ent.getAttr().mass;

                if (plyMass > (1.5 * entMass)) {
                    removeEntity(ent);
                    player.incMass(entMass);
                }
            }

            var entAttr = ent.getAttr();
            ctxQuadtree.fillStyle = 'green';
            ctxQuadtree.fillRect(entAttr.x / 20, entAttr.y / 20, 3, 3);
        }
    };

    var fitToContainer = function (canvas) {
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    };

    var gameloop = function () {
        var len = entityBag.length;
        var i = 0;
        var ent = null;

        handleInput();
        Camera.update();

        drawGrid();

        if (drwQuad === 5) {
            ctxQuadtree.fillStyle = 'white';
            ctxQuadtree.fillRect(0, 0, 250, 250);
            qTree.drawTree(ctxQuadtree);
            drwQuad = 0;
        }
        drwQuad += 1;

        ctxEnt.clearRect(0, 0, canvasEnt.width, canvasEnt.height)

        for (i = 0; i < len; i += 1) {
            ent = entityBag[i];

            if (ent.update) {
                ent.update(dTime);
            }

            if (ent.draw) {
                ent.draw(ctxEnt, Camera);
            }
        }

        handleCollisions();

        setTimeout(gameloop, dTime * 1000);
    };

    return {
        init: init,
        addEntity: addEntity,
        removeEntity: removeEntity
    };
}());

var Camera = (function () {
    var x = 0;
    var y = 0;
    var width = 0;
    var height = 0;
    var ctx = null;
    var player = null;

    var init = function (_ctx, _player) {
        ctx = _ctx;
        player = _player;
        width = ctx.canvas.width;
        height = ctx.canvas.height;
    };

    var update = function () {
        var element = document.getElementById(canvasEntId);
        console.log("Camera resized [" + element.width + ", " + element.height + "]");
        ctx = element.getContext('2d');

        width = ctx.canvas.width;
        height = ctx.canvas.height;
        var playerAttr = player.getAttr();

        // rotation degree in radian
        var targetY = MouseHandler.getPos().y - (height / 2);
        var targetX = MouseHandler.getPos().x - (width / 2);
        var rotation = Math.atan2(targetY, targetX);
        player.setRotation(rotation);

        width = ctx.canvas.width;
        height = ctx.canvas.height;

        x = (playerAttr.x - width / 2);
        y = (playerAttr.y - height / 2);
    };

    var getRelPos = function (entAttr) {

        var relX = entAttr.x - x;
        var relY = entAttr.y - y;

        return {
            x: relX,
            y: relY
        };
    };

    var getPos = function () {
        return {
            x: x,
            y: y
        };
    };

    var getSize = function () {
        return {
            width: width,
            height: height
        };
    };

    return {
        init: init,
        update: update,
        getRelPos: getRelPos,
        getPos: getPos,
        getSize: getSize
    };
}());

var i = 0;
var space = 70;

gameManager.init('canvas1', 'canvas2', 'canvas3');
