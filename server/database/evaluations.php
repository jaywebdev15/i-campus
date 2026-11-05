<?php

require "../connection.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$method = $_SERVER["REQUEST_METHOD"];

$data = json_decode(file_get_contents("php://input"), true);

$action = $data['action'] ?? null;

$evaluation_course_id = $data['evaluation_course_id'] ?? null;
$evaluation_teacher_id = $data['evaluation_teacher_id'] ?? null;
$evaluation_student_id = $data['evaluation_student_id'] ?? null;
$evaluation_school_year = $data['evaluation_school_year'] ?? null;
$evaluation_explanation = $data['evaluation_explanation'] ?? null;
$evaluation_demonstration = $data['evaluation_demonstration'] ?? null;
$evaluation_method = $data['evaluation_method'] ?? null;
$evaluation_encouragement = $data['evaluation_encouragement'] ?? null;
$evaluation_assessment = $data['evaluation_assessment'] ?? null;
$evaluation_management = $data['evaluation_management'] ?? null;
$evaluation_respect = $data['evaluation_respect'] ?? null;
$evaluation_communication = $data['evaluation_communication'] ?? null;
$evaluation_ontime = $data['evaluation_ontime'] ?? null;
$evaluation_positive_learning = $data['evaluation_positive_learning'] ?? null;
$evaluation_semester = $data['evaluation_semester'] ?? null;
$evaluation_comments = $data['evaluation_comments'] ?? null;

if ($method != "POST") {
  $sql_evaluations = "SELECT e.*, 
                              s.first_name AS student_firstname, 
                              s.middle_name AS student_middlename, 
                              s.last_name AS student_lastname, 
                              t.first_name AS teacher_firstname, 
                              t.middle_name AS teacher_middlename, 
                              t.last_name AS teacher_lastname, 
                              c.subject_code, 
                              c.subject_title 
                        FROM teachers_evaluation AS e 
                          LEFT JOIN students AS s 
                            ON e.evaluation_student_id = s.student_number 
                          LEFT JOIN teachers AS t 
                            ON e.evaluation_teacher_id = t.teacher_number 
                          LEFT JOIN curriculums AS c 
                            ON e.evaluation_course_id = c.curriculum_id";
  $evaluations = $pdo->prepare($sql_evaluations);
  $evaluations->execute();
  $evaluations_results = $evaluations->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($evaluations_results);
} else {
  switch ($action) {

    // =====> Insert Evaluation <===== \\
    case "insertEvaluation":
      if (
        $evaluation_course_id == null ||
        empty($evaluation_teacher_id) ||
        empty($evaluation_student_id) ||
        empty($evaluation_school_year) ||
        empty($evaluation_semester) ||
        $evaluation_explanation == null ||
        $evaluation_demonstration == null ||
        $evaluation_method == null ||
        $evaluation_encouragement == null ||
        $evaluation_assessment == null ||
        $evaluation_management == null ||
        $evaluation_respect == null ||
        $evaluation_communication == null ||
        $evaluation_ontime == null ||
        $evaluation_positive_learning == null ||
        empty($evaluation_comments)
      ) {
        echo json_encode([
          "status" => "failed",
          "message" => "Please fill all the fields"
        ]);
        exit;
      }

      $verify_eval = $pdo->prepare("SELECT evaluation_id FROM teachers_evaluation 
                                    WHERE evaluation_student_id = :student_id 
                                    AND evaluation_teacher_id = :teacher_id 
                                    AND evaluation_course_id = :course_id 
                                    AND evaluation_school_year = :school_year 
                                    AND evaluation_semester = :semester");
      $verify_eval->execute([
        ":student_id" => $evaluation_student_id,
        ":teacher_id" => $evaluation_teacher_id,
        ":course_id" => $evaluation_course_id,
        ":school_year" => $evaluation_school_year,
        ":semester" => $evaluation_semester
      ]);

      if ($verify_eval->rowCount() > 0) {
        echo json_encode([
          "status" => "failed",
          "message" => "You have already evaluated this teacher for this subject in this semester."
        ]);
        exit;
      }

      $sql_insert = "INSERT INTO teachers_evaluation (evaluation_course_id, 
                                              evaluation_teacher_id, 
                                              evaluation_student_id, 
                                              evaluation_school_year, 
                                              evaluation_explanation, 
                                              evaluation_demonstration, 
                                              evaluation_method, 
                                              evaluation_encouragement, 
                                              evaluation_assessment, 
                                              evaluation_management, 
                                              evaluation_respect, 
                                              evaluation_communication, 
                                              evaluation_ontime, 
                                              evaluation_positive_learning, 
                                              evaluation_semester,
                                              evaluation_comments) 
                        VALUES( :evaluation_course_id, 
                                :evaluation_teacher_id, 
                                :evaluation_student_id, 
                                :evaluation_school_year, 
                                :evaluation_explanation, 
                                :evaluation_demonstration, 
                                :evaluation_method, 
                                :evaluation_encouragement, 
                                :evaluation_assessment, 
                                :evaluation_management, 
                                :evaluation_respect, 
                                :evaluation_communication, 
                                :evaluation_ontime, 
                                :evaluation_positive_learning, 
                                :evaluation_semester,
                                :evaluation_comments)";
      $insert = $pdo->prepare($sql_insert);
      $insert->execute([
        ":evaluation_course_id" => $evaluation_course_id,
        ":evaluation_teacher_id" => $evaluation_teacher_id,
        ":evaluation_student_id" => $evaluation_student_id,
        ":evaluation_school_year" => $evaluation_school_year,
        ":evaluation_explanation" => $evaluation_explanation,
        ":evaluation_demonstration" => $evaluation_demonstration,
        ":evaluation_method" => $evaluation_method,
        ":evaluation_encouragement" => $evaluation_encouragement,
        ":evaluation_assessment" => $evaluation_assessment,
        ":evaluation_management" => $evaluation_management,
        ":evaluation_respect" => $evaluation_respect,
        ":evaluation_communication" => $evaluation_communication,
        ":evaluation_ontime" => $evaluation_ontime,
        ":evaluation_positive_learning" => $evaluation_positive_learning,
        ":evaluation_semester" => $evaluation_semester,
        ":evaluation_comments" => $evaluation_comments
      ]);
      try {
        echo json_encode([
          "status" => "success",
          "message" => "Thank you for evaluating our teacher."
        ]);
      } catch (\Throwable $error) {
        echo json_encode([
          "status" => "failed",
          "message" => "Server or backend error."
        ]);
      }
      break;

    // =====> Insert Student Evaluation <===== \\
    case "insertStudentEvaluation":
      $enrollment_id = $data['enrollment_id'] ?? null;

      // Extract specific fields for Student Evaluation
      $evaluation_participation = $data['evaluation_participation'] ?? null;
      $evaluation_responsible = $data['evaluation_responsible'] ?? null;
      $evaluation_willing_to_learn = $data['evaluation_willing_to_learn'] ?? null;
      $evaluation_problem_solving = $data['evaluation_problem_solving'] ?? null;
      $evaluation_reliable = $data['evaluation_reliable'] ?? null;
      $evaluation_teamwork = $data['evaluation_teamwork'] ?? null;
      $evaluation_positive = $data['evaluation_positive'] ?? null;
      $evaluation_discipline = $data['evaluation_discipline'] ?? null;

      // Teacher ID comes from the logged-in user context passed from frontend
      // specific ratings...

      if (
        empty($enrollment_id) ||
        empty($evaluation_teacher_id) ||
        empty($evaluation_semester) ||
        $evaluation_demonstration == null ||
        $evaluation_participation == null ||
        $evaluation_responsible == null ||
        $evaluation_willing_to_learn == null ||
        $evaluation_problem_solving == null ||
        $evaluation_respect == null ||
        $evaluation_reliable == null ||
        $evaluation_teamwork == null ||
        $evaluation_positive == null ||
        $evaluation_discipline == null ||
        empty($evaluation_comments)
      ) {
        echo json_encode([
          "status" => "failed",
          "message" => "Please fill all the fields"
        ]);
        exit;
      }

      try {
        // Lookup details from enrollment
        $sql_details = "SELECT e.student_number, e.school_year, sc.curriculum_id 
                        FROM enrollments e
                        LEFT JOIN sections sc ON e.section_code = sc.section_code
                        WHERE e.enrollment_id = :enrollment_id";
        $stmt_details = $pdo->prepare($sql_details);
        $stmt_details->execute([':enrollment_id' => $enrollment_id]);
        $details = $stmt_details->fetch(PDO::FETCH_ASSOC);

        if (!$details) {
          echo json_encode([
            "status" => "failed",
            "message" => "Enrollment not found."
          ]);
          exit;
        }

        $evaluation_student_id = $details['student_number'];
        $evaluation_school_year = $details['school_year'];
        $evaluation_course_id = $details['curriculum_id'];

        $verify_eval = $pdo->prepare("SELECT evaluation_id FROM students_evaluation 
                                      WHERE evaluation_student_id = :student_id 
                                      AND evaluation_teacher_id = :teacher_id 
                                      AND evaluation_course_id = :course_id 
                                      AND evaluation_school_year = :school_year 
                                      AND evaluation_semester = :semester");
        $verify_eval->execute([
          ":student_id" => $evaluation_student_id,
          ":teacher_id" => $evaluation_teacher_id,
          ":course_id" => $evaluation_course_id,
          ":school_year" => $evaluation_school_year,
          ":semester" => $evaluation_semester
        ]);

        if ($verify_eval->rowCount() > 0) {
          echo json_encode([
            "status" => "failed",
            "message" => "This student has already been evaluated for this subject in this semester."
          ]);
          exit;
        }

        $sql_insert = "INSERT INTO students_evaluation (evaluation_course_id, 
                                                evaluation_teacher_id, 
                                                evaluation_student_id, 
                                                evaluation_school_year, 
                                                evaluation_demonstration, 
                                                evaluation_participation, 
                                                evaluation_responsible, 
                                                evaluation_willing_to_learn, 
                                                evaluation_problem_solving, 
                                                evaluation_respect, 
                                                evaluation_reliable, 
                                                evaluation_teamwork, 
                                                evaluation_positive, 
                                                evaluation_discipline, 
                                                evaluation_semester,
                                                evaluation_comments) 
                          VALUES( :evaluation_course_id, 
                                  :evaluation_teacher_id, 
                                  :evaluation_student_id, 
                                  :evaluation_school_year, 
                                  :evaluation_demonstration, 
                                  :evaluation_participation, 
                                  :evaluation_responsible, 
                                  :evaluation_willing_to_learn, 
                                  :evaluation_problem_solving, 
                                  :evaluation_respect, 
                                  :evaluation_reliable, 
                                  :evaluation_teamwork, 
                                  :evaluation_positive, 
                                  :evaluation_discipline, 
                                  :evaluation_semester,
                                  :evaluation_comments)";
        $insert = $pdo->prepare($sql_insert);
        $insert->execute([
          ":evaluation_course_id" => $evaluation_course_id,
          ":evaluation_teacher_id" => $evaluation_teacher_id,
          ":evaluation_student_id" => $evaluation_student_id,
          ":evaluation_school_year" => $evaluation_school_year,
          ":evaluation_demonstration" => $evaluation_demonstration,
          ":evaluation_participation" => $evaluation_participation,
          ":evaluation_responsible" => $evaluation_responsible,
          ":evaluation_willing_to_learn" => $evaluation_willing_to_learn,
          ":evaluation_problem_solving" => $evaluation_problem_solving,
          ":evaluation_respect" => $evaluation_respect,
          ":evaluation_reliable" => $evaluation_reliable,
          ":evaluation_teamwork" => $evaluation_teamwork,
          ":evaluation_positive" => $evaluation_positive,
          ":evaluation_discipline" => $evaluation_discipline,
          ":evaluation_semester" => $evaluation_semester,
          ":evaluation_comments" => $evaluation_comments
        ]);

        echo json_encode([
          "status" => "success",
          "message" => "Student successfully evaluated."
        ]);

      } catch (\Throwable $error) {
        echo json_encode([
          "status" => "failed",
          "message" => "Server or backend error: " . $error->getMessage()
        ]);
      }
      break;

    // =====> Search Evaluation <===== \\
    case "searchEvaluation":
      $page = $data['page'] ?? 1;
      $limit = 10;
      $offset = ($page - 1) * $limit;
      $search_term = $data['searchTerm'] ?? null;
      $category = $data['category'] ?? null;
      $subCategory = $data['subCategory'] ?? null; // School Year

      $conditions = [];
      $params = [];

      // Search Term Logic
      if (!empty($search_term)) {
        $conditions[] = "(
            s.first_name LIKE :search_s_first OR 
            s.last_name LIKE :search_s_last OR 
            t.first_name LIKE :search_t_first OR 
            t.last_name LIKE :search_t_last OR 
            c.subject_code LIKE :search_sub_code OR 
            c.subject_title LIKE :search_sub_title 
        )";
        $term = "%$search_term%";
        $params[':search_s_first'] = $term;
        $params[':search_s_last'] = $term;
        $params[':search_t_first'] = $term;
        $params[':search_t_last'] = $term;
        $params[':search_sub_code'] = $term;
        $params[':search_sub_title'] = $term;
      }

      // Filter Logic
      if (!empty($category) && !empty($subCategory)) {
        if ($category === "School_Year") {
          $conditions[] = "e.evaluation_school_year = :subCategory";
          $params[':subCategory'] = $subCategory;
        }
      }

      $whereClause = "";
      if (count($conditions) > 0) {
        $whereClause = " AND " . implode(" AND ", $conditions);
      }

      // Count Query
      $sql_count = "SELECT COUNT(*) as total 
                    FROM teachers_evaluation AS e 
                        LEFT JOIN students AS s ON e.evaluation_student_id = s.student_number 
                        LEFT JOIN teachers AS t ON e.evaluation_teacher_id = t.teacher_number 
                        LEFT JOIN curriculums AS c ON e.evaluation_course_id = c.curriculum_id 
                    WHERE 1=1" . $whereClause;
      $stmt_count = $pdo->prepare($sql_count);
      $stmt_count->execute($params);
      $total_records = $stmt_count->fetch(PDO::FETCH_ASSOC)['total'];
      $total_pages = ceil($total_records / $limit);

      // Main Query
      $sql_evaluations = "SELECT e.*, 
                              s.first_name AS student_firstname, 
                              s.middle_name AS student_middlename, 
                              s.last_name AS student_lastname, 
                              t.first_name AS teacher_firstname, 
                              t.middle_name AS teacher_middlename, 
                              t.last_name AS teacher_lastname, 
                              c.subject_code, 
                              c.subject_title 
                        FROM teachers_evaluation AS e 
                          LEFT JOIN students AS s 
                            ON e.evaluation_student_id = s.student_number 
                          LEFT JOIN teachers AS t 
                            ON e.evaluation_teacher_id = t.teacher_number 
                          LEFT JOIN curriculums AS c 
                            ON e.evaluation_course_id = c.curriculum_id 
                        WHERE 1=1" . $whereClause;

      // Sorting Logic
      $sort_by = $data['sortBy'] ?? 'evaluation_id';
      $sort_order = $data['sortOrder'] ?? 'DESC';

      $allowed_sorts = [
        'evaluation_id',
        'evaluation_course_id',
        'evaluation_teacher_id',
        'evaluation_student_id',
        'evaluation_school_year',
        'evaluation_explanation',
        'evaluation_demonstration',
        'evaluation_method',
        'evaluation_encouragement',
        'evaluation_assessment',
        'evaluation_management',
        'evaluation_respect',
        'evaluation_communication',
        'evaluation_ontime',
        'evaluation_positive_learning',
        'evaluation_comments'
      ];
      if (!in_array($sort_by, $allowed_sorts)) {
        $sort_by = 'evaluation_id';
      }
      $sort_order = strtoupper($sort_order) === 'ASC' ? 'ASC' : 'DESC';

      $sql_evaluations .= " ORDER BY e.$sort_by $sort_order LIMIT $limit OFFSET $offset";

      $evaluations = $pdo->prepare($sql_evaluations);
      $evaluations->execute($params);
      $evaluations_results = $evaluations->fetchAll(PDO::FETCH_ASSOC);

      echo json_encode([
        "records" => $evaluations_results,
        "total" => $total_records,
        "current_page" => intval($page),
        "last_page" => $total_pages
      ]);
      break;

    // =====> Search Student Evaluation <===== \\
    case "searchStudentEvaluation":
      $page = $data['page'] ?? 1;
      $limit = 10;
      $offset = ($page - 1) * $limit;
      $search_term = $data['searchTerm'] ?? null;
      $category = $data['category'] ?? null;
      $subCategory = $data['subCategory'] ?? null; // School Year

      $conditions = [];
      $params = [];

      // Search Term Logic
      if (!empty($search_term)) {
        $conditions[] = "(
            s.first_name LIKE :search_s_first OR 
            s.last_name LIKE :search_s_last OR 
            t.first_name LIKE :search_t_first OR 
            t.last_name LIKE :search_t_last OR 
            c.subject_code LIKE :search_sub_code OR 
            c.subject_title LIKE :search_sub_title 
        )";
        $term = "%$search_term%";
        $params[':search_s_first'] = $term;
        $params[':search_s_last'] = $term;
        $params[':search_t_first'] = $term;
        $params[':search_t_last'] = $term;
        $params[':search_sub_code'] = $term;
        $params[':search_sub_title'] = $term;
      }

      // Filter Logic
      if (!empty($category) && !empty($subCategory)) {
        if ($category === "School_Year") {
          $conditions[] = "e.evaluation_school_year = :subCategory";
          $params[':subCategory'] = $subCategory;
        }
      }

      $whereClause = "";
      if (count($conditions) > 0) {
        $whereClause = " AND " . implode(" AND ", $conditions);
      }

      // Count Query
      $sql_count = "SELECT COUNT(*) as total 
                    FROM students_evaluation AS e 
                        LEFT JOIN students AS s ON e.evaluation_student_id = s.student_number 
                        LEFT JOIN teachers AS t ON e.evaluation_teacher_id = t.teacher_number 
                        LEFT JOIN curriculums AS c ON e.evaluation_course_id = c.curriculum_id 
                    WHERE 1=1" . $whereClause;
      $stmt_count = $pdo->prepare($sql_count);
      $stmt_count->execute($params);
      $total_records = $stmt_count->fetch(PDO::FETCH_ASSOC)['total'];
      $total_pages = ceil($total_records / $limit);

      // Main Query
      $sql_evaluations = "SELECT e.*, 
                              s.first_name AS student_firstname, 
                              s.middle_name AS student_middlename, 
                              s.last_name AS student_lastname, 
                              t.first_name AS teacher_firstname, 
                              t.middle_name AS teacher_middlename, 
                              t.last_name AS teacher_lastname, 
                              c.subject_code, 
                              c.subject_title 
                        FROM students_evaluation AS e 
                          LEFT JOIN students AS s 
                            ON e.evaluation_student_id = s.student_number 
                          LEFT JOIN teachers AS t 
                            ON e.evaluation_teacher_id = t.teacher_number 
                          LEFT JOIN curriculums AS c 
                            ON e.evaluation_course_id = c.curriculum_id 
                        WHERE 1=1" . $whereClause;

      // Sorting Logic
      $sort_by = $data['sortBy'] ?? 'evaluation_id';
      $sort_order = $data['sortOrder'] ?? 'DESC';

      $allowed_sorts = [
        'evaluation_id',
        'evaluation_course_id',
        'evaluation_teacher_id',
        'evaluation_student_id',
        'evaluation_school_year',
        'evaluation_demonstration',
        'evaluation_participation',
        'evaluation_responsible',
        'evaluation_willing_to_learn',
        'evaluation_problem_solving',
        'evaluation_respect',
        'evaluation_reliable',
        'evaluation_teamwork',
        'evaluation_positive',
        'evaluation_discipline',
        'evaluation_comments'
      ];
      if (!in_array($sort_by, $allowed_sorts)) {
        $sort_by = 'evaluation_id';
      }
      $sort_order = strtoupper($sort_order) === 'ASC' ? 'ASC' : 'DESC';

      $sql_evaluations .= " ORDER BY e.$sort_by $sort_order LIMIT $limit OFFSET $offset";

      $evaluations = $pdo->prepare($sql_evaluations);
      $evaluations->execute($params);
      $evaluations_results = $evaluations->fetchAll(PDO::FETCH_ASSOC);

      echo json_encode([
        "records" => $evaluations_results,
        "total" => $total_records,
        "current_page" => intval($page),
        "last_page" => $total_pages
      ]);
      break;

  }
}

?>