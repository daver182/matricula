var express = require('express');
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
app.use(express.cookieParser());
app.use(express.cookieSession({
	secret: 'matriculauda2014'
}));
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

	
	console.log('base de datos conectada');
});

app.get('/', function(req, res){
	if(req.query.ERROR){
		switch(req.query.ERROR){
			case '0':
				res.render('login', { error: 'El RUT ingresado no existe' });
				break;
			case '1':
				res.render('login', { error: 'El digito verificador es incorrecto' });
				break;

			default:
				break;

		}
	}else{
		res.render('login', { error: '' });
	}
	
});

app.post('/entrar', function(req, res){
	var rutCompleto = req.body.rut;
	var length = rutCompleto.length - 1;
	var rut = rutCompleto.slice(0, length);
	var digito = rutCompleto[length];

	var request = new sql.Request();
	request.query('SELECT CODCLI,DIG,PATERNO,MATERNO,NOMBRE,DIRACTUAL,COMUNA,CIUDADACT,FONOACT,CELULARACT,EMAILACT FROM MT_CLIENT WHERE CODCLI = ' + rut, function(err, alumno) {
		if(err) console.error(err);

		console.log(alumno)
		if(alumno.length !== 0){
			if(alumno[0].DIG === digito){
				console.log(alumno[0]);
				req.session.alumno = alumno[0];
				res.redirect('/datos');
			}else{
				res.redirect('/?ERROR=1');
			}
		}else{
			res.redirect('/?ERROR=0');
		}
		
	});
});

app.get('/datos', function(req, res){
	if(req.session.alumno){
		var ciudades;
		var comunas;
		
		var consultaComunas = new sql.Request();
		consultaComunas.query('SELECT * FROM MT_COMUNA ORDER BY NOMCOMUNA', function(err, listaComunas) {
			if(err) console.log(err);
			
			if(listaComunas){
				comunas = listaComunas;

				var consultaCiudades = new sql.Request();
				consultaCiudades.query('SELECT * FROM MT_CIUDAD ORDER BY NOMCIUDAD', function(err, listaCiudades) {
					if(err) console.log(err);

					if(listaCiudades){
						ciudades = listaCiudades;
						procesar();
					}
				});
			}
		});

		function procesar(){
			if(req.query.ERROR){
				switch(req.query.ERROR){
					case '0':
						res.render('login', { error: 'El RUT ingresado no existe' });
						break;
					case '1':
						res.render('login', { error: 'El digito verificador es incorrecto' });
						break;

					default:
						break;

				}
			}else{
				if(comunas && ciudades){
					res.render('datos', {alumno: req.session.alumno, comunas: comunas, ciudades: ciudades});
				}
				
			}
		}
	}
});



















http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
