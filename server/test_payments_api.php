<?php
require "connection.php";

echo "Testing payments.php API...\n";

function post($action, $data = [])
{
  global $pdo;
  $_POST = $data;
  $_POST['action'] = $action;

  // Simulate POST request to payments.php
  // We can't use curl because the server might not be reachable or curl might not be installed.
  // We'll require the file and capture output.

  ob_start();
  $data = array_merge(['action' => $action], $data);

  // Set up environment for the script
  $_SERVER['REQUEST_METHOD'] = 'POST';
  $json = json_encode($data);

  // Mocking php://input is hard in a simple script, so let's just test the functions if possible
  // or use a temporary file to mock it if payments.php used file_get_contents('php://input')
}

// Since payments.php uses file_get_contents("php://input"), let's create a wrapper to test it.
$testData = [
  'action' => 'getEnrolledStudents',
  'searchTerm' => '',
  'page' => 1,
  'limit' => 5
];

$json = json_encode($testData);
$tmpFile = tempnam(sys_get_temp_dir(), 'php_input');
file_put_contents($tmpFile, $json);

echo "Test Case: getEnrolledStudents\n";
// We'll need to modify payments.php slightly to allow passing a custom input stream for testing, 
// or just trust the logic if it's straightforward.
// Actually, I can just use a shell command to run php and pipe the input.

?>