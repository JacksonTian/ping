var http = require("http");
var ping = require("./ping");
var Framework = require("./framework").Framework;
var Asset = require("./asset").Asset;
var Portal = require("./portal").Portal;

var portal = new Portal();
ping.createServer(portal).listen(8000);
console.log("Portal server is running at 8000 port.");

// Static file server.
var asset = new Asset();
ping.createServer(asset).listen(8001);
console.log("Static file server is running at 8001 port.");

// Dynamic handle.
var framework = new Framework();
ping.createServer(framework).listen(8002);
console.log("Dynamic server is running at 8002 port.");