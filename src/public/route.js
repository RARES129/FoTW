var url = require("url");
var fs = require("fs");
var appRootPath = require("app-root-path");
var path = require("path");
var RegisterRoute = require("./registerDB.js");
var LoginRoute = require("./loginDB.js");
var sendEmail = require("./help.js");
var cookie = require("cookie");

function handleRequest(req, res) {
  var requestUrl = url.parse(req.url).pathname;
  var fsPath;
  if (
    (requestUrl === "/home" ||
      requestUrl === "/game" ||
      requestUrl === "/select_lvl" ||
      requestUrl === "/about" ||
      requestUrl === "/help") &&
    !isLoggedIn(req)
  ) {
    res.statusCode = 302;
    res.setHeader("Location", "/");
    res.end();
    return;
  }

  if ((requestUrl === "/" || requestUrl === "/register") && isLoggedIn(req)) {
    res.statusCode = 302;
    res.setHeader("Location", "/home");
    res.end();
    return;
  }

  if (requestUrl === "/") {
    fsPath = path.resolve(appRootPath + "/src/html/login.html");
  } else if (requestUrl === "/home") {
    fsPath = path.resolve(appRootPath + "/src/html/home.html");
  } else if (requestUrl === "/register") {
    fsPath = path.resolve(appRootPath + "/src/html/register.html");
  } else if (requestUrl === "/help") {
    fsPath = path.resolve(appRootPath + "/src/html/help.html");
  } else if (requestUrl === "/gamepage") {
    fsPath = path.resolve(appRootPath + "/src/html/gamepage.html");
  } else if (requestUrl === "/select_lvl") {
    fsPath = path.resolve(appRootPath + "/src/html/select level.html");
  } else if (requestUrl === "/about") {
    fsPath = path.resolve(appRootPath + "/src/html/about.html");
  } else if (path.extname(requestUrl) === ".css") {
    fsPath = path.resolve(appRootPath + "/src" + requestUrl);
    res.setHeader("Content-Type", "text/css");
  } else if (path.extname(requestUrl) === ".png") {
    fsPath = path.resolve(appRootPath + "/src" + requestUrl);
    res.setHeader("Content-Type", "image/png");
  } else if (path.extname(requestUrl) === ".jpg") {
    fsPath = path.resolve(appRootPath + "/src" + requestUrl);
    res.setHeader("Content-Type", "image/jpeg");
  } else if (path.extname(requestUrl) === ".js") {
    fsPath = path.resolve(appRootPath + "/src" + requestUrl);
    res.setHeader("Content-Type", "text/javascript");
  } else {
    fsPath = path.resolve(appRootPath + "/src/html/404.html");
  }

  if (requestUrl === "/" && req.method === "POST") {
    LoginRoute(req, res);
    return;
  } else if (requestUrl === "/register" && req.method === "POST") {
    RegisterRoute(req, res);
    return;
  } else if (requestUrl === "/help" && req.method === "POST") {
    sendEmail(req, res);
    return;
  } else if (requestUrl === "/logout") {
    res.setHeader(
      "Set-Cookie",
      "Logat=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    );
    res.statusCode = 302;
    res.setHeader("Location", "/");
    res.end();
    return;
  }

  fs.stat(fsPath, function (err, stat) {
    if (err) {
      console.log("ERROR :(((: " + err);
      res.statusCode = 404;
      res.end();
    } else {
      res.statusCode = 200;
      fs.createReadStream(fsPath).pipe(res);
    }
  });
}

function isLoggedIn(req) {
  var cookies = cookie.parse(req.headers.cookie || "");

  if (cookies.Logat) {

    return true;
  } else {
    return false;
  }
}

module.exports = handleRequest;
