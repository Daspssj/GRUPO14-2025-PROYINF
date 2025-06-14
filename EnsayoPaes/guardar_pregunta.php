<?php
session_start();
if (!isset($_SESSION['usuario']) || $_SESSION['rol'] !== 'docente') {
    header("Location: login.php");
    exit();
}

require_once("db_connect.php");

$enunciado = $_POST['enunciado'];
$opcion_a = $_POST['opcion_a'];
$opcion_b = $_POST['opcion_b'];
$opcion_c = $_POST['opcion_c'];
$opcion_d = $_POST['opcion_d'];
$respuesta_correcta = $_POST['respuesta_correcta'];
$materia_id = $_POST['materia_id'];
$imagen = !empty($_POST['imagen']) ? trim($_POST['imagen']) : null;

$stmt = $conn->prepare("INSERT INTO preguntas (enunciado, imagen, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, materia_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssssis", $enunciado, $imagen, $opcion_a, $opcion_b, $opcion_c, $opcion_d, $respuesta_correcta, $materia_id);

if ($stmt->execute()) {
    header("Location: agregar_pregunta.php?exito=1");
    exit();
} else {
    echo "Error al guardar la pregunta.";
}
