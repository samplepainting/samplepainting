$(function () {

    if ($.browser.msie) {
        var version = parseFloat($.browser.version);
        if (version < 9 && $.cookie('dontShowIe8Message') != 'true') {
            $.cookie('dontShowIe8Message', 'true');
            showMessage();
        }
    }

    function showMessage() {
        var sMessage = 'Some features on this site are optimized for HTML5 browsers only and will not be displayed correctly onto your browser. To get full support, please switch to IE9 or above, Firefox or Chrome.';
        alert(sMessage);

    }

});