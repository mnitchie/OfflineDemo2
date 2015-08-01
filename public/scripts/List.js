define([], function() {

  function List(data) {
    var name,
        id,
        rev,
        createDate,
        entries;

    if (data.constructor === List) {
      data = data.getPersistable();
    }

    name = data.name || "New List";
    id = data.id || data._id;
    rev = data.rev || data._rev;
    createDate = data.createDate || new Date(Date.now());
    entries = data.entries || [];

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
      return id;
    };

    this.setId = function(newId) {
      if (!id) {
        id = newId;
      }
    };

    this.getRev = function() {
      return rev;
    };

    this.setRev = function(newRev) {
      rev = newRev;
    };

    this.getCreateDate = function() {
      return new Date(createDate.valueOf());
    };

    this.getEntries = function() {
      return $.extend(true, [], entries);
    };

    this.setEntries = function(newEntries) {
      if (newEntries.constructor !== Array){
        throw new Error("Argument to List.setEntries() must be an array");
      }
      entries = newEntries;
    };

    this.addEntry = function(entry) {
      entries.push(entry);
    };

    this.getPersistable = function() {
      return {
        name: name,
        _id: id,
        _rev: rev,
        createDate: new Date(createDate.valueOf()),
        entries: $.extend(true, [], entries)
      };
    };
  }

  return List;
});
