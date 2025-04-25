<?php
session_start();
if (!isset($_SESSION['usuario']) || $_SESSION['rol'] !== 'alumno') {
    header("Location: login.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Panel Alumno</title>
    <link rel="stylesheet" href="style_login.css">
</head>
<body>
    <div class="login-container">
        <h2>Bienvenido Alumno</h2>
        <p>Has iniciado sesión correctamente como <strong>alumno</strong>.</p>

        <!-- Aquí puedes poner botones o links -->
        <a href="#">📘 Ver ensayos disponibles</a><br>
        <a href="#">🧮 Ver puntajes anteriores</a><br>

        <br>
        <a href="logout.php">🔒 Cerrar sesión</a>
    </div>
</body>
</html>
