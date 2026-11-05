<?php

session_start();

if (!isset($_SESSION)) {
  echo json_encode([
    "status" => "failed",
    "message" => "You are not logged in."
  ]);
  exit;

} else {

  require "../connection.php";

  header("Access-Control-Allow-Origin: *");
  header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
  header("Access-Control-Allow-Headers: Content-Type");
  header("Content-Type: application/json");

  $method = $_SERVER["REQUEST_METHOD"];

  $data = json_decode(file_get_contents("php://input"), true);

  $action = $data['action'] ?? null;

  $confirm_password = $data['confirmPassword'] ?? null;
  $old_password = $data['oldPassword'] ?? null;

  $user_id = $data['userId'] ?? $data['user_id'] ?? null;
  $user_code = $data['userCode'] ?? $data['user_code'] ?? null;
  $user_role = $data['userRole'] ?? $data['user_role'] ?? null;
  $email = $data['email'] ?? $data['user_email'] ?? null;
  $password = $data['password'] ?? null;
  $user_status = $data['userStatus'] ?? $data['user_status'] ?? null;

  $sql = $pdo->query("SELECT MAX(user_id) + 1 AS count FROM users");
  $sql_count = $sql->fetch(PDO::FETCH_ASSOC);
  $count = $sql_count['count'];
  $code = str_pad($count, 7, "0", STR_PAD_LEFT);

  if ($user_role === "Admin") {
    $ettiquette = "i-campus-adm-";
  } elseif ($user_role === "Registrar") {
    $ettiquette = "i-campus-reg-";
  } elseif ($user_role === "Teacher") {
    $ettiquette = "i-campus-prof-";
  } else {
    $ettiquette = "i-campus-stdt-";
  }

  if ($method !== "POST") {
    // =====> Get all the user data <===== \\
    $sql_users = "SELECT * FROM users";
    $users = $pdo->query($sql_users);
    $users_result = $users->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($users_result);
  } else {
    switch ($action) {

      // =====> Insert New User <===== \\
      case "insertUser":
        try {
          // =====> Insert Teacher <===== \\
          $sql_validate_email = "SELECT user_email FROM users WHERE user_email = :user_email";
          $validate_email = $pdo->prepare($sql_validate_email);
          $validate_email->execute([":user_email" => $email]);
          if ($validate_email->rowCount() > 0) {
            echo json_encode([
              "status" => "failed",
              "message" => "You have already registered."
            ]);
            exit;
          } else {
            if ($user_role === "Teacher") {
              $sql_validate_teacher = "SELECT email_address FROM teachers WHERE email_address = :email_address";
              $validate_teacher = $pdo->prepare($sql_validate_teacher);
              $validate_teacher->execute([":email_address" => $email]);
              if ($validate_teacher->rowCount() > 0) {
                $sql_insert_user_teacher = "INSERT INTO users (user_code, user_email, user_password, user_role, user_status)
                                    VALUES (:user_code, :user_email, :user_password, :user_role, :user_status)";
                $insert_user_teacher = $pdo->prepare($sql_insert_user_teacher);
                $hash_password = password_hash($password, PASSWORD_DEFAULT);
                $insert_user_teacher->execute([
                  ":user_code" => $ettiquette . $user_code . $code,
                  ":user_email" => $email,
                  ":user_password" => $hash_password,
                  ":user_role" => $user_role,
                  ":user_status" => "Pending",
                ]);

                // Update teachers table with the generated user_code
                $final_user_code = $ettiquette . $user_code . $code;
                $sql_update_teacher_code = "UPDATE teachers SET user_code = :user_code WHERE email_address = :email";
                $update_teacher_code = $pdo->prepare($sql_update_teacher_code);
                $update_teacher_code->execute([":user_code" => $final_user_code, ":email" => $email]);

                echo json_encode([
                  "status" => "success",
                  "message" => "You have successfully registered. But contact the admin first to get your account active."
                ]);
                exit;
              } else {
                echo json_encode([
                  "status" => "failed",
                  "message" => "Contact the admin first to register you in the system and now you can register."
                ]);
                exit;

              }
            } else if ($user_role === "Admin") {
              $sql_validate_admin = "SELECT admin_email_address FROM admins WHERE admin_email_address = :email_address";
              $validate_admin = $pdo->prepare($sql_validate_admin);
              $validate_admin->execute([":email_address" => $email]);
              if ($validate_admin->rowCount() > 0) {
                $final_user_code = $ettiquette . $user_code . $code;
                $sql_insert_user_admin = "INSERT INTO users (user_code, user_email, user_password, user_role, user_status)
                                    VALUES (:user_code, :user_email, :user_password, :user_role, :user_status)";
                $insert_user_admin = $pdo->prepare($sql_insert_user_admin);
                $hash_password = password_hash($password, PASSWORD_DEFAULT);
                $insert_user_admin->execute([
                  ":user_code" => $final_user_code,
                  ":user_email" => $email,
                  ":user_password" => $hash_password,
                  ":user_role" => $user_role,
                  ":user_status" => "Pending", // Or Active if you want admins to be active immediately? Usually Pending.
                ]);

                // Update admins table with the generated user_code
                $sql_update_admin_code = "UPDATE admins SET admin_user_code = :user_code WHERE admin_email_address = :email";
                $update_admin_code = $pdo->prepare($sql_update_admin_code);
                $update_admin_code->execute([":user_code" => $final_user_code, ":email" => $email]);

                echo json_encode([
                  "status" => "success",
                  "message" => "You have successfully registered. Contact system administrator for activation."
                ]);
                exit;
              } else {
                echo json_encode([
                  "status" => "failed",
                  "message" => "Email not found in Admin records."
                ]);
                exit;
              }

            } else if ($user_role === "Student") {
              $sql_validate_student = "SELECT email_address FROM students WHERE email_address = :email_address";
              $validate_student = $pdo->prepare($sql_validate_student);
              $validate_student->execute([":email_address" => $email]);
              if ($validate_student->rowCount() > 0) {
                $sql_insert_user_student = "INSERT INTO users (user_code, user_email, user_password, user_role, user_status) 
                                            VALUES (:user_code, :user_email, :user_password, :user_role, :user_status)";
                $insert_user_student = $pdo->prepare($sql_insert_user_student);
                $hash_password = password_hash($password, PASSWORD_DEFAULT);
                $insert_user_student->execute([
                  ":user_code" => $ettiquette . $user_code . $code,
                  ":user_email" => $email,
                  ":user_password" => $hash_password,
                  ":user_role" => $user_role,
                  ":user_status" => "Pending",
                ]);

                // Update students table with the generated user_code
                $final_user_code = $ettiquette . $user_code . $code;
                $sql_update_student_code = "UPDATE students SET user_code = :user_code WHERE email_address = :email";
                $update_student_code = $pdo->prepare($sql_update_student_code);
                $update_student_code->execute([":user_code" => $final_user_code, ":email" => $email]);

                echo json_encode([
                  "status" => "success",
                  "message" => "You have successfully registered. But contact the admin first to get your account active."
                ]);
                exit;
              } else {
                echo json_encode([
                  "status" => "failed",
                  "message" => "Contact the admin first to register you in the system and now you can register."
                ]);
                exit;
              }
            } else {
              echo json_encode([
                "status" => "failed",
                "message" => "Invalid role."
              ]);
            }
            exit;
          }
        } catch (\Throwable $error) {
          echo json_encode([
            "status" => "failed",
            "message" => "Server error" . $error->getMessage()
          ]);
        }
        break;

      // =====> Get User Data <===== \\
      case "getUser":
        $sql_get_user = "SELECT * FROM users WHERE user_id = :user_id";
        $get_user = $pdo->prepare($sql_get_user);
        $get_user->execute([":user_id" => $user_id]);
        $get_user_result = $get_user->fetch(PDO::FETCH_ASSOC);
        echo json_encode($get_user_result);
        break;

      // =====> Logout User <===== \\
      case "logoutUser":
        $_SESSION = [];

        if (session_id() != "" || isset($_COOKIE[session_name()])) {
          setcookie(session_name(), '', time() - 3600, '/');
        }

        session_destroy();

        echo json_encode([
          "status" => "success",
          "message" => "Logout successful"
        ]);

        break;

      // =====> Get User Profile <===== \\
      case "getUserProfileAdmin":
        $sql_get_user_profile = "SELECT * FROM users AS u
                                  INNER JOIN admins AS a 
                                  ON u.user_code = a.admin_user_code 
                                  WHERE u.user_code = :user_code";
        $get_user_profile = $pdo->prepare($sql_get_user_profile);
        $get_user_profile->execute([":user_code" => $user_code]);
        $get_user_profile_result = $get_user_profile->fetch(PDO::FETCH_ASSOC);
        echo json_encode($get_user_profile_result);
        break;

      // =====> Get User Profile <===== \\
      case "getUserProfileTeacher":
        $sql_get_user_profile = "SELECT * FROM users AS u
                                  INNER JOIN teachers AS t 
                                  ON (u.user_code = t.user_code OR u.user_email = t.email_address)
                                  INNER JOIN sections AS se 
                                  ON se.teacher_number = t.teacher_number 
                                  WHERE u.user_code = :user_code";
        $get_user_profile = $pdo->prepare($sql_get_user_profile);
        $get_user_profile->execute([":user_code" => $user_code]);
        $get_user_profile_result = $get_user_profile->fetch(PDO::FETCH_ASSOC);
        echo json_encode($get_user_profile_result);
        break;

      // =====> Get User Profile <===== \\
      case "getUserprofileStudent":
        $sql_get_user_profile = "SELECT u.*, 
                                        s.student_image, 
                                        s.student_number, 
                                        s.first_name, 
                                        s.middle_name, 
                                        s.last_name, 
                                        s.gender, 
                                        s.date_of_birth, 
                                        s.contact_number, 
                                        s.email_address, 
                                        s.house_number, 
                                        s.street_purok, 
                                        s.barangay, 
                                        s.town, 
                                        s.province, 
                                        s.guardian_name, 
                                        s.guardian_number, 
                                        e.education_level, 
                                        e.course_code, 
                                        e.year_level, 
                                        e.semester, 
                                        e.school_year, 
                                        e.section_code, 
                                        e.enrollee_status 
                                  FROM users AS u
                                    LEFT JOIN students AS s 
                                      ON (s.user_code = u.user_code OR s.email_address = u.user_email)
                                    LEFT JOIN enrollments AS e 
                                      ON e.student_number = s.student_number 
                                    WHERE u.user_code = :user_code 
                                  ORDER BY semester, year_level, school_year DESC";
        $get_user_profile = $pdo->prepare($sql_get_user_profile);
        $get_user_profile->execute([":user_code" => $user_code]);
        $get_user_profile_results = $get_user_profile->fetchAll(PDO::FETCH_ASSOC);
        $personal_info = null;
        $enrollment_detail = [];
        foreach ($get_user_profile_results as $get_user_profile_result) {
          if ($personal_info === null) {
            $personal_info = [
              "student_image" => $get_user_profile_result['student_image'],
              "student_number" => $get_user_profile_result['student_number'],
              "first_name" => $get_user_profile_result['first_name'],
              "middle_name" => $get_user_profile_result['middle_name'],
              "last_name" => $get_user_profile_result['last_name'],
              "gender" => $get_user_profile_result['gender'],
              "date_of_birth" => $get_user_profile_result['date_of_birth'],
              "contact_number" => $get_user_profile_result['contact_number'],
              "email_address" => $get_user_profile_result['email_address'],
              "house_number" => $get_user_profile_result['house_number'],
              "street_purok" => $get_user_profile_result['street_purok'],
              "barangay" => $get_user_profile_result['barangay'],
              "town" => $get_user_profile_result['town'],
              "province" => $get_user_profile_result['province'],
              "guardian_name" => $get_user_profile_result['guardian_name'],
              "guardian_number" => $get_user_profile_result['guardian_number'],
            ];
          }
          if (!empty($get_user_profile_result['student_number'])) {
            $enrollment_detail[] = [
              "education_level" => $get_user_profile_result['education_level'],
              "course_code" => $get_user_profile_result['course_code'],
              "year_level" => $get_user_profile_result['year_level'],
              "semester" => $get_user_profile_result['semester'],
              "school_year" => $get_user_profile_result['school_year'],
              "section_code" => $get_user_profile_result['section_code'],
              "enrollee_status" => $get_user_profile_result['enrollee_status'],
            ];
          }
        }
        echo json_encode([
          "personal_info" => $personal_info,
          "enrollment_detail" => $enrollment_detail,
        ]);
        break;

      // =====> Change Password <===== \\
      case "changePassword":
        if (empty($old_password) || empty($password) || empty($confirm_password)) {
          echo json_encode([
            "status" => "failed",
            "message" => "Please fill all the fields."
          ]);
          exit;
        }
        $sql_verify_user = "SELECT * FROM users WHERE user_code = :user_code";
        $verify_user = $pdo->prepare($sql_verify_user);
        $verify_user->execute([":user_code" => $user_code]);
        $user = $verify_user->fetch();
        if (!password_verify($old_password, $user['user_password'])) {
          echo json_encode([
            "status" => "failed",
            "message" => "Incorrect password.",
          ]);
          exit;
        }
        $sql_update_password = "UPDATE users SET user_password = :user_password WHERE user_code = :user_code";
        $update_password = $pdo->prepare($sql_update_password);
        $update_password->execute([
          ":user_code" => $user_code,
          ":user_password" => password_hash($password, PASSWORD_DEFAULT),
        ]);
        echo json_encode([
          "status" => "success",
          "message" => "Password changed successfully."
        ]);
        break;
      // =====> Search User with Pagination <===== \\
      case "searchUser":
        $page = $data['page'] ?? 1;
        $limit = 10;
        $offset = ($page - 1) * $limit;
        $search_term = $data['searchTerm'] ?? '';
        $category = $data['category'] ?? ''; // e.g., Filter by Role or Status
        $sub_category = $data['subCategory'] ?? '';

        $conditions = [];
        $params = [];

        // Search Term
        if (!empty($search_term)) {
          $conditions[] = "(u.user_code LIKE :search_code OR u.user_email LIKE :search_email OR u.user_role LIKE :search_role)";
          $params[':search_code'] = "%$search_term%";
          $params[':search_email'] = "%$search_term%";
          $params[':search_role'] = "%$search_term%";
        }

        // Filtering
        if (!empty($category) && !empty($sub_category)) {
          if ($category === 'Role') {
            $conditions[] = "u.user_role = :role";
            $params[':role'] = $sub_category;
          } elseif ($category === 'Status') {
            $conditions[] = "u.user_status = :status";
            $params[':status'] = $sub_category;
          }
        }

        $whereClause = "";
        if (count($conditions) > 0) {
          $whereClause = " WHERE " . implode(" AND ", $conditions);
        }

        // Count Total
        $sql_count = "SELECT COUNT(*) as total FROM users u" . $whereClause;
        $stmt_count = $pdo->prepare($sql_count);
        $stmt_count->execute($params);
        $total_records = $stmt_count->fetch(PDO::FETCH_ASSOC)['total'];
        $total_pages = ceil($total_records / $limit);

        // Fetch Data
        // Joined with admins, teachers, students to get consolidated name
        $sql_users = "SELECT u.*, 
                      COALESCE(
                          CONCAT(a.admin_firstname, ' ', a.admin_lastname),
                          CONCAT(t.first_name, ' ', t.last_name),
                          CONCAT(s.first_name, ' ', s.last_name)
                      ) AS full_name
                      FROM users AS u 
                      LEFT JOIN admins AS a ON u.user_code = a.admin_user_code 
                      LEFT JOIN teachers AS t ON u.user_code = t.user_code 
                      LEFT JOIN students AS s ON u.user_code = s.user_code 
                      " . $whereClause . " ORDER BY u.user_id DESC LIMIT :limit OFFSET :offset";

        $stmt = $pdo->prepare($sql_users);
        foreach ($params as $key => $value) {
          $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
          "records" => $records,
          "total" => $total_records,
          "current_page" => intval($page),
          "last_page" => $total_pages
        ]);
        break;

      // =====> Update User <===== \\
      case "updateUser":
        try {
          $sql_update = "UPDATE users SET user_email = :email, user_role = :role, user_status = :status WHERE user_id = :user_id";
          $stmt = $pdo->prepare($sql_update);
          $stmt->execute([
            ":email" => $email,
            ":role" => $user_role,
            ":status" => $user_status,
            ":user_id" => $user_id
          ]);

          // Password update is handled separately or can be added here if needed, but existing uses changePassword

          echo json_encode([
            "status" => "success",
            "message" => "User updated successfully."
          ]);
        } catch (\Throwable $error) {
          echo json_encode([
            "status" => "failed",
            "message" => "Error updating user: " . $error->getMessage()
          ]);
        }
        break;

      // =====> Delete User <===== \\
      case "deleteUser":
        try {
          $sql_delete = "DELETE FROM users WHERE user_id = :user_id";
          $stmt = $pdo->prepare($sql_delete);
          $stmt->execute([":user_id" => $user_id]);

          echo json_encode([
            "status" => "success",
            "message" => "User deleted successfully."
          ]);
        } catch (\Throwable $error) {
          echo json_encode([
            "status" => "failed",
            "message" => "Error deleting user: " . $error->getMessage()
          ]);
        }
        break;

    }
  }
}