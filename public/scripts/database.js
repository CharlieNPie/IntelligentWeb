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
        keyPath: "_id",
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

/**
 * Seeds the database when it gets created using a big JSON object that
 * gets imported from seedData so that we can always change the seed data
 * easily from a different file
 */
function seedDatabase() {
  const data = seedData();
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
  }
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
          for (var elem of allData){
            addToResults(elem);
          }
          addToSearch(allData);
        }
      });
  } else {
    console.log("need to do this as well");
  }
}

/**
 * Gets event object by its corresponding ID
 * @param id is an int with the key ID of the event object. 
 */
function getDataById(id) {
  if (dbPromise) {
    dbPromise
      .then(function(db) {
        console.log("fetching: " + event);
        var tx = db.transaction(db.objectStoreNames);
        var store = tx.objectStore(MANIFEST_STORE_NAME);
        var index = store.index("name");
        return store.getAll(IDBKeyRange.only(id));
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

/**
 * Searches the database by the name of an event object. 
 * @param name a string containing the name of the object 
 */
function getDataByName(name) {
  if (dbPromise) {
    dbPromise
      .then(function(db) {
        console.log("fetching: " + event);
        var tx = db.transaction(db.objectStoreNames);
        var store = tx.objectStore(MANIFEST_STORE_NAME);
        var index = store.index("name");
        console.log(name);
        return index.getAll(IDBKeyRange.only(name));
      })
      .then(function(readingsList) {
        if (readingsList && readingsList.length > 0) {
          var max;
          for (var elem of readingsList)
            addToSearch(readingsList);
        } else {
          const value = localStorage.getItem(event);
          console.log(readingsList);
          console.log(value);
          if (value != null) {
            addToSearch(value);
          }
        }
      });
  } else {
    const value = localStorage.getItem(event);
    console.log(value);
    if (value == null) addToResults({ city: city, date: date });
    else addToResults(value);
  }
}
/**
 * Searches the database by the name of an event object. 
 * @param location a string containing the location of the object 
 */
function getDataByLocation(location) {
  if (dbPromise) {
    dbPromise
      .then(function(db) {
        console.log("fetching: " + event);
        var tx = db.transaction(db.objectStoreNames);
        var store = tx.objectStore(MANIFEST_STORE_NAME);
        var index = store.index("location");
        console.log(name);
        return index.getAll(IDBKeyRange.only(location));
      })
      .then(function(readingsList) {
        if (readingsList && readingsList.length > 0) {
          var max;
          for (var elem of readingsList)
            addToSearch(readingsList);
        } else {
          const value = localStorage.getItem(event);
          console.log(readingsList);
          console.log(value);
          if (value != null) {
            addToSearch(value);
          }
        }
      });
  } else {
    const value = localStorage.getItem(event);
    console.log(value);
    if (value == null) addToResults({ city: city, date: date });
    else addToResults(value);
  }
}

/**
 * Searches the database by event start and end date.
 * @param startDate the start date specified by the user
 * @param endDate the end date specified by the user
 */
function getDataByDate(startDate, endDate) {
  if (dbPromise) {
    dbPromise
      .then(function(db) {
        console.log("fetching: " + event);
        var tx = db.transaction(db.objectStoreNames);
        var store = tx.objectStore(MANIFEST_STORE_NAME);
        var index = store.index("date");
        return index.getAll(IDBKeyRange.bound(startDate, endDate));
      })
      .then(function(readingsList) {
        console.log(readingsList);
        if (readingsList && readingsList.length > 0) {
          //for (var elem of readingsList)
          addToSearch(readingsList);
        } else {
          const value = localStorage.getItem(event);
          console.log(readingsList);
          console.log(value);
          if (value != null) {
            addToSearch(value);
          }
        }
      });
  } else {
    addToSearch(null);
    const value = localStorage.getItem(event);
    console.log(value);
    if (value == null) addToResults({ city: city, date: date });
    else addToResults(value);
  }
}


/**
 * gets an individual event object by its ID and returns to other function as promise
 * @param {*} id int containing id of object 
 */
function getEventObject(id) {
  if (dbPromise) {
    return dbPromise.then(function(db) {
      var objectStores = db.transaction(db.objectStoreNames);
      var selectId = objectStores
        .objectStore(MANIFEST_STORE_NAME)
        .getAll(IDBKeyRange.only(id));
      return selectId;
    });
  }
}

/**
 * Gets a post object given its post id and the id of the event that
 * contains the post
 * @param {*} eventId 
 * @param {*} postId 
 */
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

/**
 * sets new data in a data object given the data itself and its id
 * @param data 
 * @param id 
 */
function setDataObject(data, id) {
  if (dbPromise) {
    return dbPromise
      .then(function(db) {
        var objectStores = db.transaction(db.objectStoreNames);
        var selectId = objectStores.objectStore(MANIFEST_STORE_NAME);
        var oldData = selectId.getAll(IDBKeyRange.only(id));
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

/**
 * deletes object given its id
 * @param {} id 
 */
function deleteObject(id) {
  if (dbPromise) {
    return dbPromise.then(function(db) {
      var objectStores = db.transaction(db.objectStoreNames, "readwrite");
      var selectId = objectStores.objectStore(MANIFEST_STORE_NAME);
      selectId.delete(IDBKeyRange.only(id));
    });
  }
}

/**
 * returns name of data object
 * @param {*} dataR 
 */
function getEventName(dataR) {
  if (dataR.name == null && dataR.name === undefined) return "unavailable";
  else return dataR.name;
}

/**
 * adds post object to event given the event id and the data object
 * @param {*} postObject 
 * @param {*} id 
 */
function addPostObject(postObject, id) {
  console.log(id);
  if (dbPromise) {
    return dbPromise
      .then(function(db) {
        var tx = db.transaction(db.objectStoreNames);
        var store = tx.objectStore(MANIFEST_STORE_NAME);
        var eventObject = store.getAll(id);
        return eventObject;
      })
      .then(function(eventObject) {
        var event = eventObject[0];
        console.log(event)
        console.log(postObject);
        event.posts.push(postObject);
        return dbPromise.then(function(db) {
          var tx = db.transaction(db.objectStoreNames, "readwrite");
          var store = tx.objectStore(MANIFEST_STORE_NAME);
          store.put(event);
        });
      });
  }
}

/**
 * adds comment object to a post object
 * @param {*} commentObject : the comment object
 * @param {*} eventId : id of event
 * @param {*} postId : id of post
 */
function addCommentObject(commentObject, eventId, postId) {
  if (dbPromise) {
    return dbPromise
      .then(function(db) {
        var tx = db.transaction(db.objectStoreNames);
        var store = tx.objectStore(MANIFEST_STORE_NAME);
        var eventObject = store.getAll(eventId);
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
