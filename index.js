//jshint esversion:6

//requiring the modules :
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
var bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const homeStartingContent =
  " This is a simple blog website where frontend is designed using html ,css and node js ,express js along with database mongodb used for backend ";
const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();
var salt = bcrypt.genSaltSync(10);
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//Connecting to the database using mongoose.
mongoose.set("strictQuery", false); // to stop warnings
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected ");
}

//Creating an empty array but we are not using it in this version of the app.
// const posts = [];

//Creating Schema for the posts
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
});
const regSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
var msg = "";

//Creating a mongoose model based on this Schema :

const Post = mongoose.model("Post", postSchema);
const Reg = mongoose.model("Reg", regSchema);

app.get("/", function (req, res) {
  // Find all items in the Posts collection and render it into our home page.
  Post.find().then((posts) => {
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts,
      message: "",
    });
  });
});
app.get("/about", function (req, res) {
  res.render("about", { aboutContent: aboutContent });
});

app.get("/contact", function (req, res) {
  res.render("contact", { contactContent: contactContent });
});
app.get("/register", function (req, res) {
  res.render("register", { message: "" });
});
app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/register", function (req, res) {
  // Get the username and password from the form
  var username = req.body.registerUsername;
  var password = req.body.registerPassword;

  // Save the username and password in localStorage (for simplicity)
  const reg = new Reg({
    email: username,
    password: bcrypt.hashSync(password, salt),
  });

  //We are saving the post through our compose route and redirecting back into the home route. A message will be displayed in our console when a post is being saved.

  reg
    .save()
    .then(() => {
      console.log("registered to DB.");

      res.render("register", { message: "successful" });
    })

    .catch((err) => {
      // res.status(400).send("Unable to save post to database.");

      res.render("register", { message: "failed" });
    });
});

app.post("/login", function (req, res) {
  // Get the username and password from the form
  var username = req.body.loginUsername;
  var psd = req.body.loginPassword;

  const requestedRegId = username;
  Reg.findOne({ email: requestedRegId })
    .then(function (reg) {
      if (bcrypt.compareSync(psd, reg.password)) {
        Post.find().then((posts) => {
          res.render("home", {
            startingContent: homeStartingContent,
            posts: posts,
            message: "compose",
          });
        });
      } else {
        console.log("login error");
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

//Saved the title and the post into our blogDB database.
app.post("/compose", function (req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
  });

  //We are saving the post through our compose route and redirecting back into the home route. A message will be displayed in our console when a post is being saved.

  post
    .save()
    .then(() => {
      console.log("Post added to DB.");

      Post.find().then((posts) => {
        res.render("home", {
          startingContent: homeStartingContent,
          posts: posts,
          message: msg,
        });
      });
    })

    .catch((err) => {
      res.status(400).send("Unable to save post to database.");
    });
});

app.get("/posts/:postId", function (req, res) {
  //We are storing the _id of our created post in a variable named requestedPostId
  const requestedPostId = req.params.postId;

  //Using the find() method and promises (.then and .catch), we have rendered the post into the designated page.

  Post.findOne({ _id: requestedPostId })
    .then(function (post) {
      res.render("post", {
        title: post.title,
        content: post.content,
        message: msg,
      });
    })
    .catch(function (err) {
      console.log(err);
    });
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server started on port 3000");
});
