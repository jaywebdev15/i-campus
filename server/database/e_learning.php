<?php

require "../connection.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$method = $_SERVER["REQUEST_METHOD"];

$data = json_decode(file_get_contents("php://input"), true);
if (json_last_error() !== JSON_ERROR_NONE) {
  if (!empty($_POST)) {
    $data = $_POST;
  } else {
    // Check if content length is set and greater than 0, implying post_max_size exceeded
    $contentLength = $_SERVER['CONTENT_LENGTH'] ?? 0;
    if ($contentLength > 0 && empty($_POST) && empty($_FILES)) {
      echo json_encode([
        "status" => "failed",
        "message" => "File upload exceeds maximum allowed size (" . ini_get('post_max_size') . ")."
      ]);
      exit;
    }
    $data = [];
  }
}

$action = $data['action'] ?? null;
$e_learning_id = $data['e_learning_id'] ?? null;
// ... (rest of variable init)

if ($method !== "POST") {
  // ... (GET logic)
} else {
  if (!$action) {
    echo json_encode(["status" => "failed", "message" => "No action provided or invalid data."]);
    exit;
  }
  try {
    switch ($action) {
      // ...

      // =====> Get E-Learnings (Search & Sort) <===== \\
      case "getELearnings":
        $search_term = $data['searchTerm'] ?? null;
        $page = $data['page'] ?? 1;
        $limit = isset($data['limit']) ? (int) $data['limit'] : 1000000;
        $offset = ($page - 1) * $limit;

        $sortBy = $data['sortBy'] ?? 'e_learning_id';
        $sortOrder = $data['sortOrder'] ?? 'DESC';
        $validSortOrder = strtoupper($sortOrder) === 'ASC' ? 'ASC' : 'DESC';

        $conditions = [];
        $params = [];

        if (!empty($search_term)) {
          $conditions[] = "(
              el.e_learning_title LIKE :search_title OR 
              cm.subject_code LIKE :search_code OR 
              cm.subject_title LIKE :search_subj OR 
              cm.category LIKE :search_cat
           )";
          $term = "%$search_term%";
          $params[':search_title'] = $term;
          $params[':search_code'] = $term;
          $params[':search_subj'] = $term;
          $params[':search_cat'] = $term;
        }

        $whereClause = "";
        if (count($conditions) > 0) {
          $whereClause = " WHERE " . implode(" AND ", $conditions);
        }

        $sql = "SELECT el.*, 
                    cm.subject_code, 
                    cm.subject_title, 
                    cm.subject_description, 
                    cm.category 
                FROM e_learnings AS el 
                LEFT JOIN curriculums AS cm 
                  ON el.e_learning_curriculum_id = cm.curriculum_id" . $whereClause;

        $sql .= " ORDER BY $sortBy $validSortOrder";

        if ($limit > 0) {
          $sql .= " LIMIT $limit OFFSET $offset";
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($records);
        break;

      // =====> Upsert E-Learning <===== \\
      case "upsertELearning":
        $title = $data['e_learning_title'] ?? '';
        $video = $data['e_learning_video'] ?? '';
        $curriculum_id = $data['e_learning_curriculum_id'] ?? '';
        $subject_code = $data['subject_code'] ?? '';

        // Resolve subject_code to curriculum_id if provided and curriculum_id is empty
        if (empty($curriculum_id) && !empty($subject_code)) {
          $stmtGetCurr = $pdo->prepare("SELECT curriculum_id FROM curriculums WHERE subject_code = :code LIMIT 1");
          $stmtGetCurr->execute([':code' => $subject_code]);
          $currRow = $stmtGetCurr->fetch(PDO::FETCH_ASSOC);
          if ($currRow) {
            $curriculum_id = $currRow['curriculum_id'];
          }
        }

        // Handle File Upload
        if (isset($_FILES['video_file']) && $_FILES['video_file']['error'] === UPLOAD_ERR_OK) {
          $fileTmpPath = $_FILES['video_file']['tmp_name'];
          $fileName = $_FILES['video_file']['name'];
          $fileSize = $_FILES['video_file']['size'];
          $fileType = $_FILES['video_file']['type'];
          $fileNameCmps = explode(".", $fileName);
          $fileExtension = strtolower(end($fileNameCmps));

          // Sanitize filename
          $newFileName = md5(time() . $fileName) . '.' . $fileExtension;

          // Directory
          $uploadFileDir = '../videos/';
          if (!is_dir($uploadFileDir)) {
            if (!mkdir($uploadFileDir, 0777, true)) {
              throw new Exception("Failed to create videos directory.");
            }
          }
          $dest_path = $uploadFileDir . $newFileName;

          if (move_uploaded_file($fileTmpPath, $dest_path)) {
            $video = $newFileName;
          } else {
            throw new Exception("Error moving uploaded file. Check directory permissions.");
          }
        } elseif (isset($_FILES['video_file']) && $_FILES['video_file']['error'] !== UPLOAD_ERR_NO_FILE) {
          // Handle other upload errors
          $uploadError = $_FILES['video_file']['error'];
          $message = "File upload error code: $uploadError";
          if ($uploadError === UPLOAD_ERR_INI_SIZE || $uploadError === UPLOAD_ERR_FORM_SIZE) {
            $message = "File is too large.";
          }
          throw new Exception($message);
        }

        if (!empty($e_learning_id)) {
          $sql = "UPDATE e_learnings SET e_learning_title = :title, e_learning_video = :video, e_learning_curriculum_id = :curriculum_id WHERE e_learning_id = :id";
          $stmt = $pdo->prepare($sql);
          $stmt->execute([':title' => $title, ':video' => $video, ':curriculum_id' => $curriculum_id, ':id' => $e_learning_id]);
          echo json_encode(["status" => "success", "message" => "Updated successfully"]);
        } else {
          $sql = "INSERT INTO e_learnings (e_learning_title, e_learning_video, e_learning_curriculum_id) VALUES (:title, :video, :curriculum_id)";
          $stmt = $pdo->prepare($sql);
          $stmt->execute([':title' => $title, ':video' => $video, ':curriculum_id' => $curriculum_id]);
          echo json_encode(["status" => "success", "message" => "Added successfully"]);
        }
        break;

      // =====> Delete E-Learning <===== \\
      case "deleteELearning":
        if (!empty($e_learning_id)) {
          $sql = "DELETE FROM e_learnings WHERE e_learning_id = :id";
          $stmt = $pdo->prepare($sql);
          $stmt->execute([':id' => $e_learning_id]);
          echo json_encode(["status" => "success", "message" => "Deleted successfully"]);
        }
        break;

      // ==========================================
      // ===============> LESSONS <================
      // ==========================================
      case "getLessons":
        $search_term = $data['searchTerm'] ?? null;
        $curriculum_id_filter = $data['curriculum_id'] ?? null;
        $page = $data['page'] ?? 1;
        $limit = isset($data['limit']) ? (int) $data['limit'] : 10;
        $offset = ($page - 1) * $limit;

        $sortBy = $data['sortBy'] ?? 'e_lesson_id';
        $sortOrder = $data['sortOrder'] ?? 'DESC';

        $validSorts = ['e_lesson_id', 'e_lesson_title', 'e_lesson_type', 'subject_code'];
        $sortBy = in_array($sortBy, $validSorts) ? $sortBy : 'e_lesson_id';
        $validSortOrder = strtoupper($sortOrder) === 'ASC' ? 'ASC' : 'DESC';

        $conditions = [];
        $params = [];

        if (!empty($curriculum_id_filter)) {
          $conditions[] = "l.curriculum_id = :cid";
          $params[':cid'] = $curriculum_id_filter;
        }

        if (!empty($search_term)) {
          $conditions[] = "(
              l.e_lesson_title LIKE :search_title OR 
              c.subject_code LIKE :search_code OR 
              c.subject_title LIKE :search_subj
           )";
          $term = "%$search_term%";
          $params[':search_title'] = $term;
          $params[':search_code'] = $term;
          $params[':search_subj'] = $term;
        }

        $whereClause = "";
        if (count($conditions) > 0) {
          $whereClause = " WHERE " . implode(" AND ", $conditions);
        }

        // Count Total
        $sqlCount = "SELECT COUNT(*) as total 
                     FROM e_lessons AS l 
                     LEFT JOIN curriculums AS c ON l.curriculum_id = c.curriculum_id" . $whereClause;
        $stmtCount = $pdo->prepare($sqlCount);
        $stmtCount->execute($params);
        $totalResult = $stmtCount->fetch(PDO::FETCH_ASSOC);
        $total = $totalResult['total'];

        // Get Records
        $sql = "SELECT l.*, c.subject_title, c.subject_code 
                  FROM e_lessons AS l 
                  LEFT JOIN curriculums AS c ON l.curriculum_id = c.curriculum_id" . $whereClause;

        $sql .= " ORDER BY $sortBy $validSortOrder LIMIT $limit OFFSET $offset";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
          "records" => $records,
          "total" => $total,
          "page" => $page,
          "limit" => $limit
        ]);
        break;

      case "upsertLesson":
        $lesson_id = $data['lesson_id'] ?? null;
        $curriculum_id = $data['curriculum_id'] ?? '';
        $type = $data['e_lesson_type'] ?? '';
        $title = $data['e_lesson_title'] ?? '';
        $desc = $data['e_lesson_description'] ?? '';
        $path = $data['e_lesson_path'] ?? '';

        // Handle File Upload
        if (isset($_FILES['video_file']) && $_FILES['video_file']['error'] === UPLOAD_ERR_OK) {
          $fileTmpPath = $_FILES['video_file']['tmp_name'];
          $fileName = $_FILES['video_file']['name'];
          $fileSize = $_FILES['video_file']['size'];
          $fileType = $_FILES['video_file']['type'];
          $fileNameCmps = explode(".", $fileName);
          $fileExtension = strtolower(end($fileNameCmps));

          // Sanitize filename
          $newFileName = md5(time() . $fileName) . '.' . $fileExtension;

          // Directory
          $uploadFileDir = '../videos/';
          $dest_path = $uploadFileDir . $newFileName;

          if (move_uploaded_file($fileTmpPath, $dest_path)) {
            $path = $newFileName;
          } else {
            throw new Exception("Error moving uploaded file.");
          }
        }

        if (!empty($lesson_id) && $lesson_id !== "null" && $lesson_id !== "") {
          $sql = "UPDATE e_lessons SET curriculum_id = :cid, e_lesson_type = :type, e_lesson_title = :title, e_lesson_description = :desc, e_lesson_path = :path WHERE e_lesson_id = :id";
          $stmt = $pdo->prepare($sql);
          $stmt->execute([':cid' => $curriculum_id, ':type' => $type, ':title' => $title, ':desc' => $desc, ':path' => $path, ':id' => $lesson_id]);
          echo json_encode(["status" => "success", "message" => "Updated successfully"]);
        } else {
          $sql = "INSERT INTO e_lessons (curriculum_id, e_lesson_type, e_lesson_title, e_lesson_description, e_lesson_path) VALUES (:cid, :type, :title, :desc, :path)";
          $stmt = $pdo->prepare($sql);
          $stmt->execute([':cid' => $curriculum_id, ':type' => $type, ':title' => $title, ':desc' => $desc, ':path' => $path]);
          echo json_encode(["status" => "success", "message" => "Added successfully"]);
        }
        break;

      case "deleteLesson":
        $lesson_id = $data['lesson_id'] ?? null;
        if (!empty($lesson_id)) {
          $sql = "DELETE FROM e_lessons WHERE e_lesson_id = :id";
          $stmt = $pdo->prepare($sql);
          $stmt->execute([':id' => $lesson_id]);
          echo json_encode(["status" => "success", "message" => "Deleted successfully"]);
        }
        break;

      case "getLessonById":
        $lesson_id = $data['lesson_id'] ?? null;
        if (!empty($lesson_id)) {
          $sql = "SELECT l.*, c.subject_title, c.subject_code 
                  FROM e_lessons AS l 
                  LEFT JOIN curriculums AS c ON l.curriculum_id = c.curriculum_id 
                  WHERE l.e_lesson_id = :id";
          $stmt = $pdo->prepare($sql);
          $stmt->execute([':id' => $lesson_id]);
          $result = $stmt->fetch(PDO::FETCH_ASSOC);
          echo json_encode($result ?: []);
        } else {
          echo json_encode([]);
        }
        break;

      // ==========================================
      // ===============> QUIZZES <================
      // ==========================================

      case "getQuizzes":
        $search_term = $data['searchTerm'] ?? null;

        $sortBy = $data['sortBy'] ?? 'quiz_id';
        $sortOrder = $data['sortOrder'] ?? 'DESC';
        $validSortOrder = strtoupper($sortOrder) === 'ASC' ? 'ASC' : 'DESC';

        $conditions = [];
        $params = [];

        if (!empty($search_term)) {
          $conditions[] = "(
              q.quiz_title LIKE :search_title OR 
              l.e_lesson_title LIKE :search_lesson
           )";
          $term = "%$search_term%";
          $params[':search_title'] = $term;
          $params[':search_lesson'] = $term;
        }

        $whereClause = "";
        if (count($conditions) > 0) {
          $whereClause = " WHERE " . implode(" AND ", $conditions);
        }

        // Pagination
        $page = isset($data['page']) ? (int) $data['page'] : 1;
        $limit = isset($data['limit']) ? (int) $data['limit'] : 10;
        $offset = ($page - 1) * $limit;

        // Count Total
        $countSql = "SELECT COUNT(*) FROM e_quizzes AS q LEFT JOIN e_lessons AS l ON q.lesson_id = l.e_lesson_id" . $whereClause;
        $countStmt = $pdo->prepare($countSql);
        foreach ($params as $key => $val) {
          $countStmt->bindValue($key, $val);
        }
        $countStmt->execute();
        $total = $countStmt->fetchColumn();

        $sql = "SELECT q.*, l.e_lesson_title 
                FROM e_quizzes AS q 
                LEFT JOIN e_lessons AS l ON q.lesson_id = l.e_lesson_id" . $whereClause;

        $sql .= " ORDER BY $sortBy $validSortOrder LIMIT :limit OFFSET :offset";

        $stmt = $pdo->prepare($sql);
        foreach ($params as $key => $val) {
          $stmt->bindValue($key, $val);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode([
          "data" => $stmt->fetchAll(PDO::FETCH_ASSOC),
          "total" => $total,
          "page" => $page,
          "limit" => $limit
        ]);
        break;

      case "getQuizById":
        $quiz_id = $data['quiz_id'] ?? null;
        if (!empty($quiz_id)) {
          $sql = "SELECT * FROM e_quizzes WHERE quiz_id = :id";
          $stmt = $pdo->prepare($sql);
          $stmt->execute([':id' => $quiz_id]);
          $result = $stmt->fetch(PDO::FETCH_ASSOC);
          echo json_encode($result ?: []);
        } else {
          echo json_encode([]);
        }
        break;

      case "upsertQuiz":
        $quiz_id = $data['quiz_id'] ?? null;
        $lesson_id = $data['lesson_id'] ?? '';
        $title = $data['quiz_title'] ?? '';
        $total = $data['quiz_total_question'] ?? 0;
        $passing = $data['quiz_passing_score'] ?? 0;

        if (!empty($quiz_id)) {
          $sql = "UPDATE e_quizzes SET lesson_id = :lid, quiz_title = :title, quiz_total_question = :total, quiz_passing_score = :passing WHERE quiz_id = :id";
          $stmt = $pdo->prepare($sql);
          $stmt->execute([':lid' => $lesson_id, ':title' => $title, ':total' => $total, ':passing' => $passing, ':id' => $quiz_id]);
          echo json_encode(["status" => "success", "message" => "Updated successfully"]);
        } else {
          $sql = "INSERT INTO e_quizzes (lesson_id, quiz_title, quiz_total_question, quiz_passing_score) VALUES (:lid, :title, :total, :passing)";
          $stmt = $pdo->prepare($sql);
          $stmt->execute([':lid' => $lesson_id, ':title' => $title, ':total' => $total, ':passing' => $passing]);
          echo json_encode(["status" => "success", "message" => "Added successfully"]);
        }
        break;

      case "deleteQuiz":
        $quiz_id = $data['quiz_id'] ?? null;
        if (!empty($quiz_id)) {
          $sql = "DELETE FROM e_quizzes WHERE quiz_id = :id";
          $stmt = $pdo->prepare($sql);
          $stmt->execute([':id' => $quiz_id]);
          echo json_encode(["status" => "success", "message" => "Deleted successfully"]);
        }
        break;

      case "getQuestions":
        // Usually filtering by quiz_id
        $quiz_id_filter = $data['quiz_id_filter'] ?? null;
        $search_term = $data['searchTerm'] ?? null;

        $sortBy = $data['sortBy'] ?? 'question_id';
        $sortOrder = $data['sortOrder'] ?? 'DESC';
        $validSortOrder = strtoupper($sortOrder) === 'ASC' ? 'ASC' : 'DESC';

        $conditions = [];
        $params = [];

        if ($quiz_id_filter) {
          $conditions[] = "qq.quiz_id = :qid";
          $params[':qid'] = $quiz_id_filter;
        }

        if (!empty($search_term)) {
          $conditions[] = "(
              qq.question_text LIKE :search_text OR 
              q.quiz_title LIKE :search_quiz
           )";
          $term = "%$search_term%";
          $params[':search_text'] = $term;
          $params[':search_quiz'] = $term;
        }

        $whereClause = "";
        if (count($conditions) > 0) {
          $whereClause = " WHERE " . implode(" AND ", $conditions);
        }

        // Pagination
        $page = isset($data['page']) ? (int) $data['page'] : 1;
        $limit = isset($data['limit']) ? (int) $data['limit'] : 10;
        $offset = ($page - 1) * $limit;

        // Count Total
        $countSql = "SELECT COUNT(*) FROM e_quiz_questions AS qq LEFT JOIN e_quizzes AS q ON qq.quiz_id = q.quiz_id" . $whereClause;
        $countStmt = $pdo->prepare($countSql);
        foreach ($params as $key => $val) {
          $countStmt->bindValue($key, $val);
        }
        $countStmt->execute();
        $total = $countStmt->fetchColumn();

        $sql = "SELECT qq.*, q.quiz_title 
                  FROM e_quiz_questions AS qq 
                  LEFT JOIN e_quizzes AS q ON qq.quiz_id = q.quiz_id" . $whereClause;

        $sql .= " ORDER BY $sortBy $validSortOrder LIMIT :limit OFFSET :offset";

        $stmt = $pdo->prepare($sql);
        foreach ($params as $key => $val) {
          $stmt->bindValue($key, $val);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode([
          "data" => $stmt->fetchAll(PDO::FETCH_ASSOC),
          "total" => $total,
          "page" => $page,
          "limit" => $limit
        ]);
        break;

      case "getQuestionById":
        $question_id = $data['question_id'] ?? null;
        if (!empty($question_id)) {
          $sql = "SELECT * FROM e_quiz_questions WHERE question_id = :id";
          $stmt = $pdo->prepare($sql);
          $stmt->execute([':id' => $question_id]);
          $result = $stmt->fetch(PDO::FETCH_ASSOC);
          echo json_encode($result ?: []);
        } else {
          echo json_encode([]);
        }
        break;

      case "deleteQuestion":
        $question_id = $data['question_id'] ?? null;
        if (!empty($question_id)) {
          $sql = "DELETE FROM e_quiz_questions WHERE question_id = :id";
          $stmt = $pdo->prepare($sql);
          $stmt->execute([':id' => $question_id]);
          echo json_encode(["status" => "success", "message" => "Deleted successfully"]);
        }
        break;

      case "upsertQuestion":
        $question_id = $data['question_id'] ?? null;
        $quiz_id = $data['quiz_id'] ?? '';
        $text = $data['question_text'] ?? '';
        $type = $data['question_type'] ?? '';
        $options = $data['question_options'] ?? '';
        $answer = $data['question_answer'] ?? '';
        $points = $data['question_points'] ?? 0;

        if (!empty($question_id)) {
          $sql = "UPDATE e_quiz_questions SET quiz_id = :qid, question_text = :text, question_type = :type, question_options = :options, question_answer = :answer, question_points = :points WHERE question_id = :id";
          $stmt = $pdo->prepare($sql);
          $stmt->execute([':qid' => $quiz_id, ':text' => $text, ':type' => $type, ':options' => $options, ':answer' => $answer, ':points' => $points, ':id' => $question_id]);
          echo json_encode(["status" => "success", "message" => "Updated successfully"]);
        } else {
          $sql = "INSERT INTO e_quiz_questions (quiz_id, question_text, question_type, question_options, question_answer, question_points) VALUES (:qid, :text, :type, :options, :answer, :points)";
          $stmt = $pdo->prepare($sql);
          $stmt->execute([':qid' => $quiz_id, ':text' => $text, ':type' => $type, ':options' => $options, ':answer' => $answer, ':points' => $points]);
          echo json_encode(["status" => "success", "message" => "Added successfully"]);
        }
        break;


      case "getELearningBasedOnId":
        $sql_get_e_learning_id = "SELECT el.*, cm.category, cm.subject_code 
                                  FROM e_learnings AS el 
                                  LEFT JOIN curriculums AS cm ON el.e_learning_curriculum_id = cm.curriculum_id 
                                  WHERE el.e_learning_id = :e_learning_id";
        $get_e_learning_id = $pdo->prepare($sql_get_e_learning_id);
        $get_e_learning_id->execute([":e_learning_id" => $e_learning_id]);
        $get_e_learning_id_result = $get_e_learning_id->fetch(PDO::FETCH_ASSOC);
        echo json_encode($get_e_learning_id_result);
        break;

      // ==========================================
      // ===============> IMPORTS <================
      // ==========================================

      case "importELearning":
        $items = $data['data'] ?? [];
        $count = 0;
        $pdo->beginTransaction();
        try {
          $stmtCurr = $pdo->prepare("SELECT curriculum_id FROM curriculums WHERE subject_code = :code LIMIT 1");
          $stmtInsert = $pdo->prepare("INSERT INTO e_learnings (e_learning_title, e_learning_video, e_learning_curriculum_id) VALUES (:title, :video, :cid)");

          foreach ($items as $item) {
            // headers: Title, Video, Subject Code
            $title = $item['Title'] ?? $item['title'] ?? null;
            $video = $item['Video'] ?? $item['video'] ?? '';
            $code = $item['Subject Code'] ?? $item['subject_code'] ?? null;

            if ($title && $code) {
              $stmtCurr->execute([':code' => $code]);
              $curr = $stmtCurr->fetch(PDO::FETCH_ASSOC);
              if ($curr) {
                $stmtInsert->execute([':title' => $title, ':video' => $video, ':cid' => $curr['curriculum_id']]);
                $count++;
              }
            }
          }
          $pdo->commit();
          echo json_encode(["status" => "success", "message" => "Imported $count items successfully"]);
        } catch (Exception $e) {
          $pdo->rollBack();
          echo json_encode(["status" => "failed", "message" => $e->getMessage()]);
        }
        break;

      case "importLessons":
        $items = $data['data'] ?? [];
        $count = 0;
        $pdo->beginTransaction();
        try {
          $stmtCurr = $pdo->prepare("SELECT curriculum_id FROM curriculums WHERE subject_code = :code LIMIT 1");
          $stmtInsert = $pdo->prepare("INSERT INTO e_lessons (curriculum_id, e_lesson_type, e_lesson_title, e_lesson_description, e_lesson_path) VALUES (:cid, :type, :title, :desc, :path)");

          foreach ($items as $item) {
            // headers: Title, Type, Subject Code, Description, Path
            $title = $item['Title'] ?? $item['title'] ?? null;
            $type = $item['Type'] ?? $item['type'] ?? 'Video';
            $code = $item['Subject Code'] ?? $item['subject_code'] ?? null;
            $desc = $item['Description'] ?? $item['description'] ?? '';
            $path = $item['Path'] ?? $item['path'] ?? '';

            if ($title && $code) {
              $stmtCurr->execute([':code' => $code]);
              $curr = $stmtCurr->fetch(PDO::FETCH_ASSOC);
              if ($curr) {
                $stmtInsert->execute([':cid' => $curr['curriculum_id'], ':type' => $type, ':title' => $title, ':desc' => $desc, ':path' => $path]);
                $count++;
              }
            }
          }
          $pdo->commit();
          echo json_encode(["status" => "success", "message" => "Imported $count items successfully"]);
        } catch (Exception $e) {
          $pdo->rollBack();
          echo json_encode(["status" => "failed", "message" => $e->getMessage()]);
        }
        break;

      case "importQuizzes":
        $items = $data['data'] ?? [];
        $count = 0;
        $pdo->beginTransaction();
        try {
          $stmtLesson = $pdo->prepare("SELECT e_lesson_id FROM e_lessons WHERE e_lesson_title = :title LIMIT 1");
          $stmtInsert = $pdo->prepare("INSERT INTO e_quizzes (lesson_id, quiz_title, quiz_total_question, quiz_passing_score) VALUES (:lid, :title, :total, :passing)");

          foreach ($items as $item) {
            // headers: Title, Lesson Title, Total Questions, Passing Score
            $title = $item['Title'] ?? $item['title'] ?? null;
            $lessonTitle = $item['Lesson Title'] ?? $item['lesson_title'] ?? null;
            $total = $item['Total Questions'] ?? $item['total_questions'] ?? 0;
            $passing = $item['Passing Score'] ?? $item['passing_score'] ?? 0;

            if ($title && $lessonTitle) {
              $stmtLesson->execute([':title' => $lessonTitle]);
              $lesson = $stmtLesson->fetch(PDO::FETCH_ASSOC);
              if ($lesson) {
                $stmtInsert->execute([':lid' => $lesson['e_lesson_id'], ':title' => $title, ':total' => $total, ':passing' => $passing]);
                $count++;
              }
            }
          }
          $pdo->commit();
          echo json_encode(["status" => "success", "message" => "Imported $count items successfully"]);
        } catch (Exception $e) {
          $pdo->rollBack();
          echo json_encode(["status" => "failed", "message" => $e->getMessage()]);
        }
        break;

      case "importQuestions":
        $items = $data['data'] ?? [];
        $count = 0;
        $pdo->beginTransaction();
        try {
          $stmtQuiz = $pdo->prepare("SELECT quiz_id FROM e_quizzes WHERE quiz_title = :title LIMIT 1");
          $stmtInsert = $pdo->prepare("INSERT INTO e_quiz_questions (quiz_id, question_text, question_type, question_options, question_answer, question_points) VALUES (:qid, :text, :type, :options, :answer, :points)");

          foreach ($items as $item) {
            // headers: Quiz Title, Question, Type, Points, Options, Answer
            $quizTitle = $item['Quiz Title'] ?? $item['quiz_title'] ?? null;
            $text = $item['Question'] ?? $item['question'] ?? $item['question_text'] ?? null;
            $type = $item['Type'] ?? $item['type'] ?? 'Multiple Choice';
            $points = $item['Points'] ?? $item['points'] ?? 1;
            $options = $item['Options'] ?? $item['options'] ?? '';
            $answer = $item['Answer'] ?? $item['answer'] ?? '';

            if ($quizTitle && $text) {
              $stmtQuiz->execute([':title' => $quizTitle]);
              $quiz = $stmtQuiz->fetch(PDO::FETCH_ASSOC);
              if ($quiz) {
                $stmtInsert->execute([':qid' => $quiz['quiz_id'], ':text' => $text, ':type' => $type, ':options' => $options, ':answer' => $answer, ':points' => $points]);
                $count++;
              }
            }
          }
          $pdo->commit();
          echo json_encode(["status" => "success", "message" => "Imported $count items successfully"]);
        } catch (Exception $e) {
          $pdo->rollBack();
          echo json_encode(["status" => "failed", "message" => $e->getMessage()]);
        }
        break;
    }
  } catch (PDOException $e) {
    echo json_encode(["status" => "failed", "message" => "Database Error: " . $e->getMessage()]);
  } catch (Exception $e) {
    echo json_encode(["status" => "failed", "message" => "Error: " . $e->getMessage()]);
  }


}