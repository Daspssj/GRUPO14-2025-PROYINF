<?php
session_start();
if (!isset($_SESSION['usuario']) || $_SESSION['rol'] !== 'docente') {
    header("Location: login.php");
    exit();
}
require_once("db_connect.php");

// Obtener materias
$materias = $conn->query("SELECT id, nombre FROM materias");
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Crear Ensayo</title>
    <link rel="stylesheet" href="style_login.css">
    <style>
        .preguntas-listado {
            max-height: 600px;
            overflow-y: auto;
            padding: 20px;
            border: 1px solid #ccc;
            margin-top: 20px;
            background-color: #f9f9f9;
            width: 100%;
            max-width: 1200px;
            margin-left: auto;
            margin-right: auto;
            border-radius: 6px;
        }

        .pregunta-item {
            border-bottom: 1px solid #ddd;
            padding: 15px 0;
            margin-bottom: 10px;
        }

        .pregunta-flex {
            display: flex;
            align-items: flex-start;
            gap: 15px;
        }

        .pregunta-flex input[type="checkbox"] {
            margin-top: 10px;
            transform: scale(1.2);
        }

        .contenido-pregunta {
            flex-grow: 1;
        }

        .enunciado-box {
            background-color: #efefef;
            padding: 10px;
            border-left: 4px solid #009688;
            border-radius: 5px;
            font-weight: 500;
        }

        .imagen-box {
            margin-top: 8px;
        }
        .titulo-box {
        background-color: #e0f7fa;
        padding: 15px 20px;
        font-size: 24px;
        font-weight: bold;
        border-left: 6px solid #009688;
        border-radius: 5px;
        margin-bottom: 25px;
        text-align: center;
        color: #004d40;
        }
        input[name="nombre"] {
        width: 100%;
        max-width: 600px;
        padding: 12px;
        font-size: 16px;
        margin-bottom: 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
        }
        .btn-crear {
        display: block;
        width: 100%;
        max-width: 300px;
        margin: 30px auto 0;
        padding: 14px;
        background-color: #009688;
        color: white;
        font-size: 18px;
        font-weight: bold;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s ease;
        }

        .btn-crear:hover {
            background-color: #00796b;
        }

    </style>
    <script>
        function cargarPreguntas(materiaId) {
            if (materiaId === "") {
                document.getElementById("contenedor_preguntas").innerHTML = "<p>Seleccione una materia.</p>";
                return;
            }

            fetch("obtener_preguntas.php?materia_id=" + materiaId)
                .then(res => res.text())
                .then(html => {
                    document.getElementById("contenedor_preguntas").innerHTML = html;
                });
        }
    </script>
    <script>
    // Función que cuenta los checkboxes seleccionados
    function actualizarContador() {
        const seleccionadas = document.querySelectorAll("input[name='preguntas[]']:checked").length;
        document.getElementById("contador-seleccionadas").innerText = "Preguntas seleccionadas: " + seleccionadas;
    }

    // Delegación de eventos: escucha cambios en cualquier checkbox dentro del contenedor
    document.addEventListener("change", function (e) {
        if (e.target && e.target.name === "preguntas[]") {
            actualizarContador();
        }
    });

    // También actualizar contador al cargar preguntas por AJAX
    function cargarPreguntas(materiaId) {
        if (materiaId === "") {
            document.getElementById("contenedor_preguntas").innerHTML = "<p>Seleccione una materia.</p>";
            document.getElementById("contador-seleccionadas").innerText = "Preguntas seleccionadas: 0";
            return;
        }

        fetch("obtener_preguntas.php?materia_id=" + materiaId)
            .then(res => res.text())
            .then(html => {
                document.getElementById("contenedor_preguntas").innerHTML = html;
                actualizarContador(); // Reiniciar contador al cargar nuevas preguntas
            });
    }
    </script>

</head>
<body>
    <div class="contenedor-ancho">
        <div class="titulo-box">
            Crear nuevo ensayo
        </div>
        <form action="guardar_ensayo.php" method="post">
            <input type="text" name="nombre" placeholder="Nombre del ensayo" required>
            <label>Mención / Materia:</label>
            <select name="materia_id" onchange="cargarPreguntas(this.value)" required>
                <option value="">Seleccione una materia</option>
                <?php while ($m = $materias->fetch_assoc()): ?>
                    <option value="<?= $m['id'] ?>"><?= $m['nombre'] ?></option>
                <?php endwhile; ?>
            </select>

            <div id="contenedor_preguntas">
                <p>Seleccione una materia para ver preguntas disponibles.</p>
            </div>
            <p id="contador-seleccionadas" style="text-align: center; font-weight: bold; font-size: 16px;">
                Preguntas seleccionadas: 0
            </p>

            <button type="submit" class="btn-crear">Crear ensayo</button>
        </form>
        <br>
        <a href="docente_panel.php">⬅️ Volver al panel</a>
    </div>
</body>
</html>
