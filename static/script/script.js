$(function(){
	'use strict';

	var data = {
		'application_type': ['corporate','ira','trust','partnership','llc','individual','joint'],
		'ccy': ['aud','cad','chf','eur','gbp','hkd','jpy','nzd','usd'],
		'country': ['afghanistan','albania','algeria','american_samoa','andorra','angola','anguilla','antigua_and_barbuda','argentina','armenia','aruba','austria','australia','azerbaijan'],
		'rb': ['fxcm', 'mt4'],
		'execution': ['dealing_desk', 'no_dealing_desk'],
		'locale': ['ar_AE', 'de_DE'],
		'platform': ['mt4', 'trading_station', 'active_trader'],
		'product': ['spread_bet', 'fx'],
		'service_level': ['1', '2', '3', '4']
	};

	function sourceCallback( term, suggest, dataCategory ){
		term = term.toLowerCase();
		var choices = data[dataCategory];
		var suggestions = [];
		for ( i = 0; i < choices.length; i++ ) {
			if ( choices[i].toLowerCase().indexOf(term) > -1 ) {
				suggestions.push(choices[i]);
			}
		}
		suggest(suggestions);
	}

	function renderItemCallback( item, search ){
		return '<div class="autocomplete-suggestion">' + item + '</div>';
	}

	function onSelectCallback( e, term, item){
		console.log('Item "' + item.text() + '" selected by ' + (e.type == 'keydown' ? 'pressing enter' : 'mouse click') + '.');
	}

	// Automcomplete
	// http://goodies.pixabay.com/jquery/auto-complete/demo.html
	// Using the renderItem function to turn the autocomplete into a combo autocomplete with select menu functionality
	$('[data-autocomplete]').each(function(){
		var dataCategory = $(this).attr('data-category');

		$(this).autoComplete({
			minChars: 0,
			source: function( term, suggest ){
				sourceCallback( term, suggest, dataCategory );
			}
		});
	});
	
});
