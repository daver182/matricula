var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var sql = require('mssql');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

var config = {
	user: 'SA',
	password: 'sa.2012',
	server: 'sqlserver',
	database: 'UMASNET',
}

sql.connect(config, function(err) {
    if(err) console.error(err);

    var request = new sql.Request();
    request.query('SELECT * FROM MT_CLIENT WHERE CODCLI = 18915944', function(err, recordset) {
        if(err) console.error(err);

        console.dir(recordset);
    });
});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
