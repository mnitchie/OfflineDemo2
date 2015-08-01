define(['jquery', 'EventBus', 'List'], function($, eventBus, List) {
  eventBus.subscribe("listNameEntered", createList);
  eventBus.subscribe("listDeleted", deleteList);
  eventBus.subscribe("listModified", modifyList);
  window.addEventListener('online', goOnline);
  window.addEventListener('offline', goOffline);

  function goOnline() {
    syncData();
  }

  function goOffline() {
    // no-op. All relevant actions check navigator.onLine before
    // persisting data.
  }

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
      },
      complete: function() {
        $('.loadingIndicator').remove();
      }
    });
  }

  function syncData() {
    var i,
        key,
        list,
        successCallback = function(data, textStatus, jqXHR, list) {
            localStorage.removeItem(list.getId());
        };

    $('body').append($('<div>').addClass('loadingIndicator'));
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
    loadAllFromServer();
  }

  return {

    init: function () {
      if (navigator.onLine) {
        syncData();
      } else {
        loadAllLocally();
      }
    }

  };
});
