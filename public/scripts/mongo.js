// MONGODB FUNCTIONS
/**
 * Pulls events from mongoDB to populate the index page
 * @param {*} events events pulled from mongoDB in JSON
 */
function mongoGetAllEvents(events) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(function () {
        console.log("Service Worker Registered");
      })
      .catch(function (error) {
        console.log("Service Worker NOT Registered " + error.message);
      });
  }
  //check for support
  if ("indexedDB" in window) {
    initDatabase();
  } else {
    console.log("This browser doesn't support IndexedDB");
  }
  updateMongoEvents();
  var events = JSON.parse(events);
  for (i = 0; i < events.length; i++) {
    if (document.getElementById("events") != null) {
      // element for each event tile
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
/**
 * display a single event pulled from mongodb for the individual event page
 * @param {*} event event pulled from mongodb 
 */
function mongoGetEvent(event) {
  var event = JSON.parse(event);
  $("#eventName").html(event.name);
  $("#eventDescription").html(event.description);
  var image = "<img" + " src='" + event.image + "'" + " class='e-image'" + "/>";
  $("#eventImage").html(image);
  let loggedin = JSON.parse(localStorage.getItem("login"));
  let admin = JSON.parse(localStorage.getItem("admin"));
  if (true == true) {
    event.posts.map(post => {
      if (checkForLike(post._id)) {
        var heart = "/images/like.png";
      } else {
        var heart = "https://image.flaticon.com/icons/svg/126/126471.svg";
      }
      if (post.image) {
        var image = "<img src='" + post.image + "' class='ps-photo' />";
      } else {
        var image;
      }
      var post =
        "<div class='post'>" + "<div class='ps-user'>" + "<img src='" +
        post.avatar +
        "' class='ps-avatar' />" + "<span class='ps-username'>" +
        post.author +
        "</span>" + "</div>" +
        image +
        "<div class='ps-menu'>" + "<div id='heart-" +
        post._id +
        "'>" + "<img src='" +
        heart +
        "' onClick='handleLike(" +
        post._id +
        ")' class='psm-button' />" + "</div>" + "<a href='" +
        window.location.href +
        "/posts/" +
        post._id +
        "'>" + "<img src='https://img.icons8.com/ios/50/000000/topic.png' class='psm-button' />" +
        "</a>" + "</div>" + "<div class='ps-content'>" + "<b>" +
        post.author +
        ": </b>" +
        post.text +
        "</div>" + "<div class='ps-details'><span></span>" + "<span>" +
        post.date +
        "</span>" + "</div>" + "</div>";
      $("#posts").append(post);
      if (!admin) {
        $("#edit-event").remove();
      }
    });
  } else {
    $("#new-post").remove();
    $("#edit-event").remove();
    let post =
      "<div class='login-box'><h2>Sorry, you need to be logged in to fully view events.</h2><a href='/profile'><button class='login-button'>Login</button></a></div>";
    $("#posts").append(post);
  }
}
function mongoGetPost(post) {
  var post = JSON.parse(post);
  console.log(post);
  var comments = post.comments;
  console.log(comments);
  for (i = 0; i < comments.length; i++) {
    comment =
      "<div class='comment'>" +
      "<img src='" +
      comments[i].avatar +
      "' class='ps-avatar' />" +
      "<div class='ps-text'>" +
      "<span class='ps-username'><b>" +
      comments[i].author +
      " </b> " +
      comments[i].text +
      "</span>" +
      "<p class='ps-date'>" +
      comments[i].date +
      "</p>" +
      "</div>" +
      "</div>";
    $("#posts").append(comment);
  };
  // postPromise.then(function({ comments }) {
  //   comments.map(comment => {
  //     let post =
  //       "<div class='comment'>" +
  //       "<img src='" +
  //       comment.avatar +
  //       "' class='ps-avatar' />" +
  //       "<div class='ps-text'>" +
  //       "<span class='ps-username'><b>" +
  //       comment.author +
  //       " </b> " +
  //       comment.text +
  //       "</span>" +
  //       "<p class='ps-date'>" +
  //       comment.date +
  //       "</p>" +
  //       "</div>" +
  //       "</div>";
  //     $("#posts").append(post);
  //   });
  // });
  $(".addComment").on("submit", function (event) {
    event.preventDefault();
  });
}

function seedMongo() {
  const data = seedData();
  for (var i = 0; i < 5; i++) {
    console.log(data[i])
    sendNewEventQuery("/create_event", data[i]);
  }
}