define(['jquery', 'EventBus', 'utils'], function($, eventBus, utils) {
  'use strict';

  var $listContainer;

  eventBus.subscribe("listSaved", addOne);
  eventBus.subscribe("listsLoaded", addBatch);

  function addOne(list) {
    $listContainer.append(getTemplate(list));
  }

  function addBatch(lists) {
    if (lists.constructor !== Array) {
        return;
    }

    $listContainer.html('');

    lists.sort(function(a, b) {
      return a.getCreateDate() - b.getCreateDate();
    });

    lists.forEach(function(list) {
        addOne(list);
    });
  }

  function getTemplate(data) {
    var $el = $('<span>').addClass('listName').text(data.getName()),
        $container = $('<div>').addClass('clickableWidget listItem').attr('title',  data.getName()).append($el),
        $editButton = $('<button>').addClass('editButton').attr('title', 'Edit').html('&#x270e;'),
        $deleteButton = $('<button>').addClass('deleteButton').attr('title', 'Delete').text('x');


    $deleteButton.hide();
    $container.append($deleteButton);

    $editButton.hide();
    $container.append($editButton);

    $deleteButton.on('click', function(event) {
      if (confirm("Are you sure?")) {
        eventBus.publish('listDeleted', data);
        $container.remove();
      }
    });

    $editButton.on('click', function() {
      var newName = prompt("Rename this list", data.getName());

      if (newName && utils.listNameValidator.test(newName)) {
        data.setName(newName);
        $el.text(data.getName());
        eventBus.publish("listModified", data);
      }
    });

    $container.on('mouseover', function() {
      $deleteButton.show();
      $editButton.show();
    });

    $container.on('mouseout', function() {
      $deleteButton.hide();
      $editButton.hide();
    });

    $container.on('click', function(event) {
      /*if ($(event.target).is($deleteButton) || $(event.target).is($editButton)) {
        return;
      }
      window.location = "/list/" + data.getId();*/
    });

    return $container;
  }

  return {
    init: function() {
      $listContainer = $("[data-trellNoWidget='listContainer']");
    }
  };
});
