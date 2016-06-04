/*
To utilize add this to your page somewhere:
        <script language="javascript" src="http://www.stam.com/beforeYouGo/camilyo_byg.js"></script>
        <script language="javascript">
            cambyg_init('<YOUR-CAMILYO-BEFORE-YOU-GO-PAGE-URL>');
        </script>
*/
var cambyg_ignoreMouseLeave = false;



function cambyg_getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
    }
    return "";
}

function cambyg_setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; ";// + expires;
}

function cambyg_init(byg_page_url) {
    //document.addEventListener("DOMContentLoaded", function(event) {
    $('document').ready(function () {

        if (byg_page_url && byg_page_url != '') {
            cambyg_onready(byg_page_url);
            return;
        }

        $.ajax({
            type: 'GET',
            url: "/__get_byg_url__",
            async: true,
            success: function (sUrl) {
                sUrl = sUrl.trim();
                if (sUrl && sUrl != '') {
                    cambyg_onready(sUrl);
                } 
            }
        });
    });
}

function cambyg_onready(byg_page_url) {

    var newDiv = document.createElement('div');
    newDiv.setAttribute('id', 'camilyo_byg_bg');
    newDiv.setAttribute('style', 'visibility: hidden;z-index:-10000;height: 100%;width: 100%;position: fixed;top: 0;left: 0;');
    newDiv.innerHTML =
        '<div style="height: 100%;width: 100%;position: absolute;top: 0;left: 0;background-color: grey;opacity: 0.8;"></div>' +
        '<div style="height: 100%;overflow: hidden;width: 100%;display: table;position: absolute;top: 0;left: 0;">' +
            '<div style="position: absolute;top: 50%;width: 100%;text-align: center;display: table-cell;vertical-align: middle;position: static;">' +
                '<div id="camilyo_byg_iframe_div" style="opacity: 1; position: relative;top: -50%;text-align: left;width: 1200px;height: 1000px;margin-left: auto;margin-right: auto;">' +
                    '<iframe style="width:100%;height: 100%; box-sizing: content-box;" src="' + byg_page_url + '"></iframe>' +
                '</div>' +
            '</div>' +
        '</div>';
    document.querySelector('body').appendChild(newDiv);

    $('#camilyo_byg_bg').click(function () {
        var prevDiv = document.querySelector('#camilyo_byg_bg');

        if (prevDiv) {
            prevDiv.style.visibility = 'hidden';
            prevDiv.style.zIndex = -10000;
        }
    });

    //window.addEventListener("message", cambyg_receiveMessage, false);
    $(window).on('message', function (e) {

        var data = e.originalEvent.data;

        if (data.indexOf('height:') == 0) {
            var heightStr = data.replace('height:', '');
            $('#camilyo_byg_iframe_div').css('height', heightStr + 'px');
            return;
        }

        if (data.indexOf('width:') == 0) {
            var widthStr = data.replace('width:', '');
            $('#camilyo_byg_iframe_div').css('width', widthStr + 'px');
            return;
        }

        if (data != 'close_camilyo_byg') {
            return;
        }

        var prevDiv = document.querySelector('#camilyo_byg_bg');

        if (prevDiv) {
            prevDiv.style.visibility = 'hidden';
            prevDiv.style.zIndex = -10000;
        }
    });

    //document.addEventListener("mouseenter", function (event) {
    $('body').mouseenter(function (event) {
        cambyg_ignoreMouseLeave = true;
        setTimeout(function () {
            cambyg_ignoreMouseLeave = false;
        }, 50);
    });



    //document.querySelector('body').addEventListener("mouseleave", function (event) {
    $('body').mouseleave(function (event) {

        if (cambyg_ignoreMouseLeave) {
            return;
        }

        var prevDiv = document.querySelector('#camilyo_byg_bg');

        var c1 = cambyg_getCookie('c1');

        if (c1 == 'yes') {
            return;
        }

        if (event.clientY > 30 &&
            event.clientY < window.innerHeight - 30 &&
            event.clientX > 30 &&
            event.clientX < window.innerWidth - 30) {
            return;
        }

        if (prevDiv) {
            prevDiv.style.visibility = 'visible';
            prevDiv.style.zIndex = 300000;

            cambyg_setCookie('c1', 'yes', 10);
        }
        return;
    });
}
