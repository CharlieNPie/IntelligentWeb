var express = require("express");
var router = express.Router();
const uuidv1 = require("uuid/v1");

/** GET home page. */
router.get("/", function(req, res, next) {
  res.render("index");
});

router.get("/profile", function(req, res, next) {
  res.render("profile");
});

router.get("/explore", function(req, res, next) {
  res.render("explore");
});

router.get("/events/new", function(req, res) {
  res.render("newEvent");
});

/* GET event page */
router.get("/events/:eventId", function(req, res) {
  res.render("event", { id: req.params.eventId });
});

/* GET event page */
router.get("/events/:eventId/map", function(req, res) {
  res.render("eventMap", { id: req.params.eventId });
});

/* GET edit event page */
router.get("/events/:eventId/edit", function(req, res) {
  res.render("editEvent", { id: req.params.eventId });
});

router.get("/events/:eventId/posts/new", function(req, res) {
  res.render("newPost", {
    eventId: req.params.eventId
  });
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
 * POST data used to add posts to an event
 */
router.post("/create_post", function(req, res, next) {
  const post = getPost(req.body.text);
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(post));
});

/**
 * POST data used to add a new post with image attached
 */
router.post("/upload_picture", function(req, res, next) {
  var picData = req.body.imageBlob;
  var text = req.body.text;

  var data = getPost(text, picData);

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
  const comment = getComment(req.body.text);
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(comment));
});

class Event {
  constructor(name, date, image, description, organiser, location, posts) {
    this.name = name;
    this.date = date;
    this.image = image;
    this.description = description;
    this.organiser = organiser;
    this.location = location;
    this.posts = posts;
  }
}
function getEvent(name, date, image, description, location) {
  return new Event(
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
  constructor(id, author, comments, date, image, location, text) {
    this.author = author;
    this.avatar =
      "https://pbs.twimg.com/profile_images/1059400736054935552/adJ8r021_400x400.jpg";
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
function getPost(text, image) {
  return new Post(uuidv1(), "username", [], new Date(), image, null, text);
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

function getComment(text) {
  return new Comment(
    uuidv1(),
    "borjadotai",
    text,
    "https://pbs.twimg.com/profile_images/1059400736054935552/adJ8r021_400x400.jpg"
  );
}

module.exports = router;
