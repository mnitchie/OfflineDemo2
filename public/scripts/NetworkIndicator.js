define(['jquery'], function($) {
  'use strict';

  var $indicatorContainer,
      $onlineImage = $('<img>').attr('src', '/images/greenLight.png'),
      $offlineImage = $('<img>').attr('src', '/images/redLight.png');

  window.addEventListener('online', goOnline);
  window.addEventListener('offline', goOffline);

  function goOnline() {
    $indicatorContainer.html($onlineImage);
  }

  function goOffline() {
    $indicatorContainer.html($offlineImage);
  }

  return {
    init: function() {
      $indicatorContainer = $('#connectionIndicatorContainer');
      if (navigator.onLine) {
        goOnline();
      } else {
        goOffline();
      }
    }
  };
});
