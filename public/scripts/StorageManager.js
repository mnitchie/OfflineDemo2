define(['EventBus', 'PouchDB', 'List'], function(eventBus, PouchDB, List) {
  var db,
      sync;
      remoteDB = "http://" + window.location.hostname + ":5984/mydb";

  eventBus.subscribe("listNameEntered", createList);
  eventBus.subscribe("listDeleted", deleteList);
  eventBus.subscribe("listModified", modifyList);

  function enableDBSync() {
    sync = db.sync(remoteDB, {
      live: true,
      retry: true
    });
  }

  function createList(name) {
    var list = new List({name: name});

    db.post(list.getPersistable(), function(err, response) {
      if (err) {
        console.log(err);
        return;
      }
      list.setId(response.id);
      list.setRev(response.rev);
      eventBus.publish("listSaved", list);
    });
  }

  function modifyList(list) {
    db.put(list.getPersistable(), function(err, response) {
      if (err) {
        console.log(err);
        return;
      }
      list.setRev(response.rev);
    });
  }

  function deleteList(list) {
    db.remove(list.getPersistable(), function(err, response) {
      if (err) {
        console.log(err);
        return;
      }
    });
  }

  function loadLists() {
    var lists = [];
    db.allDocs({include_docs: true}, function(err, response) {
      if (err) {
        console.log(err);
        return;
      }
      response.rows.forEach(function(data) {
        lists.push(new List(data.doc));
      });
      eventBus.publish("listsLoaded", lists);
    });
  }

  return {
    init: function() {
      db = new PouchDB('mydb');

      if (navigator.onLine) {
        enableDBSync();
      }

      loadLists();
    },

    loadList: function(listId) {
      db = new PouchDB('mydb');

      if (navigator.onLine) {
        enableDBSync();
      }

      db.get(listId, function(err, response) {
        var list;
        if (err) {
          alert("List not found. Taking you back to safety...");
          window.location.href = "/";
          return;
        }

        list = new List(response);
        eventBus.publish("listLoaded", list);
      });
    }
  };

});
