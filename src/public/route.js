require("./leaderboard.js");
require("./admin.js");
const bcrypt = require("bcrypt");
var url = require("url");
var fs = require("fs");
var appRootPath = require("app-root-path");
var path = require("path");
var RegisterRoute = require("./registerDB.js");
var LoginRoute = require("./loginDB.js");
const { ProfileRoute, saveDescription } = require("./profile.js");
const { resetPassword } = require("./resetPassword.js");
var changePassword = require("./changePassword.js");
var LeaderboardRoute = require("./leaderboard.js");
var AdminRoute = require("./admin.js");
var sendEmail = require("./help.js");
var Database = require("./database");

var cookie = require("cookie");
const Parser = require("rss-parser");
const parser = new Parser();
var http = require("http");

const db = new Database(process.env.DB_URL, process.env.DB_NAME);

async function startServer() {
    await db.connect();
}

startServer();

function handleRequest(req, res) {
  var requestUrl = url.parse(req.url).pathname;
  var fsPath;
  const parts = requestUrl.split("/");
  const value = parts[parts.length - 1];
  if (
    (requestUrl === "/home" ||
      requestUrl === "/game" ||
      requestUrl === "/select_lvl" ||
      requestUrl === "/about" ||
      requestUrl === "/help" ||
      requestUrl === "/leaderboard" ||
      requestUrl === "/admin" ||
      requestUrl === "/profile") &&
    !isLoggedIn(req)
  ) {
    res.statusCode = 302;
    res.setHeader("Location", "/");
    res.end();
    return;
  }

  if (
    (requestUrl === "/" ||
      requestUrl === "/register" ||
      requestUrl === "/reset_password" ||
      requestUrl === "/change_password") &&
    isLoggedIn(req)
  ) {
    res.statusCode = 302;
    res.setHeader("Location", "/home");
    res.end();
    return;
  }

  if (requestUrl === "/admin" && !isAdmin(req)) {
    res.statusCode = 302;
    res.setHeader("Location", "/home");
    res.end();
    return;
  }

  if (requestUrl === "/admin/reset" && isAdmin(req)) {
    db.deleteAllUsers(); 
    res.statusCode = 302;
    res.setHeader("Location", "/logout");
    res.end();
    return;
  } else if (requestUrl === `/admin/reset/${value}` && isAdmin(req)) {
    db.deleteUser(value); 
    res.statusCode = 302;
    res.setHeader("Location", "/admin");
    res.end();
    return;
  }else if (requestUrl === `/admin/setadmin/${value}` && isAdmin(req)) {
    db.setAdmin(value); 
    res.statusCode = 302;
    res.setHeader("Location", "/admin");
    res.end();
    return;
  } else if (
    requestUrl === "/admin/reset" ||
    requestUrl === `/admin/reset/${value}`
  ) {
    res.statusCode = 302;
    res.setHeader("Location", "/home");
    res.end();
    return;
  }

  if (requestUrl === "/") {
    fsPath = path.resolve(appRootPath + "/src/html/login.html");
  } else if (requestUrl === "/home") {
    ProfileRoute(req, res);
    if(isAdmin(req)){
      fsPath = path.resolve(appRootPath + "/src/html/homeAdmin.html");
    }
    else{
      fsPath = path.resolve(appRootPath + "/src/html/home.html");
    }

  } else if (requestUrl === "/register") {
    fsPath = path.resolve(appRootPath + "/src/html/register.html");
  } else if (requestUrl === "/help") {
    fsPath = path.resolve(appRootPath + "/src/html/help.html");
  } else if (requestUrl === "/game") {
    fsPath = path.resolve(appRootPath + "/src/html/gamepage.html");
  } else if (requestUrl === "/select_lvl") {
    fsPath = path.resolve(appRootPath + "/src/html/select level.html");
  } else if (requestUrl === "/leaderboard") {
    fsPath = path.resolve(appRootPath + "/src/html/leaderboard.html");
    res.setHeader("Content-Type", "text/html"); 
  } else if (requestUrl === "/about") {
    fsPath = path.resolve(appRootPath + "/src/html/about.html");
  } else if (requestUrl === "/admin") {
    fsPath = path.resolve(appRootPath + "/src/html/admin.html");

  } else if (requestUrl === "/reset_password") {
    fsPath = path.resolve(appRootPath + "/src/html/resetPassword.html");
  } else if (requestUrl === "/change_password") {
    fsPath = path.resolve(appRootPath + "/src/html/changePassword.html");

  } else if (requestUrl === "/profile") {
    fsPath = path.resolve(appRootPath + "/src/html/profile.html");

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
  } else if (requestUrl === "/reset_password" && req.method === "POST") {
    resetPassword(req, res);
    return;
  } else if (requestUrl === "/change_password" && req.method === "POST") {
    changePassword(req, res);
    return;
  } else if (requestUrl === "/profile" && req.method === "POST") {
    saveDescription(req,res);
    return;
  } else if (requestUrl === "/logout") {
    res.setHeader(
      "Set-Cookie",
      [
        `Username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`,
        `Logat=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`,
        `Admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`,
        `selectedLevel=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      ]
    );
    res.statusCode = 302;
    res.setHeader("Location", "/");
    res.end();
    return;
  }

  fs.stat(fsPath, async(err, stat) => {
    if (err) {
      console.log("ERROR :(((: " + err);
      res.statusCode = 404;
      res.end();
    } else {
      res.statusCode = 200;
      await fs.createReadStream(fsPath).pipe(res);
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

function isAdmin(req) {
  var cookies = cookie.parse(req.headers.cookie || "");
  if (bcrypt.compareSync("1", cookies.Admin)) {
    return true;
  } else {
    return false;
  }
}

module.exports = handleRequest;
