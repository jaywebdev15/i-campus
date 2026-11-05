<?php


ini_set('display_errors', 1);
error_reporting(E_ALL);

require '../vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;

// Database connection should provide a PDO instance named $pdo
require "../connection.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Verification: Ensure $pdo is actually a valid PDO object
if (!isset($pdo) || !$pdo instanceof PDO) {
    echo json_encode([
        "status" => "error",
        "message" => "Database connection variable (\$pdo) is null or not a valid PDO instance. Please check connection.php."
    ]);
    exit;
}

if (!isset($_FILES['file'])) {
    echo json_encode(["status" => "error", "message" => "No file uploaded"]);
    exit;
}

$file = $_FILES['file']['tmp_name'];

try {
    $spreadsheet = IOFactory::load($file);
    $sheet = $spreadsheet->getActiveSheet();
    $rows = $sheet->toArray();

    if (count($rows) < 2) {
        throw new Exception("The uploaded file is empty or contains no data rows.");
    }

    // Normalize headers: lowercase and replace spaces with underscores
    $headers = array_map(function ($h) {
        return str_replace(' ', '_', strtolower(trim($h)));
    }, $rows[0]);

    $table = $_POST['table'] ?? 'students';

    $pdo->beginTransaction();

    if ($table === 'students') {
        // Validate required column
        if (!in_array('student_number', $headers)) {
            throw new Exception("Missing required column: 'student_number'");
        }

        // Prepare the statement once outside the loop for performance
        // Using ON DUPLICATE KEY UPDATE (requires student_number to be UNIQUE in DB)
        $sql = "INSERT INTO students (
                    student_number, first_name, middle_name, last_name, gender,
                    date_of_birth, contact_number, email_address,
                    guardian_name, guardian_number, house_number, street_purok,
                    barangay, town, province, student_status
                ) VALUES (
                    :student_number, :first_name, :middle_name, :last_name, :gender,
                    :date_of_birth, :contact_number, :email_address,
                    :guardian_name, :guardian_number, :house_number, :street_purok,
                    :barangay, :town, :province, :student_status
                )
                ON DUPLICATE KEY UPDATE
                    first_name = VALUES(first_name),
                    middle_name = VALUES(middle_name),
                    last_name = VALUES(last_name),
                    gender = VALUES(gender),
                    date_of_birth = VALUES(date_of_birth),
                    contact_number = VALUES(contact_number),
                    email_address = VALUES(email_address),
                    guardian_name = VALUES(guardian_name),
                    guardian_number = VALUES(guardian_number),
                    house_number = VALUES(house_number),
                    street_purok = VALUES(street_purok),
                    barangay = VALUES(barangay),
                    town = VALUES(town),
                    province = VALUES(province),
                    student_status = VALUES(student_status)";

        $stmt = $pdo->prepare($sql);

        $successCount = 0;

        for ($i = 1; $i < count($rows); $i++) {
            $row = $rows[$i];

            // Skip empty rows
            if (empty(array_filter($row)))
                continue;

            // Ensure row length matches header length
            if (count($headers) !== count($row)) {
                // Fill missing columns with null if row is shorter than header
                $row = array_pad($row, count($headers), null);
            }

            $data = array_combine($headers, $row);

            if (empty(trim($data['student_number'])))
                continue;

            // Process Date of Birth
            $dob = null;
            if (!empty($data['date_of_birth'])) {
                try {
                    if (is_numeric($data['date_of_birth'])) {
                        $dob = Date::excelToDateTimeObject($data['date_of_birth'])->format('Y-m-d');
                    } else {
                        $dob = date('Y-m-d', strtotime($data['date_of_birth']));
                    }
                } catch (Exception $e) {
                    $dob = null; // Or handle as validation error
                }
            }

            $stmt->execute([
                ":student_number" => $data['student_number'],
                ":first_name" => $data['first_name'] ?? null,
                ":middle_name" => $data['middle_name'] ?? null,
                ":last_name" => $data['last_name'] ?? null,
                ":gender" => $data['gender'] ?? null,
                ":date_of_birth" => $dob,
                ":contact_number" => $data['contact_number'] ?? null,
                ":email_address" => $data['email_address'] ?? null,
                ":guardian_name" => $data['guardian_name'] ?? null,
                ":guardian_number" => $data['guardian_number'] ?? null,
                ":house_number" => $data['house_number'] ?? null,
                ":street_purok" => $data['street_purok'] ?? null,
                ":barangay" => $data['barangay'] ?? null,
                ":town" => $data['town'] ?? null,
                ":province" => $data['province'] ?? null,
                ":student_status" => $data['student_status'] ?? null
            ]);

            $successCount++;
        }
    } else {
        echo json_encode(["status" => "info", "message" => "Import for $table module is coming soon."]);
        exit;
    }

    $pdo->commit();
    echo json_encode([
        "status" => "success",
        "message" => "Import completed.",
        "count" => $successCount
    ]);
    exit;

} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    // Clean any previous output (like PHP warnings) to ensure valid JSON
    if (ob_get_length())
        ob_clean();

    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage(),
        "file" => $e->getFile(),
        "line" => $e->getLine()
    ]);
    exit;
}