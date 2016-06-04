//   This js file adds a pop-up box,
//   that opens  another box with buttons that opens scheduler site in in frame 

    if ((typeof window.$ == 'undefined')
	     && (typeof window.jQuery == 'undefined')) { 
        document.write('<sc' + 'ript src="http://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"><' + '/script>'); 
    }

    var CCMgr = {
    /**** checkout integration ****/
    opts: null,

    getOrigin: function (win) {
        if (win.location) {
            if (!win.location.origin) {
                return win.location.protocol + "//" + win.location.host;
            }
            return win.location.origin;
        } else {
            var pathArray = win.split('/');
            var protocol = pathArray[0];
            var host = pathArray[2];
            return protocol + '//' + host;
        }
    },

    redirectTo: function (url) {
        window.location.href = url;
    },

    sendMessageToIframe: function (iframe) {
        // 'uoi!fh^q49@34uhf$p4r'
        var iFrameWin = iframe.contentWindow;
        var data = { module: 'engage', purpose: 'engage-loaded', value: window.location.href };
        iFrameWin.postMessage(data, this.getOrigin(iframe.src));
    },

    receiveMessageFromIframe: function (event) {
        var data = event.data;
        if (!data || !data.value || data.module != 'scheduler' || data.purpose != 'checkout') {
            return;
        }
        var value = data.value;
        var redirectUrl = value;
        if (CCMgr.opts.checkoutUrl && CCMgr.opts.checkoutUrl.indexOf('/') == -1) {
            var i = value.indexOf('?');
            var qs = value.substr(i);
            redirectUrl = CCMgr.opts.checkoutUrl + '/' + qs;
        } 
        CCMgr.redirectTo(redirectUrl);
    },

    currentIframe: null,
    /******************************/

    buildHtml: function (opts, jsPath, isConnect) {

        CCMgr.options = opts;
        if (this.isFacebook()) {
            return;
        }
     
        var a_waitImageSrc = opts.schedulerUrl + '/static-images/mobeepreview/msgloading.gif';
        if (opts.contactUrl && !opts.schedulerUrl) {
            a_waitImageSrc = opts.contactUrl + '/static-images/mobeepreview/msgloading.gif';
        }
        jQuery('head').append('<link href="' + jsPath + 'interact.css" type="text/css" rel="stylesheet">');
        if (jQuery('.interactPluginX').length > 0 && isConnect) {
            jQuery('.interactPluginX').remove();
        } else if (jQuery('.interactPluginX').length > 0) {
            return;
        }
        jQuery('body').append('<div class="interactPluginX"></div>');
        var isData = opts.callMeBackUrl || opts.contactUrl || opts.videoEmbedCode || opts.schedulerUrl || opts.shareUrl || opts.couponTemplate || opts.dealTemplate || opts.giftCardTemplate;
        if (this.isMobile() || jQuery(window).width() < 500) {
            if (opts.useShareMobile || opts.usePhoneMobile || opts.useCallMeBackMobile || opts.useVideoMobile || opts.useSchedulerMobile || opts.useCouponMobile || opts.useDealMobile || opts.useGiftCardMobile || opts.useContactMobile) {
                if (isData || opts.usePhoneMobile || opts.useShareMobile) {
                    this.buildMobile(opts);
                }
            }
        }
        else {
            if (opts.useBooster && opts.boosterUrl && !this.isLocal) {
                jQuery('head').append('<script src="' + this.Url + '/js/byg/camilyo_byg.js" type="text/javascript"></script>');
                setTimeout(function () {
                    if (window.cambyg_init) {
                        window.cambyg_init(opts.boosterUrl);
                    }
                }, 500);
            }

            if (opts.useShareTab || opts.usePhoneTab || opts.useVideoTab || opts.useCallMeBackTab || opts.useSchedulerTab || opts.useContactTab) {
                if (isData|| opts.usePhoneTab || opts.useShareTab) {
                    CCMgr.buildTab(opts);
                }
            } else if (opts.useEngageTab) {
                CCMgr.buildTab(opts);
            }

            if (opts.useShareButton || opts.usePhoneButton || opts.useVideoButton || opts.useCallMeBackButton || opts.useSchedulerButton || opts.useContactButton) {
                if (isData || opts.usePhoneButtons || opts.useShareButtons) {
                    CCMgr.buildButtons(opts);
                }
            }
        }
        if (opts.schedulerUrl) {
            jQuery('.interactPluginX').append('<div id ="interactPluginScheduler" class="WContainer"><div class="ifr-container scheduler"><div class="iframe-title">'
                + (opts.schedulerText ? opts.schedulerText : "Scheduler") +
                '</div><div  class="exitButton exitButton2" onclick="CCMgr.Revert2()"/><div id="beforeLoad1"><img src="' + a_waitImageSrc + '">' +
                '</div><iframe id="iframe1xx" src=""  class="iframe1"></iframe></div></div>');
        }
        if (opts.contactUrl) {
            jQuery('.interactPluginX').append('<div id ="interactPluginContact" class="WContainer"><div class="ifr-container contact"><div class="iframe-title">'
                + (opts.contactText ? opts.contactText : "Contact Us") +
                '</div><div  class="exitButton exitButton2" onclick="CCMgr.Revert2()"/><div id="beforeLoad2"><img src="' + a_waitImageSrc + '">' +
                '</div><iframe id="iframe2xx" src=""  class="iframe1"></iframe></div></div>');
        }
        if (opts.callMeBackUrl) {
            jQuery('.interactPluginX').append('<div id ="interactPluginCallMeBack" class="WContainer"><div class="ifr-container call-me-back">'
                + '<div  class="exitButton exitButton2" onclick="CCMgr.Revert2()"/><div id="beforeLoad1"><img src="' + a_waitImageSrc + '">' +
                '</div><iframe id="iframe3xx" src=""  class="iframe1"></iframe></div></div>');
        }

        if (opts.feedbackUrl) {
            jQuery('.interactPluginX').append('<div id ="interactPluginFeedback" class="WContainer"><div class="ifr-container share"><div class="iframe-title">'
                 + (opts.shareText ? opts.shareText : "Customer Feedback") +
                 '</div><div  class="exitButton exitButton2" onclick="CCMgr.Revert2()"/><div id="beforeLoad1"><img src="' + a_waitImageSrc + '">' +
                 '</div><iframe id="iframe4xx" src=""  class="iframe1"></iframe></div></div>');
        }
        if (opts.videoEmbedCode) {
            jQuery('.interactPluginX').append('<div id ="interactPluginVideo" class="WContainer"><div class="container video"><div class="iframe-title">'
                 + (opts.videoText ? opts.videoText : "Video") +
                 '</div><div  class="exitButton exitButton2" onclick="CCMgr.Revert2()"/>'+opts.videoEmbedCode+'</div></div>');
        }
        if (opts.couponTemplate && opts.couponId!=-1) {
            jQuery('.interactPluginX').append('<div id ="interactPluginCoupon" class="WContainer"><div class="container coupon"><div class="iframe-title">'
                 + (opts.couponText ? opts.couponText : "Coupon") +
                 '</div><div  class="exitButton exitButton2" onclick="CCMgr.Revert2()"/><div id="beforeLoad1"><img src="' + a_waitImageSrc + '">' +
                 '</div><iframe id="iframe5xx" src=""  class="iframe1"></iframe></div></div>');
            var width = opts.couponTemplate.split('&')[1];
            var height = opts.couponTemplate.split('&')[2];
            this.setCouponDemintions(width, height, 'Coupon');
        }
        if (opts.dealTemplate && opts.dealId!=-1) {
            jQuery('.interactPluginX').append('<div id ="interactPluginDeal" class="WContainer"><div class="container deal"><div class="iframe-title">'
                 + (opts.dealText ? opts.dealText : "Deal") +
                 '</div><div  class="exitButton exitButton2" onclick="CCMgr.Revert2()"/><div id="beforeLoad1"><img src="' + a_waitImageSrc + '">' +
                 '</div><iframe id="iframe6xx" src=""  class="iframe1"></iframe></div></div>');
            var width = opts.dealTemplate.split('&')[1];
            var height = opts.dealTemplate.split('&')[2];
            this.setCouponDemintions(width, height, 'Deal');
        }
        if (opts.giftCardTemplate && opts.giftCardId!=-1) {
            jQuery('.interactPluginX').append('<div id ="interactPluginGiftCard" class="WContainer"><div class="container giftCard"><div class="iframe-title">'
                 + (opts.giftCardText ? opts.giftCardText : "GiftCard") +
                 '</div><div  class="exitButton exitButton2" onclick="CCMgr.Revert2()"/><div id="beforeLoad1"><img src="' + a_waitImageSrc + '">' +
                 '</div><iframe id="iframe7xx" src=""  class="iframe1"></iframe></div></div>');
            var width = opts.giftCardTemplate.split('&')[1];
            var height = opts.giftCardTemplate.split('&')[2];
            this.setCouponDemintions(width, height, 'GiftCard');
        }

        //        if (opts.buttonsColor) {
        //            jQuery('.iframe-title').css('color', opts.buttonsColor);
        //            jQuery('.interactPluginX .uploadButton').css('background-color', opts.buttonsColor);
        //         
        //        }

    },
    setCouponDemintions: function(width, height, type) {
        if (!this.isMobile() && jQuery(window).width() > 500) {
            jQuery('#interactPlugin' + type + ' iframe').width(width);
            jQuery('#interactPlugin' + type + ' iframe').height(height);
            jQuery('#interactPlugin' + type).width(width);
                if (height) {
                    jQuery('#interactPlugin' + type).height(parseInt(height) + 60);
                }
                if (width) {
                    jQuery('#interactPlugin' + type).width(parseInt(width) + 20);
                }
                jQuery('#interactPlugin' + type).css('margin-left', width / 2 * -1 + "px");
            }
        
    },
    buildTab: function (opts) {
        jQuery('.interactPluginX').append('<a  class="contact_win" onclick="CCMgr.openBigerBox()">' + opts.interactButtonCaption + '</a>');
        if (opts.tabColor) {
            jQuery('.contact_win').css('background-color', opts.tabColor);
            jQuery('.contact_win').css('color', '#fff');
        }
        jQuery('.interactPluginX').append('<div class="info" style=""><div class="header_q"><div class="exitButton" onclick="CCMgr.Revert()"></div>' +
          '</div></div>');
        jQuery("[data_engage]").click(function () {
            CCMgr.openBigerBox();
        });

        if (opts.front_logoTab && opts.front_logoTab != "") {
            var isDefaultIcon = false;
            if (opts.front_logoTab.indexOf('/image.ashx?dg=engage-logo.png') > -1) {
                isDefaultIcon = true;
            }
            jQuery('.header_q').append('<div class="img_logo '+(isDefaultIcon?'dIcon':'')+'"><img style="max-width:65px;max-height:65px;" src="' + (opts.front_logoTab.indexOf('http') == 0 ? '' : this.Url) + ((opts.front_logoTab.indexOf('/') == 0 || opts.front_logoTab.indexOf('http') == 0 )? '' : '/') + opts.front_logoTab + '"/></div>');
        }

        if ((opts.title && opts.title != "") && ((typeof (opts.front_logoTab) == "undefined") || opts.front_logoTab == "" || opts.front_logoTab == null)) {
            jQuery('.header_q').append('<div class="schedule_title"><p>' + opts.title + '</p></div>');
        }

        if (opts.title && (opts.title != "") && opts.front_logoTab && (opts.front_logoTab != "")) {
            jQuery('.header_q').append('<div class="schedule_title schedule_title_2"><p>' + opts.title + '</p></div>');
        }
        if (opts.text && opts.text != "") {
            jQuery('.interactPluginX .info').append('<div class="primary_q"><div class="schedule_text">' + opts.text + '</div></div>');
        }

        jQuery('.interactPluginX .info').append('<div class="buttons_q"></div>');

        if (opts.schedulerUrl && opts.useSchedulerTab) {
            jQuery('.buttons_q').append('<div  class="tabButton scheduler" onclick="CCMgr.openWindow(\'' + "scheduler" + '\')">' +
                '<div class="image_container"><img src="' + (this.Url || "") + '/images/engage/Scheduler_Engage.svg"/></div>' +
                '<div class="buttonCaption">' + (opts.schedulerText ? opts.schedulerText : "Scheduler") + '</div></div>');
        }
        if (opts.contactUrl && opts.useContactTab) {
            jQuery('.buttons_q').append('<div  class="tabButton contact" onclick="CCMgr.openWindow(\'' + "contact" + '\')">' +
                '<div class="image_container"><img src="' + (this.Url || "") + '/images/engage/Form_Engage.svg"/></div>' +
                '<div class="buttonCaption">' + (opts.contactText ? opts.contactText : "Contact Us") + '</div></div>');
        }
        if (opts.usePhoneTab) {
            jQuery('.buttons_q').append('<div  class="tabButton phone"><a href="tel:' + opts.phone + '">' +
                '<div class="image_container"><img src="' + (this.Url || "") + '/images/engage/Call_Engage.svg"/></div>' +
                '<div class="buttonCaption">' + (opts.phoneText ? opts.phoneText : "Call Us") + '</div></a></div>');
        }
        if (opts.callMeBackUrl && opts.useCallMeBackTab) {
            jQuery('.buttons_q').append('<div  class="tabButton callMeBack" onclick="CCMgr.openWindow(\'' + "call-me-back" + '\')">' +
                '<div class="image_container"><img src="' + (this.Url || "") + '/images/engage/CallMeBack_white38X38.svg"/></div>' +
                '<div class="buttonCaption">' + (opts.callMeBackText ? opts.callMeBackText : "Call Me Back") + '</div></div>');
        }
     
        if (opts.useShareTab && opts.feedbackUrl) {
            jQuery('.buttons_q').append('<div  class="tabButton share" onclick="CCMgr.openWindow(\'' + "share" + '\')">' +
                '<div class="image_container"><img src="' + (this.Url || "") + '/images/engage/leave-feedback-white.svg"/></div>' +
                '<div class="buttonCaption">' + (opts.shareText ? opts.shareText : "Customer Feedback") + '</div></div>');
        }
        if (opts.useVideoTab && opts.videoEmbedCode) {
            jQuery('.buttons_q').append('<div  class="tabButton video" onclick="CCMgr.openWindow(\'' + "video" + '\')">' +
                 '<div class="image_container"><img src="' + (this.Url || "") + '/images/engage/video.svg"/></div>' +
                 '<div class="buttonCaption">' + (opts.videoText ? opts.videoText : "Video") + '</div></div>');
        }
        if (opts.useCouponTab && opts.couponTemplate && opts.couponId!=-1) {
            jQuery('.buttons_q').append('<div  class="tabButton coupon" onclick="CCMgr.openWindow(\'' + "coupon" + '\')">' +
                 '<div class="image_container"><img src="' + (this.Url || "") + '/images/engage/Coupon.svg"/></div>' +
                 '<div class="buttonCaption">' + (opts.couponText ? opts.couponText : "Coupon") + '</div></div>');
        }
        if (opts.useDealTab && opts.dealTemplate && opts.dealId!=-1) {
            jQuery('.buttons_q').append('<div  class="tabButton deal" onclick="CCMgr.openWindow(\'' + "deal" + '\')">' +
                 '<div class="image_container"><img src="' + (this.Url || "") + '/images/engage/Deals.svg"/></div>' +
                 '<div class="buttonCaption">' + (opts.dealText ? opts.DealText : "Deal") + '</div></div>');
        }
        if (opts.useGiftCardTab && opts.giftCardTemplate && opts.giftCardId!=-1) {
            jQuery('.buttons_q').append('<div  class="tabButton giftCard" onclick="CCMgr.openWindow(\'' + "giftCard" + '\')">' +
                 '<div class="image_container"><img src="' + (this.Url || "") + '/images/engage/Gifts.svg"/></div>' +
                 '<div class="buttonCaption">' + (opts.giftCardText ? opts.giftCardText : "GiftCard") + '</div></div>');
        }
        if (opts.fontTab) {
            jQuery('.tabButton .buttonCaption').css('font-family', opts.fontButton);
        }

        if (opts.buttonsColorTab) {
            jQuery('.tabButton .image_container').css('background-color', opts.buttonsColorTab);
        }
        if (opts.textColorTab) {
            jQuery('.tabButton .buttonCaption').css('color', opts.textColorTab);
        }
        if (opts.tabRight) {
            jQuery('.contact_win').css('right', opts.tabRight+'px');
        }
        jQuery('.interactPluginX .info').append('</div>');


    },

    buildButtons: function (opts) {
        var sideBar = opts.buttonsType == "floating" ? 'floatingType' : 'sideBarType';
        var str = '<div class="engage_icons ' + sideBar + '">';
        if (opts.schedulerUrl && opts.useSchedulerButton) {
            str += '<div class="floating-engage scheduler" onclick="CCMgr.openWindow(\'' + "scheduler" + '\')">' +
                   '<div class="buttonCaption">' + (opts.schedulerText ? opts.schedulerText : "Scheduler") + '</div>' +
                '<img src="' + this.Url + '/images/engage/Scheduler_Engage.svg"/>' +
                '</div>';
        }
        if (opts.contactUrl && opts.useContactButton) {
            str += '<div  class="floating-engage contact" onclick="CCMgr.openWindow(\'' + "contact" + '\')">' +
                   '<div class="buttonCaption">' + (opts.contactText ? opts.contactText : "Contact Us") + '</div>' +
            '<img src="' + this.Url + '/images/engage/Form_Engage.svg"/>' +

                '</div>';
        }
        if (opts.usePhoneButton) {
            str += '<a href="tel:' + opts.phone + '"><div  class="floating-engage phone">' +
                  '<div class="buttonCaption">' + (opts.phoneText ? opts.phoneText : "Call Us") + '</div>' +
            '<img src="' + this.Url + '/images/engage/Call_Engage.svg"/>' +
                '</div></a>';
        }
        if (opts.useCallMeBackButton && opts.callMeBackUrl) {
            str += '<div class="floating-engage call-me-back" onclick="CCMgr.openWindow(\'' + "call-me-back" + '\')">' +
                 '<div class="buttonCaption">' + (opts.callMeBackText ? opts.callMeBackText : "Call Me Back") + '</div>' +
               '<img src="' + this.Url + '/images/engage/CallMeBack_white38X38.svg"/>' +
               '</div>';
        }
        if (opts.useShareButton && opts.feedbackUrl) {
            str += '<div class="floating-engage share" onclick="CCMgr.openWindow(\'' + "share" + '\')">' +
                '<div class="buttonCaption">' + (opts.shareText ? opts.shareText : "Customer Feedback") + '</div>' +
               '<img src="' + this.Url + '/images/engage/leave-feedback-white.svg"/>' +
               '</div>';
        }
       
        if (opts.useVideoButton && opts.videoEmbedCode) {
            str += '<div class="floating-engage video" onclick="CCMgr.openWindow(\'' + "video" + '\')">' +
                '<div class="buttonCaption">' + (opts.videoText ? opts.videoText : "Video") + '</div>' +
               '<img src="' + this.Url + '/images/engage/video.svg"/>' +
               '</div>';
        }
        if (opts.useCouponButton && opts.couponTemplate && opts.couponId!=-1) {
            str += '<div class="floating-engage coupon" onclick="CCMgr.openWindow(\'' + "coupon" + '\')">' +
                '<div class="buttonCaption">' + (opts.couponText ? opts.couponText : "coupon") + '</div>' +
               '<img src="' + this.Url + '/images/engage/Coupon.svg"/>' +
               '</div>';
        }
        if (opts.useDealButton && opts.dealTemplate && opts.dealId!=-1) {
            str += '<div class="floating-engage deal" onclick="CCMgr.openWindow(\'' + "deal" + '\')">' +
                '<div class="buttonCaption">' + (opts.dealText ? opts.dealText : "Deal") + '</div>' +
               '<img src="' + this.Url + '/images/engage/Deals.svg"/>' +
               '</div>';
        }
        if (opts.useGiftCardButton && opts.giftCardTemplate && opts.giftCardId!=-1) {
            str += '<div class="floating-engage giftCard" onclick="CCMgr.openWindow(\'' + "giftCard" + '\')">' +
                '<div class="buttonCaption">' + (opts.giftCardText ? opts.giftCardText : "GiftCard") + '</div>' +
               '<img src="' + this.Url + '/images/engage/Gifts.svg"/>' +
               '</div>';
        }
        jQuery('.interactPluginX').append(str);
        jQuery('.floating-engage').css('background-color', opts.buttonsColorButton);
       
        if (sideBar == 'floatingType') {
            jQuery('.floating-engage .buttonCaption').css('background-color', opts.buttonsColorButton);
        }
        jQuery('.engage_icons.sideBarType .floating-engage').mouseover(function () {
            jQuery(this).addClass('open');
        });
        jQuery('.engage_icons.sideBarType .floating-engage').mouseleave(function () {
            jQuery(this).removeClass('open');
        });
        jQuery('.engage_icons.floatingType .floating-engage').mouseover(function () {
            jQuery(this).find('.buttonCaption').addClass('tooltip');
        });
        jQuery('.engage_icons.floatingType .floating-engage').mouseleave(function () {
            jQuery(this).find('.buttonCaption').removeClass('tooltip');
        });
        if (opts.textColorButton) {
            jQuery('.floating-engage .buttonCaption').css('color', opts.textColorButton);
        }
        if (opts.fontButton) {
            jQuery('.floating-engage .buttonCaption').css('font-family', opts.fontButton);

        }
        if (opts.buttonsRight) {
            jQuery('.engage_icons.floatingType').css('right', opts.buttonsRight + 'px');
        }
        if (opts.buttonsTop) {
            jQuery('.engage_icons').css('top', opts.buttonsTop + 'px');
        }
        if (sideBar == "sideBarType") {
            jQuery('.engage_icons .floating-engage.scheduler').attr('title', (opts.schedulerText ? opts.schedulerText : "Scheduler"));
            jQuery('.engage_icons .floating-engage.contact').attr('title', (opts.contactText ? opts.contactText : "Contact Us"));
            jQuery('.engage_icons .floating-engage.phone').attr('title', (opts.phoneText ? opts.phoneText : "Call Us"));
            jQuery('.engage_icons .floating-engage.share').attr('title', (opts.shareText ? opts.shareText : "Customer Feedback"));
            jQuery('.engage_icons .floating-engage.call-me-back').attr('title', (opts.callMeBackText ? opts.callMeBackText : "Call Me Back"));
        }


    },
    buildMobile: function (opts) {
        var that = this;
        var isDefaultIcon = false;
        if (opts.front_logoMobile && opts.front_logoMobile.indexOf('/image.ashx?dg=engage-logo.png') > -1) {
            isDefaultIcon = true;
        }
        var imageUrl = opts.front_logoMobile && ((opts.front_logoMobile.indexOf('http') == 0 ? '' : this.Url) + (opts.front_logoMobile.indexOf('/') == 0 ? '' : '/') + opts.front_logoMobile);

        if (!opts.front_logoMobile || isDefaultIcon) {
            jQuery('.interactPluginX').append('<div class="mobile_button"><div class="mobileModal"></div><div class="mobile floating-engage"><img src="' + (isDefaultIcon ? imageUrl : this.Url + '/image.ashx?dg=engage-logo.png') + '"/></div></div>');
        } else {
            jQuery('.interactPluginX').append('<div class="mobile_button logo"><div class="mobileModal"></div><div class="mobile floating-engage"></div></div>');
            //var imageUrl = (opts.front_logoMobile.indexOf('http') == 0 ? '' : this.Url) + (opts.front_logoMobile.indexOf('/') == 0 ? '' : '/') + opts.front_logoMobile;
            jQuery('.floating-engage.mobile').css('background-image', 'url(' + imageUrl + ')');
        }
        jQuery('.mobile.floating-engage').click(function () {
            jQuery('.mobile_button .mobileModal').fadeIn();
            jQuery('.mobile_button .mobile.floating-engage').fadeOut();
            jQuery('.mobile_button .mobile_buttons').show();
            jQuery('.mobile_button .mobile_buttons').animate({ bottom: 20 }, 1800, function () {
            });

        });

        jQuery('.interactPluginX .mobile_button').prepend('<div class="mobile_buttons"></div>');
        if (opts.schedulerUrl && opts.useSchedulerMobile) {
            jQuery('.interactPluginX .mobile_button .mobile_buttons').append('<div class="mobile_row" onclick="CCMgr.openWindow(\'' + "scheduler" + '\')">' +
                     '<div class="buttonCaption">' + (opts.schedulerText ? opts.schedulerText : "Scheduler") + '</div>' +
                '<div class="floating-engage mobile-open" >' +
                '<img src="' + this.Url + '/images/engage/Scheduler_Engage.svg"/>' +
                '</div></div>');

        }
        if (opts.contactUrl && opts.useContactMobile) {
            jQuery('.interactPluginX .mobile_button .mobile_buttons').append('<div class="mobile_row" onclick="CCMgr.openWindow(\'' + "contact" + '\')">' +
                  '<div class="buttonCaption">' + (opts.contactText ? opts.contactText : "Contact Us") + '</div>' +
                '<div  class="floating-engage mobile-open">' +
            '<img src="' + this.Url + '/images/engage/Form_Engage.svg"/>' +
                '</div></div>');
        }
        if (opts.usePhoneMobile) {
            jQuery('.interactPluginX .mobile_button .mobile_buttons').append('<a href="tel:' + opts.phone + '"><div class="mobile_row">' +
                     '<div class="buttonCaption">' + (opts.phoneText ? opts.phoneText : "Call Us") + '</div>' +
                '<div  class="floating-engage mobile-open">' +
            '<img src="' + this.Url + '/images/engage/Call_Engage.svg"/>' +
                '</div></div></a>');
        }
        if (opts.useCallMeBackMobile && opts.callMeBackUrl) {
            jQuery('.interactPluginX .mobile_button .mobile_buttons').append('<div class="mobile_row" onclick="CCMgr.openWindow(\'' + "call-me-back" + '\')">' +
                   '<div class="buttonCaption">' + (opts.callMeBackText ? opts.callMeBackText : "Call Me Back") + '</div>' +
                '<div class="floating-engage mobile-open" >' +
               '<img src="' + this.Url + '/images/engage/CallMeBack_white38X38.svg"/>' +
               '</div></div>');
        }
        if (opts.useShareMobile && opts.feedbackUrl) {
            jQuery('.interactPluginX .mobile_button .mobile_buttons').append('<div class="mobile_row" onclick="CCMgr.openWindow(\'' + "share" + '\')">' +
                  '<div class="buttonCaption">' + (opts.shareText ? opts.shareText : "Customer Feedback") + '</div>' +
                '<div class="floating-engage mobile-open">' +
               '<img src="' + this.Url + '/images/engage/leave-feedback-white.svg"/>' +
               '</div></div>');
        }
        if (opts.useVideoMobile && opts.videoEmbedCode) {
            jQuery('.interactPluginX .mobile_button .mobile_buttons').append('<div class="mobile_row" onclick="CCMgr.openWindow(\'' + "video" + '\')">' +
                  '<div class="buttonCaption">' + (opts.videoText ? opts.videoText : "Video") + '</div>' +
                '<div class="floating-engage mobile-open">' +
               '<img src="' + this.Url + '/images/engage/video.svg"/>' +
               '</div></div>');
        }
        if (opts.useCouponMobile && opts.couponTemplate && opts.couponId != -1) {
            jQuery('.interactPluginX .mobile_button .mobile_buttons').append('<div class="mobile_row" onclick="CCMgr.openWindow(\'' + "coupon" + '\')">' +
                  '<div class="buttonCaption">' + (opts.couponText ? opts.couponText : "Coupon") + '</div>' +
                '<div class="floating-engage mobile-open">' +
               '<img src="' + this.Url + '/images/engage/Coupon.svg"/>' +
               '</div></div>');
        }
        if (opts.useDealButton && opts.dealTemplate && opts.dealId!=-1) {
            jQuery('.interactPluginX .mobile_button .mobile_buttons').append('<div class="mobile_row" onclick="CCMgr.openWindow(\'' + "deal" + '\')">' +
                  '<div class="buttonCaption">' + (opts.dealText ? opts.dealText : "Deal") + '</div>' +
                '<div class="floating-engage mobile-open">' +
               '<img src="' + this.Url + '/images/engage/Deals.svg"/>' +
               '</div></div>');
        }
        if (opts.useGiftCardButton && opts.giftCardTemplate && opts.giftCardId!=-1) {
            jQuery('.interactPluginX .mobile_button .mobile_buttons').append('<div class="mobile_row" onclick="CCMgr.openWindow(\'' + "giftCard" + '\')">' +
                  '<div class="buttonCaption">' + (opts.giftCardText ? opts.giftCardText : "Gift card") + '</div>' +
                '<div class="floating-engage mobile-open">' +
               '<img src="' + this.Url + '/images/engage/Gifts.svg"/>' +
               '</div></div>');
        }
        if (jQuery('.mobile_buttons').children().length > 8) {
            jQuery('.mobile_buttons').addClass('manyIcons');
        }
        jQuery('.interactPluginX .mobile_button .mobile_buttons').append('<div class="mobile_exit"><div class="exit floating-engage">X</div></div>');
        jQuery('.mobile_exit .exit.floating-engage').click(function () {
            that.closeMobile();

        });
        if (opts.buttonsColorMobile) {
            jQuery('.floating-engage.mobile-open').css('background-color', opts.buttonsColorMobile);
            jQuery('.floating-engage.exit').css('background-color', opts.buttonsColorMobile);
            jQuery('.floating-engage.mobile').css('background-color', opts.buttonsColorMobile);
        }
        if (opts.fontMobile) {
            jQuery('.interactPluginX .mobile_button').css('font-family', opts.fontMobile);
        }
    },

    isMobile: function () {
        var check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    },


    isFacebook: function () {
            if (!window.location.origin) {
                window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
            }
            var urls = (window.location != window.parent.location) ? document.referrer : document.location;
            if (window.top === window) {
                urls = urls.origin;
            }
            if (urls.indexOf("facebook.com") != -1) {
                return true;
            }
            return false;
    },
    closeMobile: function () {
        jQuery('.mobile_button .mobile_buttons').animate({ bottom: -1000 }, 1800, function () {
            jQuery('.mobile_button .mobile.floating-engage').fadeIn(function () {
                jQuery('.mobile_button .mobileModal').fadeOut();
            });

            jQuery('.mobile_button .mobile_buttons').hide();

        });
    },

    engageStart: function (opts) {
        var that = this;
        that.Url = opts.url;
        that.businessId = opts.businessId;
        that.isLocal = opts.isLocalSite;
        if (opts.url || that.isLocal) {
            var urlToUse = opts.url ? opts.url : '';
            if ((urlToUse != '') && (urlToUse.indexOf('http://') == 0) && (document.location.protocol == 'https:')) {
                urlToUse = urlToUse.replace('http:', 'https:');
            }
            jQuery.ajax({
                type: 'GET',
                dataType: 'jsonp', contentType: "application/json; charset=utf-8",
                jsonpCallback: 'jsonConfCallback',
                url: urlToUse + '/conf.ashx?userId=' + encodeURIComponent(opts.businessId) + '&isLocal=' + !!opts.isLocalSite,
                async: true
            });
        }
    },

    start: function (opts, isConnect) {
        var that = this;
        //default values
        jQuery(function () {
            var jsPath = "";
            var scripts = document.getElementsByTagName('script');
            var name = 'interact.js';
            for (var i = scripts.length - 1; i >= 0; --i) {
                var src = scripts[i].src;
                var sLength = src.length;
                var nlength = name.length;
                if (src.substr(sLength - nlength) == name) {
                    jsPath = src.substr(0, sLength - nlength);
                }
            }


            if (!opts.interactButtonCaption) {
                opts.interactButtonCaption = 'Contact';
            }

            if (!opts.scheduleText) {
                opts.scheduleButtonText = 'Schedule Now';
            }
            if (!opts.title) {
                opts.title = 'Lets talk!';
            }
            if (!opts.text) {
                opts.text = "You can contact us in a number of ways.";
            }

            CCMgr.opts = opts;

            CCMgr.buildHtml(opts, jsPath, isConnect);

            CCMgr.ChangedDefoultStyles(opts);

        });
    },



    onIframeLoad: function (e) {
        jQuery('.interactPluginX #beforeLoad2').hide();
        jQuery('.interactPluginX #beforeLoad1').hide();

        CCMgr.sendMessageToIframe(e.target);
    },

    ChangedDefoultStyles: function (opts) {

        if (opts.overlay_button_css) {
            jQuery('.interactPluginX .contact_win').attr('style', opts.overlay_button_css);
        }
        if (opts.interaction_window_middle_css) {
            jQuery('.interactPluginX .info').attr('style', opts.interaction_window_middle_css);
        }
        if (opts.interaction_window_sides_css) {
            jQuery('.interactPluginX .header_q').attr('style', opts.interaction_window_sides_css);
            jQuery('.interactPluginX .footer_q').attr('style', opts.interaction_window_sides_css);
        }
        if (opts.buttons_css) {
            jQuery('.interactPluginX .inButton').attr('style', opts.buttons_css);
        }
        if (opts.title_css) {
            jQuery('.interactPluginX .schedule_title').attr('style', opts.title_css);
        }
        if (opts.text_css) {
            jQuery('.interactPluginX .schedule_text').attr('style', opts.text_css);
        }
        if (opts.general_css) {
            jQuery('.interactPluginX .info').attr('style', opts.general_css);
        }
        if (opts.iframe_containingWin_css) {
            jQuery('.interactPluginX .WContainer').attr('style', opts.iframe_containingWin_css);
        }
    },

    openWindow: function (windowType) {
        if (jQuery('.WContainer').is(':visible')) {
            if (jQuery('.WContainer' + ' .' + windowType).filter(':visible').hasClass(windowType)) {
                return;
            }
        }
  
        jQuery('.interactPluginX #beforeLoad2').show();
        jQuery('.interactPluginX #beforeLoad1').show();
        var that = this;
        jQuery('.WContainer').fadeOut();
        jQuery('.interactPluginX .info').animate({ bottom: '-400px' }, 1000, function () { jQuery('.interactPluginX .info').hide(); });

        var bottom;

        var userId = that.businessId ? that.businessId : CCMgr.options.businessId;
        if (windowType == "scheduler") {
            bottom = this.getWindowBottom('Scheduler');
            jQuery('.interactPluginX #iframe1xx').attr('src', '');
            var iframeSrcx = CCMgr.options.schedulerUrl + '/?calendarSiteId=' + encodeURIComponent(userId);

            jQuery('#interactPluginScheduler').show().animate({ bottom: bottom + '%' }, 1800, function () {
                jQuery('.interactPluginX #iframe1xx').attr('src', iframeSrcx);
                jQuery('.interactPluginX #iframe1xx').unbind().load(that.onIframeLoad);
            });
        }
        if (windowType == "call-me-back") {
            bottom = this.getWindowBottom('CallMeBack');
            var iframeSrcx3 = CCMgr.options.callMeBackUrl + '/?calendarSiteId=' + encodeURIComponent(userId);
            jQuery('.interactPluginX #iframe3xx').attr('src', '');
            jQuery('#interactPluginCallMeBack').show().animate({ bottom: bottom + '%' }, 1800, function () {
                jQuery('.interactPluginX #iframe3xx').attr('src', iframeSrcx3);
                jQuery('.interactPluginX #iframe3xx').unbind().load(that.onIframeLoad);
            });
        }

        if (windowType == "contact") {
            bottom = this.getWindowBottom('Contact');
            var iframeSrcx2 = CCMgr.options.contactUrl + '/?msgtargetuserid=' + encodeURIComponent(userId);
            jQuery('.interactPluginX #iframe2xx').attr('src', '');
            jQuery('#interactPluginContact').show().animate({ bottom: bottom + '%' }, 1800, function () {
                jQuery('.interactPluginX #iframe2xx').attr('src', iframeSrcx2);
                jQuery('.interactPluginX #iframe2xx').unbind().load(that.onIframeLoad);
            });
        }

        if (windowType == "share") {
            bottom = this.getWindowBottom('Feedback');
            jQuery('.interactPluginX #iframe4xx').attr('src', '');
            var iframeSrcx4 = CCMgr.options.feedbackUrl + '/?msgtargetuserid=' + encodeURIComponent(userId);
            jQuery('#interactPluginFeedback').show().animate({ bottom: bottom + '%' }, 1800, function () {
                jQuery('.interactPluginX #iframe4xx').attr('src', iframeSrcx4);
                jQuery('.interactPluginX #iframe4xx').unbind().load(that.onIframeLoad);
            });
        }
        if (windowType == "coupon") {
            bottom = this.getWindowBottom('Coupon');
            jQuery('.interactPluginX #iframe5xx').attr('src', '');
            var iframeSrcx5 = CCMgr.options.couponTemplate.split('&')[0] + '?cid=' + CCMgr.options.couponId;
            jQuery('#interactPluginCoupon').show().animate({ bottom: bottom + '%' }, 1800, function () {
                jQuery('.interactPluginX #iframe5xx').attr('src', iframeSrcx5);
                jQuery('.interactPluginX #iframe5xx').unbind().load(that.onIframeLoad);
            });
        }
        if (windowType == "deal") {
            bottom = this.getWindowBottom('Deal');
            jQuery('.interactPluginX #iframe6xx').attr('src', '');
            var iframeSrcx6 = CCMgr.options.dealTemplate.split('&')[0] + '?cid=' + CCMgr.options.dealId;
            jQuery('#interactPluginDeal').show().animate({ bottom: bottom + '%' }, 1800, function () {
                jQuery('.interactPluginX #iframe6xx').attr('src', iframeSrcx6);
                jQuery('.interactPluginX #iframe6xx').unbind().load(that.onIframeLoad);
            });
        }
        if (windowType == "giftCard") {
            bottom = this.getWindowBottom('GiftCard');
            jQuery('.interactPluginX #iframe7xx').attr('src', '');
            var iframeSrcx7 = CCMgr.options.giftCardTemplate.split('&')[0] + '?cid=' + CCMgr.options.giftCardId;
            jQuery('#interactPluginGiftCard').show().animate({ bottom: bottom + '%' }, 1800, function () {
                jQuery('.interactPluginX #iframe7xx').attr('src', iframeSrcx7);
                jQuery('.interactPluginX #iframe7xx').unbind().load(that.onIframeLoad);
            });
        }

        if (windowType == "video") {
            if (!this.isMobile() && jQuery(window).width() > 500) {
                jQuery('#interactPluginVideo').width(jQuery('#interactPluginVideo iframe').attr('width'));
                jQuery('#interactPluginVideo').height(jQuery('#interactPluginVideo iframe').attr('height'));
                jQuery('#interactPluginVideo').height(jQuery('#interactPluginVideo').height() + 50);
                jQuery('#interactPluginVideo').css('margin-left', jQuery('#interactPluginVideo').width() / 2 * -1 + "px");
            }
            bottom = this.getWindowBottom('Video');
            jQuery('#interactPluginVideo').show().animate({ bottom: bottom + '%' }, 1800);
        }
    },
    getWindowBottom: function (key) {
        var bottom;
        jQuery('#interactPlugin' + key).show();
        var availableSpace = (window.innerHeight - jQuery('#interactPlugin' + key).outerHeight()) / 2;
        jQuery('#interactPlugin' + key).hide();
        bottom = (availableSpace / window.innerHeight) * 100;
        if (!bottom) {
            bottom = 10;
        }
        if (bottom < 0.3) {
            bottom = 0.3;
        }
        return bottom;
    },
    openBigerBox: function () {
        jQuery('.contact_win').slideUp("slow");
        jQuery('.interactPluginX .info').show().animate({ bottom: '0' });
        jQuery('.WContainer').animate({ bottom: '-10000px' }, 0, function () { jQuery('.WContainer').hide(); });

    },

    Revert: function () {
        jQuery('.contact_win').slideDown("slow");
        this.closeMobile();
        jQuery('.interactPluginX .info').animate({ bottom: '-400px' }, function () { jQuery('.interactPluginX .info').hide(); });

    },
    Revert2: function () {
        jQuery('.contact_win').slideDown("slow");
        this.closeMobile();
        jQuery('.WContainer').animate({ bottom: '-10000px' }, 0, function () { jQuery('.WContainer').hide(); });
        jQuery('.interactPluginX .uploadButton').show();
        jQuery('.interactPluginX .share-success-message').hide();

    }

};

function jsonConfCallback(json) {
    if (json) {
        CCMgr.start(json, true);
    }
};


// checkout integration
window.addEventListener('message', CCMgr.receiveMessageFromIframe, false);

window.addEventListener("message", function (event) {
    if (!CCMgr.opts) {
        return;
    }
    if (event.origin != CCMgr.opts.callMeBackUrl && event.origin != CCMgr.opts.schedulerUrl) {
        return;
    }
    if (event.data && event.data == 'close' && (jQuery('#interactPluginCallMeBack').is(':visible') || jQuery('#interactPluginScheduler').is(':visible'))) {
        CCMgr.Revert2();
    }
}, false);
