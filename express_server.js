// require modules we will need.
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// Allows us to ise ejs
app.set("view engine", "ejs");

// Stores are first two URLs will store new ones here
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// used to read post request in a parameter called body
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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

// Allows data from our database to be used in ejs page, urls_index.ejs
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

// Stores a random shortURL + submitted longURL associatedd and redirects to shortURL specific page
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Sends ejs page urls_new to the client browser.
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Sends client to longURL of it's associated shortURL using params.
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Sends ejs page urls_show to client browser which shows the shortURL and associated longURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// Modifies urlDatabase with new longURL stored in body
app.post('/urls/:shortURL', (req, res) =>{
  urlDatabase[req.params.shortURL] = req.body.longURL;
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