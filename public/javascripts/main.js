$(document).ready(function(){
	$.validator.addMethod("rut", function(value, element) {
		return this.optional(element) || $.Rut.validar(value);
	}, "Este campo debe ser un rut valido.");

	$('.rut').Rut({
		format_on: 'keyup' 
	});

	$('#login-form').validate({
		submitHandler: function(form) {
			$('.rut').val($.Rut.quitarFormato($('.rut').val()));
			form.submit();
		},
		messages: {
			rut: "Tu RUT es requerido o es incorrecto",
			password: "La contraseña no puede estar en blanco"
		},
		highlight: function(element, errorClass) {
			$(element).parent().addClass('has-error');
		},
		unhighlight: function(element, errorClass) {
			$(element).parent().removeClass('has-error');
		},
		errorClass: "help-block",
		errorElement: "span"
	});

	$('#datos-form').validate({
		messages: {
			direccion: "Tu dirección no puede estar en blanco",
			telefono: "Tu telefono fijo es necesario y solo acepta números",
			celular: "Tu telefono celular es necesario y solo acepta números",
			email: "Tu email es necesario y debe ser valido"
		},
		rules: {
			telefono: {
				digits: true
			},
			celular: {
				digits: true
			}
		},
		highlight: function(element, errorClass) {
			$(element).parent().addClass('has-error');
		},
		unhighlight: function(element, errorClass) {
			$(element).parent().removeClass('has-error');
		},
		errorClass: "help-block",
		errorElement: "span"
	});
});