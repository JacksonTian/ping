var http = require("http");
var ping = require("./ping");
var Framework = require("./framework").Framework;
var Asset = require("./asset").Asset;

// Dynamic handle.
var framework = new Framework();
ping.createServer(framework).listen(8000);
console.log("Running at 8000 port.");

// Static file server.
var asset = new Asset();
ping.createServer(asset).listen(8080);

console.log("Running at 8080 port.");
