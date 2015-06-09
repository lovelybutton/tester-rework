$(function(){
	'use strict';

	var util = {
		appendHTML: function(child, parent){

		},
		crossBrowserEventObj: function(){

		}
	};

	var all_data = {
		query_params : {
			'application_type': ['corporate','ira','trust','partnership','llc','individual','joint'],
			'ccy': ['aud','cad','chf','eur','gbp','hkd','jpy','nzd','usd'],
			'country': ['afghanistan','albania','algeria','american_samoa'],
			'rb': ['fxcm', 'mt4'],
			'execution': ['dealing_desk', 'no_dealing_desk'],
			'locale': ['ar_AE', 'de_DE'],
			'platform': ['mt4', 'trading_station', 'active_trader'],
			'product': ['spread_bet', 'fx'],
			'service_level': ['1', '2', '3', '4']
		},
		url_settings : {
			'environment': {
				'qa': ["http://qa"],
				'uat': ["http://uat"],
				'prod': ["http://prod"]
			},
			'protocol': {
				'https': ['https'],
				'http': ['http']
			}
		}
	};

	var selected_data = {
		query_params: {
			rb: 'hello',
			area: 'goodbye',
			product: 'something'
		},
		url_settings: {
			environment: 'qa',
			protocol: 'http'
		}
	};

	var url = {
		$el: $('#generated_url'),
		render: function( text ){
			console.log('rendering the url');
			url.$el.text( text );
		},
		init: function(){
			url.render();
		}
	};

	var url_settings = {
		$el: $('#url_settings').find('.button'),
		template: '',

		select: function(){
			console.log('selecting');
		},

		bind: function(){
			console.log('binding');
			url_settings.$el.each(function(){
				$(this).on('click', url_settings.select);
			});

		},

		init: function(){
			url_settings.bind();
		}

	};

	var query_params = {
		$el: $('ul#query_params'),
		template: _.template('<li><label><%= category %></label> <input type="text" data-category="<%= category %>" value="<%= value %>" /></li>'),

		renderAll: function( data, selected ){
			// render all categories
			var items = '';

			_.each( data, function(value, category, obj){
				// check if we have a preselected value passed for this category. If not, value should be empty
				var finalValue = _.has( selected, category) ? selected[category] : '';
	
				items += query_params.template({category: category, value: finalValue });
			});

			query_params.bind( items );
			query_params.$el.append( items );

		},

		
		setValue: function( category, value ){
			console.log("setting " + category + "with the value of: " + value);
		},

		onUpdate: function( element ){
			element = $(element) || $('div');
			var category = element.attr('data-category');
			var value = element.val();

			url.render( category + '=' + value );
		},

		bind: function( elementSet ){
			query_params.$el.on('keyup', 'input', function(){
				query_params.onUpdate( this );
			});

			// $(elementSet).each(function(){
			// 	var el = $(this);
			// 	el.live('keyup', function(){

			// 	});
			// });
		},

		init: function( all_data, selected ){

			query_params.renderAll( all_data, selected );
			
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
	query_params.init( all_data.query_params, selected_data.query_params );
	// url_settings.init();
	// url.init( data.url_settings );

});
