$(function(){
	'use strict';

	var util = {
		appendHTML: function(child, parent){

		},
		crossBrowserEventObj: function(){

		}
	};

	var data = {
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
			'Environment': {
				'qa': ["http://qa"],
				'uat': ["http://uat"],
				'prod': ["http://prod"]
			},
			'Protocol': {
				'https': ['https'],
				'http': ['http']
			}
		}
	};

	var url = {
		$el: $('#generated_url'),
		render: function(){
			console.log('rendering the url');
			url.$el.text('this is test content');
		},
		init: function(){
			url.render();
		}
	};

	var url_settings = {
		$el: $('#url_settings').find('.button'),

		select: function(){
			console.log('selecting');
		},
		bind: function(){
			console.log('binding');
			url_settings.$el.each(function(){
				$(this).on('click', function(){
					url_settings.select();
				} );
			});

		},
		init: function(){
			url_settings.bind();
		}

	};

	var autocomplete = {
		$el: $('[data-autocomplete]'),
		template: $(),

		sourceCallback: function( term, suggest, category ){
			term = term.toLowerCase();
			var choices = data.query_params[category] || [];
			var suggestions = [];
			for ( var i = 0; i < choices.length; i++ ) {
				if ( choices[i].toLowerCase().indexOf(term) > -1 ) {
					suggestions.push(choices[i]);
				}
			}
			suggest(suggestions);
		},

		renderItemCallback: function (item, search, category){
			var category = category || "not defined";
			var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
			return '<div class="autocomplete-suggestion" data-val="' + item + '">' + item.replace(re, "<b>$1</b>") + '</div>';
		},

		onSelectCallback: function( e, term, item){
			console.log('updating ' + item.attr('data-category') + '. New value is: ' + item.text() );
			url.render();
		},

		init: function(){
			// Automcomplete
			// http://goodies.pixabay.com/jquery/auto-complete/demo.html
			// Using the renderItem function to turn the autocomplete into a combo autocomplete with select menu functionality
			autocomplete.$el.each(function(){
				var category = $(this).attr('data-category');
				$(this).autoComplete({
					minChars: 0,
					delay:75,
					source: function( term, suggest ){
						autocomplete.sourceCallback( term, suggest, category);
					},
					renderItem: autocomplete.renderItemCallback,
					onSelect: autocomplete.onSelectCallback
				});
			});
		}
	};

	// Setup
	autocomplete.init();
	url.init();
	url_settings.init();

});
