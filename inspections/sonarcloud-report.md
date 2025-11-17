# Inspección de Código — SonarCloud  
## Plataforma PAES — Informe de Calidad (Hito 5)

Este documento presenta los resultados de la inspección realizada mediante **SonarCloud**, considerando dos *quality issues* relevantes detectados en el módulo **frontend-paes**.  
Los fragmentos de código incluidos provienen directamente de los archivos analizados.

Los archivos de evidencia (screenshots) deben colocarse dentro de:  
```bash

inspections/
├── issue1.png
├── issue2.png
└── sonarcloud-report.md  ← este archivo

```

---

# 1. Issue de Severidad **HIGH**  
## Complejidad Cognitiva Excesiva en `VerEnsayos.jsx`

**Archivo:** `frontend-paes/src/VerEnsayos.jsx`  
**Severidad:** **High**  
**Tipo:** Code Smell  
**Regla:** “Refactor this function to reduce its Cognitive Complexity”  
**Complejidad Detectada:** 20 (máximo permitido: 15)

### Captura:
*Ver `inspections/issue1.png`*

### Descripción del Issue
SonarCloud identificó que la función encargada de clasificar ensayos en categorías  
(“disponibles”, “no disponibles”, “por ventana”, “permanentes”, “excedidos”, “futuros”, etc.)  
supera el umbral recomendado de complejidad cognitiva.

El fragmento observado es el siguiente:

```bash
dedupeById(enriched).forEach((e) => {
  const max = e.max_intentos ?? null;
  const usados = getUsados(e);
  const excedido = (max != null) && (Number(usados) >= Number(max));

  if (e.disponibilidad === 'ventana') {
    const est = computeEstadoVentana(e);
    const row = { ...e, _estado: est };

    if (excedido)        pushND(row, 'Límite de intentos alcanzado');
    else if (est.key === 'disponible' && est.ventanaActual) V.push(row);
    else if (est.key === 'proximo')  pushND(row, 'Ventana futura');
    else {
      let motivo = 'Sin ventana activa';
      if (Array.isArray(e.ventanas) && e.ventanas.length) {
        const allPast = e.ventanas.every(v => new Date(v.fin) <= new Date());
        if (allPast) motivo = 'Ventana vencida';
      }
      pushND(row, motivo);
    }
  } else {
    if (excedido) pushND(e, 'Límite de intentos alcanzado');
    else G.push(e);
  }
});
```

### Impacto Técnico

* La función mezcla **múltiples responsabilidades** dentro de un solo bloque de iteración.
* Es difícil extender o depurar cuando se agreguen nuevas reglas de negocio sobre ensayos.
* Aumenta la probabilidad de errores silenciosos al cambiar la lógica de clasificación.
* Reduce la mantenibilidad del frontend.

### Recomendación de SonarCloud

Refactorizar para reducir la complejidad cognitiva.

### Decisión / Cómo se abordará

**Este issue será corregido.**
La estrategia propuesta incluye:

* Extraer funciones auxiliares:

  * `clasificarEnsayoVentana(e)`
  * `clasificarEnsayoPermanente(e)`
  * `esLimiteIntentosExcedido(e)`
* Utilizar early-returns para reducir niveles de anidación.
* Simplificar el flujo del `forEach` para que solo orqueste llamadas.

---

# 2. Issue de Severidad **MEDIUM**

## Falta de Validación de Props en `Login.jsx`

**Archivo:** `frontend-paes/src/Login.jsx`
**Severidad:** **Medium**
**Tipo:** Code Smell
**Regla:** “React components should validate prop types”

### Captura:

*Ver `inspections/issue2.png`*

### Descripción del Issue

SonarCloud detectó que el componente `Login` recibe una propiedad (`onLogin`)
pero no valida su tipo mediante PropTypes, lo que puede causar fallas silenciosas
si un desarrollador pasa un tipo incorrecto.

```bash
const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  // ...
};
```

### Impacto Técnico

* Riesgo de errores en tiempo de ejecución si `onLogin` no es una función válida.
* Falta de autodefensa del componente ante un uso incorrecto.
* Penaliza la confiabilidad y mantenibilidad del frontend.

### Recomendación de SonarCloud

Agregar validación explícita de props:

```bash
import PropTypes from 'prop-types';

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};
```

### Decisión / Cómo se abordará

**Este issue también será corregido.**

La solución es simple y mejora la robustez del sistema.

---

# 3. Conclusiones Generales

* **Ambos issues identificados por SonarCloud son válidos y relevantes.**
* La corrección del issue de complejidad cognitiva mejora la calidad estructural de la vista de ensayos.
* La corrección del issue de PropTypes reduce futuros errores en autenticación.
* No se identifican falsos positivos ni reglas irrelevantes para el contexto del proyecto.
* La inspección permitió identificar piezas críticas del frontend donde la mantenibilidad podría deteriorarse con el tiempo.

---

# 4. Archivos Versionados

Esta carpeta contiene la evidencia exigida:

```bash
inspections/
  ├── issue1.png        ← Captura de la complejidad cognitiva
  ├── issue2.png        ← Captura del PropTypes faltante
  └── sonarcloud-report.md  ← Este informe
```