function initEvents() {
  console.log(new Date("05/12/2019"));
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(function() {
        console.log("Service Worker Registered");
      })
      .catch(function(error) {
        console.log("Service Worker NOT Registered " + error.message);
      });
  }
  //check for support
  if ("indexedDB" in window) {
    initDatabase();
  } else {
    console.log("This browser doesn't support IndexedDB");
  }
  loadData();
}

function loadData() {
  refreshEventList();
  pullFromDatabase();
}

function loadEvent(id) {
  initDatabase();
  getDataById(id);
  $(function() {
    $(".addPost").on("submit", function(event) {
      event.preventDefault();
    });
  });
}

/**
 * It adds an event element into the UI when called
 * @param data takes the events data to create the UI element
 * that will be added into the front-end
 */
function addToResults(data) {
  if (document.getElementById("events") != null) {
    let loggedin = JSON.parse(localStorage.getItem("admin"));
    if (!loggedin) {
      $("#new-event").remove();
    }
    const element =
      "<div>" +
      "<a href=/events/" +
      data.id +
      ">" +
      "<img src='" +
      data.image +
      "' " +
      "class='st-image' />" +
      "<span class='sti-title'>" +
      data.name +
      "</span>" +
      "</a>" +
      "</div>";
    $("#events").append(element);
    // Adding them to near and past too since it's all fake data anyway
    $("#near-events").append(element);
    $("#past-events").append(element);
  }
}

/**
 * It adds all the relevant data into an events UI
 * @param data takes the event's data to create all the UI elements
 * It will get the relevant data and either replace or add UI into the event page
 */
function addToEvent(data) {
  $("#eventName").html(data.name);
  $("#eventDescription").html(data.description);
  var image = "<img" + " src='" + data.image + "'" + " class='e-image'" + "/>";
  $("#eventImage").html(image);
  let loggedin = JSON.parse(localStorage.getItem("login"));
  let admin = JSON.parse(localStorage.getItem("admin"));
  if (loggedin || admin) {
    data.posts.map(post => {
      if (checkForLike(post.id)) {
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
        "<div class='post'>" +
        "<div class='ps-user'>" +
        "<img src='" +
        post.avatar +
        "' class='ps-avatar' />" +
        "<span class='ps-username'>" +
        post.author +
        "</span>" +
        "</div>" +
        image +
        "<div class='ps-menu'>" +
        "<div id='heart-" +
        post.id +
        "'>" +
        "<img src='" +
        heart +
        "' onClick='handleLike(" +
        post.id +
        ")' class='psm-button' />" +
        "</div>" +
        "<a href='" +
        window.location.href +
        "/posts/" +
        post.id +
        "'>" +
        "<img src='https://img.icons8.com/ios/50/000000/topic.png' class='psm-button' />" +
        "</a>" +
        "</div>" +
        "<div class='ps-content'>" +
        "<b>" +
        post.author +
        ": </b>" +
        post.text +
        "</div>" +
        "<div class='ps-details'><span></span>" +
        "<span>" +
        post.date +
        "</span>" +
        "</div>" +
        "</div>";
      $("#posts").append(post);
      if (!admin) {
        $("#edit-event").remove();
      }
    });
  } else {
    $("#new-post").remove();
    $("#edit-event").remove();
    let post = "<div class='login-box'><h2>Sorry, you need to be logged in to fully view events.</h2><a href='/profile'><button class='login-button'>Login</button></a></div>";
    $("#posts").append(post);
  }
}

/**
 * Util function needed by addToEvent that checks if a post has been
 * previously liked by the user in order to know if the heart on the
 * UI should be empty or filled
 * @param id takes the posts id to check if was previously liked
 */
const checkForLike = id => {
  let liked = JSON.parse(localStorage.getItem("liked"));
  if (liked === null) {
    return false;
  } else {
    if (liked.includes(parseInt(id))) {
      return true;
    } else {
      return false;
    }
  }
};

/**
 * Util function needed by addToEvent that handles the liking functionality
 * @param id takes the posts id and checks if the user has ever likes something
 * if he didn't creates a new array in localStorage to start saving liked posts,
 * otherwise it just adds or removes from the array if it was or wasn't there
 */
const handleLike = id => {
  let liked = JSON.parse(localStorage.getItem("liked"));
  console.log(liked);
  if (liked === null) {
    localStorage.setItem("liked", JSON.stringify([id]));
    const newHeart =
      "<img id='heart-" +
      id +
      "' src='/images/like.png' onClick='handleLike(" +
      id +
      ")' class='psm-button' />";
    $(`#heart-${id}`).html(newHeart);
    console.log("change color of heart");
  } else {
    if (liked.includes(id)) {
      const newHeart =
        "<img id='heart-" +
        id +
        "' src='https://image.flaticon.com/icons/svg/126/126471.svg' onClick='handleLike(" +
        id +
        ")' class='psm-button' />";
      $(`#heart-${id}`).html(newHeart);
      let newLiked = liked.filter(e => e !== id);
      localStorage.setItem("liked", JSON.stringify(newLiked));
      console.log("change color back to black");
    } else {
      const newHeart =
        "<img id='heart-" +
        id +
        "' src='/images/like.png' onClick='handleLike(" +
        id +
        ")' class='psm-button' />";
      $(`#heart-${id}`).html(newHeart);
      let newLiked = liked;
      newLiked.push(id);
      localStorage.setItem("liked", JSON.stringify(newLiked));
    }
  }
};

/* function for when new event entry is made */
function newEvent() {
  var formArray = $("form").serializeArray();
  var data = {};
  for (index in formArray) {
    data[formArray[index].name] = formArray[index].value;
  }
  data.date = new Date((data.date.substring(5,7)+"/"+data.date.substring(8)+"/"+data.date.substring(0,4))); 
  sendNewEventQuery("/create_event", data);
}

/* send request to server */
function sendNewEventQuery(url, data) {
  $.ajax({
    url: url,
    data: data,
    dataType: "json",
    type: "POST",
    success: function(response) {
      console.log(response.date);
      response.date = new Date(response.date);
      storeCachedEventData(response);
      window.location.replace("/");
      if (document.getElementById("offline_div") != null)
        document.getElementById("offline_div").style.display = "none";
    },
    error: function(xhr, status, error) {
      console.log(data);
      showOfflineWarning();
      var cache_data = getEvent(
        data.name,
        data.date,
        data.image,
        data.description,
        data.location
      );
      console.log(cache_data);
      storeCachedEventData(cache_data);
      window.location.replace("/");
      if (document.getElementById("offline_div") != null)
        document.getElementById("offline_div").style.display = "none";
    }
  });
}

/**
 *
 * ADDING POSTS TO EVENTS
 */

/* LOADING POST PAGE WITH IMAGES */
function addPhotoPost(eventId) {
  canvas = document.getElementById("canvas");
  var formArray = $("form").serializeArray();
  var postData = {};
  for (index in formArray) {
    postData[formArray[index].name] = formArray[index].value;
  }
  console.log("help",postData);
  var picData = canvas.toDataURL();
  postData["imageBlob"] = picData;

  postWithImageQuery(postData, eventId);
}

function postWithImageQuery(data, eventId) {
  $.ajax({
    dataType: "json",
    url: "/upload_picture",
    type: "POST",
    data: data,
    success: function(data) {
      console.log(data);
      window.location.replace("/events/" + eventId);
      addPostObject(data, eventId);
      if (document.getElementById("offline_div") != null)
        document.getElementById("offline_div").style.display = "none";
    },
    error: function(err) {
      alert("Error: " + err.status + ":" + err.statusText);
      var cache_data = getPost(
        data.id,
        data.author,
        data.avatar,
        data.comments,
        data.image,
        data.location,
        data.text
      );
      console.log(cache_data);
      addPostObject(cache_data, eventId);
      window.location.replace("/");
      if (document.getElementById("offline_div") != null)
        document.getElementById("offline_div").style.display = "none";
    }
  });
}

/* SHOW EVENT DATA FIELDS */
function listEventDetails(id) {
  initDatabase();
  var retrievedEvent = getEventObject(id);
  retrievedEvent.then(function(data) {
    dataObject = data[0];
    $("#eventName").html(dataObject.name);
    document.getElementById("name").value = String(dataObject.name);
    document.getElementById("location").value = String(dataObject.location);
    document.getElementById("date").value = String(dataObject.date);
  });
}

/* SEND REQUEST TO UPDATE EVENT DATA */
function updateEvent(id) {
  var formArray = $("form").serializeArray();
  var newData = {};
  for (index in formArray) {
    newData[formArray[index].name] = formArray[index].value;
  }
  sendUpdateEventQuery("/update_event", newData, id);
  event.preventDefault();
}

/* AJAX QUERY FOR UPDATING EVENT */
function sendUpdateEventQuery(url, data, id) {
  $.ajax({
    url: url,
    data: data,
    dataType: "json",
    type: "POST",
    success: function(response) {
      setDataObject(response, id);
      window.location.replace("/events/" + id);
      if (document.getElementById("offline_div") != null)
        document.getElementById("offline_div").style.display = "none";
    },
    error: function(xhr, status, error) {
      showOfflineWarning();
      var offlineEventList = JSON.parse(localStorage.getItem("offline_events"));
      offlineEventList.push(data);
      newEventList = offlineEventList;
      localStorage.setItem("offline_events", JSON.stringify(newEventList));
      const dvv = document.getElementById("offline_div");
      if (dvv != null) dvv.style.display = "block";
    }
  });
}



/* DELETE ITEM FROM DATABASE */
function deleteEvent(id) {
  deleteObject(id);
}

/**
 * Adds comments into the comment section of a post
 * @param eventId takes the event's ID
 * @param postId takes the posts's ID
 * with both ids, it pulls the posts comments from the database
 * and it adds each comment to the UI
 */
function loadPost(eventId, postId) {
  initDatabase();
  var postPromise = getPostObject(eventId, postId);
  postPromise.then(function({ comments }) {
    comments.map(comment => {
      let post =
      "<div class='comment'>" +
      "<img src='" +
      comment.avatar +
      "' class='ps-avatar' />" +
      "<div class='ps-text'>" +
      "<span class='ps-username'><b>" +
      comment.author +
      " </b> " +
      comment.text +
      "</span>" +
      "<p class='ps-date'>" +
      comment.date +
      "</p>" +
      "</div>" +
      "</div>";      
      $("#posts").append(post);
    });
  });
  $(".addComment").on("submit", function(event) {
    event.preventDefault();
  });
}

function sendAjaxCommentQuery(url, data, eventId, postId) {
  $.ajax({
    url: url,
    data: data,
    dataType: "json",
    type: "POST",
    success: function(response) {
      addCommentObject(response, eventId, postId);
      let post =
      "<div class='comment'>" +
      "<img src='" +
      response.avatar +
      "' class='ps-avatar' />" +
      "<div class='ps-text'>" +
      "<span class='ps-username'><b>" +
      response.author +
      " </b> " +
      response.text +
      "</span>" +
      "<p class='ps-date'>" +
      response.date +
      "</p>" +
      "</div>" +
      "</div>";
      $("#posts").append(post);
      if (document.getElementById("offline_div") != null)
        document.getElementById("offline_div").style.display = "none";
    },
    error: function(xhr, status, error) {
      showOfflineWarning();
      
    }
  });
}

function newComment(eventId, postId, msg) {
  var data = {text: msg};
  sendAjaxCommentQuery("/create_comment", data, eventId, postId);
}

window.addEventListener(
  "offline",
  function(e) {
    // Queue up events for server.
    localStorage.setItem("offline_events", JSON.stringify([]));
    console.log("You are offline");
    showOfflineWarning();
  },
  false
);

/**
 * When the client gets online, it hides the off line warning
 */
window.addEventListener(
  "online",
  function(e) {
    // Resync data with server.
    console.log("You are online");
    hideOfflineWarning();
    pullFromDatabase();
    loadData();
  },
  false
);

function showOfflineWarning() {
  if (document.getElementById("offline_div") != null)
    document.getElementById("offline_div").style.display = "block";
}

function hideOfflineWarning() {
  if (document.getElementById("offline_div") != null)
    document.getElementById("offline_div").style.display = "none";
}

/**
 * it shows the city list in the browser
 */
function showEventForm() {
  if (document.getElementById("city_list") != null)
    document.getElementById("city_list").style.display = "block";
}

/**
 * refreshes div section
 */
function refreshEventList() {
  if (document.getElementById("results") != null)
    document.getElementById("results").innerHTML = "";
}

/* EXPLORE */
function initExplore() {
  initDatabase();
  var myLatlng = new google.maps.LatLng(
    53.38108855193859,
    -1.4801287651062012
  );
  var mapOptions = {
    zoom: 18,
    center: myLatlng
  };
  var map = new google.maps.Map(
    document.getElementById("map_canvas"),
    mapOptions
  );
  var geocoder = new google.maps.Geocoder();
  $(function() {
    $('input[name="datefilter"]').daterangepicker({
      autoUpdateInput: false,
      locale: {
        cancelLabel: "Clear"
      }
    });

    $('input[name="datefilter"]').on("apply.daterangepicker", function(
      ev,
      picker
    ) {
      var start = picker.startDate.format("MM/DD/YYYY");
      var end = picker.endDate.format("MM/DD/YYYY");
      $(this).val(start + " - " + end);
      console.log(start);
      var startDate = new Date(start);
      var endDate = new Date(end);
      getDataByDate(startDate, endDate);
      event.stopPropagation();
    });
    $('input[name="datefilter"]').on("cancel.daterangepicker", function(
      ev,
      picker
    ) {
      $(this).val("");
    });
  });
  $(".search").keypress(function(event) {
    var keycode = event.keyCode ? event.keyCode : event.which;
    if (keycode == "13") {
      getDataByName($("#search").val());
    }
    event.stopPropagation();
  });
}

function addToSearch(data){
  var map = new google.maps.Map(document.getElementById('map_canvas'), {
    zoom: 8,
    center: new google.maps.LatLng(
      53.38108855193859,
      -1.4801287651062012
    )
  }); 
  for (i=0;i<data.length;i++){
    var geocoder = new google.maps.Geocoder();
    var address = data[i].location;
    geocoder.geocode({'address': address}, geocodeCallback(data[i]));
    function geocodeCallback(data){
      var callback = function(results, status) {
        var event = data;
        if (status === 'OK') {
          map.setZoom(3);
          map.setCenter(results[0].geometry.location);
          var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
          });
          var infowindow = new google.maps.InfoWindow({
            content: "<a href=/events/" +
                      event.id +
                      ">" +
                      "<span class='sti-title'>" +
                      event.name +
                      '<div id="eventImage" class="row">'+
                      "<img" + " src='" + event.image + "'" + " class='e-image'" + "/>"+
                      '</div>'+
                      "</span>" +
                      "</a>"                   
          });
          marker.addListener('click', function() {
            infowindow.open(map, marker);
          });
          google.maps.event.addListener(map, "click", function(event) {
            infowindow.close();
        });
        } else {
            console.log("Error in geocoder ");
        }
      };
      return callback;
    }  
}
}


/** RETURN CLASSES */
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