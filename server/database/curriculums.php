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

$user_code = $data['userCode'] ?? null;

$search_subject = $data['searchSubject'] ?? null;

$curriculum_id = $data['curriculum_id'] ?? null;
$education_level = $data['education_level'] ?? null;
$course_code = $data['course_code'] ?? null;
$subject_code = $data['subject_code'] ?? null;
$subject_title = $data['subject_title'] ?? null;
$subject_description = $data['subject_description'] ?? null;
$units = $data['units'] ?? null;
$category = $data['category'] ?? null;
$price = $data['price'] ?? null;
$year_level = $data['year_level'] ?? null;
$semester = $data['semester'] ?? null;
$status = $data['status'] ?? "Available";

if ($method !== "POST") {
  $sql_curriculums = "SELECT * FROM curriculums";
  $curriculums = $pdo->query($sql_curriculums);
  $curriculum_results = $curriculums->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($curriculum_results);
} else {
  switch ($action) {

    // =====> Insert New Curriculum <===== \\
    case "insertCurriculum":
      $verify_curriculum = $pdo->prepare("SELECT * FROM curriculums WHERE 
                                          subject_code      = :subject_code     ");
      $verify_curriculum->execute([
        ":subject_code" => $subject_code
      ]);
      if ($verify_curriculum->rowCount() > 0) {
        echo json_encode([
          "status" => "failed",
          "message" => "Curriculum already exist"
        ]);
      } else {
        try {
          $sql_insert_curriculum = "INSERT INTO curriculums   (course_code, 
                                                                education_level, 
                                                                year_level, 
                                                                semester, 
                                                                subject_code, 
                                                                subject_title, 
                                                                subject_description, 
                                                                units, 
                                                                category, 
                                                                price, 
                                                                curriculum_status)
                                                      VALUES  (:course_code, 
                                                                :education_level, 
                                                                :year_level, 
                                                                :semester, 
                                                                :subject_code, 
                                                                :subject_title, 
                                                                :subject_description, 
                                                                :units, 
                                                                :category, 
                                                                :price, 
                                                                :curriculum_status)";
          $insert_curriculum = $pdo->prepare($sql_insert_curriculum);
          $insert_curriculum->execute([
            ":course_code" => $course_code,
            ":education_level" => $education_level,
            ":year_level" => $year_level,
            ":semester" => $semester,
            ":subject_code" => $subject_code,
            ":subject_title" => $subject_title,
            ":subject_description" => $subject_description,
            ":units" => $units,
            ":category" => $category,
            ":price" => $price,
            ":curriculum_status" => $status
          ]);
          echo json_encode([
            "status" => "success",
            "message" => "New curriculum inserted."
          ]);
        } catch (\Throwable $error) {
          echo json_encode([
            "status" => "failed",
            "message" => "Error in curriculum backend(insert)" . $error->getMessage()
          ]);
        }
      }
      break;

    // =====> Update Curriculum <===== \\
    case "updateCurriculum":
      $verify_curriculum = $pdo->prepare("SELECT * FROM curriculums 
                                          WHERE subject_code = :subject_code 
                                          AND curriculum_id != :curriculum_id");
      $verify_curriculum->execute([
        ":subject_code" => $subject_code,
        ":curriculum_id" => $curriculum_id
      ]);
      if ($verify_curriculum->rowCount() > 0) {
        echo json_encode([
          "status" => "failed",
          "message" => "Curriculum already exist."
        ]);
      } else {
        try {
          $sql_update_curriculum = "UPDATE curriculums SET 
                                    course_code         = :course_code, 
                                    education_level     = :education_level, 
                                    year_level          = :year_level, 
                                    semester            = :semester, 
                                    subject_code        = :subject_code, 
                                    subject_title       = :subject_title, 
                                    subject_description = :subject_description, 
                                    units               = :units, 
                                    category            = :category, 
                                    price               = :price, 
                                    curriculum_status   = :curriculum_status 
                                    WHERE curriculum_id = :curriculum_id";
          $update_curriculum = $pdo->prepare($sql_update_curriculum);
          $update_curriculum->execute([
            ":curriculum_id" => $curriculum_id,
            ":course_code" => $course_code,
            ":education_level" => $education_level,
            ":year_level" => $year_level,
            ":semester" => $semester,
            ":subject_code" => $subject_code,
            ":subject_title" => $subject_title,
            ":subject_description" => $subject_description,
            ":units" => $units,
            ":category" => $category,
            ":price" => $price,
            ":curriculum_status" => $status
          ]);
          echo json_encode([
            "status" => "success",
            "message" => "Updated successfully"
          ]);
        } catch (\Throwable $error) {
          echo json_encode([
            "status" => "failed",
            "message" => "Error in curriculum backend(update)" . $error->getMessage()
          ]);
        }
      }
      break;

    // =====> Search Curriculums <===== \\
    case "searchCurriculum":
      $page = $data['page'] ?? 1;
      $limit = $data['limit'] ?? 10; // Allow dynamic limit
      $offset = ($page - 1) * $limit;

      $sortBy = $data['sortBy'] ?? 'curriculum_id';
      $sortOrder = $data['sortOrder'] ?? 'DESC';

      // Validate sort order to prevent SQL injection
      $validSortOrder = strtoupper($sortOrder) === 'ASC' ? 'ASC' : 'DESC';

      // Map frontend column names to database columns if necessary, or just use direct mapping
      // For now, assuming direct mapping is safe enough for internal admin tool, but basic validation is good
      $allowedColumns = ['curriculum_id', 'education_level', 'year_level', 'semester', 'course_code', 'subject_code', 'subject_title', 'units', 'category', 'price', 'curriculum_status'];
      if (!in_array($sortBy, $allowedColumns)) {
        $sortBy = 'curriculum_id';
      }

      $conditions = [];
      $params = [];

      // Search Term Logic
      if (!empty($search_term)) {
        $search_conditions = [
          "course_code LIKE :search_course",
          "year_level LIKE :search_year",
          "semester LIKE :search_semester",
          "education_level LIKE :search_education",
          "subject_code LIKE :search_subject",
          "subject_title LIKE :search_title",
          "subject_description LIKE :search_desc",
          "units LIKE :search_units",
          "category LIKE :search_category",
          "price LIKE :search_price",
          "curriculum_status LIKE :search_status"
        ];
        $conditions[] = "(" . implode(" OR ", $search_conditions) . ")";

        $term = "%$search_term%";
        $params[':search_course'] = $term;
        $params[':search_year'] = $term;
        $params[':search_semester'] = $term;
        $params[':search_education'] = $term;
        $params[':search_subject'] = $term;
        $params[':search_title'] = $term;
        $params[':search_desc'] = $term;
        $params[':search_units'] = $term;
        $params[':search_category'] = $term;
        $params[':search_price'] = $term;
        $params[':search_status'] = $term;
      }

      // Filter Logic
      if (!empty($category) && !empty($subCategory)) {
        if ($category === "Education_Level") { // Use underscore to match Frontend key if strictly mapped, or handle variations
          $conditions[] = "education_level = :subCategory";
          $params[':subCategory'] = $subCategory;
        } elseif ($category === "Year_Level") {
          $conditions[] = "year_level = :subCategory";
          $params[':subCategory'] = $subCategory;
        } elseif ($category === "Status") {
          $conditions[] = "curriculum_status = :subCategory";
          $params[':subCategory'] = $subCategory;
        }
      } elseif (!empty($category) && empty($subCategory)) {
        // If only category is selected but no subCategory, what to do? 
        // Usually filters apply when sub-option is selected. 
        // If category is generic, maybe do nothing or handle specific logic.
        // Based on UI, subCategory is populated when category interacts.
      }

      $whereClause = "";
      if (count($conditions) > 0) {
        $whereClause = "WHERE " . implode(" AND ", $conditions);
      }

      // Count Total
      $sql_count = "SELECT COUNT(*) FROM curriculums $whereClause";
      $stmt_count = $pdo->prepare($sql_count);
      $stmt_count->execute($params);
      $total_records = $stmt_count->fetchColumn();
      $last_page = ceil($total_records / $limit);

      // Fetch Data
      $sql_search = "SELECT * FROM curriculums $whereClause ORDER BY $sortBy $validSortOrder LIMIT $limit OFFSET $offset";
      $stmt = $pdo->prepare($sql_search);

      // Bind params for main query
      foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
      }

      $stmt->execute();
      $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

      echo json_encode([
        "records" => $results,
        "total" => $total_records,
        "current_page" => $page,
        "last_page" => $last_page
      ]);
      break;

    // =====> Get Curriculum Info by ID <===== \\
    case "getCurriculumInfoById":
      $sql_get_curriculum_info_by_id = "SELECT * FROM curriculums WHERE curriculum_id = :curriculum_id";
      $get_curriculum_info_by_id = $pdo->prepare($sql_get_curriculum_info_by_id);
      $get_curriculum_info_by_id->execute([":curriculum_id" => $curriculum_id]);
      $get_curriculum_info_by_id_result = $get_curriculum_info_by_id->fetch(PDO::FETCH_ASSOC);
      echo json_encode($get_curriculum_info_by_id_result);
      break;

    // =====> Get Course Curriculum <===== \\
    case "getCourseCurriculum":
      $sql_course_curriculum = "SELECT * FROM curriculums 
                                WHERE FIND_IN_SET(:course_code, REPLACE(course_code, ' ', '')) > 0
                                  AND semester IS NOT NULL AND semester <> '' 
                                ORDER BY year_level ASC";
      $course_curriculum = $pdo->prepare($sql_course_curriculum);
      $course_curriculum->execute([":course_code" => $course_code]);
      $course_curriculum_results = $course_curriculum->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($course_curriculum_results);
      break;

    // =====> Get Curriculum Subject <===== \\
    case "getCurriculumSubject":
      $sql_curriculum_subject = "SELECT * FROM curriculums WHERE 
                                  education_level = :education_level  AND 
                                  course_code     = :course_code      AND 
                                  year_level      = :year_level       AND 
                                  semester        = :semester          ";
      $curriculum_subject = $pdo->prepare($sql_curriculum_subject);
      $curriculum_subject->execute([
        ":education_level" => $education_level,
        ":course_code" => $course_code,
        ":year_level" => $year_level,
        ":semester" => $semester
      ]);
      $curriculum_subject_results = $curriculum_subject->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($curriculum_subject_results);
      break;

    // =====> Get Subject <===== \\
    case "getSubject":
      $sql_get_subject = "SELECT curriculum_id, subject_code, subject_title 
                            FROM curriculums WHERE 
                            education_level = :education_level  AND 
                            year_level      = :year_level       AND 
                            semester        = :semester         ";
      $get_subject = $pdo->prepare($sql_get_subject);
      $get_subject->execute([
        ":education_level" => $education_level,
        ":year_level" => $year_level,
        ":semester" => $semester
      ]);
      $get_subject_results = $get_subject->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($get_subject_results);
      break;

    // =====> Get Course Code and School Year <===== \\
    case "getCourseCodeAndSchoolYear":
      $sql_get_ccsy = "SELECT * FROM curriculums 
                        WHERE 
                        education_level   = :education_level  AND 
                        year_level        = :year_level       AND 
                        semester          = :semester         ";
      $get_ccsy = $pdo->prepare($sql_get_ccsy);
      $get_ccsy->execute([
        ":education_level" => $education_level,
        ":year_level" => $year_level,
        ":semester" => $semester
      ]);
      $get_ccsy_results = $get_ccsy->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($get_ccsy_results);
      break;

    // =====> Get Subject of Student <===== \\
    case "getCurriculumOfStudent":
      $sql_get_subject = "SELECT cm.*, 
                                  s.user_code, 
                                  e.year_level, 
                                  e.semester, 
                                  e.school_year 
                            FROM enrollments AS e 
                              LEFT JOIN curriculums AS cm 
                                ON e.course_code LIKE CONCAT('%', cm.course_code, '%') 
                                  AND e.year_level = cm.year_level 
                                  AND e.semester = cm.semester 
                            INNER JOIN students AS s 
                                ON s.student_number = e.student_number 
                            WHERE (s.user_code = :user_code 
                               OR s.email_address = (SELECT user_email FROM users WHERE user_code = :user_code_alt))
                            ORDER BY e.semester, e.year_level, e.school_year DESC ";
      $get_subject = $pdo->prepare($sql_get_subject);
      $get_subject->execute([
          ":user_code" => $user_code,
          ":user_code_alt" => $user_code
      ]);
      $get_subject_results = $get_subject->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($get_subject_results);
      break;

    // =====> Get Subject Lists <===== \\
    case "getSubjectLists":
      $sql_get_subject_lists = "SELECT subject_code FROM curriculums WHERE subject_code LIKE :subject_code";
      $get_subject_lists = $pdo->prepare($sql_get_subject_lists);
      $get_subject_lists->execute([":subject_code" => "%$search_subject%"]);
      $get_subject_lists_results = $get_subject_lists->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($get_subject_lists_results);
      break;

    // =====> Get Student Enrolled Subjects with Teacher Info <===== \\
    case "getStudentEnrolledSubjects":
      $sql_get_enrolled = "SELECT e.enrollment_id, 
                                  e.course_code, 
                                  e.year_level, 
                                  e.semester, 
                                  e.school_year, 
                                  e.section_code,
                                  cm.curriculum_id,
                                  cm.subject_code, 
                                  cm.subject_title,
                                  t.teacher_number,
                                  t.first_name AS teacher_firstname,
                                  t.last_name AS teacher_lastname
                           FROM enrollments AS e
                           INNER JOIN students AS s ON e.student_number = s.student_number
                           LEFT JOIN sections AS sc ON e.section_code = sc.section_code
                           LEFT JOIN curriculums AS cm ON sc.curriculum_id = cm.curriculum_id
                           LEFT JOIN teachers AS t ON sc.teacher_number = t.teacher_number
                           WHERE (s.user_code = :user_code OR s.email_address = (SELECT user_email FROM users WHERE user_code = :user_code_alt))
                           AND t.teacher_number IS NOT NULL";
      $semester = $data['semester'] ?? null;
      $params = [
          ":user_code" => $user_code,
          ":user_code_alt" => $user_code
      ];
      if (!empty($semester)) {
        $sql_get_enrolled .= " AND e.semester = :semester";
        $params[':semester'] = $semester;
      }
      $sql_get_enrolled .= " ORDER BY e.school_year DESC, e.semester DESC";

      $get_enrolled = $pdo->prepare($sql_get_enrolled);
      $get_enrolled->execute($params);
      $results = $get_enrolled->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($results);
      break;

    // =====> Get Filter Options <===== \\
    case "getFilterOptions":
      $tables = [
        'units' => 'units',
      ];

      $options = [];

      foreach ($tables as $key => $column) {
        try {
          // Use DISTINCT to get unique values, and filter out empty/null if needed
          $sql = "SELECT DISTINCT $column FROM curriculums WHERE $column IS NOT NULL AND $column != '' ORDER BY $column ASC";
          $stmt = $pdo->prepare($sql);
          $stmt->execute();
          $results = $stmt->fetchAll(PDO::FETCH_COLUMN);
          $options[$key] = $results;
        } catch (\Throwable $th) {
          $options[$key] = []; // Fallback to empty array on error
        }
      }

      echo json_encode($options);
      break;

    // =====> Get Unique Categories <===== \\
    case "getCurriculumCategories":
      $sql = "SELECT DISTINCT category FROM curriculums WHERE category IS NOT NULL AND category != '' ORDER BY category ASC";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      $results = $stmt->fetchAll(PDO::FETCH_COLUMN);
      echo json_encode($results);
      break;

    // =====> Get Curriculums (Subjects) By Category <===== \\
    case "getCurriculumsByCategory":
      // Group by subject_code to avoid duplicates if same subject appears in multiple curricula
      // Use MAX(curriculum_id) to likely get the most recent one if multiple exist
      $sql = "SELECT MAX(curriculum_id) as curriculum_id, subject_code, subject_title 
              FROM curriculums 
              WHERE category = :category 
              AND (curriculum_status = 'Active' OR curriculum_status = 'Available')
              GROUP BY subject_code, subject_title 
              ORDER BY subject_code ASC";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([':category' => $category]);
      $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($results);
      break;
      
    // =====> Get Category Value <===== \\
    case "getCategory":
      $sql_get_category = "SHOW COLUMNS FROM curriculums LIKE 'category'";
      $get_category = $pdo->query($sql_get_category);
      $get_category_results = $get_category->fetch(PDO::FETCH_ASSOC);
      $category_type = $get_category_results['Type'];
      preg_match("/^enum\('(.*)'\)$/", $category_type, $matches);
      $enum_values = explode("','", $matches[1]);
      echo json_encode($enum_values);
      break;

  }
}