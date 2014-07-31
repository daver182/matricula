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

if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

var config = {
	user: 'SA',
	password: 'sa.2012',
	server: 'sqlserver',
	database: 'UMASNET',
}

var ciudades;
var comunas;

sql.connect(config, function(err) {
	if(err) return console.log(err);

	console.log('base de datos conectada');
	var consultaComunas = new sql.Request();
	consultaComunas.query('SELECT * FROM MT_COMUNA ORDER BY NOMCOMUNA', function(err, listaComunas) {
		if(err) {res.render('error', {error: 'NO SE OBTUVIERON LOS DATOS'}); return console.error(err);}
		
		if(listaComunas){
			comunas = listaComunas;

			var consultaCiudades = new sql.Request();
			consultaCiudades.query('SELECT * FROM MT_CIUDAD ORDER BY NOMCIUDAD', function(err, listaCiudades) {
				if(err) {res.render('error', {error: 'NO SE OBTUVIERON LOS DATOS'}); return console.error(err);}

				if(listaCiudades){
					ciudades = listaCiudades;
				}
			});
		}
	});
});

app.get('/', function(req, res){
	if(req.query.ERROR){
		switch(req.query.ERROR){
			case '0':
				res.render('login', { error: 'El RUT ingresado no existe' });
				break;
			case '1':
				res.render('login', { error: 'La contraseña es incorrecta' });
				break;
			case '2':
				res.render('login', { error: 'No se han recibido algunos datos. Intentalo de nuevo' });
				break;

			default:
				break;

		}
	}else{
		res.render('login', { error: '' });
	}
	
});

app.post('/entrar', function(req, res){
	if(!req.body.rut) return res.redirect('/?ERROR=2');
	if(!req.body.password) return res.redirect('/?ERROR=2');

	var rutCompleto = req.body.rut;
	var rut = rutCompleto.slice(0, rutCompleto.length - 1);
	var password = req.body.password;

	var request = new sql.Request();
	request.query('SELECT CODCLI,DIG,PATERNO,MATERNO,NOMBRE,DIRACTUAL,COMUNA,CIUDADACT,FONOACT,CELULARACT,EMAILACT FROM MT_CLIENT WHERE CODCLI = ' + rut, function(err, alumno) {
		if(err) {res.render('error', {error: 'NO SE OBTUVIERON LOS DATOS'}); return console.error(err);}

		if(alumno.length !== 0){
			if(alumno[0].CODCLI === password){
				for (var propiedad in alumno[0]) {
					if(alumno[0][propiedad] === null){
						alumno[0][propiedad] = '';
					}
				}
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
	if(!req.session.alumno) return res.redirect('/');
	
	if(req.query.ERROR){
		switch(req.query.ERROR){
			case '0':
				res.render('datos', {alumno: req.session.alumno, comunas: comunas, ciudades: ciudades, error: 'Algun campo no fue completado, intentalo de nuevo'});
				break;

			default:
				res.render('datos', {alumno: req.session.alumno, comunas: comunas, ciudades: ciudades});
				break;
		}
	}else{
		if(comunas && ciudades){
			res.render('datos', {alumno: req.session.alumno, comunas: comunas, ciudades: ciudades});
		}
	}
});

app.post('/guardar', function(req, res){
	if(!req.session.alumno) return res.redirect('/');

	if(req.body.direccion && req.body.comuna && req.body.ciudad && req.body.telefono && req.body.celular && req.body.email){
		var query = "UPDATE MT_CLIENT SET DIRACTUAL = '"+req.body.direccion+"', COMUNA = '"+req.body.comuna+"', CIUDADACT = '"+req.body.ciudad+"', FONOACT = '"+req.body.telefono+"', CELULARACT = '"+req.body.celular+"', EMAILACT = '"+req.body.email+"' WHERE CODCLI = '" + req.session.alumno.CODCLI + "'";
		console.log(query)

		var transaction = new sql.Transaction();
		transaction.begin(function(err) {
			if(err) {res.render('error', {error: 'ERROR DE BASE DE DATOS'}); return console.error(err);}

			var request = new sql.Request(transaction);
			request.query(query, function(err, recordset) {
				if(err) {res.render('error', {error: 'ERROR EN LA CONSULTA'}); return console.error(err);}

				transaction.commit(function(err, recordset) {
					if(err) {res.render('error', {error: 'ERROR DE BASE DE DATOS'}); return console.error(err);}

					req.session = null;
					res.render('exito');
				});
			});
		});
	}else{
		res.redirect('/datos?ERROR=0');
	}
});


app.get('/salir', function(req, res){
	req.session = null;
	res.redirect('/');
});










http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
