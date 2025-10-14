import os
import time
import uuid
import unittest
import requests

BASE = os.getenv("BASE_URL", "http://localhost:8080")

# Usuarios de pruebas
DOC_EMAIL = f"docente.hu011.mb.{int(time.time())}@test.com"
DOC_PASS = "Secreto123!"
ALU_EMAIL = f"alumno.hu011.mb.{int(time.time())}@test.com"
ALU_PASS = "Secreto123!"

def auth_register(nombre, correo, contrasena, rol):
    requests.post(f"{BASE}/api/auth/registro", json={
        "nombre": nombre, "correo": correo, "contrasena": contrasena, "rol": rol
    })

def auth_login(email, password):
    r = requests.post(f"{BASE}/api/auth/login", json={"correo": email, "contrasena": password})
    r.raise_for_status()
    return r.json().get("token")

class TestMembresiasAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # 1) Registrar docente y alumno
        auth_register("Docente HU011 MB", DOC_EMAIL, DOC_PASS, "docente")
        auth_register("Alumno HU011 MB", ALU_EMAIL, ALU_PASS, "alumno")

        cls.token_doc = auth_login(DOC_EMAIL, DOC_PASS)
        cls.token_alu = auth_login(ALU_EMAIL, ALU_PASS)

        cls.headers_doc = {"Authorization": f"Bearer {cls.token_doc}", "Content-Type": "application/json"}
        cls.headers_alu = {"Authorization": f"Bearer {cls.token_alu}", "Content-Type": "application/json"}

        # 2) Crear colegio y curso (docente)
        unique = str(uuid.uuid4())[:8]
        resp_col = requests.post(f"{BASE}/api/colegios", headers=cls.headers_doc,
                                 json={"nombre": f"Colegio Memb {unique}", "comuna": "Valparaíso"})
        if resp_col.status_code not in (200, 201):
            # si 409 por similar, intentamos obtener uno existente por GET query
            r_list = requests.get(f"{BASE}/api/colegios", headers=cls.headers_doc, params={"query": f"Colegio Memb {unique}"})
            if r_list.status_code != 200 or not r_list.json().get("items"):
                raise unittest.SkipTest(f"No se pudo crear/listar colegio: status={resp_col.status_code} body={resp_col.text}")
            cls.colegio_id = r_list.json()["items"][0]["id"]
        else:
            cls.colegio_id = resp_col.json()["id"]

        resp_cur = requests.post(f"{BASE}/api/cursos", headers=cls.headers_doc, json={
            "colegioId": cls.colegio_id, "nombre": f"4° Medio A {unique}", "anio": 2025, "seccion": "A"
        })
        if resp_cur.status_code not in (200, 201):
            # 409 por duplicado: recuperar por GET
            r_cur = requests.get(f"{BASE}/api/cursos", headers=cls.headers_doc,
                                 params={"colegioId": cls.colegio_id, "query": f"4° Medio A {unique}"})
            if r_cur.status_code != 200 or not isinstance(r_cur.json(), list) or not r_cur.json():
                raise unittest.SkipTest(f"No se pudo crear/listar curso: status={resp_cur.status_code} body={resp_cur.text}")
            cls.curso_id = r_cur.json()[0]["id"]
        else:
            cls.curso_id = resp_cur.json()["id"]

    @classmethod
    def tearDownClass(cls):
        # No se elimina: entorno de dev
        pass

    # Caso B1: unión exitosa (CE3)
    def test_B1_unirse_exitoso(self):
        r = requests.post(f"{BASE}/api/cursos/{self.curso_id}/unirse", headers=self.headers_alu)
        self.assertEqual(r.status_code, 200, msg=f"Esperado 200, obtenido {r.status_code} - {r.text}")
        body = r.json()
        self.assertEqual(body.get("curso_id"), self.curso_id)

    # Caso B2: unión repetida -> 409 (CE4)
    def test_B2_unirse_repetido(self):
        # Asegurar membresía creada (si no, crearla primero)
        _ = requests.post(f"{BASE}/api/cursos/{self.curso_id}/unirse", headers=self.headers_alu)
        r = requests.post(f"{BASE}/api/cursos/{self.curso_id}/unirse", headers=self.headers_alu)
        self.assertEqual(r.status_code, 409, msg=f"Esperado 409, obtenido {r.status_code} - {r.text}")