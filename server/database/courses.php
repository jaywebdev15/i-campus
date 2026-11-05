<?php

require "../connection.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$method = $_SERVER["REQUEST_METHOD"];

$data = json_decode(file_get_contents("php://input"), true);

$action = $data['action'] ?? null;

$search_term = $data['searchTerm'] ?? null;

$search = $data['search'] ?? null;

$course_id = $data['course_id'] ?? null;
$course_code = $data['course_code'] ?? null;
$course_title = $data['course_title'] ?? null;
$course_description = $data['course_description'] ?? null;
$category = $data['category'] ?? null;
$course_status = $data['course_status'] ?? null;

if ($method !== "POST") {
  // =====> Get all the courses data <===== \\
  $sql_courses = "SELECT c.course_id, c.course_code, c.course_title, c.course_description, c.category, c.course_status, 
                  COALESCE(SUM(cm.units), 0) AS total_units 
                  FROM courses AS c 
                  LEFT JOIN curriculums AS cm 
                    ON c.course_code = cm.course_code
                  GROUP BY c.course_id, c.course_code, c.course_title, c.course_description, c.category, c.course_status 
                  ORDER BY total_units DESC";
  $courses = $pdo->query($sql_courses);
  $course_results = $courses->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($course_results);
} else {
  switch ($action) {
    // =====> Insert New Course <===== \\
    case "insertCourse":
      $verify = $pdo->prepare("SELECT * FROM courses WHERE course_code = :course_code AND course_title = :course_title");
      $verify->execute([
        ":course_code" => $course_code,
        ":course_title" => $course_title
      ]);
      if ($verify->rowCount() > 0) {
        echo json_encode([
          "status" => "failed",
          "message" => "Course already exist."
        ]);
      } else {
        $sql_insert_course = "INSERT INTO courses (
                                course_code, 
                                course_title, 
                                course_description, 
                                category, 
                                course_status)
                              VALUES (
                                :course_code, 
                                :course_title, 
                                :course_description, 
                                :category, 
                                :course_status)";
        $insert = $pdo->prepare($sql_insert_course);
        $insert->execute([
          ":course_code" => $course_code,
          ":course_title" => $course_title,
          ":course_description" => $course_description,
          ":category" => $category,
          ":course_status" => $course_status
        ]);
        echo json_encode([
          "status" => "success",
          "message" => "New course added successfully."
        ]);
      }
      break;

    // =====> Update Course <===== \\
    case "updateCourse":
      $sql_update_course = "UPDATE courses SET 
                            course_code         = :course_code, 
                            course_title        = :course_title, 
                            course_description  = :course_description, 
                            category            = :category, 
                            course_status       = :course_status
                            WHERE course_id     = :course_id";
      $update_course = $pdo->prepare($sql_update_course);
      $update_course->execute([
        ":course_id" => $course_id,
        ":course_code" => $course_code,
        ":course_title" => $course_title,
        ":course_description" => $course_description,
        ":category" => $category,
        ":course_status" => $course_status
      ]);
      echo json_encode([
        "status" => "success",
        "message" => "Course " . $course_title . " updated."
      ]);
      break;

    // =====> Delete Course <===== \\
    case "deleteCourse":
      $sql_delete_course = "DELETE FROM courses WHERE course_id = :course_id";
      $delete_course = $pdo->prepare($sql_delete_course);
      $delete_course->execute([":course_id" => $course_id]);
      echo json_encode([
        "status" => "success",
        "message" => "Course deleted successfully."
      ]);
      break;

    // =====> Get and Search Course <===== \\
    case "searchCourse":
      $page = $data['page'] ?? 1;
      $limit = isset($data['limit']) ? (int) $data['limit'] : 10;
      $offset = ($page - 1) * $limit;
      $subCategory = $data['subCategory'] ?? null;

      $conditions = [];
      $params = [];

      // Search Term Logic
      if (!empty($search_term)) {
        $search_conditions = [
          "c.course_code LIKE :search_code",
          "c.course_title LIKE :search_title",
          "c.course_description LIKE :search_desc",
          "c.category LIKE :search_category",
          "c.course_status LIKE :search_status"
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
          $conditions[] = "c.category = :subCategory";
          $params[':subCategory'] = $subCategory;
        } elseif ($category === "Status") {
          $conditions[] = "c.course_status = :subCategory";
          $params[':subCategory'] = $subCategory;
        }
      }

      $whereClause = "";
      if (count($conditions) > 0) {
        $whereClause = "WHERE " . implode(" AND ", $conditions);
      }

      // Count Total (Need to count distinct courses because of GROUP BY in main query? 
      // Main query groups by course_code. 
      // But wait, the main query joins curriculums to sum units.
      // Filtering applies to courses table mainly. 

      // Count query:
      // Note: we can't easily count with GROUP BY without a subquery or calculating in PHP.
      // However, usually 1 course = 1 row in result.
      $sql_count = "SELECT COUNT(DISTINCT c.course_code) FROM courses AS c $whereClause";
      $stmt_count = $pdo->prepare($sql_count);
      $stmt_count->execute($params);
      $total_records = $stmt_count->fetchColumn();
      $last_page = ceil($total_records / $limit);

      $sortBy = $data['sortBy'] ?? 'total_units';
      $sortOrder = $data['sortOrder'] ?? 'DESC';
      $validSortOrder = strtoupper($sortOrder) === 'ASC' ? 'ASC' : 'DESC';

      // Map sort columns if necessary
      if ($sortBy === 'course_code' || $sortBy === 'course_title' || $sortBy === 'category' || $sortBy === 'course_status') {
        $sortBy = "c." . $sortBy;
      }

      // If sorting by total_units, no alias needed as it is an alias in the select (but might need to be careful with MySQL versions/group by)
      // MySQL standard allows sorting by alias in GROUP BY queries.

      $sql_search_course = "SELECT c.course_id, c.course_code, c.course_title, c.course_description, c.category, c.course_status, 
                            COALESCE(SUM(cm.units), 0) AS total_units 
                            FROM courses AS c 
                            LEFT JOIN curriculums AS cm 
                              ON c.course_code = cm.course_code 
                            $whereClause 
                            GROUP BY c.course_id, c.course_code, c.course_title, c.course_description, c.category, c.course_status 
                            ORDER BY $sortBy $validSortOrder
                            LIMIT $limit OFFSET $offset";
      $search_course = $pdo->prepare($sql_search_course);

      // Bind params
      foreach ($params as $key => $value) {
        $search_course->bindValue($key, $value);
      }

      $search_course->execute();
      $search_results = $search_course->fetchAll(PDO::FETCH_ASSOC);

      echo json_encode([
        "records" => $search_results,
        "total" => $total_records,
        "current_page" => $page,
        "last_page" => $last_page
      ]);
      break;

    // =====> Get Course <===== \\
    case "getCourses":
      $sql_get_courses = "SELECT * FROM courses";
      $get_courses = $pdo->query($sql_get_courses);
      $get_courses_result = $get_courses->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($get_courses_result);
      break;

    // =====> Get Info by Course ID <===== \\
    case "fetchCourseInfoById":
      try {
        $sql_get_info_by_id = "SELECT * FROM courses WHERE course_id = :course_id";
        $get_info_by_id = $pdo->prepare($sql_get_info_by_id);
        $get_info_by_id->execute([":course_id" => $course_id]);
        $get_info_by_id_result = $get_info_by_id->fetch(PDO::FETCH_ASSOC);
        echo json_encode($get_info_by_id_result);
      } catch (PDOException $e) {
        echo json_encode(["error" => $e->getMessage()]);
      }
      break;

    // =====> Get Category Value <===== \\
    case "getCategory":
      $sql_get_category = "SHOW COLUMNS FROM courses LIKE 'category'";
      $get_category = $pdo->query($sql_get_category);
      $get_category_results = $get_category->fetch(PDO::FETCH_ASSOC);
      $category = $get_category_results['Type'];
      preg_match("/^enum\('(.*)'\)$/", $category, $matches);
      $enum_values = explode("','", $matches[1]);
      echo json_encode($enum_values);
      break;

    // =====> Get Status Value <===== \\
    case "getStatus":
      $sql_get_status = "SHOW COLUMNS FROM courses LIKE 'course_status'";
      $get_status = $pdo->query($sql_get_status);
      $get_status_results = $get_status->fetch(PDO::FETCH_ASSOC);
      $status = $get_status_results['Type'];
      preg_match("/^enum\('(.*)'\)$/", $status, $matches);
      $enum_values = explode("','", $matches[1]);
      echo json_encode($enum_values);
      break;

    // =====> Get Course Based on Education Level <=====\\
    case "getCourseCode":
      $sql_get_course = "SELECT * FROM courses WHERE category = :category";
      $get_course = $pdo->prepare($sql_get_course);
      $get_course->execute([":category" => $category]);
      $course = $get_course->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($course);
      break;

    // =====> Subject Lists <===== \\
    case "getCourseLists":
      $sql_course_lists = "SELECT course_code FROM courses WHERE course_code LIKE :course_code";
      $course_lists = $pdo->prepare($sql_course_lists);
      $course_lists->execute([":course_code" => "%$search%"]);
      $course_lists_results = $course_lists->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($course_lists_results);
      break;


  }
}