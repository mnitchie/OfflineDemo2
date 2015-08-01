var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    app = express(),
    db,
    ListSchema,
    List;

mongoose.connect('mongodb://localhost/V03');

ListSchema = new mongoose.Schema({
  name: {type:String, required: true},
  createDate: {type: Date, default: Date.now},
  entries: {type: [String], default: []}
});
ListSchema.virtual('id').get(function(){
    return this._id.toHexString();
});
ListSchema.set('toJSON', {
    virtuals: true
});
List = mongoose.model('List', ListSchema);

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get('/api/lists', function(req, res, next) {
  List.find({}, function(error, docs) {
    if (error) {
      return next(e);
    }

    res.send(docs);
  });
});

app.post('/api/lists', function(req, res, next) {
  var list = new List(req.body);
  list.save(function(err, results) {
    if (err) {
      return next(e);
    }
    res.status(201);
    res.send(results);
  });
});

app.put('/api/lists/:id', function(req, res, next) {
  List.findByIdAndUpdate(req.params.id, req.body, {'new': true}, function(error, doc) {
    if (error) {
      return next(error);
    }
    res.send(doc);
  });
});

app.delete('/api/lists/:id', function(req, res, next) {
  List.findByIdAndRemove(req.params.id, function(error, doc) {
    if (error) {
      return next(e);
    }
    res.status(204);
    res.end();
  });
});

app.listen(3000);

process.on('SIGINT', function() {
  console.log("Cleaning up");
  mongoose.disconnect();
  process.exit(0);
});

process.on('SIGTERM', function() {
  console.log("Cleaning up");
  mongoose.disconnect();
  process.exit(0);
});
