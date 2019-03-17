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

/**
 *  POST the data about the event.
 *  parameters in body:
 *    name : name of the event 
 * 
 */
router.post('/event_data', function(req, res, next) {
    const event= getEvent(req.body.name)
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(event));
});
/**
 *
 * @param name
 * @constructor
 */
class Event {
  constructor(name){
    this.name = name;
  }
}
function getEvent(name){
  return new Event(
    name);
}
module.exports = router;
