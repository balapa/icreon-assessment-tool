// validation
function ufValidation(formSelector, options) {

	const form = $(formSelector);
	const defaultMessage = 'This field is required';
	const defaultMaxLength = 1072;
	const defaultMinNumber = 1;

	// disable default validation
	form.attr('novalidate', '');


	runValidation();
	function runValidation() {

		const fields = $(`${formSelector} input, ${formSelector} select, ${formSelector} textarea`);

		// validation on keyup
		fields.on('keyup change', function() {
			validateInput($(this));
		});

		form.submit(function(e) {
			e.preventDefault();

			// validation on submit
			$.each(fields, function() {
				validateInput($(this));
			});

			// if there's no error submit data
			const anyError = $(formSelector).find('.error');
			if(anyError.length == 0) {

				// submit your ajax here
				if(options.onSuccess) {
					options.onSuccess();
				}

			} else {
				if(options.onError) {
					options.onError();
					const firstError = $(formSelector + ' .error').first();
					if(firstError) {
						firstError.focus();
					}
				}
			}

		});

	} // run validation

	// add error
	function addErrorInvalid(input, message) {
		$(`<label class="error-message">${message}</label>`).insertAfter(input);
		input.addClass('error');
	}

	// validate input
	function validateInput(input) {
		let inputMessage = defaultMessage;
		let maxLength = defaultMaxLength;
		let minNumber = defaultMinNumber;

		if(input.attr('data-message')) inputMessage = input.attr('data-message');
		if(input.attr('data-maxlength')) maxLength = input.attr('data-maxlength');
		if(input.attr('data-minnumber')) minNumber = input.attr('data-minnumber');

		// if input is required
		if(input.attr('required')) {
			// remove error message when validating
			input.parent().find('.error-message').remove();

			// if type email
			if(input.attr('type') == 'email') {
				let regex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;
				if(input.val() == ''){
					addErrorInvalid(input, inputMessage);
				} else if(!regex.test(input.val())){
					addErrorInvalid(input, 'Please add a correct email address');
				} else {
					input.removeClass('error');
				}
			}

			// type phone
			else if(input.attr('type') == 'tel') {
				let regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
				if(input.val() == ''){
					addErrorInvalid(input, inputMessage);
				} else if(!regex.test(input.val())){
					addErrorInvalid(input, 'Please add a correct phone number');
				} else {
					input.removeClass('error');
				}
			}

			// type zip
			else if(input.attr('data-type') == 'zip') {
				let regex = /^\d{6}(-\d{4})?$/;
				if(input.val() == ''){
					addErrorInvalid(input, inputMessage);
				} else if(!regex.test(input.val())){
					addErrorInvalid(input, 'Please add a correct postal code');
				} else {
					input.removeClass('error');
				}
			}

			// type number
			else if(input.attr('type') == 'number') {
				if(input.val() == '') {
					addErrorInvalid(input, inputMessage);
				} else if(input.val() < minNumber) {
					addErrorInvalid(input, 'Number must be bigger than ' + (minNumber - 1));
				} else if(input.val().length > maxLength) {
					addErrorInvalid(input, 'The max characters is ' + maxLength);
				} else {
					input.removeClass('error');
				}
			}

			// if normal type
			else {
				if(input.val() == '') {
					addErrorInvalid(input, inputMessage);
				} else if(!input.is('select') && input.val().length > maxLength) {
					addErrorInvalid(input, 'The max characters is ' + maxLength);
				} else {
					input.removeClass('error');
				}
			}
		}

		// if input is not required
		else {
			// remove error message when validating
			input.parent().find('.error-message').remove();

			// if type email
			if(input.attr('type') == 'email') {
				let regex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;
				if(input.val().length > 0 && !regex.test(input.val())){
					addErrorInvalid(input, 'Please add a valid email address');
				} else {
					input.removeClass('error');
				}
			}

			// type phone
			else if(input.attr('type') == 'tel') {
				let regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
				if(input.val().length > 0 && !regex.test(input.val())){
					addErrorInvalid(input, 'Please add a valid phone number');
				} else {
					input.removeClass('error');
				}
			}

			// type zip
			else if(input.attr('data-type') == 'zip') {
				let regex = /^\d{6}(-\d{4})?$/;
				if(input.val().length > 0 && !regex.test(input.val())){
					addErrorInvalid(input, 'Please add a correct postal code');
				} else {
					input.removeClass('error');
				}
			}

			// number
			else if(input.attr('type') == 'number') {
				if(input.val() !== '' && input.val() < minNumber) {
					addErrorInvalid(input, 'Number must be bigger than ' + (minNumber - 1));
				} else if(input.val().length > maxLength) {
					addErrorInvalid(input, 'The max characters is ' + maxLength);
				} else {
					input.removeClass('error');
				}
			}

			// if normal type
			else {
				if(!input.is('select') && input.val().length > maxLength) {
					addErrorInvalid(input, 'The max characters is ' + maxLength);
				} else {
					input.removeClass('error');
				}
			}

		}
	} // form submit ends


	// return functions
	return {
		validate: function() {
			const fields = $(`${formSelector} input, ${formSelector} select, ${formSelector} textarea`);
			$.each(fields, function() {
				validateInput($(this));
			});
		},
		refresh: function() {
			runValidation();
		}
	}
}
