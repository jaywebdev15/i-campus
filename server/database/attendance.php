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

  $data = json_decode(file_get_contents("php://input"), true);

  $action = $data['action'] ?? null;

  $search_term = $data['searchTerm'] ?? null;

  $user_code = $data['userCode'] ?? null;
  $from_date = $data['fromDate'] ?? null;
  $to_date = $data['toDate'] ?? null;

  $attendance_id = $data['attendance_id'] ?? null;
  $student_number = $data['student_number'] ?? null;
  $subject_code = $data['subject_code'] ?? null;
  $teacher_id = $data['teacher_id'] ?? null;
  $attendance_date = $data['attendance_date'] ?? null;
  $time_in = $data['time_in'] ?? null;
  $time_out = $data['time_out'] ?? null;
  $attendance_status = $data['attendance_status'] ?? null;
  $remarks = $data['remarks'] ?? null;
  $recorded_by = $data['recorded_by'] ?? null;
  $created_at = $data['created_at'] ?? null;

  if ($method !== "POST") {

    // =====> Get all the attendance <===== \\
    $sql_attendance = "SELECT a.*, 
                              s.student_image, 
                              s.student_number, 
                              s.first_name AS student_firstname, 
                              s.last_name AS student_lastname, 
                              t.first_name AS teacher_firstname, 
                              t.last_name AS teacher_lastname 
                        FROM attendance AS a 
                          LEFT JOIN students AS s 
                            ON s.student_number = a.student_number 
                          LEFT JOIN users AS u 
                            ON u.user_code = a.teacher_id
                          LEFT JOIN teachers AS t 
                            ON t.user_code = u.user_code 
                        ORDER BY a.attendance_date DESC, a.time_in DESC, a.attendance_id DESC";
    $attendance = $pdo->query($sql_attendance);
    $attendance_results = $attendance->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($attendance_results);

  }
  else {

    switch ($action) {

      // ======> Log Attendance <===== \\
      case "logAttendance":
        try {
          $verify_student = $pdo->prepare("SELECT * FROM students WHERE student_number = :student_number");
          $verify_student->execute([":student_number" => $student_number]);
          if ($verify_student->rowCount() > 0) {
            try {
              $sql_verify_timeout = "SELECT * FROM attendance WHERE 
                                    student_number  = :student_number AND 
                                    subject_code    = :subject_code   AND 
                                    teacher_id      = :teacher_id     AND 
                                    attendance_date = :attendance_date";
              $verify_timeout = $pdo->prepare($sql_verify_timeout);
              $verify_timeout->execute([
                ":student_number" => $student_number,
                ":subject_code" => $subject_code,
                ":teacher_id" => $teacher_id,
                ":attendance_date" => $attendance_date
              ]);
              if ($verify_timeout->rowCount() > 0) {
                try {
                  // =====> Time Out <===== \\
                  $sql_timeout = "UPDATE attendance SET 
                                  time_out  = :time_out, 
                                  remarks   = :remarks WHERE 
                                  student_number  = :student_number AND 
                                  subject_code    = :subject_code   AND 
                                  teacher_id      = :teacher_id     AND 
                                  attendance_date = :attendance_date";
                  $timeout = $pdo->prepare($sql_timeout);
                  $timeout->execute([
                    ":time_out" => $time_out,
                    ":student_number" => $student_number,
                    ":subject_code" => $subject_code,
                    ":teacher_id" => $teacher_id,
                    ":remarks" => "Time Out",
                    ":attendance_date" => $attendance_date
                  ]);
                  echo json_encode([
                    "status" => "success",
                    "message" => $student_number . " time out."
                  ]);
                }
                catch (\Throwable $error) {
                  echo json_encode([
                    "status" => "failed",
                    "message" => "Error in timeout" . $error->getMessage()
                  ]);
                }
              }
              else {
                // =====> Time In <===== \\
                $sql_insert_attendance = "INSERT INTO attendance (
                                            student_number, 
                                            subject_code, 
                                            teacher_id, 
                                            attendance_date, 
                                            time_in, 
                                            attendance_status, 
                                            remarks, 
                                            recorded_by, 
                                            created_at)
                                          VALUES (
                                            :student_number, 
                                            :subject_code, 
                                            :teacher_id, 
                                            :attendance_date, 
                                            :time_in, 
                                            :attendance_status, 
                                            :remarks, 
                                            :recorded_by, 
                                            :created_at)";
                $insert_attendance = $pdo->prepare($sql_insert_attendance);
                $insert_attendance->execute([
                  ":student_number" => $student_number,
                  ":subject_code" => $subject_code,
                  ":teacher_id" => $teacher_id,
                  ":attendance_date" => $attendance_date,
                  ":time_in" => $time_in,
                  ":attendance_status" => $attendance_status,
                  ":remarks" => "Time In",
                  ":recorded_by" => $recorded_by,
                  ":created_at" => $created_at
                ]);
                echo json_encode([
                  "status" => "success",
                  "message" => $student_number . " time in."
                ]);
              }
            }
            catch (\Throwable $error) {
              echo json_encode([
                "status" => "failed",
                "message" => "Error in verifying attendance log"
              ]);
            }
          }
          else {
            echo json_encode([
              "status" => "failed",
              "message" => "Student doesn't exist"
            ]);
          }
        }
        catch (\Throwable $th) {
          echo json_encode([
            "status" => "failed",
            "message" => "Error in verifying student."
          ]);
        }
        break;

      // =====> Search Attendance <===== \\
      case "searchAttendance":
        $sql_search_attendance = "SELECT a.*, s.student_number, s.first_name, s.last_name FROM 
                                  attendance AS a INNER JOIN students AS s ON a.student_number = s.student_number WHERE 1=1";
        $params = [];
        $sql_search_attendance .= " AND (
          s.student_number    LIKE :student_number    OR 
          s.first_name        LIKE :first_name        OR 
          s.last_name         LIKE :last_name         OR 
          a.attendance_date   LIKE :attendance_date   OR 
          a.attendance_status LIKE :attendance_status )";
        $params["student_number"] = "%$search_term%";
        $params["first_name"] = "%$search_term%";
        $params["last_name"] = "%$search_term%";
        $params["attendance_date"] = "%$search_term%";
        $params["attendance_status"] = "%$search_term%";
        $sql_search_attendance .= " ORDER BY a.attendance_date DESC, a.time_in DESC, a.attendance_id DESC";
        $search_attendance = $pdo->prepare($sql_search_attendance);
        $search_attendance->execute($params);
        $search_attendance_results = $search_attendance->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($search_attendance_results);
        break;

      // =====> Get Student Attendance By Teacher<===== \\
      case "getStudentAttendanceByTeacher":
        $page = $data['page'] ?? 1;
        $limit = isset($data['limit']) ? (int)$data['limit'] : 10;
        $offset = ($page - 1) * $limit;
        $category = $data['category'] ?? null;
        $subCategory = $data['subCategory'] ?? null;

        $conditions = [];
        $params = [];

        $conditions[] = "a.teacher_id = :user_code";
        $params[':user_code'] = $user_code;

        // Search Term Logic
        if (!empty($search_term)) {
          $conditions[] = "(
              s.student_number LIKE :search_num OR 
              s.first_name LIKE :search_first OR 
              s.last_name LIKE :search_last OR 
              a.subject_code LIKE :search_subj
             )";
          $term = "%$search_term%";
          $params[':search_num'] = $term;
          $params[':search_first'] = $term;
          $params[':search_last'] = $term;
          $params[':search_subj'] = $term;
        }

        // Filter Logic (Remarks -> attendance_status)
        if (!empty($category) && !empty($subCategory)) {
          if ($category === "Remarks") {
            $conditions[] = "a.attendance_status = :subCategory";
            $params[':subCategory'] = $subCategory;
          }
        }

        if (!empty($from_date) && !empty($to_date)) {
          $conditions[] = "a.attendance_date BETWEEN :from_date AND :to_date";
          $params[':from_date'] = $from_date;
          $params[':to_date'] = $to_date;
        }
        else if (!empty($from_date)) {
          $conditions[] = "a.attendance_date >= :from_date";
          $params[':from_date'] = $from_date;
        }
        else if (!empty($to_date)) {
          $conditions[] = "a.attendance_date <= :to_date";
          $params[':to_date'] = $to_date;
        }

        $whereClause = "";
        if (count($conditions) > 0) {
          $whereClause = " AND " . implode(" AND ", $conditions);
        }

        // Count Query
        $sql_count = "SELECT COUNT(*) as total 
                        FROM attendance AS a 
                          LEFT JOIN students AS s ON s.student_number = a.student_number 
                          LEFT JOIN users AS u ON u.user_code = a.teacher_id
                          LEFT JOIN teachers AS t ON t.user_code = u.user_code 
                        WHERE 1=1" . $whereClause;
        $stmt_count = $pdo->prepare($sql_count);
        $stmt_count->execute($params);
        $total_records = $stmt_count->fetch(PDO::FETCH_ASSOC)['total'];
        $total_pages = ceil($total_records / $limit);

        // Main Query
        $sql_get_attendance = "SELECT a.*, 
                                      s.student_image, 
                                      s.student_number, 
                                      s.first_name AS student_firstname, 
                                      s.last_name AS student_lastname, 
                                      t.first_name AS teacher_firstname, 
                                      t.last_name AS teacher_lastname 
                                FROM attendance AS a 
                                  LEFT JOIN students AS s 
                                    ON s.student_number = a.student_number 
                                  LEFT JOIN users AS u 
                                    ON u.user_code = a.teacher_id
                                  LEFT JOIN teachers AS t 
                                    ON t.user_code = u.user_code 
                                WHERE 1=1" . $whereClause;

        $sortBy = $data['sortBy'] ?? 'attendance_date';
        $sortOrder = $data['sortOrder'] ?? 'DESC';
        $validSortOrder = strtoupper($sortOrder) === 'ASC' ? 'ASC' : 'DESC';

        // Map frontend sort columns to database columns if needed (optional but good practice)
        // For simplicity, assuming frontend sends valid column names or close enough for now, 
        // but 'attendance_id' is default.

        if ($sortBy === 'attendance_date') {
          $sql_get_attendance .= " ORDER BY a.attendance_date $validSortOrder, a.time_in $validSortOrder, a.attendance_id $validSortOrder";
        }
        else {
          $sql_get_attendance .= " ORDER BY $sortBy $validSortOrder, a.attendance_date DESC, a.time_in DESC";
        }
        $sql_get_attendance .= " LIMIT $limit OFFSET $offset";

        $get_attendance = $pdo->prepare($sql_get_attendance);
        $get_attendance->execute($params);
        $get_attendance_results = $get_attendance->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
          "records" => $get_attendance_results,
          "total" => $total_records,
          "current_page" => intval($page),
          "last_page" => $total_pages
        ]);
        break;

      // =====> Get All Attendance (Admin) <===== \\
      case "getAllAttendance":
        $page = $data['page'] ?? 1;
        $limit = 10;
        $offset = ($page - 1) * $limit;
        $category = $data['category'] ?? null;
        $subCategory = $data['subCategory'] ?? null;

        $conditions = [];
        $params = [];

        // Search Term Logic
        if (!empty($search_term)) {
          $conditions[] = "(
              s.student_number LIKE :search_num OR 
              s.first_name LIKE :search_first OR 
              s.last_name LIKE :search_last OR 
              a.subject_code LIKE :search_subj
             )";
          $term = "%$search_term%";
          $params[':search_num'] = $term;
          $params[':search_first'] = $term;
          $params[':search_last'] = $term;
          $params[':search_subj'] = $term;
        }

        // Filter Logic (Remarks -> attendance_status)
        if (!empty($category) && !empty($subCategory)) {
          if ($category === "Remarks") {
            $conditions[] = "a.attendance_status = :subCategory";
            $params[':subCategory'] = $subCategory;
          }
        }

        if (!empty($from_date) && !empty($to_date)) {
          $conditions[] = "a.attendance_date BETWEEN :from_date AND :to_date";
          $params[':from_date'] = $from_date;
          $params[':to_date'] = $to_date;
        }
        else if (!empty($from_date)) {
          $conditions[] = "a.attendance_date >= :from_date";
          $params[':from_date'] = $from_date;
        }
        else if (!empty($to_date)) {
          $conditions[] = "a.attendance_date <= :to_date";
          $params[':to_date'] = $to_date;
        }

        $whereClause = "";
        if (count($conditions) > 0) {
          $whereClause = " WHERE " . implode(" AND ", $conditions);
        }

        // Count Query
        $sql_count = "SELECT COUNT(*) as total 
                        FROM attendance AS a 
                          LEFT JOIN students AS s ON s.student_number = a.student_number 
                          LEFT JOIN users AS u ON u.user_code = a.teacher_id
                          LEFT JOIN teachers AS t ON t.user_code = u.user_code " . $whereClause;
        $stmt_count = $pdo->prepare($sql_count);
        $stmt_count->execute($params);
        $total_records = $stmt_count->fetch(PDO::FETCH_ASSOC)['total'];
        $total_pages = ceil($total_records / $limit);

        // Main Query
        $sql_get_attendance = "SELECT a.*, 
                                      s.student_image, 
                                      s.student_number, 
                                      s.first_name AS student_firstname, 
                                      s.last_name AS student_lastname, 
                                      t.first_name AS teacher_firstname, 
                                      t.last_name AS teacher_lastname 
                                FROM attendance AS a 
                                  LEFT JOIN students AS s 
                                    ON s.student_number = a.student_number 
                                  LEFT JOIN users AS u 
                                    ON u.user_code = a.teacher_id
                                  LEFT JOIN teachers AS t 
                                    ON t.user_code = u.user_code " . $whereClause;

        $sortBy = $data['sortBy'] ?? 'attendance_date';
        $sortOrder = $data['sortOrder'] ?? 'DESC';
        $validSortOrder = strtoupper($sortOrder) === 'ASC' ? 'ASC' : 'DESC';

        if ($sortBy === 'attendance_date') {
          $sql_get_attendance .= " ORDER BY a.attendance_date $validSortOrder, a.time_in $validSortOrder, a.attendance_id $validSortOrder";
        }
        else {
          $sql_get_attendance .= " ORDER BY $sortBy $validSortOrder, a.attendance_date DESC, a.time_in DESC";
        }
        $sql_get_attendance .= " LIMIT $limit OFFSET $offset";

        $get_attendance = $pdo->prepare($sql_get_attendance);
        $get_attendance->execute($params);
        $get_attendance_results = $get_attendance->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
          "records" => $get_attendance_results,
          "total" => $total_records,
          "current_page" => intval($page),
          "last_page" => $total_pages
        ]);
        break;

      // =====> Get Student Attendance <===== \\
      case "getStudentAttendance":
        $sql_get_attendance = "SELECT a.* 
                                FROM attendance AS a 
                                  INNER JOIN students AS s 
                                    ON a.student_number = s.student_number 
                                  INNER JOIN users AS u 
                                    ON u.user_code = s.user_code 
                                WHERE 1=1";
        $params = [];

        $sql_get_attendance .= " AND s.user_code = :user_code";
        $params['user_code'] = $user_code;

        if (!empty($from_date) && !empty($to_date)) {
          $sql_get_attendance .= " AND a.attendance_date BETWEEN :from_date AND :to_date";
          $params['from_date'] = $from_date;
          $params['to_date'] = $to_date;
        }
        else if (!empty($from_date)) {
          $sql_get_attendance .= " AND a.attendance_date >= :from_date";
          $params['from_date'] = $from_date;
        }
        else if (!empty($to_date)) {
          $sql_get_attendance .= " AND a.attendance_date <= :to_date";
          $params['to_date'] = $to_date;
        }

        $sql_get_attendance .= " ORDER BY a.attendance_date DESC, a.time_in DESC, a.attendance_id DESC";
        $get_attendance = $pdo->prepare($sql_get_attendance);
        $get_attendance->execute($params);
        $get_attendance_results = $get_attendance->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($get_attendance_results);
        break;


    }
  }
}