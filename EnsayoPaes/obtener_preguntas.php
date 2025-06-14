<?php
require_once("db_connect.php");
$materia_id = $_GET['materia_id'] ?? 0;

if ($materia_id) {
    $stmt = $conn->prepare("SELECT id, enunciado, imagen FROM preguntas WHERE materia_id = ?");
    $stmt->bind_param("i", $materia_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo "<div class='preguntas-listado'>";

        while ($row = $result->fetch_assoc()) {
            echo "<div class='pregunta-item'>";
            echo "<div class='pregunta-flex'>";
            echo "<input type='checkbox' name='preguntas[]' value='{$row['id']}'>";
            
            echo "<div class='contenido-pregunta'>";
            echo "<div class='enunciado-box'>" . nl2br(htmlspecialchars($row['enunciado'])) . "</div>";
            
            if (!empty($row['imagen'])) {
                echo "<div class='imagen-box'><img src='" . htmlspecialchars($row['imagen']) . "' alt='Imagen' style='max-width: 250px;'></div>";
            }
            
            echo "</div>"; // contenido-pregunta
            echo "</div>"; // pregunta-flex
            echo "</div>"; // pregunta-item            
        }

        echo "</div>";
    } else {
        echo "<p>No hay preguntas para esta materia.</p>";
    }
}
