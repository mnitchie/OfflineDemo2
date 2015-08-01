requirejs.config({
  baseUrl: '/scripts',

  paths: {
    jquery: 'lib/jquery-1.11.3.min',
    PouchDB: 'lib/pouchdb-3.6.0.min'
  }
});

require(['jquery', 'listCreator', 'StorageManager', 'ListContainer', 'NetworkIndicator'], function($, listCreator,
  storageManager, listContainer, networkIndicator) {

  $(document).ready(function() {
    listCreator.init();
    listContainer.init();
    storageManager.init();
    networkIndicator.init();
  });
});
