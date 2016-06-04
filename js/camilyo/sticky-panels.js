var panels;

function initStickyPanels(resetCss) {
    // init params
    var zIndex = 100000;
    var $center = $('[id="' + (camilyo.bgStyle == 'Centered' ? 'Center' : 'Content')+'"]');
    if ($center.length == 0 && camilyo.bgStyle != 'Centered') {
        $center = $('[id$="MainContent"]').filter(":visible");
    }
    var $content = $('[id$="Content"]').filter(":visible");
    if ($content.length == 0) {
        $content = $('[id$="MainContent"]').filter(":visible");
    }
    var sMiddle = camilyo.bgStyle != 'Wide' ? 'Middle' : 'MiddleExternal';
    var $middle = $('[id$="' + sMiddle + '"]').filter(":visible");
    // calculate ALL positions before applying so it will not effect one another
    panels = {};
    var panelCss;
    var $box;
    var changes = [];
    $.each(camilyo.stickyPanels, function (i, key) {
        $box = $('[id$="' + key + '"]').filter(":visible");
        if ($box.length == 0) {
            $box = $('#Master' + key);
        }
        if (resetCss && camilyo.bgStyle == 'Wide' && key != 'Right' && key != 'Left') {
            $box.css('height', '');
            $box.css('position', '');
            $box.css('width', '');
        }
   
        if ($box.length == 0) return;
        // base position - same for all panels
        panelCss = {
            width: $box.outerWidth(),
            height: camilyo.bgStyle != 'Vertical' || (key!='Left' && key!='Right')?$box.outerHeight():'',
            position: 'fixed',
            'z-index': zIndex
        };
        // specific positioning by panel type
        switch (key) {
            case 'Header':
            case 'HeaderExternal':
                panelCss.top = 0;
                if (camilyo.platform == 'MOBILE' || camilyo.platform == 'TABLET') {
                    panelCss.left = 0;
                }
                changes.push({ $el: $middle, style: 'margin-top', value: panelCss.height });
                break;
            case 'Footer':
            case 'FooterExternal':
                panelCss.bottom = 0;
                if (camilyo.platform == 'MOBILE' || camilyo.platform == 'TABLET') {
                    panelCss.left = 0;
                }
                changes.push({ $el: $middle, style: 'margin-bottom', value: panelCss.height });
                break;
            case 'Left':
                if (camilyo.bgStyle != 'Vertical') {
                    panelCss.left = $box.offset().left,
                    panelCss.width = $box.outerWidth();
                    changes.push({ $el: $center, style: 'margin-left', value: panelCss.width });
                } else {
                    panelCss.left = 0;
                    panelCss.top = 0;
                    panelCss["overflow-y"] = 'auto';
                }
                break;
            case 'Right':
                if (camilyo.bgStyle != 'Vertical') {
                    panelCss.left = $box.offset().left,
                    panelCss.width = $box.outerWidth();
                    changes.push({ $el: $center, style: 'margin-right', value: panelCss.width });
                    break;
                } else {
                    panelCss.right = 0;
                    panelCss.top = 0;
                    panelCss["overflow-y"] = 'auto';
                }
                break;
            case 'ContentTop':
                panelCss.top = $('[id$="HeaderExternal"]').filter(":visible").length == 1 ? $('[id$="HeaderExternal"]').filter(":visible").outerHeight() : 0;
                changes.push({ $el: $content, style: 'padding-top', value: panelCss.height });
                break;
            case 'ContentBottom':
                panelCss.bottom = $('[id$="FooterExternal"]').filter(":visible").length == 1 ? $('[id$="FooterExternal"]').filter(":visible").outerHeight() : 0;
                changes.push({ $el: $content, style: 'padding-bottom', value: panelCss.height });
                break;
        }
        // store panel data
        panels[key] = panelCss;
    });
    // if content bottom exists and not sticky - fix main content padding
    fixContentBottom();
    // apply global changes
    for (var i = 0; i < changes.length; i++) {
        var change = changes[i];
        change.$el.css(change.style, change.value);
    }
    // apply positions
    for (var posKey in panels) {
        panelCss = panels[posKey];
        $box = $('[id$="' + posKey + '"]').filter(":visible");
        if ($box.length == 0) {
            $box = $('#Master' + posKey);
        }
        $box.css(panelCss);
    }
    if (bPrintStickyPanelsLog) {
        printStickyPanels();
    }
}

function fixContentBottom() {
    var $content = $('[id$="Content"]').filter(":visible");
    if ($content.length == 0) {
        $content = $('[id$="MainContent"]').filter(":visible");
    }
    var $cb = $('[id$="ContentBottom"]').filter(":visible");
    if ($cb.length == 0) {
        $cb = $('[id$="MasterContentBottom"]').filter(":visible");
    }
    if ($cb.length == 1 && $cb.css("position") != "relative" && camilyo.stickyPanels.indexOf('ContentBottom') == -1) {
        setTimeout(function () {
            $content.css({ 'padding-bottom': $cb.outerHeight() });
        }, 0);
    }
};


function clearStickPanels() {
    for (var posKey in panels) {
        var $box = $('[id$="' + posKey + '"]').filter(":visible");
        if ($box.length == 0) {
            $box = $('#Master' + posKey);
        }
        for (var style in panels[posKey]) {
            $box.css(style, '');			
        }
    }
};

var supportsOrientationChange = "onorientationchange" in window;
var orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

if (window.addEventListener) {
    window.addEventListener(orientationEvent, function () {
        setTimeout(function () {
            clearStickPanels();
            initStickyPanels();
			if (typeof (window.msgExpand) == 'function') {
                msgExpand();
            }
        }, 300);
    }, false);
}

var bPrintStickyPanelsLog = false;

function printStickyPanels() {
    var $log = $('[name=log]');
    if ($log.length == 0) {
        $log = $('<div name="log" style="position:fixed;bottom:0;width:100%;height:50%;overflow:auto;direction:ltr;background-color:white;color:black;text-align:left;"></div>');
        $log.appendTo('body');
    }
    var posHtml = '';
    var domHtml = '';
    for (var posKey in panels) {
        posHtml += posKey + ': ';
        for (var style in panels[posKey]) {
            posHtml += style + ':' + panels[posKey][style] + ';';
        }
        posHtml += '<br></br>'
        var $box = $('#Master' + posKey);
        domHtml += 'width:' + $box.outerWidth() + ';height:' + $box.outerHeight() + ';top:' + $box.offset().top + ';left:' + $box.position().left;
        domHtml += '<br></br>'
    }
    $log.append('Calculated Pos:<br></br>');
    $log.append(posHtml)
    $log.append('<br></br>Dom Pos:<br></br>');
    $log.append(domHtml)
}
