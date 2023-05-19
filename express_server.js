const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  abc: {
    id: "abc",
    email: "a@a",
    password: "1111",
  },
  def: {
    id: "def",
    email: "s@s",
    password: "2222",
  },
};

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

app.get('/register', (req, res) => {
  res.render('urls_registration');
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send('email or password not found');
    return;
  }

  const existingUser = findUserByEmail(email, users);
  if (existingUser) {
    res.status(400).send('Email already exists');
    return;
  }

  const userId = generateRandomString();

  const newUser = {
    id: userId,
    email,
    password
  };

  users[userId] = newUser;

  res.cookie('user_id', userId);
  res.redirect('/urls');
});

function findUserByEmail(email, database) {
  for (let user in database) {
    if (email === database[user]["email"]) {
      return database[user];
    }
  }
  return null;
};

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email, users);

  if (user && user.password === password) {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  } else {
    res.status(401).send('Invalid email or password');
  }
});


app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
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

app.get('/urls', (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  res.render('urls_index', templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  res.render("urls_new",templateVars);
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
