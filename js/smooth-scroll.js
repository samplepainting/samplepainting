

$(function() {
    if (location.hash) {
        setTimeout(function() {
            window.scrollTo(0, 0);
        }, 1);
        setTimeout(function () {
            var $target = $(location.hash);
            if ($target.length == 0) {
                $target = $('[name=' + location.hash.slice(1) + ']');
            }
            if ($('[class*="_masonry-gallery"]').length > 0) {
                var waitForMasonry = setInterval(function() {
                    var masonryGalleries = $('[class*="_masonry-gallery"]');
                    var ready = true;
                    for (var i = 0; i < masonryGalleries.length; i++) {
                        if ($(masonryGalleries[i]).find('[data-wookmark-id="0"]').length == 0) {
                            ready = false;
                        }
                    }
                    if (ready) {
                        doSmoothScroll($target, camilyo.inPageTime);
                        clearInterval(waitForMasonry);
                    }
                }, 50);
            } else {
                    doSmoothScroll($target, camilyo.inPageTime);
            }

        }, 250);
    }
});


function filterPath(string) {
    return string
        .replace(/^\//, '')
        .replace(/(index|default).[a-zA-Z]{3,4}$/, '')
        .replace(/\/$/, '');
}

function scroolSmooth(item, time) {
    if (filterPath(location.pathname) == filterPath(item.pathname)
        && location.hostname == item.hostname
        && item.hash.replace(/#/, '')) {
        if ($.pageslide) {
            $.pageslide.close();
        }
        var $targetId = $(item.hash), $targetAnchor = $('[name=' + item.hash.slice(1) + ']');
        var $target = $targetId.length ? $targetId : $targetAnchor.length ? $targetAnchor : false;
        var hash = item.hash;
        doSmoothScroll($target, time, hash);          
        return true;
    }
    return false;

}

function doSmoothScroll($target, time, hash) {
    if ($target) {
        var targetOffset = $target.offset().top;
        if ($('.HeaderExternal_wp_outer').filter(":visible").css('position') == 'fixed') {
            targetOffset = targetOffset - $('.HeaderExternal_wp_outer').filter(":visible").height();
        }

        $('html, body').animate({ scrollTop: targetOffset }, time);
        if (hash) {
            window.location.hash = hash;
        }
    }
}


