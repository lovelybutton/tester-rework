<?php

/*
Copyright 2010 Ludovico Fischer. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list
   of conditions and the following disclaimer in the documentation and/or other materials
   provided with the distribution.

THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


/* TO DOs
==================================== */
/*

I've successfully got the db loaded. Now I need to figure out how to get values through the server.

*/


/* Set up file database
==================================== */

// use Flintstone\Flintstone;
require 'lib/Flintstone.php';
require 'lib/FlintstoneDB.php';
require 'lib/FlintstoneException.php';
require 'lib/Formatter/FormatterInterface.php';
require 'lib/Formatter/JsonFormatter.php';
require 'lib/Formatter/SerializeFormatter.php';

use Flintstone\Flintstone;
use Flintstone\Formatter\JsonFormatter;

// Set options
$db_dir = getcwd() . '/db';
$db_options = array('dir' => $db_dir);

// Load the databases
$db_params = Flintstone::load('params', $db_options);
$db_props = Flintstone::load('props', $db_options);

// Seed the db
$db_params->set('rb', ['fxcm', 'fxcmuk_bt', 'mt4']);
$db_params->set('product', ['fx', 'spread_bet']);
$db_params->set('ccy', ['usd', 'cad']);


$db_props->set('protocol', ['https', 'http']);
$db_props->set('environment', ['qa', 'uat', 'prod']);

// var model = {
// 		params : {
// 			application_type: ['corporate','ira','trust','partnership','llc','individual','joint'],
// 			ccy: ['aud','cad','chf','eur','gbp','hkd','jpy','nzd','usd'],
// 			country: ['afghanistan','albania','algeria','american_samoa','andorra','angola','anguilla','antigua_and_barbuda','argentina','armenia','aruba','austria','azerbaijan','bahamas','bahrain','bangladesh','barbados','belgium','belize','benin','bermuda','bhutan','bolivia','bosnia_and_herzegovina','botswana','british_virgin_islands','brunei','bulgaria','burkina_faso','burundi','cambodia','cameroon','cape_verde_islands','cayman_islands','central_african_republic','chad','chile','china','colombia','comoros','costa_rica','croatia','cyprus','czech_republic','denmark','djibouti','dominica','dominican_republic','ecuador','egypt','el_salvador','equatorial_guinea','eritrea','estonia','ethiopia','falkland_islands','faroe_islands','fiji','finland','france','gabon','gambia','georgia','germany','ghana','gibraltar','greece','greenland','grenada','guam','guatemala','guinea','guinea','guyana','haiti','honduras','hungary','iceland','india','indonesia','iraq','ireland','isle_of_man','israel','italy','jamaica','jordan','kazakhstan','kenya','kiribati','kuwait','kyrgyzstan','laos','latvia','lebanon','lesotho','liechtenstein','lithuania','luxembourg','macao','macedonia','madagascar','malawi','malaysia','maldives','mali','malta','marshall','mauritania','mauritius','mexico','micronesia','moldova','monaco','mongolia','montenegro','morocco','mozambique','namibia','nauru','nepal','netherlands','netherlands_antilles','new_zealand','nicaragua','niger','nigeria','northern_mariana_islands','norway','oman','pakistan','palau','panama','papua_new_guinea','paraguay','peru','philippines','poland','portugal','puerto_rico','qatar','romania','russia','rwanda','saint_kitts_and_nevis','saint_lucia','saint_vincent','samoa','san_marino','sao_tome_and_principe','saudi_arabia','senegal','serbia','seychelles','sierra_leone','slovak_republic','slovenia','solomon_islands','south_africa','spain','sri_lanka','st_helena','suriname','swaziland','sweden','switzerland','taiwan','tajikistan','tanzania','thailand','togo','tonga','trinidad_and_tobago','tunisia','turkey','turkmenistan','turks_and_caicos','tuvalu','uganda','ukraine','united_arab_emirates','united_kingdom','united_states','uruguay','uzbekistan','vanuatu','venezuela','vietnam','virgin_islands_us','yemen','zambia'],
// 			rb: ['active_trader','au_at_mt4_retail','au_at_ts_retail','au_dd_mt4_retail','au_dd_ts_retail','au_ndd_mt4_retail','au_ndd_ts_retail','dannyltdtest15','ffrp_cfd','fss_au','fss_fxcmm','fss_uk','fxcm','fxcm_markets_mt4_at_ndd','FXCM_MARKETS_TS_AT_NDD','FXCM_MARKETS_USD_MT4_DD','FXCM_MARKETS_USD_MT4_DD','fxcm_markets_usd_mt4_ndd','fxcm_markets_usd_mt4_ndd','FXCM_MARKETS_USD_TS_DD','FXCM_MARKETS_USD_TS_DD','fxcm_markets_usd_ts_ndd','fxcm_markets_usd_ts_ndd','fxcmau_ffrp','fxcmltd','fxcmm_ffrp_ts2','fxcmuk','fxcmuk_bt','fxcmuk_spread_betting','fxcmuksb_mt4','llc_at_mt4_retail','LLC_DD_MT4_RETAIL','LLC_DD_TS_RETAIL','LTD_DD_MT4_RETAIL','LTD_DD_TS_RETAIL','LTD_SB_DD_MT4_RETAIL','LTD_SB_DD_TS_RETAIL','mt4','ninja_trader_au','ninja_trader_llc','ninja_trader_uk','tradency','uk_mt4_at_ndd','uk_sb_mt4_active_ndd','uk_sb_ts_active_ndd','uk_ts_active_ndd','zulutrade','zulutrade_ltd_au','zulutrade_ltd_uk'],
// 			execution: ['dealing_desk', 'no_dealing_desk'],
// 			locale: ['ar_AE','de_DE','el_GR','en_US','es_ES','fr_FR','it_IT','iw_IL','ja_JP','pl_PL','pt_BR','ru_RU','sv_SE','tr_TR','zh_CN','zh_TW'],
// 			platform: ['mt4', 'trading_station', 'active_trader'],
// 			product: ['spread_bet', 'fx'],
// 			service_level: ['1', '2', '3', '4']
// 		},

// 		urlProperties : {
// 			'environment': {
// 				qa:	'secure9x.fxcorporate.com/tr/',
// 				uat: 'secure9z.fxcorporate.com/tr/',
// 				prod: 'secure4.fxcorporate.com/tr/'
// 			},
// 			'protocol': {
// 				https: 'https',
// 				http: 'http'
// 			}
// 		}
// 	};




/* Server logic
==================================== */

class Server {
    /* The array key works as id and is used in the URL
       to identify the resource.
    */

	function Server($params, $props){
		$this->params = $params;
		$this->props = $props;
	}
   
    private $model = [

		"params" => [
	    	'rb' => [
    			['val' => 'fxcm'], 
    			['val' => 'fxcmuk_bt'], 
    			['val' => 'mm_dd_ts']
    		],
	        'product' => [
    			['val' => 'fx'], 
    			['val' => 'spread_bet']
	        ]
		],

		"props" => [
			'environment' => [
    			['key' => 'qa', 'val' => 'securx-qa/tr/'], 
    			['key' => 'uat', 'val' => 'securez-uat/tr/'], 
    			['key' => 'prod', 'val' => 'secure4.fxcorporate.com/tr/']
	    	],
	    	'protocol' => [
    			['val' => 'https'], 
    			['val' => 'https']
	    	]
		]
    ];

	public function serve() {
	  
	    $uri = $_SERVER['REQUEST_URI'];
	    $method = $_SERVER['REQUEST_METHOD'];
	    $paths = explode('/', $this->paths($uri));

	    // not sure why we need this
	    // array_shift($paths); // Hack; get rid of initials empty string 

	    $paths = array_slice($paths, 4); // chop off the directories to get to the resources being requested
	    $resource = array_shift($paths);

	    if ($resource == 'clients' || $resource == 'params' || $resource == 'props') {
	        $item = array_shift($paths);
	        $name = array_shift($paths);

	        if (empty($item)) {
	            $this->handle_base($method, $resource);
	        } else {
	            $this->handle_item($method, $resource, $item);
	        }
	      
	    }  else {
	        // We only handle resources under 'clients'
	        header('HTTP/1.1 404 Not Found');
	    } 
	}
	    
	private function handle_base($method, $resource) {
	    switch($method) {
	    case 'GET':
	        $this->result($resource);
	        break;
	    default:
	        header('HTTP/1.1 405 Method Not Allowed');
	        header('Allow: GET');
	        break;
	    }
	}

	private function handle_item($method, $resource, $item) {
	    switch($method) {
	    case 'PUT':
	        $this->create_item($resource, $item);
	        break;

	    case 'DELETE':
	        $this->delete_item($resource, $item);
	        break;
	  
	    case 'GET':
	        $this->display_item($resource, $item);
	        break;

	    default:
	        header('HTTP/1.1 405 Method Not Allowed');
	        header('Allow: GET, PUT, DELETE');
	        break;
	    }
	}

	private function create_item($resource, $item){
	    if (isset($this->model[$resource][$item])) {
	        header('HTTP/1.1 409 Conflict');
	        return;
	    }
	    /* PUT requests need to be handled
	     * by reading from standard input.
	     */
	    $data = json_decode(file_get_contents('php://input'));
	    if (is_null($data)) {
	        header('HTTP/1.1 400 Bad Request');
	        $this->result($resource);
	        return;
	    }
	    $this->model[$resource][$item] = $data; 
	    $this->result($resource);
	}

	private function delete_item($resource, $item) {
	    if (isset($this->model[$resource][$item]) ) {
	        unset($this->model[$resource][$item]);
	        $this->result($resource);
	    } else {
	        header('HTTP/1.1 404 Not Found');
	    }
	}

	private function display_item($resource, $item) {
	    if (array_key_exists($item, $this->model[$resource])) {
	        echo json_encode($this->model[$resource][$item]);
	    } else {
	        header('HTTP/1.1 404 Not Found');
	    }
	}

	private function paths($url) {
	    $uri = parse_url($url);
	    return $uri['path'];
	}

	/**
	 * Displays a list of all contacts.
	 */
	private function result($resource) {
	    header('Content-type: application/json');
	    // echo json_encode($this->model[$resource] );

	    echo json_encode($this->params->get('rb')[2]);
	}

}

$server = new Server($db_params, $db_props);
$server->serve();

?>