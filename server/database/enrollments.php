<?php

require "../connection.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$method = $_SERVER["REQUEST_METHOD"];

$data = json_decode(file_get_contents("php://input"), true);

$action = $data['action'] ?? null;


$category = $data['category'] ?? null;
$sub_category = $data['subCategory'] ?? null;
$search_term = $data['searchTerm'] ?? null;

$enrollment_id = $data['enrollment_id'] ?? null;
$student_number = $data['student_number'] ?? null;
$education_level = $data['education_level'] ?? null;
$course_code = $data['course_code'] ?? null;
$year_level = $data['year_level'] ?? null;
$semester = $data['semester'] ?? null;
$school_year = $data['school_year'] ?? null;
$section_code = $data['section_code'] ?? null;
$date_enrolled = $data['date_enrolled'] ?? null;
$enrollee_status = $data['enrollee_status'] ?? null;
$payment_status = $data['payment_status'] ?? null;
$remarks = $data['remarks'] ?? null;
$created_at = $data['created_at'] ?? null;
$updated_at = $data['updated_at'] ?? null;

if ($method !== "POST") {
  // =====> Get all the Enrollment Data <===== \\
  $sql_enrollment = "SELECT DISTINCT e.*, 
                                      s.student_image, 
                                      s.student_number, 
                                      s.first_name, 
                                      s.middle_name, 
                                      s.last_name, 
                                      s.gender,
                                      se.section_code 
                      FROM enrollments AS e 
                        INNER JOIN students AS s ON e.student_number = s.student_number 
                        LEFT JOIN sections AS se ON e.section_code = se.section_code";
  $enrollment = $pdo->query($sql_enrollment);
  $enrollment_results = $enrollment->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($enrollment_results);
} else {
  switch ($action) {

    // =====> Insert New Enrollee <===== \\
    case "insertEnrollee":
      $sql_verify_student = "SELECT * FROM students WHERE student_number = :student_number";
      $verify_student = $pdo->prepare($sql_verify_student);
      $verify_student->execute([":student_number" => $student_number]);
      if ($verify_student->rowCount() > 0) {
        $verify_enrollee = $pdo->prepare("SELECT * FROM enrollments WHERE 
                                          student_number  = :student_number   AND 
                                          education_level = :education_level  AND 
                                          course_code     = :course_code      AND 
                                          year_level      = :year_level       AND 
                                          semester        = :semester         AND 
                                          school_year     = :school_year      ");
        $verify_enrollee->execute([
          ":student_number" => $student_number,
          ":education_level" => $education_level,
          ":course_code" => $course_code,
          ":year_level" => $year_level,
          ":semester" => $semester,
          ":school_year" => $school_year
        ]);
        if ($verify_enrollee->rowCount() > 0) {
          echo json_encode([
            "status" => "failed",
            "message" => "Enrollee already exist"
          ]);
        } else {
          try {
            $sql_insert_enrollee = "INSERT INTO enrollments ( student_number, 
                                                              education_level, 
                                                              course_code, 
                                                              year_level, 
                                                              semester, 
                                                              school_year, 
                                                              section_code, 
                                                              date_enrolled, 
                                                              enrollee_status, 
                                                              payment_status, 
                                                              remarks, 
                                                              created_at)
                                    VALUES (:student_number, 
                                            :education_level, 
                                            :course_code, 
                                            :year_level, 
                                            :semester, 
                                            :school_year, 
                                            :section_code, 
                                            :date_enrolled, 
                                            :enrollee_status, 
                                            :payment_status, 
                                            :remarks, 
                                            :created_at)";
            $insert_enrollee = $pdo->prepare($sql_insert_enrollee);
            $insert_enrollee->execute([
              ":student_number" => $student_number,
              ":education_level" => $education_level,
              ":course_code" => $course_code,
              ":year_level" => $year_level,
              ":semester" => $semester,
              ":school_year" => $school_year,
              ":section_code" => $section_code,
              ":date_enrolled" => $date_enrolled,
              ":enrollee_status" => $enrollee_status,
              ":payment_status" => $payment_status,
              ":remarks" => $remarks,
              ":created_at" => $created_at
            ]);
            echo json_encode([
              "status" => "success",
              "message" => "New Enrollee added successfully."
            ]);
          } catch (\Throwable $error) {
            echo json_encode([
              "status" => "failed",
              "message" => "Enrollment backend error(insert)" . $error->getMessage()
            ]);
          }
        }
      } else {
        echo json_encode([
          "status" => "failed",
          "message" => "Student doesn't exist."
        ]);
      }
      break;

    // =====> Update Enrollee Info <===== \\
    case "updateEnrollee":
      $sql_verify_student = "SELECT * FROM students WHERE student_number = :student_number";
      $verify_student = $pdo->prepare($sql_verify_student);
      $verify_student->execute([":student_number" => $student_number]);
      if ($verify_student->rowCount() > 0) {
        $verify_enrollee = $pdo->prepare("SELECT * FROM enrollments WHERE 
                                          student_number  = :student_number   AND 
                                          education_level = :education_level  AND 
                                          course_code     = :course_code      AND 
                                          year_level      = :year_level       AND 
                                          semester        = :semester         AND 
                                          school_year     = :school_year      AND 
                                          enrollment_id  != :enrollment_id");
        $verify_enrollee->execute([
          ":student_number" => $student_number,
          ":education_level" => $education_level,
          ":course_code" => $course_code,
          ":year_level" => $year_level,
          ":semester" => $semester,
          ":school_year" => $school_year,
          ":enrollment_id" => $enrollment_id
        ]);
        if ($verify_enrollee->rowCount() > 0) {
          echo json_encode([
            "status" => "failed",
            "message" => "Enrollee already exist"
          ]);
        } else {
          try {
            $sql_update_enrollee = "UPDATE enrollments SET 
                                    student_number  = :student_number, 
                                    education_level = :education_level, 
                                    course_code     = :course_code, 
                                    year_level      = :year_level, 
                                    semester        = :semester, 
                                    school_year     = :school_year, 
                                    section_code    = :section_code, 
                                    date_enrolled   = :date_enrolled, 
                                    enrollee_status = :enrollee_status, 
                                    payment_status  = :payment_status, 
                                    remarks         = :remarks, 
                                    updated_at      = :updated_at 
                                    WHERE enrollment_id = :enrollment_id";
            $update_enrollee = $pdo->prepare($sql_update_enrollee);
            $update_enrollee->execute([
              ":enrollment_id" => $enrollment_id,
              ":student_number" => $student_number,
              ":education_level" => $education_level,
              ":course_code" => $course_code,
              ":year_level" => $year_level,
              ":semester" => $semester,
              ":school_year" => $school_year,
              ":section_code" => $section_code,
              ":date_enrolled" => $date_enrolled,
              ":enrollee_status" => $enrollee_status,
              ":payment_status" => $payment_status,
              ":remarks" => $remarks,
              ":updated_at" => $updated_at
            ]);
            echo json_encode([
              "status" => "success",
              "message" => $student_number . " updated."
            ]);
          } catch (\Throwable $error) {
            echo json_encode([
              "status" => "failed",
              "message" => "Error in backend enrollee(update)" . $error->getMessage()
            ]);
          }
        }
      } else {
        echo json_encode([
          "status" => "failed",
          "message" => "Student doesn't exist."
        ]);
      }
      break;

    // =====> Searching Enrollee <===== \\
    case "searchEnrollees":
      // =====> SQL Base <===== \\
      $sql_base = " FROM enrollments AS e 
                      INNER JOIN students AS s ON e.student_number = s.student_number 
                    WHERE 1=1";


      // =====> Filter and Searching <===== \\
      $params = [];
      if (!empty($sub_category) && $sub_category !== "") {
        if ($category === "Gender") {
          $sql_base .= " AND (s.gender LIKE :filter_gender)";
          $params['filter_gender'] = $sub_category;
        } else if ($category === "Education_Level") {
          $sql_base .= " AND (e.education_level LIKE :filter_education_level)";
          $params['filter_education_level'] = $sub_category;
        } else if ($category === "College" || $category === "Senior_High" || $category === "TESDA") {
          $sql_base .= " AND (e.course_code LIKE :filter_course)";
          $params['filter_course'] = $sub_category;
        } else if ($category === "Semester") {
          $sql_base .= " AND (e.semester LIKE :filter_semester)";
          $params['filter_semester'] = $sub_category;
        } else if ($category === "School_Year") {
          $sql_base .= " AND (e.school_year LIKE :filter_school_year)";
          $params['filter_school_year'] = $sub_category;
        } else if ($category === "Enrollee_Status") {
          $sql_base .= " AND (e.enrollee_status LIKE :filter_enrollee_status)";
          $params['filter_enrollee_status'] = $sub_category;
        } else if ($category === "Payment_Status") {
          $sql_base .= " AND (e.payment_status LIKE :filter_payment_status)";
          $params['filter_payment_status'] = $sub_category;
        }
      }

      if (!empty($search_term)) {
        $sql_base .= " AND (
            e.student_number      LIKE :search_student_number     OR 
            e.course_code         LIKE :search_course_code        OR 
            e.year_level          LIKE :search_year_level         OR 
            e.semester            LIKE :search_semester           OR 
            e.school_year         LIKE :search_school_year        OR 
            e.section_code        LIKE :search_section            OR 
            e.date_enrolled       LIKE :search_date_enrolled      OR 
            e.enrollee_status     LIKE :search_enrollee_status    OR 
            e.payment_status      LIKE :search_payment_status     OR 
            e.remarks             LIKE :search_remarks            OR 
            s.first_name          LIKE :search_first_name         OR 
            s.middle_name         LIKE :search_middle_name        OR 
            s.last_name           LIKE :search_last_name          OR 
            s.gender              LIKE :search_gender             OR 
            s.date_of_birth       LIKE :search_date_of_birth      OR 
            s.contact_number      LIKE :search_contact_number     OR 
            s.email_address       LIKE :search_email_address      OR 
            s.guardian_name       LIKE :search_guardian_name      OR 
            s.guardian_number     LIKE :search_guardian_number    OR 
            s.street_purok        LIKE :search_street_purok       OR 
            s.barangay            LIKE :search_barangay           OR 
            s.town                LIKE :search_town               OR 
            s.province            LIKE :search_province           )";
        $params["search_student_number"] = "%$search_term%";
        $params["search_course_code"] = "%$search_term%";
        $params["search_year_level"] = "%$search_term%";
        $params["search_semester"] = "%$search_term%";
        $params["search_school_year"] = "%$search_term%";
        $params["search_section"] = "%$search_term%";
        $params["search_date_enrolled"] = "%$search_term%";
        $params["search_enrollee_status"] = "%$search_term%";
        $params["search_payment_status"] = "%$search_term%";
        $params["search_remarks"] = "%$search_term%";
        $params["search_first_name"] = "%$search_term%";
        $params["search_middle_name"] = "%$search_term%";
        $params["search_last_name"] = "%$search_term%";
        $params["search_gender"] = "$search_term%";
        $params["search_date_of_birth"] = "%$search_term%";
        $params["search_contact_number"] = "%$search_term%";
        $params["search_email_address"] = "%$search_term%";
        $params["search_guardian_name"] = "%$search_term%";
        $params["search_guardian_number"] = "%$search_term%";
        $params["search_street_purok"] = "%$search_term%";
        $params["search_barangay"] = "%$search_term%";
        $params["search_town"] = "%$search_term%";
        $params["search_province"] = "%$search_term%";
      }

      // =====> Get the Total Count <===== \\
      $sql_total = $pdo->prepare(" SELECT COUNT(DISTINCT e.enrollment_id) " . $sql_base);
      $sql_total->execute($params);
      $total = (int) $sql_total->fetchColumn();

      // =====> Fetch Paginate Record <===== \\
      $limit = isset($data['limit']) ? (int) $data['limit'] : 5;
      $page = isset($data['page']) ? (int) $data['page'] : 1;

      $page = max(1, $page);
      $offset = ($page - 1) * $limit;

      $sortBy = $data['sortBy'] ?? 'enrollment_id';
      $sortOrder = $data['sortOrder'] ?? 'DESC';
      $validSortOrder = strtoupper($sortOrder) === 'ASC' ? 'ASC' : 'DESC';

      // Map frontend keys to DB columns if needed, or allow direct pass-through for simplicity
      // Ensure we prepend table aliases if columns are ambiguous, though most here are unique enough or fetched with alias
      // s.first_name, e.student_number, etc.
      // If sortBy doesn't have a dot, we might need to guess the table. 
      // Safe default: use what is passed, but maybe prefix if it matches known columns.

      // Allow specific mappings for complex sorts
      if ($sortBy === 'first_name' || $sortBy === 'last_name' || $sortBy === 'student_number') {
        $sortBy = "s." . $sortBy;
      } else if (in_array($sortBy, ['education_level', 'course_code', 'year_level', 'semester', 'school_year', 'section_code', 'date_enrolled', 'enrollee_status', 'payment_status', 'remarks'])) {
        $sortBy = "e." . $sortBy;
      } else {
        // Default or existing behavior
        if (strpos($sortBy, '.') === false) {
          // If not prefixed, default to e.enrollment_id or just pass it (risk of ambiguity if joined column names clash)
          $sortBy = "e.enrollment_id";
        }
      }

      $sql_search_enrollee = "SELECT e.*, 
                                      s.student_image, 
                                      s.first_name, 
                                      s.middle_name, 
                                      s.last_name, 
                                      s.gender, 
                                      s.date_of_birth, 
                                      s.contact_number, 
                                      s.email_address, 
                                      s.guardian_name, 
                                      s.guardian_number, 
                                      s.street_purok, 
                                      s.barangay, 
                                      s.town, 
                                      s.province"
        . $sql_base . " 
                                ORDER BY $sortBy $validSortOrder
                                LIMIT :limit OFFSET :offset";
      $params['limit'] = $limit;
      $params['offset'] = $offset;

      try {
        $enrollee = $pdo->prepare($sql_search_enrollee);
        $enrollee->execute($params);
        $enrollee_results = $enrollee->fetchAll(PDO::FETCH_ASSOC);
        $last_page = (int) ceil($total / $limit);
        echo json_encode([
          'records' => $enrollee_results,
          'current_page' => $page,
          'last_page' => $last_page,
          'total' => $total,
        ]);
      } catch (\Throwable $th) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
      }



      break;

    // =====> Get Enrollee By ID <===== \\
    case "getEnrolleeInfoById":
      $sql_get_enrollee_info_by_id = "SELECT * FROM enrollments WHERE enrollment_id = :enrollment_id";
      $get_enrollee_info_by_id = $pdo->prepare($sql_get_enrollee_info_by_id);
      $get_enrollee_info_by_id->execute([":enrollment_id" => $enrollment_id]);
      $get_enrollee_info_by_id_result = $get_enrollee_info_by_id->fetch(PDO::FETCH_ASSOC);
      echo json_encode($get_enrollee_info_by_id_result);
      break;

    // =====> Get Enrolle by Number <===== \\
    case "getEnrolleeByNumber":
      $sql_get_enrollee_by_number = "SELECT e.*,
                                    s.first_name, 
                                    s.middle_name, 
                                    s.last_name  
                                    FROM enrollments AS e LEFT JOIN students AS s 
                                    ON s.student_number = e.student_number 
                                    WHERE e.student_number = :student_number";
      $get_enrollee_by_number = $pdo->prepare($sql_get_enrollee_by_number);
      $get_enrollee_by_number->execute([":student_number" => $student_number]);
      $enrollee_by_number_result = $get_enrollee_by_number->fetch(PDO::FETCH_ASSOC);
      if ($enrollee_by_number_result) {
        echo json_encode($enrollee_by_number_result);
      } else {
        echo json_encode([
          "status" => "failed",
          "message" => "enrollee not found."
        ]);
      }
      break;

    // =====> Get Enrollee By ID <===== \\
    case "getEnrolleeCurriculumById":
      $sql_get_enrollee_info_by_id = "SELECT DISTINCT e.*, 
                                      st.student_image,
                                      st.student_number, 
                                      st.first_name, 
                                      st.middle_name, 
                                      st.last_name, 
                                      st.gender, 
                                      st.date_of_birth, 
                                      st.contact_number,
                                      st.email_address,
                                      st.guardian_name,
                                      st.guardian_number,
                                      cm.course_code, 
                                      cm.subject_code, 
                                      cm.year_level, 
                                      cm.semester, 
                                      c.course_title, 
                                      c.course_description, 
                                      c.category, 
                                      s.subject_code, 
                                      s.subject_title, 
                                      s.subject_description, 
                                      s.units, 
                                      s.category, 
                                      s.price, 
                                      se.section_code, 
                                      se.schedule, 
                                      t.teacher_number, 
                                      t.first_name AS teacher_firstname, 
                                      t.last_name AS teacher_lastname 
                                      FROM enrollments AS e 
                                      LEFT JOIN students AS st 
                                        ON e.student_number = st.student_number 
                                      LEFT JOIN curriculums AS cm 
                                        ON e.course_code = cm.course_code 
                                          AND e.education_level = cm.education_level 
                                          AND e.year_level = cm.year_level 
                                          AND e.semester = cm.semester 
                                      LEFT JOIN courses AS c 
                                        ON cm.course_code = c.course_code 
                                      LEFT JOIN subjects AS s 
                                        ON cm.subject_code = s.subject_code 
                                      LEFT JOIN sections AS se 
                                        ON se.section_code = e.section_code 
                                          AND se.curriculum_id = cm.curriculum_id 
                                      LEFT JOIN teachers AS t 
                                        ON se.teacher_number = t.teacher_number 
                                      WHERE e.enrollment_id = :enrollment_id";
      $get_enrollee_info_by_id = $pdo->prepare($sql_get_enrollee_info_by_id);
      $get_enrollee_info_by_id->execute([":enrollment_id" => $enrollment_id]);
      $get_enrollee_info_by_id_result = $get_enrollee_info_by_id->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($get_enrollee_info_by_id_result);
      break;

    // =====> Get Students Enrollee <===== \\
    case "getEnrolleeStudents":
      $sql_get_enrollee_students = "SELECT 
                                    (SELECT COUNT(*) FROM enrollments) AS total_enrollees,
                                    (SELECT COUNT(*) FROM students) AS total_students";
      $get_enrollee_students = $pdo->query($sql_get_enrollee_students);
      $get_enrollee_students_results = $get_enrollee_students->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($get_enrollee_students_results);
      break;

    // =====> Get Enrollees by Course <===== \\
    case "getEnrolleeByCourses";
      $sql_get_enrollees_by_course = "SELECT course_code, 
                                        COUNT(course_code) AS total_enrollees 
                                      FROM enrollments 
                                      GROUP BY course_code";
      $get_enrollees_by_course = $pdo->query($sql_get_enrollees_by_course);
      $get_enrollees_by_course_results = $get_enrollees_by_course->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($get_enrollees_by_course_results);
      break;



  }
}