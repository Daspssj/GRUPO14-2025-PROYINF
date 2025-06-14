<?php
session_start();
if (!isset($_SESSION['usuario']) || $_SESSION['rol'] !== 'docente') {
    header("Location: login.php");
    exit();
}
require_once("db_connect.php");

$nombre = $_POST['nombre'];
$materia_id = $_POST['materia_id'];
$docente_id = $_SESSION['usuario'];
$preguntas = $_POST['preguntas'] ?? [];

$stmt = $conn->prepare("INSERT INTO ensayos (nombre, fecha_creacion, docente_id, materia_id) VALUES (?, CURDATE(), ?, ?)");
$stmt->bind_param("sii", $nombre, $docente_id, $materia_id);
$stmt->execute();

$ensayo_id = $conn->insert_id;

// Insertar preguntas
if (!empty($preguntas)) {
    $stmt = $conn->prepare("INSERT INTO ensayo_pregunta (ensayo_id, pregunta_id) VALUES (?, ?)");
    foreach ($preguntas as $pregunta_id) {
        $stmt->bind_param("ii", $ensayo_id, $pregunta_id);
        $stmt->execute();
    }
}

header("Location: docente_panel.php");
