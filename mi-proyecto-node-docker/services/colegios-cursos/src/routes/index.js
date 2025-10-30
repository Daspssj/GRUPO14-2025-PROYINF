import { Router } from "express";
import { requireAuth } from "../mw/auth.js";
import { listColegios, createColegio } from "../controllers/colegios.js";
import { listCursos, createCurso, unirseCurso, misCursos, borrarMembresia } from "../controllers/cursos.js";

const router = Router();

// Colegios
router.get("/colegios", requireAuth, listColegios);
router.post("/colegios", requireAuth, createColegio);

// Cursos
router.get("/cursos", requireAuth, listCursos);
router.post("/cursos", requireAuth, createCurso);

// Membresías
router.post("/cursos/:cursoId/unirse", requireAuth, unirseCurso);
router.get("/mi/cursos", requireAuth, misCursos);
router.delete("/curso_miembros/:id", requireAuth, borrarMembresia);

export default router;