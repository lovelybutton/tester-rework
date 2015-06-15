<?php

	// http://henryranch.net/software/sqlite-for-beginners/
echo 'db';
	// try {
	// 	//create the database.
	// 	//this will generate the database file in the directory in which this script exists.
	// 	//If this file already exists, the database will be opened on this file.
	// 	// $database = new SQLiteDatabase('dogsDb.sqlite', 0666, $error);
	// } catch(Exception $e){
	// 	// die($error);
	// }

	// var_dump($database);
// 
	//Add a new table to the database called Dogs
	// $query = 'CREATE TABLE Dogs (Id INTEGER, Breed TEXT, Name TEXT, Age INTEGER)';
	// if(!$database->queryExec($query, $error)) {
	// 	die($error);
	// }

	//   //Insert several Dog records  into the Dog table
	// $query = "INSERT INTO Dogs (Id, Breed, Name, Age) VALUES (1, 'Labrador', 'Tank', 2); " .
	// "INSERT INTO Dogs (Id, Breed, Name, Age) VALUES (2, 'Husky', 'Glacier', 7); " .
	// "INSERT INTO Dogs (Id, Breed, Name, Age) VALUES (3, 'Golden-Doodle', 'Ellie', 4)";

	// if(!$database->queryExec($query, $error)) {
	// 	die($error);
	// }

	//   //Read all of the data from the Dogs table and print it in an HTML table
	// $query = "SELECT * FROM Dogs";

	// if($result = $database->query($query, SQLITE_BOTH, $error)) {
	// 	print "<table border=1>";
	// 	print "<tr><td>Id</td><td>Breed</td><td>Name</td><td>Age</td></tr>";
	// 	while($row = $result->fetch()) {
	// 		print "<tr><td>{$row['Id']}</td><td>{$row['Breed']}</td><td>{$row['Name']}</td><td>{$row['Age']}</td></tr>";
	// 	}
	// 	print "</table>";
	// } else {
	// 	die($error);
	// }

?>