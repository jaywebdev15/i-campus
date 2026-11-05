<?php
require "connection.php";

try {
    echo "Testing Query...\n";
    $sql = "SELECT q.*, l.e_lesson_title 
            FROM e_quizzes AS q 
            LEFT JOIN e_lessons AS l ON q.lesson_id = l.e_lesson_id";
    echo "SQL: $sql\n";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Success! Found " . count($result) . " rows.\n";
    print_r($result);
} catch (PDOException $e) {
    echo "PDO Error: " . $e->getMessage() . "\n";
}
?>