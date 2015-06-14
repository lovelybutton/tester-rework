$(function(){
	'use strict';

	/* --------------------------------------
	/* Utilities and Helpers
	/* -------------------------------------- */

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


	/* --------------------------------------
	/* UI configuration
	/* -------------------------------------- */

	var config = {
		$el: $('.configure'),
		onChangeTheme: function(e){
			var theme = $(this).data('theme');
			config.setTheme(theme);
			util.highlightSelected(this);
		},
		setTheme: function(theme){
			theme = theme || 'default-dark';
			$('body').attr('data-theme', theme);
			localStorage.setItem('theme', theme);
			util.highlightSelected( config.$el.find('[data-theme="'+ theme +'"]') );
		},
		getTheme: function(){
			var theme = localStorage.getItem('theme');
			return theme;
		},
		bind: function(item){
			config.$el.on('click', '.theme', config.onChangeTheme)
		},
		init: function(){
			config.bind();

			// Check for previous theme in localStorage
			var prevTheme = config.getTheme();
			if (prevTheme) config.setTheme(prevTheme);
		}

	};


	/* --------------------------------------
	/* Plugins
	/* -------------------------------------- */

	var clipboard = {
		$alertElTemplate: _.template('<div class="alert"><%= alertLabel %> copied to your clipboard <i class="<%= iconClass %>"></i> </div>'),
		timerID: '',

		init: function(){
			ZeroClipboard.config({
				swfPath: "static/vendor/ZeroClipboard/ZeroClipboard.swf",
				hoverClass: 'hover'
			});
			var client = new ZeroClipboard( $('[data-action="copy"]') );

			client.on( "ready", function(readyEvent) {

				client.on( "aftercopy", function(e){
					// TODO - clean up this logic. Messy!

					var element = $(e.target);
					var parent = element.parent();
					var alertElement = $(clipboard.$alertElTemplate({
						alertLabel: element.data('alert-label'),
						iconClass: element.find('i').attr('class')
					}));
					var prevAlert = parent.find('.' + alertElement.attr('class'));

					// Clear out previous alerts if they are still running
					window.clearTimeout(clipboard.timeoutID);
					if(prevAlert.length){
						prevAlert.fadeOut('fast');
					}
					// Display an alert indicating success
					parent.prepend(alertElement);

					alertElement.fadeIn('fast');
					clipboard.timeoutID = setTimeout(function(){
						alertElement.fadeOut('linear', function(){
							$(this).remove();
						});
					}, 1000);

					// in case we decide to use an <a>
					e.preventDefault;
				});
			});
		}
	};

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
				limit:10,
				minLength:0
			}
		},
		bind: function( item, dataset, handlers ){
			item = $(item);
			dataset = dataset || [];
			handlers = handlers || {};
			$.extend(autocomplete.defaults.handlers, handlers);

			// attach typeahead functionality
			item.typeahead(autocomplete.defaults.opts, {
				source: autocomplete.defaults.filterFn(dataset),
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
		}
	};


	/* --------------------------------------
	/* Models
	/* -------------------------------------- */

	var model = {
		params : {
			application_type: ['corporate','ira','trust','partnership','llc','individual','joint'],
			ccy: ['aud','cad','chf','eur','gbp','hkd','jpy','nzd','usd'],
			country: ['afghanistan','albania','algeria','american_samoa','andorra','angola','anguilla','antigua_and_barbuda','argentina','armenia','aruba','austria','azerbaijan','bahamas','bahrain','bangladesh','barbados','belgium','belize','benin','bermuda','bhutan','bolivia','bosnia_and_herzegovina','botswana','british_virgin_islands','brunei','bulgaria','burkina_faso','burundi','cambodia','cameroon','cape_verde_islands','cayman_islands','central_african_republic','chad','chile','china','colombia','comoros','costa_rica','croatia','cyprus','czech_republic','denmark','djibouti','dominica','dominican_republic','ecuador','egypt','el_salvador','equatorial_guinea','eritrea','estonia','ethiopia','falkland_islands','faroe_islands','fiji','finland','france','gabon','gambia','georgia','germany','ghana','gibraltar','greece','greenland','grenada','guam','guatemala','guinea','guinea','guyana','haiti','honduras','hungary','iceland','india','indonesia','iraq','ireland','isle_of_man','israel','italy','jamaica','jordan','kazakhstan','kenya','kiribati','kuwait','kyrgyzstan','laos','latvia','lebanon','lesotho','liechtenstein','lithuania','luxembourg','macao','macedonia','madagascar','malawi','malaysia','maldives','mali','malta','marshall','mauritania','mauritius','mexico','micronesia','moldova','monaco','mongolia','montenegro','morocco','mozambique','namibia','nauru','nepal','netherlands','netherlands_antilles','new_zealand','nicaragua','niger','nigeria','northern_mariana_islands','norway','oman','pakistan','palau','panama','papua_new_guinea','paraguay','peru','philippines','poland','portugal','puerto_rico','qatar','romania','russia','rwanda','saint_kitts_and_nevis','saint_lucia','saint_vincent','samoa','san_marino','sao_tome_and_principe','saudi_arabia','senegal','serbia','seychelles','sierra_leone','slovak_republic','slovenia','solomon_islands','south_africa','spain','sri_lanka','st_helena','suriname','swaziland','sweden','switzerland','taiwan','tajikistan','tanzania','thailand','togo','tonga','trinidad_and_tobago','tunisia','turkey','turkmenistan','turks_and_caicos','tuvalu','uganda','ukraine','united_arab_emirates','united_kingdom','united_states','uruguay','uzbekistan','vanuatu','venezuela','vietnam','virgin_islands_us','yemen','zambia'],
			rb: ['active_trader','au_at_mt4_retail','au_at_ts_retail','au_dd_mt4_retail','au_dd_ts_retail','au_ndd_mt4_retail','au_ndd_ts_retail','dannyltdtest15','ffrp_cfd','fss_au','fss_fxcmm','fss_uk','fxcm','fxcm_markets_mt4_at_ndd','FXCM_MARKETS_TS_AT_NDD','FXCM_MARKETS_USD_MT4_DD','FXCM_MARKETS_USD_MT4_DD','fxcm_markets_usd_mt4_ndd','fxcm_markets_usd_mt4_ndd','FXCM_MARKETS_USD_TS_DD','FXCM_MARKETS_USD_TS_DD','fxcm_markets_usd_ts_ndd','fxcm_markets_usd_ts_ndd','fxcmau_ffrp','fxcmltd','fxcmm_ffrp_ts2','fxcmuk','fxcmuk_bt','fxcmuk_spread_betting','fxcmuksb_mt4','llc_at_mt4_retail','LLC_DD_MT4_RETAIL','LLC_DD_TS_RETAIL','LTD_DD_MT4_RETAIL','LTD_DD_TS_RETAIL','LTD_SB_DD_MT4_RETAIL','LTD_SB_DD_TS_RETAIL','mt4','ninja_trader_au','ninja_trader_llc','ninja_trader_uk','tradency','uk_mt4_at_ndd','uk_sb_mt4_active_ndd','uk_sb_ts_active_ndd','uk_ts_active_ndd','zulutrade','zulutrade_ltd_au','zulutrade_ltd_uk'],
			execution: ['dealing_desk', 'no_dealing_desk'],
			locale: ['ar_AE','de_DE','el_GR','en_US','es_ES','fr_FR','it_IT','iw_IL','ja_JP','pl_PL','pt_BR','ru_RU','sv_SE','tr_TR','zh_CN','zh_TW'],
			platform: ['mt4', 'trading_station', 'active_trader'],
			product: ['spread_bet', 'fx'],
			service_level: ['1', '2', '3', '4']
		},

		urlProperties : {
			'environment': {
				qa:	'secure9x.fxcorporate.com/tr/',
				uat: 'secure9z.fxcorporate.com/tr/',
				prod: 'secure4.fxcorporate.com/tr/'
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

	var viewModel = (function(){
		var data = {
			params: {
				rb: 'fxcm'
			},
			urlProperties: {
				environment: 'secure4.fxcorporate.com/tr/',
				protocol: 'https'
			}
		};

		function getOne(type, key) {
			return data && data[type] && data[type][key] || false;
		}

		function getCategory(type, key) {
			return data && data[type] || false;
		}

		function getAll() {
			return data;
		}

		function setValue(type, key, value) {
			if (value === '') {
				delete data[type][key];
			} else {
				data[type][key] = value;
			}
		}

		return {
			getOne: getOne,
			getCategory: getCategory,
			getAll: getAll,
			set: setValue
		};
	}());



	/* --------------------------------------
	/* Views
	/* -------------------------------------- */

	var urlProperties = {
		$el: $('#urlProperties'),
		logElClass: '.log',
		logTemplate: _.template('<strong>URL:</strong> <span class="url"> <%= activeUrl %></span>'),
		timeoutID: '',

		updateLogWithValue: function(value, event){
			var log = $(urlProperties.logElClass);
			var markup = urlProperties.logTemplate({activeUrl: value });

			// Cancel any previous timeouts that may be around
			window.clearTimeout(urlProperties.timeoutID);

			// Update value
			// We're adding a class "hover" if the user is just hovering for a preview and not clicking
			// We also build in a tiny delay on mouseout to prevent flickering when the mouse hovers over a row of buttons
			if (event === 'mouseout') {
				// timeout here
				urlProperties.timeoutID = setTimeout(function(){
					log.removeClass('hover');
					log.html(markup);
				}, 100);
			} else if (event === 'mouseover') {
				log.addClass('hover');
				log.html(markup);
			} else if (event === 'click'){
				log.removeClass('hover');
				log.html(markup);
			}
		},

		onMouseOver: function(element){
			// Preview the value of the button we're hovering over now
			urlProperties.updateLogWithValue($(element).data('value'), 'mouseover');
		},
		onMouseOut: function(element){
			urlProperties.updateLogWithValue($(element).data('value'), 'mouseout');
		},

		onSelect: function(element){
			var category = $(element).attr('data-category');
			var value = $(element).attr('data-value');

			// Update viewModel and view
			util.highlightSelected(element);
			viewModel.set('urlProperties', category, value);
			url.render();

			if (category === 'environment') {
				urlProperties.updateLogWithValue(value, 'click');
			}
		},

		bind: function(){
			urlProperties.$el.on('click', '[data-category="environment"], [data-category="protocol"]', function(e){
				urlProperties.onSelect(this);
				e.preventDefault;
			});

			urlProperties.$el.on('mouseover mouseout', '[data-category="environment"]', function(e){
				switch(e.type){
					case 'mouseover':
						urlProperties.onMouseOver(this);
						break;

					case 'mouseout':
					urlProperties.onMouseOut(this);
						break;
				}
				e.preventDefault;
			});
		},

		init: function(){
			urlProperties.bind();

			var settings = viewModel.getCategory('urlProperties');

			_.each( settings, function(value, category){
				var el = urlProperties.$el.find('.button[data-value="'+ value +'"]');

				util.highlightSelected(el);
			});

			// Set log value on page load
			urlProperties.updateLogWithValue(settings.environment, 'click');
		}
	};


	var params = {
		$el: $('ul#params'),
		$items: $(),
		deleteElClass: '.delete',
		template: _.template('<li><label><%= category %></label> <input type="text" data-category="<%= category %>" value="<%= value %>" /> <div data-action="delete" class="button button-round choose delete"><i class="fa fa-times"></i></div></li>'),

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
				items = items.add(params.template({category: category, value: finalValue }));
			});

			params.bindInputs( items );
			return items;
		},

		onUpdate: function(element){
			element = $(element);

			var category = element.attr('data-category');
			var value = element.val();

			// update selected data according to new value
			viewModel.set('params', category, value);

			url.render();
		},

		bindInputs: function( items ){
			items.each(function(){
				params.bindOneInput($(this).find('input'));
			});

			params.$el.on('click', params.deleteElClass, function(e){
				var currentParam = $(e.target).closest('li').find('input');

				// clear the associated input and regenerate the URL
				if (currentParam.typeahead('val') !== ''){
					currentParam.typeahead('val', '');
					params.onUpdate(currentParam);
				}
			});
		},

		bindOneInput: function( item ){
			var data = model.params[item.data('category')];
			var handlers = {
				onActive: function(){},
				onChange: function(e){
					var el = $(e.target);
					params.onUpdate(el);
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
				onSelect: function(e){
					params.onUpdate(e.target);
				}
			};

			autocomplete.bind(item, data, handlers);
		},

		init: function(){
			var items;
			var localViewModel = viewModel.getCategory('params');
			var localModel = model.params;
			var queryString = $.deparam(document.location.search);

			// Update the viewModel with any data injected from the queryString
			// Validate all values before updating viewModel
			if(queryString && !queryString.redirect) {
				_.each(queryString, function(value, key, obj){
					if (_.has(localModel, key)){
						viewModel.set('params', key, value);
						delete obj[key];
					} else if (key === 'environment') {
						viewModel.set('urlProperties', 'environment', model.urlProperties.environment[value]);
						delete obj[key];
					} else if (key === 'protocol') {
						viewModel.set('urlProperties', 'protocol', value);
						delete obj[key];
					}
				});

				queryString.redirect = 'true';

				// Put back the query string without the stowed values - this is an interim solution to prevent stale query string state
				// Will update this when ported to backbone
				// TODO - update querystring each time a new value is selected.  Then the actual page url correctly represents state across the session.

				document.location.search = $.param(queryString) ;

			}

			// Render the params based on the updated viewModel and append to DOM
			var items = params.renderAll(model.params, viewModel.getCategory('params'));
			util.appendHTML(items, params.$el);
		}
	};

	var url = {
		$el: $('#generated_url'),
		$goLink: $('.url-go'),
		$copyLink: $('.url-copy'),
		$exportLink: $('.url-export'),

		constructText: function(urlParts, pretty) {
			var prettyText = [];
			var protocol = urlParts.protocol;
			var environment = urlParts.environment;
			var params = urlParts.params;

			// protocol
			prettyText.push( util.wrapTag(protocol, 'part') );
			prettyText.push( util.wrapTag('://', 'sep') );

			// environment
			prettyText.push( util.wrapTag(environment, 'part') );
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
		render: _.debounce(function(){
			// TODO - this logic has gotten quite messy. Needs a rework!
			// Probably going to be a rework of how the data is stored...
			// Keeping this for now to focus on building out features, but will readdress when I port to backbone.
			var params = viewModel.getCategory('params');
			var protocol = viewModel.getOne('urlProperties', 'protocol');
			var environment = viewModel.getOne( 'urlProperties', 'environment');
			var queryString = '';
			var urlProps = '';

			queryString = $.param(viewModel.getCategory('params'));

			urlProps += '&environment=';
			urlProps += _.findKey(model.urlProperties.environment, function(value, key){ return value === environment;});
			urlProps += '&protocol=';
			urlProps += protocol;

			var href = protocol + '://' + environment + '?' + queryString;
			var anchor = $('<a href="' + href + '">' + url.constructText({params: params, environment: environment, protocol: protocol }, true) + '</a>');

			// ensure export url is clean - no query strings or hashes stowing a ride
			var exportHref = document.location.protocol + '//' + document.location.host + document.location.pathname  + '?' + queryString + urlProps;

			util.appendHTML(anchor, url.$el);
			url.$copyLink.attr('data-clipboard-text', href);
			url.$exportLink.attr('data-clipboard-text', exportHref );
			url.$goLink.attr('href', href);

		}, 200),

		init: function(){
			url.render();
		}
	};


	/* --------------------------------------
	/* Bootstrap
	/* -------------------------------------- */

	var bootstrap = function() {
		params.init();
		urlProperties.init();
		url.init();
		clipboard.init();
		config.init();
	}

	bootstrap();

	// Setup


});
