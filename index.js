$(document).ready(function () {
    startLogoAnimation(1);
});

function startLogoAnimation(index) {
    var image = $("#image-" + index);
    image.fadeIn(500 * index, function () {
        if (index <= 3) {
            startLogoAnimation(index + 1);
        }
    });
}