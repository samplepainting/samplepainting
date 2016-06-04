$(function () {
    backgroundGalleryTransitions(true);

});


function backgroundGalleryTransitions(bindEvent) {
    if($.browser && $.browser.msie && parseFloat($.browser.version) < 10){
		return;
	}
    $.each($('body').find('[class*="wp_outer"]'), function () {
        if (window['item_' + $(this).attr("id")] || this['item_' + $(this).attr("id")]) {

            var getImageAsCssValue = function(str) {
                if (str.indexOf('url') == -1) {
                    return "url(" + str + ")";
                } else {
                    return str.replace(/"/g, '');
                }
            };

            var getImageAsSrcValue = function(str) {
                if (str.indexOf('url(') == 0 && str.indexOf(')') == str.length - 1) {
                    return str.replace(/"/g, '').substring(4, str.length - 1);
                } else {
                    return str;
                }
            };

            var comp = this;
            if (!$(comp).is(":visible")) {
                return;
            }
            var $backgroundDiv = $('<div class="background-div-halper-first"></div>');
            var $backgroundDivSecond = $('<div class="background-div-halper-second"></div>');
            var imagesArr = window['item_' + $(this).attr("id")];
            if (!imagesArr) {
                imagesArr = this['item_' + $(this).attr("id")];
            }
            var images = (imagesArr[0] instanceof Array) ? imagesArr[0] : imagesArr;
            var fadeTime = (imagesArr[0] instanceof Array) ? imagesArr[1] : 0;
            fadeTime = fadeTime == 0 ? 3000 : fadeTime + 2000;
            var isChromeOrOldIe = /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
            if (isChromeOrOldIe) {

                setTimeout(function() {
                    if ($(comp).parent().hasClass("swp_outer_bg")) {
                        $(comp).parent().addClass('background-image-change');
                    } else {
                        $(comp).addClass('background-image-change');
                    }
                }, 0);
            } else {
                var $backgroundDiv = $('<div class="background-div-halper-first"></div>');
                var $backgroundDivSecond = $('<div class="background-div-halper-second"></div>');
            }
            var imgtmp = null;
            if ($(comp).parent().hasClass("swp_outer_bg")) {
                	imgtmp = $(comp).parent().css('background-image');		
            } 
	        if ((imgtmp == null) || (imgtmp == "none")) {
                  imgtmp = $(comp).css('background-image');
            }
            if ((imgtmp != null) && (imgtmp != "none")) {
	    	    images.push(imgtmp);
            }
            for (var x = 0; x < images.length; x++) {
                var loadImg = new Image(10, 10);
                loadImg.src = getImageAsSrcValue(images[x]);
            }
            if (!isChromeOrOldIe) {
                if ($(comp).parent().hasClass("swp_outer_bg")) {
                    setGalleryHalperDivStyles($backgroundDiv.add($backgroundDivSecond), $(comp).parent());
                    $backgroundDiv.add($backgroundDivSecond).width($(comp).parent().outerWidth()).height($(comp).outerHeight());
                    $(comp).parent().css('position', 'relative').append($backgroundDiv).append($backgroundDivSecond);

                } else {
                    setGalleryHalperDivStyles($backgroundDiv.add($backgroundDivSecond), $(comp));
                    $backgroundDiv.add($backgroundDivSecond).width('100%').height('100%');
                    if ($(comp).css('position') != 'fixed') {
                        $(comp).css('position', 'relative');
                    }
                    $(comp).append($backgroundDiv).append($backgroundDivSecond);

                }
            }

            var i = 0;
            var count = images.length;
            if (bindEvent) {
                setInterval(function() {
                    var img = getImageAsCssValue(images[i % count]);
                    /*if (img.indexOf('url') == -1) {
                        img = "url(" + img + ")";
                    }*/
                    if (!isChromeOrOldIe) {
                        if ($backgroundDiv.css('opacity') == 1) {
                            $backgroundDivSecond.css('background-image', img);
                            $backgroundDiv.css('opacity', 0);
                            $backgroundDivSecond.css('opacity', 1);
                        } else {

                            $backgroundDiv.css('background-image', img);
                            $backgroundDiv.css('opacity', 1);
                            $backgroundDivSecond.css('opacity', 0);
                        }
                    } else {
                        if ($(comp).parent().hasClass("swp_outer_bg")) {
                            $(comp).parent().css('background-image', img);
                        } else {
                            $(comp).css('background-image', img);
                        }
                    }
                    i++;
                }, fadeTime);
            }
        }

    });
}

function setGalleryHalperDivStyles($backgroundDiv, $comp) {
    $backgroundDiv.css('background-color', $comp.css('background-color'));
    $backgroundDiv.css('background-image', $comp.css('background-image'));
    $backgroundDiv.css('background-repeat', $comp.css('background-repeat'));
    $backgroundDiv.css('background-position', $comp.css('background-position'));
    $backgroundDiv.css('background-attachment', $comp.css('background-attachment'));
    $backgroundDiv.css('background-size', $comp.css('background-size'));
    $backgroundDiv.css('gradient-background', $comp.css('gradient-background'));
    $comp.css('background-image', 'none').css('background', 'none').css('z-index', '1');
};

