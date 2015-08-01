define(['jquery', 'EventBus', 'utils'], function($, eventBus, utils) {
  'use strict';

  var $listCreatorContainer,
      $listCreator,
      $nameInput = $('<input>').attr('id', 'listNameInput');

  function listCreatorClicked(event) {
    if (!($(event.target).is($listCreator))) {
      return;
    }

    $listCreator.replaceWith($nameInput);
    $nameInput.focus();

    $nameInput.keyup(onKeyup);

    setTimeout(function() {
      bindClickEvents();
    }, 1);
  }

  function bindClickEvents(event) {
    $(document).click(function() {
      closeInput();
    });
    $nameInput.click(function() {
      return false;
    });
  }

  function closeInput() {
    $nameInput.val('');
    $nameInput.off('click');
    $nameInput.off('keyup');
    $nameInput.replaceWith($listCreator);
    $(document).off('click');
  }

  function submitInput() {
    var name = $nameInput.val().trim();

    if (!validateInput(name)) {
      return;
    }

    eventBus.publish("listNameEntered", name);
    closeInput();

    function validateInput(input) {
      return utils.listNameValidator.test(input);
    }
  }

  function onKeyup(event) {
    var key = event.keyCode || event.which;

    switch (key) {
    case(27): // escape
      closeInput();
      break;
    case(13): // enter
      submitInput();
      break;
    }
  }

  return {
    init : function() {
      $listCreatorContainer = $("[data-trellNoWidget='listCreatorContainer']");
      $listCreator = $("[data-trellNoWidget='listCreator']");

      $listCreatorContainer.on('click', listCreatorClicked);
    }
  };
});
