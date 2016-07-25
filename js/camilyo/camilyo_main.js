//var camilyo = { };
var $mainContent;
var transitions;

$(document).ready(function () {
    // init members
    $mainContent = $('#Content');
    if ($mainContent.length == 0) {
        $mainContent = $('.Content_wp_outer').filter(":visible");
    }
    // init multi-level menu item events
    $('.mlhmenu').mouseenter(function () {
        $(this).parents('.wp_first_col').not('[class*="MainColumns"]').css('overflow', 'visible');
    })
    .mouseleave(function () {
        $(this).parents('.wp_first_col').not('[class*="MainColumns"]').css('overflow', 'hidden');
    });
    // bind resize evet
    $(window).resize(onWindowResize);
    // do layout
    if (typeof (window.initLayout) == 'function') {
        initLayout();
    }
    // after images are loaded
    $('#msgwebcontainer').waitForImages(function () {
        // init sticky panels
        initStickyPanels(); 
    });
    // init transition
    if (transitions) {
        initTransitions();
    }
});

function onWindowResize() {
    fixLayoutOnWindowResize();
}

function GetUrlParameters(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null) {
        return "";
    } else {
        return results[1];
    }
}

$.fn.scrollView = function (iDelay) {
    return this.each(function () {
        $('html, body').animate({
            scrollTop: $(this).offset().top
        }, iDelay);
    });
}

function jumpTo(id) {
    if (id.indexOf('#') != 0) {
        id = '#' + id;
    }
    var $form = $(id);
    if (!isElementInViewport($form)) {
        $form.scrollView(800);
    }
}

function isElementInViewport(el) {

    //special bonus for those using jQuery
    if (el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
}


/*
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) { return i; }
        }
        return -1;
    }
}*/