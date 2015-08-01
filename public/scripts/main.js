requirejs.config({
  baseUrl: '/scripts',

  paths: {
    jquery: 'lib/jquery-1.11.3.min'
  }
});

require(['jquery', 'ListCreator', 'StorageManager', 'ListContainer', 'NetworkIndicator'], function($, listCreator,
  storageManager, listContainer, networkIndicator) {

  $(document).ready(function() {
    listCreator.init();
    listContainer.init();
    storageManager.init();
    networkIndicator.init();
  });
});
