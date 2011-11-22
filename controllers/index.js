var get = exports.get = {};
get.index = function () {
    var response = this.response;
    response.setHeader("Content-Type", "text/html");
    response.writeHead("200");
    response.end("<h1>Hello NodeV5.</h1>\n");
};
get.none = function () {
    this.none();
};
get.json = function () {
    var obj = {"Hello": "world!"};
    this.renderJSON(obj);
};
get.redirect = function () {
    this.redirect("https://github.com/JacksonTian/nodev5");
};
get.render = function () {
    var obj = {"title": "NodeV5"};
    this.renderView("index.html", obj);
};
