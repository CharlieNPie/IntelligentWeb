/**
 * called by the HTML onload
 * showing any cached forecast data and declaring the service worker
 */
function initEvents() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function () {
                console.log('Service Worker Registered');
            })
            .catch (function (error){
                console.log('Service Worker NOT Registered '+ error.message);
            });
    }
    //check for support
    if ('indexedDB' in window) {
        initDatabase();
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }
    loadData();
}

/**
 * given the list of cities created by the user, it will retrieve all the data from
 * the server (or failing that) from the database
 */
function loadData(){
    refreshEventList();
    pullFromDatabase();
}

function loadEvent(id){
  initDatabase();
  getDataById(id);
  $(function(){
    $('.addPost').on('submit', function(event){
        event.preventDefault();
    });
});
}

///////////////////////// INTERFACE MANAGEMENT ////////////


/**
 * given the event data returned by the server,
 * it adds a row of an event to the results div
 * @param dataR the data returned by the server:
 * class WeatherForecast{
  *  constructor (location, date, forecast, temperature, wind, precipitations) {
  *    this.location= location;
  *    this.date= date,
  *    this.forecast=forecast;
  *    this.temperature= temperature;
  *    this.wind= wind;
  *    this.precipitations= precipitations;
  *  }
  *}
 */
function addToResults(dataR) {
    if (document.getElementById('results') != null) {
        const row = document.createElement('div');
        id= String(dataR.id);
        row.setAttribute('class','event');
        // appending a new row
        document.getElementById('results').appendChild(row);
        // formatting the row by applying css classes
        row.classList.add('card');
        row.classList.add('my_card');
        row.classList.add('bg-faded');
        row.classList.add(String(id));
        // the following is far from ideal. we should really create divs using javascript
        // rather than assigning innerHTML
        event = "<div class='card-block'>" +
            "<div class='row'>" +
            "<div class='col-xs-2'><h4 class='card-title'><a id="+id+ " href=/events/"+id + ">" + dataR.name + "</a></h4></div>" +
            "<div class='col-xs-2'></div></div></div>";
        $('.'+id+'.card.my_card.bg-faded').append(event);
    }
}

/* function for when new event entry is made */
function newEvent() {
    var formArray= $("form").serializeArray();
    var data={};
    for (index in formArray){
        data[formArray[index].name]= formArray[index].value;
    }
    sendNewEventQuery('/create_event', data);
    event.preventDefault();
}

/* send request to server */
function sendNewEventQuery(url, data) {
    $.ajax({
        url: url ,
        data: data,
        dataType: 'json',
        type: 'POST',
        success: function (response) {
            storeCachedEventData(response);
            location.reload();
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








/**
 * 
 * ADDING/EDITING/DELETING EVENTS 
 *
 */

/* ADDING EVENT PAGE */
function addToEvent(dataR) {
  if (document.getElementById('eventData') != null) {
      var i;
      posts = "";
      for (i=0;i<dataR.posts.length;i++){
        posts = posts +"<br><div class='panel panel-default'><div class='panel-body'>"+ String(dataR.posts[i].author) 
          + "<br> " + String(dataR.posts[i].text) + "<br><a href='"+dataR.id+"/posts/"+String(dataR.posts[i].id)
           + "'>" + String(dataR.posts[i].id) + "</a></div></div>";
      }
      event =  dataR.id+" <br>Name is " +dataR.name+ "<br>Location is " + dataR.location +
         "<br> Organiser is " + dataR.organiser + posts;
      $('.event').append(event);
    }
}

/* SHOW EVENT DATA FIELDS */
function listEventDetails(id) {
  initDatabase();
  var retrievedEvent = getEventObject(id);
  retrievedEvent.then(function (data) {
    dataObject = data[0];
    document.getElementById("name").value = String(dataObject.name);
    document.getElementById("location").value = String(dataObject.location);
    document.getElementById("date").value = String(dataObject.date);
  })
}

/* SEND REQUEST TO UPDATE EVENT DATA */
function updateEvent(id) {
  var formArray= $("form").serializeArray();
  var newData={};
  for (index in formArray){
      newData[formArray[index].name]= formArray[index].value;
  }
  sendUpdateEventQuery('/update_event', newData, id);
  event.preventDefault();
}

/* AJAX QUERY FOR UPDATING EVENT */
function sendUpdateEventQuery(url, data, id) {
  $.ajax({
    url: url ,
    data: data,
    dataType: 'json',
    type: 'POST',
    success: function (response) {
      setDataObject(response, id);
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
   postPromise.then(function (postData) {
    post =  postData.id+" <br>Author is " +postData.author+ "<br>Date is " + postData.date + "<br>" + postData.text + "<br><img src='"+postData.image+"' alt='Data' height='100' width='100'>";
    $('.post').append(post);
   });
 }

 /* LOADING POST PAGE WITH IMAGES */

function addPhotoPost(eventId) {
  canvas = document.getElementById('canvas');
  var formArray= $("form").serializeArray();
  var postData={};
  for (index in formArray){
      postData[formArray[index].name]= formArray[index].value;
  }
  var picData = canvas.toDataURL();
  postData["imageBlob"] = picData;

  console.log(postData);

  postWithImageQuery(postData, eventId);
}

function postWithImageQuery(data, eventId) {
  $.ajax({
    dataType: "json",
    url: '/upload_picture',
    type: "POST",
    data: data,
    success: function (data) {
      console.log(data);
      addPostObject(data,eventId);
      if (document.getElementById('offline_div')!=null)
              document.getElementById('offline_div').style.display='none';
    },
    error: function (err) {
      alert('Error: ' + err.status + ':' + err.statusText);
    } 
  })
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
window.addEventListener('offline', function(e) {
    // Queue up events for server.
    localStorage.setItem("offline_events", JSON.stringify([]));
    console.log("You are offline");
    showOfflineWarning();
}, false);


/**
 * When the client gets online, it hides the off line warning
 */
window.addEventListener('online', function(e) {
    // Resync data with server.
    console.log("You are online");
    hideOfflineWarning();
    var offlineEventList = JSON.parse(localStorage.getItem('offline_events'));
    for (index in offlineEventList) {
        sendNewEventQuery('create_event', offlineEventList[index]);
    }
    localStorage.clear();
    loadData();
}, false);


function showOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='block';
}

function hideOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='none';
}


/**
 * it shows the city list in the browser
 */
function showEventForm() {
    if (document.getElementById('event_list')!=null)
        document.getElementById('event_list').style.display = 'block';
}

/**
 * refreshes div section
 */
function refreshEventList(){
    if (document.getElementById('results')!=null)
        document.getElementById('results').innerHTML='';
}

/**
 * SHOW PASSWORD AS TEXT
 */

function showPassword() {
  var x = document.getElementById("password");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}