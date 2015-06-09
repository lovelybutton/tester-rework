$(function(){
	'use strict';

	var util = {
		appendHTML: function(child, parent){

		},
		crossBrowserEventObj: function(){

		},
		highlightSelected: function( item ){
			var item = $(item);		
			item.siblings(item.tag).andSelf().removeClass( 'current' );			
			item.addClass( 'current' );
		}

	};

	var full_dataSet = {
		query_params : {
			application_type: ['corporate','ira','trust','partnership','llc','individual','joint'],
			ccy: ['aud','cad','chf','eur','gbp','hkd','jpy','nzd','usd'],
			country: ['afghanistan','albania','algeria','american_samoa'],
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

	var active_data = (function(){
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

		function getOne( category, key) {
			return data && data[category] && data[category][key] || false;
		}

		function getCategory( category, key) {
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
				url_settings.onSelect( this );
			});
		},
		
		onSelect: function( element ){
			var category = $(element).attr('data-category');
			var value = $(element).attr('data-value');

			util.highlightSelected( element);
			active_data.set( 'url_settings', category, value );
			url.render();
		},
		
		init: function(){
			url_settings.bind();

			var settings = active_data.getCategory('url_settings');

			_.each( settings, function(value, category){				
				var el = url_settings.$el.find('.button[data-value="'+ value +'"]');

				util.highlightSelected( el );
			});

		}

	};

	var query_params = {
		$el: $('ul#query_params'),
		template: _.template('<li><label><%= category %></label> <input type="text" data-category="<%= category %>" value="<%= value %>" /></li>'),

		renderAll: function( data, selected ){
			var items = '';

			// render all items and set values if provided
			_.each( data, function(value, category, obj){				
				var finalValue = '';
				
				// check if we have a preselected value or not			
				if ( _.has( selected, category ) ) {
					finalValue = selected[category];
				} 

				// append newly-prepared item to set
				items += query_params.template({category: category, value: finalValue });
			});

			query_params.$el.append( items );
		},

		onUpdate: function( element ){
			element = $(element) || $('div');
			var category = element.attr('data-category');
			var value = element.val();
			var data = active_data.getCategory( query_params );

			// update selected data according to new value
			active_data.set('query_params', category, value);

			url.render();
		},

		bind: function(){
			query_params.$el.on('keyup', 'input', function(){
				query_params.onUpdate( this );
			});
		},

		init: function( full_dataSet, selected ){
			query_params.renderAll( full_dataSet, selected );
			query_params.bind();			
		}
	};

	var url = {
		$el: $('#generated_url'),

		generate: function(  ){
			var generated = [];
			var protocol = active_data.getOne( 'url_settings', 'protocol' ) + '://';
			var environment = active_data.getOne( 'url_settings', 'environment' );
			var params = active_data.getCategory( 'query_params' );

			generated.push( protocol );
			generated.push( environment );
			generated.push( '?' + $.param( params ) ); 
			return generated.join('');
		},

		render: function( ){
			var newURL = url.generate();
			url.$el.text( newURL );
		},

		init: function(){
			url.render();
		}
	};

	// var autocomplete = {
	// 	$el: $('[data-autocomplete]'),
	// 	template: $(),

	// 	sourceCallback: function( term, suggest, category ){
	// 		term = term.toLowerCase();
	// 		var choices = data.query_params[category] || [];
	// 		var suggestions = [];
	// 		for ( var i = 0; i < choices.length; i++ ) {
	// 			if ( choices[i].toLowerCase().indexOf(term) > -1 ) {
	// 				suggestions.push(choices[i]);
	// 			}
	// 		}
	// 		suggest(suggestions);
	// 	},

	// 	renderItemCallback: function (item, search, category){
	// 		var category = category || "not defined";
	// 		var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
	// 		return '<div class="autocomplete-suggestion" data-val="' + item + '">' + item.replace(re, "<b>$1</b>") + '</div>';
	// 	},

	// 	onSelectCallback: function( e, term, item){
	// 		console.log('updating ' + item.attr('data-category') + '. New value is: ' + item.text() );
	// 		url.render();
	// 	},

	// 	init: function(){
	// 		// Automcomplete
	// 		// http://goodies.pixabay.com/jquery/auto-complete/demo.html
	// 		// Using the renderItem function to turn the autocomplete into a combo autocomplete with select menu functionality
	// 		autocomplete.$el.each(function(){
	// 			var category = $(this).attr('data-category');
	// 			$(this).autoComplete({
	// 				minChars: 0,
	// 				delay:75,
	// 				source: function( term, suggest ){
	// 					autocomplete.sourceCallback( term, suggest, category);
	// 				},
	// 				renderItem: autocomplete.renderItemCallback,
	// 				onSelect: autocomplete.onSelectCallback
	// 			});
	// 		});
	// 	}
	// };

	// Setup
	query_params.init( full_dataSet.query_params, active_data.getCategory( 'query_params' ) );
	url_settings.init();
	url.init();

});
