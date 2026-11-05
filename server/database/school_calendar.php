<?php

require "../connection.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Create table if not exists
$sql_create_table = "CREATE TABLE IF NOT EXISTS school_calendar (
    calendar_id INT AUTO_INCREMENT PRIMARY KEY,
    event_title VARCHAR(255) NOT NULL,
    event_description TEXT,
    event_date DATE NOT NULL,
    event_type VARCHAR(50) DEFAULT 'Activity',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)";
$pdo->exec($sql_create_table);

$method = $_SERVER["REQUEST_METHOD"];
$data = json_decode(file_get_contents("php://input"), true);
$action = $data['action'] ?? null;

if ($method == "GET") {
  // Default action: Get all events
  try {
    $stmt = $pdo->query("SELECT * FROM school_calendar ORDER BY event_date ASC");
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($events);
  } catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
  }
} else {
  switch ($action) {
    case "addEvent":
      try {
        $sql = "INSERT INTO school_calendar (event_title, event_description, event_date, event_type) VALUES (:title, :description, :date, :type)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
          ':title' => $data['event_title'],
          ':description' => $data['event_description'] ?? '',
          ':date' => $data['event_date'],
          ':type' => $data['event_type'] ?? 'Activity'
        ]);
        echo json_encode(["status" => "success", "message" => "Event added successfully"]);
      } catch (PDOException $e) {
        echo json_encode(["status" => "failed", "message" => $e->getMessage()]);
      }
      break;

    case "updateEvent":
      try {
        $sql = "UPDATE school_calendar SET event_title = :title, event_description = :description, event_date = :date, event_type = :type WHERE calendar_id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
          ':title' => $data['event_title'],
          ':description' => $data['event_description'] ?? '',
          ':date' => $data['event_date'],
          ':type' => $data['event_type'],
          ':id' => $data['calendar_id']
        ]);
        echo json_encode(["status" => "success", "message" => "Event updated successfully"]);
      } catch (PDOException $e) {
        echo json_encode(["status" => "failed", "message" => $e->getMessage()]);
      }
      break;

    case "deleteEvent":
      try {
        $sql = "DELETE FROM school_calendar WHERE calendar_id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $data['calendar_id']]);
        echo json_encode(["status" => "success", "message" => "Event deleted successfully"]);
      } catch (PDOException $e) {
        echo json_encode(["status" => "failed", "message" => $e->getMessage()]);
      }
      break;

    case "importHolidays":
      try {
        $holidays = [
          ["New Year's Day", "Regular Holiday", "2026-01-01"],
          ["EDSA Revolution Anniversary", "Special Non-Working Holiday", "2026-02-25"],
          ["Maundy Thursday", "Regular Holiday", "2026-04-02"],
          ["Good Friday", "Regular Holiday", "2026-04-03"],
          ["Black Saturday", "Special Non-Working Holiday", "2026-04-04"],
          ["Araw ng Kagitingan", "Regular Holiday", "2026-04-09"],
          ["Labor Day", "Regular Holiday", "2026-05-01"],
          ["Independence Day", "Regular Holiday", "2026-06-12"],
          ["Ninoy Aquino Day", "Special Non-Working Holiday", "2026-08-21"],
          ["National Heroes Day", "Regular Holiday", "2026-08-31"],
          ["All Saints' Day", "Special Non-Working Holiday", "2026-11-01"],
          ["All Souls' Day", "Special Non-Working Holiday", "2026-11-02"],
          ["Bonifacio Day", "Regular Holiday", "2026-11-30"],
          ["Feast of the Immaculate Conception", "Special Non-Working Holiday", "2026-12-08"],
          ["Christmas Day", "Regular Holiday", "2026-12-25"],
          ["Rizal Day", "Regular Holiday", "2026-12-30"],
          ["Last Day of the Year", "Special Non-Working Holiday", "2026-12-31"],
        ];

        $inserted = 0;
        $skipped = 0;
        $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM school_calendar WHERE event_title = :title AND event_date = :date");
        $insertStmt = $pdo->prepare("INSERT INTO school_calendar (event_title, event_description, event_date, event_type) VALUES (:title, :description, :date, 'Holiday')");

        foreach ($holidays as $h) {
          $checkStmt->execute([':title' => $h[0], ':date' => $h[2]]);
          if ($checkStmt->fetchColumn() == 0) {
            $insertStmt->execute([':title' => $h[0], ':description' => $h[1], ':date' => $h[2]]);
            $inserted++;
          } else {
            $skipped++;
          }
        }

        $msg = "Imported $inserted holiday(s).";
        if ($skipped > 0)
          $msg .= " $skipped already existed.";
        echo json_encode(["status" => "success", "message" => $msg]);
      } catch (PDOException $e) {
        echo json_encode(["status" => "failed", "message" => $e->getMessage()]);
      }
      break;

    default:
      echo json_encode(["status" => "failed", "message" => "Invalid action"]);
      break;
  }
}
?>