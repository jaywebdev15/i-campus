<?php

require "../connection.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$method = $_SERVER["REQUEST_METHOD"];
$data = json_decode(file_get_contents("php://input"), true);

$action = $data['action'] ?? null;

if ($method === "POST") {
  switch ($action) {
    case "registerStudent":
      try {
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

        // Check if student already exists
        $sql_check = $pdo->prepare("SELECT * FROM students WHERE 
                    first_name = :first_name AND 
                    last_name = :last_name AND 
                    date_of_birth = :date_of_birth");
        $sql_check->execute([
          ":first_name" => $first_name,
          ":last_name" => $last_name,
          ":date_of_birth" => $date_of_birth
        ]);

        if ($sql_check->rowCount() > 0) {
          echo json_encode([
            "status" => "failed",
            "message" => "Student profile already exists."
          ]);
          exit;
        }

        // Generate Student Number
        $sql_count = $pdo->query("SELECT IFNULL(MAX(student_id), 0) + 1 AS count FROM students");
        $sql_count_res = $sql_count->fetch(PDO::FETCH_ASSOC);
        $count = $sql_count_res['count'];
        $student_number = "atec-stdt-" . str_pad($count, 7, "0", STR_PAD_LEFT);

        $sql_insert = "INSERT INTO students (
                    student_image, student_number, first_name, middle_name, last_name, gender, 
                    date_of_birth, contact_number, email_address, guardian_name, 
                    guardian_number, house_number, street_purok, barangay, town, province, 
                    student_status
                ) VALUES (
                    '', :student_number, :first_name, :middle_name, :last_name, :gender, 
                    :date_of_birth, :contact_number, :email_address, :guardian_name, 
                    :guardian_number, :house_number, :street_purok, :barangay, :town, :province, 
                    'Active'
                )";

        $insert = $pdo->prepare($sql_insert);
        $insert->execute([
          ":student_number" => $student_number,
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
          ":province" => $province
        ]);

        // Send Email Notification
        $to = $email_address;
        $subject = "i-Campus Online Registration Successful";
        $message = "
        <html>
        <head>
        <title>i-Campus Registration</title>
        </head>
        <body>
        <h2>Welcome to i-Campus!</h2>
        <p>Dear $first_name $last_name,</p>
        <p>Your online registration was successful. Please keep your student number for your records and enrollment:</p>
        <p style='font-size: 1.2em; font-weight: bold; color: #2563eb;'>$student_number</p>
        <p>You can now proceed with your online enrollment using this number.</p>
        <br>
        <p>Best regards,<br>i-Campus Admissions Team</p>
        </body>
        </html>
        ";
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: <admissions@icampus.edu>" . "\r\n";

        @mail($to, $subject, $message, $headers);

        echo json_encode([
          "status" => "success",
          "message" => "Registration successful.",
          "student_number" => $student_number
        ]);

      } catch (\Throwable $error) {
        echo json_encode([
          "status" => "failed",
          "message" => $error->getMessage()
        ]);
      }
      break;

    case "enrollStudent":
      try {
        $student_number = $data['student_number'] ?? null;
        $education_level = $data['education_level'] ?? null;
        $course_code = $data['course_code'] ?? null;
        $year_level = $data['year_level'] ?? null;
        $semester = $data['semester'] ?? null;
        $school_year = $data['school_year'] ?? null;

        // Verify student exists
        $check_student = $pdo->prepare("SELECT * FROM students WHERE student_number = :student_number");
        $check_student->execute([":student_number" => $student_number]);
        if ($check_student->rowCount() === 0) {
          echo json_encode([
            "status" => "failed",
            "message" => "Student record not found."
          ]);
          exit;
        }

        // Check if already enrolled
        $check_enrollment = $pdo->prepare("SELECT * FROM enrollments WHERE 
                    student_number = :student_number AND 
                    school_year = :school_year AND 
                    semester = :semester");
        $check_enrollment->execute([
          ":student_number" => $student_number,
          ":school_year" => $school_year,
          ":semester" => $semester
        ]);

        if ($check_enrollment->rowCount() > 0) {
          echo json_encode([
            "status" => "failed",
            "message" => "Student is already enrolled for this term."
          ]);
          exit;
        }

        $sql_enroll = "INSERT INTO enrollments (
                    student_number, education_level, course_code, year_level, 
                    semester, school_year, enrollee_status, payment_status, date_enrolled, created_at
                ) VALUES (
                    :student_number, :education_level, :course_code, :year_level, 
                    :semester, :school_year, 'Pending', 'Unpaid', NOW(), NOW()
                )";

        $enroll = $pdo->prepare($sql_enroll);
        $enroll->execute([
          ":student_number" => $student_number,
          ":education_level" => $education_level,
          ":course_code" => $course_code,
          ":year_level" => $year_level,
          ":semester" => $semester,
          ":school_year" => $school_year
        ]);

        echo json_encode([
          "status" => "success",
          "message" => "Enrollment submitted successfully. Please wait for registrar approval."
        ]);

      } catch (\Throwable $error) {
        echo json_encode([
          "status" => "failed",
          "message" => $error->getMessage()
        ]);
      }
      break;

    case "getDropdownData":
      try {
        // Get Courses
        $sql_courses = $pdo->query("SELECT course_code, course_title, category FROM courses WHERE course_status = 'Active' OR course_status = 'Available'");
        $courses = $sql_courses->fetchAll(PDO::FETCH_ASSOC);

        // Get Education Levels (hardcoded based on current system)
        $levels = ["College", "Senior High", "TESDA"];

        echo json_encode([
          "status" => "success",
          "courses" => $courses,
          "levels" => $levels
        ]);
      } catch (\Throwable $error) {
        echo json_encode([
          "status" => "failed",
          "message" => $error->getMessage()
        ]);
      }
      break;

    default:
      echo json_encode([
        "status" => "failed",
        "message" => "Invalid action."
      ]);
      break;
  }
} else {
  echo json_encode([
    "status" => "failed",
    "message" => "Invalid request method."
  ]);
}
