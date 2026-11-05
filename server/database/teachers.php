<?php

require "../connection.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allo-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$method = $_SERVER["REQUEST_METHOD"];
$content_type = $_SERVER["CONTENT_TYPE"] ?? "";


if (str_contains($content_type, "application/json")) {
  $data = json_decode(file_get_contents("php://input"), true);
} else {
  $data = $_POST;
}

$action = $data['action'] ?? null;


$category = $data['category'] ?? null;
$sub_category = $data['subCategory'] ?? null;
$search_term = $data['searchTerm'] ?? null;
$sort_by = $data['sortBy'] ?? 'teacher_id';
$sort_order = $data['sortOrder'] ?? 'DESC';

$teacher_id = $data['teacher_id'] ?? null;
$user_code = $data['user_code'] ?? null;
$teacher_number = $data['teacher_number'] ?? null;
$first_name = $data['first_name'] ?? null;
$middle_name = $data['middle_name'] ?? null;
$last_name = $data['last_name'] ?? null;
$gender = $data['gender'] ?? null;
$civil_status = $data['civil_status'] ?? null;
$date_of_birth = $data['date_of_birth'] ?? null;
$contact_number = $data['contact_number'] ?? null;
$email_address = $data['email_address'] ?? null;
$house_number = $data['house_number'] ?? null;
$street = $data['street'] ?? null;
$barangay = $data['barangay'] ?? null;
$town = $data['town'] ?? null;
$province = $data['province'] ?? null;
$educational_attainment = $data['educational_attainment'] ?? null;
$achievements = $data['achievements'] ?? null;
$specialty = $data['specialty'] ?? null;
$teaching_experience = $data['teaching_experience'] ?? null;
$subject_to_teach = $data['subject_to_teach'] ?? null;
$teacher_status = $data['teacher_status'] ?? null;
$created_at = $data['created_at'] ?? null;

$sql = $pdo->query("SELECT MAX(teacher_id) + 1 AS count FROM teachers");
$verify = $sql->fetch(PDO::FETCH_ASSOC);
$count = $verify['count'];
$code = str_pad($count, 8, "0", STR_PAD_LEFT);

function uploadImage($file)
{
  $targetDir = __DIR__ . "/../images/teachers/";
  if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
  }

  $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
  $newName = uniqid("teacher_", true) . "." . $ext;
  $targetFile = $targetDir . $newName;

  move_uploaded_file($file['tmp_name'], $targetFile);

  return $newName;
}



if ($method !== "POST") {
  // =====> Get all Teacher Data <===== \\
  $sql_teacher = "SELECT * FROM teachers ORDER BY teacher_id DESC";
  $teacher = $pdo->query($sql_teacher);
  $teacher_results = $teacher->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($teacher_results);
} else {
  switch ($action) {

    // ==========> Insert New Teacher <========== \\
    case "insertTeacher":
      try {
        // =====> Validate if teacher exists <===== \\
        $sql = $pdo->prepare("SELECT * FROM teachers WHERE 
                            first_name  = :first_name AND 
                            middle_name = :middle_name AND 
                            last_name   = :last_name AND 
                            gender      = :gender");
        $sql->execute([
          ":first_name" => $first_name,
          ":middle_name" => $middle_name,
          ":last_name" => $last_name,
          ":gender" => $gender
        ]);
        if ($sql->rowCount() > 0) {
          echo json_encode([
            "status" => "failed",
            "message" => "Teacher already exist."
          ]);
          exit;
        }

        $image_name = "";

        // =====> Inserting SQL Query <===== \\
        $sql_insert = "INSERT INTO teachers (
                            teacher_image, 
                            teacher_number, 
                            first_name, 
                            middle_name, 
                            last_name, 
                            gender, 
                            civil_status, 
                            date_of_birth, 
                            contact_number, 
                            email_address, 
                            house_number, 
                            street, 
                            barangay, 
                            town, 
                            province, 
                            educational_attainment, 
                            achievements, 
                            subject_to_teach, 
                            specialty, 
                            teaching_experience, 
                            teacher_status) 
                          VALUES (
                            :teacher_image, 
                            :teacher_number, 
                            :first_name, 
                            :middle_name, 
                            :last_name, 
                            :gender, 
                            :civil_status, 
                            :date_of_birth, 
                            :contact_number, 
                            :email_address, 
                            :house_number, 
                            :street, 
                            :barangay, 
                            :town, 
                            :province, 
                            :educational_attainment, 
                            :achievements, 
                            :subject_to_teach, 
                            :specialty, 
                            :teaching_experience, 
                            :teacher_status)";
        $insert = $pdo->prepare($sql_insert);
        $insert->execute([
          ":teacher_image" => $image_name,
          ":teacher_number" => $code,
          ":first_name" => $first_name,
          ":middle_name" => $middle_name,
          ":last_name" => $last_name,
          ":gender" => $gender,
          ":civil_status" => $civil_status,
          ":date_of_birth" => $date_of_birth,
          ":contact_number" => $contact_number,
          ":email_address" => $email_address,
          ":house_number" => $house_number,
          ":street" => $street,
          ":barangay" => $barangay,
          ":town" => $town,
          ":province" => $province,
          ":educational_attainment" => $educational_attainment,
          ":achievements" => $achievements,
          ":subject_to_teach" => $subject_to_teach,
          ":specialty" => $specialty,
          ":teaching_experience" => $teaching_experience,
          ":teacher_status" => $teacher_status
        ]);

        $teacher_id = $pdo->lastInsertId();

        // =====> Image saved on the machine <===== \\
        if (!empty($_FILES['photo']['name'])) {
          $image_name = uploadImage($_FILES['photo']);
        }

        $update = $pdo->prepare("UPDATE teachers SET teacher_image = :teacher_image WHERE teacher_id = :teacher_id");
        $update->execute([
          ":teacher_image" => $image_name,
          ":teacher_id" => $teacher_id
        ]);

        echo json_encode([
          "status" => "success",
          "message" => "New teacher successfully registered."
        ]);

      } catch (\Throwable $error) {
        echo json_encode([
          "status" => "failed",
          "message" => $error
        ]);
      }
      break;

    // =====> Update Teacher Info <===== \\
    case "updateTeacher":
      try {

        $has_new_image = isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK;

        $fetch_old_image = $pdo->prepare("SELECT teacher_image FROM teachers WHERE teacher_id = :teacher_id");
        $fetch_old_image->execute([":teacher_id" => $teacher_id]);
        $old_image = $fetch_old_image->fetchColumn();

        $new_image = $old_image;

        if ($has_new_image) {
          if ($old_image && $old_image !== "default.jpg") {
            $old_file = __DIR__ . "/../images/teachers/" . $old_image;
            if (file_exists($old_file)) {
              unlink($old_file);
            }
          }
          $new_image = uploadImage($_FILES['photo']);
        }

        $sql_update_teacher = "UPDATE teachers SET 
                                teacher_image             = :teacher_image, 
                                first_name                = :first_name, 
                                middle_name               = :middle_name, 
                                last_name                 = :last_name, 
                                gender                    = :gender, 
                                civil_status              = :civil_status, 
                                date_of_birth             = :date_of_birth, 
                                contact_number            = :contact_number, 
                                email_address             = :email_address, 
                                house_number              = :house_number, 
                                street                    = :street, 
                                barangay                  = :barangay, 
                                town                      = :town, 
                                province                  = :province, 
                                subject_to_teach          = :subject_to_teach,  
                                educational_attainment    = :educational_attainment, 
                                achievements              = :achievements, 
                                specialty                 = :specialty, 
                                teaching_experience       = :teaching_experience,
                                teacher_status            = :teacher_status
                                WHERE teacher_id          = :teacher_id";
        $update = $pdo->prepare($sql_update_teacher);
        $update->execute([
          ":teacher_image" => $new_image,
          ":teacher_id" => $teacher_id,
          ":first_name" => $first_name,
          ":middle_name" => $middle_name,
          ":last_name" => $last_name,
          ":gender" => $gender,
          ":civil_status" => $civil_status,
          ":date_of_birth" => $date_of_birth,
          ":contact_number" => $contact_number,
          ":email_address" => $email_address,
          ":house_number" => $house_number,
          ":street" => $street,
          ":barangay" => $barangay,
          ":town" => $town,
          ":province" => $province,
          ":subject_to_teach" => $subject_to_teach,
          ":educational_attainment" => $educational_attainment,
          ":achievements" => $achievements,
          ":specialty" => $specialty,
          ":teaching_experience" => $teaching_experience,
          ":teacher_status" => $teacher_status
        ]);
        echo json_encode([
          "status" => "success",
          "message" => "Teacher" . $first_name . " " . $last_name . " updated."
        ]);
      } catch (\Throwable $error) {
        echo json_encode([
          "status" => "failed",
          "message" => "Updating teacher backend have error" . $error
        ]);
      }
      break;

    // =====> Get Teacher <===== \\
    case "getTeacher":
      $sql_get_teacher = "SELECT * FROM teachers WHERE teacher_id = :teacher_id";
      $get_teacher = $pdo->prepare($sql_get_teacher);
      $get_teacher->execute([":teacher_id" => $teacher_id]);
      $get_teacher_result = $get_teacher->fetch(PDO::FETCH_ASSOC);
      echo json_encode($get_teacher_result);
      break;


    case "searchTeacher":
      // =====> Base SQL <===== \\
      $sql_base = " FROM teachers WHERE 1=1";


      // =====> Filter Category and Searching <===== \\
      $params = [];
      if (!empty($sub_category) && $sub_category !== "") {
        if ($category === "Gender") {
          $sql_base .= " AND gender = :filter_gender";
          $params['filter_gender'] = $sub_category;
        } else if ($category === "Civil_Status") {
          $sql_base .= " AND civil_status = :filter_civil_status";
          $params['filter_civil_status'] = $sub_category;
        } else if ($category === "Status") {
          $sql_base .= " AND teacher_status = :filter_status";
          $params['filter_status'] = $sub_category;
        }
      }

      if (!empty($search_term)) {
        $sql_base .= " AND (
            teacher_number          LIKE :teacher_number           OR 
            first_name              LIKE :first_name               OR 
            middle_name             LIKE :middle_name              OR 
            last_name               LIKE :last_name                OR 
            gender                  LIKE :gender                   OR 
            civil_status            LIKE :civil_status             OR 
            date_of_birth           LIKE :date_of_birth            OR 
            contact_number          LIKE :contact_number           OR 
            email_address           LIKE :email_address            OR 
            house_number            LIKE :house_number             OR 
            street                  LIKE :street                   OR 
            barangay                LIKE :barangay                 OR 
            town                    LIKE :town                     OR 
            province                LIKE :province                 OR 
            educational_attainment  LIKE :educational_attainment   OR 
            achievements            LIKE :achievements             OR 
            subject_to_teach        LIKE :subject_to_teach         OR 
            specialty               LIKE :specialty                OR 
            teaching_experience     LIKE :teaching_experience      OR 
            teacher_status          LIKE :teacher_status           )";
        $params['teacher_number'] = "%$search_term%";
        $params['first_name'] = "%$search_term%";
        $params['middle_name'] = "%$search_term%";
        $params['last_name'] = "%$search_term%";
        $params['gender'] = "$search_term%";
        $params['civil_status'] = "%$search_term%";
        $params['date_of_birth'] = "%$search_term%";
        $params['contact_number'] = "%$search_term%";
        $params['email_address'] = "%$search_term%";
        $params['house_number'] = "%$search_term%";
        $params['street'] = "%$search_term%";
        $params['barangay'] = "%$search_term%";
        $params['town'] = "%$search_term%";
        $params['province'] = "%$search_term%";
        $params['educational_attainment'] = "%$search_term%";
        $params['achievements'] = "%$search_term%";
        $params['subject_to_teach'] = "%$search_term%";
        $params['specialty'] = "%$search_term%";
        $params['teaching_experience'] = "%$search_term%";
        $params['teacher_status'] = "%$search_term%";
      }

      // =====> Get Total Count <===== \\
      $sql_total = $pdo->prepare("SELECT COUNT(*) " . $sql_base);
      $sql_total->execute($params);
      $total = (int) $sql_total->fetchColumn();

      // =====> Fetch Paginate Record <===== \\
      $limit = isset($data['limit']) ? (int) $data['limit'] : 10;
      $page = isset($data['page']) ? (int) $data['page'] : 1;

      $page = max(1, $page);
      $offset = ($page - 1) * $limit;

      $sql_search_teacher = "SELECT * " . $sql_base;

      // =====> Sorting <===== \\
      $allowed_columns = [
        'teacher_number',
        'first_name',
        'last_name',
        'gender',
        'civil_status',
        'date_of_birth',
        'educational_attainment',
        'subject_to_teach',
        'specialty',
        'teaching_experience',
        'teacher_status',
        'achievements',
        'contact_number',
        'email_address',
        'province',
        'teacher_id'
      ];

      if (!in_array($sort_by, $allowed_columns)) {
        $sort_by = 'teacher_id';
      }

      $sort_order = strtoupper($sort_order) === 'ASC' ? 'ASC' : 'DESC';

      $sql_search_teacher .= " ORDER BY $sort_by $sort_order";

      $sql_search_teacher .= " LIMIT :limit OFFSET :offset";
      $params['limit'] = $limit;
      $params['offset'] = $offset;

      try {
        $teachers = $pdo->prepare($sql_search_teacher);
        $teachers->execute($params);
        $teacher_results = $teachers->fetchAll(PDO::FETCH_ASSOC);
        $last_page = ($limit > 0) ? (int) ceil($total / $limit) : 1;
        echo json_encode([
          'records' => $teacher_results,
          'total' => $total,
          'current_page' => $page,
          'last_page' => $last_page
        ]);
      } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
      }




      break;

    // =====> Get Teacher by Number <===== \\
    case "getTeacherByNumber":
      $sql_get_teacher_by_number = "SELECT * FROM teachers WHERE teacher_number = :teacher_number";
      $get_teacher_by_number = $pdo->prepare($sql_get_teacher_by_number);
      $get_teacher_by_number->execute([":teacher_number" => $teacher_number]);
      $teacher_by_number_result = $get_teacher_by_number->fetch(PDO::FETCH_ASSOC);
      echo json_encode($teacher_by_number_result);
      break;

    // =====> Get Section of Teacher <===== \\
    case "getTeacherInfo":
      $sql_get_teacher_info = "SELECT t.first_name AS teacher_firstname, 
                                      t.middle_name AS teacher_middlename, 
                                      t.last_name AS teacher_lastname, 
                                      s.first_name AS student_firstname, 
                                      s.middle_name AS student_middlename, 
                                      s.last_name AS student_lastname, 
                                      cm.curriculum_id, 
                                      cm.subject_code, 
                                      cm.subject_title, 
                                      sc.section_code, 
                                      e.school_year 
                                FROM teachers AS t 
                                  INNER JOIN sections AS sc 
                                    ON sc.teacher_number = t.teacher_number 
                                  INNER JOIN curriculums AS cm 
                                    ON cm.curriculum_id = sc.curriculum_id 
                                  INNER JOIN enrollments AS e 
                                    ON e.section_code = sc.section_code 
                                  INNER JOIN students AS s 
                                    ON s.student_number = e.student_number 
                                  INNER JOIN users AS u 
                                    ON u.user_code = t.user_code 
                                WHERE u.user_code = :user_code";
      $get_teacher_info = $pdo->prepare($sql_get_teacher_info);
      $get_teacher_info->execute([":user_code" => $user_code]);
      $get_teacher_info_result = $get_teacher_info->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($get_teacher_info_result);
      break;

    // =====> Fallback action <===== \\
    default:
      echo json_encode([
        "status" => "failed",
        "message" => "Invalid action"
      ]);
      exit;

  }
}


// SELECT e.enrollment_id, 
//                                       e.section_code, 
//                                       e.school_year, 
//                                       t.first_name, 
//                                       t.middle_name, 
//                                       s.last_name, 
//                                       cm.curriculum_id, 
//                                       cm.subject_code, 
//                                       cm.subject_title 
//                                 FROM enrollments AS e 
//                                   LEFT JOIN students AS s 
//                                     ON s.student_number = e.student_number 
//                                   LEFT JOIN sections AS sc 
//                                     ON sc.section_code = e.section_code 
//                                   LEFT JOIN curriculums AS cm 
//                                     ON cm.curriculum_id = sc.curriculum_id 
//                                   LEFT JOIN teachers AS t 
//                                     ON t.teacher_number = sc.teacher_number 
//                                   LEFT JOIN users AS u 
//                                     ON u.user_code = t.user_code 
//                                 WHERE t.user_code = :user_code