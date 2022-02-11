function cursorFade() {
    jQuery('.cursor').fadeIn('slow').fadeOut('slow', cursorFade);
}
var downloadingImage = new Image();

var current, newString, added, strings, bg, windowWidth, windowHeight,bgHolder;

jQuery(document).ready(function () {
    cursorFade();
    removeString();

    var image = jQuery('.preload-image');
    var datasrc = image.data('src');
    if(typeof datasrc != "undefined") {
        downloadingImage.src = datasrc;
        downloadingImage.onload = function () {
            image.src = datasrc;
        };
    }

    bg = jQuery('.background-image');
    bgHolder =jQuery('.slider_container');
    windowWidth = window.innerWidth / 10;
    windowHeight = window.innerHeight / 10;

    bgHolder.mousemove(function (e) {
        var mouseX = e.clientX / 10;
        var mouseY = e.clientY / 10;
        console.log('translate3d(-' + mouseX + ', -' + mouseY + ', 0)');
        bg.css('transform', 'translate3d(-' + mouseX + 'px, -' + mouseY + 'px, 0)');

    });



    current = jQuery('.typing').text();
    newString = "";
    added = 0;
    strings = ["Interactive", "Sharable", "Beautiful", "Immersive", "Engaging", "Impressive", "A great showcase", "A step into a new reality", "Fun"];

});

jQuery(window).on('load',function () {
    jQuery('.loader').addClass('hide');
});


function removeString() {
    current = jQuery('.typing').text();
    if(typeof current != "undefined" && current.length > 0) {
        current = current.substring(0, current.length-1);
        jQuery('.typing').text(current)
        setTimeout(removeString, 100);
    } else {
        newString = strings[Math.floor(Math.random() * strings.length)];
        addString();
    }
}

function addString() {
    if(added < newString.length) {
        content = newString.substr(0, added+1)
        jQuery('.typing').text(content);
        added++;
        setTimeout(addString, 100);
    } else {
        newString = "";
        added = 0;
        setTimeout(removeString, 700)
    }
}