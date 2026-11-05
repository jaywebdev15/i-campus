<?php

require "../connection.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-allow-Headers: Content-Type");
header("Content-Type: application/json");

$method = $_SERVER["REQUEST_METHOD"];

$data = json_decode(file_get_contents("php://input"), true);

$action = $data['action'] ?? null;

$search_term = $data['searchTerm'] ?? null;

$section_id = $data['section_id'] ?? null;
$section_code = $data['section_code'] ?? null;
$course_code = $data['course_code'] ?? null;
$education_level = $data['education_level'] ?? null;
$curriculum_id = $data['curriculum_id'] ?? null;
$year_level = $data['year_level'] ?? null;
$semester = $data['semester'] ?? null;
$teacher_number = $data['teacher_number'] ?? null;
$schedule = $data['schedule'] ?? null;
$time_in = $data['time_in'] ?? null;
$time_out = $data['time_out'] ?? null;

$sql_count = "SELECT COUNT(*) AS count FROM enrollments  
              WHERE section_code = :section_code";
$count = $pdo->prepare($sql_count);
$count->execute([":section_code" => $section_code]);
$total = $count->fetch(PDO::FETCH_ASSOC)['count'];

if ($method !== "POST") {
  $sql_sections = "SELECT se.section_id, se.section_code, se.course_code, se.education_level, se.curriculum_id AS se_curriculum_id, se.year_level, se.semester, se.teacher_number, se.schedule, se.time_in, se.time_out, 
                    cm.curriculum_id, 
                    cm.subject_code, 
                    t.first_name, 
                    t.last_name, 
                    COUNT(e.section_code) AS total_enrolled  
                    FROM sections AS se 
                    LEFT JOIN curriculums AS cm 
                      ON se.curriculum_id = cm.curriculum_id 
                    LEFT JOIN teachers AS t 
                      ON se.teacher_number = t.teacher_number 
                    LEFT JOIN enrollments AS e 
                      ON se.section_code = e.section_code 
                    GROUP BY se.section_id, se.section_code, se.course_code, se.education_level, se_curriculum_id, se.year_level, se.semester, se.teacher_number, se.schedule, se.time_in, se.time_out, cm.curriculum_id, cm.subject_code, t.first_name, t.last_name";
  $sections = $pdo->query($sql_sections);
  $section_results = $sections->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($section_results);
} else {
  switch ($action) {


    // =====> Insert New Sections <===== \\
    case "insertSection":
      try {
        // Cast empty strings to null for nullable database columns
        $course_code = !empty($course_code) ? $course_code : null;
        $education_level = !empty($education_level) ? $education_level : null;
        $curriculum_id = !empty($curriculum_id) ? $curriculum_id : null;
        $year_level = !empty($year_level) ? $year_level : null;
        $semester = !empty($semester) ? $semester : null;
        $teacher_number = !empty($teacher_number) ? $teacher_number : null;
        $schedule = !empty($schedule) ? $schedule : null;
        $time_in = !empty($time_in) ? $time_in : null;
        $time_out = !empty($time_out) ? $time_out : null;

        $sql_verify_section = "SELECT * FROM sections WHERE 
                                course_code     = :course_code      AND 
                                education_level = :education_level  AND 
                                year_level      = :year_level       AND 
                                semester        = :semester         AND
                                schedule        = :schedule         AND
                                time_in         = :time_in          AND
                                time_out        = :time_out         ";
        $verify_section = $pdo->prepare($sql_verify_section);
        $verify_section->execute([
          ":course_code" => $course_code,
          ":education_level" => $education_level,
          ":year_level" => $year_level,
          ":semester" => $semester,
          ":schedule" => $schedule,
          ":time_in" => $time_in,
          ":time_out" => $time_out
        ]);
        
        if ($verify_section->rowCount() > 0) {
          echo json_encode([
            "status" => "failed",
            "message" => "An identical section already exists."
          ]);
        } else {

          // Count existing sections for this course/year/semester to generate the letter
          $sql_count_sections = "SELECT COUNT(*) AS total_sec FROM sections WHERE course_code = :course_code AND year_level = :year_level AND semester = :semester";
          $stmt_count_sections = $pdo->prepare($sql_count_sections);
          $stmt_count_sections->execute([
            ":course_code" => $course_code,
            ":year_level" => $year_level,
            ":semester" => $semester
          ]);
          $total_sections = $stmt_count_sections->fetch(PDO::FETCH_ASSOC)['total_sec'];

          $initial = !empty($year_level) ? $year_level[0] : "1";
          // If total_sections is 0 -> A (65)
          // If total_sections is 1 -> B (66)
          $letter = chr(65 + $total_sections);
          $generated_section_code = $course_code . "-" . $initial . $letter;

          try {
            $sql_insert_sections = "INSERT INTO sections (section_code, course_code, education_level, curriculum_id, year_level, semester, teacher_number, schedule, time_in, time_out) 
                                    VALUES (:section_code, :course_code, :education_level, :curriculum_id, :year_level, :semester, :teacher_number, :schedule, :time_in, :time_out)";
            $insert_sections = $pdo->prepare($sql_insert_sections);
            $insert_sections->execute([
              ":section_code" => $generated_section_code,
              ":course_code" => $course_code,
              ":education_level" => $education_level,
              ":curriculum_id" => $curriculum_id,
              ":year_level" => $year_level,
              ":semester" => $semester,
              ":teacher_number" => $teacher_number,
              ":schedule" => $schedule,
              ":time_in" => $time_in,
              ":time_out" => $time_out
            ]);
            echo json_encode([
              "status" => "success",
              "message" => "New section $generated_section_code successfully added."
            ]);
          } catch (\Throwable $error) {
            echo json_encode([
              "status" => "failed",
              "message" => "Error inserting section: " . $error->getMessage()
            ]);
          }
        }
      } catch (\Throwable $error) {
        echo json_encode([
          "status" => "failed",
          "message" => "Error verifying section: " . $error->getMessage()
        ]);
      }
      break;



    // =====> Update Section <===== \\
    case "updateSection":
      try {
        // Cast empty strings to null for nullable database columns
        $course_code = !empty($course_code) ? $course_code : null;
        $education_level = !empty($education_level) ? $education_level : null;
        $curriculum_id = !empty($curriculum_id) ? $curriculum_id : null;
        $year_level = !empty($year_level) ? $year_level : null;
        $semester = !empty($semester) ? $semester : null;
        $teacher_number = !empty($teacher_number) ? $teacher_number : null;
        $schedule = !empty($schedule) ? $schedule : null;
        $time_in = !empty($time_in) ? $time_in : null;
        $time_out = !empty($time_out) ? $time_out : null;

        $sql_update_section = "UPDATE sections SET 
                                    course_code = :course_code, 
                                    education_level   = :education_level, 
                                    curriculum_id     = :curriculum_id, 
                                    year_level        = :year_level, 
                                    semester          = :semester, 
                                    teacher_number    = :teacher_number, 
                                    schedule          = :schedule, 
                                    time_in           = :time_in, 
                                    time_out          = :time_out 
                                    WHERE section_id  = :section_id";
        $update_section = $pdo->prepare($sql_update_section);
        $update_section->execute([
          ":section_id" => $section_id,
          ":course_code" => $course_code,
          ":education_level" => $education_level,
          ":curriculum_id" => $curriculum_id,
          ":year_level" => $year_level,
          ":semester" => $semester,
          ":teacher_number" => $teacher_number,
          ":schedule" => $schedule,
          ":time_in" => $time_in,
          ":time_out" => $time_out
        ]);
        echo json_encode([
          "status" => "success",
          "message" => "Updated successfully."
        ]);
      } catch (\Throwable $error) {
        echo json_encode([
          "status" => "failed",
          "message" => "Error updating section: " . $error->getMessage()
        ]);
      }
      break;


    // =====> Search Sections <===== \\
    case "searchSection":
      $page = $data['page'] ?? 1;
      $limit = isset($data['limit']) ? (int) $data['limit'] : 10;
      $offset = ($page - 1) * $limit;
      $subCategory = $data['subCategory'] ?? null;
      $category = $data['category'] ?? null; // Ensure category is retrieved

      $conditions = [];
      $params = [];

      // Search Term Logic
      // Search Term Logic
      if (!empty($search_term)) {
        $search_conditions = [
          "se.section_code LIKE :search_term1",
          "se.education_level LIKE :search_term2",
          "se.course_code LIKE :search_term3",
          "se.year_level LIKE :search_term4",
          "se.semester LIKE :search_term5",
          "se.schedule LIKE :search_term6",
          "se.time_in LIKE :search_term7",
          "se.time_out LIKE :search_term8",
          "se.teacher_number LIKE :search_term9",
          "cm.subject_code LIKE :search_term10",
          "cm.subject_title LIKE :search_term11",
          "cm.subject_description LIKE :search_term12",
          "t.first_name LIKE :search_term13",
          "t.last_name LIKE :search_term14",
          "CONCAT(t.first_name, ' ', t.last_name) LIKE :search_term15"
        ];
        $conditions[] = "(" . implode(" OR ", $search_conditions) . ")";

        $term = "%$search_term%";
        for ($i = 1; $i <= 15; $i++) {
          $params[":search_term$i"] = $term;
        }
      }

      // Filter Logic
      if (!empty($category) && !empty($subCategory)) {
        if ($category === "Education_Level") {
          $conditions[] = "se.education_level = :subCategory";
          $params[':subCategory'] = $subCategory;
        } elseif ($category === "Semester") {
          $conditions[] = "se.semester = :subCategory";
          $params[':subCategory'] = $subCategory;
        } elseif ($category === "Schedule") {
          // Map full day name to short code used in DB if passed as full name
          $map = [
            "Monday" => "M",
            "Tuesday" => "T",
            "Wednesday" => "W",
            "Thursday" => "Th",
            "Friday" => "F",
            "Saturday" => "S"
          ];
          $shortDay = $map[$subCategory] ?? $subCategory;
          $conditions[] = "se.schedule = :subCategory";
          $params[':subCategory'] = $shortDay;
        }
      }

      // Filter by Teacher if provided
      if (!empty($data['teacher_number'])) {
        $conditions[] = "u.user_code = :teacher_filter";
        $params[':teacher_filter'] = $data['teacher_number'];
      }

      $whereClause = "";
      if (count($conditions) > 0) {
        $whereClause = "WHERE " . implode(" AND ", $conditions);
      }

      // Count Total Queries
      // Since the main query uses GROUP BY se.section_id, we need to count unique section_ids
      // But filtering applies generally.
      // COUNT(DISTINCT se.section_id) is safer.
      $sql_count = "SELECT COUNT(DISTINCT se.section_id) 
                    FROM sections AS se 
                    LEFT JOIN curriculums AS cm ON se.curriculum_id = cm.curriculum_id 
                    LEFT JOIN teachers AS t ON se.teacher_number = t.teacher_number 
                    LEFT JOIN users AS u ON t.user_code = u.user_code
                    LEFT JOIN enrollments AS e ON se.section_code = e.section_code 
                    $whereClause";
      $stmt_count = $pdo->prepare($sql_count);
      $stmt_count->execute($params);
      $total_records = $stmt_count->fetchColumn();
      $last_page = ceil($total_records / $limit);

      $sortBy = $data['sortBy'] ?? 'section_id';
      $sortOrder = $data['sortOrder'] ?? 'DESC';
      $validSortOrder = strtoupper($sortOrder) === 'ASC' ? 'ASC' : 'DESC';

      // Map sort columns to handle ambiguity or specific logic
      if ($sortBy === 'total_enrolled') {
        // total_enrolled is an alias in the select, can be used in ORDER BY in MySQL
      } else if ($sortBy === 'section_code' || $sortBy === 'education_level' || $sortBy === 'year_level' || $sortBy === 'semester' || $sortBy === 'schedule' || $sortBy === 'section_id') {
        $sortBy = "se." . $sortBy;
      } else if ($sortBy === 'course_code') {
        $sortBy = "se.course_code";
      } else if ($sortBy === 'teacher_name') {
        $sortBy = "t.last_name"; // Sort by teacher's last name
      }

      $sql_search_section = "SELECT se.section_id, se.section_code, se.course_code, se.education_level, se.curriculum_id AS se_curriculum_id, se.year_level, se.semester, se.teacher_number, se.schedule, se.time_in, se.time_out, 
                            cm.curriculum_id, 
                            cm.subject_code, 
                            t.first_name, 
                            t.last_name, 
                            COUNT(e.section_code) AS total_enrolled  
                            FROM sections AS se 
                            LEFT JOIN curriculums AS cm 
                              ON se.curriculum_id = cm.curriculum_id 
                            LEFT JOIN teachers AS t 
                              ON se.teacher_number = t.teacher_number 
                            LEFT JOIN users AS u 
                              ON t.user_code = u.user_code
                            LEFT JOIN enrollments AS e 
                              ON se.section_code = e.section_code 
                            $whereClause 
                            GROUP BY se.section_id, se.section_code, se.course_code, se.education_level, se_curriculum_id, se.year_level, se.semester, se.teacher_number, se.schedule, se.time_in, se.time_out, cm.curriculum_id, cm.subject_code, t.first_name, t.last_name 
                            ORDER BY $sortBy $validSortOrder
                            LIMIT $limit OFFSET $offset";
      $search_section = $pdo->prepare($sql_search_section);

      // Bind params
      foreach ($params as $key => $value) {
        $search_section->bindValue($key, $value);
      }

      $search_section->execute();
      $section_results = $search_section->fetchAll(PDO::FETCH_ASSOC);

      echo json_encode([
        "records" => $section_results,
        "total" => $total_records,
        "current_page" => $page,
        "last_page" => $last_page
      ]);
      break;


    // =====> Get Section Based on ID <===== \\
    case "getSectionInfoByID":
      $sql_get_section_based_on_id = "SELECT * FROM sections WHERE section_id = :section_id";
      $get_section_based_on_id = $pdo->prepare($sql_get_section_based_on_id);
      $get_section_based_on_id->execute([":section_id" => $section_id]);
      $get_section_based_on_id_result = $get_section_based_on_id->fetch(PDO::FETCH_ASSOC);
      echo json_encode($get_section_based_on_id_result);
      break;


    // =====> Get Section Based on Course Code <===== \\
    case "getSectionBaseOnCourseCode":
      $sql_get_section = "SELECT DISTINCT section_code FROM sections WHERE course_code = :course_code";
      $params = [":course_code" => $course_code];

      if (!empty($year_level)) {
        $sql_get_section .= " AND year_level = :year_level";
        $params[":year_level"] = $year_level;
      }

      if (!empty($semester)) {
        $sql_get_section .= " AND semester = :semester";
        $params[":semester"] = $semester;
      }

      $get_section = $pdo->prepare($sql_get_section);
      $get_section->execute($params);
      $get_section_results = $get_section->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($get_section_results);
      break;


    // =====> Get Students Total in Section <===== \\
    case "getStudentsTotal":
      $sql_get_students = "SELECT se.*, 
                              e.section_code, 
                              s.student_image, 
                              s.first_name, 
                              s.middle_name, 
                              s.last_name, 
                              s.gender, 
                              s.date_of_birth 
                            FROM sections AS se 
                            INNER JOIN enrollments AS e 
                              ON se.section_code = e.section_code 
                            INNER JOIN students AS s 
                              ON s.student_number = e.student_number 
                            WHERE section_id = :section_id";
      $get_students = $pdo->prepare($sql_get_students);
      $get_students->execute([":section_id" => $section_id]);
      $get_students_results = $get_students->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($get_students_results);
      break;


    // =====> Sync Sections from Enrollments <===== \\
    case "syncSections":
      try {
        // 1. Get all distinct sections from enrollments
        $sql_enrollments = "SELECT DISTINCT section_code FROM enrollments WHERE section_code IS NOT NULL AND section_code != ''";
        $stmt_enrollments = $pdo->query($sql_enrollments);
        $enrolled_sections = $stmt_enrollments->fetchAll(PDO::FETCH_COLUMN);

        // 2. Get all existing sections
        $sql_existing = "SELECT section_code FROM sections";
        $stmt_existing = $pdo->query($sql_existing);
        $existing_sections = $stmt_existing->fetchAll(PDO::FETCH_COLUMN);

        // 3. Find missing sections
        $missing_sections = array_diff($enrolled_sections, $existing_sections);

        $added_count = 0;

        if (!empty($missing_sections)) {
          // Prepare insert statement
          // Removed school_year as it might not exist in sections table based on insertSection
          $sql_insert = "INSERT INTO sections (section_code, course_code, education_level, year_level, semester) 
                         VALUES (:section_code, :course_code, :education_level, :year_level, :semester)";
          $stmt_insert = $pdo->prepare($sql_insert);

          foreach ($missing_sections as $code) {
            // 4. Get details from one enrollment to populate section info
            $sql_details = "SELECT course_code, education_level, year_level, semester 
                             FROM enrollments WHERE section_code = :section_code LIMIT 1";
            $stmt_details = $pdo->prepare($sql_details);
            $stmt_details->execute([':section_code' => $code]);
            $details = $stmt_details->fetch(PDO::FETCH_ASSOC);

            if ($details) {
              // Determine `curriculum_id` if possible? 
              // Currently `sections` has `curriculum_id`. We might leave it null for now or try to fetch from curriculums table matching course/year/sem.
              // For simplicity/safety, we insert strictly what we know. The user can edit the section later to attach a curriculum/teacher.

              $stmt_insert->execute([
                ':section_code' => $code,
                ':course_code' => $details['course_code'],
                ':education_level' => $details['education_level'],
                ':year_level' => $details['year_level'],
                ':semester' => $details['semester']
              ]);
              $added_count++;
            }
          }
        }

        echo json_encode([
          "status" => "success",
          "message" => "Synced successfully. Added $added_count new sections."
        ]);

      } catch (\Throwable $error) {
        echo json_encode([
          "status" => "failed",
          "message" => "Sync failed: " . $error->getMessage()
        ]);
      }
      break;

    // =====> Get All Sections <===== \\
    case "getAllSectionCodes":
      $sql_get_all = "SELECT DISTINCT section_code FROM sections ORDER BY section_code ASC";
      $stmt_get_all = $pdo->query($sql_get_all);
      $all_sections = $stmt_get_all->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($all_sections);
      break;

    // =====> Get Distinct Education Levels <===== \\
    case "getEducationLevels":
      $sql = "SELECT DISTINCT education_level FROM sections WHERE education_level IS NOT NULL AND education_level != '' ORDER BY education_level ASC";
      $stmt = $pdo->query($sql);
      echo json_encode($stmt->fetchAll(PDO::FETCH_COLUMN));
      break;

    // =====> Get Distinct Semesters <===== \\
    case "getSemesters":
      $sql = "SELECT DISTINCT semester FROM sections WHERE semester IS NOT NULL AND semester != '' ORDER BY semester ASC";
      $stmt = $pdo->query($sql);
      echo json_encode($stmt->fetchAll(PDO::FETCH_COLUMN));
      break;

    // =====> Get Distinct Schedules <===== \\
    case "getSchedules":
      $sql = "SELECT DISTINCT schedule FROM sections WHERE schedule IS NOT NULL AND schedule != '' ORDER BY schedule ASC";
      $stmt = $pdo->query($sql);
      $schedules = $stmt->fetchAll(PDO::FETCH_COLUMN);

      // Map back to full names if needed, or just return what's in DB (M, T, W...)
      // The frontend can handle mapping if it wants to show full names but send short codes.
      // For now, let's return what is in the DB.
      echo json_encode($schedules);
      break;

  }
}