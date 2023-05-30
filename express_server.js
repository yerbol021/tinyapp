const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require('./helpers');

app.use(cookieSession({
  name: 'session',
  keys: ['secret-key'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  encrypt: true,
}));

app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "abc",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "def",
  }
};

const users = {
  abc: {
    id: "abc",
    email: "a@a",
    password: "$2a$10$E6EpFm41UqMPfAHV8L0jXuurl4EWIkRcV9UwCjddKU.oySdj6kQT2",
  // deffault password is 11
  },
  def: {
    id: "def",
    email: "s@s",
    password: "$2a$10$E6EpFm41UqMPfAHV8L0jXuurl4EWIkRcV9UwCjddKU.oySdj6kQT2",
  // deffault password is 11
  },
};

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

function urlsForUser(id) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}

app.get('/register', (req, res) => {
  const userId = req.session.user_id;
  if (userId && users[userId]) {
    res.redirect('/urls');
  } else {
    const templateVars ={
      user: null,
    }
    res.render('urls_registration', templateVars);
  }
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send('email or password not found');
    return;
  }

  const existingUser = getUserByEmail(email, users);
  if (existingUser) {
    res.status(400).send('Email already exists');
    return;
  }

  const userId = generateRandomString();

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id: userId,
    email,
    password: hashedPassword
  };

  users[userId] = newUser;

  req.session.user_id = userId;
  res.redirect('/urls');
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    res.redirect('/urls');
  } else {
    res.status(403).send('Invalid email or password');
  }
});


app.get('/login', (req, res) => {
  const userId = req.session.user_id;
  if (userId && users[userId]) {
    res.redirect('/urls');
  } else {
    const templateVars = {
        user: null
    }
    res.render('urls_loginForm', templateVars);
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!userId || !user) {
    res.status(401).send('Please login or register to view your URLs');
  } else {
    const userURLs = urlsForUser(userId);
    const templateVars = {
      urls: userURLs,
      user: user
    };
    res.render('urls_index', templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!userId || !user) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: user
    };
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId || !users[userId]) {
    res.status(401).send("You need to be logged in to create new URLs.");
  } else {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: userId
    };
    res.redirect("/urls");
  }
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  if (!userId || !users[userId]) {
    res.status(401).send("Please login or register to view this URL");
    return;
  }

  const id = req.params.id;
  const url = urlDatabase[id];

  if (!url) {
    res.status(404).send('URL not found');
    return;
  }

  if (url.userID !== userId) {
    res.status(403).send('You do not own this URL');
    return;
  }
    const templateVars = {
      user: users[userId],
      longURL: url.longURL,
      id: id,
    }
  res.render('urls_show', templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  const userId = req.session.user_id;
  if (!userId || !users[userId]) {
    res.status(401).send("Please login or register to delete this URL");
    return;
  }

  const id = req.params.id;
  const url = urlDatabase[id];

  if (!url) {
    res.status(404).send('URL not found');
    return;
  }

  if (url.userID !== userId) {
    res.status(403).send('You do not own this URL');
    return;
  }

  delete urlDatabase[id];
  res.redirect('/urls');
});

app.get('/u/:id', (req,res) =>{
  const id = req.params.id;
  const url = urlDatabase[id];

  if (!url) {
    res.status(404).send('URL not found');
    return;
  }
  url.longURL;
  res.redirect(url.longURL);
})

app.post('/urls/:id/edit', (req, res) => {
  const userId = req.session.user_id;
  if (!userId || !users[userId]) {
    res.status(401).send("Please login or register to update this URL");
    return;
  }

  const id = req.params.id;
  const url = urlDatabase[id];

  if (!url) {
    res.status(404).send('URL not found');
    return;
  }

  if (url.userID !== userId) {
    res.status(403).send('You do not own this URL');
    return;
  }

  const longURL = req.body.updatedLongUrl;
  urlDatabase[id].longURL = longURL;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
