<?php

session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if (!isset($_SESSION['login_status'])) {
  echo json_encode([
    "status" => "failed",
    "message" => "Not logged in"
  ]);
  exit;

}
else {

  require "../connection.php";

  $method = $_SERVER["REQUEST_METHOD"];
  $content_type = $_SERVER["CONTENT_TYPE"] ?? "";


  if (str_contains($content_type, "application/json")) {
    $data = json_decode(file_get_contents("php://input"), true);
  }
  else {
    $data = $_POST;
  }


  $action = $data['action'] ?? null;

  $category = $data['category'] ?? null;
  $sub_category = $data['subCategory'] ?? null;
  $search_term = $data['searchTerm'] ?? null;

  $student_id = $data['student_id'] ?? null;
  $student_number = $data['studentNumber'] ?? null;
  $first_name = $data['first_name'] ?? null;
  $middle_name = $data['middle_name'] ?? null;
  $last_name = $data['last_name'] ?? null;
  $gender = $data['gender'] ?? null;
  $date_of_birth = $data['date_of_birth'] ?? null;
  $contact_number = $data['contact_number'] ?? null;
  $email_address = $data['email_address'] ?? null;
  $guardian_name = $data['guardian_name'] ?? null;
  $guardian_number = $data['guardian_number'] ?? null;
  $house_number = $data['house_number'] ?? null;
  $street = $data['street_purok'] ?? null;
  $barangay = $data['barangay'] ?? null;
  $town = $data['town'] ?? null;
  $province = $data['province'] ?? null;
  $status = $data['status'] ?? null;

  $sql = $pdo->query("SELECT MAX(student_id) + 1 AS count FROM students");
  $sql_count = $sql->fetch(PDO::FETCH_ASSOC);
  $count = $sql_count['count'];
  $code = str_pad($count, 7, "0", STR_PAD_LEFT);

  function uploadImage($file)
  {
    $targetDir = __DIR__ . "/../images/students/";
    if (!is_dir($targetDir)) {
      mkdir($targetDir, 0777, true);
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $newName = uniqid("student_", true) . "." . $ext;
    $targetFile = $targetDir . $newName;

    move_uploaded_file($file['tmp_name'], $targetFile);

    return $newName;
  }




  if ($method !== "POST") {
    // =====> Get all the Student's Data <===== \\
    $sql_students = "SELECT 
                    s.*, 
                    e.education_level, 
                    e.course_code, 
                    e.year_level, 
                    e.semester, 
                    e.school_year, 
                    e.section_code 
                    FROM students AS s
                    LEFT JOIN enrollments AS e
                    ON s.student_number = e.student_number
                    AND e.school_year = (
                    SELECT MAX(e2.school_year)
                    FROM enrollments AS e2
                    WHERE e2.student_number = s.student_number)
                    ORDER BY s.student_id DESC";
    $students = $pdo->query($sql_students);
    $student_results = $students->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($student_results);
  }
  else {
    switch ($action) {

      // =====> Get all the Student's Data in Pagination <===== \\
      case "studentsPagination":
        $sql_students = "SELECT 
                s.*, 
                e.education_level, 
                e.course_code, 
                e.year_level, 
                e.semester, 
                e.school_year, 
                e.section
                FROM students AS s
                LEFT JOIN enrollments AS e
                ON s.student_number = e.student_number
                AND e.school_year = (
                SELECT MAX(e2.school_year)
                FROM enrollments AS e2
                WHERE e2.student_number = s.student_number)
                ORDER BY s.student_id DESC 
                LIMIT :limit OFFSET :offset";
        $students = $pdo->prepare($sql_students);
        $students->execute([
          ":limit" => $limit,
          ":offset" => $offset
        ]);
        $student_results = $students->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode([
          'student_results' => $student_results,
          'current_page' => $current_page,
          'last_page' => $last_page,
          'total' => $total,
        ]);
        break;

      // =====> Insert New Students <===== \\
      case "insertStudent":
        try {
          $sql = $pdo->prepare("SELECT * FROM students WHERE 
                              first_name      = :first_name     AND 
                              middle_name     = :middle_name    AND 
                              last_name       = :last_name      AND 
                              gender          = :gender         AND 
                              date_of_birth   = :date_of_birth  ");
          $sql->execute([
            ":first_name" => $first_name,
            ":middle_name" => $middle_name,
            ":last_name" => $last_name,
            ":gender" => $gender,
            ":date_of_birth" => $date_of_birth
          ]);
          if ($sql->rowCount() > 0) {
            echo json_encode([
              "status" => "failed",
              "message" => "Student already exist."
            ]);
            exit;
          }

          $image_name = "";


          $sql_insert = "INSERT INTO students (
                              student_image, 
                              student_number, 
                              first_name, 
                              middle_name, 
                              last_name, 
                              gender, 
                              date_of_birth, 
                              contact_number, 
                              email_address, 
                              guardian_name, 
                              guardian_number, 
                              house_number, 
                              street_purok, 
                              barangay, 
                              town, 
                              province, 
                              student_status) 
                            VALUES (
                              :student_image, 
                              :student_number, 
                              :first_name, 
                              :middle_name, 
                              :last_name, 
                              :gender, 
                              :date_of_birth, 
                              :contact_number, 
                              :email_address, 
                              :guardian_name, 
                              :guardian_number, 
                              :house_number, 
                              :street_purok, 
                              :barangay, 
                              :town, 
                              :province, 
                              :student_status)";
          $insert = $pdo->prepare($sql_insert);
          $insert->execute([
            ":student_image" => $image_name,
            ":student_number" => "i-campus-stdt-" . $code,
            ":first_name" => $first_name,
            ":middle_name" => $middle_name,
            ":last_name" => $last_name,
            ":gender" => $gender,
            ":date_of_birth" => $date_of_birth,
            ":contact_number" => $contact_number,
            ":email_address" => $email_address,
            ":guardian_name" => $guardian_name,
            ":guardian_number" => $guardian_number,
            ":house_number" => $house_number,
            ":street_purok" => $street,
            ":barangay" => $barangay,
            ":town" => $town,
            ":province" => $province,
            ":student_status" => "Active"
          ]);

          $student_id = $pdo->lastInsertId();

          if (!empty($_FILES['photo']['name'])) {
            $image_name = uploadImage($_FILES['photo']);
          }

          $update = $pdo->prepare("UPDATE students SET student_image = :student_image WHERE student_id = :student_id");
          $update->execute([
            ":student_image" => $image_name,
            ":student_id" => $student_id
          ]);

          echo json_encode([
            "status" => "success",
            "message" => "New student successfully registered."
          ]);

        }
        catch (\Throwable $error) {
          echo json_encode([
            "status" => "failed",
            "message" => $error
          ]);
        }
        break;

      // =====> Update Student <===== \\
      case "updateStudent":
        try {

          $has_new_image = isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK;

          $fetch_old_image = $pdo->prepare("SELECT student_image FROM students WHERE student_id = :student_id");
          $fetch_old_image->execute([":student_id" => $student_id]);
          $old_image = $fetch_old_image->fetchColumn();

          $new_image = $old_image;

          if ($has_new_image) {
            if ($old_image && $old_image !== "default.jpg") {
              $old_path = __DIR__ . "/../images/students/" . $old_image;
              if (file_exists($old_path)) {
                unlink($old_path);
              }
            }
            $new_image = uploadImage($_FILES['photo']);
          }


          $sql_update_student = "UPDATE students SET 
                                  student_image     = :student_image, 
                                  first_name        = :first_name, 
                                  middle_name       = :middle_name, 
                                  last_name         = :last_name, 
                                  gender            = :gender, 
                                  date_of_birth     = :date_of_birth, 
                                  contact_number    = :contact_number, 
                                  email_address     = :email_address, 
                                  guardian_name     = :guardian_name, 
                                  guardian_number   = :guardian_number, 
                                  house_number      = :house_number, 
                                  street_purok      = :street_purok, 
                                  barangay          = :barangay, 
                                  town              = :town, 
                                  province          = :province
                                  WHERE student_id  = :student_id";
          $update_student = $pdo->prepare($sql_update_student);
          $update_student->execute([
            ":student_image" => $new_image,
            ":student_id" => $student_id,
            ":first_name" => $first_name,
            ":middle_name" => $middle_name,
            ":last_name" => $last_name,
            ":gender" => $gender,
            ":date_of_birth" => $date_of_birth,
            ":contact_number" => $contact_number,
            ":email_address" => $email_address,
            ":guardian_name" => $guardian_name,
            ":guardian_number" => $guardian_number,
            ":house_number" => $house_number,
            ":street_purok" => $street,
            ":barangay" => $barangay,
            ":town" => $town,
            ":province" => $province,
          ]);
          echo json_encode([
            "status" => "success",
            "message" => $first_name . $last_name . " updated."
          ]);
        }
        catch (\Throwable $error) {
          echo json_encode([
            "status" => "failed",
            "message" => $error->getMessage()
          ]);
        }
        break;

      // =====> Get Student <===== \\
      case "getStudent":
        $sql_get_student = "SELECT s.*, 
                            e.education_level, 
                            e.course_code, 
                            e.year_level, 
                            e.semester, 
                            e.school_year, 
                            e.section_code 
                            FROM students AS s 
                            LEFT JOIN enrollments AS e 
                            ON s.student_number = e.student_number 
                            WHERE student_id = :student_id";
        $get_student = $pdo->prepare($sql_get_student);
        $get_student->execute([":student_id" => $student_id]);
        $get_student_result = $get_student->fetch(PDO::FETCH_ASSOC);
        echo json_encode($get_student_result);
        break;

      // =====> Searching and Filtering Student <===== \\
      case "searchStudent":
        // =====> Base SQL <===== \\
        $teacher_input = $data['teacher_number'] ?? null;
        $teacher_number = $teacher_input;

        if (!empty($teacher_input)) {
          // First check if this input is directly a teacher_number
          $check_teacher = $pdo->prepare("SELECT teacher_number FROM teachers WHERE teacher_number = :tn");
          $check_teacher->execute([':tn' => $teacher_input]);
          if ($check_teacher->rowCount() == 0) {
            // Not a direct teacher_number, maybe it's a user_code?
            $check_user = $pdo->prepare("SELECT user_email FROM users WHERE user_code = :uc");
            $check_user->execute([':uc' => $teacher_input]);
            $user_email = $check_user->fetchColumn();

            if ($user_email) {
              // It is a user_code, find the teacher with this email
              $find_teacher = $pdo->prepare("SELECT teacher_number FROM teachers WHERE email_address = :email");
              $find_teacher->execute([':email' => $user_email]);
              $found_tn = $find_teacher->fetchColumn();
              if ($found_tn) {
                $teacher_number = $found_tn;
              }
            }
          }
        }

        // =====> Base SQL <===== \\
        $sql_base = " FROM students AS s 
                        LEFT JOIN enrollments AS e 
                          ON e.student_number = s.student_number 
                          AND e.school_year = (
                            SELECT MAX(e2.school_year) 
                            FROM enrollments AS e2 
                            WHERE e2.student_number = s.student_number) ";

        // Join sections if filtering by teacher
        if (!empty($teacher_number)) {
          $sql_base .= " LEFT JOIN sections AS sec ON e.section_code = sec.section_code ";
        }

        $sql_base .= " WHERE 1=1";

        // Filter by Teacher
        if (!empty($teacher_number)) {
          $sql_base .= " AND sec.teacher_number = :teacher_number ";
        }

        // =====> Filter and Searching <===== \\
        $params = [];
        if (!empty($sub_category) && $sub_category !== "") {
          if ($category === "Gender") {
            $sql_base .= " AND (s.gender LIKE :filter_gender)";
            $params['filter_gender'] = $sub_category;
          }
          else if ($category === "Education_Level") {
            $sql_base .= " AND (e.education_level LIKE :educ_level)";
            $params['educ_level'] = $sub_category;
          }
          else if (in_array($category, ["College", "Senior_High", "TESDA"])) {
            $sql_base .= " AND (e.year_level LIKE :yr_level)";
            $params['yr_level'] = $sub_category;
          }
          else if ($category === "Semester") {
            $sql_base .= " AND (e.semester LIKE :sem)";
            $params['sem'] = $sub_category;
          }
          else if ($category === "School_Year") {
            $sql_base .= " AND (e.school_year LIKE :sy)";
            $params['sy'] = $sub_category;
          }
        }

        if (!empty($search_term)) {
          $sql_base .= " AND (
            s.student_number    LIKE :student_number  OR 
            s.first_name        LIKE :first_name      OR 
            s.middle_name       LIKE :middle_name     OR 
            s.last_name         LIKE :last_name       OR 
            s.gender            LIKE :gender          OR 
            s.date_of_birth     LIKE :date_of_birth   OR 
            e.education_level   LIKE :education_level OR 
            e.course_code       LIKE :course_code     OR 
            e.year_level        LIKE :year_level      OR 
            e.semester          LIKE :semester        OR 
            e.school_year       LIKE :school_year     OR 
            e.section_code      LIKE :section_code    OR 
            s.contact_number    LIKE :contact_number  OR 
            s.email_address     LIKE :email_address   OR 
            s.guardian_name     LIKE :guardian_name   OR 
            s.guardian_number   LIKE :guardian_number OR 
            s.street_purok      LIKE :street_purok    OR 
            s.barangay          LIKE :barangay        OR 
            s.town              LIKE :town            OR 
            s.province          LIKE :province        )";
          $params['student_number'] = "%$search_term%";
          $params['first_name'] = "%$search_term%";
          $params['middle_name'] = "%$search_term%";
          $params['last_name'] = "%$search_term%";
          $params['gender'] = "$search_term%";
          $params['date_of_birth'] = "%$search_term%";
          $params['education_level'] = "%$search_term%";
          $params['course_code'] = "%$search_term%";
          $params['year_level'] = "%$search_term%";
          $params['semester'] = "%$search_term%";
          $params['school_year'] = "%$search_term%";
          $params['section_code'] = "%$search_term%";
          $params['contact_number'] = "%$search_term%";
          $params['email_address'] = "%$search_term%";
          $params['guardian_name'] = "%$search_term%";
          $params['guardian_number'] = "%$search_term%";
          $params['street_purok'] = "%$search_term%";
          $params['barangay'] = "%$search_term%";
          $params['town'] = "%$search_term%";
          $params['province'] = "%$search_term%";
        }

        // =====> Get the total count <===== \\

        if (!empty($teacher_number)) {
          $params['teacher_number'] = $teacher_number;
        }

        // =====> Get the total count <===== \\

        $sql_total = $pdo->prepare(" SELECT COUNT(DISTINCT s.student_id) " . $sql_base);
        $sql_total->execute($params);
        $total = (int)$sql_total->fetchColumn();

        // =====> Sorting <===== \\
        $sort_by = $data['sortBy'] ?? 'student_id';
        $sort_order = strtoupper($data['sortOrder'] ?? 'DESC');

        $allowed_columns = [
          'student_id',
          'student_number',
          'first_name',
          'middle_name',
          'last_name',
          'gender',
          'date_of_birth',
          'education_level',
          'course_code',
          'year_level',
          'semester',
          'school_year',
          'section_code',
          'contact_number',
          'email_address',
          'guardian_name',
          'guardian_number',
          'house_number',
          'street_purok',
          'barangay',
          'town',
          'province',
          'student_status'
        ];

        if (!in_array($sort_by, $allowed_columns)) {
          $sort_by = 'student_id';
        }

        if (!in_array($sort_order, ['ASC', 'DESC'])) {
          $sort_order = 'DESC';
        }

        // Handle ambiguity if column exists in both tables (though most are prefixed in allowed list, ensuring uniqueness helps)
        // Simple mapping if needed, or just rely on unique names. 
        // student_number is in both, so we should prefix it.
        if ($sort_by === 'student_number') {
          $sort_by = 's.student_number';
        }
        else if (in_array($sort_by, ['education_level', 'course_code', 'year_level', 'semester', 'school_year', 'section_code'])) {
          $sort_by = 'e.' . $sort_by;
        }
        else {
          $sort_by = 's.' . $sort_by;
        }

        // =====> Fetch Paginate Record <===== \\
        $limit = isset($data['limit']) ? (int)$data['limit'] : 10;
        $page = isset($data['page']) ? (int)$data['page'] : 1;

        $page = max(1, $page);
        $offset = ($page - 1) * $limit;

        $sql_search_student = "SELECT s.*, 
                                      e.education_level, 
                                      e.course_code, 
                                      e.year_level, 
                                      e.semester, 
                                      e.school_year, 
                                      e.section_code" . $sql_base . " 
                                  ORDER BY $sort_by $sort_order 
                                  LIMIT :limit OFFSET :offset";
        $params['limit'] = $limit;
        $params['offset'] = $offset;


        try {
          $stmt = $pdo->prepare($sql_search_student);
          $stmt->execute($params);
          $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
          $last_page = (int)ceil($total / $limit);
          echo json_encode([
            'records' => $results,
            'total' => $total,
            'current_page' => $page,
            'last_page' => $last_page,
          ]);
        }
        catch (PDOException $e) {
          http_response_code(500);
          echo json_encode(["error" => $e->getMessage()]);
        }
        break;

      // =====> Delete Student <===== \\
      case "deleteStudent":
        try {
          $fetch_image = $pdo->prepare("SELECT student_image FROM students WHERE student_id = :student_id");
          $fetch_image->execute([":student_id" => $student_id]);
          $image = $fetch_image->fetchColumn();

          if ($image && $image !== "default.jpg") {
            $path = __DIR__ . "/../images/students/" . $image;
            if (file_exists($path)) {
              unlink($path);
            }
          }

          $delete = $pdo->prepare("DELETE FROM students WHERE student_id = :student_id");
          $delete->execute([":student_id" => $student_id]);

          echo json_encode([
            "status" => "success",
            "message" => "Student deleted successfully."
          ]);
        }
        catch (\Throwable $error) {
          echo json_encode([
            "status" => "failed",
            "message" => $error->getMessage()
          ]);
        }
        break;

      // =====> Get Student Education Level <===== \\
      case "getEducationLevel":
        $sql_get_education_level = "SHOW COLUMNS FROM students LIKE 'education_level'";
        $get_education_level = $pdo->query($sql_get_education_level);
        $get_education_level_results = $get_education_level->fetch(PDO::FETCH_ASSOC);
        $education_level = $get_education_level_results['Type'];
        preg_match("/^enum\('(.*)'\)$/", $education_level, $matches);
        $enum_values = explode("','", $matches[1]);
        echo json_encode($enum_values);
        break;

      default:
        echo json_encode([
          "status" => "failed",
          "message" => "Action undefined."
        ]);

    }
  }

}