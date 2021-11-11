// require modules we will need.
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// Allows us to ise ejs
app.set("view engine", "ejs");

// Stores are first two URLs will store new ones here

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID"
  }
};

// Stores first two users, will store more later as registered
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// used to read post request in a parameter called body
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// used to read cookies created by the browser client
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// middleware to log requests between server and browser
const morgan = require('morgan');
app.use(morgan("dev"));

// function to generate 6 digit random alphanumerical ShortURL
const generateRandomString = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 6;
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomNumber = Math.floor(Math.random() * characters.length);
    randomString += characters[randomNumber];
  }
  return randomString;
};

// registerCatcher is used to check if registration is valid (helper later)
const registerCatcher = (userList, email, password) => {
  for (const user in userList) {
    if (email === userList[user]["email"]) {
      return {error: "Email Taken"};
    } if (password === "" || email === "") {
      return {error: "Email or Password empty"};
    }
  }
  return {error: null};
};

// loginCatcher is used to check if the login information sent by client is correct
const loginCatcher = (userList, email, password) => {
  for (const user in userList) {
    if (email === userList[user]["email"]) {
      if (password === userList[user]["password"]) {
        return {error: null, data: userList[user]["id"]};
      }
      return {error: "Password is incorrect", data: null};
    }
  }
  return {error: "Email not registered in datatabase", data: null};
};

const urlsForUser = (loginID, database) => {
  const returnObject = {};
  for (const data in database) {
    if (database[data]["userID"] == loginID) {
      returnObject[data] = database[data]["longURL"];
    }
  }
  return returnObject;
};

// First get just says hello in browser
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Sends urlDatabse to client in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Example of sending HTML to the client without ejs
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Sent ejs file urls_register to the client, a registration page
app.get("/register", (req, res) => {
  const templateVars = {user_id: req.cookies["user_id"]};
  res.render("urls_register", templateVars);
});

// Registers email and password to users. Error if email in use or emal/pssword blank
app.post("/register", (req, res) =>{
  const {email, password} = req.body;
  const {error} = registerCatcher(users, email, password);
  if (error) {
    console.log(error);
    res.sendStatus(400);
    return;
  }
  const id = generateRandomString();
  users[id] = {id: id, email: email, password: password};
  res.cookie("user_id", users[id]);
  res.redirect('/urls');
});

// Allows data from our database to be used in ejs page, urls_index.ejs
app.get("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    urlsForUser(req.cookies["user_id"]["id"], urlDatabase)
    const templateVars = {user_id: req.cookies["user_id"], urls: urlsForUser(req.cookies["user_id"]["id"], urlDatabase)};
    res.render("urls_index", templateVars);
  } else {
    const templateVars = {user_id: req.cookies["user_id"]}
    res.render("urls_index", templateVars);
  }
});

// Stores a random shortURL + submitted longURL associatedd and redirects to shortURL specific page
app.post("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {};
    urlDatabase[shortURL]["longURL"] = [req.body.longURL];
    urlDatabase[shortURL]["userID"] = [req.cookies["user_id"]["id"]];
    res.redirect(`/urls/${shortURL}`);
    return;
  }
  res.send("You are not logged in");
});

// New Login right now is a simple login page
app.get("/login", (req, res) => {
  const templateVars = {user_id: req.cookies["user_id"]};
  res.render("urls_login", templateVars);
});

// Login logic implemented, allows client to input login information to remember user + create cookie
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const {error, data} = loginCatcher(users, email, password);
  if (error) {
    console.log(error);
    res.sendStatus(403);
    return;
  }
  res.cookie("user_id", users[data]);
  res.redirect('/urls');
});

// Logout deletes cookie and forgets the user_id
app.post("/logout", (req, res) =>{
  res.clearCookie("user_id");
  res.redirect('/urls');
});

// Sends ejs page urls_new to the client browser.
app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    const templateVars = {user_id: req.cookies["user_id"]};
    res.render("urls_new", templateVars);
    return;
  }
  res.redirect('/urls');
});

// Sends client to longURL of it's associated shortURL using params.
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    res.redirect(longURL);
    return;
  }
  res.send("error: id does not exist");
});

// Sends ejs page urls_show to client browser which shows the shortURL and associated longURL
app.get("/urls/:shortURL", (req, res) => {
  const ownedURL = urlsForUser(req.cookies["user_id"]["id"], urlDatabase); 
  if (req.cookies["user_id"]) {
    if (ownedURL) {
      for (const url in ownedURL) {
        if (url === req.params.shortURL) {
          const templateVars = { user_id: req.cookies["user_id"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"] };
          res.render("urls_show", templateVars);
          return;
        }
      }
    }
    res.send("This URL does not belong to you.")
    return;
  }
  res.send("User not logged in.");
});

// Modifies urlDatabase with new longURL stored in body
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
  res.redirect('/urls');
});

// Deletes a shortURL and associate longURL and redirects to /urls
app.post('/urls/:shortURL/delete', (req, res) =>{
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// Creates a listener on a specific port, in this case 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});