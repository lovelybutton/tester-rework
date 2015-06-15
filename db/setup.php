<?php
// require 'vendor/autoload.php';
 
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
$db_dir = getcwd() . '/data';
$options = array('dir' => $db_dir);
 
// $users = Flintstone::load('users', $options);
// $settings = Flintstone::load('settings', $options);

// Load the databases
// URL Builder DBS
$params = Flintstone::load('params', $options);
$props = Flintstone::load('props', $options);

?>