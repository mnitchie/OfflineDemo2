define(['jquery'], function($) {

  function List(data) {
    var name = data.name || "New List",
        id = data.id,
        localId,
        createDate = data.createDate || new Date(Date.now()),
        entries = data.entries || [],
        dirty = data.dirty,
        deleted = data.deleted;


    if (!id) {
      localId = data.localId ? data.localId : generateRandomId();
    }

    this.getName = function() {
      return name;
    };

    this.setName = function(newName) {
      if (typeof name !== 'string') {
        throw new Error("Argument to List.setName() must be a String");
      }
      name = newName;
    };

    this.getId = function() {
      return id || localId;
    };

    this.getCreateDate = function() {
      return new Date(createDate.valueOf());
    };

    this.getEntries = function() {
      return $.extend(true, [], entries);
    };

    this.setEntries = function(newEntries) {
      if (!$.isArray(newEntries)) {
        throw new Error("Argument to List.setEntries() must be an array");
      }
      entries = newEntries;
    };

    this.addEntry = function(entry) {
      entries.push(entry);
    };

    this.isDirty = function() {
      return dirty;
    };

    this.setIsDirty = function(isDirty) {
      dirty = isDirty;
    };

    this.isDeleted = function() {
      return deleted;
    };

    this.setIsDeleted = function(isDeleted) {
      deleted = isDeleted;
    };

    this.getApiUrl = function() {
      return id ? "lists/" + id : "lists";
    };

    this.getSaveMethod = function() {
      return id ? "PUT" : "POST";
    };

    this.getPersistable = function() {
      return {
        name: name,
        id: id,
        localId: localId,
        createDate: new Date(createDate.valueOf()),
        entries: $.extend(true, [], entries),
        dirty: dirty,
        deleted: deleted
      };
    };
  }

  function generateRandomId() {
    var i,
        text = "LOCAL-",
        possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(i=0; i < 18; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }

  return List;
});
