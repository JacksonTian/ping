var http = require("http");
var cp = require("child_process");

var map = {
    "www.nodev5.com": "www",
    "assets.nodev5.com": "assets"
};

var fork = function () {
    var worker = cp.fork.apply(cp, arguments);
    worker.on('message', function (message) {
        
    });
    return worker;
};

var workers = {
    www: cp.fork(__dirname + "/asset_app.js", [8001]),
    assets: cp.fork(__dirname + "/v5_app.js", [8002]),
};

var server = http.createServer(function(request, response) {
    // TODO
    switch()
        
    var worker = workers[map[request.headers.host]] || workers["assets"];
    //worker.send("", server._handle);
    // console.log(server);

    // response.writeHead(200);
    // response.end();
});

server.on("connection", function (socket) {
    console.log(socket);
});

server.listen(8080);
console.log("Server runing at port: 80.");
