function initEvents() {
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
    let post =
      "<div class='login-box'><h2>Sorry, you need to be logged in to fully view events.</h2><a href='/profile'><button class='login-button'>Login</button></a></div>";
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

/* send request to server */
function sendAjaxQuery(url, data) {
  $.ajax({
    url: url,
    data: data,
    dataType: "json",
    type: "POST",
    success: function(response) {
      storeCachedEventData(response);
      location.reload();
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

/* function for when new event entry is made */
function newEvent() {
  var formArray = $("form").serializeArray();
  var data = {};
  for (index in formArray) {
    data[formArray[index].name] = formArray[index].value;
  }
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
      storeCachedEventData(response);
      window.location.replace("/");
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

/**
 *
 * ADDING POSTS TO EVENTS
 */

/* send request to server */
function sendAjaxPostQuery(url, data, id) {
  $.ajax({
    url: url,
    data: data,
    dataType: "json",
    type: "POST",
    success: function(response) {
      addPostObject(response, id);
      //location.reload();
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
function newPost(id) {
  var formArray = $("form").serializeArray();
  var data = {};
  for (index in formArray) {
    data[formArray[index].name] = formArray[index].value;
  }
  sendAjaxPostQuery("/create_post", data, id);
}

/* LOADING POST PAGE WITH IMAGES */

function addPhotoPost(eventId) {
  canvas = document.getElementById("canvas");
  var formArray = $("form").serializeArray();
  var postData = {};
  for (index in formArray) {
    postData[formArray[index].name] = formArray[index].value;
  }
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
      window.location.replace("/events/" + eventId);
      addPostObject(data, eventId);
      if (document.getElementById("offline_div") != null)
        document.getElementById("offline_div").style.display = "none";
    },
    error: function(err) {
      alert("Error: " + err.status + ":" + err.statusText);
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
      console.log(post);
      $("#posts").append(post);
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

function newComment(eventId, postId, msg) {
  console.log(msg);
  var data = { text: msg };
  console.log(data);
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
    var offlineEventList = JSON.parse(localStorage.getItem("offline_events"));
    for (index in offlineEventList) {
      sendNewEventQuery("create_event", offlineEventList[index]);
    }
    localStorage.clear();
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
function initExplore() {
  initDatabase();
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

function addToSearch(data) {
  if (document.getElementById("searchResults") == null) {
    const row = document.createElement("div");
    document.getElementById("searchResults").appendChild(row);
    row.innerHTML =
      "<a href=/events/" +
      data.id +
      ">" +
      "<span class='sti-title'>" +
      data.name +
      "</span>" +
      "</a>";
    console.log(row);
  } else {
    document.getElementById("searchResults").innerHTML = "";
    const row = document.createElement("div");
    document.getElementById("searchResults").appendChild(row);
    row.innerHTML =
      "<a href=/events/" +
      data.id +
      ">" +
      "<span class='sti-title'>" +
      data.name +
      "</span>" +
      "</a>";
    console.log(row);
  }
}

/**
 * Checks in the localStorage to see if a user has logged in
 * if admin is true it shows the admins info
 * if user is true, it shows the users info
 * if either of them is logged in, it also shows a logout button
 * if none of them is logged in, it shows a form to login
 */
const handleProfile = () => {
  let admin = JSON.parse(localStorage.getItem("admin"));
  let loggedin = JSON.parse(localStorage.getItem("login"));
  if (admin || loggedin) {
    $("#title").html("Profile");
    const logout =
      "<img src='https://image.flaticon.com/icons/svg/126/126467.svg' onclick='handleLogout()' class='back-button' />";
    $("#logout").html(logout);
    const ubox =
      "<div class='profile-box'><img src='https://pbs.twimg.com/profile_images/1059400736054935552/adJ8r021_400x400.jpg' /><p>Name: Borja Leiva</p><p>Location: Sheffield</p></div>";
    const abox =
      "<div class='profile-box'><img src='https://pixel.nymag.com/imgs/daily/intelligencer/2018/11/21/21-mark-zuckerberg-cnn.w700.h700.jpg' /><p>Name: Mark Suckerborg</p><p>Location: SF, California</p></div>";
    if (admin) {
      $("#content").append(abox);
    } else {
      $("#content").append(ubox);
    }
  } else {
    $("#title").html("Login");
    const box =
      "<div class='profile-box'><p>Username: </p>" +
      "<form id='login' onsubmit='handleLogin()'>" +
      "<input id='user' type='text' name='user' />" +
      "<span class='share'><input type='submit' class='submit' value='Login' form='login'/></span>" +
      "</form>" +
      "</div>";
    $("#content").append(box);
  }
};

// Handles the logout by changing the values in the localStorage
const handleLogout = () => {
  localStorage.setItem("admin", false);
  localStorage.setItem("login", false);
  location.reload();
};

/**
 * Checks for the username to be the correct one and if so changes localStorage
 * Really fake authentication but once we have a proper server and external mongo DB
 * we'll have a proper authentication, this is enough to show how the app will work
 * in terms of UX (User Experience)
 */
const handleLogin = () => {
  const user = $("#user").val();
  console.log(user);
  if (user == "admin") {
    localStorage.setItem("admin", true);
  } else if (user == "user") {
    localStorage.setItem("login", true);
  }
  location.reload();
};
