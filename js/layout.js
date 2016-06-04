// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
        var k;
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = +fromIndex || 0;

        if (Math.abs(n) === Infinity) {
            n = 0;
        }
        if (n >= len) {
            return -1;
        }
        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
        while (k < len) {
            if (k in O && O[k] === searchElement) {
                return k;
            }
            k++;
        }
        return -1;
    };
}

function initLayout() {
    var $body = $('body');
    var $msg = $('#msgwebcontainer');
    var direction = $body.attr('direction');
    if (direction == 'rtl') {
        $msg.css('direction', 'rtl');
        $body.css('direction', 'ltr');
    }
    switch (camilyo.bgStyle) {
        case 'Vertiacl':
        case 'Centered':
//            $('html').css('height', '100%');
            $('body.msgbody').css({
                'box-sizing': 'border-box',
                '-webkit-box-sizing': 'border-box',
                '-moz-box-sizing': 'border-box',
                '-ms-box-sizing': 'border-box',
                '-o-box-sizing': 'border-box'
            });
            //    $('body.msgbody').css({'box-sizing': 'border-box', padding: '40px 0'});
            $('#msgwebcontainer').css('height', '100%');
            $('body').css('height', '100%');
            break;
        case 'Wide':
            $('html').css('height', '100%');
            $('body.msgbody').css('height', '100%');
//            fixFooterHeight();
            if (camilyo.stickyPanels.indexOf('Footer') != -1) {
                $('html').css('height', '');
            }
            break;
        default:
            break;
    }
    fixLayoutOnWindowResize();
}

function fixFooterHeight() {
    var $footer = $('#FooterExternal');
    if ($footer.length == 0) {
        $footer = $('.FooterExternal_wp_outer').filter(":visible");
    }
    $footer.css('height', '');
    var footerHeight = $footer.outerHeight();
    var footerBottom = $footer.position().top + footerHeight;
    var bodyHeight = $('body.msgbody').outerHeight();
    if (footerBottom < bodyHeight) {
        footerHeight = footerHeight + bodyHeight - footerBottom;
        $footer.css('height', footerHeight);
    }
}

function fixLayoutOnWindowResize() {
    switch (camilyo.bgStyle) {
        case 'Vertical':
        case 'Centered':
            var $body = $('body.msgbody');
            if ($('html').get(0).scrollHeight > $('html').get(0).clientHeight) {
                $body.css('height', '');
            }
            else {
                $body.css('height', '100%');
            }
            break;
        case 'Wide':
            $('html').css('height', '100%');
//            fixFooterHeight();
            if (camilyo.stickyPanels.indexOf('Footer') != -1) {
                $('html').css('height', '');
            }
            break;
        default:
            break;
    }
}

