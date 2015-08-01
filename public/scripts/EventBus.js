define([], function() {
  'use strict';

  var topics = {};

  return {
    subscribe: function(topic, listener) {
      if(!topics[topic]) {
        topics[topic] = [];
      }

      topics[topic].push(listener);
    },

    publish: function(topic, data) {
      if(!topics[topic] || topics[topic].length < 1) {
        return;
      }

      topics[topic].forEach(function(listener) {
        listener(data || {});
      });
    }
  };
});
