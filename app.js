var express = require('express'),
    app = express(),
    db,
    ListSchema,
    List;

app.use(express.static(__dirname + '/public'));

app.get('/list/:listId', function(req, res, next) {
  res.sendFile(__dirname + '/public/listPage.html');
});

app.listen(3000);
