var data = [
  {
    name: "Coachella",
    description:
      "The most exclusive festival you will find in this city. Happening only once every 10 years.",
    date: new Date("05/12/2019"),
    image: "https://i.imgur.com/Qp3tTtH.jpg",
    organiser: "93729347234",
    location:"los angeles",
    posts: [
      {
        id: "1",
        text: "Lol I just lost my cap, anybody seen it?",
        avatar:
          "https://tinyfac.es/data/avatars/7D3FA6C0-83C8-4834-B432-6C65ED4FD4C3-500w.jpeg",
        image: "https://i.imgur.com/jJHdo4D.jpg",
        author: "borjadotai",
        date: "12/05/2019 - 17:30",
        location: "Los Angeles - 3rd Area",
        comments: [
          {
            author: "hasanasim",
            avatar:
              "https://pbs.twimg.com/profile_images/1059400736054935552/adJ8r021_400x400.jpg",
            text: "Yo yo I saw it in Michelles crib",
            date: "15 Jan"
          },
          {
            author: "michelle23",
            avatar: "https://randomuser.me/api/portraits/men/17.jpg",
            text: "Yeah its here! Come get it.",
            date: "17 Jan"
          }
        ]
      },
      {
        id: "2",
        text:
          "What time is Travis playing at? Completely lost track of time...",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        image: "https://i.imgur.com/jJHdo4D.jpg",
        author: "hasanasim",
        date: "12/05/2019 - 14:30",
        location: "Los Angeles - 6th Area",
        comments: [
          {
            author: "charliePie",
            text: "Duuuuude he already played, you missed it..."
          }
        ]
      }
    ]
  },
  {
    name: "SheffieldFest",
    description:
      "The most exclusive festival you will find in this city. Happening only once every 10 years.",
    date:  new Date("04/04/2019"),
    image: "https://i.imgur.com/jJHdo4D.jpg",
    organiser: "93729347235",
    location: "Sheffield",
    posts: [
      {
        id: "3",
        text: "Yoooo! Here watching Drake in the diamond, looking gooooood!",
        avatar:
          "https://tinyfac.es/data/avatars/7D3FA6C0-83C8-4834-B432-6C65ED4FD4C3-500w.jpeg",
        image: "https://i.imgur.com/jJHdo4D.jpg",
        author: "charliePie",
        date: "12/05/2019 - 15:30",
        location: "Sheffield - The Diamond",
        comments: [
          {
            author: "borjadotai",
            text: "I know right? Pretty sick!"
          }
        ]
      }
    ]
  }
];

/**
 * called by the HTML onload
 * showing any cached forecast data and declaring the service worker
 */
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
  for (index in data) storeCachedEventData(data[index]);
}

/**
 * given the list of cities created by the user, it will retrieve all the data from
 * the server (or failing that) from the database
 */
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

function addToResults(data) {
  if (document.getElementById("events") != null) {
    const row = document.createElement("div");
    document.getElementById("events").appendChild(row);
    row.innerHTML =
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
      "</a>";
    console.log(row);
  }
}

function addToSearch(data){
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
  }else{
    document.getElementById("searchResults").innerHTML="";
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

function addToEvent(data) {
  console.log("borja", data);
  $("#eventName").html(data.name);
  $("#eventDescription").html(data.description);
  var image = "<img" + " src='" + data.image + "'" + " class='e-image'" + "/>";
  $("#eventImage").html(image);
  data.posts.map(post => {
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
      "<img src='" +
      post.image +
      "' class='ps-photo' />" +
      "<div class='ps-menu'>" +
      "<div id='heart-" +
      post.id +
      "'>" +
      "<img src='https://image.flaticon.com/icons/svg/126/126471.svg' onClick='handleLike(" +
      post.id +
      ")' class='psm-button' />" +
      "</div>" +
      "<a href='#'>" +
      "<img src='https://img.icons8.com/ios/50/000000/topic.png' class='psm-button' />" +
      "</a>" +
      "</div>" +
      "<div class='ps-content'>" +
      "<b>" +
      post.author +
      ": </b>" +
      post.text +
      "</div>" +
      "<div class='ps-details'>" +
      "<span>" +
      post.date +
      "</span>" +
      "<b> See more </b>" +
      "</div>" +
      "</div>";
    $("#posts").append(post);
  });
}

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
  event.preventDefault();
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

/* SHOW EVENT DATA FIELDS */
function listEventDetails(id) {
  initDatabase();
  var retrievedEvent = getEventObject(id);
  retrievedEvent.then(function(data) {
    dataObject = data[0];
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

/* DELETE ITEM FROM DATABASE */
function deleteEvent(id) {
  deleteObject(id);
}

/**
 *
 * POST PAGES
 *
 */

/* LOADING POST PAGE */

function loadPost(eventId, postId) {
  initDatabase();
  var postPromise = getPostObject(eventId, postId);
  postPromise.then(function({ comments }) {
    comments.map(comment => {
      console.log(comment);
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
  $('.addComment').on('submit', function(event){
    event.preventDefault();
  });
}

function sendAjaxCommentQuery(url, data, eventId,postId) {
  $.ajax({
      url: url ,
      data: data,
      dataType: 'json',
      type: 'POST',
      success: function (response) {
          addCommentObject(response,eventId,postId);
          //location.reload();
          if (document.getElementById('offline_div')!=null)
                  document.getElementById('offline_div').style.display='none';
      },
      error: function (xhr, status, error) {
          showOfflineWarning();
          var offlineEventList = JSON.parse(localStorage.getItem('offline_events'));
          offlineEventList.push(data);
          newEventList = offlineEventList;
          localStorage.setItem("offline_events", JSON.stringify(newEventList));
          const dvv= document.getElementById('offline_div');
          if (dvv!=null)
                  dvv.style.display='block';
      }
  });
}

function newComment(eventId,postId){
  var formArray=$("form").serializeArray();
  var data = {};
  for (index in formArray){
    data[formArray[index].name]=formArray[index].value;
  }
  sendAjaxCommentQuery('/create_comment',data,eventId,postId);
}


/**
 *
 * OTHER JAVASCRIPT
 *
 */

/**
 * When the client gets off-line, it shows an off line warning to the user
 * so that it is clear that the data is stale
 */
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

function initExplore(){
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
      $(this).val(
          start + " - " + end
      );
      console.log(start);
      var startDate =  new Date(start);
      var endDate = new Date(end);
      getDataByDate(startDate,endDate);
      event.stopPropagation();
    });
    $('input[name="datefilter"]').on("cancel.daterangepicker", function(
      ev,
      picker
    ) {
      $(this).val("");
    });
  });
  $('.search').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
      getDataByName($('#search').val());
    }
    event.stopPropagation();
  });
}

