var sShowIconUrl = '/web/handlers/ImageGalleryHandler.ashx' + "?action=showicon&img=";
var sShowImageUrl = '/web/handlers/ImageGalleryHandler.ashx' + "?action=showimage&img=";
var resultOfPageJs;
var holderMode = true;
var isTransitioning = false;
var blogNewOrd;
var isBlogTransition;
var isInnerBlogPage;
var ms_cssFiles = {};

function initTransitions() {
    $('#msgwebcontainer').find('[page][page!=' + transitions.currPageOrd + '][page!=' + transitions.pages[transitions.currPageOrd].masterOrd + ']').waitForImages(function () {
        $(this).hide().css('z-index', '');
    });
    $('body').append('<div class="transition_modal"><img src="/static-images/mobeepreview/msgloading.gif"></div>');
    $('.transition_modal').hide();
    var data = { pageOrd: transitions.currPageOrd, href: transitions.pages[transitions.currPageOrd].title };
    if (history.replaceState) {
    history.replaceState(data, transitions.pages[transitions.currPageOrd].friendlyTitle, window.location.href);
    }
    window.addEventListener('popstate', function (event) {
        if (event.state) {
            doTransition(event.state.pageOrd, null, (event.state.href));
        }
    });
}

function doTransition(pageOrd, menuItem, href) {

    //check if the previous transition is already finished, othewise do nothing.
    if (isTransitioning) {
        return false;
    } else {
        isTransitioning = true;
    }
    var currConf = transitions.pages[transitions.currPageOrd];
    var newConf = transitions.pages[pageOrd];
    var fullPageUrl = window.location.href;

    //special hendling in case of blog
    checkForBlogInnerUrl(currConf, fullPageUrl);
    var blogUrl = setIsInsideBlogTransition(menuItem, fullPageUrl);

    //in case we try to go to the same page
    if (!checkIfSamePage(pageOrd, menuItem)) {
        return false;
    };

    //background transitions adjusment
    $('body').find('[class*="wp_outer"]').removeClass('background-image-change');
  
    //more blog handeling
    if (isInnerBlogPage) {
        if (menuItem == null) {
            newConf = updateNewConf(currConf, newConf, fullPageUrl, menuItem);
        } else {
            currConf = updateNewConf(currConf, newConf, fullPageUrl, menuItem);
        }
    }
    if (isBlogTransition) {
        newConf = getNewConfForBlogPage(newConf, menuItem);
    }

    //backword competibility
    if ($('#MiddleExternal').length > 0 && currConf.masterOrd != newConf.masterOrd) {
        isTransitioning = false;
        if (!($(menuItem).attr('href'))) {
            window.open(newConf.title, '_self');
        }
        return true;
    }
    //in case it the first transition we need to wrap the page
    handleFirstPage(currConf);

    //check if need a master page change, and if so do preperations for the change 
    var changeMaster =  masterPageChangeHandaling(currConf, newConf);
    var currPage = $('#page' + currConf.pageOrd);

    handleBrowserUrlAndPageName(newConf, menuItem, blogUrl);

    //side panel close 
    if ($.pageslide) {
        $.pageslide.close();
    }

    if (!menuItem) {
        menuItem = $('a[onclick*="doTransition(' + newConf.pageOrd + ',"]')[0];
    }

    handleMenuSelected(currConf, newConf, changeMaster, menuItem);
    var url = getUrlForAjax(menuItem, blogUrl, newConf, href);

    //case where the page is already inside the dom
    if ($('#page' + newConf.pageOrd).length > 0) {
        makeTransition(currPage, $('#page' + newConf.pageOrd), changeMaster, newConf.masterOrd, currConf.masterOrd, function () {
            var shref = $(menuItem).attr('href');
            if (typeof (window.msgExpand) == 'function') {
                msgExpand();
            }
            initStickyPanels();
            scrollToElem(shref);
            isTransitioning = false;
        });
        transitions.currPageOrd = isBlogTransition ? blogNewOrd : pageOrd;
        $.get(removeBad(url) + '?dontRender=true');
        return false;
    }

    if (window.premptivePages && window.premptivePages[newConf.pageOrd]) {
        doExtualTransition(premptivePages[newConf.pageOrd], currConf, newConf, menuItem, changeMaster);
        //$('.transition_modal').hide();
    } else {
        var transitionOpt;
        if (changeMaster) {
            transitionOpt = { 'isFullTransition': true };
        } else {
            transitionOpt = { 'isTransition': true };
        }
        $('.transition_modal').show();
        var options =
        {
            type: "GET",
            url: url,
            data: transitionOpt,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: true,
            success: function(response) {
                doExtualTransition(response, currConf, newConf, menuItem, changeMaster);
                //$('.transition_modal').hide();
            },
            error: function(response) {
                isTransitioning = false;
            }
        };
        jQuery.ajax(options);
    }
    transitions.currPageOrd = isBlogTransition ? blogNewOrd : pageOrd;
    return false;
}


function addOrUpdateStyleTagForTransitions(res, contentStr, currConf, newConf, changeMaster, menuItem) {
    var runTransitionsFunc = false;
    for (var i = 0; i <res.Css.length; i++) {
        var $styleTag = $(res.Css[i]);
        if ($('head').find('[id^="camilyo_palettes"]').length > 0) {
            if ($styleTag.attr('id').indexOf('camilyo_mp') == 0) {
                if (!changeMaster) {
                    continue;
                } else {
                    var mp_css = $('head').find('[id^="camilyo_mp"]');
                    $('head').append($styleTag);
                    setTimeout(function() {
                        mp_css.remove();
                    }, 4500);
                    continue;
                }
            }
            if ($styleTag.attr('id') == "camilyo_palettes") {
                continue;
            }
            if ($styleTag.attr('id').indexOf('camilyo_page') == 0) {
                var url = $styleTag.attr('href');
                runTransitionsFunc = true;
                $.get(url, function (data) {
                    //$('<style rel="stylesheet" type="text/css">' + data + '</style>').prependTo($('head'));
                    $styleTag.prependTo($('head'));
                    setTimeout(function () {
                        addScriptsAndMakeTransition(res, contentStr, currConf, newConf, changeMaster, menuItem);
                        $('.transition_modal').hide();
                    }, 20);
                });
                continue;
            }
        }
        var styleVal = $styleTag.html();
        styleVal = styleVal.replace("<![CDATA[", "").replace("]]>", "");
        styleVal = styleVal.replace("mg://", sShowImageUrl);
        if (changeMaster) {
            styleVal = styleVal.replace(/.msgwebcontainer/g, "#masterpage_" + newConf.masterOrd);
        }
        styleVal = styleVal.replace("ig://", sShowIconUrl);
        $styleTag.html(styleVal);
        $styleTag.prependTo($('head'));
        
    }
    if (!runTransitionsFunc) {
        addScriptsAndMakeTransition(res, contentStr, currConf, newConf, changeMaster, menuItem);
        $('.transition_modal').hide();
    }
}

function makeTransition(oldPage, newPage, changeMaster, toMaster, fromMaster, callback) {
    // do content transition according to type
    switch (transitions.type) {
        case 'Fade':
            if (changeMaster || toMaster != fromMaster) {
                doTransitionFull(oldPage, newPage, toMaster, fromMaster, "fade", callback);
            }
            else { doFadeTransition(oldPage, newPage, toMaster, callback); }

            break;
        case 'Push':
            if (changeMaster || toMaster != fromMaster) {
                doTransitionFull(oldPage, newPage, toMaster, fromMaster, "push", callback);
            } else {
                doPushTransition(oldPage, newPage, toMaster, callback);
            }
            break;
    }
}


function scrollToElem(shref) {
    if (shref) {
        var startPoint = shref.indexOf('#') + 1;
        if (startPoint > 0) {
            var sAnchor = shref.substring(startPoint, shref.length);
            var $elem = $('[name = "' + sAnchor + '"]');
            if ($elem.length == 0) {
                $elem = $('#' + sAnchor);
            }
            if ($elem.length > 0) {
                var hash = '#' + sAnchor;
                doSmoothScroll($elem, camilyo.inPageTime, hash);
            } 
        }
        else {
            setTimeout(function () {
                window.scrollTo(0, 0);
            }, 1);
        }
    } 
}

function setIsInsideBlogTransition(menuItem, fullPageUrl) {
    isBlogTransition = $(menuItem) && $(menuItem).attr('name') && $(menuItem).attr('href') &&
     ($(menuItem).attr('name').indexOf('article_') > -1 || $(menuItem).attr('name').indexOf('blog') > -1) &&
     ($(menuItem).attr('href').indexOf('/articles/') > -1 || $(menuItem).attr('href').indexOf('?articleId=')) > -1;
    var blogUrl='';
    if (isBlogTransition) {
        if ($(menuItem).attr('href').indexOf('articleId=') > -1) {
            blogUrl = fullPageUrl + $(menuItem).attr('href');
        } else {
            blogUrl = "http://" + window.location.host + '/' + $(menuItem).attr('href');
        }
    }
    return blogUrl;
}

function updateNewConf(currConf,newConf, fullPageUrl, menuItem) {
    var suffixId ="";
    if (fullPageUrl.indexOf('?month') > -1) {
        suffixId = 'month';
    }
    if (fullPageUrl.indexOf('?tagname') > -1) {
        suffixId = 'tagname';
    }
    if (fullPageUrl.indexOf('?articlesId') > -1 || fullPageUrl.indexOf('/articles/') > -1) {
        suffixId = 'article';
    }
    var newId = (menuItem?newConf.pageOrd:currConf.pageOrd) + '_' + suffixId;
    if (!transitions.pages[newId]) {
        transitions.pages[newId] = {
            pageOrd: newId,
            masterOrd: menuItem ? newConf.masterOrd : currConf.masterOrd,
            friendlyTitle: menuItem ? newConf.friendlyTitle : currConf.friendlyTitle,
            title: menuItem ? newConf.title : currConf.title
        };
    }
    return transitions.pages[newId];
}

function removeBad(url) {
    var startPoint = url.indexOf('#');
    if (startPoint > 0) {
        return url.substring(0, startPoint - 1);
    }
    return url;

}

function doExtualTransition(res, currConf, newConf, menuItem, changeMaster) {
    var contentStr;
    if (changeMaster) {

        var page = $(res.Html).filter("#msgwebcontainer").html();
        contentStr = '#msp' + currConf.masterOrd + '_Content';
        $(contentStr).append('<div id = "page' + newConf.pageOrd + '" class="full" style="display:none">' + page + '</div>');
    } else {
        contentStr = '#msp' + newConf.masterOrd + '_Content';
        
        var $content = $(res.Html).find(contentStr).length > 0 ? $(res.Html).find(contentStr) : $(res.Html).filter(contentStr);
        if ($content.length == 0) {
            $content = $(res.Html).find('#Content').length > 0 ? $(res.Html).find('#Content') : $(res.Html).filter('#Content');
            contentStr = "#Content";
        }

        var ct = $content.find(contentStr + 'Top');
        if (ct.length>0) {
            $(contentStr + 'Top').html(ct.html());
        }
        var cb = $content.find(contentStr + 'Bottom');
        if (cb.length > 0) {
            $(contentStr + 'Bottom').html(cb.html());
        }
        $content.find(contentStr + 'Top').remove();
        $content.find(contentStr + 'Bottom').remove();
        var content = $content.html();

        $(contentStr).append('<div id = "page' + newConf.pageOrd +  '" style="display:none">' + content + '</div>');
    }
    addOrUpdateStyleTagForTransitions(res, contentStr, currConf, newConf, changeMaster, menuItem);
}


function rebindMenuEvents(page) {
    $(page).find('.mlhmenu').mouseenter(function () {
        $(this).parents('.wp_first_col').not('[class*="MainColumns"]').css('overflow', 'visible');
    })
       .mouseleave(function () {
           $(this).parents('.wp_first_col').not('[class*="MainColumns"]').css('overflow', 'hidden');
       });
}

function addScriptsAndMakeTransition(res, contentStr, currConf, newConf, changeMaster, menuItem) {
    resultOfPageJs = res.JsCode;
    addScriptTags(res.JsCode, false);
    if (window.WOW) {
        var wow = new WOW().init();
    }
    $(contentStr).waitForImages(function () {
        makeTransition($('#page' + currConf.pageOrd), $('#page' + newConf.pageOrd), changeMaster, newConf.masterOrd, currConf.masterOrd, function() {
            if (addScriptTags(res.JsCode, true)) {
                addRestOfScripts(res.JsCode);
            };
            var updatedTitle = window['transitions_current_page_seo_title_' + newConf.pageOrd.split('_')[0]];
           

            var seoTitle = window.transitions_seoTitles.pages[newConf.pageOrd.split('_')[0]].friendlyTitle;
            if (seoTitle.indexOf("[[blog:") == 0 && updatedTitle) {
                    window.transitions.pages[newConf.pageOrd].friendlyTitleCurrent = updatedTitle;
                    $(document).prop('title', updatedTitle);
            }
            if (updatedTitle) {
                updatedTitle = updatedTitle.replace(/&amp;/g, '&');
            }
            $(document).prop('title', updatedTitle);
            
        


            if (typeof (backgroundGalleryTransitions) == 'function') {
                backgroundGalleryTransitions(true);
            }
            if (!holderMode) {
                $('#page' + currConf.pageOrd).remove();
            }
            var shref = $(menuItem).attr('href');
            setTimeout(function () { scrollToElem(shref); }, 50);
            //scrollToElem(shref);
            if (typeof (InitShop) == 'function') {
                InitShop();
            }
            if (typeof (window.msgExpand) == 'function') {
                msgExpand();
            }
            initStickyPanels();
            isTransitioning = false;
        });
    });
}

function doPushTransition(oldPage, newPage, masterPage, callback) {
    // set body overflow-x to hidden to avoid horizontal scroll during the effect
    var contentStrt = '#msp' + masterPage + '_Content';
    if ($(contentStrt).length == 0) {
        contentStrt = "#Content";
    }
    $('body').css('overflow-x', 'hidden');
    // set main content height so footer will not hide the content
    var newPageHeight = getNextPageContentHeight(newPage);
    var currHeight = oldPage.height();
    // get the bigger one
    var contentHeight = newPageHeight > currHeight ? newPageHeight : currHeight;
    $(contentStrt).css('height', contentHeight);
    // start animation
    newPage.stop(true, true);
    oldPage.stop(true, true);
    var width = $(contentStrt).width();
    var windowWidth = $(window).width();
    var left = oldPage.offset().left;
    oldPage.css({ position: 'absolute', left: 0, width: width });
    newPage.css({ position: 'absolute', left: windowWidth, width: width, }).show();

    oldPage.animate({ left: 0 - windowWidth }, 1000, function () {
        oldPage.hide();
        oldPage.css({ position: '', left: '', top: '', width: '' });
        if (!holderMode) {
            oldPage.remove();
        }
    });
    newPage.animate({ left: 0 }, 1000, function () {
        newPage.css({ position: '', left: '', top: '', width: '' });
        // remove css used for effect
        $(contentStrt).css({ height: '', 'overflow-x': '' });
        if (callback) {
            callback();
        }
    });
}

function doFadeTransition(oldPage, newPage, masterId, callback) {
    var str = '#msp' + masterId;
    var dif = getNextPageContentHeight(newPage) - oldPage.height();
    var $footer = $(str + '_FooterExternal');
    if ($footer.length == 0) {
        $footer = $('#FooterExternal');
    }
    if ($footer.length > 0) {
        if ($footer.css('position') != 'fixed') {
            $footer.css('position', 'relative');
            $footer.animate({ 'top': dif }, 750, function () {
                $footer.css('top', '');
                $footer.css('position', '');
            });
        }
    }
    newPage.stop(true, true);
    oldPage.stop(true, true).fadeOut(750, function () {
        newPage.fadeIn(750, callback);
    });
}

function doTransitionFull(oldPage, newPage, toMaster, fromMaster, type, callback) {
    var contentStrf = '#msp' + fromMaster + '_Content';
    var contentStrt = '#msp' + toMaster + '_Content';

    $('body').css('overflow-x', 'hidden');

    if ($('#masterpage_' + toMaster).length > 0) {
        var oldMaster = $('#masterpage_' + fromMaster);
        var newMaster = $('#masterpage_' + toMaster);
        newMaster.show();
        newPage.show();
        if (typeof (window.msgExpand) == 'function') {
            msgExpand();
        }
        newMaster.hide();
        if (type == "fade") {
            oldMaster.stop(true, true).fadeOut(750, function () {
                oldPage.hide();
                if (oldMaster.find(newPage).length > 0) {
                    $(contentStrt).append(newPage);
                    oldMaster.find('#page' + newPage.attr("id")).remove();
                }
                newMaster.fadeIn(750, callback);
            });
        } else {
            doPushAnimation(newMaster, oldMaster, oldPage, newPage, callback);
        }
    } else {
        newPage.show();
        if (typeof (window.msgExpand) == 'function') {
            msgExpand();
        }
        newPage.hide();
        if (type == "fade") {
            $('#msgwebcontainer').stop(true, true).fadeOut(750, function () {
                newMasterBoxPrepare(oldPage, newPage, toMaster, fromMaster, contentStrf, contentStrt, "fade");
                $('#msgwebcontainer').fadeIn(750, callback);
            });
        }
        else {
            newMasterBoxPrepare(oldPage, newPage, toMaster, fromMaster, contentStrf, contentStrt, "push");
            oldMaster = $('#masterpage_' + fromMaster);
            newMaster = $('#masterpage_' + toMaster);
            doPushAnimation(newMaster, oldMaster, oldPage, newPage, callback);
        }
    }
}


function doPushAnimation(newMaster, oldMaster, oldPage, newPage, callback) {
    var windowWidth = $(window).width();
    newMaster.parent().css('height', '100%');
    newMaster.css({ position: 'absolute', top: 0, left: windowWidth, width: windowWidth, }).show();
    oldMaster.css({ position: 'absolute', top: 0, left: 0, width: windowWidth });
    newPage.show();
    oldMaster.animate({ left: 0 - windowWidth }, 1000, function () {
        oldPage.hide();
        oldMaster.hide();
        oldMaster.css({ position: '', left: '', top: '', width: '' });
    });
    newMaster.animate({ left: 0 }, 1000, function () {
        newMaster.css({ position: '', left: '', top: '', width: '' });
        newMaster.parent().css('height', '');
        if (callback) {
            callback();
        }
    });
}

function newMasterBoxPrepare(oldPage, newPage, toMaster, fromMaster, contentStrf, contentStrt, type) {
    var oldMasterPage;
    var rebindOld = false;
    if ($('#masterpage_' + fromMaster).length > 0) {
        oldMasterPage = $('#masterpage_' + fromMaster);
    } else {
        oldMasterPage = $('#msgwebcontainer').children().wrapAll("<div id='masterpage_" + fromMaster + "'></div>").parent();
        $('#msgwebcontainer').children().remove();
        rebindOld = true;
    }
    
    var newMasterPage = newPage.children().wrapAll("<div id='masterpage_" + toMaster + "'></div>").parent();
    $('#msgwebcontainer').append(newMasterPage);
    $('#msgwebcontainer').append(oldMasterPage);
    if (rebindOld) {
        rebindMenuEvents('#masterpage_' + fromMaster);
    }
    if (type == "fade") {
        oldMasterPage.hide();
        $(contentStrf).children().filter('[class*="page"]').hide();
    } else {
        newMasterPage.hide();
    }
    $(contentStrt).wrapInner("<div id='" + newPage.attr('id') + "'></div>");
    oldMasterPage.find(contentStrf + " #" + newPage.attr('id')).remove();
    rebindMenuEvents('#masterpage_' + toMaster);
}

function getNextPageContentHeight(newPage) {
    newPage.css({ 'z-index': -10000 }).show();
    var contentHeight = newPage.height();
    if (typeof (window.msgExpand) == 'function') {
        msgExpand();
    }
    newPage.hide().css({ 'z-index': 0 });
    return contentHeight;
}

function addCode() {
    addRestOfScripts(resultOfPageJs);
}

function addRestOfScripts(js) {
    var sCode = '';
    if (js.Classes) {
        for (var sClassId in js.Classes) {
            var $script = $('head #' + sClassId);
            if ($script.length == 0) {
                sCode += js.Classes[sClassId];
            }
        }
    }
    if (js.Vars) {
        js.Vars = js.Vars.replace("this.wow = new WOW().init()", '');
        js.Vars = js.Vars.replace(/\\/g, '');
        sCode += js.Vars;
    }
    if (js.InitCode) {
        sCode += js.InitCode;
    }

    if (js.External['msgjsext_swapHandler'] && typeof (swapOnLoad) == 'function') {
        swapOnLoad();
    }
    if (js.External['msgjsext_tabsHandler'] && typeof (tabshandlerOnLoad) == 'function') {
        tabshandlerOnLoad();
    }

    var textArea = $('.msgwebcontainer textarea');
    for (var i = 0; i < textArea.length; i++) {
        if (!$(textArea[i]).attr('defaultvalue')) {
            $(textArea[i]).val('');
        }
    }
    eval.call(window,sCode);
}

function addScriptTags(js, handleMap) {
    if (js.External) {
        var hasMap = false;
        for (var sExtId in js.External) {
            var $extscript = $('head #' + sExtId);
            if ($extscript.length == 0) {
                var s = document.createElement("script");
                s.type = "text/javascript";
                if ($('head').find('#' + sExtId).length > 0) {
                    continue;
                }
                if (sExtId == 'msgjsext_lightbox' && $('#lightbox').length > 0) {
                    continue;
                }
                if ((sExtId == 'msgjsext_googleMapJS' || sExtId == 'msgjsext_atlasctMapJS') && !handleMap) {
                    continue;
                }
                if (sExtId == 'msgjsext_lightbox' && $('#lightbox').length > 0) {
                    continue;
                }
                if ((sExtId == 'msgjsext_googleMapJS' || sExtId == 'msgjsext_atlasctMapJS')) {
                    if (sExtId == 'msgjsext_atlasctMapJS') {
                        s.src = js.External[sExtId];
                    } else {
                        if ($('#msgjsext_googleMapJS').length > 0) {
                            continue;
                        }
                        s.src = js.External[sExtId] + '&callback=addCode';
                    }
                    hasMap = true;
                } else {
                    s.src = js.External[sExtId];
                }
                if (handleMap && (sExtId != 'msgjsext_googleMapJS' && sExtId != 'msgjsext_atlasctMapJS')) {
                    continue;
                }
                if (sExtId == 'msgjsext_interact') {
                    $('head').append('<link href="' + s.src.replace('interact.js', 'interact.css') + '" type="text/css" rel="stylesheet">');
                }
                // Use any selector
                $("head").append(s);
            }
        }
        if (hasMap) {
            return false;
        }
    }

    return true;
}

function checkForBlogInnerUrl(currConf, fullPageUrl) {
    if ($('#page' + currConf.pageOrd).length == 0) {
        if (fullPageUrl.indexOf('?month=') > -1 || fullPageUrl.indexOf('?articleId=') > -1 || fullPageUrl.indexOf('?tagname=') > -1 || fullPageUrl.indexOf('/articles/') > -1) {
            isInnerBlogPage = true;
        } else {
            isInnerBlogPage = false;
        }
    } else {
        isInnerBlogPage = false;

    }
}

function checkIfSamePage(pageOrd, menuItem) {
    if (pageOrd == transitions.currPageOrd && !isBlogTransition && !isInnerBlogPage) {
        var nhref = $(menuItem).attr('href');
        if ($.pageslide) {
            $.pageslide.close();
        }
        scrollToElem(nhref);
        isTransitioning = false;
        return false;
    } else {
        isTransitioning = true;
        return true;
    }
}

function getNewConfForBlogPage(newConf, menuItem) {
    blogNewOrd = newConf.pageOrd + '_' + $(menuItem).attr('name').replace('article_', '');
    if (!transitions.pages[blogNewOrd]) {
        transitions.pages[blogNewOrd] = {
            pageOrd: blogNewOrd,
            masterOrd: newConf.masterOrd,
            friendlyTitle: newConf.friendlyTitle,
            title: newConf.title
        };
    }
    return transitions.pages[blogNewOrd];
}

function handleFirstPage(currConf) {
    var contentStr = '#msp' + currConf.masterOrd + '_Content';
    if ($('#page' + currConf.pageOrd).length == 0) {
        if ($(contentStr).length == 0) {
            contentStr = '#Content';
        }
        $(contentStr).wrapInner('<div id = "page' + currConf.pageOrd + '">');
    }
    if ($(contentStr).find(contentStr + 'Top').length > 0 || $(contentStr).find(contentStr + 'Bottom').length > 0) {
        $(contentStr).prepend($(contentStr + 'Top')).prepend($(contentStr + 'Bottom'));
    }
}


function masterPageChangeHandaling(currConf,newConf) {
    var changeMaster = false;
    if (currConf.masterOrd != newConf.masterOrd && !isBlogTransition) {
        ms_cssFiles['mp_' + currConf.masterOrd] = $('[id="camilyo_mp_' + currConf.masterOrd + '"]').attr('href');
        if ($('#masterpage_' + newConf.masterOrd).length == 0) {
            changeMaster = true;
        } else {
            if ($('head').find('[id^="camilyo_palettes"]').length > 0) {
                var mp_css = $('[id="camilyo_mp_' + currConf.masterOrd + '"]');
                var $cssNew = document.createElement('link');
                $cssNew.href = ms_cssFiles['mp_' + newConf.masterOrd];
                $cssNew.id = 'camilyo_mp_' + newConf.masterOrd;
                $cssNew.rel = 'stylesheet';
                $cssNew.type = 'text/css';
                //$($cssNew).prependTo($('head'));
                $('head').append($cssNew);
                setTimeout(function () {
                    mp_css.remove();
                }, 4500);
            }
        }
    }
    return changeMaster;
}

function handleMenuSelected(currConf, newConf, changeMaster, menuItem) {
    var selectedClass = '';
    var destItem = $('a[onclick*="doTransition(' + newConf.pageOrd + ',"][class*="menucomp"]');
    if (currConf.masterOrd != newConf.masterOrd && !changeMaster) {
        var selector = $('#masterpage_' + newConf.masterOrd).find('a[onclick*="doTransition(' + newConf.pageOrd + ',"][class*="menucomp"]');
        if (selector.length > 0) {
            selectedClass = selector.attr('class').replace('item', 'selected');
        }
        $('a[onclick*="doTransition"][class*="menucomp"]').removeClass(selectedClass);
        $(destItem.addClass(selectedClass));
    } else {
        if ($(menuItem).attr('class') && $(menuItem).attr('class').indexOf('item') > -1) {
            selectedClass = $(menuItem).attr('class').replace('item', 'selected');
            $(menuItem).addClass(selectedClass);

        } else {
            if (destItem.length > 0) {
                selectedClass = destItem.attr('class').replace('item', 'selected');
            }
        }
        var menuItems = $('a[onclick*="doTransition(' + currConf.pageOrd + ',"][class*="menucomp"]');
        for (var x = 0; x < menuItems.length; x++) {
            var sclass;
            if ($(menuItems[x]).attr('class').indexOf('subitem') > -1) {
                sclass = $(menuItems[x]).attr('class').split(' ')[0].replace('subitem', 'selected');
                $(menuItems[x]).removeClass($(menuItems[x]).attr('class').split(' ')[0].replace('subitem', 'subselected'));
            } else {
                sclass = $(menuItems[x]).attr('class').split(' ')[0].replace('item', 'selected');
            }
            $(menuItems[x]).removeClass(sclass);
        }
        for (x = 0; x < destItem.length; x++) {
            if ($(destItem[x]).attr('class').indexOf('subitem') > -1) {
                sclass = $(destItem[x]).attr('class').split(' ')[0].replace('subitem', 'selected');
            } else {
                sclass = $(destItem[x]).attr('class').split(' ')[0].replace('item', 'selected');
            }
            $(destItem[x]).addClass(sclass);
        }

        ///destItem.addClass(selectedClass);
        if ($(menuItem).parents('.accord').length != 0) {
            $(menuItem).parents('nav').children('ul').find('ul[class*="submenu"]').hide();
            $(menuItem).parent().children('ul').show();
            if ($(menuItem).attr('class').indexOf('_subitem') > -1) {
                $(menuItem).parents('ul').show();
            }
        }
    }
   
    destItem.addClass(selectedClass);
    
    
}

function handleBrowserUrlAndPageName(newConf, menuItem,blogUrl) {
    var data = { pageOrd: newConf.pageOrd, href: newConf.title };
    if (menuItem) {
        var title = $(menuItem).attr('href') ? $(menuItem).attr('href') : '/' + newConf.title;
        if (title.indexOf('javascript') > -1) {
            title = newConf.title;
        }
        history.pushState(data, newConf.friendlyTitle, title.indexOf("http") > -1 ? title : (isBlogTransition ? blogUrl : "http://" + window.location.host + title));
    }
    var seoTitle = newConf.friendlyTitle;
    if (window.transitions_seoTitles) {
        if (window.transitions_seoTitles.pages[newConf.pageOrd.split('_')[0]]) {
            seoTitle = window.transitions_seoTitles.pages[newConf.pageOrd.split('_')[0]].friendlyTitle;
            if (seoTitle.indexOf("[[blog:") == 0) {
                seoTitle = window.transitions.pages[newConf.pageOrd].friendlyTitleCurrent;
            }
        }
    }
    if (seoTitle) {
        seoTitle = seoTitle.replace(/&amp;/g, '&');
    }
    $(document).prop('title', seoTitle);
  
    if (window._gaq) {
        _gaq.push(['_trackPageview']);
    }
}

function getUrlForAjax(menuItem, blogUrl, newConf, href) {
    var url;
    if (menuItem) {
        if (isBlogTransition) {
            url = blogUrl;
        } else {
            if ($(menuItem).attr('href') && $(menuItem).attr('href').indexOf('javascript') == -1) {
                url = $(menuItem).attr('href').indexOf("http") > -1 ? $(menuItem).attr('href') : "http://" + window.location.host + $(menuItem).attr('href');
            } else {
                url = "http://" + window.location.host + '/' + newConf.title;
            }
        }
    } else {
        if (href.indexOf('/') != 0) {
            href = '/' + href;
        }
        url = "http://" + window.location.host + href;
    }
    return url;
}

