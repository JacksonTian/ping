var get = exports.get = {};
get.index = function () {
    var response = this.response;
    response.setHeader("Content-Type", "text/html");
    response.writeHead("200");
    response.end("<h1>Hello NodeV5.</h1>");
};
