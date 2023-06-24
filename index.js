var http = require("http");
require("dotenv").config();

const PORT = process.env.PORT;

var Routes = require("./src/public/route.js");
var Server =require("./src/public/server.js");
var server = http.createServer(Routes, Server);

server.listen(PORT, function () {
  console.log("Server listening on: http://localhost:%s", PORT);
});
