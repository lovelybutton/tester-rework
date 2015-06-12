$(function(){
	'use strict';

	var polyfill = {
		localStorage: function(){
			if (!window.localStorage) {
				Object.defineProperty(window, "localStorage", new (function () {
				var aKeys = [], oStorage = {};
				Object.defineProperty(oStorage, "getItem", {
					value: function (sKey) { return sKey ? this[sKey] : null; },
					writable: false,
					configurable: false,
					enumerable: false
				});
				Object.defineProperty(oStorage, "key", {
					value: function (nKeyId) { return aKeys[nKeyId]; },
					writable: false,
					configurable: false,
					enumerable: false
				});
				Object.defineProperty(oStorage, "setItem", {
					value: function (sKey, sValue) {
						if(!sKey) { return; }
						document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
					},
					writable: false,
					configurable: false,
					enumerable: false
				});
				Object.defineProperty(oStorage, "length", {
					get: function () { return aKeys.length; },
					configurable: false,
					enumerable: false
				});
				Object.defineProperty(oStorage, "removeItem", {
					value: function (sKey) {
						if(!sKey) { return; }
						document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
					},
					writable: false,
					configurable: false,
					enumerable: false
				});
				this.get = function () {
					var iThisIndx;
					for (var sKey in oStorage) {
						iThisIndx = aKeys.indexOf(sKey);
						if (iThisIndx === -1) { oStorage.setItem(sKey, oStorage[sKey]); }
						else { aKeys.splice(iThisIndx, 1); }
						delete oStorage[sKey];
					}
					for (aKeys; aKeys.length > 0; aKeys.splice(0, 1)) { oStorage.removeItem(aKeys[0]); }
						for (var aCouple, iKey, nIdx = 0, aCouples = document.cookie.split(/\s*;\s*/); nIdx < aCouples.length; nIdx++) {
							aCouple = aCouples[nIdx].split(/\s*=\s*/);
							if (aCouple.length > 1) {
								oStorage[iKey = unescape(aCouple[0])] = unescape(aCouple[1]);
								aKeys.push(iKey);
							}
						}
						return oStorage;
					};
					this.configurable = false;
					this.enumerable = true;
					console.log()
				})());
			}
		},
		init: function(){
			polyfill.localStorage();
		}
	};

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
			application_type: ['corporate','ira','trust','partnership','llc','individual','joint'],
			ccy: ['aud','cad','chf','eur','gbp','hkd','jpy','nzd','usd'],
			country: ['afghanistan','albania','algeria','american_samoa','aaa','bbb','ccc','ddd','eee','fff','ggg','hhh','iii','jjj'],
			rb: ['fxcm', 'mt4'],
			execution: ['dealing_desk', 'no_dealing_desk'],
			locale: ['ar_AE', 'de_DE'],
			platform: ['mt4', 'trading_station', 'active_trader'],
			product: ['spread_bet', 'fx'],
			service_level: ['1', '2', '3', '4']
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

	var store = (function(){

		return {
			length: localStorage.length,
			set: localStorage.setItem,
			get: localStorage.getItem,
			getByIndex: localStorage.key
			// remove: removeItem,
			// removeAll: clear
		};
	}());

	var dataService = (function(){
		var data = {
			query_params: {
				rb: 'fxcm'
			},
			url_settings: {
				environment: 'secure4.fxcorporate.com/tr',
				protocol: 'https'
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
				// store.remove(key);
			} else {
				data[category][key] = value;
				// store.set(key, value);
			}
		}

		function init() {

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
	typeahead:active
	typeahead:idle
	typeahead:open // fires when results container opens
	typeahead:close
	typeahead:change
	typeahead:render
	typeahead:select // fires when a suggestion is selected
	* typeahead:autocomplete // fires when an autocomplete occurs

	opts.source =
	function (query, syncResults, asyncResults)


	*/
	var autocomplete = {

		defaults: {
			filterFn: function(strs) {
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
			handlers: {
				onActive: function(){},
				onClose: function(e){},
				onIdle: function(){},
				onOpen: function(){},
				onRender: function(){},
				onSelect: function(){},
				onChange: function(){}
			},
			opts: {
				highlight: true,
				hint: false,
				minLength: 0,
				limit:30
			}
		},
		bindOne: function(){

		},
		bindAll: function(){

		},
		bind: function( item, dataset, handlers ){
			item = $(item);
			dataset = dataset || [];
			handlers = handlers || {};
			$.extend(autocomplete.defaults.handlers, handlers);

			// attach typeahead functionality
			item.typeahead(autocomplete.defaults.opts, {
			  name: 'dataset',
			  source: autocomplete.defaults.filterFn(dataset)
			});

			// Attach change handler
			// Must be attached directly to each instance via native change event
			// At current time, typeahead's change event is not working
			// Therefore we cannot use event delegation.
			item.on('change', handlers.onChange);

			$(document).on('typeahead:active', handlers.onActive);
			$(document).on('typeahead:close', handlers.onClose);
			$(document).on('typeahead:open', handlers.onOpen);
			$(document).on('typeahead:render', handlers.onRender);
			$(document).on('typeahead:select', handlers.onSelect);
			$(document).on('typeahead:idle', handlers.onIdle);


			// typeahead events:
			// these work and are self-explanatory
			// typeahead:idle, typeahead:close, typeahead:open, typeahead:render

			// these fire when you select with your mouse or arrow keys
			// typeahead:select, typeahead:selected

			// these fire on TAB select, typeahead:autocomplete, typeahead:autocompleted

			// this fires if you change the value then blur but it did NOT autocomplete
			// change

			// this fires on focust
			// typeahead:active
			
			// these don't
			// typeahead:change, typeahead:changed

		},

		init: function(element){

		}
	};

	var query_params = {
		$el: $('ul#query_params'),
		$items: $(),
		$deleteElClassName: 'delete',
		template: _.template('<li><label><%= category %></label> <input type="text" data-category="<%= category %>" value="<%= value %>" /> <div data-action="delete" class="button round choose delete"><i class="fa fa-times"></i></div></li>'),

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
				items = items.add(query_params.template({category: category, value: finalValue }));
			});

			return items;
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

		bindDeleteButton: function(){
			// Set up the delete button handler
			query_params.$el.on('click', '.delete', function(e){
				var currentParam = $(e.target).closest('li').find('input');

				// clear the associated input and regenerate the URL
				if (currentParam.typeahead('val') !== ''){
					currentParam.typeahead('val', '');
					query_params.onUpdate(currentParam);
				}
			});
		},

		bindInputs: function( items ){
			items.each(function(){
				query_params.bindOneInput($(this).find('input'));
			});
		},

		bindOneInput: function( item ){
			var data = full_dataSet.query_params[item.data('category')];
			var handlers = {
				onActive: function(){},
				onChange: function(e){
					var el = $(e.target);
					query_params.onUpdate(el);
					$(el).typeahead('close');
				},
				onClose: function(e){
					var el = $(e.target);
					el.removeClass('active').closest('ul').removeClass('autocompleteOpen')
				},
				onIdle: function(){},
				onOpen: function(e){
					var el = $(e.target);
					el.addClass('active').closest('ul').addClass('autocompleteOpen')
				},
				onRender: function(){},
				onSelect: function(e){query_params.onUpdate(e.target);}
			};

			autocomplete.bind(item, data, handlers);

		},

		init: function( full_dataSet, selected ){
			var items = query_params.renderAll(full_dataSet, selected);
			query_params.bindInputs( items );
			util.appendHTML(items, query_params.$el);

			query_params.bindDeleteButton();
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
			var newHref = parts.protocol + '://' + parts.environment + '/?' + $.param(parts.query_params);
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

	var user_config = {
		$el: $('.configure'),
		onChangeTheme: function(e){
			var theme = $(this).data('theme');
			user_config.setTheme(theme);
			util.highlightSelected(this);
		},
		setTheme: function(theme){
			theme = theme || 'default-dark';
			$('body').attr('data-theme', theme);
			localStorage.setItem('theme', theme);
			util.highlightSelected( user_config.$el.find('[data-theme="'+ theme +'"]') );
		},
		getTheme: function(){
			var theme = localStorage.getItem('theme');
			return theme;
		},
		bind: function(item){
			user_config.$el.on('click', '.theme', user_config.onChangeTheme)
		},
		init: function(){
			user_config.bind();

			// Check for previous theme in localStorage
			var prevTheme = user_config.getTheme();
			if (prevTheme) user_config.setTheme(prevTheme);
		}

	};

	var bootstrap = function() {
		query_params.init( full_dataSet.query_params, dataService.getCategory('query_params') );
		url_settings.init();
		url.init();
		clipboard.init();
		autocomplete.init();
		user_config.init();
			
	}

	bootstrap();

	// Setup


});
