<?php
require './server/connection.php';
try {
    $stmt = $pdo->query('SHOW COLUMNS FROM curriculums');
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    file_put_contents('columns.txt', print_r($columns, true));
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
