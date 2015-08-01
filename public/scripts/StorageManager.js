define(['jquery', 'EventBus', 'List'], function($, eventBus, List) {
  eventBus.subscribe("listNameEntered", createList);
  eventBus.subscribe("listDeleted", deleteList);
  eventBus.subscribe("listModified", modifyList);

  function modifyList(list) {
    if (navigator.onLine && !list.getId().startsWith("LOCAL-")) {
      saveToServer(list, {
        success: function(data, textStatus, jqXHR) {
          list = new List(data);
          localStorage.setItem(list.getId(),
                              JSON.stringify(list.getPersistable()));
        },
        error: function(jqXHR, textStatus, errorThrown) {
          alert("Error saving to the server. Saving data locally instead.");
          modifyLocally(list);
        }
      });
    } else {
      modifyLocally(list);
    }
  }

  function modifyLocally(list) {
    list.setIsDirty(true);
    localStorage.setItem(list.getId(), JSON.stringify(list.getPersistable()));
  }

  function saveLocally(list) {
    list.setIsDirty(true);
    localStorage.setItem(list.getId(), JSON.stringify(list.getPersistable()));
    eventBus.publish("listSaved", list);
  }

  function loadAllLocally() {
    var i,
        key,
        list,
        lists = [];

    for (i = 0; i < localStorage.length; i++) {
      key = localStorage.key(i);
      list = new List(JSON.parse(localStorage.getItem(key)));
      if (!list.isDeleted()) {
        lists.push(list);
      }
    }
    eventBus.publish("listsLoaded", lists);
  }

  function createList(name) {
    var list = new List({name: name});
    if (navigator.onLine) {
      saveToServer(list, {
        success: function(data, textStatus, jqXHR) {
          list = new List(data);
          localStorage.setItem(list.getId(),
                                JSON.stringify(list.getPersistable()));
          eventBus.publish("listSaved", list);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          alert("Error saving to the server. Saving data locally instead.");
          saveLocally(list);
        }
      });
    } else {
      saveLocally(list);
    }
  }

  function deleteList(list) {
    if (navigator.onLine && !list.getId().startsWith("LOCAL-")) {
      deleteFromServer(list);
    } else {
      deleteLocally(list);
    }
  }

  function deleteFromServer(list, async) {
    $.ajax({
      async: async === false ? false : true,
      type: 'DELETE',
      url: '/api/' + list.getApiUrl(),
      success: function(data, textStatus, jqXHR) {
        localStorage.removeItem(list.getId());
      },
      error: function (jqXHR, textStatus, errorThrown) {
        alert("Error deleting on the server. Deleting locally.");
        deleteLocally(list);
      }
    });
  }

  function deleteLocally(list) {
    if (list.getId().startsWith("LOCAL-")) {
      localStorage.removeItem(list.getId());
    } else {
      list.setIsDeleted(true);
      localStorage.setItem(list.getId(), JSON.stringify(list.getPersistable()));
    }
  }

  function saveToServer(list, options) {
    $.ajax({
      async: options.async === false ? false : true,
      contentType: 'application/json',
      data: JSON.stringify(list.getPersistable()),
      type: list.getSaveMethod(),
      url: '/api/' + list.getApiUrl(),
      success: function(data, textStatus, jqXHR) {
        if (options.success) {
          options.success(data, textStatus, jqXHR, list);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        if (options.error && typeof options.error === 'function') {
          options.error(jqXHR, textStatus, errorThrown);
        } else {
          alert("Well, this is embarrasing...");
          console.log(jqXHR);
          console.log(textStatus);
          console.log(errorThrown);
        }
      }
    });
  }

  function loadAllFromServer() {
    $.ajax({
      url: '/api/lists',
      type: 'GET',
      success: function(data, textStatus, jqXHR) {
        var lists = [],
            list,
            i;

        localStorage.clear();

        if (data) {
          for (i = 0; i < data.length; i++) {
            list = new List(data[i]);
            lists.push(list);
            localStorage.setItem(list.getId(),
                                  JSON.stringify(list.getPersistable()));
          }
        }
        eventBus.publish("listsLoaded", lists);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert("Error loading from the server. Loading data locally instead");
        loadAllLocally();
      }
    });
  }

  function syncData(callback) {
    var i,
        key,
        list,
        successCallback = callback || function(data, textStatus, jqXHR, list) {
            localStorage.removeItem(list.getId());
        };

    for (i = localStorage.length - 1; i >= 0; i--) {
      key = localStorage.key(i);
      list = new List(JSON.parse(localStorage.getItem(key)));
      if (list.isDeleted()) {
        deleteFromServer(list, false);
      }
      if (list.isDirty() && !list.isDeleted()) {
        saveToServer(list, {
          async: false,
          success: successCallback
        });
      }
    }
  }

  function getListFromServer(listId) {
    $.ajax({
      url: '/api/lists/' + listId,
      success: function(data, textStatus, jqXHR) {
        var list = new List(data);
        eventBus.publish("listLoaded", list);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(listId);
        alert("Error loading list from server. Loading from local storage instead");
        getListLocally(listId);
      }
    });
  }

  function getListLocally(listId) {
    var data = JSON.parse(localStorage.getItem(listId));

    if (!data) {
      eventBus.publish("listRetrievalFailed");
      return;
    }

    eventBus.publish("listLoaded", new List(data));
  }

  return {

    init: function () {
      window.addEventListener('online', syncData);

      if (navigator.onLine) {
        syncData();
        loadAllFromServer();
      } else {
        loadAllLocally();
      }
    },

    loadList: function(listId) {
      var newId;
      if (!listId) {
        eventBus.publish("listRetrievalFailed");
        return;
      }

      window.addEventListener('online', function() {
        syncData(syncCallback);
        if (newId && newId !== listId) {
          history.pushState(null, null, "/list/" + newId);
          getListLocally(newId);
        } else {
          getListLocally(listId);
        }
      });

      if (navigator.onLine) {
        syncData(syncCallback);
        if (newId && newId !== listId) {
          history.pushState(null, null, "/list/" + newId);
          getListLocally(newId);
        } else {
          getListLocally(listId);
        }
      } else {
        getListLocally(listId);
      }

      function syncCallback(data, textStatus, jqXHR, list) {
        newId = data.id;
        localStorage.removeItem(list.getId());
        localStorage.setItem(data.id, JSON.stringify((new
                                List(data)).getPersistable()));

      }
    }
  };
});
