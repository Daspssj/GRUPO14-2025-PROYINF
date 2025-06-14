<?php
session_start();
if (!isset($_SESSION['usuario']) || $_SESSION['rol'] !== 'docente') {
    header("Location: login.php");
    exit();
}

require_once("db_connect.php");

// Obtener lista de materias
$materias = $conn->query("SELECT id, nombre FROM materias");

// Obtener filtro seleccionado (si hay)
$filtro_materia = $_GET['materia_id'] ?? '';

// Consulta con o sin filtro
if ($filtro_materia !== '') {
    $stmt = $conn->prepare("SELECT p.*, m.nombre AS materia FROM preguntas p 
                            LEFT JOIN materias m ON p.materia_id = m.id 
                            WHERE p.materia_id = ?
                            ORDER BY p.id DESC");
    $stmt->bind_param("i", $filtro_materia);
    $stmt->execute();
    $resultado = $stmt->get_result();
} else {
    $resultado = $conn->query("SELECT p.*, m.nombre AS materia FROM preguntas p 
                               LEFT JOIN materias m ON p.materia_id = m.id 
                               ORDER BY p.id DESC");
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Preguntas Registradas</title>
    <link rel="stylesheet" href="style_login.css">
    <style>
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
        }

        th, td {
            padding: 8px;
            border: 1px solid #ccc;
        }

        th {
            background-color: #f4f4f4;
        }

        img {
            max-width: 100px;
        }

        .filter-container {
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="contenedor-ancho">
        <h2>Preguntas Registradas</h2>

        <!-- Filtro por materia -->
        <form method="get" class="filter-container">
            <label for="materia_id">Filtrar por materia:</label>
            <select name="materia_id" id="materia_id" onchange="this.form.submit()">
                <option value="">-- Todas las materias --</option>
                <?php while ($fila = $materias->fetch_assoc()): ?>
                    <option value="<?= $fila['id'] ?>" <?= $filtro_materia == $fila['id'] ? 'selected' : '' ?>>
                        <?= htmlspecialchars($fila['nombre']) ?>
                    </option>
                <?php endwhile; ?>
            </select>
        </form>

        <!-- Tabla de preguntas -->
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Enunciado + Opciones</th>
                    <th>Materia</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>
                <?php while ($fila = $resultado->fetch_assoc()): ?>
                    <tr>
                        <td><?= $fila['id'] ?></td>

                        <td>
                            <strong>Enunciado:</strong><br>
                            <?= nl2br(htmlspecialchars($fila['enunciado'])) ?>

                            <?php if (!empty($fila['imagen'])): ?>
                                <div style="margin-top: 10px;">
                                    <img src="<?= htmlspecialchars($fila['imagen']) ?>" alt="Imagen" style="max-width: 150px;">
                                </div>
                            <?php endif; ?>

                            <div style="margin-top: 10px;">
                                <strong>Opciones:</strong><br>
                                A) <?= htmlspecialchars($fila['opcion_a']) ?><br>
                                B) <?= htmlspecialchars($fila['opcion_b']) ?><br>
                                C) <?= htmlspecialchars($fila['opcion_c']) ?><br>
                                D) <?= htmlspecialchars($fila['opcion_d']) ?><br>
                                <strong style="color: green;">Respuesta correcta: <?= htmlspecialchars($fila['respuesta_correcta']) ?></strong>
                            </div>
                        </td>

                        <td><?= htmlspecialchars($fila['materia'] ?? 'Sin materia') ?></td>
                        <td>
                            <a href="#"><span style="font-size: 16px;">✏️</span> Editar</a><br>
                            <a href="#"><span style="font-size: 16px;">🗑️</span> Eliminar</a>
                        </td>
                    </tr>
                <?php endwhile; ?>
                </tbody>
        </table>
        <br>
        <a href="docente_panel.php">⬅️ Volver al panel</a>
    </div>
</body>
</html>
