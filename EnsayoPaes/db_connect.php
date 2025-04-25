<?php
$host = "localhost";
$user = "root";
$pass = "";
$db = "ensayos_paes";

$conn = new mysqli($host, $user, $pass, $db);
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    die("Error en la conexión: " . $conn->connect_error);
}
?>
