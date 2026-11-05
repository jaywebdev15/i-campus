<?php
require "connection.php";
$stmt = $pdo->query("SHOW COLUMNS FROM admins");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($columns);
?>