<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Registrarse | Ensayos PAES</title>
    <link rel="stylesheet" href="style_login.css">
    <script>
        function mostrarCampoCodigo() {
            const rol = document.getElementById('rol').value;
            const campoCodigo = document.getElementById('campo-codigo');
            if (rol === 'docente') {
                campoCodigo.style.display = 'block';
            } else {
                campoCodigo.style.display = 'none';
            }
        }
    </script>
</head>

<?php
$mensaje_error = $_GET['error'] ?? null;
$mensaje_exito = $_GET['exito'] ?? null;
?>

<body>
    <div class="login-container">
        <h2>Crear Cuenta</h2>
        <form action="validar_registro.php" method="post">
            <input type="text" name="nombre" placeholder="Nombre completo" required>
            <input type="email" name="correo" placeholder="Correo electrónico" required>
            <input type="password" name="contrasena" placeholder="Contraseña" required>
            <select name="rol" id="rol" onchange="mostrarCampoCodigo()" required>
                <option value="">Selecciona tipo de cuenta</option>
                <option value="alumno">Alumno</option>
                <option value="docente">Docente</option>
            </select>
            <div id="campo-codigo" style="display: none;">
                <input type="text" name="codigo_docente" placeholder="Código secreto docente">
            </div>

            <button type="submit">Crear Cuenta</button>
        </form>
        <?php if ($mensaje_error): ?>
            <p class="error"><?php echo htmlspecialchars($mensaje_error); ?></p>
        <?php endif; ?>

        <?php if ($mensaje_exito): ?>
            <p class="exito"><?php echo htmlspecialchars($mensaje_exito); ?></p>
        <?php endif; ?>


