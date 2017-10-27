var canvasBg = document.getElementById('game');
var ctxGame = canvasBg.getContext('2d');
var counter = 0;

var mouse = {
    x: 0,
    y: 0
};

var player = new Player();
var playerImage = new Image();
playerImage.src = "image/car-dmc-12.png";

window.addEventListener('load', function () {
    setInterval(loop, 1000 / 60);
    canvasBg.addEventListener('mousemove', function (evt) {
        var m = getMousePos(canvasBg, evt);
        mouse.x = m.x;
        mouse.y = m.y;
    }, false);
}, false);

function Player() {
    this.x = 400;
    this.y = 250;
    this.width = 80;
    this.height = 170;
}

function loop() {
    var targetX = mouse.x - player.x;
    var targetY = mouse.y - player.y;
    var rotation = Math.atan2(targetY, targetX);
    ctxGame.clearRect(0, 0, canvasBg.width, canvasBg.height);
    player.draw(rotation);
    ctxGame.fillStyle = "hsla(0, 0%, 0%, 0.5)";
    ctxGame.font = "bold 12px Helvetica";
    ctxGame.fillText("mouse x: " + mouse.x + " ~ mouse y:" + mouse.y + " ~ rotation: " + rotation, 30, 30);
}

Player.prototype.draw = function (rotation) {
    ctxGame.save();
    ctxGame.translate(this.x, this.y);
    ctxGame.rotate(rotation + degreeToRad(90));
    ctxGame.drawImage(playerImage, -40, -85);
    ctxGame.translate(-this.x, -this.y);
    ctxGame.restore();
};

function id(i) {
    return document.getElementById(i);
}

function degreeToRad(degree) {
    return degree * (Math.PI / 180);
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    var mouseX = evt.clientX - rect.top;
    var mouseY = evt.clientY - rect.left;
    return {
        x: mouseX,
        y: mouseY
    };
}