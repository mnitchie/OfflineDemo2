define(['jquery', 'EventBus', 'List'], function($, eventBus, List) {
  eventBus.subscribe("listNameEntered", createList);
  eventBus.subscribe("listDeleted", deleteList);
  eventBus.subscribe("listModified", modifyList);

  function modifyList(list) {
    modifyLocally(list);
  }

  function modifyLocally(list) {
    list.setIsDirty(true);
    localStorage.setItem(list.getId(), JSON.stringify(list.getPersistable()));
  }

  function saveLocally(list) {
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
    saveLocally(new List({name: name, isDirty: true}));
  }

  function deleteList(list) {
    deleteLocally(list);
  }

  function deleteLocally(list) {
    localStorage.removeItem(list.getId());
  }

  return {
    init: function () {
      loadAllLocally();
    },
  };
});
