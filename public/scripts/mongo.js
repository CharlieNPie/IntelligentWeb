// MONGODB FUNCTIONS,
/**
 * Pulls events from mongoDB to populate the index page
 * @param {*} events events pulled from mongoDB in JSON
 */
function mongoAddResults(events){
    events = JSON.parse(events);
    console.log(events[0]._id);
    console.log(typeof(events));
    console.log("HERE WE ARE");
    for (i=0;i<events.length;i++){
      if (document.getElementById("events") != null) {
        let loggedin = JSON.parse(localStorage.getItem("admin"));
        if (!loggedin) {
          $("#new-event").remove();
        }
        const element =
          "<div>" +
          "<a href=/events/" +
          events[i]._id +
          ">" +
          "<img src='" +
          events[i].image +
          "' " +
          "class='st-image' />" +
          "<span class='sti-title'>" +
          events[i].name +
          "</span>" +
          "</a>" +
          "</div>";
        $("#events").append(element);
        // Adding them to near and past too since it's all fake data anyway
        $("#near-events").append(element);
        $("#past-events").append(element);
      }
    }
  }
