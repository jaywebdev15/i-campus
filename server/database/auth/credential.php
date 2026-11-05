<?php

session_start();

require "../../connection.php";

if(isset($_SESSION['login_status']) && $_SESSION['login_status'] === true) {
  echo json_encode([
    "login_status"  => $_SESSION['login_status'], 
    "login_code"    => $_SESSION['login_usercode'], 
    "login_role"    => $_SESSION['login_role'], 
    "csrf_token"    => $_SESSION['csrf_token'] 
  ]);
} else {
  echo json_encode([
    "status"  => "failed", 
    "message" => "Not logged in"
  ]);
}