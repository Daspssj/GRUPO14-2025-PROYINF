<?php
session_start();
if (!isset($_SESSION['usuario']) || $_SESSION['rol'] !== 'docente') {
    header("Location: login.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Panel Docente</title>
    <link rel="stylesheet" href="style_login.css">
</head>
<body>
    <div class="login-container">
        <h2>Bienvenido Docente</h2>
        <p>Has iniciado sesión correctamente como <strong>docente</strong>.</p>

        <!-- NUEVOS BOTONES -->
        <a href="agregar_pregunta.php">➕ Crear nueva pregunta</a><br>
        <a href="ver_preguntas.php">📋 Ver preguntas existentes</a><br>
        <a href="crear_ensayo.php">🧪 Crear nuevo ensayo</a><br>
        <a href="#">📊 Ver resultados de alumnos</a><br>

        <br>
        <a href="logout.php">🔒 Cerrar sesión</a>
    </div>
</body>
</html>
