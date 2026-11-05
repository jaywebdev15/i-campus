<?php

$localhost = "127.0.0.1";
$username = "root";
$password = "";
$database = "atech";
$charset = "utf8mb4";

$dsn = "mysql:host=$localhost;
              dbname=$database;
              charset=$charset";

$options = [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES => false,
];

try {
  $pdo = new PDO($dsn, $username, $password, $options);
} catch (\Throwable $error) {
  echo "Connection failed." . $error->getMessage();
}

?>