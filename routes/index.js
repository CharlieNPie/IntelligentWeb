var express = require("express");
var router = express.Router();
const uuidv1 = require("uuid/v1");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Music Festivals" });
});

/* GET event page */
router.get("/events/:eventId", function(req, res) {
  res.render("events", { id: req.params.eventId });
});

/* GET edit event page */
router.get("/events/:eventId/edit", function(req, res) {
  res.render("updateEvent", { id: req.params.eventId, title: "Edit Event" });
});

/* GET post page */
router.get("/events/:eventId/posts/:postId", function(req, res) {
  res.render("post", {
    eventId: req.params.eventId,
    postId: req.params.postId
  });
});

/**
 *  POST the data about the event.
 *  parameters in body:
 *    name : name of the event
 *
 */
router.post("/create_event", function(req, res, next) {
  const event = getEvent(req.body.name, req.body.date, req.body.location);
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(event));
});

/**
 * POST data used to add posts to an event
 */
router.post("/create_post", function(req, res, next) {
  const post = getPost(req.body.text);
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(post));
});

/**
 * POST data that updates the event details
 */
router.post("/update_event", function(req, res, next) {
  updatedEvent = req.body;
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(updatedEvent));
});

/**
 * POST data to add comments to an event
 */
router.post("/create_comment", function(req, res, next) {
  const comment = getComment(req.body.text);
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(comment));
});

/**
 *
 * @constructor
 */
class Event {
  constructor(name, date, image, organiser, location, posts) {
    this.name = name;
    this.date = date;
    this.image = image;
    this.organiser = organiser;
    this.location = location;
    this.posts = posts;
  }
}
function getEvent(name, date, location) {
  return new Event(name, date, null, null, location, []);
}

class Post {
  constructor(id, author, comments, date, image, location, text) {
    this.author = author;
    this.comments = comments;
    this.date = date;
    this.image = image;
    this.location = location;
    this.text = text;
    this.id = id;
  }
}
function getPost(text) {
  return new Post(uuidv1(), "HasanAsim", [], new Date(), null, null, text);
}

class Comment {
  constructor(id, author, text) {
    this.id = id;
    this.author = author;
    this.text = text;
  }
}

function getComment(text) {
  return new Comment(uuidv1(), "BigBorja", text);
}

module.exports = router;
