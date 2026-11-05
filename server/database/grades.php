<?php

require "../connection.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Header: Content-Type");
header("Content-Type: application/json");

$method = $_SERVER["REQUEST_METHOD"];

$data = json_decode(file_get_contents("php://input"), true);

$action = $data['action'] ?? null;




$user_code = $data['userCode'] ?? null;
$teacher_number = $data['teacherNumber'] ?? null;
$subject_id = $data['curriculumId'] ?? null;
$subject_code = $data['subjectCode'] ?? null;
$grading_period = $data['gradingPeriod'] ?? null;
$school_year = $data['schoolYear'] ?? null;
$section_code = $data['sectionCode'] ?? null;

$category_type = $data['categoryType'] ?? null;
$category_value = $data['categoryValue'] ?? null;
$search_term = $data['searchTerm'] ?? null;

$grade_id = $data['grade_id'] ?? null;
$curriculum_id = $data['curriculum_id'] ?? null;
$enrollment_id = $data['enrollment_id'] ?? null;
$criteria_id = $data['criteria_id'] ?? null;
$assessment = $data['assessment'] ?? null;
$grading_term = $data['grading_term'] ?? null;
$date = $data['date'] ?? null;
$items = $data['items'] ?? null;
$score = $data['score'] ?? null;


if ($method !== "POST") {
  // =====> Get all Grades <===== \\
  $sql = "SELECT e.enrollment_id, 
                            e.section_code, 
                            s.first_name, 
                            s.middle_name, 
                            s.last_name 
                      FROM enrollments AS e 
                        LEFT JOIN students AS s 
                          ON s.student_number = e.student_number 
                        LEFT JOIN sections AS sc 
                          ON sc.section_code = e.section_code 
                        LEFT JOIN teachers AS t 
                          ON t.teacher_number = sc.teacher_number 
                        LEFT JOIN users AS u 
                          ON u.user_code = t.user_code";
  $query = $pdo->prepare($sql);
  $query->execute();
  $results = $query->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($results);
} else {
  switch ($action) {

    // =====> Insert or Update grade <===== \\
    case "upsertGrade":

      $grade_id = $data['grade_id'] ?? null;

      // =====> If the important fields are empty return error message and exit the code <===== \\
      // Note: items and date are optional for QA (Quarterly Assessment) grades
      if (
        empty($subject_id) ||
        empty($enrollment_id) ||
        empty($criteria_id) ||
        empty($assessment) ||
        empty($grading_term) ||
        empty($user_code)
      ) {
        echo json_encode([
          "status" => "failed",
          "message" => "Please set subject code, assessment, and grading term before you can add score."
        ]);
        exit;
      }

      // Set defaults for optional fields
      $items = $items ?? "";
      $date = $date ?? "";

      if ($score == 0 && $score !== "") {
        // =====> Delete Grade if score is 0 <===== \\

        if (!empty($grade_id)) {
          // Delete by ID
          $sql_delete = "DELETE FROM grades WHERE grade_id = :grade_id";
          $stmt_delete = $pdo->prepare($sql_delete);
          $stmt_delete->execute([':grade_id' => $grade_id]);
          echo json_encode(["status" => "success", "message" => "Deleted Grade (Score 0)"]);
        } else {
          // Check if exists then delete
          $sql_check = "SELECT grade_id FROM grades WHERE 
                             curriculum_id   = :curriculum_id  AND 
                             enrollment_id   = :enrollment_id  AND 
                             criteria_id     = :criteria_id    AND 
                             assessment      = :assessment     AND 
                             grading_term    = :grading_term   AND 
                             teacher_code    = :teacher_code   AND 
                             school_year     = :school_year";
          $check = $pdo->prepare($sql_check);
          $check->execute([
            ":curriculum_id" => $subject_id,
            ":enrollment_id" => $enrollment_id,
            ":criteria_id" => $criteria_id,
            ":assessment" => $assessment,
            ":grading_term" => $grading_term,
            ":teacher_code" => $user_code,
            ":school_year" => $school_year
          ]);

          if ($check->rowCount() > 0) {
            $existing = $check->fetch(PDO::FETCH_ASSOC);
            $del_id = $existing['grade_id'];
            $sql_delete = "DELETE FROM grades WHERE grade_id = :grade_id";
            $stmt_delete = $pdo->prepare($sql_delete);
            $stmt_delete->execute([':grade_id' => $del_id]);
            echo json_encode(["status" => "success", "message" => "Deleted Grade (Score 0)"]);
          } else {
            echo json_encode(["status" => "success", "message" => "No action (Grade 0 and not found)"]);
          }
        }

      } else {

        if (!empty($grade_id)) {
          // Direct Update by ID
          $sql_update_id = "UPDATE grades SET grade = :score WHERE grade_id = :grade_id";
          $update_id = $pdo->prepare($sql_update_id);
          $update_id->execute([':score' => $score, ':grade_id' => $grade_id]);
          echo json_encode(["status" => "success", "message" => "Updated Grade by ID"]);
        } else {
          // ======> Validate if grade exists based on constant keys (Assessment, Term, Criteria) <===== \\
          // We do NOT include Date or Items in the WHERE clause because they are mutable values we might want to update.
          $sql_validate = "SELECT grade_id FROM grades WHERE 
                                  curriculum_id   = :curriculum_id  AND 
                                  enrollment_id   = :enrollment_id  AND 
                                  criteria_id     = :criteria_id    AND 
                                  assessment      = :assessment     AND 
                                  grading_term    = :grading_term   AND 
                                  teacher_code    = :teacher_code   AND 
                                  school_year     = :school_year    ";
          $validate = $pdo->prepare($sql_validate);
          $validate->execute([
            ":curriculum_id" => $subject_id,
            ":enrollment_id" => $enrollment_id,
            ":criteria_id" => $criteria_id,
            ":assessment" => $assessment,
            ":grading_term" => $grading_term,
            ":teacher_code" => $user_code,
            ":school_year" => $school_year
          ]);

          if ($validate->rowCount() > 0) {
            $existing = $validate->fetch(PDO::FETCH_ASSOC);
            $existing_grade_id = $existing['grade_id'];

            // ==========> Update grade, date, and items <========== \\
            $sql_update = "UPDATE grades SET grade = :score, date = :date, items = :items 
                                  WHERE grade_id = :grade_id";
            $update = $pdo->prepare($sql_update);
            $update->execute([
              ":score" => $score,
              ":date" => $date,
              ":items" => $items,
              ":grade_id" => $existing_grade_id
            ]);
            echo json_encode([
              "status" => "success",
              "message" => "Updated Grade",
              "grade_id" => $existing_grade_id
            ]);
          } else {
            // =====> Insert grade <===== \\
            $sql_insert_grades = "INSERT INTO grades (curriculum_id, enrollment_id, criteria_id, assessment, items, grading_term, date, grade, teacher_code, school_year)
                                      VALUES (:curriculum_id, :enrollment_id, :criteria_id, :assessment, :items, :grading_term, :date, :score, :teacher_code, :school_year)";
            $insert_grades = $pdo->prepare($sql_insert_grades);
            $insert_grades->execute([
              ":curriculum_id" => $subject_id,
              ":enrollment_id" => $enrollment_id,
              ":criteria_id" => $criteria_id,
              ":assessment" => $assessment,
              ":items" => $items,
              ":grading_term" => $grading_term,
              ":date" => $date,
              ":score" => $score,
              ":teacher_code" => $user_code,
              ":school_year" => $school_year,
            ]);
            $new_id = $pdo->lastInsertId();
            echo json_encode([
              "status" => "success",
              "message" => "Insert Grade",
              "grade_id" => $new_id
            ]);
          }
        }
      }


      break;


    // =====> Get student for grading <===== \\
    case "getStudents":
      $sql_get_students = "SELECT e.enrollment_id, 
                                  e.student_number, 
                                  e.school_year, 
                                  e.section_code, 
                                  sc.section_code, 
                                  sc.curriculum_id, 
                                  sc.teacher_number, 
                                  cm.curriculum_id, 
                                  cm.subject_code, 
                                  cm.subject_title, 
                                  cm.subject_description, 
                                  t.teacher_number, 
                                  t.first_name, 
                                  t.middle_name, 
                                  t.last_name, 
                                  s.student_number, 
                                  s.first_name, 
                                  s.middle_name, 
                                  s.last_name 
                            FROM enrollments AS e 
                              LEFT JOIN sections AS sc 
                                ON e.section_code = sc.section_code 
                              LEFT JOIN students AS s 
                                ON e.student_number = s.student_number 
                              LEFT JOIN curriculums AS cm 
                                ON cm.curriculum_id = sc.curriculum_id
                              LEFT JOIN teachers AS t 
                                ON t.teacher_number = sc.teacher_number    
                            ";
      $get_students = $pdo->prepare($sql_get_students);
      $get_students->execute();
      $get_students_results = $get_students->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($get_students_results);
      break;


      break;

    // =====> Get Grade Stats <===== \\
    case "getGradeStats":
      $sql_stats = "SELECT 
                      SUM(CASE WHEN grade >= 80 THEN 1 ELSE 0 END) as passed,
                      SUM(CASE WHEN grade >= 75 AND grade < 80 THEN 1 ELSE 0 END) as fair,
                      SUM(CASE WHEN grade < 75 THEN 1 ELSE 0 END) as bad
                    FROM grades";
      $stats_query = $pdo->query($sql_stats);
      $stats = $stats_query->fetch(PDO::FETCH_ASSOC);
      echo json_encode($stats);
      break;


    // =====> Get Student of Teacher <===== \\
    case "getStudentsOfTeacher":

      // Step 1: Fetch all students handled by this teacher
      $sql_students = "SELECT 
                                        e.enrollment_id,
                                        e.section_code,
                                        e.school_year,
                                        e.semester,

                                        sc.section_code, 

                                        s.first_name AS student_firstname,
                                        s.middle_name AS student_middlename,
                                        s.last_name AS student_lastname,

                                        t.first_name AS teacher_firstname,
                                        t.last_name AS teacher_lastname,

                                        cm.curriculum_id,
                                        cm.subject_code,
                                        cm.subject_title,

                                        g.assessment,
                                        g.items,
                                        g.grade,
                                        g.date,
                                        g.grading_term,
                                        g.assessment,
                                        g.items,
                                        g.grade,
                                        g.date,
                                        g.grading_term,
                                        g.criteria_id,
                                        g.grade_id

                                      FROM enrollments AS e

                                      INNER JOIN sections AS sc
                                        ON sc.section_code = e.section_code

                                      INNER JOIN teachers AS t
                                        ON t.teacher_number = sc.teacher_number

                                      INNER JOIN students AS s
                                        ON s.student_number = e.student_number

                                      INNER JOIN curriculums AS cm
                                        ON cm.curriculum_id = sc.curriculum_id

                                      LEFT JOIN grades AS g
                                        ON g.enrollment_id = e.enrollment_id
                                      AND g.teacher_code = t.user_code";

      $params = [':user_code' => $user_code];
      $sql_students .= " WHERE t.user_code = :user_code";

      if (!empty($section_code)) {
        $sql_students .= " AND sc.section_code = :section";
        $params[':section'] = $section_code;
      }

      $semester = $data['semester'] ?? null;
      if (!empty($semester)) {
        $sql_students .= " AND e.semester = :semester";
        $params[':semester'] = $semester;
      }

      $stmt = $pdo->prepare($sql_students);
      $stmt->execute($params);
      $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

      $students = [];

      foreach ($rows as $row) {
        $id = $row['enrollment_id'];

        if (!isset($students[$id])) {
          $students[$id] = [
            "enrollment_id" => $id,
            "name" => trim(
              $row['student_lastname'] . ", " .
              $row['student_firstname'] . " " .
              $row['student_middlename']
            ),
            "student_number" => $row['student_number'] ?? "",
            "teacher_name" => trim(
              $row['teacher_firstname'] . " " .
              $row['teacher_lastname']
            ),
            "subject_code" => $row['subject_code'],
            "subject_title" => $row['subject_title'],
            "semester" => $row['semester'],
            "grading_term" => $row['grading_term'],
            "curriculum_id" => $row['curriculum_id'],
            "section_code" => $row['section_code'],
            "school_year" => $row['school_year'],
            "grades" => []
          ];
        }

        if (!empty($row['assessment'])) {
          $students[$id]['grades'][] = [
            "assessment" => $row['assessment'],
            "items" => $row['items'],
            "score" => $row['grade'],
            "date" => $row['date'],
            "grading_term" => $row['grading_term'],
            "criteria_id" => $row['criteria_id'],
            "grade_id" => $row['grade_id']
          ];
        }
      }

      echo json_encode(array_values($students));
      exit;

      break;






    // =====> Get Student Grades (For Student View) <===== \\
    case "getStudentGrades":
      $user_code = $data['userCode'] ?? null;

      $sql = "SELECT 
                  e.enrollment_id,
                  e.section_code,
                  e.course_code,
                  e.school_year,
                  e.semester,

                  sc.section_code,

                  t.first_name AS teacher_firstname,
                  t.last_name AS teacher_lastname,

                  cm.curriculum_id,
                  cm.subject_code,
                  cm.subject_title,

                  g.assessment,
                  g.items,
                  g.grade,
                  g.grading_term,
                  g.criteria_id,
                  g.grade_id,
                  cr.criteria_percentage,
                  cr.criteria_name

              FROM enrollments AS e

              INNER JOIN sections AS sc
                ON sc.section_code = e.section_code

              INNER JOIN teachers AS t
                ON t.teacher_number = sc.teacher_number

              INNER JOIN curriculums AS cm
                ON cm.curriculum_id = sc.curriculum_id

              LEFT JOIN grades AS g
                ON g.enrollment_id = e.enrollment_id

              INNER JOIN students AS s 
                ON s.student_number = e.student_number 

              INNER JOIN users AS u 
                ON u.user_email = s.email_address

              LEFT JOIN criterias AS cr
                ON cr.id = g.criteria_id

              WHERE u.user_code = :user_code";

      $stmt = $pdo->prepare($sql);
      $stmt->execute([':user_code' => $user_code]);
      $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

      $subjects = [];

      foreach ($rows as $row) {
        $id = $row['enrollment_id'];

        if (!isset($subjects[$id])) {
          $subjects[$id] = [
            "enrollment_id" => $id,
            "subject_code" => $row['subject_code'],
            "subject_title" => $row['subject_title'],
            "course_code" => $row['course_code'],
            "teacher_name" => trim($row['teacher_firstname'] . " " . $row['teacher_lastname']),
            "section_code" => $row['section_code'],
            "school_year" => $row['school_year'],
            "semester" => $row['semester'],
            "grades" => []
          ];
        }

        if (!empty($row['grade_id'])) {
          // Structure grades by Term -> Assessment -> Criteria if needed, 
          // but generic flat list is fine for frontend processing too.
          $subjects[$id]['grades'][] = [
            "assessment" => $row['assessment'], // e.g. "Written Works"
            "grading_term" => $row['grading_term'], // e.g. "1st Quarter"
            "score" => $row['grade'],
            "items" => $row['items'],
            "criteria_id" => $row['criteria_id'],
            "criteria_percentage" => $row['criteria_percentage'],
            "criteria_name" => $row['criteria_name']
          ];
        }
      }

      echo json_encode(array_values($subjects));
      break;

    // =====> Get All Grades For Admin Overview (With Filters & Pagination) <===== \\
    case "getAllGradesForAdmin":
      $page = $data['page'] ?? 1;
      $limit = $data['limit'] ?? 10; 
      $offset = ($page - 1) * $limit;

      $search_term = $data['searchTerm'] ?? '';
      $category = $data['category'] ?? '';
      $sub_category = $data['subCategory'] ?? '';
      $teacher_id = $data['teacherId'] ?? null;

      // Base Query Joins - Start from enrollments to show all students
      $joins = " FROM enrollments AS e
                 INNER JOIN students AS s ON e.student_number = s.student_number
                 INNER JOIN sections AS sc ON e.section_code = sc.section_code
                 INNER JOIN curriculums AS cm ON sc.curriculum_id = cm.curriculum_id
                 LEFT JOIN grades AS g ON g.enrollment_id = e.enrollment_id ";

      // If teacher is specified, only show enrollments for sections assigned to this teacher
      if (!empty($teacher_id)) {
        $joins .= " INNER JOIN teachers AS t ON sc.teacher_number = t.teacher_number AND t.user_code = :teacher_id ";
      }

      // Build WHERE clause
      $where_conditions = [];
      $params = [];

      if (!empty($teacher_id)) {
        $params[':teacher_id'] = $teacher_id;
      }

      // 1. Search (Student Name, Subject, Section)
      if (!empty($search_term)) {
        $term = "%$search_term%";
        $where_conditions[] = "(
              CONCAT(s.last_name, ', ', s.first_name, ' ', COALESCE(s.middle_name, '')) LIKE :search_name OR
              cm.subject_code LIKE :search_subject OR
              cm.subject_title LIKE :search_title OR
              sc.section_code LIKE :search_section
          )";
        $params[':search_name'] = $term;
        $params[':search_subject'] = $term;
        $params[':search_title'] = $term;
        $params[':search_section'] = $term;
      }

      // 2. Category Filters
      if (!empty($category) && !empty($sub_category)) {
        if ($category === 'course_code') {
          $where_conditions[] = "e.course_code = :sub_val";
          $params[':sub_val'] = $sub_category;
        } elseif ($category === 'section_code') {
          $where_conditions[] = "sc.section_code = :sub_val";
          $params[':sub_val'] = $sub_category;
        } elseif ($category === 'semester') {
          $where_conditions[] = "e.semester = :sub_val";
          $params[':sub_val'] = $sub_category;
        } elseif ($category === 'school_year') {
          $where_conditions[] = "e.school_year = :sub_val";
          $params[':sub_val'] = $sub_category;
        }
      }

      $where_sql = "";
      if (count($where_conditions) > 0) {
        $where_sql = " WHERE " . implode(" AND ", $where_conditions);
      }

      // --- Query 1: Get Total Count (All unique enrollments) ---
      $sql_count = "SELECT COUNT(e.enrollment_id) as total " . $joins . $where_sql;
      $stmt_count = $pdo->prepare($sql_count);
      $stmt_count->execute($params);
      $total_records = $stmt_count->fetch(PDO::FETCH_ASSOC)['total'];

      // --- Query 2: Get Paged Records ---
      $sql_records = "SELECT 
                          s.student_image,
                          s.student_number,
                          CONCAT(s.last_name, ', ', s.first_name, ' ', COALESCE(s.middle_name, '')) AS student_name,
                          sc.section_code,
                          e.course_code,
                          e.school_year,
                          e.semester,
                          e.enrollment_id,
                          cm.subject_code,
                          cm.subject_title
                      " . $joins . $where_sql;

      $limit_int = (int) $limit;
      $offset_int = (int) $offset;
      $sql_records .= " ORDER BY s.last_name ASC, s.first_name ASC LIMIT $limit_int OFFSET $offset_int";

      $stmt = $pdo->prepare($sql_records);
      foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
      }

      $stmt->execute();
      $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

      echo json_encode([
        "records" => $results,
        "total" => $total_records,
        "page" => (int) $page,
        "limit" => (int) $limit
      ]);
      break;

    // =====> Get Student Transcript (All grades for a specific student) <===== \\
    case "getStudentTranscript":
      $student_number = $data['studentNumber'] ?? null;

      if (!$student_number) {
        echo json_encode(["status" => "error", "message" => "Student number is required"]);
        break;
      }

      // Get student info
      $sql_student = "SELECT 
                        s.student_number,
                        CONCAT(s.first_name, ' ', COALESCE(s.middle_name, ''), ' ', s.last_name) AS full_name,
                        e.section_code
                      FROM students AS s
                      LEFT JOIN enrollments AS e ON s.student_number = e.student_number
                      WHERE s.student_number = :student_number
                      LIMIT 1";
      $stmt_student = $pdo->prepare($sql_student);
      $stmt_student->execute([':student_number' => $student_number]);
      $student_info = $stmt_student->fetch(PDO::FETCH_ASSOC);

      // Get all grades for this student
      $sql_grades = "SELECT 
                        g.grade_id,
                        g.grade,
                        g.grading_term,
                        g.assessment,
                        g.date,
                        cm.subject_code,
                        cm.subject_title,
                        sc.section_code
                      FROM grades AS g
                      INNER JOIN enrollments AS e ON g.enrollment_id = e.enrollment_id
                      INNER JOIN sections AS sc ON e.section_code = sc.section_code
                      INNER JOIN curriculums AS cm ON sc.curriculum_id = cm.curriculum_id
                      WHERE e.student_number = :student_number
                      ORDER BY cm.subject_code, g.grading_term, g.assessment";

      $stmt_grades = $pdo->prepare($sql_grades);
      $stmt_grades->execute([':student_number' => $student_number]);
      $grades = $stmt_grades->fetchAll(PDO::FETCH_ASSOC);

      echo json_encode([
        "student" => $student_info,
        "grades" => $grades
      ]);
      break;

  }
}