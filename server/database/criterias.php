<?php

require "../connection.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$method = $_SERVER["REQUEST_METHOD"];

$data = json_decode(file_get_contents("php://input"), true);

$action = $data['action'] ?? null;


if ($method !== "POST") {
  // =====> Get all the curriculum criteria <===== \\
  $sql = "SELECT 
            cm.curriculum_id,
            cm.education_level,
            cm.year_level,
            cm.semester,
            cm.subject_code,
            cm.subject_title,
            cm.subject_description,
            cm.category,
            CONCAT('[', GROUP_CONCAT(
                CONCAT(
                    '{',
                        '\"id\":', IFNULL(cr.id, 0), ',',
                        '\"criteria_name\":\"', IFNULL(REPLACE(cr.criteria_name, '\"', '\\\"'), ''), '\",',
                        '\"criteria_percentage\":', IFNULL(cr.criteria_percentage, 0),
                    '}'
                )
            ), ']') AS criterias 
          FROM curriculums AS cm 
          INNER JOIN criterias AS cr 
            ON cr.curriculum_id = cm.curriculum_id
          GROUP BY cm.curriculum_id, cm.education_level, cm.year_level, cm.semester, cm.subject_code, cm.subject_title, cm.subject_description, cm.category";
  $query = $pdo->prepare($sql);
  $query->execute();
  $results = $query->fetchAll(PDO::FETCH_ASSOC);
  foreach ($results as &$row) {
    $row['criterias'] = json_decode($row['criterias'], true) ?? [];
  }

  echo json_encode($results);
} else {
  // =====> Handle POST Requests <===== \\
  if ($action === "updateCriteriaPercentages") {
    $curriculum_id = $data['curriculum_id'] ?? null;
    $criterias = $data['criterias'] ?? [];

    if (empty($curriculum_id) || empty($criterias)) {
      echo json_encode(["status" => "failed", "message" => "Missing data."]);
      exit;
    }

    try {
      $pdo->beginTransaction();

      foreach ($criterias as $criteria) {
        // Determine if we update by ID or Name
        // If ID is present and non-zero
        if (!empty($criteria['id'])) {
          $sql = "UPDATE criterias SET criteria_percentage = :pct WHERE id = :id AND curriculum_id = :cid";
          $stmt = $pdo->prepare($sql);
          $stmt->execute([
            ':pct' => $criteria['criteria_percentage'],
            ':id' => $criteria['id'],
            ':cid' => $curriculum_id
          ]);
        } else {
          // If ID is missing, we try to update by name OR insert if it doesn't exist
          // First check if it exists for this curriculum
          $checkSql = "SELECT id FROM criterias WHERE curriculum_id = :cid AND criteria_name = :cname";
          $checkStmt = $pdo->prepare($checkSql);
          $checkStmt->execute([':cid' => $curriculum_id, ':cname' => $criteria['criteria_name']]);

          if ($checkStmt->rowCount() > 0) {
            // Update by Name
            $updateSql = "UPDATE criterias SET criteria_percentage = :pct WHERE curriculum_id = :cid AND criteria_name = :cname";
            $updateStmt = $pdo->prepare($updateSql);
            $updateStmt->execute([':pct' => $criteria['criteria_percentage'], ':cid' => $curriculum_id, ':cname' => $criteria['criteria_name']]);
          } else {
            // Insert New
            $insertSql = "INSERT INTO criterias (curriculum_id, criteria_name, criteria_percentage) VALUES (:cid, :cname, :pct)";
            $insertStmt = $pdo->prepare($insertSql);
            $insertStmt->execute([':cid' => $curriculum_id, ':cname' => $criteria['criteria_name'], ':pct' => $criteria['criteria_percentage']]);
          }
        }
      }

      $pdo->commit();
      echo json_encode(["status" => "success", "message" => "Criteria updated successfully"]);

    } catch (Exception $e) {
      $pdo->rollBack();
      echo json_encode(["status" => "failed", "message" => "Error updating criteria: " . $e->getMessage()]);
    }
  }
}
