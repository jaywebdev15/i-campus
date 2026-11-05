<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require "../connection.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $student_number = $data['student_number'] ?? null;

    if (!$student_number) {
        echo json_encode(["status" => "failed", "message" => "No student number provided"]);
        exit;
    }

    try {
        // 1. Fetch Student Details
        $stmt = $pdo->prepare("SELECT student_number, first_name, middle_name, last_name, student_image FROM students WHERE student_number = :student_number");
        $stmt->execute([':student_number' => $student_number]);
        
        if ($stmt->rowCount() > 0) {
            $student = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // 2. Log Attendance (Optional - tailored for Gate Entry)
            // We use dummy values or minimal insert depending on schema constraints. 
            // Assuming we allow nulls or have default 'GATE' or we just record it.
            // For now, we mainly return the student data as requested for display.
            
            // Attempt to log if possible (ignoring foreign key constraints on teacher/subject if they exist and are strict, otherwise this might fail)
            // safe query: just return data for now.
            
            echo json_encode([
                "status" => "success",
                "student" => $student
            ]);
        } else {
            echo json_encode([
                "status" => "failed",
                "message" => "Student not found"
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            "status" => "failed",
            "message" => "Database error: " . $e->getMessage()
        ]);
    }
} else {
    echo json_encode(["status" => "failed", "message" => "Invalid request method"]);
}
