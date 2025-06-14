<?php
session_start();
require_once("db_connect.php");

$correo = $_POST['correo'];
$contrasena = $_POST['contrasena'];

// Prevenir SQL Injection
$stmt = $conn->prepare("SELECT * FROM usuarios WHERE correo = ?");
$stmt->bind_param("s", $correo);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $usuario = $result->fetch_assoc();

    // Si la contraseña es correcta (puedes usar hash si quieres)
    if ($usuario['contrasena'] === $contrasena) {
        $_SESSION['usuario'] = $usuario['id'];
        $_SESSION['rol'] = $usuario['rol'];

        header("Location: ".$usuario['rol']."_panel.php");
        exit();
    }
}

header("Location: login.php?error=1");
exit();
