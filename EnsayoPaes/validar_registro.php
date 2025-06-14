<?php
require_once("db_connect.php");

$nombre = $_POST['nombre'];
$correo = $_POST['correo'];
$contrasena = $_POST['contrasena'];
$rol = $_POST['rol'];
$codigo_docente = $_POST['codigo_docente'] ?? '';

// Validación de código secreto si es docente
if ($rol === 'docente' && $codigo_docente !== '3312') {
    header("Location: registro.php?error=Código docente incorrecto");
    exit();
}

// Verificar si el correo ya existe
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE correo = ?");
$stmt->bind_param("s", $correo);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    header("Location: registro.php?error=El correo ya está registrado");
    exit();
}

// Insertar nuevo usuario
$stmt = $conn->prepare("INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $nombre, $correo, $contrasena, $rol);

if ($stmt->execute()) {
    header("Location: login.php");
    exit();
} else {
    header("Location: registro.php?error=Error al registrar");
    exit();
}
