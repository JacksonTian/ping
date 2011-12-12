(function (global) {
    var Portal = new EventProxy();
    Portal.bigPipe = function (id, html) {
        document.getElementById(id).innerHTML = html;
    };

    global.Portal = Portal;
}(this));