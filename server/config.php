<?php 

require __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();




// use Firebase\JWT\JWT;
// use Firebase\JWT\Key;

// session_start();

// require "../../connection.php";
// require_once __DIR__ . '/../../config.php';

// header("Access-Control-Allow-Origin: http://localhost:5173");
// header("Access-Control-Allow-Credentials: true");
// header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
// header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");
// header("Content-Type: application/json");

// $data = json_decode(file_get_contents("php://input"), true);
// $email    = $data['email'];
// $password = $data['password'];
// $remember = $data['remember'] ?? false;

// $sql_verify_email = "SELECT * FROM users WHERE user_email = :user_email";
// $verify_email = $pdo->prepare($sql_verify_email);
// $verify_email->execute([ ":user_email" => $email ]);

// if($verify_email->rowCount() > 0 ) {
//   $user = $verify_email->fetch(PDO::FETCH_ASSOC);
//   $user_password = $user['user_password'];
//   if(password_verify($password, $user_password)) {
//     $_SESSION['login_status']   = true;
//     $_SESSION['login_usercode'] = $user['user_code'];
//     $_SESSION['login_role']     = $user['user_role'];
    
//     $payload = [
//       "user_code"   => $user['user_code'], 
//       "user_role"   => $user['user_role'], 
//       "expiration"  => time() + (60 * 60 * 24),
//     ];

//     $secret_key = $_ENV['JWT_SECRET'];

//     $jwt = JWT::encode($payload, $secret_key, 'HS256');

//     setcookie("auth_token", $jwt, [
//       "expires"   => time() + 3600 * 24, 
//       "path"      => "/", 
//       "secure"    => false, 
//       "httponly"  => true, 
//       "samesite"  => "Lax"
//     ]);

//     // =====> Remember Me <===== \\

//     echo json_encode([
//       "status"      => "success", 
//       "message"     => "Login successful."
//     ]);
//   } else {
//     echo json_encode([
//       "status"  => "failed", 
//       "message" => "Email or password is incorrect."
//     ]);
//   }
// } else {
//   echo json_encode([
//     "status"  => "failed", 
//     "message" => "Email or password is incorrect."
//   ]);
// }