<?php

require "../connection.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$method = $_SERVER["REQUEST_METHOD"];
$data = json_decode(file_get_contents("php://input"), true);
$action = $data['action'] ?? null;

if ($method !== "POST") {
  echo json_encode(["status" => "failed", "message" => "Invalid request method."]);
  exit;
}

switch ($action) {
  case "getEnrolledStudents":
    $search_term = $data['searchTerm'] ?? '';
    $payment_status_filter = $data['paymentStatus'] ?? '';
    $page = $data['page'] ?? 1;
    $limit = $data['limit'] ?? 10;
    $offset = ($page - 1) * $limit;

    $sql_base = " FROM enrollments e
                  INNER JOIN students s ON e.student_number = s.student_number
                  LEFT JOIN (
                      SELECT enrollment_id, SUM(amount) as total_paid 
                      FROM payment_history 
                      GROUP BY enrollment_id
                  ) ph ON e.enrollment_id = ph.enrollment_id
                  LEFT JOIN (
                      SELECT course_code, education_level, year_level, semester, SUM(price) as total_assessment
                      FROM curriculums
                      GROUP BY course_code, education_level, year_level, semester
                  ) curr ON (e.course_code = curr.course_code 
                            AND e.education_level = curr.education_level 
                            AND e.year_level = curr.year_level 
                            AND e.semester = curr.semester)
                  WHERE e.enrollee_status = 'Enrolled'";

    $params = [];
    if (!empty($search_term)) {
      $sql_base .= " AND (s.first_name LIKE :search_fname OR s.last_name LIKE :search_lname OR CONCAT(s.first_name, ' ', s.last_name) LIKE :search_fullname OR e.student_number LIKE :search_studnum OR e.course_code LIKE :search_course)";
      $params[':search_fname'] = "%$search_term%";
      $params[':search_lname'] = "%$search_term%";
      $params[':search_fullname'] = "%$search_term%";
      $params[':search_studnum'] = "%$search_term%";
      $params[':search_course'] = "%$search_term%";
    }

    // Total count calculation with filtering
    try {
      $sql_filtered_count = "SELECT COUNT(*) FROM (
            SELECT e.enrollment_id,
                   IFNULL(ph.total_paid, 0) as total_paid,
                   IFNULL(curr.total_assessment, 0) as total_assessment,
                   CASE 
                       WHEN IFNULL(curr.total_assessment, 0) = 0 THEN 'Please fill up correct data on the curriculum to appear the price'
                       WHEN IFNULL(ph.total_paid, 0) >= IFNULL(curr.total_assessment, 0) THEN 'Paid'
                       WHEN IFNULL(ph.total_paid, 0) > 0 THEN 'Partial'
                       ELSE 'Unpaid'
                   END as calculated_status 
            $sql_base
        ) as t WHERE 1=1";

      if (!empty($payment_status_filter)) {
        $sql_filtered_count .= " AND calculated_status = :payment_status";
        $params[':payment_status'] = $payment_status_filter;
      }

      $stmt_count = $pdo->prepare($sql_filtered_count);
      $stmt_count->execute($params);
      $total = $stmt_count->fetchColumn();

      // Data with filtering
      $sql = "SELECT * FROM (
            SELECT e.*, s.first_name, s.middle_name, s.last_name, s.student_image, 
                   IFNULL(ph.total_paid, 0) as total_paid,
                   IFNULL(curr.total_assessment, 0) as total_assessment,
                   CASE 
                       WHEN IFNULL(curr.total_assessment, 0) = 0 THEN 'Please fill up correct data on the curriculum to appear the price'
                       WHEN IFNULL(ph.total_paid, 0) >= IFNULL(curr.total_assessment, 0) THEN 'Paid'
                       WHEN IFNULL(ph.total_paid, 0) > 0 THEN 'Partial'
                       ELSE 'Unpaid'
                   END as calculated_status 
            $sql_base
        ) as t WHERE 1=1";

      if (!empty($payment_status_filter)) {
        $sql .= " AND calculated_status = :payment_status";
      }

      $sql .= " ORDER BY enrollment_id DESC LIMIT $limit OFFSET $offset";

      $stmt = $pdo->prepare($sql);
      $stmt->execute($params);
      $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

      echo json_encode([
        "status" => "success",
        "records" => $records,
        "total" => $total,
        "current_page" => $page,
        "last_page" => ceil($total / $limit)
      ]);
    } catch (PDOException $e) {
      echo json_encode([
        "status" => "failed",
        "message" => "Database error: " . $e->getMessage()
      ]);
    }
    break;

  case "getPaymentDetails":
    $enrollment_id = $data['enrollment_id'] ?? null;
    if (!$enrollment_id) {
      echo json_encode(["status" => "failed", "message" => "Enrollment ID missing."]);
      exit;
    }

    // Fetch subjects and history
    // 1. Enrollment and Curriculum Details
    $sql_details = "SELECT e.*, 
                           s.first_name, s.last_name,
                           c.course_title,
                           cm.subject_code, cm.subject_title, cm.units, cm.price
                    FROM enrollments e
                    INNER JOIN students s ON e.student_number = s.student_number
                    LEFT JOIN courses c ON e.course_code = c.course_code
                    LEFT JOIN curriculums cm ON (e.course_code = cm.course_code 
                                              AND e.education_level = cm.education_level 
                                              AND e.year_level = cm.year_level 
                                              AND e.semester = cm.semester)
                    WHERE e.enrollment_id = :enrollment_id";

    $stmt_details = $pdo->prepare($sql_details);
    $stmt_details->execute([':enrollment_id' => $enrollment_id]);
    $details = $stmt_details->fetchAll(PDO::FETCH_ASSOC);

    // 2. Payment History
    $sql_history = "SELECT * FROM payment_history WHERE enrollment_id = :enrollment_id ORDER BY payment_date DESC";
    $stmt_history = $pdo->prepare($sql_history);
    $stmt_history->execute([':enrollment_id' => $enrollment_id]);
    $history = $stmt_history->fetchAll(PDO::FETCH_ASSOC);

    if (!$details) {
      echo json_encode(["status" => "failed", "message" => "Enrollment details not found."]);
      exit;
    }

    echo json_encode([
      "status" => "success",
      "data" => $details,
      "history" => $history
    ]);
    break;

  case "addPaymentTransaction":
    $enrollment_id = $data['enrollment_id'] ?? null;
    $amount = $data['amount'] ?? 0;
    $payment_method = $data['payment_method'] ?? '';
    $reference_no = $data['reference_no'] ?? '';
    $remarks = $data['remarks'] ?? '';

    if (!$enrollment_id || $amount <= 0) {
      echo json_encode(["status" => "failed", "message" => "Invalid payment data."]);
      exit;
    }

    try {
      $pdo->beginTransaction();

      // 1. Insert into history
      $sql_insert = "INSERT INTO payment_history (enrollment_id, amount, payment_method, reference_no, remarks) 
                     VALUES (:enrollment_id, :amount, :payment_method, :reference_no, :remarks)";
      $stmt_insert = $pdo->prepare($sql_insert);
      $stmt_insert->execute([
        ':enrollment_id' => $enrollment_id,
        ':amount' => $amount,
        ':payment_method' => $payment_method,
        ':reference_no' => $reference_no,
        ':remarks' => $remarks
      ]);

      // 2. Recalculate status
      // Get total assessment
      $sql_curr = "SELECT SUM(cm.price) as total_assessment
                   FROM enrollments e
                   INNER JOIN curriculums cm ON (e.course_code = cm.course_code 
                                              AND e.education_level = cm.education_level 
                                              AND e.year_level = cm.year_level 
                                              AND e.semester = cm.semester)
                   WHERE e.enrollment_id = :enrollment_id";
      $stmt_curr = $pdo->prepare($sql_curr);
      $stmt_curr->execute([':enrollment_id' => $enrollment_id]);
      $total_assessment = $stmt_curr->fetchColumn();

      // Get total paid
      $sql_paid = "SELECT SUM(amount) FROM payment_history WHERE enrollment_id = :enrollment_id";
      $stmt_paid = $pdo->prepare($sql_paid);
      $stmt_paid->execute([':enrollment_id' => $enrollment_id]);
      $total_paid = $stmt_paid->fetchColumn();

      if ($total_assessment == 0) {
        $new_status = 'Please fill up correct data on the curriculum to appear the price';
      } else if ($total_paid >= $total_assessment) {
        $new_status = 'Paid';
      } else if ($total_paid > 0) {
        $new_status = 'Partial';
      } else {
        $new_status = 'Unpaid';
      }

      // 3. Update enrollment
      $sql_update = "UPDATE enrollments SET payment_status = :status, updated_at = NOW() WHERE enrollment_id = :enrollment_id";
      $stmt_update = $pdo->prepare($sql_update);
      $stmt_update->execute([':status' => $new_status, ':enrollment_id' => $enrollment_id]);

      $pdo->commit();
      echo json_encode(["status" => "success", "message" => "Payment recorded successfully."]);
    } catch (Exception $e) {
      $pdo->rollBack();
      echo json_encode(["status" => "failed", "message" => "Error: " . $e->getMessage()]);
    }
    break;

  case "updatePaymentStatus":
    $enrollment_id = $data['enrollment_id'] ?? null;
    $payment_status = $data['payment_status'] ?? null;
    $remarks = $data['remarks'] ?? null;

    if (!$enrollment_id || !$payment_status) {
      echo json_encode(["status" => "failed", "message" => "Missing required fields."]);
      exit;
    }

    $sql = "UPDATE enrollments SET payment_status = :payment_status, remarks = :remarks, updated_at = NOW() WHERE enrollment_id = :enrollment_id";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
      ':payment_status' => $payment_status,
      ':remarks' => $remarks,
      ':enrollment_id' => $enrollment_id
    ]);

    if ($result) {
      echo json_encode(["status" => "success", "message" => "Payment status updated successfully."]);
    } else {
      echo json_encode(["status" => "failed", "message" => "Failed to update payment status."]);
    }
    break;

  default:
    echo json_encode(["status" => "failed", "message" => "Action not found."]);
    break;
}
