<?php

require "../connection.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
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
$sort_by = $data['sortBy'] ?? 'admin_id';
$sort_order = $data['sortOrder'] ?? 'DESC';

$admin_id = $data['admin_id'] ?? null;
$admin_user_code = $data['admin_user_code'] ?? null;
$admin_number = $data['admin_number'] ?? null;
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
$created_at = $data['created_at'] ?? null;

$sql = $pdo->query("SELECT MAX(admin_id) + 1 AS count FROM admins");
$verify = $sql->fetch(PDO::FETCH_ASSOC);
$count = $verify['count'];
$code = str_pad($count, 7, "0", STR_PAD_LEFT);

function uploadImage($file)
{
  $targetDir = __DIR__ . "/../images/admins/";
  if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
  }

  $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
  $newName = uniqid("admin_", true) . "." . $ext;
  $targetFile = $targetDir . $newName;

  move_uploaded_file($file['tmp_name'], $targetFile);

  return $newName;
}



if ($method !== "POST") {
  // =====> Get all Admin Data <===== \\
  $sql_admin = "SELECT * FROM admins ORDER BY admin_id DESC";
  $admin = $pdo->query($sql_admin);
  $admin_results = $admin->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($admin_results);
} else {
  switch ($action) {

    // ==========> Insert New Admin <========== \\
    case "insertAdmin":
      try {
        // =====> Validate if admin exists <===== \\
        $sql = $pdo->prepare("SELECT * FROM admins WHERE 
                            admin_firstname  = :first_name AND 
                            admin_middlename = :middle_name AND 
                            admin_lastname   = :last_name");
        $sql->execute([
          ":first_name" => $first_name,
          ":middle_name" => $middle_name,
          ":last_name" => $last_name
        ]);
        if ($sql->rowCount() > 0) {
          echo json_encode([
            "status" => "failed",
            "message" => "Admin already exist."
          ]);
          exit;
        }

        $image_name = "default.jpg";

        // =====> Inserting SQL Query <===== \\
        $sql_insert = "INSERT INTO admins (
                            admin_user_code,
                            admin_image, 
                            admin_number, 
                            admin_firstname, 
                            admin_middlename, 
                            admin_lastname, 
                            admin_gender, 
                            admin_civil_status, 
                            admin_date_of_birth, 
                            admin_contact_number, 
                            admin_email_address, 
                            admin_house_number, 
                            admin_street, 
                            admin_barangay, 
                            admin_town, 
                            admin_province) 
                          VALUES (
                            :admin_user_code,
                            :admin_image, 
                            :admin_number, 
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
                            :province)";
        $insert = $pdo->prepare($sql_insert);
        // Generat a placeholder user code, user will get real one on registration or we update it? 
        // In users.php registration: $ettiquette . $user_code . $code
        // Teacher insertion used $code as teacher_number.
        // Let's use "i-campus-adm-" . $code for now or just null?
        // admins table has `admin_user_code`. `teachers` has `user_code` but `teachers.php` insert didn't insert `user_code`?
        // Let's check teachers.php insert again.
        // It Inserted: teacher_number, but NOT user_code.
        // `users` table linking happens via `user_code`.
        // `teachers` table has `user_code` column? `teachers.php` didn't insert it.
        // Ah, `users.php` calls `getUserProfileTeacher` joining `users.user_code = teachers.user_code`.
        // So `teachers` MUST have `user_code`.
        // But `teachers.php` insert logic did NOT insert `user_code`. It seems `user_code` in `teachers` table is updated LATER?
        // Or maybe my reading of `teachers.php` was incomplete.
        // Checking `teachers.php` lines 111-154... no `user_code`.
        // Checking `users.php`: `insertUser` inserts into `users` table. 
        // It checks if email exists in `teachers`.
        // It verifies, then inserts into `users`.
        // It does NOT update `teachers` table with the `user_code`.
        // So how are they linked? `users.user_code` = `teachers.user_code`.
        // If `teachers` table has null `user_code`, the join fails.
        // Maybe `teachers` table `user_code` is updated via a trigger or another process?
        // OR `users.php` `insertUser` is missing something in my memory.
        // Let's check `users.php` again.
        // It just inserts into `users`.
        // This is weird.
        // Maybe the `teachers` table `teacher_number` IS the `user_code`?
        // `users` table: `user_code` = `i-campus-prof-` + code.
        // `teachers` table: `teacher_number` = code (8 digits).
        // They are different.
        // Wait, `getUserProfileTeacher`: `ON u.user_code = t.user_code`.
        // This implies `t.user_code` matches `u.user_code`.
        // If `t.user_code` is empty, profile fetch fails.
        // I suspect `users.php` SHOULD update `teachers` table with `user_code` upon registration.
        // Let me check `users.php` lines 80-90.
        // It inserts into `users`. No update to `teachers`.
        // Maybe I missed a file or logic. Or maybe the system is broken?
        // BUT I must follow existing pattern.
        // If I assume `admins.php` follows `teachers.php`, I won't insert `admin_user_code` yet?
        // But `admins` table has `admin_user_code` as NOT NULL (from schema check).
        // `admin_user_code (varchar(50)) Null: NO`.
        // So I MUST insert something.
        // I'll insert a standard pattern: `i-campus-adm-` . $code.

        $generated_user_code = "i-campus-adm-" . $code;

        $insert->execute([
          ":admin_user_code" => $generated_user_code,
          ":admin_image" => $image_name,
          ":admin_number" => "atec-adm-" . $code,
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
          ":province" => $province
        ]);

        $admin_id = $pdo->lastInsertId();

        // =====> Image saved on the machine <===== \\
        if (!empty($_FILES['photo']['name'])) {
          $image_name = uploadImage($_FILES['photo']);
        }

        $update = $pdo->prepare("UPDATE admins SET admin_image = :admin_image WHERE admin_id = :admin_id");
        $update->execute([
          ":admin_image" => $image_name,
          ":admin_id" => $admin_id
        ]);

        echo json_encode([
          "status" => "success",
          "message" => "New admin successfully registered."
        ]);

      } catch (\Throwable $error) {
        echo json_encode([
          "status" => "failed",
          "message" => $error->getMessage()
        ]);
      }
      break;

    // =====> Update Admin Info <===== \\
    case "updateAdmin":
      try {

        $has_new_image = isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK;

        $fetch_old_image = $pdo->prepare("SELECT admin_image FROM admins WHERE admin_id = :admin_id");
        $fetch_old_image->execute([":admin_id" => $admin_id]);
        $old_image = $fetch_old_image->fetchColumn();

        $new_image = $old_image;

        if ($has_new_image) {
          if ($old_image && $old_image !== "default.jpg") {
            $old_file = __DIR__ . "/../images/admins/" . $old_image;
            if (file_exists($old_file)) {
              unlink($old_file);
            }
          }
          $new_image = uploadImage($_FILES['photo']);
        }

        $sql_update_admin = "UPDATE admins SET 
                                admin_image             = :admin_image, 
                                admin_firstname         = :first_name, 
                                admin_middlename        = :middle_name, 
                                admin_lastname          = :last_name, 
                                admin_gender            = :gender, 
                                admin_civil_status      = :civil_status, 
                                admin_date_of_birth     = :date_of_birth, 
                                admin_contact_number    = :contact_number, 
                                admin_email_address     = :email_address, 
                                admin_house_number      = :house_number, 
                                admin_street            = :street, 
                                admin_barangay          = :barangay, 
                                admin_town              = :town, 
                                admin_province          = :province
                                WHERE admin_id          = :admin_id";
        $update = $pdo->prepare($sql_update_admin);
        $update->execute([
          ":admin_image" => $new_image,
          ":admin_id" => $admin_id,
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
          ":province" => $province
        ]);
        echo json_encode([
          "status" => "success",
          "message" => "Admin " . $first_name . " " . $last_name . " updated."
        ]);
      } catch (\Throwable $error) {
        echo json_encode([
          "status" => "failed",
          "message" => "Updating admin backend error: " . $error->getMessage()
        ]);
      }
      break;

    // =====> Get Admin <===== \\
    case "getAdmin":
      $sql_get_admin = "SELECT * FROM admins WHERE admin_id = :admin_id";
      $get_admin = $pdo->prepare($sql_get_admin);
      $get_admin->execute([":admin_id" => $admin_id]);
      $get_admin_result = $get_admin->fetch(PDO::FETCH_ASSOC);
      echo json_encode($get_admin_result);
      break;


    case "searchAdmin":
      // =====> Base SQL <===== \\
      $sql_base = " FROM admins WHERE 1=1";


      // =====> Filter Category and Searching <===== \\
      $params = [];
      if (!empty($sub_category) && $sub_category !== "") {
        if ($category === "Gender") {
          $sql_base .= " AND admin_gender = :filter_gender";
          $params['filter_gender'] = $sub_category;
        } else if ($category === "Civil_Status") {
          $sql_base .= " AND admin_civil_status = :filter_civil_status";
          $params['filter_civil_status'] = $sub_category;
        }
      }

      if (!empty($search_term)) {
        $sql_base .= " AND (
            admin_number          LIKE :admin_number           OR 
            admin_firstname       LIKE :first_name             OR 
            admin_middlename      LIKE :middle_name            OR 
            admin_lastname        LIKE :last_name              OR 
            admin_gender          LIKE :gender                 OR 
            admin_civil_status    LIKE :civil_status           OR 
            admin_date_of_birth   LIKE :date_of_birth          OR 
            admin_contact_number  LIKE :contact_number         OR 
            admin_email_address   LIKE :email_address          OR 
            admin_house_number    LIKE :house_number           OR 
            admin_street          LIKE :street                 OR 
            admin_barangay        LIKE :barangay               OR 
            admin_town            LIKE :town                   OR 
            admin_province        LIKE :province               )";
        $params['admin_number'] = "%$search_term%";
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

      $sql_search_admin = "SELECT * " . $sql_base;

      // =====> Sorting <===== \\
      $allowed_columns = [
        'admin_number',
        'admin_firstname',
        'admin_lastname',
        'admin_gender',
        'admin_civil_status',
        'admin_date_of_birth',
        'admin_contact_number',
        'admin_email_address',
        'admin_province',
        'admin_id'
      ];

      if (!in_array($sort_by, $allowed_columns)) {
        $sort_by = 'admin_id';
      }

      $sort_order = strtoupper($sort_order) === 'ASC' ? 'ASC' : 'DESC';

      $sql_search_admin .= " ORDER BY $sort_by $sort_order";

      $sql_search_admin .= " LIMIT :limit OFFSET :offset";
      $params['limit'] = $limit;
      $params['offset'] = $offset;

      try {
        $admins = $pdo->prepare($sql_search_admin);
        $admins->execute($params);
        $admin_results = $admins->fetchAll(PDO::FETCH_ASSOC);
        $last_page = ($limit > 0) ? (int) ceil($total / $limit) : 1;
        echo json_encode([
          'records' => $admin_results,
          'total' => $total,
          'current_page' => $page,
          'last_page' => $last_page
        ]);
      } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
      }

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
?>