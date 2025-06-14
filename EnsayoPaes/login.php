<?php
session_start();
if (isset($_SESSION['usuario'])) {
    header("Location: ".$_SESSION['rol']."_panel.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Login | Ensayos PAES</title>
    <link rel="stylesheet" href="style_login.css">
</head>
<body>
    <div class="login-container">
        <h2>Iniciar Sesión</h2>
        <form action="validar_login.php" method="post">
            <input type="email" name="correo" placeholder="Correo electrónico" required>
            <input type="password" name="contrasena" placeholder="Contraseña" required>
            <button type="submit">Ingresar</button>
        </form>
        <p><a href="registro.php">¿No tienes cuenta? Crea una aquí</a></p>
        <?php if (isset($_GET['error'])): ?>
            <p class="error">Correo o contraseña incorrectos</p>
        <?php endif; ?>
    </div>
</body>
</html>
