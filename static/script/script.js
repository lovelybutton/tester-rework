$(function(){
	'use strict';

	var util = {
		appendHTML: function(child, parent){
			$(parent).empty().append(child);
		},
		highlightSelected: function( item ){
			var item = $(item);
			item.siblings(item.tag).andSelf().removeClass( 'current' );
			item.addClass( 'current' );
		},
		wrapTag: function(text, className, tag){
			tag = tag || 'span';
			className = className || '';
			return '<' + tag + ' class="' + className + '">' + text + '</' + tag + '>';
		}
	};

	var full_dataSet = {
		query_params : {
			application_type: ['corporate','ira','trust','partnership','llc','individual','joint']
			// ,
			// ccy: ['aud','cad','chf','eur','gbp','hkd','jpy','nzd','usd'],
			// country: ['afghanistan','albania','algeria','american_samoa'],
			// rb: ['fxcm', 'mt4'],
			// execution: ['dealing_desk', 'no_dealing_desk'],
			// locale: ['ar_AE', 'de_DE'],
			// platform: ['mt4', 'trading_station', 'active_trader'],
			// product: ['spread_bet', 'fx'],
			// service_level: ['1', '2', '3', '4']
		},
		url_settings : {
			'environment': {
				qa:	'secure9x.fxcorporate.com/tr',
				uat: 'secure9z.fxcorporate.com/tr',
				prod: 'secure4.fxcorporate.com/tr'
			},
			'protocol': {
				https: 'https',
				http: 'http'
			}
		}
	};

	var dataService = (function(){
		var data = {
			query_params: {
				rb: 'hello',
				product: 'something'
			},
			url_settings: {
				environment: 'secure9z.fxcorporate.com/tr',
				protocol: 'http'
			}
		};

		function getOne(category, key) {
			return data && data[category] && data[category][key] || false;
		}

		function getCategory(category, key) {
			return data && data[category] || false;
		}

		function getAll() {
			return data;
		}

		function setValue( category, key, value) {
			if (value === '') {
				delete data[category][key];
			} else {
				data[category][key] = value;
			}
		}

		return {
			getOne: getOne,
			getCategory: getCategory,
			getAll: getAll,
			set: setValue
		};
	}());

	var url_settings = {
		$el: $('#url_settings'),

		bind: function(){
			url_settings.$el.on('click', '.button', function(){
				url_settings.onSelect(this);
			});
		},

		onSelect: function(element){
			var category = $(element).attr('data-category');
			var value = $(element).attr('data-value');

			util.highlightSelected(element);
			dataService.set('url_settings', category, value);
			url.render();
		},

		init: function(){
			url_settings.bind();

			var settings = dataService.getCategory('url_settings');

			_.each( settings, function(value, category){
				var el = url_settings.$el.find('.button[data-value="'+ value +'"]');

				util.highlightSelected(el);
			});
		}
	};

	// Using typeahead: http://twitter.github.io/typeahead.js/examples/
	// https://github.com/twitter/typeahead.js

	/*
	I'll need these API methods:


	$('.exampleEl').typeahead('val');
	$('.exampleEl').typeahead('val', myVal);
	$('.exampleEl').typeahead('open');
	$('.exampleEl').typeahead('close');

	// bind to typeahead event
	$('.exampleEl').bind('typeahead:select', function(ev, suggestion) {
		console.log('Selection: ' + suggestion);
	});

	// other events:
	typehead:active
	typehead:idle
	typehead:open // fires when results container opens
	typehead:close 
	typehead:change
	typehead:render
	typehead:select // fires when a suggestion is selected
	* typehead:autocomplete // fires when an autocomplete occurs
	



	opts.source = 
	function (query, syncResults, asyncResults)


	*/
	var autocomplete = {

		substringMatcher: function(strs) {
		  return function findMatches(q, cb) {
		    var matches, substringRegex;

		    // an array that will be populated with substring matches
		    matches = [];

		    // regex used to determine if a string contains the substring `q`
			substringRegex = new RegExp(q, 'i');

		    // iterate through the pool of strings and for any string that
		    // contains the substring `q`, add it to the `matches` array
		    $.each(strs, function(i, str) {
		      if (substringRegex.test(str)) {
		        matches.push(str);
		      }
		    });

		    cb(matches);
		  };
		},

		bind: function( element, dataset ){
			element = $(element);
			dataset = ['corporate','ira','trust','partnership','llc','individual','joint'];

			// attach typehead functionality
			element.each(function(){
				$(this).find('input').typeahead({
				  highlight: true,
				  hint: false,
				  minLength: 0
				},
				{
				  name: 'dataset',
				  source: autocomplete.substringMatcher(dataset)
				});
			});
		},

		init: function(element){
			var dataset = full_dataSet.query_params.application_type;
			autocomplete.bind(element, dataset);

		}
	};


	var query_params = {
		$el: $('ul#query_params'),
		$items: $(),
		$deleteElClassName: 'delete',
		template: _.template('<li><label><%= category %></label> <input type="text" data-category="<%= category %>" value="<%= value %>" /> <div data-action="delete" class="choose delete"><i class="fa fa-trash-o"></i></div></li>'),

		renderAll: function(data, selected){
			var items = $();

			// render all items and set values if provided
			_.each( data, function(value, category, obj){
				var finalValue = '';
				var el;

				// check if we have a preselected value or not
				if ( _.has(selected, category) ) {
					finalValue = selected[category];
				}

				// append newly-prepared item to set
				query_params.$items = query_params.$items.add(query_params.template({category: category, value: finalValue }));
				
			});
		},

		onUpdate: function(element){
			element = $(element) || $('div');
			var category = element.attr('data-category');
			var value = element.val();
			var data = dataService.getCategory(query_params);

			// update selected data according to new value
			dataService.set('query_params', category, value);

			url.render();
		},

		bind: function( ){
			// apply changes to query param on blur and enter press
			autocomplete.bind(query_params.$items);
			
			// query_params.$el.on('keyup blur', 'input', function(e){
			// 	// Ignore all keyup events except for enter press
			// 	if (e.type === 'keyup' && e.which !== 13) return false;
			// 	query_params.onUpdate(this);
			// });

			// Set up the delete button handler
			query_params.$el.on('click', '.delete', function(e){
				var currentParam = $(e.target).closest('li').find('input');

				// clear the associated input and regenerate the URL
				if (currentParam.val() !== ''){
					currentParam.val('');
					currentParam.trigger('blur');
				}
			});
		},

		init: function( full_dataSet, selected ){
			query_params.renderAll(full_dataSet, selected);
			query_params.bind();
			util.appendHTML(query_params.$items, query_params.$el);
		}
	};

	var url = {
		$el: $('#generated_url'),
		$goLink: $('.url-go'),
		$copyLink: $('.url-copy'),

		generate: function(){
			var generated = {};
			generated.protocol = dataService.getOne( 'url_settings', 'protocol' );
			generated.environment = dataService.getOne( 'url_settings', 'environment' );
			generated.query_params = dataService.getCategory( 'query_params' );

			return generated;
		},

		constructText: function(urlParts, pretty) {
			var prettyText = [];
			var protocol = urlParts.protocol;
			var environment = urlParts.environment;
			var params = urlParts.query_params;

			// protocol
			prettyText.push( util.wrapTag(protocol, 'part') );
			prettyText.push( util.wrapTag('://', 'sep') );

			// environment
			prettyText.push( util.wrapTag(environment, 'part') );
			prettyText.push( util.wrapTag('/', 'part') );
			prettyText.push( util.wrapTag('?', 'sep') );

			// query params
			prettyText.push(url.serializeParams(params, pretty));

			return prettyText.join("");

		},

		serializeParams: function(params, pretty){
			// Returns params either serialized as a valid query param string or wrapped in syntax spans for visual display
			// pretty is a boolean value that when true, wraps the param parts in decorative spans
			var serialized;
			var part = '';

			if (pretty) {
				serialized = [];
				for (var param in params){
					part = util.wrapTag(param, 'param') + util.wrapTag('=', 'eq') + util.wrapTag(params[param], 'param');
					serialized.push(part);
				}
				serialized = serialized.join(util.wrapTag('&', 'sep'));
			} else {
				serialized = $.param(params);
			}
			return serialized;
		},

		render: function( ){
			var parts = url.generate();
			var newHref = parts.protocol + '://' + parts.environment + '/' + $.param(parts.query_params);
			var newEl = $('<a href="' + newHref + '">' + url.constructText(parts, true) + '</a>');

			util.appendHTML(newEl, url.$el);
			url.$copyLink.attr('data-clipboard-text', newHref);
			url.$goLink.attr('href', newHref);
		},

		init: function(){
			url.render();
		}
	};

	var clipboard = {
		init: function(){
			ZeroClipboard.config( { swfPath: "static/vendor/ZeroClipboard/ZeroClipboard.swf" } );
			var client = new ZeroClipboard( $('.url-copy') );

			client.on( "ready", function( readyEvent ) {
				client.on( "aftercopy", function( event ){
					//TODO: This is a crude way of alerting the user that text has been copied. Rework
					$(event.target).addClass('alerting');
					var timeoutID = window.setTimeout(function(){
						$(event.target).removeClass('alerting');
					}, 2000);

					// this -> client
					// event.target -> the element that was clicked
					// event.data["text/plain"] -> text that was copied
				});
			});
		}
	};



	// Setup
	query_params.init( full_dataSet.query_params, dataService.getCategory('query_params') );
	url_settings.init();
	url.init();
	clipboard.init();

});
