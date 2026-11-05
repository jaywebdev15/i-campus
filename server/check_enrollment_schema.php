<?php
require "connection.php";

echo "Enrollments Table:\n";
$stmt = $pdo->query("DESCRIBE enrollments");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($columns);

echo "\nSections Table:\n";
$stmt = $pdo->query("DESCRIBE sections");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($columns);
?>