requirejs.config({
  baseUrl: '/scripts',

  paths: {
    jquery: 'lib/jquery-1.11.3.min'
  }
});

require(['jquery', 'NetworkIndicator', 'StorageManager', 'EventBus'], function($, networkIndicator, storageManager, eventBus) {
  var url = window.location.href,
        prefix = url.lastIndexOf("/list/"),
        listId = prefix === -1 ? undefined : url.substr(prefix + 6);

  eventBus.subscribe("listRetrievalFailed", function() {
    alert("Error retrieving list. Taking you back to safety...");
    window.location.href = "/";
  });

  eventBus.subscribe("listLoaded", function(list) {
    $('#listName').text(list.getName());

    $('#listEntryCreator').click(function() {
      var entry = prompt("Enter something");
      list.addEntry(entry);
      list.setIsDirty(true);
      $('#listEntryContainer').append($('<li>').text(entry));

      eventBus.publish("listModified", list);
    });

    $('#listEntryContainer').html('');
    list.getEntries().forEach(function(entry) {
      $('#listEntryContainer').append($('<li>').text(entry));
    });
  });

  $(document).ready(function() {
    networkIndicator.init();
    storageManager.loadList(listId);
  });
});
