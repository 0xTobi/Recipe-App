"use strict";

const express = require("express"),
  app = express(),
  router = require("./routes/index"),
  layouts = require("express-ejs-layouts"),
  mongoose = require("mongoose"),
  methodOverride = require("method-override"),
  expressSession = require("express-session"),
  cookieParser = require("cookie-parser"),
  connectFlash = require("connect-flash"),
  expressValidator = require("express-validator"),
  passport = require("passport"),
  User = require("./models/user");

  mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI ||
  "mongodb://localhost:27017/recipe_db",
  { 
    useNewUrlParser: true ,
	  useFindAndModify: false,
    useCreateIndex: true 
  });

// const db = mongoose.connection;

//
// const connectDb = async () => {
//   console.log('I can run')
//   await mongoose
//   .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false" , {
//     keepAlive: true,
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false,
//   })
//   .then((res) => {
//     console.log(`Connected to Mongo! Database name: "${res.connections[0].name}"`);
//     // console.log(res.connections.lenght()); not a funtion
//     mongoose.set('useCreateIndex', true);
//   })
//   .catch((err) => {
//     console.error('Error connecting to mongo', err);
//   });
//   // return mongoose
//   }
  
//   connectDb();
// 

const db = mongoose.connection;
db.once("open", () => {
  console.log("Successfully connected to MongoDB using Mongoose!");
});

app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");
app.set("token", process.env.TOKEN || "recipeT0k3n");

app.use(express.static("public"));
app.use(layouts);
app.use(
  express.urlencoded({
    extended: false
  })
);

app.use(
  methodOverride("_method", {
    methods: ["POST", "GET"]
  })
);

app.use(express.json());
app.use(cookieParser("secret_passcode"));
app.use(
  expressSession({
    secret: "secret_passcode",
    cookie: {
      maxAge: 4000000
    },
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(connectFlash());

app.use((req, res, next) => {
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  res.locals.flashMessages = req.flash();
  next();
});
app.use(expressValidator());

app.use("/", router);

const server = app.listen(app.get("port"), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`);
}),
io = require("socket.io")(server);
require('./controllers/chatController')(io);

// it's important to require chatController.js after definig the io object, Otherwise it will not have io configured

// socket.io works by emiting and handling events

// socket.io can be configured to work over multiple specific chat rooms and different namesapces