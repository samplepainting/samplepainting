// this file handel expand content and background og a componennt (first level)





var resizeAndZoomAtached = false;
$(function () {
    msgExpand();

});


function msgExpand() {
    if (!resizeAndZoomAtached) {
        var resizeTimeout;
  $(window).resize(function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function () {
    msgExpand();
      }, 200);
  });

  $(window).on('zoom', function () {
   msgExpand();
  });
        resizeAndZoomAtached = true;
    }
    expandContent();
    expandBackground();
};

//expand all componennt to whole page with consideraton of margin 
function expandContent() {
    
    var comps = $("div[data-expand='content']");
    comps.css("margin-left", "").css("width","").css("margin-right","");
    if (comps.length > 0) {
        $('.MainColumns_wp_outer > .wp_first_col').css('overflow', 'visible');
    }
    var leftSection = $('.Left_wp_outer');
    var rightSection = $('.Right_wp_outer');
    var studionNotPinnedNew = false;
    var leftVertical = leftSection.length > 0 && leftSection.css('position') == 'fixed' && $('#msgwebcontainer').css('padding-left') == leftSection.outerWidth()+'px';
    var rightVertical = rightSection.length > 0 && rightSection.css('position') == 'fixed' && $('#msgwebcontainer').css('padding-right') == rightSection.outerWidth()+'px';
    comps.each(function () {
	    var fullWidth = $(window).width();
        var isStudio = $(this).attr('iscomp') || $('#dRightPane').length > 0;
        if (isStudio) {
            fullWidth = $('#design').width();
            if ($('#dMenuBar').is(':visible') && $('#design').width() == $(window).width()) {
                fullWidth = fullWidth - 70;
                studionNotPinnedNew = true;
            }
        }
        if (leftVertical) {
            fullWidth = fullWidth - leftSection.outerWidth();
        }
        if (rightVertical) {
            fullWidth = fullWidth - rightSection.outerWidth();
        }
        var oLeft = $(this).offset().left;
        if (isStudio) {
            oLeft = oLeft - $('#design').offset().left;
        }
        if (leftVertical) {
            oLeft = oLeft - leftSection.outerWidth();
            if (studionNotPinnedNew) {
                oLeft -= 70;
            }
        }
        var oRight = oLeft + $(this).outerWidth();

        if (rightVertical) {
            //oRight = oRight - rightSection.outerWidth();
            if (studionNotPinnedNew) {
                oRight -= 70;
            }
        }
        var marfinsSum = parseInt($(this).css('margin-left')) + parseInt($(this).css('margin-right'));

        oLeft = oLeft - 2 * parseInt($(this).css('margin-left'));
        var dock = 0;
        if (isStudio && $('#design').offset().left > 0) {
            if ($('#dMenuBar').is(':visible')) {
                dock = 346;
            } else {
                dock = 276;
            }
        }
        oRight = fullWidth  - (oRight +2*(parseInt($(this).css('margin-right'))));
        if ((isStudio && $('#design').css('direction') == 'rtl') || $('#msgwebcontainer').css('direction') == 'rtl') {
            $(this).css('margin-right', - +oRight + 'px');
        } else {
            $(this).css('margin-left', - +oLeft + 'px');
        }
        var widthToSet = fullWidth - marfinsSum;
        if (isStudio) {
            $(this).outerWidth(widthToSet);
        } else {
            $(this).width(widthToSet);
        }
    });


};


//expaend only background of a componennt
function expandBackground() {
    var comps = $("div[data-expand='background']");
    if (comps.length > 0) {
        $('.MainColumns_wp_outer > .wp_first_col').css('overflow', 'visible');
    }
    var fullWidth = $(window).width();
    var leftSection = $('.Left_wp_outer');
    var rightSection = $('.Right_wp_outer');
    var leftVertical = leftSection.length > 0 && leftSection.css('position') == 'fixed' && $('#msgwebcontainer').css('padding-left') == leftSection.outerWidth() + 'px';
    var rightVertical = rightSection.length > 0 && rightSection.css('position') == 'fixed' && $('#msgwebcontainer').css('padding-right') == rightSection.outerWidth()+'px';
    if (leftVertical || rightVertical) {
        fullWidth = fullWidth;//- leftSection.width() - rightSection.width();
    }
    comps.each(function () {

        var $bgOuter = $(this).parent();
        if ($bgOuter.hasClass('dropzone')) {
            $bgOuter = $bgOuter.parent();
        }
        if ($bgOuter.hasClass('swp_outer_bg')) {
            $bgOuter.removeAttr('style');
            $(this).css('margin-top', '').css('margin-bottom', '');			
            var oLeft = $(this).offset().left;
            var oRight = fullWidth - (oLeft + $(this).outerWidth());
            //oLeft = oLeft - parseInt($(this).css('margin-left'));
            if ($('#dDesign').length > 0) {
                oLeft = oLeft - $('#dDesign').offset().left;
            }
            if (leftVertical) {
                oLeft = oLeft - leftSection.outerWidth();
            }
            if (rightVertical) {
                oRight = oRight - rightSection.outerWidth();
            }
            $bgOuter.css('margin-left', -oLeft + 'px');
            $bgOuter.css('margin-right', -oRight + 'px');
            $bgOuter.css('padding-left', oLeft + 'px');
            $bgOuter.css('padding-right', oRight + 'px');
            $bgOuter.css('padding-right', oRight + 'px');
            if ($bgOuter.find('video').length > 0) {
                $bgOuter.css('position', 'relative');
            }
            $(this).css('background', '').css('background-image', '');

            //$bgOuter.css('background', $(this).css('background'));
            $bgOuter.css('background-color', $(this).css('background-color'));
            $bgOuter.css('z-index', 1);
            if($(this).attr('id').indexOf('textrotator')>-1){
                $bgOuter.css('overflow-x', 'hidden');
            }
            $bgOuter.css('background-image', $(this).css('background-image'));
            $bgOuter.css('background-repeat', $(this).css('background-repeat'));
            $bgOuter.css('background-position', $(this).css('background-position'));
            $bgOuter.css('background-attachment', $(this).css('background-attachment'));
            $bgOuter.css('background-size', $(this).css('background-size'));
            $bgOuter.css('gradient-background', $(this).css('gradient-background'));
            $bgOuter.css('margin-top', $(this).css('margin-top')).css('margin-bottom', $(this).css('margin-bottom'));
            $(this).css('margin-top', '0').css('margin-bottom', '0');
//            if ($(this).attr('id').indexOf('column') > -1) {
//                $(this).css('width', $bgOuter.width());
//            }
            $(this).css('background', 'none').css('background-image', 'none');

            if ($bgOuter.children('.background-div-halper-first').length > 0) {
                $bgOuter.children('.background-div-halper-first').width($bgOuter.outerWidth()).height($bgOuter.outerHeight());
                $bgOuter.children('.background-div-halper-second').width($bgOuter.outerWidth()).height($bgOuter.outerHeight());
                $bgOuter.css('background-image', 'none').css('position', 'relative');

            }
        }
       

    });




};
