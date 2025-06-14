## **Reestructuración de la Base de Datos**

### **1. Nueva tabla: `areas_tematicas`**
Esta tabla centralizará todas las áreas temáticas de todos los tipos de ensayo:

```sql
CREATE TABLE areas_tematicas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  materia_id INTEGER REFERENCES materias(id),
  tipo_eje VARCHAR(50), -- 'comun', 'electivo', 'general' (para M1, M2, Lenguaje)
  sub_materia VARCHAR(100) -- 'Biologia', 'Fisica', 'Quimica' (solo para Ciencias)
);
```

### **2. Modificación tabla `preguntas`**
Agregamos la relación con áreas temáticas:

```sql
ALTER TABLE preguntas 
ADD COLUMN area_tematica_id INTEGER REFERENCES areas_tematicas(id);
```

### **3. Datos a insertar en `areas_tematicas`**

**Para Matemática 1 (materia_id = 2):**
- Números
- Álgebra y Funciones  
- Geometría
- Probabilidad y Estadística

**Para Matemática 2 (materia_id = 3):**
- Números
- Álgebra y Funciones
- Geometría
- Cálculo
- Probabilidad y Estadística

**Para Lenguaje (materia_id = 1):**
- Textos Literarios
- Textos No Literarios

**Para Biología (materia_id = 4) - Eje Común:**
- Organización, estructura y actividad celular
- Procesos y funciones biológicas
- Herencia y evolución
- Organismo y ambiente

**Para Física (materia_id = 6) - Eje Común:**
- Ondas
- Mecánica
- Energía-Tierra
- Electricidad

**Para Química (materia_id = 5) - Eje Común:**
- Estructura atómica
- Química orgánica
- Reacciones químicas y estequiometría

**Para Biología (materia_id = 4) - Eje Electivo:**
- Organización, estructura y actividad celular
- Procesos y funciones biológicas
- Herencia y evolución
- Organismo y ambiente

**Para Física (materia_id = 6) - Eje Electivo:**
- Ondas
- Mecánica
- Energía-Tierra
- Electricidad

**Para Química (materia_id = 5) - Eje Electivo:**
- Estructura atómica
- Química orgánica
- Reacciones químicas y estequiometría

### **4. Lógica de creación de ensayos**

Con esta estructura:
- **M1/M2**: Se seleccionan áreas temáticas de `tipo_eje = 'general'`
- **Lenguaje**: Se seleccionan áreas temáticas de `tipo_eje = 'general'`
- **Ciencias**: Se pueden crear ensayos mixtos (54 preguntas del eje común + 26 del eje electivo) o ensayos específicos de una sola materia

### **5. Ventajas de esta estructura**
- Flexibilidad para crear ensayos mixtos de ciencias
- Separación clara entre ejes común y electivo
- Escalabilidad para agregar nuevas materias o áreas temáticas
- Consultas SQL más eficientes para filtrar preguntas

