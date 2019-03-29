var data = [
  {
    name: "Coachella",
    description:
      "The most exclusive festival you will find in this city. Happening only once every 10 years.",
    date: "12/05/2019",
    image: "https://i.imgur.com/Qp3tTtH.jpg",
    organiser: "93729347234",
    location: "Los Angeles",
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
    date: "12/06/2019",
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

var dbPromise;

const MANIFEST_DB_NAME = "manifest_db";
const MANIFEST_STORE_NAME = "store_manifest";

/**
 * it inits the database
 */
function initDatabase() {
  dbPromise = idb.openDb(MANIFEST_DB_NAME, 1, function(upgradeDb) {
    if (!upgradeDb.objectStoreNames.contains(MANIFEST_STORE_NAME)) {
      var events = upgradeDb.createObjectStore(MANIFEST_STORE_NAME, {
        keyPath: "id",
        autoIncrement: true
      });
      events.createIndex("name", "name", { unique: false, multiEntry: true });
      events.createIndex("location", "location", {
        unique: false,
        multiEntry: true
      });
      events.createIndex("date", "date", { unique: false, multiEntry: true });
      seedDatabase();
      loadData();
    }
  });
}

function seedDatabase() {
  for (index in data) storeCachedEventData(data[index]);
}

function storeCachedEventData(eventObject) {
  console.log("inserting: " + JSON.stringify(eventObject));
  if (dbPromise) {
    dbPromise
      .then(async db => {
        var tx = db.transaction(MANIFEST_STORE_NAME, "readwrite");
        var store = tx.objectStore(MANIFEST_STORE_NAME);
        await store.put(eventObject);
        return tx.complete;
      })
      .then(function() {
        console.log("added item to the store! " + JSON.stringify(eventObject));
      })
      .catch(function(error) {
        console.log("Could not add item to store.");
      });
  } else localStorage.setItem(eventObject.name, JSON.stringify(eventObject));
}

/* pulls all objects from database and adds them to the homepage */
function pullFromDatabase() {
  if (dbPromise) {
    dbPromise
      .then(function(db) {
        return db
          .transaction(db.objectStoreNames)
          .objectStore(MANIFEST_STORE_NAME)
          .getAll();
      })
      .then(function(allData) {
        if (allData && allData.length > 0) {
          for (var elem of allData) addToResults(elem);
        }
      });
  } else {
    console.log("need to do this as well");
  }
}

function getDataById(id) {
  if (dbPromise) {
    dbPromise
      .then(function(db) {
        console.log("fetching: " + event);
        var tx = db.transaction(db.objectStoreNames);
        var store = tx.objectStore(MANIFEST_STORE_NAME);
        var index = store.index("name");
        return store.getAll(IDBKeyRange.only(parseInt(id)));
      })
      .then(function(readingsList) {
        if (readingsList && readingsList.length > 0) {
          var max;
          for (var elem of readingsList)
            if (!max || elem.date > max.date) max = elem;
          if (max) addToEvent(max);
        } else {
          const value = localStorage.getItem(event);
          console.log(value);
          if (value == null) addToResults({ event: event });
          else addToResults(value);
        }
      });
  } else {
    const value = localStorage.getItem(event);
    console.log(value);
    if (value == null) addToResults({ city: city, date: date });
    else addToResults(value);
  }
}

/* GETS EVENT OBJECT GIVEN ITS ID */
function getEventObject(id) {
  if (dbPromise) {
    return dbPromise.then(function(db) {
      var objectStores = db.transaction(db.objectStoreNames);
      var selectId = objectStores
        .objectStore(MANIFEST_STORE_NAME)
        .getAll(IDBKeyRange.only(parseInt(id)));
      return selectId;
    });
  }
}

/* GETS POST OBJECT GIVEN ITS ID */
function getPostObject(eventId, postId) {
  if (dbPromise) {
    var eventObject = getEventObject(eventId);
    return eventObject.then(function(eventObj) {
      var postList = eventObj[0].posts;
      var post = postList.find(function(element) {
        if (element.id == postId) {
          return element;
        }
      });
      console.log("post", post);
      return post;
    });
  }
}

/* SETS NEW VALUES FOR DATA OBJECT IN DB GIVEN ITS ID */
function setDataObject(data, id) {
  if (dbPromise) {
    return dbPromise
      .then(function(db) {
        var objectStores = db.transaction(db.objectStoreNames);
        var selectId = objectStores.objectStore(MANIFEST_STORE_NAME);
        var oldData = selectId.getAll(IDBKeyRange.only(parseInt(id)));
        return oldData;
      })
      .then(function(oldData) {
        var objectToEdit = oldData[0];
        objectToEdit.name = data.name;
        objectToEdit.location = data.location;
        objectToEdit.data = data.date;
        return dbPromise.then(function(db) {
          var transaction = db.transaction(db.objectStoreNames, "readwrite");
          var objectstore = transaction.objectStore(MANIFEST_STORE_NAME);
          objectstore.put(objectToEdit);
        });
      });
  }
}

/* DELETES OBJECT FROM DATABASE */
function deleteObject(id) {
  if (dbPromise) {
    return dbPromise.then(function(db) {
      var objectStores = db.transaction(db.objectStoreNames, "readwrite");
      var selectId = objectStores.objectStore(MANIFEST_STORE_NAME);
      selectId.delete(IDBKeyRange.only(parseInt(id)));
    });
  }
}

/* return name of data object */
function getEventName(dataR) {
  if (dataR.name == null && dataR.name === undefined) return "unavailable";
  else return dataR.name;
}

/* ADD POST OBJECTS TO AN EVENT */
function addPostObject(postObject, id) {
  if (dbPromise) {
    return dbPromise
      .then(function(db) {
        var tx = db.transaction(db.objectStoreNames);
        var store = tx.objectStore(MANIFEST_STORE_NAME);
        var eventObject = store.getAll(parseInt(id));
        return eventObject;
      })
      .then(function(eventObject) {
        var event = eventObject[0];
        event.posts.push(postObject);
        return dbPromise.then(function(db) {
          var tx = db.transaction(db.objectStoreNames, "readwrite");
          var store = tx.objectStore(MANIFEST_STORE_NAME);
          store.put(event);
        });
      });
  }
}

/* ADD COMMENT OBJECTS TO AN EVENT */
function addCommentObject(commentObject, eventId, postId) {
  if (dbPromise) {
    return dbPromise
      .then(function(db) {
        var tx = db.transaction(db.objectStoreNames);
        var store = tx.objectStore(MANIFEST_STORE_NAME);
        var eventObject = store.getAll(parseInt(eventId));
        return eventObject;
      })
      .then(function(eventObject) {
        var event = eventObject[0];
        var posts = event.posts;
        for (i = 0; i < posts.length; i++) {
          if (posts[i].id == postId) {
            posts[i].comments.push(commentObject);
          }
        }
        return dbPromise.then(function(db) {
          var tx = db.transaction(db.objectStoreNames, "readwrite");
          var store = tx.objectStore(MANIFEST_STORE_NAME);
          store.put(event);
        });
      });
  }
}
