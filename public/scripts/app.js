var data = [
    {
      name: "Coachella",
      date: "12/05/2019",
      image: "http://google.io/picture.jpeg",
      organiser: "93729347234",
      location: "Los Angeles",
      posts: [
        {
          text: "Lol I just lost my cap, anybody seen it?",
          image: "http://borja.leiva/image.jpeg",
          author: "borjadotai",
          date: "12/05/2019 - 17:30",
          location: "Los Angeles - 3rd Area",
          comments: [
            {
              author: "hasanasim",
              text: "Yo yo I saw it in Michelles crib"
            },
            {
              author: "michelle23",
              text: "Yeah its here! Come get it."
            }
          ]
        },
        {
          text:
            "What time is Travis playing at? Completely lost track of time...",
          image: "http://borja.leiva/image.jpeg",
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
      date: "12/06/2019",
      image: "http://google.io/picture.jpeg",
      organiser: "93729347235",
      location: "Sheffield",
      posts: [
        {
          text: "Yoooo! Here watching Drake in the diamond, looking gooooood!",
          image: "http://borja.leiva/image.jpeg",
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
    //for (index in data)
        //storeCachedEventData(data[index]);
    loadData();
}

/**
 * given the list of cities created by the user, it will retrieve all the data from
 * the server (or failing that) from the database
 */
function loadData(){
    pullFromDatabase();
    var eventsList=JSON.parse(localStorage.getItem('events'));
    eventsList=removeDuplicates(eventsList);
    //retrieveAllCitiesData(eventsList, new Date().getTime());
}

/**
 * it cycles through the list of cities and requests the data from the server for each
 * city
 * @param cityList the list of the cities the user has requested
 * @param date the date for the forecasts (not in use)
 */
function retrieveAllCitiesData(eventsList){
    refreshEventList();
    for (index in eventsList)
        loadEventData(eventsList[index]); 
}

/**
 * given one city and a date, it queries the server via Ajax to get the latest
 * weather forecast for that city
 * if the request to the server fails, it shows the data stored in the database
 * @param event
 * @param date
 */
function loadEventData(name){
    const input = JSON.stringify({name: name});
    $.ajax({
        url: '/event_data',
        data: input,
        contentType: 'application/json',
        type: 'POST',
        success: function (dataR) {
            // no need to JSON parse the result, as we are using
            // dataType:json, so JQuery knows it and unpacks the
            // object for us before returning it
            addToResults(dataR);
            storeCachedEventData(dataR);
            if (document.getElementById('offline_div')!=null)
                    document.getElementById('offline_div').style.display='none';
        },
        // the request to the server has failed. Let's show the cached data
        error: function (xhr, status, error) {
            showOfflineWarning();
            getCachedEventData(name);
            const dvv= document.getElementById('offline_div');
            if (dvv!=null)
                    dvv.style.display='block';
        }
    });
    // hide the list of cities if currently shown
    if (document.getElementById('city_list')!=null)
        document.getElementById('city_list').style.display = 'none';
}


///////////////////////// INTERFACE MANAGEMENT ////////////


/**
 * given the forecast data returned by the server,
 * it adds a row of weather forecasts to the results div
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
        // appending a new row
        document.getElementById('results').appendChild(row);
        // formatting the row by applying css classes
        row.classList.add('card');
        row.classList.add('my_card');
        row.classList.add('bg-faded');
        // the following is far from ideal. we should really create divs using javascript
        // rather than assigning innerHTML
        row.innerHTML = "<div class='card-block'>" +
            "<div class='row'>" +
            "<div class='col-xs-2'><h4 class='card-title'>" + dataR.name + "</h4></div>" +
            "<div class='col-xs-2'></div></div></div>";
    }
}


/**
 * it removes all forecasts from the result div
 */
function refreshEventList(){
    if (document.getElementById('results')!=null)
        document.getElementById('results').innerHTML='';
}


/**
 * it enables selecting the city from the drop down menu
 * it saves the selected city in the database so that it can be retrieved next time
 * @param city
 * @param date
 */
function selectEvent(event) {
  var eventList=JSON.parse(localStorage.getItem('events'));
  if (eventList==null) eventList=[];
  eventList.push(event);
  eventList = removeDuplicates(eventList);
  localStorage.setItem('events', JSON.stringify(eventList));
  retrieveAllCitiesData(eventList);
}

/* function for when new data entry is made */
function newEvent() {
    var formArray= $("form").serializeArray();
    var data={};
    for (index in formArray){
        data[formArray[index].name]= formArray[index].value;
    }
    sendAjaxQuery('/create_event', data);
    event.preventDefault();
}

/* send request to server */
function sendAjaxQuery(url, data) {
    $.ajax({
        url: url ,
        data: data,
        dataType: 'json',
        type: 'POST',
        success: function (response) {
            addToResults(response);
            storeCachedEventData(response);
            if (document.getElementById('offline_div')!=null)
                    document.getElementById('offline_div').style.display='none';
        },
        error: function (xhr, status, error) {
            alert('Error detected: ' + error.message);
        }
    });
}



/**
 * When the client gets off-line, it shows an off line warning to the user
 * so that it is clear that the data is stale
 */
window.addEventListener('offline', function(e) {
    // Queue up events for server.
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
function showEventList() {
    if (document.getElementById('city_list')!=null)
        document.getElementById('city_list').style.display = 'block';
}


/**
 * Given a list of events, it removes any duplicates
 * @param eventList
 * @returns {Array}
 */
function removeDuplicates(eventList) {
    // remove any duplicate
       var uniqueNames=[];
       $.each(eventList, function(i, el){
           if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
       });
       return uniqueNames;
}
