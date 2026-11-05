<?php
require "connection.php";

$first_names = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra"];
$last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"];
$middle_names = ["A.", "B.", "C.", "D.", "E.", "F.", "G.", "H.", "I.", "J.", "K.", "L.", "M.", "N.", "O.", "P.", "Q.", "R.", "S.", "T.", "U.", "V.", "W.", "X.", "Y.", "Z."];
$provinces = ["Cavite", "Laguna", "Batangas", "Rizal", "Quezon", "Metro Manila", "Bulacan", "Pampanga"];
$towns = ["City A", "City B", "Town C", "Town D", "Unified City E"];
$barangays = ["Barangay 1", "Barangay 2", "Santo Nino", "San Isidro", "Poblacion"];
$courses = ["BSIT", "BSCS", "BSIS", "BSEMC"];

// Start sequence for student number
$sql = $pdo->query("SELECT MAX(student_id) + 1 AS count FROM students");
$sql_count = $sql->fetch(PDO::FETCH_ASSOC);
$count = $sql_count['count'] ?? 1;

echo "Starting seed...\n";

for ($i = 0; $i < 100; $i++) {
  $code = str_pad($count + $i, 7, "0", STR_PAD_LEFT);
  $student_number = "atec-stdt-" . $code;

  $fname = $first_names[array_rand($first_names)];
  $lname = $last_names[array_rand($last_names)];
  $mname = $middle_names[array_rand($middle_names)];
  $gender = (rand(0, 1) == 0) ? "Male" : "Female";
  $dob = date("Y-m-d", strtotime("-" . rand(16, 25) . " years"));

  $contact = "09" . rand(100000000, 999999999);
  $email = strtolower($fname . "." . $lname . "@example.com");

  $guardian = $first_names[array_rand($first_names)] . " " . $lname;
  $g_contact = "09" . rand(100000000, 999999999);

  $province = $provinces[array_rand($provinces)];
  $town = $towns[array_rand($towns)];
  $barangay = $barangays[array_rand($barangays)];
  $street = "Street " . rand(1, 100);
  $house_no = rand(1, 500);

  // Insert Student
  try {
    $sql_insert = "INSERT INTO students (
            student_image, student_number, first_name, middle_name, last_name, gender, 
            date_of_birth, contact_number, email_address, guardian_name, guardian_number, 
            house_number, street_purok, barangay, town, province, student_status
        ) VALUES (
            :img, :sn, :fn, :mn, :ln, :gen, :dob, :cn, :email, :gn, :gcn, 
            :hn, :st, :brgy, :twn, :prov, :status
        )";

    $stmt = $pdo->prepare($sql_insert);
    $stmt->execute([
      ':img' => 'default.jpg',
      ':sn' => $student_number,
      ':fn' => $fname,
      ':mn' => $mname,
      ':ln' => $lname,
      ':gen' => $gender,
      ':dob' => $dob,
      ':cn' => $contact,
      ':email' => $email,
      ':gn' => $guardian,
      ':gcn' => $g_contact,
      ':hn' => $house_no,
      ':st' => $street,
      ':brgy' => $barangay,
      ':twn' => $town,
      ':prov' => $province,
      ':status' => 'Active'
    ]);

    $student_id = $pdo->lastInsertId();

    // Insert Enrollment
    $course = $courses[array_rand($courses)];
    $year = rand(1, 4) . ((rand(1, 4) == 1) ? "st" : ((rand(1, 4) == 2) ? "nd" : ((rand(1, 4) == 3) ? "rd" : "th"))) . " Year";
    $section = $course . "-" . rand(1, 4) . ((rand(0, 1) == 0) ? "A" : "B");
    $school_year = "2023-2024";
    $semester = (rand(0, 1) == 0) ? "1st Semester" : "2nd Semester";

    $sql_enroll = "INSERT INTO enrollments (
            student_number, education_level, course_code, year_level, semester, school_year, 
            section_code, date_enrolled, enrollee_status, payment_status, remarks, created_at
        ) VALUES (
            :sn, 'College', :course, :year, :sem, :sy, :sec, NOW(), 'Enrolled', 'Paid', 'Seeded', NOW()
        )";

    $stmt_enroll = $pdo->prepare($sql_enroll);
    $stmt_enroll->execute([
      ':sn' => $student_number,
      ':course' => $course,
      ':year' => $year,
      ':sem' => $semester,
      ':sy' => $school_year,
      ':sec' => $section
    ]);

    echo "Added: $fname $lname ($student_number)\n";

  } catch (PDOException $e) {
    echo "Error adding $fname $lname: " . $e->getMessage() . "\n";
  }
}

echo "Seeding complete.\n";
?>