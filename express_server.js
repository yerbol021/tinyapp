const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  const id = generateRandomString();

  urlDatabase[id] = longURL;
  
  console.log(urlDatabase);  // Log the updated database
  res.redirect(`/urls/${id}`); // Redirect to the new URL's page
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
