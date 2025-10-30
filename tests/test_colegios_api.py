import os
import time
import uuid
import unittest
import requests

import unicodedata

def normalize_string(s):
    if not s:
        return s
    # Misma lógica que en JS: quitar acentos, minúsculas, quitar espacios
    s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode("utf-8")
    return s.lower().replace(' ', '')

BASE = os.getenv("BASE_URL", "http://localhost:8080")
# Usuario docente de pruebas (se crea en setUpClass)
DOC_EMAIL = f"docente.hu011.{int(time.time())}@test.com"
DOC_PASS = "Secreto123!"

def auth_login(email, password):
    r = requests.post(f"{BASE}/api/auth/login", json={"correo": email, "contrasena": password})
    r.raise_for_status()
    return r.json().get("token")

def auth_register(nombre, correo, contrasena, rol):
    requests.post(f"{BASE}/api/auth/registro", json={
        "nombre": nombre, "correo": correo, "contrasena": contrasena, "rol": rol
    })

class TestColegiosAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # 1) Registrar y loguear docente (idempotente en registro)
        auth_register("Docente HU011", DOC_EMAIL, DOC_PASS, "docente")
        cls.token_docente = auth_login(DOC_EMAIL, DOC_PASS)
        cls.headers_doc = {"Authorization": f"Bearer {cls.token_docente}", "Content-Type": "application/json"}

        # 2) Semilla para A2 (duplicado): crear “Colegio Nacional” si no existe ya
        #    Intento crear; si ya existe, ignorar
        cls.colegio_nacional_payload = {"nombre": "Colegio Nacional", "comuna": "Santiago"}
        resp = requests.post(f"{BASE}/api/colegios", headers=cls.headers_doc, json=cls.colegio_nacional_payload)
        if resp.status_code not in (200, 201, 409):
            raise unittest.SkipTest(f"No se pudo preparar semilla de colegio: status={resp.status_code} body={resp.text}")

    @classmethod
    def tearDownClass(cls):
        # No eliminamos datos; este es un entorno de desarrollo
        pass

    # Caso A1: creación válida (CE1)
    def test_A1_crear_colegio_valido(self):
        unique = str(uuid.uuid4())[:8]
        payload = {"nombre": f"Colegio Demo {unique}", "comuna": "Santiago"}
        r = requests.post(f"{BASE}/api/colegios", headers=self.headers_doc, json=payload)
        self.assertIn(r.status_code, (201,), msg=f"Esperado 201, obtenido {r.status_code} - {r.text}")
        data = r.json()
        self.assertIsInstance(data.get("id"), int)
        # FIX A1: Compara con el nombre normalizado
        self.assertEqual(data.get("nombre"), normalize_string(payload["nombre"]))

    # Caso A2: duplicado por normalización (CE2)
    def test_A2_crear_colegio_duplicado_normalizado(self):
        payload = {"nombre": "colegio nacional", "comuna": "santiago"}
        r = requests.post(f"{BASE}/api/colegios", headers=self.headers_doc, json=payload)
        self.assertEqual(r.status_code, 409, msg=f"Esperado 409, obtenido {r.status_code} - {r.text}")
        body = r.json()
        # FIX A2: Compara con el nombre normalizado
        self.assertTrue(any(sug.get("nombre") == "colegionacional" for sug in body.get("sugerencias", [])))