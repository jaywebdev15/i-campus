<?php

session_start();

require "../../connection.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'];
$password = $data['password'];
$remember = $data['remember'] ?? false;

$sql_verify_email = "SELECT * FROM users WHERE user_email = :user_email";
$verify_email = $pdo->prepare($sql_verify_email);
$verify_email->execute([":user_email" => $email]);

if ($verify_email->rowCount() > 0) {
  $user = $verify_email->fetch(PDO::FETCH_ASSOC);
  $user_password = $user['user_password'];
  if (password_verify($password, $user_password)) {
    if ($user['user_status'] !== 'Active') {
      echo json_encode([
        "status" => "failed",
        "message" => "Your account is currently " . $user['user_status'] . ". You are not allowed to login yet. Please contact the administrator first."
      ]);
      exit;
    }

    $_SESSION['login_status'] = true;
    $_SESSION['login_usercode'] = $user['user_code'];
    $_SESSION['login_role'] = $user['user_role'];
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

    // setcookie("user_code", $user['user_code'], [
    //   "expires"   => time() + 60*60*24, 
    //   "path"      => "/", 
    //   "secure"    => isset($_SERVER['HTTPS']), 
    //   'httponly'  => true, 
    //   "samesite"  => "Lax", 
    // ]);

    // setcookie("user_role", $user['user_role'], [
    //   "expires"   => time() + 60*60*24, 
    //   "path"      => "/", 
    //   "secure"    => isset($_SERVER['HTTPS']), 
    //   "httponly"  => true, 
    //   "samesite"  => "Lax", 
    // ]);

    // =====> Remember Me <===== \\

    echo json_encode([
      "status" => "success",
      "message" => "Login successful.",
      "data" => [
        "user_code" => $user['user_code'],
        "login_role" => $user['user_role'],
        "login_status" => true,
        "login_code" => $user['user_code']
      ]
    ]);
  } else {
    echo json_encode([
      "status" => "failed",
      "message" => "Email or password is incorrect."
    ]);
  }
} else {
  echo json_encode([
    "status" => "failed",
    "message" => "Email or password is incorrect."
  ]);
}