-- 02_data.sql
SET client_encoding = 'UTF8';

-- Usuarios locales (auth_origen='local' por DEFAULT; contraseñas hash de ejemplo)
COPY public.usuarios (id, nombre, correo, contrasena, rol) FROM stdin;
1	Juan Perez	juan@correo.com	$2a$10$EXAMPLEHASHFORJUANPEREZ1234567890123456789012345678901234567890	docente
2	Camila Yael Loayza Arredondo	caca@gmail.com	$2a$10$EXAMPLEHASHFORCAMILA1234567890123456789012345678901234567890	alumno
3	Agustin Santibañez	agus@gmail.com	$2a$10$EXAMPLEHASHFORAGUSTIN1234567890123456789012345678901234567890	docente
4	alicia	ali@gmail.com	$2a$10$EXAMPLEHASHFORALICIA1234567890123456789012345678901234567890	docente
\.

-- Materias
COPY public.materias (id, nombre) FROM stdin;
1	Lenguaje
2	Matematicas1
3	Matematicas2
4	Biologia
5	Quimica
6	Fisica
7	Historia y ciencias sociales
\.

-- Ensayos (docente_id=4 existe arriba)
COPY public.ensayos (id, nombre, fecha_creacion, docente_id, materia_id) FROM stdin;
1	Ensayo Lenguaje Prueba1	2025-06-13	4	1
\.

-- Usuarios ejemplo vía Google (contraseña NULL, correo verificado, auth_origen='google')
INSERT INTO public.usuarios (id, nombre, correo, contrasena, rol, avatar_url, correo_verificado, auth_origen)
VALUES
  (5, 'Valentina Google', 'valentina.oauth@demo.com', NULL, 'alumno',  'https://example.com/val.png', TRUE, 'google'),
  (6, 'Diego OAuth',      'diego.oauth@demo.com',     NULL, 'alumno',  'https://example.com/die.png', TRUE, 'google'),
  (7, 'Profe Google',     'profesor.oauth@demo.com',  NULL, 'docente', 'https://example.com/pro.png', TRUE, 'google')
ON CONFLICT (correo) DO NOTHING;

INSERT INTO public.usuario_proveedores (usuario_id, proveedor, proveedor_uid)
VALUES
  ((SELECT id FROM public.usuarios WHERE correo='valentina.oauth@demo.com'), 'google', 'google-sub-VAL-001'),
  ((SELECT id FROM public.usuarios WHERE correo='diego.oauth@demo.com'),     'google', 'google-sub-DIE-002'),
  ((SELECT id FROM public.usuarios WHERE correo='profesor.oauth@demo.com'),  'google', 'google-sub-PRO-003')
ON CONFLICT (proveedor, proveedor_uid) DO NOTHING;


--
-- Data for Name: preguntas; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.preguntas (id, enunciado, imagen, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, materia_id) FROM stdin;
1	¿Cuál es el resultado de 3 + 5?	\N	6	7	8	9	C	2
2	¿Que formula representa el Teorema de Pitágoras?	\N	a² + b² = c²	E = mc²	F = ma	V = IR	A	2
3	¿Que parte de la celula contiene el ADN?	\N	Mitocondria	Núcleo	Citoplasma	Ribosoma	B	4
4	¿Cuál es el simbolo quimico del sodio?	\N	Na	So	S	N	A	5
5	¿Cuál es el principal gas responsable del efecto invernadero?	\N	Oxigeno	Nitrogeno	Dioxido de carbono	Ozono	C	4
6	¿Quien escribio "Cien años de soledad"?	\N	Pablo Neruda	Mario Vargas Llosa	Gabriel Garcia Márquez	Isabel Allende	C	1
7	¿En que año fue la independencia de Chile?	\N	1810	1818	1821	1830	B	7
8	¿Que unidad se usa para medir la resistencia electrica?	\N	Voltio	Amperio	Ohmio	Vatio	C	6
9	¿Cuál es el sinonimo de 'perplejo'?	\N	Tranquilo	Confuso	Contento	Avergonzado	B	1
10	¿Que tipo de texto busca convencer al lector?	\N	Narrativo	Expositivo	Argumentativo	Descriptivo	C	1
11	¿Que figura literaria consiste en exagerar?	\N	Metáfora	Hiperbole	Anáfora	Paradoja	B	1
12	¿Cuál es el antonimo de 'ostentoso'?	\N	Modesto	Ruidoso	Elegante	Lujoso	A	1
13	En narrativa, ¿que funcion cumple el narrador omnisciente?	\N	Describir solo acciones	Saber todo de todos	Expresar sentimientos propios	Hablar con el lector	B	1
14	¿Que es una prosopopeya?	\N	Dar vida a objetos	Exagerar cualidades	Contradecir ideas	Repetir sonidos	A	1
15	¿Que palabra es un adverbio?	\N	Rápido	Rápidamente	Rapidez	Más rápido	B	1
16	¿Cuál de los siguientes es un texto funcional?	\N	Cuento	Carta formal	Poema	Novela	B	1
17	¿Que elemento es esencial en una carta argumentativa?	\N	Personajes	Tesis	Metáforas	Rima	B	1
18	Una oracion simple se caracteriza por...	\N	Un solo verbo conjugado	Dos proposiciones	Ningún verbo	Muchos sujetos	A	1
19	¿Cuál es la derivada de f(x)=x²?	\N	x	2x	x²	2	B	2
20	Si 2x+3=11, ¿cuánto vale x?	\N	3	4	5	6	C	2
21	Valor aproximado de √π:	\N	2.71	3.14	1.61	4.13	B	2
22	Grados internos de un triángulo:	\N	90	360	180	270	C	2
23	Area de un cuadrado de lado 4:	\N	8	12	16	20	C	2
24	Composicion f(g(x)) si f(x)=2x y g(x)=x+3:	\N	2x+3	2x+6	x+5	2x+9	B	2
25	Raiz cuadrada de 25:	\N	3	4	5	6	C	2
26	Número primo se define como...	\N	Tiene 2 divisores	Es par	Mayor que 100	Divisible entre todos	A	2
27	Pendiente de y=3x+2:	\N	2	3	5	0	B	2
28	Discriminante indica...	\N	Raiz	Coeficiente	Tipo de soluciones	Suma de raices	C	2
29	¿Cuál es el valor de lim(x→0) sinx/x?	\N	0	1	∞	No existe	B	3
30	Integral ∫x dx:	\N	x²	1/x	x²/2	ln(x)	C	3
31	Funcion continua significa...	\N	Derivable en todo punto	Sin saltos	No existe	Lineal	B	3
32	Derivada de ln(x):	\N	1/x	x	ln(x)	0	A	3
33	Definicion de limite:	\N	Valor minimo	Valor medio	Valor al que se aproxima	Raiz	C	3
34	Derivada de e^x:	\N	e^x	x²e^x	ln(x)	1	A	3
35	Una asintota es...	\N	Curva máxima	Punto de corte	Recta cercana	Area total	C	3
36	Area bajo y=x entre 0 y 1:	\N	1	0.5	2	1.5	B	3
37	Funcion par es...	\N	Simetrica eje Y	Simetrica eje X	No definida	Solo creciente	A	3
38	Derivada de cos(x):	\N	sen(x)	-cos(x)	-sen(x)	tan(x)	C	3
39	Unidad estructural de los seres vivos:	\N	Tejido	Celula	Atomo	Molecula	B	4
40	Organelo donde ocurre la fotosintesis:	\N	Mitocondria	Cloroplasto	Ribosoma	Núcleo	B	4
41	Molecula que transporta energia (ATP):	\N	Lisosoma	Mitocondria	Golgi	Cloroplasto	B	4
42	Fase de la mitosis donde se alinean cromosomas:	\N	Profase	Metafase	Anafase	Telofase	B	4
43	Reproduccion bacteriana ocurre por...	\N	Fision binaria	Meiosis	Fecundacion	Gemacion	A	4
44	Base en ARN que no está en ADN:	\N	Adenina	Guanina	Uracilo	Citosina	C	4
45	Pigmento verde de plantas:	\N	Melanina	Clorofila	Hemoglobina	Caroteno	B	4
46	Proceso donde ADN → ARN:	\N	Replicacion	Transcripcion	Traduccion	Splicing	B	4
47	Plural de "celula madre":	\N	Celulas madres	Celulas madre	Celules madre	Celula madres	B	4
48	Organismo heterotrofo se alimenta de...	\N	Materia orgánica	Luz	CO2	Agua	A	4
49	Número atomico del oxigeno:	\N	6	7	8	9	C	5
50	Enlace metal-no metal es...	\N	Covalente	Ionico	Metálico	Puente H	B	5
51	pH neutro a 25°C:	\N	0	7	14	5	B	5
52	Estado con forma y volumen definidos:	\N	Solido	Liquido	Gas	Plasma	A	5
53	Combustion completa de CH₄ produce...	\N	CO	CO2	H2O	C	B	5
54	Mol/L se llama...	\N	Molalidad	Molaridad	Normalidad	Fraccion molar	B	5
55	Cation Na+ indica...	\N	Protones menos	Electrones menos	Neutrones menos	Electrones más	B	5
56	Isomero con distinto arreglo espacial:	\N	Geometrico	Cadena	Posicion	Funcional	A	5
57	Grupo -OH en orgánicos es...	\N	Carboxilo	Hidroxilo	Amino	Carbonilo	B	5
58	Ley de Boyle establece...	\N	V ∝ T	P ∝ V	P²V = cte	n ∝ T	C	5
59	Segunda ley de Newton:	\N	Conservacion energia	Accion = Reaccion	F = m²a	Momento constante	C	6
60	Unidad de fuerza SI:	\N	Joule	Pascal	Newton	Watt	C	6
61	Velocidad constante implica...	\N	Aceleracion cero	Fuerza constante	Trabajo nulo	Momentum cero	A	6
62	Al proyectil a 45° alcance depende de...	\N	Masa	Altura	Velocidad inicial	Area frontal	C	6
63	Energia cinetica es...	\N	½mv²	mgh	mc²	p²/2m	A	6
64	Gravedad Tierra aprox.:	\N	8.9 m/s²	9.8 m/s²	10.8 m/s²	9.8 km/s²	B	6
65	Corriente electrica unidad:	\N	Voltio	Ohmio	Amperio	Watt	C	6
66	Ley de Ohm es...	\N	V=R/I	I=V/R	R=I/V	P=I²R	B	6
67	Inductor almacena energia en...	\N	Campo electrico	Campo magnetico	Calor	Luz	B	6
68	Resonancia ocurre cuando...	\N	F externa aleatoria	Frec igual frec natural	No amortiguado	Masa variable	B	6
69	Revolucion Francesa inicio en...	\N	1789	1810	1492	1914	A	7
70	Primer presidente de Chile:	\N	O'Higgins	Portales	Blanco Encalada	Bulnes	C	7
71	Guerra Fria fue...	\N	Armado mundial	Ideologico	Civil europeo	Industrial	B	7
72	ONU significa...	\N	Organismo Nacional Unido	Organizacion de Naciones Unidas	Oficina Nacional Unificada	Orden Nuevo Universal	B	7
73	Causa inmediata WWI fue...	\N	Pearl Harbor	Caida URSS	Asesinato archiduque	Golpe alemán	C	7
74	Tratado Versailles termino WWI:	\N	Paris 1763	Bretton Woods	Versalles	Tordesillas	C	7
75	Conquista de America inicio:	\N	1492	1776	1812	1521	A	7
76	Independencia de Chile en...	\N	1810	1818	1833	1823	B	7
77	Parlamentarismo chileno fue...	\N	1818-1833	1891-1925	1925-1973	1973-1990	B	7
78	Plan Marshall buscaba...	\N	Aislar URSS	Reconstruir Europa	Colonizar	Expandir comunismo	B	7
80	¿Que detalle secundario apoya a la idea principal?	\N	Una estadistica	La idea principal	El titulo	La conclusion	A	1
81	¿Como resumirias el mensaje del primer párrafo?	\N	Con una cita textual	Con una frase breve	Con un dibujo	Con un indice	B	1
82	¿Que funcion cumple el titulo en un articulo informativo?	\N	Describir el contenido	Introducir al autor	Convencer al lector	Ofrecer conclusiones	A	1
83	¿Que tono utiliza el autor en el segundo párrafo?	\N	Formal	Humoristico	Despectivo	Ironico	A	1
86	¿Como cambia la perspectiva cuando pasa de un narrador a otro?	\N	La gramática	El punto de vista	El estilo	El tamaño	B	1
88	¿Como impacta la estructura en la comprension global?	\N	Mejora la claridad	Hace confuso	No cambia nada	Ignora al lector	A	1
92	¿Que evidencia usa el autor para reforzar su argumento?	\N	Cita de experto	Historieta	Anecdota familiar	Chiste	A	1
95	¿Cuál es el efecto del uso de preguntas en el texto?	\N	Confunde	Aburre	Involucra al lector	Ignora	C	1
98	¿Que sinonimo de "dicotomia" aparece implicitamente?	\N	Dualidad	Unidad	Pluralidad	Sencillez	A	1
99	¿Que indica el uso de cursivas en una palabra?	\N	Enfasis	Error tipográfico	Titulo	Lista	A	1
100	¿Que funcion tiene el subtitulo en la organizacion?	\N	Guia al lector	Decora	Nada	Es redundante	A	1
108	¿Que connotacion tiene la palabra "sombra"?	\N	Algo positivo	Algo negativo	Neutra	Abstracta	B	1
110	¿Que pregunta guia la estructura del texto?	\N	Pregunta central	Pregunta secundaria	Pregunta irrelevante	No hay pregunta	A	1
111	¿Como varia el registro lingúistico?	\N	Formal a informal	Informal a coloquial	No varia	Es mixto	A	1
112	¿Que funcion cumple la enumeracion?	\N	Ordenar ideas	Aburrir	Confundir	Excluir	A	1
114	¿Cuál es el efecto de la repeticion?	\N	Cansa	Refuerza concepto	Nada	Reduce ideas	B	1
116	¿Como influye el uso de adverbios?	\N	Explica	No cambia	Aburre	Modifica tono	D	1
118	¿Que topico se retoma al final?	\N	Chiste	Tema nuevo	Idea inicial	Anecdota	C	1
119	¿Como conecta el autor la introduccion con la conclusion?	\N	Conector logico	Cambio abrupto	Nada	Chiste	A	1
120	¿Que implicacion surge del tono critico?	\N	Neutralidad	Aceptacion	Rechazo de idea	Confusion	C	1
121	¿Por que el autor menciona ese personaje historico?	\N	Ejemplifica punto	Decora	No motivo	Error	A	1
122	¿Que rol cumple la estadistica en el texto?	\N	Confunde lector	Respalda argumento	Decora	Nadie sabe	B	1
124	¿Que matiz aporta la voz en primera persona?	\N	Subjetividad	Objetividad	Neutralidad	Rigor	A	1
125	¿Como distingue el autor causa de consecuencia?	\N	Con conectores	No distingue	Con preguntas	Con cifras	A	1
133	¿Que pregunta podria formular un lector critico?	\N	¿Es válida la fuente?	¿Hace calor?	¿Donde vive el autor?	¿Cuál es su edad?	A	1
134	¿Que diferencia hay entre esa frase y la anterior?	\N	Tono	Longitud	Tema	Nada	A	1
135	¿Cuál es la relacion entre idea y evidencia?	\N	Apoyo	Contradiccion	Error	Sin relacion	A	1
136	¿Que estrategia persuasiva usa el autor?	\N	Apelacion emocional	Datos duros	Humor	Ironia	A	1
137	¿Como transforma el significado el contexto?	\N	Modifica interpretacion	No cambia	Confunde	Divide	A	1
139	¿Que efecto produce la enumeracion de datos?	\N	Organiza informacion	Aburre lector	Confunde	Destaca cifras	A	1
141	¿Que elemento conecta los distintos apartados?	\N	Conectores	Imágenes	Chistes	Listas	A	1
143	¿Cuál es el proposito principal del autor al mencionar estadisticas?	\N	Informar	Entretener	Persuadir	Criticar	A	1
144	¿Que tipo de lector atrae el prefacio?	\N	Investigar	Estudiante	Profesional	Público general	D	1
147	¿Que sugiere el uso de preguntas retoricas?	\N	Descartar ideas	Enfatizar puntos	Confundir al lector	Narrar historia	B	1
149	¿Donde aparece la conclusion principal?	\N	Al inicio	En el cuerpo	Al final	No está presente	C	1
150	¿Que funcion cumple el subtitulo?	\N	Ordenar secciones	Resumir contenido	Ilustrar ideas	Dividir capitulos	D	1
154	¿Que conector marca cambio de idea?	\N	Además	Sin embargo	Por lo tanto	Finalmente	B	1
159	¿Cuál es la funcion del epigrafe?	\N	Citar autor	Resumir capitulo	Introducir tema	Decorar portada	C	1
160	¿Como se describe el estilo periodistico?	\N	Tecnico	Claro	Complejo	Metaforico	B	1
163	¿Como cambia la atmosfera al mencionar el clima?	\N	Se enlaza	Se contrasta	Se omite	Se exagera	B	1
166	¿Que efecto produce la comparacion repetida?	\N	Enfatizar	Aburrir	Equilibrar	Dividir	A	1
171	¿Que funcion cumple la introduccion de datos historicos?	\N	Contextualizar	Describir	Criticar	Analizar	A	1
172	¿Que efecto produce el cambio de narrador?	\N	Variedad	Monotonia	Interrupcion	Unificacion	A	1
174	¿Como se relaciona el titulo con el contenido?	\N	Irrelevante	Esencial	Decorativo	Contradictorio	B	1
176	¿Que sugiere el uso de guiones en la lista?	\N	Enfasis	Listado	Secuencia	Conexion	B	1
177	¿Que matiz aporta la alusion historica?	\N	Nostalgia	Humor	Ciencia	Arte	A	1
178	¿Que caracteristica define el cierre del texto?	\N	Resumen	Pregunta	Declaracion	Exclamacion	B	1
180	¿Que simboliza la "puerta" al inicio?	\N	Oportunidad	Miedo	Meta	Camino	A	1
181	¿Cuál es la intencion al usar anáfora al final?	\N	Repetir idea	Crear ritmo	Confundir	Enumerar	B	1
182	¿Que funcion persuasiva usa el autor?	\N	Apelacion emocional	Datos duros	Humor	Ironia	A	1
183	¿Como transforma el significado el contexto?	\N	Modifica interpretacion	No cambia	Confunde	Divide	A	1
184	¿Que recurso de coherencia hay entre párrafos?	\N	Conector	Repeticion	Enumeracion	Chiste	A	1
185	¿Cuál es la derivada de f(x) = x^2?	\N	2x^1	x^2	1x^2	2x^2	A	2
186	¿Cuál es la derivada de f(x) = x^3?	\N	3x^2	x^3	2x^3	3x^3	A	2
187	¿Cuál es la derivada de f(x) = x^4?	\N	4x^3	x^4	3x^4	4x^4	A	2
188	¿Cuál es la derivada de f(x) = x^5?	\N	5x^4	x^5	4x^5	5x^5	A	2
189	¿Cuál es la derivada de f(x) = x^6?	\N	6x^5	x^6	5x^6	6x^6	A	2
190	¿Cuál es la derivada de f(x) = x^7?	\N	7x^6	x^7	6x^7	7x^7	A	2
191	¿Cuál es la derivada de f(x) = x^8?	\N	8x^7	x^8	7x^8	8x^8	A	2
192	¿Cuál es la derivada de f(x) = x^9?	\N	9x^8	x^9	8x^9	9x^9	A	2
193	¿Cuál es la derivada de f(x) = x^10?	\N	10x^9	x^10	9x^10	10x^10	A	2
194	¿Cuál es la derivada de f(x) = x^11?	\N	11x^10	x^11	10x^11	11x^11	A	2
195	¿Cuál es la derivada de f(x) = x^12?	\N	12x^11	x^12	11x^12	12x^12	A	2
196	¿Cuál es la derivada de f(x) = x^13?	\N	13x^12	x^13	12x^13	13x^13	A	2
197	¿Cuál es la derivada de f(x) = x^14?	\N	14x^13	x^14	13x^14	14x^14	A	2
198	¿Cuál es la derivada de f(x) = x^15?	\N	15x^14	x^15	14x^15	15x^15	A	2
199	¿Cuál es la derivada de f(x) = x^16?	\N	16x^15	x^16	15x^16	16x^16	A	2
200	¿Cuál es la derivada de f(x) = x^17?	\N	17x^16	x^17	16x^17	17x^17	A	2
201	¿Cuál es la derivada de f(x) = x^18?	\N	18x^17	x^18	17x^18	18x^18	A	2
202	¿Cuál es la derivada de f(x) = x^19?	\N	19x^18	x^19	18x^19	19x^19	A	2
203	¿Cuál es la derivada de f(x) = x^20?	\N	20x^19	x^20	19x^20	20x^20	A	2
204	¿Cuál es la derivada de f(x) = x^21?	\N	21x^20	x^21	20x^21	21x^21	A	2
205	Si 2x + 2 = 6, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
206	Si 2x + 3 = 7, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
207	Si 2x + 4 = 8, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
208	Si 2x + 5 = 9, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
209	Si 2x + 6 = 10, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
210	Si 2x + 7 = 11, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
211	Si 2x + 8 = 12, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
212	Si 2x + 9 = 13, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
213	Si 2x + 10 = 14, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
214	Si 2x + 11 = 15, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
215	Si 2x + 12 = 16, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
216	Si 2x + 13 = 17, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
217	Si 2x + 14 = 18, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
218	Si 2x + 15 = 19, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
219	Si 2x + 16 = 20, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
220	Si 2x + 17 = 21, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
221	Si 2x + 18 = 22, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
222	Si 2x + 19 = 23, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
223	Si 2x + 20 = 24, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
224	Si 2x + 21 = 25, ¿cuál es el valor de x?	\N	1	2	3	4	B	2
225	¿Cuál es la integral de x^0 dx?	\N	x^1/1 + C	x^0/0 + C	(n)x^-1 + C	x^2/2 + C	A	2
226	¿Cuál es la integral de x^1 dx?	\N	x^2/2 + C	x^1/1 + C	(n)x^0 + C	x^3/3 + C	A	2
227	¿Cuál es la integral de x^2 dx?	\N	x^3/3 + C	x^2/2 + C	(n)x^1 + C	x^4/4 + C	A	2
228	¿Cuál es la integral de x^3 dx?	\N	x^4/4 + C	x^3/3 + C	(n)x^2 + C	x^5/5 + C	A	2
229	¿Cuál es la integral de x^4 dx?	\N	x^5/5 + C	x^4/4 + C	(n)x^3 + C	x^6/6 + C	A	2
230	¿Cuál es la integral de x^5 dx?	\N	x^6/6 + C	x^5/5 + C	(n)x^4 + C	x^7/7 + C	A	2
231	¿Cuál es la integral de x^6 dx?	\N	x^7/7 + C	x^6/6 + C	(n)x^5 + C	x^8/8 + C	A	2
232	¿Cuál es la integral de x^7 dx?	\N	x^8/8 + C	x^7/7 + C	(n)x^6 + C	x^9/9 + C	A	2
233	¿Cuál es la integral de x^8 dx?	\N	x^9/9 + C	x^8/8 + C	(n)x^7 + C	x^10/10 + C	A	2
234	¿Cuál es la integral de x^9 dx?	\N	x^10/10 + C	x^9/9 + C	(n)x^8 + C	x^11/11 + C	A	2
235	¿Cuál es la integral de x^10 dx?	\N	x^11/11 + C	x^10/10 + C	(n)x^9 + C	x^12/12 + C	A	2
236	¿Cuál es la integral de x^11 dx?	\N	x^12/12 + C	x^11/11 + C	(n)x^10 + C	x^13/13 + C	A	2
237	¿Cuál es la integral de x^12 dx?	\N	x^13/13 + C	x^12/12 + C	(n)x^11 + C	x^14/14 + C	A	2
238	¿Cuál es la integral de x^13 dx?	\N	x^14/14 + C	x^13/13 + C	(n)x^12 + C	x^15/15 + C	A	2
239	¿Cuál es la integral de x^14 dx?	\N	x^15/15 + C	x^14/14 + C	(n)x^13 + C	x^16/16 + C	A	2
240	¿Cuál es la integral de x^15 dx?	\N	x^16/16 + C	x^15/15 + C	(n)x^14 + C	x^17/17 + C	A	2
241	¿Cuál es la integral de x^16 dx?	\N	x^17/17 + C	x^16/16 + C	(n)x^15 + C	x^18/18 + C	A	2
242	¿Cuál es la integral de x^17 dx?	\N	x^18/18 + C	x^17/17 + C	(n)x^16 + C	x^19/19 + C	A	2
243	¿Cuál es la integral de x^18 dx?	\N	x^19/19 + C	x^18/18 + C	(n)x^17 + C	x^20/20 + C	A	2
244	¿Cuál es la integral de x^19 dx?	\N	x^20/20 + C	x^19/19 + C	(n)x^18 + C	x^21/21 + C	A	2
245	¿Cuál es el área de un cuadrado de lado 3?	\N	9	10	8	6	A	2
246	¿Cuál es el área de un cuadrado de lado 4?	\N	16	17	15	8	A	2
247	¿Cuál es el área de un cuadrado de lado 5?	\N	25	26	24	10	A	2
248	¿Cuál es el área de un cuadrado de lado 6?	\N	36	37	35	12	A	2
249	¿Cuál es el área de un cuadrado de lado 7?	\N	49	50	48	14	A	2
250	¿Cuál es el área de un rectángulo de base 2 y altura 3?	\N	6	7	5	5	A	2
251	¿Cuál es el área de un rectángulo de base 2 y altura 4?	\N	8	9	7	6	A	2
252	¿Cuál es el área de un rectángulo de base 3 y altura 3?	\N	9	10	8	6	A	2
253	¿Cuál es el área de un rectángulo de base 3 y altura 4?	\N	12	13	11	7	A	2
254	¿Cuál es el área de un rectángulo de base 4 y altura 3?	\N	12	13	11	7	A	2
255	¿Cuál es el área de un rectángulo de base 4 y altura 4?	\N	16	17	15	8	A	2
256	¿Cuál es el área de un rectángulo de base 5 y altura 3?	\N	15	16	14	8	A	2
257	¿Cuál es el área de un rectángulo de base 5 y altura 4?	\N	20	21	19	9	A	2
258	¿Cuál es el área de un rectángulo de base 6 y altura 3?	\N	18	19	17	9	A	2
259	¿Cuál es el área de un rectángulo de base 6 y altura 4?	\N	24	25	23	10	A	2
260	¿Cuál es el área de un circulo de radio 2? (usar π≈3.14)	\N	12.56	15.7	9.42	18.84	A	2
261	¿Cuál es el área de un circulo de radio 3? (usar π≈3.14)	\N	28.26	31.4	25.12	34.54	A	2
262	¿Cuál es el área de un circulo de radio 4? (usar π≈3.14)	\N	50.24	53.38	47.1	56.52	A	2
263	¿Cuál es el área de un circulo de radio 5? (usar π≈3.14)	\N	78.5	81.64	75.36	84.78	A	2
264	¿Cuál es el área de un circulo de radio 6? (usar π≈3.14)	\N	113.04	116.18	109.9	119.32	A	2
535	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Cuál es la idea principal del párrafo 1?	\N	Narrar un suceso personal	Presentar una critica	Citar un estudio externo	Definir el concepto principal	D	1
536	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que estrategia retorica predomina en el párrafo 1?	\N	Uso de evidencia	Hiperbole	Metáfora	Pregunta retorica	A	1
537	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que informacion clave aporta el párrafo 1?	\N	Detalles de el desarrollo sostenible	Anecdotas irrelevantes	Datos historicos	Citas literarias	A	1
538	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que funcion cumple el parrafo 1?	\N	Introducir	Desarrollar	Concluir	Criticar	A	1
539	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que intencion tiene el autor al escribir el párrafo 1?	\N	Explicar un punto clave	Entretener con humor	Confundir al lector	Ignorar datos	A	1
540	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Como afecta el tono en el párrafo 1 a la comprension?	\N	Lo hace más claro	Lo hace confuso	No cambia nada	Lo hace humoristico	A	1
541	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que pregunta retorica hay en el párrafo 1?	\N	Ninguna	¿No es evidente?	¿Por que no funciona?	¿Como evitarlo?	A	1
543	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que transicion hace el párrafo 1 hacia el siguiente?	\N	Con comillas	Con cambio de seccion	Con conjuncion	Con signo de exclamacion	C	1
546	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Cuál es la idea principal del párrafo 2?	\N	Criticar el desarrollo	Destacar tecnologia	Analizar la sociedad	Ignorar innovacion	B	1
551	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Como se compara la tesis del párrafo 2 con la del párrafo 1?	\N	Igual	Opuesta	Complementaria	Sin relacion	C	1
558	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que efecto tiene la ausencia de politicas en el párrafo 3?	\N	Ignora problemas	Reduce impacto	Mejora soluciones	Crea confusion	B	1
561	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que solucion propone el párrafo 3?	\N	Nuevas tecnologias	Más investigacion	Marcos regulatorios	Menos inversion	C	1
583	¿Cuál es la funcion principal de los globulos rojos?	\N	Defensa inmunologica	Transporte de oxigeno	Coagulacion	Transporte de nutrientes	B	4
584	¿Que parte del sistema nervioso controla las funciones involuntarias?	\N	Sistema nervioso central	Sistema nervioso periferico	Sistema nervioso autonomo	Cerebelo	C	4
585	¿Que hormona regula los niveles de glucosa en sangre?	\N	Insulina	Adrenalina	Testosterona	Estrogeno	A	4
586	¿Que tipo de reproduccion no implica la fusion de gametos?	\N	Sexual	Asexual	Meiosis	Fusion	B	4
587	¿Que caracteristica define a los organismos autotrofos?	\N	Ingestan otros organismos	Producen su propio alimento	Viven en simbiosis	Absorben nutrientes	B	4
\.


--
-- Data for Name: ensayo_pregunta; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.ensayo_pregunta (id, ensayo_id, pregunta_id) FROM stdin;
1	1	6
2	1	9
3	1	10
4	1	11
5	1	12
6	1	13
7	1	15
8	1	88
9	1	535
10	1	118
11	1	100
12	1	98
13	1	86
14	1	541
15	1	183
16	1	182
17	1	551
18	1	546
19	1	558
20	1	538
21	1	561
22	1	150
23	1	144
24	1	163
25	1	166
\.


--
-- Data for Name: resultados; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.resultados (id, ensayo_id, alumno_id, puntaje, fecha) FROM stdin;
\.


--
-- Data for Name: respuestas; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.respuestas (id, resultado_id, pregunta_id, respuesta_dada, correcta) FROM stdin;
\.

-- Alinear TODAS las secuencias al valor máximo actual (evita PK duplicadas)
SELECT setval('public.usuarios_id_seq',          (SELECT COALESCE(MAX(id),1) FROM public.usuarios), TRUE);
SELECT setval('public.materias_id_seq',          (SELECT COALESCE(MAX(id),1) FROM public.materias), TRUE);
SELECT setval('public.preguntas_id_seq',         (SELECT COALESCE(MAX(id),1) FROM public.preguntas), TRUE);
SELECT setval('public.ensayos_id_seq',           (SELECT COALESCE(MAX(id),1) FROM public.ensayos), TRUE);
SELECT setval('public.ensayo_pregunta_id_seq',   (SELECT COALESCE(MAX(id),1) FROM public.ensayo_pregunta), TRUE);
SELECT setval('public.resultados_id_seq',        (SELECT COALESCE(MAX(id),1) FROM public.resultados), TRUE);
SELECT setval('public.respuestas_id_seq',        (SELECT COALESCE(MAX(id),1) FROM public.respuestas), TRUE);

