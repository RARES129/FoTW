function changeLanguage() {
  var language = localStorage.getItem("language") || "en";
  localStorage.setItem("language", language);
  if (language === "ro") {
    if (window.location.pathname.includes("/home")) {
      document.getElementById("startGame").innerText = "Start New Game";
      document.getElementById("loadGame").innerText = "Load Game";
      document.getElementById("leaderboard").innerText = "Leaderboard";
      document.getElementById("changeLanguage").innerText = "Română";
      document.getElementById("help").innerText = "Help";
      document.getElementById("about").innerText = "About";
      document.getElementById("logout").innerText = "Logout";
      document.getElementById("adminPage").innerText = "Admin Page";
      document.getElementById("profile").innerText = "profile";
    }
    localStorage.setItem("language", "en");
  } else if (language === "en") {
    if (window.location.pathname.includes("/home")) {
      document.getElementById("startGame").innerText = "Joc Nou";
      document.getElementById("loadGame").innerText = "Continuă";
      document.getElementById("leaderboard").innerText = "Clasament";
      document.getElementById("changeLanguage").innerText = "English";
      document.getElementById("help").innerText = "Ajutor";
      document.getElementById("about").innerText = "Despre";
      document.getElementById("logout").innerText = "Deconectare";
      document.getElementById("adminPage").innerText = "Pagina Admin";
      document.getElementById("profile").innerText = "profil";
    }
    localStorage.setItem("language", "ro");
  }
}

var storedLanguage = localStorage.getItem("language");
var htmlElement = document.getElementsByTagName("html")[0];

if (storedLanguage) {
  if (storedLanguage === "en") {
    // LIMBA ENGLEZA
    htmlElement.setAttribute("lang", "en");
    if (window.location.pathname === "/home") {
      // PAGINA HOME
      document.getElementById("startGame").innerText = "Start New Game";
      document.getElementById("loadGame").innerText = "Load Game";
      document.getElementById("leaderboard").innerText = "Leaderboard";
      document.getElementById("changeLanguage").innerText = "Română";
      document.getElementById("help").innerText = "Help";
      document.getElementById("about").innerText = "About";
      document.getElementById("logout").innerText = "Logout";
      document.getElementById("adminPage").innerText = "Admin Page";
      document.getElementById("profile").innerText = "profile";
    } else if (window.location.pathname === "/game") {
      // PAGINA GAME
      document.getElementById("timer").innerText = "Time left:05:00";
      document.getElementById("score").innerText = "Score";
      document.getElementById("restartButton").innerText = "Restart level";
      document.getElementById("quitLvl").innerText = "Quit level";
      document.getElementById("home").innerText = "Home";
      document.getElementById("about").innerText = "About";
      document.getElementById("help").innerText = "Help";
      document.getElementById("logout").innerText = "Logout";
    } else if (window.location.pathname === "/") {
      // PAGINA LOGIN
      document.getElementById("usernameText").innerText = "Username:";
      document.getElementById("username").placeholder = "Your Username";
      document.getElementById("passwordText").innerText = "Password:";
      document.getElementById("password").innerText = "Your Password";
      document.getElementById("login-button").innerText = "Login";
      document.getElementById("register-button").innerText =
        "Don't have an account?";
    } else if (window.location.pathname === "/register") {
      // PAGINA REGISTER
      document.getElementById("firstNameText").innerText = "First Name:";
      document.getElementById("firstName").placeholder = "Your First Name";
      document.getElementById("lastNameText").innerText = "Last Name:";
      document.getElementById("lastName").placeholder = "Your Last Name";
      document.getElementById("email").placeholder = "Your Email";
      document.getElementById("usernameText").innerText = "Username:";
      document.getElementById("username").placeholder = "Your Username";
      document.getElementById("passwordText").innerText = "Password:";
      document.getElementById("password").placeholder = "Your Password";
      document.getElementById("login-button").innerText =
        "Do you already have an account?";
      document.getElementById("register-button").innerText = "Register";
    } else if (window.location.pathname === "/help") {
      // PAGINA HELP
      document.getElementById("helpText").innerText = "Send us an email !";
      document.getElementById("subject").placeholder = "Subject";
      document.getElementById("message").placeholder = "Message";
      document.getElementById("sendText").value = "Send";
      document.getElementById("home").innerText = "Home";
      document.getElementById("about").innerText = "About";
      document.getElementById("logout").innerText = "Logout";
    } else if (window.location.pathname === "/about") {
      //PAGINA ABOUT
      document.getElementById("titluAbout").innerText =
        "About - Fruits on the Web";
      document.getElementById("rulesTitle").innerText = "Rules";
      document.getElementById("rules").innerText =
       " The rules of Fruits Game are simple: match three or more fruits of the  same type to score points. The more fruits you match in a single move, the higher your score will be. You have a limited time on each level! If there are no matches possible left, please restart the level. Good luck and have fun!";
      document.getElementById("raresInfo").innerText = "Hello, I'm Rares";
      document.getElementById("vladInfo").innerText = "Hello, I'm Vlad";
      document.getElementById("denisInfo").innerText = "Hello, I'm Denis";
      document.getElementById("home").innerText = "Home";
      document.getElementById("about").innerText = "About";
      document.getElementById("logout").innerText = "Logout";
    } else if (window.location.pathname === "/select_lvl") {
      // PAGINA SELECT_LVL
      document.getElementById("selectLvl").innerText =
        "Select Level - Fruits on the Web";
      document.getElementById("easy").innerText = "Easy";
      document.getElementById("medium").innerText = "Medium";
      document.getElementById("hard").innerText = "Hard";
      document.getElementById("play").innerText = "Play Now";
      document.getElementById("home").innerText = "Home";
      document.getElementById("about").innerText = "About";
      document.getElementById("help").innerText = "Help";
      document.getElementById("logout").innerText = "Logout";
    } else {
      // PAGINA EROARE 404
      document.getElementById("404Error").innerText = "OOOPS, PAGE NOT FOUND !";
    }
  } else if (storedLanguage === "ro") {
    // LIMBA ROMANA
    htmlElement.setAttribute("lang", "ro");
    if (window.location.pathname === "/home") {
      // PAGINA HOME
      document.getElementById("startGame").innerText = "Joc Nou";
      document.getElementById("loadGame").innerText = "Continuă";
      document.getElementById("leaderboard").innerText = "Clasament";
      document.getElementById("changeLanguage").innerText = "English";
      document.getElementById("about").innerText = "Despre";
      document.getElementById("help").innerText = "Ajutor";
      document.getElementById("logout").innerText = "Deconectare";
      document.getElementById("adminPage").innerText = "Pagina Admin";
      document.getElementById("profile").innerText = "profil";
    } else if (window.location.pathname === "/game") {
      // PAGINA GAME
      document.getElementById("timer").innerText = "Timp rămas:05:00";
      document.getElementById("score").innerText = "Scor";
      document.getElementById("restartButton").innerText = "Restart nivel";
      document.getElementById("quitLvl").innerText = "Părăsește jocul";
      document.getElementById("home").innerText = "Acasa";
      document.getElementById("about").innerText = "Despre";
      document.getElementById("help").innerText = "Ajutor";
      document.getElementById("logout").innerText = "Deconectare";
    } else if (window.location.pathname === "/") {
      // PAGINA LOGIN
      document.getElementById("usernameText").innerText = "Nume De Utilizator:";
      document.getElementById("username").placeholder = "Nume De Utilizator";
      document.getElementById("passwordText").innerText = "Parolă:";
      document.getElementById("password").placeholder = "Parolă";
      document.getElementById("login-button").innerText = "Conectare";
      document.getElementById("register-button").innerText =
        "Nu ai un cont existent?";
    } else if (window.location.pathname === "/register") {
      // PAGINA REGISTER
      document.getElementById("firstNameText").innerText = "Prenume:";
      document.getElementById("firstName").placeholder = "Prenume";
      document.getElementById("lastNameText").innerText = "Nume:";
      document.getElementById("lastName").placeholder = "Nume";
      document.getElementById("email").placeholder = "Email";
      document.getElementById("usernameText").innerText = "Nume De Utilizator:";
      document.getElementById("username").placeholder = "Nume De Utilizator";
      document.getElementById("passwordText").innerText = "Parolă:";
      document.getElementById("password").placeholder = "Parolă";
      document.getElementById("login-button").innerText =
        "Ai deja un cont existent?";
      document.getElementById("register-button").innerText = "Înregistrare";
    } else if (window.location.pathname === "/help") {
      // PAGINA HELP
      document.getElementById("helpText").innerText = "Trimite-ne un Email !";
      document.getElementById("subject").placeholder = "Subiect";
      document.getElementById("message").placeholder = "Mesaj";
      document.getElementById("sendText").value = "Trimite";
      document.getElementById("home").innerText = "Acasă";
      document.getElementById("about").innerText = "Despre";
      document.getElementById("logout").innerText = "Deconectare";
    } else if (window.location.pathname === "/about") {
      // PAGINA ABOUT
      document.getElementById("titluAbout").innerText =
        "Despre - Fruits on the Web";
      document.getElementById("rulesTitle").innerText = "Reguli";
      document.getElementById("rules").innerText =
        "Regulile jocului Fruits on The Web sunt simple: potriviți trei sau mai multe fructe de același tip pentru a obține puncte. Cu cât potriviți mai multe fructe într-o singură mișcare, cu atât scorul va fi mai mare. Ai un timp limitat pentru fiecare nivel! Pentru a câștiga, ai nevoie de un anumit numar de puncte. Daca nu mai sunt mutari disponibile, reîncepe jocul. Noroc si distracție plăcută!";
      document.getElementById("raresInfo").innerText = "Salut, sunt Rares";
      document.getElementById("vladInfo").innerText = "Salut, sunt Vlad";
      document.getElementById("denisInfo").innerText = "Salut, sunt Denis";
      document.getElementById("home").innerText = "Acasă";
      document.getElementById("help").innerText = "Ajutor";
      document.getElementById("logout").innerText = "Deconectare";
    } else if (window.location.pathname === "/select_lvl") {
      // PAGINA SELECT_LVL
      var playElements = document.querySelectorAll("#play");
      var easyElements = document.querySelectorAll("#easy");
      var mediumElements = document.querySelectorAll("#medium");
      var hardElements = document.querySelectorAll("#hard");

      document.getElementById("selectLvl").innerText =
        "Selecteaza Nivelul - Fruits on the Web";
      for (var i = 0; i < playElements.length; i++) {
        playElements[i].innerText = "Joacă Acum";
      }
      for (var i = 0; i < easyElements.length; i++) {
        easyElements[i].innerText = "Ușor";
      }
      for (var i = 0; i < mediumElements.length; i++) {
        mediumElements[i].innerText = "Mediu";
      }
      for (var i = 0; i < hardElements.length; i++) {
        hardElements[i].innerText = "Greu";
      }
      document.getElementById("home").innerText = "Acasă";
      document.getElementById("about").innerText = "Despre";
      document.getElementById("help").innerText = "Ajutor";
      document.getElementById("logout").innerText = "Deconectare";
    } else {
      // PAGINA EROARE 404
      document.getElementById("404Error").innerText =
        "OOOPS, PAGINA NU A FOST GASITĂ !";
    }
  }
}
