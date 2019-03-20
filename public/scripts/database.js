////////////////// DATABASE //////////////////
// the database receives from the server the following structure
/** class WeatherForecast{
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
var dbPromise;

const MANIFEST_DB_NAME= 'manifest_db'
const MANIFEST_STORE_NAME = 'store_manifest'

/**
 * it inits the database
 */
function initDatabase(){
    dbPromise = idb.openDb(MANIFEST_DB_NAME, 1, function(upgradeDb) {
        if (!upgradeDb.objectStoreNames.contains(MANIFEST_STORE_NAME)) {
            var events = upgradeDb.createObjectStore(MANIFEST_STORE_NAME, {keyPath: 'id', autoIncrement: true});
            events.createIndex('name', 'name', {unique: false, multiEntry: true});
            events.createIndex('location', 'location', {unique: false, multiEntry: true});
            events.createIndex('date', 'date', {unique: false, multiEntry: true});
        }
    });
}

/**
 * it saves the forecasts for a city in localStorage
 * @param city
 * @param forecastObject
 */
function storeCachedEventData(eventObject) { // need to add actual eventobject as per above
    console.log('inserting: '+JSON.stringify(eventObject));
    if (dbPromise) {
        dbPromise.then(async db => {
            var tx = db.transaction(MANIFEST_STORE_NAME, 'readwrite');
            var store = tx.objectStore(MANIFEST_STORE_NAME);
            await store.put(eventObject);
            return tx.complete;
        }).then(function () {
            console.log('added item to the store! '+ JSON.stringify(eventObject));
        }).catch(function (error) {
            console.log("Tried everything to catch this and gave up")
        });
    }
    else localStorage.setItem(eventObject.name, JSON.stringify(eventObject));
}

/* pulls all objects from database and adds them to the homepage */
function pullFromDatabase() {
    if (dbPromise) {
        dbPromise.then(function (db) {
            return db.transaction(db.objectStoreNames).objectStore(MANIFEST_STORE_NAME).getAll();
        }).then(function (allData) {
            if (allData && allData.length>0){
                for (var elem of allData)
                    addToResults(elem);
            }
        });
    }
    else {
        console.log("need to do this as well");
    }
}


function getDataById(id) {
    if (dbPromise) {
        dbPromise.then(function (db) {
            console.log('fetching: '+event);
            var tx = db.transaction(db.objectStoreNames);
            var store = tx.objectStore(MANIFEST_STORE_NAME);
            var index = store.index('name');
            return store.getAll(IDBKeyRange.only(parseInt(id)));
        }).then(function (readingsList) {
            console.log(readingsList);
            if (readingsList && readingsList.length>0){
                var max;
                for (var elem of readingsList)
                    if (!max || elem.date>max.date)
                        max= elem;
                if (max) addToEvent(max);
            } else {
                const value = localStorage.getItem(event);
                console.log(value);
                if (value == null)
                    addToResults({event: event});
                else addToResults(value);
            }
        });
    } else {
        const value = localStorage.getItem(event);
        console.log(value);
        if (value == null)
            addToResults( {city: city, date: date});
        else addToResults(value);
    }
}

function getDataObject(id) {
    if (dbPromise) {
        dbPromise.then(function (db) {
            return db.transaction(db.objectStoreNames).objectStore(MANIFEST_STORE_NAME).getAll(IDBKeyRange.only(parseInt(id)));
        }).then(function(dataObject) {
            console.log(dataObject[0]);
        })
    }
}

/* return name of data object */
function getEventName(dataR) {
    if (dataR.name == null && dataR.name === undefined)
        return "unavailable";
    else return dataR.name;
}

