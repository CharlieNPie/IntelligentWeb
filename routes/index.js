var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const Event = require("../models/event");
const PostObject = require("../models/post");
const CommentObject = require("../models/comment")

/** Function to check if user has logged in */
function checkLoggedIn(req) {
  if (req) {
    return true;
  } else {
    return false;
  }
}

/** GET home page. */
router.get("/", function(req, res, next) {
  var loggedInBool = checkLoggedIn(req.user);
  res.render("index", {loggedIn: loggedInBool});
});

/** PROFILE */
router.get("/profile", function(req, res, next) {
  res.render("profile");
});

router.get("/explore", function(req, res, next) {
  var loggedInBool = checkLoggedIn(req.user);
  res.render("explore", {loggedIn: loggedInBool});
});

router.get("/events/new", function(req, res) {
  if (req.user) {
    console.log(req.user);
    res.render("newEvent", {loggedIn: true});
  } else {
    console.log("Not logged in.")
    res.redirect("/users/login");
  }
});

/* GET event page */
router.get("/events/:eventId", function(req, res) {
  var loggedInBool = checkLoggedIn(req.user);
  res.render("event", { id: req.params.eventId, loggedIn: loggedInBool });
});

/* GET event map page */
router.get("/events/:eventId/map", function(req, res) {
  var loggedInBool = checkLoggedIn(req.user);
  res.render("eventMap", { id: req.params.eventId, loggedIn: loggedInBool });
});

/* GET edit event page */
router.get("/events/:eventId/edit", function(req, res) {
  var loggedInBool = checkLoggedIn(req.user);
  res.render("editEvent", { id: req.params.eventId, loggedIn: loggedInBool });
});

router.get("/events/:eventId/posts/new", function(req, res) {
  var loggedInBool = checkLoggedIn(req.user);
  if (loggedInBool) {
    res.render("newPost", { eventId: req.params.eventId, loggedIn: true, username: req.user._id, avatar: req.user.avatar });
  } else {
    res.redirect("/users/login");
  }
});

/* GET post page */
router.get("/events/:eventId/posts/:postId", function(req, res) {
  var loggedInBool = checkLoggedIn(req.user);
  res.render("post", {
    eventId: req.params.eventId,
    postId: req.params.postId,
    loggedIn: loggedInBool
  });
});

/**
 *  POST the data about the event.
 *  parameters in body:
 *    name : name of the event
 *
 */
router.post("/create_event", function(req, res, next) {
  // Creating event object using mongo Model
  const newEvent = new Event({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    date: req.body.date,
    image: req.body.image,
    description: req.body.description,
    location: req.body.location,
    organiser: "borja"
  });
  // Saving object into mongoDB & responding to client
  newEvent
    .save()
    .then(() => {
      res.setHeader("Content-Type", "application/json");
      res.status(200).json(newEvent);
    })
    .catch(() => res.status(500).json({ error: "Could not create event" }));
});

/**
 * POST data used to add a new post with image attached
 */
router.post("/upload_picture", function(req, res, next) {
  var picData = req.body.imageBlob;
  var text = req.body.text;
  var eventId = req.body.eventId;
  var author = req.user.username;
  var avatar = req.user.avatar;

  console.log(author);
  console.log(avatar);

  var data = getPost(text, picData, author, avatar); 

  const newPost = new PostObject({
    _id: data.id,
    author: data.author,
    avatar: data.avatar,
    comments: data.comments,
    date: data.date,
    image: data.image,
    location: data.location,
    text: data.text
  });

  var query = {_id: eventId};
  var newVal = {$push: {posts: newPost}};
  Event.updateMany(query, newVal, function(err, res) {
  });

  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(data));
});

/**
 * POST data that updates the event details
 */
router.post("/update_event", function(req, res, next) {
  const event = getEvent(
    req.body.name,
    req.body.date,
    req.body.image,
    req.body.description,
    req.body.location
  );
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(event));
});

/**
 * POST data to add comments to an event
 */
router.post("/create_comment", function(req, res, next) {
  console.log(req.user.avatar, req.user.username);
  const comment = getComment(req.user.username, req.body.text, req.user.avatar);

  const eventId = req.body.eventId;
  const postId = req.body.postId;

  const newComment = new CommentObject({
    _id: comment.id,
    author: comment.author,
    text: comment.text,
    avatar: comment.avatar,
    date: comment.date,
  });

  var postQuery = {_id: postId};
  var newVal = {$push: {comments: newComment}};

  Event.findOne({_id: eventId}, function(err, res) {
    res.posts.find(function(element) {
      return element._id == postId;
    }).comments.push(newComment);

    Event.replaceOne({_id: eventId}, res, function(err, res) {
      //console.log(res);
    })

  });


  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(comment));
});

class LocalEvent {
  constructor(name, date, image, description, organiser, location, posts) {
    this.name = name;
    this.date = date;
    //new Date((date.substring(5,7)+"/"+date.substring(8)+"/"+date.substring(0,4)));
    this.image = image;
    this.description = description;
    this.organiser = organiser;
    this.location = location;
    this.posts = posts;
  }
}
function getEvent(name, date, image, description, location) {
  return new LocalEvent(
    name,
    date,
    image,
    description,
    "maniOrganisers",
    location,
    []
  );
}

class Post {
  constructor(id, author, avatar, comments, date, image, location, text) {
    this.author = author;
    this.avatar = avatar;
    this.comments = comments;
    this.image = image;
    this.location = location;
    this.text = text;
    this.id = id;
    var months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    this.date = date.getDate() + " " + months[date.getMonth()];
  }
}

function getPost(text, image, author, avatar) {
  return new Post(new mongoose.Types.ObjectId(), author, avatar, [], new Date(), image, null, text);
}

class Comment {
  constructor(id, author, text, avatar) {
    this.id = id;
    this.author = author;
    this.text = text;
    this.avatar = avatar;
    var months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    var d = new Date();
    this.date = d.getDate() + " " + months[d.getMonth()];
  }
}

function getComment(author, text, avatar) {
  return new Comment(
    new mongoose.Types.ObjectId(),
    author,
    text,
    avatar
  );
}

module.exports = router;

