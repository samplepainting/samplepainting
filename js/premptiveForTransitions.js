$(function () {
    setTimeout(function () {
        pageArrayProcess();
    }, 0);
});

var premptivePages = [];

function loadPage(page, title) {
    var transitionOpt = { 'isFullTransition': true};
    var options =
     {
         type: "GET",
         url: "http://" + window.location.host + '/' + title,
         data: transitionOpt,
         contentType: "application/json; charset=utf-8",
         dataType: "json",
         async: true,
         success: function (response) {
             premptivePages[page] = response;
             pageArrayProcess();
         },
         error: function (response) {
             return;
         }
     };

    jQuery.ajax(options);
}


function pageArrayProcess() {
    var key = 0;
    if (window.pagesIds) {
        for (var page in window.pagesIds) {
            loadPage(page, window.pagesIds[page]);
            key = page;
            break;
        }
        if (key != 0) {
            delete window.pagesIds[key];
        }
    }
}