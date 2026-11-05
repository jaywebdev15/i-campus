<?php

require "../connection.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$method = $_SERVER["REQUEST_METHOD"];

$data = json_decode(file_get_contents("php://input"), true);

$action = $data['action'] ?? null;

$search_subject = $data['searchSubject'] ?? null;

$subject_category = $data['subjectCategory'] ?? null;
$search_term = $data['searchTerm'] ?? null;
$subject_id = $data['subject_id'] ?? null;
$subject_code = $data['subject_code'] ?? null;
$subject_title = $data['subject_title'] ?? null;
$subject_description = $data['subject_description'] ?? null;
$units = $data['units'] ?? null;
$category = $data['category'] ?? null;
$course_id = $data['course_id'] ?? null;
$subject_status = $data['subject_status'] ?? null;

if ($method !== "POST") {
  // =====> Get all the subjects data <===== \\
  $sql_subjects = "SELECT * FROM subjects ORDER BY subject_code";
  $subjects = $pdo->query($sql_subjects);
  $subject_results = $subjects->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($subject_results);
} else {
  switch ($action) {
    // =====> Insert New Subject <===== \\
    case "insertSubject":
      $verify = $pdo->prepare("SELECT * FROM subjects WHERE subject_code = :subject_code AND subject_title = :subject_title");
      $verify->execute([
        ":subject_code" => $subject_code,
        ":subject_title" => $subject_title
      ]);
      if ($verify->rowCount() > 0) {
        echo json_encode([
          "status" => "failed",
          "message" => "Subject already exist."
        ]);
      } else {
        $sql_insert_subject = "INSERT INTO subjects (
                                subject_code, 
                                subject_title, 
                                subject_description, 
                                units, 
                                category, 
                                subject_status)
                              VALUES (
                                :subject_code, 
                                :subject_title, 
                                :subject_description, 
                                :units, 
                                :category, 
                                :subject_status)";
        $insert = $pdo->prepare($sql_insert_subject);
        $insert->execute([
          ":subject_code" => $subject_code,
          ":subject_title" => $subject_title,
          ":subject_description" => $subject_description,
          ":units" => $units,
          ":category" => $category,
          ":subject_status" => $subject_status
        ]);
        echo json_encode([
          "status" => "success",
          "message" => "New subject added successfully."
        ]);
      }
      break;

    // =====> Update Subject <===== \\
    case "updateSubject":
      // $verify = $pdo->prepare("SELECT * FROM subjects WHERE subject_code = :subject_code AND subject_title = :subject_title");
      // $verify->execute([
      //   ":subject_code"   => $subject_code, 
      //   ":subject_title"  => $subject_title
      // ]);
      // if($verify->rowCount() > 0) {
      //   echo json_encode([
      //     "status"  => "failed", 
      //     "message" => "Subject already exist."
      //   ]);
      // } else {
      $sql_update_subject = "UPDATE subjects SET 
                                subject_code        = :subject_code, 
                                subject_title       = :subject_title, 
                                subject_description = :subject_description, 
                                units               = :units, 
                                category            = :category, 
                                subject_status      = :subject_status
                                WHERE subject_id    = :subject_id";
      $update_subject = $pdo->prepare($sql_update_subject);
      $update_subject->execute([
        ":subject_id" => $subject_id,
        ":subject_code" => $subject_code,
        ":subject_title" => $subject_title,
        ":subject_description" => $subject_description,
        ":units" => $units,
        ":category" => $category,
        ":subject_status" => $subject_status
      ]);
      echo json_encode([
        "status" => "success",
        "message" => "Subject " . $subject_title . " updated."
      ]);
      // }
      break;

    // =====> Get and Search Subject <===== \\
    case "searchSubject":
      $page = $data['page'] ?? 1;
      $limit = isset($data['limit']) ? (int) $data['limit'] : 10;
      $offset = ($page - 1) * $limit;
      $subCategory = $data['subCategory'] ?? null;

      $conditions = [];
      $params = [];

      // Search Term Logic
      if (!empty($search_term)) {
        $search_conditions = [
          "subject_code LIKE :search_code",
          "subject_title LIKE :search_title",
          "subject_description LIKE :search_desc",
          "category LIKE :search_category",
          "subject_status LIKE :search_status"
        ];
        $conditions[] = "(" . implode(" OR ", $search_conditions) . ")";

        $term = "%$search_term%";
        $params[':search_code'] = $term;
        $params[':search_title'] = $term;
        $params[':search_desc'] = $term;
        $params[':search_category'] = $term;
        $params[':search_status'] = $term;
      }

      // Filter Logic
      if (!empty($category) && !empty($subCategory)) {
        if ($category === "Category") {
          $conditions[] = "category = :subCategory";
          $params[':subCategory'] = $subCategory;
        } elseif ($category === "Status") {
          $conditions[] = "subject_status = :subCategory";
          $params[':subCategory'] = $subCategory;
        } elseif ($category === "Units") {
          $conditions[] = "units = :subCategory";
          $params[':subCategory'] = $subCategory;
        }
      }

      $whereClause = "";
      if (count($conditions) > 0) {
        $whereClause = "WHERE " . implode(" AND ", $conditions);
      }

      // Count Total
      $sql_count = "SELECT COUNT(*) FROM subjects $whereClause";
      $stmt_count = $pdo->prepare($sql_count);
      $stmt_count->execute($params);
      $total_records = $stmt_count->fetchColumn();
      $last_page = ceil($total_records / $limit);

      $sortBy = $data['sortBy'] ?? 'subject_code';
      $sortOrder = $data['sortOrder'] ?? 'ASC';
      $validSortOrder = strtoupper($sortOrder) === 'DESC' ? 'DESC' : 'ASC';

      $sql_search_subject = "SELECT * FROM subjects 
                            $whereClause 
                            ORDER BY $sortBy $validSortOrder 
                            LIMIT $limit OFFSET $offset";
      $search_subject = $pdo->prepare($sql_search_subject);

      // Bind params
      foreach ($params as $key => $value) {
        $search_subject->bindValue($key, $value);
      }

      $search_subject->execute();
      $search_results = $search_subject->fetchAll(PDO::FETCH_ASSOC);

      echo json_encode([
        "records" => $search_results,
        "total" => $total_records,
        "current_page" => $page,
        "last_page" => $last_page
      ]);
      break;

    // =====> Get Subject Info by ID <===== \\
    case "getSubjectInfoByID":
      $sql_get_subject_info_by_id = "SELECT * FROM subjects WHERE subject_id = :subject_id";
      $get_subject_info_by_id = $pdo->prepare($sql_get_subject_info_by_id);
      $get_subject_info_by_id->execute([":subject_id" => $subject_id]);
      $get_subject_info_by_id_result = $get_subject_info_by_id->fetch(PDO::FETCH_ASSOC);
      echo json_encode($get_subject_info_by_id_result);
      break;

    // =====> Get Category Value <===== \\
    case "getCategory":
      $sql_get_category = "SHOW COLUMNS FROM subjects LIKE 'category'";
      $get_category = $pdo->query($sql_get_category);
      $get_category_results = $get_category->fetch(PDO::FETCH_ASSOC);
      $category = $get_category_results['Type'];
      preg_match("/^enum\('(.*)'\)$/", $category, $matches);
      $enum_values = explode("','", $matches[1]);
      echo json_encode($enum_values);
      break;

    // =====> Get Subject by Category <===== \\
    case "getSubjectByCategory":
      $sql_get_subject = "SELECT * FROM subjects WHERE category = :category";
      $get_subject = $pdo->prepare($sql_get_subject);
      $get_subject->execute([":category" => $subject_category]);
      $get_subject_results = $get_subject->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($get_subject_results);
      break;

    // =====> Get Status Value <===== \\
    case "getStatus":
      $sql_get_status = "SHOW COLUMNS FROM subjects LIKE 'subject_status'";
      $get_status = $pdo->query($sql_get_status);
      $get_status_results = $get_status->fetch(PDO::FETCH_ASSOC);
      $status = $get_status_results['Type'];
      preg_match("/^enum\('(.*)'\)$/", $status, $matches);
      $enum_values = explode("','", $matches[1]);
      echo json_encode($enum_values);
      break;

    // =====> Get Subject Code of Teacher <===== \\
    case "searchSubjectToTeach":
      $sql_subject_to_teach = "SELECT subject_code FROM subjects WHERE subject_code LIKE :subject_code";
      $subject_to_teach = $pdo->prepare($sql_subject_to_teach);
      $subject_to_teach->execute([":subject_code" => "%$search_subject%"]);
      $subject_to_teach_results = $subject_to_teach->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($subject_to_teach_results);
    // =====> Get Distinct Units <===== \\
    case "getUnits":
      $sql_get_units = "SELECT DISTINCT units FROM subjects ORDER BY units ASC";
      $get_units = $pdo->query($sql_get_units);
      $get_units_results = $get_units->fetchAll(PDO::FETCH_COLUMN);
      echo json_encode($get_units_results);
      break;


  }
}