<?php
require '../vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !is_array($data) || count($data) === 0) {
    $data = [
        ["Status", "Message"],
        ["Failed", "No Data."]
    ];
}

$format = $_GET['format'] ?? 'csv';


// =====> CSV Format <===== \\
if ($format === 'csv') {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="students.csv"');

    $output = fopen('php://output', 'w');

    // Write headers if associative array
    if (isset($data[0]) && is_array($data[0]) && array_keys($data[0]) !== range(0, count($data[0])-1)) {
        fputcsv($output, array_keys($data[0]));
    }

    foreach ($data as $row) {
        fputcsv($output, is_array($row) ? array_values($row) : [$row]);
    }

    fclose($output);
    exit;
}

// =====> XLSX Format <===== \\
if ($format === 'xlsx') {
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $startRow = 1;
    
    if (isset($data[0]) && is_array($data[0]) && array_keys($data[0]) !== range(0, count($data[0])-1)) {
        $sheet->fromArray(array_keys($data[0]), NULL, 'A1');
        $startRow = 2;
    }

    foreach ($data as $row) {
        $sheet->fromArray(is_array($row) ? array_values($row) : [$row], NULL, 'A' . $startRow);
        $startRow++;
    }

    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="students.xlsx"');

    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
}
