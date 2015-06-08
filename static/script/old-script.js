$(function(){

	function highlightSelected(item){
		var item = $(item);		
		item.siblings(item.tag).andSelf().removeClass(_settings.className.selected);			
		item.addClass(_settings.className.selected);
	}

	function updateUI(elem, val){
		$(elem).empty().append(val);
		return val;
	}
	
	function wrapTag(text, className, tag){
		tag = tag || 'span';
		return '<' + tag + ' class="' + className + '">' + text + '</' + tag + '>';
	}

	function setData(key, value, dataType) {
		var obj = dataType === 'params' ? data.params : data;
		return obj[key] = encodeURI(value);
	}

	function getData(key, dataType){
		var obj = dataType === 'params' ? data.params : data;
		if (!key) {
			return obj;
		} else {
			return obj[key];
		}
	}

	function setURL(environment, url){
		return _settings[environment] = url;
	}

	function getURL(environment){
		return _settings.url[environment];
	}

	function deleteData(key, dataType){
		var obj = dataType === 'params' ? data.params : dataType === 'url' ? data.url : data;
		delete obj[key];

		return key;
	}

	function setQueryData(dataObj){

	}

	function getQueryData(){
		var qs = window.location.search;
		var queryData = {};
		queryData.params = {};
		
		if(qs) {
			qs = qs.slice(1).split('&');

			for (var i = 0; i < qs.length; i++){
				var item = qs[i].split('=');
				if (item[0] === 'environment' || item[0] === 'protocol'){
					queryData[item[0]] = item[1];
				} else {
					queryData.params[item[0]] = item[1];
				}
			}
		}
		return queryData;
	}

	// Returns params in an array
	// pretty is a boolean value that when true, wraps the param parts in decorative spans
	function serializeParams(pretty){
		var params = getData('params');
		var arr = [];

		for (var param in params){
			if (pretty) {
				arr.push( wrapTag(param, _settings.className.param) + wrapTag('=', _settings.className.equals) + wrapTag(params[param], _settings.className.param) );
			} else {
				arr.push( param + '=' + params[param] );
			}
		}
		return arr;
	}

	function generateURL(){
		var protocol = getData('protocol');
		var environment = getData('environment');
		var url = [];
		var prettyText = [];

		url.push(protocol + '://' + getURL(environment));
		url.push('?' + serializeParams().join('&'));

		prettyText.push( wrapTag(protocol, _settings.className.urlPart) + wrapTag('://', _settings.className.separator) + wrapTag( getURL(environment), _settings.className.urlPart) );
		prettyText.push( wrapTag('?', _settings.className.separator) + serializeParams(true).join( wrapTag('&', _settings.className.separator) ) );

		return $('<a href="' + url.join('/') + '" target="_blank">' + prettyText.join( wrapTag('/', _settings.className.separator) ) + '</a>');
	}

	function copyToClipboard(text) {
		window.prompt("To copy to clipboard, hit: Ctrl+C, Enter", text);
	}

	
	// This object stores default values and will later hold user-selected data
	
	var _settings = {

		el: {
			$controlUI:			$('.controls').find('li.button'), // buttons for protocol, environment ec
			$paramUI:			$('.controls#params').children('li'), // list items that contain the query param choices
			$output:			$('.url'), // DOM element that holds the generated url
			$modals:			$('.modal'),
			$modalChooseBtn:	$('.choose'),
			$modalDropdown:		$('.modal').find('select'),
			$editBtn: 			$('<div class="choose edit"><i class="fa fa-pencil"></i></div>'),
			$deleteBtn: 		$('<div class="choose delete"><i class="fa fa-trash-o"></i></div>'),
			$trackingCheckbox:  $('input#tracking')
		}, 

		className: {
			selected:	'current',
			edit: 		'editing',
			equals:		'eq',
			separator:	'sep',
			urlPart:	'part',
			param:		'param'
		},

		url: {
			qa:		'secure9x.fxcorporate.com/tr',
			uat:	'secure9z.fxcorporate.com/tr',
			prod:	'secure4.fxcorporate.com/tr'
		}
	};
	
	var _vent = {
		getE: function(e){
			var targ;
			
			if (!e) { var e = window.event; }
			
			if (e.target) {
				targ = e.target;
			} else if (e.srcElement) {
				targ = e.srcElement;
			}
			
			if (targ.nodeType == 3) { // defeat Safari bug
				targ = targ.parentNode;
			}

			return e;
		}

		/*showModal: function($modal){
			// Hide all other visible modals
			this.hideModal( _settings.el.$modals.filter(':visible') );
			
			$modal.show().animate({
				opacity: 1,
				left: "-=50"
			}, 200, function(){
				// Toggle parent li class
				$modal.closest('li').toggleClass(_settings.className.edit);
			});
			
			return $modal;
		},

		hideModal: function($modal){
			
			// Toggle parent li class
			$modal.closest('li').toggleClass(_settings.className.edit);

			$modal.animate({
				opacity: 0, 
				left: "+=50"
			}, 200, function(){
				$modal.hide();
			});

			return $modal;
		}*/
	};

	// Showing / hiding modal
	(function( $ ) {
		$.fn.modal = function( state ) {
			
			if (state === 'show') {
				_settings.el.$modals.filter(':visible').modal('hide'); // Hide all other visible modals
				$(this).show().animate({ // Show current modal
					opacity: 1,
					left: "-=50"
				}, 200, function(){					
					$(this).closest('li').toggleClass(_settings.className.edit); // Toggle parent li class

					// Check if text box's current value resides in select menu - if so, highlight that item
					var prevValue = $(this).closest('.has-modal').find('input').val();
					var prevValueOption = $(this).find("[value='" + prevValue + "']");
					if (prevValueOption.length) {
						prevValueOption.attr('selected', 'selected');
					}
				});	
			} 

			if (state == 'hide') {
				$(this).closest('li').toggleClass(_settings.className.edit); // Toggle parent li class
				$(this).animate({ // Hide current modal
					opacity: 0, 
					left: "+=50"
				}, 200, function(){
					$(this).hide();
				});
			}

			return this;
		};
	}( jQuery ));

	/* -------- START Event handlers --------  */

	// Attach behavior to parameter edit buttons and append to parameter list items
	_settings.el.$editBtn.bind('click', function(e){
		e = _vent.getE(e).stopPropagation();
		$(this).closest('li').find('.modal').modal('show');
	}).appendTo( _settings.el.$paramUI.filter('.has-modal') );

	// Attach behavior to parameter delete buttons and append to parameter list items
	_settings.el.$deleteBtn.bind('click', function(e){
		e = _vent.getE(e).stopPropagation();
		$(this).closest('li').find('input').val('').trigger('blur');

	}).appendTo( _settings.el.$paramUI.filter('.has-modal') );


	// Modal event handlers
	_settings.el.$modalChooseBtn.click(function(e){
		e = _vent.getE(e).stopPropagation();

		var action = $(this).attr('class').split(' ')[1];
		var $parentModal = $(this).closest('.modal');
		var $parentLI = $(this).closest('li[data-value]');
		var value = $parentModal.find('select').val();

		if (action === 'accept') {
			$(this).closest('li[data-value]').find('input').val( $parentModal.find('select').val() ).trigger('blur');
		} 

		$parentModal.modal('hide');
	});

	_settings.el.$modalDropdown.change(function(){
		var $parentLI = $(this).closest('li[data-value]');
		var $parentModal = $(this).closest('.modal');
		// TODO - pre-populate value in input field upon select change.
	});

	_settings.el.$modalDropdown.keypress(function(event){
		var $parentModal = $(this).closest('.modal');
		if(event.keyCode == 13){ // user hit the enter key - commit changes
			$parentModal.find('.accept').trigger('click');
		}
	});

	_settings.el.$modalDropdown.keyup(function(event){
		var $parentModal = $(this).closest('.modal');
		if (event.keyCode == 27) { // user hit the esc key - discard changes
			$parentModal.find('.decline').trigger('click');				
		}
	});

	// Hide any visible modals when click on body
	$('body').click(function(e){		
		_settings.el.$modals.filter(':visible').modal('hide');
	});

	// Stop propagation on clicking within the modal body (prevents it from closing)
	_settings.el.$modals.click(function(e){
		e = _vent.getE(e).stopPropagation();
	});

	// On control button click (protocol, environment, tracking)
	_settings.el.$controlUI.bind('click mouseover mouseout', function(e){
		e = _vent.getE(e);

		var key = $(this).parent('ul').attr('id');
		var value = $(this).attr('data-value');
		var $log = $(this).closest('.toolbox').find('.log').find('.txt');

		// Do nothing if this button is already selected
		if ($(this).hasClass(_settings.className.current)) { return false; }

		switch (e.type) {
			case 'mouseover':
				updateUI($log, getURL(value));
				break;

			case 'mouseout':
				updateUI($log, getURL( getData('environment') ));
				break;

			default: 
				highlightSelected(this);
				setData(key, value, key === 'environment' ? 'url' : '');
				updateUI( _settings.el.$output, generateURL() );
		}		
	});

	// On parameter update 
	_settings.el.$paramUI.find('input').bind('keyup blur', function(e){	
		
		if (!e) { var e = window.event; }

		var key = $(this).parent('li').attr('data-value');
		var value = $(this).val();

		if (e.type === 'keyup' && e.which !== 13) {
			return false;
		}

		// Update UI and data objects
		if (value === '') { // if value is blank, remove this pair from the data object
			deleteData(key, 'params');
		} else {
			setData(key, value, 'params');
		}

		updateUI( _settings.el.$output, generateURL() );
		
		if (e.which === 13) {
			// TODO - this causes the event handler to run twice if you have hit enter!!
			$(this).blur();
		};
	});

	// Prevent modal from closing when you focus on input field
	_settings.el.$paramUI.find('input').bind('click', function(e){
		_vent.getE(e).stopPropagation();
	});

	$('.url-options a').click(function(){
		var url = $(this).parents('.urlbox').find('.url a').attr('href');

		if ( $(this).hasClass('url-copy') ){
			copyToClipboard( url );
		} else if ($(this).hasClass('url-go')){
			$(this).attr('href', url);
		}
	});

	_settings.el.$trackingCheckbox.change(function(){
		if ( $(this).is(':checked') ) {
			setData('cmp', '123456', 'params');
		} else {
			deleteData('cmp', 'params');
		}
		updateUI( _settings.el.$output, generateURL() );
	});


	/* -------- END Event handlers --------  */

	/* -------- START Constructor logic --------  */
	
	// On page load...
	// Check for data passed in query string
	//$.extend(true, data, getQueryData());

	var data = $.extend(true, {
		// Default values
		protocol:		'https',
		environment:	'prod',
		cmp: 			'',

		params: {
			rb:		'fxcm'
		}
	},  getQueryData() );

	// Loop through data and update UI. 
	// Data may hold either default values or values passed via query string
	for (var item in data) {
		if (item === 'params') {
			for (var param in data[item]) {
				var el = _settings.el.$paramUI.filter("[data-value='" + param + "']").find('input').val(data[item][param]);
				el.trigger('keyup');
			}
		} else {
			_settings.el.$controlUI.filter("[data-value='" + data[item] + "']").trigger('click');
		}
	}

	/* -------- END Constructor logic --------  */

});
