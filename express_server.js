const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post('/login', (req, res) => {
  const userName = req.body.userName;
  res.cookie('userName', userName);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('userName');
  res.redirect('/urls');
});

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {   
  res.send("Hello world!");
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send('URL not found');
  }
});

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}


app.get("/hello", (req, res) => {
  // const templateVars = { greeting: "Hello World!" };
  // res.render("hello_world", templateVars);
  res.send("Hello World");
});


app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const templateVars = {
    userName: req.cookies["userName"],
  };

  const id = generateRandomString();

  urlDatabase[id] = longURL;
  
  console.log(urlDatabase);  // Log the updated database
  res.redirect(`/urls/${id}`); // Redirect to the new URL's page
  res.render("urls_index", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  console.log('cookies');
  console.log(req.cookies);
  const templateVars = { 
    urls: urlDatabase,
    userName: req.cookies["userName"],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id]; // Assuming urlDatabase is the name of your database
  const templateVars = { id: id, longURL: longURL };
  res.render("urls_show", templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id; // Get the ID from the URL
  const longURL = req.body.longURL; // Get the new long URL from the request body

  // Update the long URL
  if (urlDatabase[id]) {
    urlDatabase[id] = longURL;
    res.redirect('/urls');
  } else {
    res.status(404).send('URL not found');
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
