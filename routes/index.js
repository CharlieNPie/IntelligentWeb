var express = require('express');
var router = express.Router();
const uuidv1 = require('uuid/v1');

/* GET login page. */
router.get('/', function(req, res, next) {
  console.log("hello");
  res.render('login');
});

/* GET home page. */
router.get('/home', function(req, res, next) {
  res.render('index', { title: 'Music Festivals' });
});

/* GET event page */
router.get('/events/:eventId', function (req, res) {
  res.render('events', { id: req.params.eventId} );
});

/* GET edit event page */
router.get('/events/:eventId/edit', function (req, res) {
  res.render('updateEvent', { id: req.params.eventId, title: "Edit Event" });
});

/* GET post page */
router.get('/events/:eventId/posts/:postId', function (req, res) {
  res.render('posts', {eventId: req.params.eventId, postId: req.params.postId});
});

/* GET new post page */
router.get('/events/:eventId/newPost', function (req, res) {
  res.render('newPost', {title : 'New Post', id: req.params.eventId});
});



/**
 *  POST the data about the event.
 *  parameters in body:
 *    name : name of the event 
 * 
 */
router.post('/create_event', function(req, res, next) {
    const event= getEvent(req.body.name, req.body.date, req.body.location);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(event));
});

/**
 * POST data used to add posts to an event
 */
router.post('/create_post', function(req, res, next) {
  const post= getPost(req.body.text);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(post));
});

/**
 * POST data that updates the event details
 */
router.post('/update_event', function(req, res, next){
  updatedEvent = req.body;
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(updatedEvent));
})

/**
 * POST data used to add a new post with image attached
 */
router.post('/upload_picture', function(req, res, next) {
  console.log("Hello");
  var picData = req.body.imageBlob;
  var text = req.body.text;

  var data = getPost(text, picData);

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data));
  
});

/**
 * 
 *  AUTHENTICATION 
 * 
 */


/**
 *
 * @constructor
 */
class Event {
  constructor(name, date, image, organiser, location, posts){
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
  constructor(id,author, comments, date, image, location, text){
    this.author = author;
    this.comments = comments;
    this.date = date;
    this.image = image;
    this.location = location;
    this.text = text;
    this.id = id;
  }
}

function getPost(text, image){
  return new Post(uuidv1(),"sample author",[],new Date(),image,null,text);
}

module.exports = router;
