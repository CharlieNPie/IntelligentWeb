var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Music Festivals' });
});

/* GET event page */
router.get('/events/:eventId', function (req, res) {
  res.render('events', { id: req.params.eventId} );
})
router.get('/event',function(req,res){
  res.render('event',{id:req.params.eventId});
})
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

module.exports = router;
