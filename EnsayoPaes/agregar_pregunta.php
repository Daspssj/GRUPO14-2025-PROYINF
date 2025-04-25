<?php
session_start();
if (!isset($_SESSION['usuario']) || $_SESSION['rol'] !== 'docente') {
    header("Location: login.php");
    exit();
}

require_once("db_connect.php");

// Obtener materias desde la base
$materias = $conn->query("SELECT id, nombre FROM materias");
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Agregar Pregunta</title>
    <link rel="stylesheet" href="style_login.css">
</head>
<body>
    <div class="login-container">
        <h2>Agregar Nueva Pregunta</h2>
        <form action="guardar_pregunta.php" method="post" enctype="multipart/form-data">
            <textarea name="enunciado" placeholder="Escribe el enunciado de la pregunta" required></textarea>

            <label>URL de imagen (opcional):</label>
            <input type="text" name="imagen" placeholder="https://... o img/nombre.png">


            <input type="text" name="opcion_a" placeholder="Opción A" required>
            <input type="text" name="opcion_b" placeholder="Opción B" required>
            <input type="text" name="opcion_c" placeholder="Opción C" required>
            <input type="text" name="opcion_d" placeholder="Opción D" required>

            <label>Respuesta correcta:</label>
            <select name="respuesta_correcta" required>
                <option value="">Seleccione</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
            </select>

            <label>Materia:</label>
            <select name="materia_id" required>
                <option value="">Seleccione materia</option>
                <?php while ($fila = $materias->fetch_assoc()): ?>
                    <option value="<?= $fila['id'] ?>"><?= $fila['nombre'] ?></option>
                <?php endwhile; ?>
            </select>
            <button type="submit">Guardar Pregunta</button>
        </form>
        <br>
        <a href="docente_panel.php">⬅️ Volver al panel</a>
    </div>
</body>
</html>
