--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 15.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ensayo_pregunta; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.ensayo_pregunta (
    id integer NOT NULL,
    ensayo_id integer,
    pregunta_id integer
);


ALTER TABLE public.ensayo_pregunta OWNER TO "user";

--
-- Name: ensayo_pregunta_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.ensayo_pregunta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ensayo_pregunta_id_seq OWNER TO "user";

--
-- Name: ensayo_pregunta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.ensayo_pregunta_id_seq OWNED BY public.ensayo_pregunta.id;


--
-- Name: ensayos; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.ensayos (
    id integer NOT NULL,
    nombre character varying(100),
    fecha_creacion date,
    docente_id integer,
    materia_id integer
);


ALTER TABLE public.ensayos OWNER TO "user";

--
-- Name: ensayos_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.ensayos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ensayos_id_seq OWNER TO "user";

--
-- Name: ensayos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.ensayos_id_seq OWNED BY public.ensayos.id;


--
-- Name: materias; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.materias (
    id integer NOT NULL,
    nombre character varying(100)
);


ALTER TABLE public.materias OWNER TO "user";

--
-- Name: materias_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.materias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.materias_id_seq OWNER TO "user";

--
-- Name: materias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.materias_id_seq OWNED BY public.materias.id;


--
-- Name: preguntas; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.preguntas (
    id integer NOT NULL,
    enunciado text,
    imagen character varying(255),
    opcion_a character varying(255),
    opcion_b character varying(255),
    opcion_c character varying(255),
    opcion_d character varying(255),
    respuesta_correcta character varying(1),
    materia_id integer,
    CONSTRAINT preguntas_respuesta_correcta_check CHECK (((respuesta_correcta)::text = ANY ((ARRAY['A'::character varying, 'B'::character varying, 'C'::character varying, 'D'::character varying])::text[])))
);


ALTER TABLE public.preguntas OWNER TO "user";

--
-- Name: preguntas_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.preguntas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.preguntas_id_seq OWNER TO "user";

--
-- Name: preguntas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.preguntas_id_seq OWNED BY public.preguntas.id;


--
-- Name: respuestas; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.respuestas (
    id integer NOT NULL,
    resultado_id integer,
    pregunta_id integer,
    respuesta_dada character varying(1),
    correcta boolean,
    CONSTRAINT respuestas_respuesta_dada_check CHECK (((respuesta_dada)::text = ANY ((ARRAY['A'::character varying, 'B'::character varying, 'C'::character varying, 'D'::character varying])::text[])))
);


ALTER TABLE public.respuestas OWNER TO "user";

--
-- Name: respuestas_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.respuestas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.respuestas_id_seq OWNER TO "user";

--
-- Name: respuestas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.respuestas_id_seq OWNED BY public.respuestas.id;


--
-- Name: resultados; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.resultados (
    id integer NOT NULL,
    ensayo_id integer,
    alumno_id integer,
    puntaje integer,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.resultados OWNER TO "user";

--
-- Name: resultados_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.resultados_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.resultados_id_seq OWNER TO "user";

--
-- Name: resultados_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.resultados_id_seq OWNED BY public.resultados.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100),
    correo character varying(100),
    contrasena character varying(255),
    rol character varying(10),
    CONSTRAINT usuarios_rol_check CHECK (((rol)::text = ANY ((ARRAY['alumno'::character varying, 'docente'::character varying])::text[])))
);


ALTER TABLE public.usuarios OWNER TO "user";

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuarios_id_seq OWNER TO "user";

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: ensayo_pregunta id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.ensayo_pregunta ALTER COLUMN id SET DEFAULT nextval('public.ensayo_pregunta_id_seq'::regclass);


--
-- Name: ensayos id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.ensayos ALTER COLUMN id SET DEFAULT nextval('public.ensayos_id_seq'::regclass);


--
-- Name: materias id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.materias ALTER COLUMN id SET DEFAULT nextval('public.materias_id_seq'::regclass);


--
-- Name: preguntas id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.preguntas ALTER COLUMN id SET DEFAULT nextval('public.preguntas_id_seq'::regclass);


--
-- Name: respuestas id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.respuestas ALTER COLUMN id SET DEFAULT nextval('public.respuestas_id_seq'::regclass);


--
-- Name: resultados id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.resultados ALTER COLUMN id SET DEFAULT nextval('public.resultados_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


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
-- Data for Name: ensayos; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.ensayos (id, nombre, fecha_creacion, docente_id, materia_id) FROM stdin;
1	Ensayo Lenguaje Prueba1	2025-06-13	4	1
\.


--
-- Data for Name: materias; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.materias (id, nombre) FROM stdin;
1	Lenguaje
2	Matematicas1
3	Matematicas2
4	Biologia
5	Quimica
6	Fisica
7	Historia y ciencias sociales
\.


--
-- Data for Name: preguntas; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.preguntas (id, enunciado, imagen, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, materia_id) FROM stdin;
1	¿Cuál es el resultado de 3 + 5?		6	7	8	9	C	2
2	¿Que formula representa el Teorema de Pitágoras?		a² + b² = c²	E = mc²	F = ma	V = IR	A	2
3	¿Que parte de la celula contiene el ADN?		Mitocondria	Núcleo	Citoplasma	Ribosoma	B	4
4	¿Cuál es el simbolo quimico del sodio?		Na	So	S	N	A	5
5	¿Cuál es el principal gas responsable del efecto invernadero?		Oxigeno	Nitrogeno	Dioxido de carbono	Ozono	C	4
6	¿Quien escribio "Cien años de soledad"?		Pablo Neruda	Mario Vargas Llosa	Gabriel Garcia Márquez	Isabel Allende	C	1
7	¿En que año fue la independencia de Chile?		1810	1818	1821	1830	B	7
8	¿Que unidad se usa para medir la resistencia electrica?		Voltio	Amperio	Ohmio	Vatio	C	6
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
21	Valor aproximado de ¤Ç:	\N	2.71	3.14	1.61	4.13	B	2
22	Grados internos de un triángulo:	\N	90	360	180	270	C	2
23	Area de un cuadrado de lado 4:	\N	8	12	16	20	C	2
24	Composicion f(g(x)) si f(x)=2x y g(x)=x+3:	\N	2x+3	2x+6	x+5	2x+9	B	2
25	Raiz cuadrada de 25:	\N	3	4	5	6	C	2
26	Número primo se define como...	\N	Tiene 2 divisores	Es par	Mayor que 100	Divisible entre todos	A	2
27	Pendiente de y=3x+2:	\N	2	3	5	0	B	2
28	Discriminante indica...	\N	Raiz	Coeficiente	Tipo de soluciones	Suma de raices	C	2
29	¿Cuál es el valor de lim(x→0) sinx/x?	\N	0	1	por	No existe	B	3
30	Integral Ôê½x dx:	\N	x²	1/x	x²/2	ln(x)	C	3
31	Funcion continua significa...	\N	Derivable en todo punto	Sin saltos	No existe	Lineal	B	3
32	Derivada de ln(x):	\N	1/x	x	ln(x)	0	A	3
33	Definicion de limite:	\N	Valor minimo	Valor medio	Valor al que se aproxima	Raiz	C	3
34	Derivada de e^x:	\N	e^x	x²e^x	ln(x)	1	A	3
35	Una asintota es...	\N	Curva máxima	Punto de corte	Recta cercana	area total	C	3
36	Area bajo y=x entre 0 y 1:	\N	1	0.5	2	1.5	B	3
37	Funcion par es...	\N	Simetrica eje Y	Simetrica eje X	No definida	Solo creciente	A	3
38	Derivada de cos(x):	\N	sen(x)	-cos(x)	-sen(x)	tan(x)	C	3
39	Unidad estructural de los seres vivos:	\N	Tejido	Celula	atomo	Molecula	B	4
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
53	Combustion completa de CHÔéä produce...	\N	CO	CO2	H2O	C	B	5
54	Mol/L se llama...	\N	Molalidad	Molaridad	Normalidad	Fraccion molar	B	5
55	Cation Na+ indica...	\N	Protones menos	Electrones menos	Neutrones menos	Electrones más	B	5
56	Isomero con distinto arreglo espacial:	\N	Geometrico	Cadena	Posicion	Funcional	A	5
57	Grupo -OH en orgánicos es...	\N	Carboxilo	Hidroxilo	Amino	Carbonilo	B	5
58	Ley de Boyle establece...	\N	V ÔêØ T	P ÔêØ V	P²V = cte	n ÔêØ T	C	5
59	Segunda ley de Newton:	\N	Conservacion energia	Accion = Reaccion	F = m²a	Momento constante	C	6
60	Unidad de fuerza SI:	\N	Joule	Pascal	Newton	Watt	C	6
61	Velocidad constante implica...	\N	Aceleracion cero	Fuerza constante	Trabajo nulo	Momentum cero	A	6
62	Al proyectil a 45° alcance depende de...	\N	Masa	Altura	Velocidad inicial	area frontal	C	6
63	Energia cinetica es...	\N	½²m²v²	m²g²h	m²c²	p²/2m	A	6
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
536	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que estrategia retorica predomina en el párrafo 1?	\N	Uso de evidencia	Hiperbole	Metáfora	Pregunta retorica	A	1
537	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que informacion clave aporta el párrafo 1?	\N	Detalles de el desarrollo sostenible	Anecdotas irrelevantes	Datos historicos	Citas literarias	A	1
88	¿Como impacta la estructura en la comprension global?	\N	Mejora la claridad	Hace confuso	No cambia nada	Ignora al lector	A	1
535	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Cuál es la idea principal del párrafo 1?	\N	Narrar un suceso personal	Presentar una critica	Citar un estudio externo	Definir el concepto principal	D	1
108	¿Que connotacion tiene la palabra "sombra"?	\N	Algo positivo	Algo negativo	Neutra	Abstracta	B	1
95	¿Cuál es el efecto del uso de preguntas en el texto?	\N	Confunde	Aburre	Involucra al lector	Ignora	C	1
92	¿Que evidencia usa el autor para reforzar su argumento?	\N	Cita de experto	Historieta	Anecdota familiar	Chiste	A	1
120	¿Que implicacion surge del tono critico?	\N	Neutralidad	Aceptacion	Rechazo de idea	Confusion	C	1
114	¿Cuál es el efecto de la repeticion?	\N	Cansa	Refuerza concepto	Nada	Reduce ideas	B	1
116	¿Como influye el uso de adverbios?	\N	Explica	No cambia	Aburre	Modifica tono	D	1
122	¿Que rol cumple la estadistica en el texto?	\N	Confunde lector	Respalda argumento	Decora	Nadie sabe	B	1
98	¿Que sinonimo de "dicotomia≤ aparece implicitamente?	\N	Dualidad	Unidad	Pluralidad	Sencillez	A	1
100	¿Que funcion tiene el subtitulo en la organizacion?	\N	Guia al lector	Decora	Nada	Es redundante	A	1
118	¿Que topico se retoma al final?	\N	Chiste	Tema nuevo	Idea inicial	Anecdota	C	1
86	¿Como cambia la perspectiva cuando pasa de un narrador a otro?	\N	La gramática	El punto de vista	El estilo	El tamaño	B	1
583	¿Cuál es la funcion principal de los globulos rojos?	\N	Defensa inmunologica	Transporte de oxigeno	Coagulacion	Transporte de nutrientes	B	4
584	¿Que parte del sistema nervioso controla las funciones involuntarias?	\N	Sistema nervioso central	Sistema nervioso periferico	Sistema nervioso autonomo	Cerebelo	C	4
585	¿Que hormona regula los niveles de glucosa en sangre?	\N	Insulina	Adrenalina	Testosterona	Estrogeno	A	4
586	¿Que tipo de reproduccion no implica la fusion de gametos?	\N	Sexual	Asexual	Meiosis	Fusion	B	4
587	¿Que caracteristica define a los organismos autotrofos?	\N	Ingestan otros organismos	Producen su propio alimento	Viven en simbiosis	Absorben nutrientes	B	4
110	¿Que pregunta guia la estructura del texto?	\N	Pregunta central	Pregunta secundaria	Pregunta irrelevante	No hay pregunta	A	1
111	¿Como varia el registro lingúistico?	\N	Formal a informal	Informal a coloquial	No varia	Es mixto	A	1
112	¿Que funcion cumple la enumeracion?	\N	Ordenar ideas	Aburrir	Confundir	Excluir	A	1
119	¿Como conecta el autor la introduccion con la conclusion?	\N	Conector logico	Cambio abrupto	Nada	Chiste	A	1
121	¿Por que el autor menciona ese personaje historico?	\N	Ejemplifica punto	Decora	No motivo	Error	A	1
99	¿Que indica el uso de cursivas en una palabra?	\N	Enfasis	Error tipográfico	Titulo	Lista	A	1
124	¿Que matiz aporta la voz en primera persona?	\N	Subjetividad	Objetividad	Neutralidad	Rigor	A	1
125	¿Como distingue el autor causa de consecuencia?	\N	Con conectores	No distingue	Con preguntas	Con cifras	A	1
539	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que intencion tiene el autor al escribir el párrafo 1?	\N	Explicar un punto clave	Entretener con humor	Confundir al lector	Ignorar datos	A	1
540	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Como afecta el tono en el párrafo 1 a la comprension?	\N	Lo hace más claro	Lo hace confuso	No cambia nada	Lo hace humoristico	A	1
541	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que pregunta retorica hay en el párrafo 1?	\N	Ninguna	¿No es evidente?	¿Por que no funciona?	¿Como evitarlo?	A	1
543	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que transicion hace el párrafo 1 hacia el siguiente?	\N	Con comillas	Con cambio de seccion	Con conjuncion	Con signo de exclamacion	C	1
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
180	¿Que simboliza la "puerta≤ al inicio?	\N	Oportunidad	Miedo	Meta	Camino	A	1
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
260	¿Cuál es el área de un circulo de radio 2? (usar ¤ÇÔëê3.14)	\N	12.56	15.7	9.42	18.84	A	2
261	¿Cuál es el área de un circulo de radio 3? (usar ¤ÇÔëê3.14)	\N	28.26	31.4	25.12	34.54	A	2
262	¿Cuál es el área de un circulo de radio 4? (usar ¤ÇÔëê3.14)	\N	50.24	53.38	47.1	56.52	A	2
263	¿Cuál es el área de un circulo de radio 5? (usar ¤ÇÔëê3.14)	\N	78.5	81.64	75.36	84.78	A	2
264	¿Cuál es el área de un circulo de radio 6? (usar ¤ÇÔëê3.14)	\N	113.04	116.18	109.9	119.32	A	2
265	¿Cuál es el área de un triángulo de base 4 y altura 5?	\N	10.0	11.0	9.0	4.5	A	2
266	¿Cuál es el área de un triángulo de base 5 y altura 6?	\N	15.0	16.0	14.0	5.5	A	2
267	¿Cuál es el área de un triángulo de base 6 y altura 5?	\N	15.0	16.0	14.0	5.5	A	2
268	¿Cuál es el área de un triángulo de base 7 y altura 6?	\N	21.0	22.0	20.0	6.5	A	2
269	¿Cuál es el área de un triángulo de base 8 y altura 5?	\N	20.0	21.0	19.0	6.5	A	2
270	¿Cuál es el valor de sin(0)?	\N	0	0	1	-1	A	2
271	¿Cuál es el valor de cos(0)?	\N	1	0	1	-1	A	2
272	¿Cuál es el valor de tan(0)?	\N	0	0	1	-1	A	2
273	¿Cuál es el valor de sin(pi/2)?	\N	1	0	1	-1	A	2
274	¿Cuál es el valor de cos(pi/2)?	\N	0	0	1	-1	A	2
275	¿Cuál es el valor de tan(pi/4)?	\N	1	0	1	-1	A	2
276	¿Cuál es el valor de sin(pi)?	\N	0	0	1	-1	A	2
277	¿Cuál es el valor de cos(pi)?	\N	-1	0	1	-1	A	2
278	¿Cuál es el valor de tan(pi/6)?	\N	0.577	0	1	-1	A	2
279	¿Cuál es el valor de sin(pi/6)?	\N	0.5	0	1	-1	A	2
280	¿Cuál es el valor de cos(pi/3)?	\N	0.5	0	1	-1	A	2
281	¿Cuál es el valor de tan(pi/3)?	\N	1.732	0	1	-1	A	2
282	¿Cuál es el valor de sin(3pi/2)?	\N	-1	0	1	-1	A	2
283	¿Cuál es el valor de cos(3pi/2)?	\N	0	0	1	-1	A	2
284	¿Cuál es el valor de tan(pi/3)?	\N	1.732	0	1	-1	A	2
285	¿Cuál es la derivada de f(x) = x^1?	\N	1x^0	x^1	0x^0	1x^1	A	3
286	¿Cuál es la derivada de f(x) = x^2?	\N	2x^1	x^2	1x^1	2x^2	A	3
287	¿Cuál es la derivada de f(x) = x^3?	\N	3x^2	x^3	2x^2	3x^3	A	3
288	¿Cuál es la derivada de f(x) = x^4?	\N	4x^3	x^4	3x^3	4x^4	A	3
289	¿Cuál es la derivada de f(x) = x^5?	\N	5x^4	x^5	4x^4	5x^5	A	3
290	¿Cuál es la derivada de f(x) = x^6?	\N	6x^5	x^6	5x^5	6x^6	A	3
291	¿Cuál es la derivada de f(x) = x^7?	\N	7x^6	x^7	6x^6	7x^7	A	3
292	¿Cuál es la derivada de f(x) = x^8?	\N	8x^7	x^8	7x^7	8x^8	A	3
293	¿Cuál es la derivada de f(x) = x^9?	\N	9x^8	x^9	8x^8	9x^9	A	3
294	¿Cuál es la derivada de f(x) = x^10?	\N	10x^9	x^10	9x^9	10x^10	A	3
295	¿Cuál es la derivada de f(x) = x^11?	\N	11x^10	x^11	10x^10	11x^11	A	3
296	¿Cuál es la derivada de f(x) = x^12?	\N	12x^11	x^12	11x^11	12x^12	A	3
297	¿Cuál es la derivada de f(x) = x^13?	\N	13x^12	x^13	12x^12	13x^13	A	3
298	¿Cuál es la derivada de f(x) = x^14?	\N	14x^13	x^14	13x^13	14x^14	A	3
299	¿Cuál es la derivada de f(x) = x^15?	\N	15x^14	x^15	14x^14	15x^15	A	3
300	¿Cuál es la derivada de f(x) = x^16?	\N	16x^15	x^16	15x^15	16x^16	A	3
301	¿Cuál es la derivada de f(x) = x^17?	\N	17x^16	x^17	16x^16	17x^17	A	3
302	¿Cuál es la derivada de f(x) = x^18?	\N	18x^17	x^18	17x^17	18x^18	A	3
303	¿Cuál es la derivada de f(x) = x^19?	\N	19x^18	x^19	18x^18	19x^19	A	3
304	¿Cuál es la derivada de f(x) = x^20?	\N	20x^19	x^20	19x^19	20x^20	A	3
305	¿Cuál es la derivada de f(x) = x^21?	\N	21x^20	x^21	20x^20	21x^21	A	3
306	¿Cuál es la derivada de f(x) = x^22?	\N	22x^21	x^22	21x^21	22x^22	A	3
307	¿Cuál es la derivada de f(x) = x^23?	\N	23x^22	x^23	22x^22	23x^23	A	3
308	¿Cuál es la derivada de f(x) = x^24?	\N	24x^23	x^24	23x^23	24x^24	A	3
309	¿Cuál es la derivada de f(x) = x^25?	\N	25x^24	x^25	24x^24	25x^25	A	3
310	¿Cuál es la derivada de f(x) = x^26?	\N	26x^25	x^26	25x^25	26x^26	A	3
311	¿Cuál es la derivada de f(x) = x^27?	\N	27x^26	x^27	26x^26	27x^27	A	3
312	¿Cuál es la derivada de f(x) = x^28?	\N	28x^27	x^28	27x^27	28x^28	A	3
313	¿Cuál es la derivada de f(x) = x^29?	\N	29x^28	x^29	28x^28	29x^29	A	3
314	¿Cuál es la derivada de f(x) = x^30?	\N	30x^29	x^30	29x^29	30x^30	A	3
315	¿Cuál es la derivada de f(x) = x^31?	\N	31x^30	x^31	30x^30	31x^31	A	3
316	¿Cuál es la derivada de f(x) = x^32?	\N	32x^31	x^32	31x^31	32x^32	A	3
317	¿Cuál es la derivada de f(x) = x^33?	\N	33x^32	x^33	32x^32	33x^33	A	3
318	¿Cuál es la derivada de f(x) = x^34?	\N	34x^33	x^34	33x^33	34x^34	A	3
319	¿Cuál es la derivada de f(x) = x^35?	\N	35x^34	x^35	34x^34	35x^35	A	3
320	¿Cuál es la derivada de f(x) = x^36?	\N	36x^35	x^36	35x^35	36x^36	A	3
321	¿Cuál es la derivada de f(x) = x^37?	\N	37x^36	x^37	36x^36	37x^37	A	3
322	¿Cuál es la derivada de f(x) = x^38?	\N	38x^37	x^38	37x^37	38x^38	A	3
323	¿Cuál es la derivada de f(x) = x^39?	\N	39x^38	x^39	38x^38	39x^39	A	3
324	¿Cuál es la derivada de f(x) = x^40?	\N	40x^39	x^40	39x^39	40x^40	A	3
325	¿Cuál es la derivada de f(x) = x^41?	\N	41x^40	x^41	40x^40	41x^41	A	3
326	¿Cuál es la derivada de f(x) = x^42?	\N	42x^41	x^42	41x^41	42x^42	A	3
327	¿Cuál es la derivada de f(x) = x^43?	\N	43x^42	x^43	42x^42	43x^43	A	3
328	¿Cuál es la derivada de f(x) = x^44?	\N	44x^43	x^44	43x^43	44x^44	A	3
329	¿Cuál es la derivada de f(x) = x^45?	\N	45x^44	x^45	44x^44	45x^45	A	3
330	¿Cuál es la derivada de f(x) = x^46?	\N	46x^45	x^46	45x^45	46x^46	A	3
331	¿Cuál es la derivada de f(x) = x^47?	\N	47x^46	x^47	46x^46	47x^47	A	3
332	¿Cuál es la derivada de f(x) = x^48?	\N	48x^47	x^48	47x^47	48x^48	A	3
333	¿Cuál es la derivada de f(x) = x^49?	\N	49x^48	x^49	48x^48	49x^49	A	3
334	¿Cuál es la derivada de f(x) = x^50?	\N	50x^49	x^50	49x^49	50x^50	A	3
335	¿Cuál es la integral de x^0 dx?	\N	x^1/1 + C	ln(x) + C	0x^-1 + C	x^2/2 + C	A	3
336	¿Cuál es la integral de x^1 dx?	\N	x^2/2 + C	x^1/1 + C	1x^0 + C	x^3/3 + C	A	3
337	¿Cuál es la integral de x^2 dx?	\N	x^3/3 + C	x^2/2 + C	2x^1 + C	x^4/4 + C	A	3
338	¿Cuál es la integral de x^3 dx?	\N	x^4/4 + C	x^3/3 + C	3x^2 + C	x^5/5 + C	A	3
339	¿Cuál es la integral de x^4 dx?	\N	x^5/5 + C	x^4/4 + C	4x^3 + C	x^6/6 + C	A	3
340	¿Cuál es la integral de x^5 dx?	\N	x^6/6 + C	x^5/5 + C	5x^4 + C	x^7/7 + C	A	3
341	¿Cuál es la integral de x^6 dx?	\N	x^7/7 + C	x^6/6 + C	6x^5 + C	x^8/8 + C	A	3
342	¿Cuál es la integral de x^7 dx?	\N	x^8/8 + C	x^7/7 + C	7x^6 + C	x^9/9 + C	A	3
343	¿Cuál es la integral de x^8 dx?	\N	x^9/9 + C	x^8/8 + C	8x^7 + C	x^10/10 + C	A	3
344	¿Cuál es la integral de x^9 dx?	\N	x^10/10 + C	x^9/9 + C	9x^8 + C	x^11/11 + C	A	3
345	¿Cuál es la integral de x^10 dx?	\N	x^11/11 + C	x^10/10 + C	10x^9 + C	x^12/12 + C	A	3
346	¿Cuál es la integral de x^11 dx?	\N	x^12/12 + C	x^11/11 + C	11x^10 + C	x^13/13 + C	A	3
347	¿Cuál es la integral de x^12 dx?	\N	x^13/13 + C	x^12/12 + C	12x^11 + C	x^14/14 + C	A	3
348	¿Cuál es la integral de x^13 dx?	\N	x^14/14 + C	x^13/13 + C	13x^12 + C	x^15/15 + C	A	3
349	¿Cuál es la integral de x^14 dx?	\N	x^15/15 + C	x^14/14 + C	14x^13 + C	x^16/16 + C	A	3
350	¿Cuál es la integral de x^15 dx?	\N	x^16/16 + C	x^15/15 + C	15x^14 + C	x^17/17 + C	A	3
351	¿Cuál es la integral de x^16 dx?	\N	x^17/17 + C	x^16/16 + C	16x^15 + C	x^18/18 + C	A	3
352	¿Cuál es la integral de x^17 dx?	\N	x^18/18 + C	x^17/17 + C	17x^16 + C	x^19/19 + C	A	3
353	¿Cuál es la integral de x^18 dx?	\N	x^19/19 + C	x^18/18 + C	18x^17 + C	x^20/20 + C	A	3
354	¿Cuál es la integral de x^19 dx?	\N	x^20/20 + C	x^19/19 + C	19x^18 + C	x^21/21 + C	A	3
355	¿Cuál es la integral de x^20 dx?	\N	x^21/21 + C	x^20/20 + C	20x^19 + C	x^22/22 + C	A	3
356	¿Cuál es la integral de x^21 dx?	\N	x^22/22 + C	x^21/21 + C	21x^20 + C	x^23/23 + C	A	3
357	¿Cuál es la integral de x^22 dx?	\N	x^23/23 + C	x^22/22 + C	22x^21 + C	x^24/24 + C	A	3
358	¿Cuál es la integral de x^23 dx?	\N	x^24/24 + C	x^23/23 + C	23x^22 + C	x^25/25 + C	A	3
359	¿Cuál es la integral de x^24 dx?	\N	x^25/25 + C	x^24/24 + C	24x^23 + C	x^26/26 + C	A	3
360	¿Cuál es la integral de x^25 dx?	\N	x^26/26 + C	x^25/25 + C	25x^24 + C	x^27/27 + C	A	3
361	¿Cuál es la integral de x^26 dx?	\N	x^27/27 + C	x^26/26 + C	26x^25 + C	x^28/28 + C	A	3
362	¿Cuál es la integral de x^27 dx?	\N	x^28/28 + C	x^27/27 + C	27x^26 + C	x^29/29 + C	A	3
363	¿Cuál es la integral de x^28 dx?	\N	x^29/29 + C	x^28/28 + C	28x^27 + C	x^30/30 + C	A	3
364	¿Cuál es la integral de x^29 dx?	\N	x^30/30 + C	x^29/29 + C	29x^28 + C	x^31/31 + C	A	3
365	¿Cuál es la integral de x^30 dx?	\N	x^31/31 + C	x^30/30 + C	30x^29 + C	x^32/32 + C	A	3
366	¿Cuál es la integral de x^31 dx?	\N	x^32/32 + C	x^31/31 + C	31x^30 + C	x^33/33 + C	A	3
367	¿Cuál es la integral de x^32 dx?	\N	x^33/33 + C	x^32/32 + C	32x^31 + C	x^34/34 + C	A	3
368	¿Cuál es la integral de x^33 dx?	\N	x^34/34 + C	x^33/33 + C	33x^32 + C	x^35/35 + C	A	3
369	¿Cuál es la integral de x^34 dx?	\N	x^35/35 + C	x^34/34 + C	34x^33 + C	x^36/36 + C	A	3
370	¿Cuál es la integral de x^35 dx?	\N	x^36/36 + C	x^35/35 + C	35x^34 + C	x^37/37 + C	A	3
371	¿Cuál es la integral de x^36 dx?	\N	x^37/37 + C	x^36/36 + C	36x^35 + C	x^38/38 + C	A	3
372	¿Cuál es la integral de x^37 dx?	\N	x^38/38 + C	x^37/37 + C	37x^36 + C	x^39/39 + C	A	3
373	¿Cuál es la integral de x^38 dx?	\N	x^39/39 + C	x^38/38 + C	38x^37 + C	x^40/40 + C	A	3
374	¿Cuál es la integral de x^39 dx?	\N	x^40/40 + C	x^39/39 + C	39x^38 + C	x^41/41 + C	A	3
375	¿Cuál es la integral de x^40 dx?	\N	x^41/41 + C	x^40/40 + C	40x^39 + C	x^42/42 + C	A	3
376	¿Cuál es la integral de x^41 dx?	\N	x^42/42 + C	x^41/41 + C	41x^40 + C	x^43/43 + C	A	3
377	¿Cuál es la integral de x^42 dx?	\N	x^43/43 + C	x^42/42 + C	42x^41 + C	x^44/44 + C	A	3
378	¿Cuál es la integral de x^43 dx?	\N	x^44/44 + C	x^43/43 + C	43x^42 + C	x^45/45 + C	A	3
379	¿Cuál es la integral de x^44 dx?	\N	x^45/45 + C	x^44/44 + C	44x^43 + C	x^46/46 + C	A	3
380	¿Cuál es la integral de x^45 dx?	\N	x^46/46 + C	x^45/45 + C	45x^44 + C	x^47/47 + C	A	3
381	¿Cuál es la integral de x^46 dx?	\N	x^47/47 + C	x^46/46 + C	46x^45 + C	x^48/48 + C	A	3
382	¿Cuál es la integral de x^47 dx?	\N	x^48/48 + C	x^47/47 + C	47x^46 + C	x^49/49 + C	A	3
383	¿Cuál es la integral de x^48 dx?	\N	x^49/49 + C	x^48/48 + C	48x^47 + C	x^50/50 + C	A	3
384	¿Cuál es la integral de x^49 dx?	\N	x^50/50 + C	x^49/49 + C	49x^48 + C	x^51/51 + C	A	3
385	¿Cuál es la integral de sin(1x) dx?	\N	-cos(1x)/1 + C	cos(1x)/1 + C	sin(1x)/1 + C	-sin(1x)/1 + C	A	3
386	¿Cuál es la integral de sin(2x) dx?	\N	-cos(2x)/2 + C	cos(2x)/2 + C	sin(2x)/2 + C	-sin(2x)/2 + C	A	3
387	¿Cuál es la integral de sin(3x) dx?	\N	-cos(3x)/3 + C	cos(3x)/3 + C	sin(3x)/3 + C	-sin(3x)/3 + C	A	3
388	¿Cuál es la integral de sin(4x) dx?	\N	-cos(4x)/4 + C	cos(4x)/4 + C	sin(4x)/4 + C	-sin(4x)/4 + C	A	3
389	¿Cuál es la integral de sin(5x) dx?	\N	-cos(5x)/5 + C	cos(5x)/5 + C	sin(5x)/5 + C	-sin(5x)/5 + C	A	3
390	¿Cuál es la integral de sin(6x) dx?	\N	-cos(6x)/6 + C	cos(6x)/6 + C	sin(6x)/6 + C	-sin(6x)/6 + C	A	3
391	¿Cuál es la integral de sin(7x) dx?	\N	-cos(7x)/7 + C	cos(7x)/7 + C	sin(7x)/7 + C	-sin(7x)/7 + C	A	3
392	¿Cuál es la integral de sin(8x) dx?	\N	-cos(8x)/8 + C	cos(8x)/8 + C	sin(8x)/8 + C	-sin(8x)/8 + C	A	3
393	¿Cuál es la integral de sin(9x) dx?	\N	-cos(9x)/9 + C	cos(9x)/9 + C	sin(9x)/9 + C	-sin(9x)/9 + C	A	3
394	¿Cuál es la integral de sin(10x) dx?	\N	-cos(10x)/10 + C	cos(10x)/10 + C	sin(10x)/10 + C	-sin(10x)/10 + C	A	3
395	¿Cuál es la integral de sin(11x) dx?	\N	-cos(11x)/11 + C	cos(11x)/11 + C	sin(11x)/11 + C	-sin(11x)/11 + C	A	3
396	¿Cuál es la integral de sin(12x) dx?	\N	-cos(12x)/12 + C	cos(12x)/12 + C	sin(12x)/12 + C	-sin(12x)/12 + C	A	3
397	¿Cuál es la integral de cos(1x) dx?	\N	sin(1x)/1 + C	-sin(1x)/1 + C	cos(1x)/1 + C	-cos(1x)/1 + C	A	3
398	¿Cuál es la integral de cos(2x) dx?	\N	sin(2x)/2 + C	-sin(2x)/2 + C	cos(2x)/2 + C	-cos(2x)/2 + C	A	3
399	¿Cuál es la integral de cos(3x) dx?	\N	sin(3x)/3 + C	-sin(3x)/3 + C	cos(3x)/3 + C	-cos(3x)/3 + C	A	3
400	¿Cuál es la integral de cos(4x) dx?	\N	sin(4x)/4 + C	-sin(4x)/4 + C	cos(4x)/4 + C	-cos(4x)/4 + C	A	3
401	¿Cuál es la integral de cos(5x) dx?	\N	sin(5x)/5 + C	-sin(5x)/5 + C	cos(5x)/5 + C	-cos(5x)/5 + C	A	3
402	¿Cuál es la integral de cos(6x) dx?	\N	sin(6x)/6 + C	-sin(6x)/6 + C	cos(6x)/6 + C	-cos(6x)/6 + C	A	3
403	¿Cuál es la integral de cos(7x) dx?	\N	sin(7x)/7 + C	-sin(7x)/7 + C	cos(7x)/7 + C	-cos(7x)/7 + C	A	3
404	¿Cuál es la integral de cos(8x) dx?	\N	sin(8x)/8 + C	-sin(8x)/8 + C	cos(8x)/8 + C	-cos(8x)/8 + C	A	3
405	¿Cuál es la integral de cos(9x) dx?	\N	sin(9x)/9 + C	-sin(9x)/9 + C	cos(9x)/9 + C	-cos(9x)/9 + C	A	3
406	¿Cuál es la integral de cos(10x) dx?	\N	sin(10x)/10 + C	-sin(10x)/10 + C	cos(10x)/10 + C	-cos(10x)/10 + C	A	3
407	¿Cuál es la integral de cos(11x) dx?	\N	sin(11x)/11 + C	-sin(11x)/11 + C	cos(11x)/11 + C	-cos(11x)/11 + C	A	3
408	¿Cuál es la integral de cos(12x) dx?	\N	sin(12x)/12 + C	-sin(12x)/12 + C	cos(12x)/12 + C	-cos(12x)/12 + C	A	3
409	¿Cuál es la integral de cos(13x) dx?	\N	sin(13x)/13 + C	-sin(13x)/13 + C	cos(13x)/13 + C	-cos(13x)/13 + C	A	3
410	¿Cuál es lim(x→0) de sin(1x)/x?	\N	1	0	1	Infinito	A	3
411	¿Cuál es lim(x→0) de sin(2x)/x?	\N	2	0	1	Infinito	A	3
412	¿Cuál es lim(x→0) de sin(3x)/x?	\N	3	0	1	Infinito	A	3
413	¿Cuál es lim(x→0) de sin(4x)/x?	\N	4	0	1	Infinito	A	3
414	¿Cuál es lim(x→0) de sin(5x)/x?	\N	5	0	1	Infinito	A	3
415	¿Cuál es lim(x→0) de sin(6x)/x?	\N	6	0	1	Infinito	A	3
416	¿Cuál es lim(x→0) de sin(7x)/x?	\N	7	0	1	Infinito	A	3
417	¿Cuál es lim(x→0) de sin(8x)/x?	\N	8	0	1	Infinito	A	3
418	¿Cuál es lim(x→0) de sin(9x)/x?	\N	9	0	1	Infinito	A	3
419	¿Cuál es lim(x→0) de sin(10x)/x?	\N	10	0	1	Infinito	A	3
420	¿Cuál es lim(x→0) de sin(11x)/x?	\N	11	0	1	Infinito	A	3
421	¿Cuál es lim(x→0) de sin(12x)/x?	\N	12	0	1	Infinito	A	3
422	¿Cuál es lim(x→0) de sin(13x)/x?	\N	13	0	1	Infinito	A	3
423	¿Cuál es lim(x→0) de sin(14x)/x?	\N	14	0	1	Infinito	A	3
424	¿Cuál es lim(x→0) de sin(15x)/x?	\N	15	0	1	Infinito	A	3
425	¿Cuál es lim(x→0) de sin(16x)/x?	\N	16	0	1	Infinito	A	3
426	¿Cuál es lim(x→0) de sin(17x)/x?	\N	17	0	1	Infinito	A	3
427	¿Cuál es lim(x→0) de sin(18x)/x?	\N	18	0	1	Infinito	A	3
428	¿Cuál es lim(x→0) de sin(19x)/x?	\N	19	0	1	Infinito	A	3
429	¿Cuál es lim(x→0) de sin(20x)/x?	\N	20	0	1	Infinito	A	3
430	¿Cuál es lim(x→0) de sin(21x)/x?	\N	21	0	1	Infinito	A	3
431	¿Cuál es lim(x→0) de sin(22x)/x?	\N	22	0	1	Infinito	A	3
432	¿Cuál es lim(x→0) de sin(23x)/x?	\N	23	0	1	Infinito	A	3
433	¿Cuál es lim(x→0) de sin(24x)/x?	\N	24	0	1	Infinito	A	3
434	¿Cuál es lim(x→0) de sin(25x)/x?	\N	25	0	1	Infinito	A	3
545	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Cuál es la idea principal del párrafo 2?	\N	Definir el concepto principal	Presentar una critica	Citar un estudio externo	Narrar un suceso personal	A	1
588	¿Que fenomeno explica la adaptacion de las especies?	\N	Mutacion genetica	Seleccion natural	Reproduccion sexual	Homeostasis	B	4
589	¿Como se llama la etapa del ciclo celular donde se duplica el ADN?	\N	G1	S	G2	M	B	4
590	¿Que orgánulo contiene su propio ADN y se cree que evoluciono a partir de bacterias?	\N	Núcleo	Mitocondria	Ribosoma	Aparato de Golgi	B	4
591	¿Que tipo de tejido permite el movimiento voluntario?	\N	Epitelial	Conectivo	Muscular	Nervioso	C	4
592	¿En que parte de la celula se ensamblan los lipidos y proteinas para su transporte?	\N	Núcleo	Reticulo endoplásmico	Mitocondria	Lisosoma	B	4
593	¿Que proceso describe la liberacion controlada de energia en la mitocondria?	\N	Fermentacion alcoholica	Ciclo de Krebs	Transcripcion	Fecundacion	B	4
594	¿Que tipo de molecula son las enzimas?	\N	Carbohidratos	Lipidos	Proteinas	acidos nucleicos	C	4
547	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que informacion clave aporta el párrafo 2?	\N	Detalles de la innovacion tecnologica	Anecdotas irrelevantes	Datos historicos	Citas literarias	A	1
549	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que intencion tiene el autor al escribir el párrafo 2?	\N	Explicar un punto clave	Entretener con humor	Confundir al lector	Ignorar datos	A	1
551	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que pregunta retorica hay en el párrafo 2?	\N	Ninguna	¿No es evidente?	¿Por que no funciona?	¿Como evitarlo?	A	1
554	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que efecto de estilo destaca en el párrafo 2?	\N	Enfatiza la idea principal	Crea incertidumbre	Genera humor	Añade misterio	A	1
550	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Como afecta el tono en el párrafo 2 a la comprension?	\N	Lo hace humoristico	Lo hace confuso	No cambia nada	Lo hace más claro	D	1
546	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que estrategia retorica predomina en el párrafo 2?	\N	Pregunta retorica	Hiperbole	Metáfora	Uso de evidencia	D	1
552	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Como introduce el tema en el párrafo 2?	\N	Con un titulo	Con una cita	Con un dato numerico	Con una afirmacion directa	D	1
553	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que transicion hace el párrafo 2 hacia el siguiente?	\N	Con comillas	Con cambio de seccion	Con conjuncion 	Con signo de exclamacion	C	1
565	¿Cuál es la unidad básica de la vida?	\N	atomo	Molecula	Celula	Tejido	C	4
566	¿Que orgánulo es responsable de la produccion de energia en la celula?	\N	Cloroplasto	Mitocondria	Ribosoma	Reticulo endoplásmico	B	4
567	¿Que molecula transporta informacion genetica?	\N	ARN	Proteina	Lipido	ADN	D	4
568	¿En que fase de la mitosis se alinean los cromosomas en el ecuador celular?	\N	Profase	Metafase	Anafase	Telofase	B	4
569	¿Cuál es la funcion principal de los ribosomas?	\N	Sintesis de proteinas	Respiracion celular	Detoxificacion	Transporte de lipidos	A	4
570	¿Que biomolecula está formada por aminoácidos?	\N	acidos nucleicos	Proteinas	Carbohidratos	Lipidos	B	4
571	¿Que tipo de enlace une los nucleotidos en el ADN?	\N	Enlace ionico	Enlace covalente	Puente de hidrogeno	Enlace peptidico	B	4
572	¿Cuál es el proceso de division celular en celulas somáticas?	\N	Meiosis	Mitosis	Fusion	Gemacion	B	4
573	¿Que componente de la membrana celular proporciona fluidez?	\N	Colesterol	acidos nucleicos	Ribosomas	DNA	A	4
635	¿Cuál es la formula molecular del agua?	\N	H2O	CO2	NaCl	O2	A	5
555	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Cuál es la idea principal del párrafo 3?	\N	Definir el concepto principal	Presentar una critica	Citar un estudio externo	Narrar un suceso personal	A	1
556	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que estrategia retorica predomina en el párrafo 3?	\N	Uso de evidencia	Hiperbole	Metáfora	Pregunta retorica	A	1
557	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que informacion clave aporta el párrafo 3?	\N	Detalles de las politicas públicas	Anecdotas irrelevantes	Datos historicos	Citas literarias	A	1
560	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Como afecta el tono en el párrafo 3 a la comprension?	\N	Lo hace más claro	Lo hace confuso	No cambia nada	Lo hace humoristico	A	1
562	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Como introduce el tema en el párrafo 3?	\N	Con una afirmacion directa	Con una cita	Con un dato numerico	Con un titulo	A	1
558	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que recurso de cohesion se usa en el párrafo 3?	\N	Enumeracion	Conjuncion 	Anáfora	Elipsis	B	1
559	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que intencion tiene el autor al escribir el párrafo 3?	\N	Confundir al lector	Entretener con humor	Explicar un punto clave	Ignorar datos	C	1
563	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que transicion hace el párrafo 3 hacia el siguiente?	\N	Con signo de exclamacion	Con cambio de seccion	Con comillas	Con conjuncion 	D	1
574	¿Que proceso convierte la glucosa en energia anaerobica?	\N	Fermentacion	Fotosintesis	Quimiosintesis	Respiracion aerobica	A	4
575	¿Cuál es el pigmento principal en la fotosintesis?	\N	Clorofila	Hemoglobina	Melanina	Caroteno	A	4
576	¿En que orgánulo ocurre la fotosintesis?	\N	Mitocondria	Cloroplasto	Lisoso┬¡ma	Núcleo	B	4
577	¿Que tipo de tejido conecta y soporta los organos?	\N	Epitelial	Conectivo	Muscular	Nervioso	B	4
578	¿Cuál es la molecula energetica primaria de la celula?	\N	ATP	ADP	NADH	GTP	A	4
579	¿Que proceso genera gametos con la mitad del Número de cromosomas?	\N	Mitosis	Meiosis	Fecundacion	Segmentacion	B	4
580	¿Cuál es la secuencia correcta de niveles de organizacion biologica?	\N	Celula → Tejido → ├ôrgano → Sistema	Tejido → Celula → ├ôrgano → Sistema	├ôrgano → Celula → Tejido → Sistema	Sistema → ├ôrgano → Tejido → Celula	A	4
581	¿Que nombre recibe la transferencia de energia en la cadena trofica?	\N	Ciclo de Krebs	Flujo de energia	Ciclo de Calvin	Fermentacion	B	4
582	¿Que organo es responsable de filtrar la sangre en el cuerpo humano?	\N	Corazon	Higado	Riñon	Pulmon	C	4
564	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que efecto de estilo destaca en el párrafo 3?	\N	Enfatiza la idea principal	Crea incertidumbre	Genera humor	Añade misterio	A	1
538	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que recurso de cohesion se usa en el párrafo 1?	\N	Enumeracion	Conjuncion 	Anáfora	Elipsis	B	1
548	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que recurso de cohesion se usa en el párrafo 2?	\N	Anáfora	Enumeracion	Conjuncion	Elipsis	C	1
542	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Como introduce el tema en el párrafo 1?	\N	Con una cita	Con una afirmacion directa	Con un dato numerico	Con un titulo	B	1
544	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que efecto de estilo destaca en el párrafo 1?	\N	Crea incertidumbre	Enfatiza la idea principal	Genera humor	Añade misterio	B	1
561	Texto:\n1. El desarrollo sostenible se basa en la interaccion equilibrada entre el crecimiento economico, el cuidado del medio ambiente y la cohesion social.\n2. Los autores enfatizan la importancia de la innovacion tecnologica como motor de eficiencia ambiental. Afirman que la energia renovable y las nuevas tecnicas de reciclaje pueden reducir significativamente la huella de carbono.\n3. Sin embargo, señalan que sin politicas públicas adecuadas y participacion ciudadana, estas soluciones tecnologicas no alcanzarán su máximo potencial. Por eso proponen marcos regulatorios que incentiven tanto a empresas como a individuos.\n\n¿Que pregunta retorica hay en el párrafo 3?	\N	¿Por que no funciona?	¿No es evidente?	Ninguna	¿Como evitarlo?	C	1
595	¿Que estructura celular es responsable de la digestion intracelular?	\N	Ribosoma	Lisosoma	Peroxisoma	Mitocondria	B	4
596	¿Que nombre recibe el proceso por el cual las plantas liberan agua al ambiente?	\N	Transpiracion	Evaporacion	Difusion	Osmosis	A	4
597	¿Que es la homeostasis?	\N	Cambio constante de condiciones	Mantenimiento de condiciones internas	Evolucion de especies	Reproduccion celular	B	4
598	¿Que tipo de celula forma tejidos de sosten en plantas?	\N	Celulas parenquimáticas	Celulas esclerenquimáticas	Celulas colenquimáticas	Celulas meristemáticas	B	4
599	¿Que compuesto es principal reserva energetica en animales?	\N	Almidon	Glucosa	Glucogeno	Celulosa	C	4
600	¿Que molecula lleva aminoácidos al ribosoma durante la traduccion?	\N	ARN mensajero	ARN de transferencia	ARN ribosomico	ADN	B	4
601	¿Cuál de los siguientes no es un monosacárido?	\N	Glucosa	Fructosa	Sacarosa	Galactosa	C	4
602	¿Que funcion tiene el colágeno en el cuerpo?	\N	Transporte de oxigeno	Resistencia y elasticidad de tejidos	Contraccion muscular	Digestion de alimentos	B	4
603	¿Que gas se libera como producto de desecho en la respiracion celular?	\N	Oxigeno	Hielo	Dioxido de carbono	Nitrogeno	C	4
604	¿Que tipo de simbiosis beneficia a ambas especies?	\N	Parasitismo	Comensalismo	Mutualismo	Depredacion	C	4
605	¿Que proceso es responsable de la formacion de gametos?	\N	Mitosis	Meiosis	Fecundacion	Germinacion	B	4
606	¿Que es un ecosistema?	\N	Poblacion de una sola especie	Conjunto de organismos y su ambiente	Solo animales	Solo plantas	B	4
607	¿Cuál es el principal componente del ADN?	\N	Aminoácidos	Nucleotidos	Azúcares	Lipidos	B	4
608	¿Que fenomeno explica la diversidad genetica en la reproduccion sexual?	\N	Mutacion	Meiosis	Fusion binaria	Duplicacion	B	4
609	¿Que funcion tiene la pared celular en las plantas?	\N	Proteger y dar forma	Sintetizar proteinas	Almacenar energia	Transportar agua	A	4
610	¿Que nombre recibe la teoria que explica el origen de eucariotas?	\N	Teoria endosimbiotica	Teoria celular	Teoria heliocentrica	Teoria del caos	A	4
611	¿Que vitamina es esencial para la coagulacion sanguinea?	\N	Vitamina A	Vitamina D	Vitamina K	Vitamina C	C	4
612	¿Que liquido circula por el sistema linfático?	\N	Sangre	Liquido cefalorraquideo	Linfocitos	Linf┬¡a	D	4
613	¿Cuál es la funcion de los cilios en las celulas epiteliales?	\N	Mover particulas y fluidos	Generar energia	Transcribir ADN	Sintetizar lipidos	A	4
614	¿Que tipo de vision permite detectar colores?	\N	Vision escotopica	Vision fotopica	Vision mesopica	Vision infrarroja	B	4
615	¿Que proceso celular crea variabilidad genetica durante la formacion de gametos?	\N	Mitosis	Meiosis	Fecundacion	Mutacion	B	4
616	¿Cuál es la funcion de los cloroplastos?	\N	Respiracion celular	Sintesis de proteinas	Fotosintesis	Detoxificacion	C	4
617	¿Como se llama la fase del ciclo celular en que la celula crece y replica su ADN?	\N	G1	S	M	G0	B	4
618	¿Que tipo de receptor detecta cambios quimicos en el medio externo en los seres vivos?	\N	Quimiorreceptores	Mecanorreceptores	Termorreceptores	Fotoreceptores	A	4
619	¿Cuál es el nombre de la teoria que describe la evolucion por seleccion natural?	\N	Teoria celular	Teoria endosimbiotica	Teoria de la seleccion natural	Teoria de la relatividad	C	4
620	¿Que molecula actúa como mensajero en la traduccion genetica?	\N	ADN	ARN mensajero	ARN de transferencia	ARN ribosomico	B	4
621	¿Que nombre recibe el conjunto de reacciones quimicas en la celula para obtener energia?	\N	Fermentacion	Metabolismo	├ôsmosis	Difusion	B	4
622	¿Que estructura transporta las proteinas sintetizadas en el reticulo endoplásmico?	\N	Mitocondria	Aparato de Golgi	Lisosoma	Peroxisoma	B	4
623	¿Que caracteristica distingue a los procariotas de los eucariotas?	\N	No tienen Núcleo definido	Tienen mitocondrias	Poseen reticulo endoplásmico	Forman tejidos	A	4
624	¿Cuál es el mecanismo principal de transporte de agua en plantas?	\N	Difusion facilitada	├ôsmosis	Transpiracion	Endocitosis	B	4
625	¿Que nombre recibe el proceso por el cual el ARN dirige la sintesis de proteinas?	\N	Transcripcion	Replicacion	Traduccion	Translocacion	C	4
626	¿Que tipo de simbiosis beneficia a un organismo sin afectar al otro?	\N	Mutualismo	Parasitismo	Comensalismo	Depredacion	C	4
627	¿Cuál es la funcion principal de los ribosomas?	\N	Degradar proteinas dañadas	Sintetizar lipidos	Sintetizar proteinas	Almacenar energia	C	4
628	¿Que proceso describe la conversion de nitratos para uso de plantas?	\N	Fijacion de nitrogeno	Nitrificacion	Desnitrificacion	Ammonificacion	B	4
629	¿Que estructura celular regula el paso de sustancias hacia el interior de la celula?	\N	Membrana plasmática	Pared celular	Núcleo	Mitocondria	A	4
630	¿Como se denomina la relacion en la que un patogeno vive a expensas de un huesped?	\N	Mutualismo	Parasitismo	Comensalismo	Simbiosis	B	4
631	¿Que etapa del ciclo celular sigue inmediatamente a la mitosis?	\N	Fase G1	Fase S	Fase G2	Fase M	A	4
632	¿Cuál es la funcion de los lisosomas en celulas animales?	\N	Sintesis de proteinas	Digestion intracelular	Produccion de ATP	Almacenamiento de lipidos	B	4
633	¿Que tipo de ácido graso es esencial y debe obtenerse de la dieta?	\N	Saturo	Monoinsaturado	Poliinsaturado	Trans	C	4
634	¿Como se llama la adaptacion de poblaciones de organismos a su entorno a lo largo del tiempo?	\N	Ontogenia	Filogenia	Evolucion	Homeostasis	C	4
636	¿Que tipo de enlace se forma entre átomos de metales y no metales?	\N	Ionico	Covalente	Metálico	Puente de hidrogeno	A	5
637	¿Cuál es el pH de una solucion neutra a 25°C?	\N	7	0	14	1	A	5
638	¿Cuál es la unidad de concentracion molar?	\N	mol/L	g/L	M/L	L/mol	A	5
639	¿Que gas se produce en la reaccion de un ácido con un carbonato?	\N	CO2	O2	H2	N2	A	5
640	¿Cuál es la constante de Avogadro?	\N	6.022├ù10^23 mol^-1	9.81 m/s^2	3.00├ù10^8 m/s	1.60├ù10^-19 C	A	5
641	¿Que tipo de reaccion implica la ganancia de electrones?	\N	Reduccion	Oxidacion	Hidrolisis	Saponificacion	A	5
642	¿Cuál es la formula del ion sulfato?	\N	SO4^2-	NO3^-	PO4^3-	ClO4^-	A	5
643	¿Que ley relaciona presion y volumen de un gas ideal (a temperatura constante)?	\N	Boyle	Charles	Avogadro	Dalton	A	5
644	¿Cuál es la masa molar aproximada del dioxido de carbono (CO2)?	\N	44 g/mol	28 g/mol	18 g/mol	32 g/mol	A	5
645	¿Que es un catalizador?	\N	Sustancia que acelera la reaccion sin consumirse	Reactivo principal	Producto secundario	Inhibidor	A	5
646	¿Cuál es la unidad de energia en el Sistema Internacional?	\N	Joule	Caloria	Ergio	Electronvoltio	A	5
647	¿Que nombre recibe la reaccion de neutralizacion entre un ácido y una base?	\N	Sal y agua	Gas y agua	Ester y agua	Salmuera	A	5
648	¿Cuál es la formula empirica del peroxido de hidrogeno?	\N	HO	H2O2	H2O	OO	A	5
649	¿Que tipo de enlace existe entre dos átomos de oxigeno en O2?	\N	Covalente no polar	Ionico	Metálico	Puente de hidrogeno	A	5
650	¿Como se llama el cambio de solido a gas sin pasar por liquido?	\N	Sublimacion	Fusion	Deposicion	Condensacion	A	5
651	¿Cuál es el Número cuántico principal (n) que indica el nivel de energia?	\N	n	l	m	s	A	5
652	¿Que modelo atomico introdujo niveles cuantizados?	\N	Bohr	Rutherford	Thomson	Dalton	A	5
653	¿Cuál es el nombre del enlace covalente donde los electrones son compartidos de forma desigual?	\N	Polar	No polar	Ionico	Metálico	A	5
654	¿Que fenomeno se refiere al paso de liquido a gas en toda la masa del liquido?	\N	Ebullicion	Evaporacion	Sublimacion	Condensacion	A	5
655	¿Cuál es la formula del ácido sulfúrico?	\N	H2SO4	HCl	HNO3	H3PO4	A	5
656	¿Que indicador cambia de color alrededor de pH 7?	\N	Fenolftaleina	Azul de bromotimol	Rojo de metilo	Naranja de metilo	B	5
657	¿Cuál es la caracteristica de un ácido fuerte en disolucion acuosa?	\N	Se disocia completamente	No se disocia	Reacciona con agua	Cambia de color	A	5
658	¿Que gas es el producto principal de la fotosintesis?	\N	O2	CO2	N2	H2	A	5
659	¿Cuál es la funcion del catalizador en la reaccion de Haber?	\N	Acelerar formacion de NH3	Consumirse al reaccionar	Cambiar temperatura	Eliminar productos	A	5
660	¿Que compuestos tienen enlace C=O?	\N	Cetona y Aldehido	Alcohol y Eter	Amina y Amida	acido y Sal	A	5
661	¿Que tipo de reaccion intercambia grupos funcionales entre moleculas?	\N	Transesterificacion	Hidrolisis	Neutralizacion	Esterificacion	A	5
662	¿Como se llama la teoria que describe el comportamiento de gases reales?	\N	Van der Waals	Ideal	Charles	Boyle	A	5
663	¿Cuál es la estructura del agua según VSEPR?	\N	Angular	Lineal	Tetraedrica	Trigonal plana	A	5
664	¿Que propiedad se mide con un refractometro?	\N	├ìndice de refraccion	Viscosidad	Densidad	pH	A	5
665	¿Que reaccion produce un ester y agua a partir de un ácido y un alcohol?	\N	Esterificacion	Hidrogenacion	Polimerizacion	Oxidacion	A	5
666	¿Que compuesto es un isomero del etanol (C2H6O)?	\N	Dimetil eter	Metanol	Propanol	Butanol	A	5
667	¿Cuál es el pKa aproximado del ácido acetico?	\N	4.76	7.00	1.00	9.00	A	5
668	¿Que nombre recibe el pH de una solucion con [H+] = 1├ù10^-4 M?	\N	4	10	7	1	A	5
669	¿Que propiedad fisica es la atraccion entre moleculas de un liquido?	\N	Tension superficial	Viscosidad	Densidad	Calor especifico	A	5
670	¿Cuál es la carga del ion amonio (NH4+)?	\N	+1	-1	+2	0	A	5
671	¿Que es un radical libre?	\N	Especie con electron desapareado	Molecula grande	Ion con carga completa	atomo neutro	A	5
672	¿Que fenomeno explica la disolucion de sal en agua?	\N	Interacciones ionicas y dipolo	Fusion	Sublimacion	Oxidacion	A	5
673	¿Que tipo de isomeria involucra compuestos con diferente enlace simple y doble?	\N	Geometrica	├ôptica	Constitucional	Funcional	C	5
674	¿Cuál es la definicion de mol en quimica?	\N	Cantidad de sustancia con 6.022├ù10^23 entidades	Volumen de gas ideal	Masa de un átomo	Concentracion	A	5
675	¿Que reaccion ocurre durante la combustion completa de un hidrocarburo?	\N	CO2 y H2O	CO y H2	C y H2	CO3 y H2	A	5
676	¿Que tipo de enlace presenta el diamante?	\N	Covalente red tridimensional	Ionico	Metálico	Van der Waals	A	5
677	¿Que sustancia se usa como estándar para medir la concentracion de iones H+?	\N	acido clorhidrico 0.1 M	Fenolftaleina	NaOH	Agua destilada	A	5
678	¿Que reaccion describe la formacion de un polimero a partir de monomeros?	\N	Polimerizacion por adicion	Esterificacion	Hidrolisis	Neutralizacion	A	5
679	¿Que es un ácido de Lewis?	\N	Acepta un par de electrones	Donador de protones	Neutral	Donador de electrones	A	5
680	¿Cuál es la relacion entre pH y concentracion de protones?	\N	pH = -log[H+]	pH = log[H+]	pH = [H+]	pH = 1/[H+]	A	5
681	¿Que nombre recibe el smeton que estudia el comportamiento de iones en solucion?	\N	Electroquimica	Termodinámica	Cinetica	Quiralidad	A	5
682	¿Que reaccion es exotermica?	\N	Combustion	Fusion	Evaporacion	Sublimacion	A	5
683	¿Que metodo separa componentes según sus puntos de ebullicion?	\N	Destilacion	Decantacion	Filtracion	Cromatografia	A	5
684	¿Cuál es el compuesto que da color a las hojas en otoño?	\N	Carotenoide	Clorofila	Antocianina	Melanina	C	5
685	¿Que tipo de isomeria geometrica existe en el 2-buteno?	\N	Cis-trans	├ôptica	Constitucional	Funcional	A	5
686	¿Cuál es la formula del ácido nitrico?	\N	HNO3	HCl	H2SO4	H3PO4	A	5
687	¿Que gas contribuye al efecto invernadero y se mide frecuentemente en ppm?	\N	CO2	O2	N2	H2	A	5
688	¿Que compuesto se usa en la industria para ablandar agua dura?	\N	Na2CO3	NaCl	KCl	MgSO4	A	5
689	¿Que reaccion convierte un ácido carboxilico en un alcohol?	\N	Reduccion	Oxidacion	Esterificacion	Hidrolisis	A	5
745	¿Cuál es la aceleracion de un objeto que parte del repositorio y alcanza una velocidad de 20 m/s en 4 s?	\N	5 m/s²	4 m/s²	6 m/s²	20 m/s²	B	6
746	Un objeto se mueve con velocidad constante. ¿Cuál es su aceleracion?	\N	Cero	Depende de la masa	Depende de la fuerza	No puede moverse	A	6
747	La segunda ley de Newton establece que F = m ² a. Si m se duplica y F permanece constante, ¿que ocurre con a?	\N	Se reduce a la mitad	Se duplica	Permanece igual	Se cuadruplica	A	6
748	¿Cuál es la fuerza neta sobre un objeto con masa 2 kg y aceleracion 3 m/s²?	\N	6 N	5 N	1.5 N	0.5 N	A	6
749	Si un objeto cae libremente cerca de la superficie terrestre, ¿cuál es su aceleracion aproximada?	\N	9.8 m/s²	9.8 km/s²	4.9 m/s²	0 m/s²	A	6
750	¿Que ley de Newton explica la reaccion de un balon al patearlo?	\N	Tercera ley	Primera ley	Segunda ley	Ley de gravitacion	A	6
751	En un sistema en equilibrio estático, la suma de fuerzas es:	\N	Cero	Igual al peso	Igual a la masa	No puede determinarse	A	6
752	¿Como se define el impulso (I) de una fuerza?	\N	I = F ² ╬öt	I = m ² v	I = F / t	I = ╬öv / m	A	6
753	Si un coche recorre 100 m en 5 s, ¿cuál es su velocidad promedio?	\N	20 m/s	5 m/s	100 m/s	0.2 m/s	A	6
754	¿Que gráfico tiene pendiente igual a aceleracion constante en un movimiento rectilineo?	\N	Velocidad vs. tiempo	Posicion vs. tiempo	Fuerza vs. tiempo	Tiempo vs. posicion	A	6
755	¿Cuál es el trabajo realizado al empujar con 10 N un objeto 3 m en direccion de la fuerza?	\N	30 J	13 J	7 J	0 J	A	6
756	La energia cinetica de un objeto viene dada por Ek = 1/2 m v². ¿Cuál es Ek para m=2 kg y v=3 m/s?	\N	9 J	6 J	12 J	3 J	A	6
757	¿Que forma de energia se asocia con la posicion de un objeto en un campo gravitatorio?	\N	Energia potencial gravitatoria	Energia cinetica	Energia termica	Energia electrica	A	6
758	¿Como se define la potencia promedio?	\N	Trabajo / tiempo	Energia ² tiempo	Fuerza / distancia	Velocidad ² tiempo	A	6
759	Un motor realiza 500 J de trabajo en 10 s. ¿Cuál es su potencia?	\N	50 W	5000 W	5 W	0.5 W	A	6
760	¿Que tipo de energia interna aumenta con la temperatura?	\N	Energia termica	Energia electrica	Energia cinetica macroscopica	Energia potencial gravitatoria	A	6
761	¿Cuál es el trabajo realizado si la fuerza es perpendicular al desplazamiento?	\N	Cero	Máximo	Negativo	Indeterminado	A	6
762	¿Que ley conserva la energia total en sistemas aislados?	\N	Conservacion de la energia	Segunda ley de Newton	Ley de Hooke	Ley de Ohm	A	6
763	¿Como varia la energia cinetica si se duplica la velocidad?	\N	Se cuadruplica	Se duplica	Permanece igual	Se reduce a la mitad	A	6
764	¿Que representa el área bajo la curva fuerza vs. desplazamiento?	\N	Trabajo	Potencia	Energia potencial	Energia cinetica	A	6
765	¿Cuál es la ley que establece que la energia no se crea ni se destruye, solo se transforma?	\N	Primera ley de la termodinámica	Segunda ley de la termodinámica	Ley de Boyle	Ley de Charles	A	6
766	¿Como se llama el proceso que mantiene constante la temperatura durante una transformacion?	\N	Isotermico	Isobárico	Adiabático	Isocorico	A	6
767	¿Que ocurre con la presion de un gas ideal si la temperatura aumenta y el volumen es constante?	\N	Aumenta	Disminuye	Permanece igual	Cero	A	6
768	¿En que proceso no hay transferencia de calor con el entorno?	\N	Adiabático	Isotermico	Isobárico	Isocorico	A	6
769	La entropia de un sistema aislado:	\N	Aumenta o permanece constante	Disminuye siempre	Es cero	Es negativa	A	6
770	¿Que mide la capacidad calorifica de una sustancia?	\N	La energia para cambiar 1°C	La velocidad de enfriamiento	La presion interna	La densidad	A	6
771	¿Cuál es la relacion de presion y volumen en un proceso isotermico?	\N	P²V = constante	P/T = constante	V/T = constante	P+V = constante	A	6
772	¿Que instrumento mide la temperatura con alta precision?	\N	Termometro de resistencia	Barometro	Manometro	Calorimetro	A	6
773	¿Cuál es el cero absoluto en Kelvin?	\N	0 K	273 K	100 K	373 K	A	6
774	¿Que unidad se usa para la energia termica en el SI?	\N	Joule	Caloria	ergio	eV	A	6
775	¿Que es la frecuencia de una onda?	\N	Número de ciclos por segundo	Longitud de onda	Amplitud	Velocidad	A	6
776	¿Como se relaciona la velocidad de la onda con frecuencia y longitud?	\N	v = f ² ╬╗	v = f / ╬╗	v = ╬╗ / f	f = v / t	A	6
777	¿Que es la amplitud de una onda?	\N	Desplazamiento máximo desde el equilibrio	Cycle completo	Cresta a cresta	Velocidad de propagacion	A	6
778	¿Cuál es la velocidad aproximada del sonido en aire a 20°C?	\N	343 m/s	300 m/s	343 km/s	30 m/s	A	6
779	¿Que fenomeno sucede cuando dos ondas se superponen y refuerzan mutuamente?	\N	Interferencia constructiva	Interferencia destructiva	Difraccion	Reflexion	A	6
780	¿Que ocurre durante la difraccion de una onda?	\N	Se curva al pasar un obstáculo	Se refleja completamente	Se detiene	Se acelera	A	6
781	¿Que instrumento mide la intensidad sonora?	\N	Sonometro	Volimetro	Barometro	Termometro	A	6
782	¿Que caracteristica de la onda percibimos como tono?	\N	Frecuencia	Amplitud	Longitud de onda	Velocidad	A	6
783	¿Que es la velocidad de grupo de una onda?	\N	Velocidad de la envolvente de la onda	Velocidad de fase	Amplitud	Frecuencia	A	6
784	¿Que tipo de onda sonora no puede propagarse en el vacio?	\N	Mecánica	Electromagnetica	Gravitatoria	Electrostática	A	6
785	¿Que ley explica el ángulo de incidencia y reflexion iguales?	\N	Ley de reflexion	Ley de refraccion	Ley de difraccion	Ley de Snell	A	6
786	¿Cuál es el indice de refraccion del agua aproximadamente?	\N	1.33	1.00	1.50	2.00	A	6
787	¿Que ocurre cuando la luz blanca pasa por un prisma?	\N	Se dispersa en colores	Se refleja sin cambio	Se absorbe	Se duplica	A	6
788	¿Que tipo de lente convergente focaliza los rayos paralelos?	\N	Convexa	Concava	Plano	Prisma	A	6
789	¿Como se define la distancia focal de una lente?	\N	Distancia al punto focal	Diámetro de la lente	Grossura de la lente	Curvatura	A	6
790	¿Que instrumento usa un haz de luz y un espejo giratorio para medir distancias?	\N	Telemetro optico	Microscopio	Telescopio	Espectrometro	A	6
791	¿Que es la aberracion cromática en lentes?	\N	Distorsion de colores	Perdida de luz	Rasgado de imagen	Amplificacion	A	6
792	¿Que ocurre con la longitud de onda cuando la luz entra en un medio más denso?	\N	Se acorta	Se alarga	Permanece igual	Se destruye	A	6
793	¿Que es la reflexion total interna?	\N	Ocurre cuando el ángulo supera el critico	Siempre ocurre en espejos	Ocurre en todos los ángulos	No existe	A	6
794	¿Que ley relaciona los senos de los ángulos de incidencia y refraccion?	\N	Ley de Snell	Ley de Fresnel	Ley de Malus	Ley de Brewster	A	6
795	¿Que ley establece que la circulacion de la fuerza electromotriz es igual a la variacion del flujo magnetico?	\N	Ley de Faraday	Ley de Ohm	Ley de Gauss	Ley de Amp├¿re	A	6
796	¿Que unidad mide la resistencia electrica?	\N	Ohmio (®)	Faradio (F)	Henry (H)	Tesla (T)	A	6
797	¿Cuál es la relacion de la ley de Ohm?	\N	V = I ² R	I = V + R	R = V / I²	P = I ² V	A	6
798	¿Que es un dipolo electrico?	\N	Dos cargas iguales y opuestas separadas	Carga única	Campo magnetico	Resistencia variable	A	6
799	¿Como se define el campo electrico cerca de una carga puntual?	\N	E = k²q/r²	E = q²r²	E = r²/q	E = k²r/q	A	6
800	¿Que magnitud expresa la fuerza entre dos cargas electricas?	\N	F = k²q1²q2/r²	F = q1 + q2	F = k²r²/q1²q2	F = q1²q2	A	6
801	¿Que unidad mide el flujo magnetico?	\N	Weber (Wb)	Tesla (T)	Voltio (V)	Newton (N)	A	6
802	¿Cuál es la direccion del campo magnetico alrededor de un conductor recto con corriente?	\N	Circular alrededor del conductor	Recta y paralela	Hacia el centro	Errática	A	6
803	¿Que ley relaciona corrientes y campos magneticos en un circuito cerrado?	\N	Ley de Amp├¿re	Ley de Maxwell	Ley de Faraday	Ley de Coulomb	A	6
804	¿Que es la induccion electromagnetica?	\N	Generacion de voltaje por cambio de flujo	Generacion de calor	Movimiento de cargas	Produccion de luz	A	6
805	¿Cuál de estas particulas es la portadora de la interaccion electromagnetica?	\N	Foton	Electron	Proton	Neutron	A	6
806	¿Que modelo describe el comportamiento de electrones en átomos de hidrogeno?	\N	Modelo de Bohr	Modelo de Dalton	Modelo de Rutherford	Modelo de Thomson	A	6
807	¿Cuál es el principio de incertidumbre de Heisenberg?	\N	No se pueden medir simultáneamente posicion y momento con precision arbitraria	Energia y tiempo son proporcionales	La velocidad de la luz es constante	La masa es variable	A	6
808	¿Que estudia la teoria de la relatividad especial?	\N	Movimiento a velocidades cercanas a c	Galaxias	Reacciones quimicas	Fenomenos microscopicos	A	6
809	¿Cuál es la ecuacion famosa de Einstein?	\N	E = m²c²	F = m²a	p = m²v	V = I²R	A	6
810	¿Que es un positron?	\N	Antiparticula del electron	Electron con carga neutra	Proton sin carga	Neutron con carga positiva	A	6
811	¿Que fenomeno demuestra la dualidad onda-particula?	\N	Efecto fotoelectrico	Difraccion	Reflexion	Interferencia	A	6
812	¿Cuál es la longitud de onda de un electron de alta energia comparada con la luz visible?	\N	Mucho más corta	Igual	Mucho más larga	No tiene longitud de onda	A	6
813	¿Quien propuso la teoria cuántica de la luz?	\N	Max Planck	Isaac Newton	Niels Bohr	Galileo	A	6
814	¿Que describe la ecuacion de Schr├Âdinger?	\N	Evolucion de la funcion de onda	Movimiento planetario	Ley de Ohm	Expansion termica	A	6
815	¿De que magnitud fisica depende la inercia de un objeto?	\N	Masa	Volumen	area	Tiempo	A	6
816	¿Cuál es la forma de energia interna de un gas ideal proporcional principalmente a su temperatura?	\N	Energia cinetica de sus moleculas	Energia potencial gravitatoria	Energia electrica	Energia quimica	A	6
817	¿Que proceso termodinámico ocurre sin intercambio de calor con el entorno?	\N	Proceso adiabático	Proceso isotermico	Proceso isobárico	Proceso isocorico	A	6
818	¿Que caracteriza al ciclo de Carnot en termodinámica?	\N	Es reversible y de máxima eficiencia	Es irreversible y de minima eficiencia	Solo es adiabático	Solo es isotermico	A	6
819	¿Cuál ley describe la relacion entre volumen y temperatura a presion constante?	\N	Ley de Charles	Ley de Boyle	Ley de Gay-Lussac	Ley de Avogadro	A	6
820	¿Como se calcula la presion en un punto a cierta profundidad en un liquido incomprensible?	\N	P = ¤ü ² g ² h	P = m ² a	P = F / A	P = V ² I	A	6
821	¿Cuál es el principio de Bernoulli para un fluido ideal en movimiento?	\N	La suma de presion, energia cinetica y potencial es constante	La presion aumenta con la velocidad	La energia termica se conserva	La masa se crea	A	6
822	¿Que ley establece que la fuerza de un resorte es proporcional al alargamiento?	\N	Ley de Hooke	Ley de Ohm	Ley de Boyle	Ley de Snell	A	6
823	¿Como se determina el periodo de un pendulo simple de longitud L?	\N	T = 2¤Ç ² ÔêÜ(L / g)	T = 2¤Ç ² ÔêÜ(g / L)	T = L / g	T = g / L	A	6
824	¿Que velocidad debe tener un satelite en orbita circular a radio r alrededor de la Tierra?	\N	v = ÔêÜ(G ² M / r)	v = G ² M / r²	v = r ² ¤ë	v = M / (G ² r)	A	6
825	¿Que describe la ley de gravitacion universal de Newton?	\N	F = G ² mÔéü ² mCO2 / r²	F = m ² a	F = k ² x	F = q ² E	A	6
826	¿Que fenomeno explica el cambio de frecuencia al moverse la fuente o el observador?	\N	Efecto Doppler	Interferencia	Difraccion	Reflexion	A	6
827	¿Como se define el indice de refraccion de un medio?	\N	n = c / v	n = v / c	n = f ² ╬╗	n = P ² V	A	6
828	¿Que condicion debe cumplirse para que ocurra reflexion total interna?	\N	El ángulo de incidencia > ángulo critico	El indice de refraccion del incidente < del transmitido	La frecuencia sea máxima	La longitud de onda sea minima	A	6
829	¿Que ley relaciona la radiacion emitida por un cuerpo negro con su temperatura?	\N	Ley de Stefan-Boltzmann	Ley de Planck	Ley de Wien	Ley de Kirchhoff	A	6
830	¿Como se calcula la energia radiada por unidad de área de un cuerpo negro?	\N	E = ¤â ² TÔü┤	E = k ² T	E = h ² ╬¢	E = R ² T	A	6
831	¿Que establece el principio de superposicion de ondas?	\N	Las ondas se suman algebraicamente	Las ondas se cancelan siempre	Las ondas se propagan independientemente	Las ondas cambian de frecuencia	A	6
832	¿Como se determina el campo magnetico en el centro de una espira circular de radio R con corriente I?	\N	B = ╬╝ÔéÇ ² I / (2 ² R)	B = ╬╝ÔéÇ ² I ² R²	B = ╬╝ÔéÇ ² I ² R / 2	B = I / (╬╝ÔéÇ ² R)	A	6
833	¿Que ley describe la induccion de una corriente electrica por cambio de flujo magnetico?	\N	Ley de Faraday-Lenz	Ley de Amp├¿re	Ley de Coulomb	Ley de Gauss	A	6
834	¿Que unidad se usa para medir la inductancia electrica?	\N	Henry (H)	Farad (F)	Ohm (®)	Tesla (T)	A	6
835	¿En que año comenzo la Revolucion Francesa?	\N	1789	1776	1812	1848	A	7
836	¿En que año inicio la Primera Guerra Mundial?	\N	1914	1939	1918	1905	A	7
837	¿En que año comenzo la Segunda Guerra Mundial?	\N	1939	1914	1929	1945	A	7
838	¿En que año termino la Segunda Guerra Mundial?	\N	1945	1942	1950	1939	A	7
839	¿En que año se independizo Chile de España?	\N	1818	1810	1821	1808	A	7
840	¿En que batalla se consolido la independencia de Chile?	\N	Maipú	Chacabuco	Membrillar	Rancagua	A	7
841	¿En que fecha se produjo el golpe de Estado en Chile en 1973?	\N	11 de septiembre de 1973	12 de marzo de 1973	1 de abril de 1973	21 de mayo de 1973	A	7
842	¿En que año cayo el Muro de Berlin?	\N	1989	1991	1987	1990	A	7
843	¿En que año se fundo la Organizacion de las Naciones Unidas (ONU)?	\N	1945	1919	1939	1950	A	7
844	¿En que año se produjo la Independencia de Estados Unidos?	\N	1776	1783	1812	1754	A	7
845	¿Que es la democracia?	\N	Gobierno del pueblo	Gobierno de un solo lider	Gobierno de una elite	Ausencia de gobierno	A	7
846	¿Que define a una república?	\N	Jefatura de Estado electa	Monarquia hereditaria	Teocracia	Dictadura	A	7
847	¿Que caracteriza a una monarquia constitucional?	\N	Rey con poderes limitados por ley	Rey absoluto	República sin presidente	Gobierno militar	A	7
848	¿Que es el federalismo?	\N	Distribucion de poder entre niveles	Gobierno centralizado	Ausencia de poder	Monarquia dual	A	7
849	¿Que promueve el socialismo?	\N	Propiedad colectiva de medios de produccion	Propiedad privada absoluta	Libre mercado sin regulacion	Anarquia total	A	7
850	¿Que caracteriza al capitalismo?	\N	Propiedad privada y mercado libre	Control estatal absoluto	Economia de trueque	Moneda única global	A	7
851	¿Que es el nacionalismo?	\N	Lealtad a la nacion	Rechazo de la nacion	Gobierno global	Sistema economico	A	7
852	¿Que define al fascismo?	\N	Totalitarismo y nacionalismo extremo	Democracia participativa	Anarquia pacifica	Monarquia parlamentaria	A	7
853	¿Que propone el liberalismo clásico?	\N	Libertad individual y economia de mercado	Control estatal de todo	Sistema comunal	Monopolio economico	A	7
854	¿Que es el marxismo?	\N	Teoria de lucha de clases	Teoria monárquica	Doctrina teologica	Sistema feudal	A	7
855	¿Cuál es el proposito principal de la Organizacion Mundial de la Salud (OMS)?	\N	Coordinar politicas de salud global	Regular el comercio internacional	Dirigir conflictos armados	Gestionar fondos de pension	A	7
856	¿Que evento dio origen al Fondo Monetario Internacional (FMI)?	\N	Conferencia de Bretton Woods 1944	Tratado de Versalles 1919	Cumbre de Paris 1951	Declaracion de Chapultepec 1945	A	7
857	¿Cuál es la funcion principal del Banco Mundial?	\N	Financiar proyectos de desarrollo	Emitir moneda global	Regular precios del petroleo	Organizar elecciones	A	7
858	¿Que alianza militar se creo en 1949 para defensa mutua?	\N	OTAN	Pacto de Varsovia	ONU	Mercosur	A	7
859	¿Cuál es el objetivo de la Organizacion de Estados Americanos (OEA)?	\N	Promover democracia y derechos humanos	Regular aranceles agricolas	Gestionar espacio aereo	Coordinar proyectos cientificos	A	7
860	¿Que agencia de la ONU se enfoca en educacion, ciencia y cultura?	\N	UNESCO	UNICEF	FAO	OIT	A	7
861	¿Que organismo promueve el libre comercio internacional?	\N	OMC	UNCTAD	OIT	OMS	A	7
862	¿Que agencia de la ONU cubre la alimentacion y la agricultura?	\N	FAO	UNHCR	ILO	UNEP	A	7
863	¿Cuál es el proposito de la Organizacion Mundial del Comercio (OMC)?	\N	Regular normas comerciales globales	Coordinar ayuda humanitaria	Producir articulos culturales	Supervisar elecciones	A	7
864	¿Que organismo regula la salud de los refugiados?	\N	ACNUR	OIM	UNCTAD	UNESCO	A	7
865	¿Que movimiento lucho por los derechos civiles de la poblacion afroamericana en EE.UU.?	\N	Movimiento por los Derechos Civiles	Primavera arabe	Revolucion Industrial	Movimiento Sufragista	A	7
866	¿Cuál fue el objetivo del movimiento sufragista?	\N	Derecho al voto femenino	Derecho al trabajo infantil	Prohibicion del alcohol	Derecho a voto de menores	A	7
867	¿Que buscaba el movimiento obrero en el siglo XIX?	\N	Mejores condiciones de trabajo	Supresion de salarios	Trabajo infantil obligatorio	Fin de la paga laboral	A	7
868	¿Que movimiento impulso la caida del apartheid en Sudáfrica?	\N	Movimiento anti-apartheid	Primavera arabe	Revolucion Francesa	Movimiento antimonopolio	A	7
869	¿Que promovio el movimiento feminista de la segunda ola?	\N	Igualdad de genero y derechos reproductivos	Reparto de tierras	Nacionalismo extremo	Monarquia absoluta	A	7
870	¿Cuál fue el proposito de la Declaracion Universal de Derechos Humanos de 1948?	\N	Garantizar derechos básicos globales	Regular comercio	Crear armas nucleares	Definir fronteras	A	7
871	¿Que movimiento busca la defensa de los pueblos originarios?	\N	Movimientos indigenas	Tecnocracia	Industrialismo	Globalizacion	A	7
872	¿Cuál es el enfoque principal del movimiento ambientalista?	\N	Proteccion del medio ambiente	Expansion urbana	Industrializacion	Deforestacion	A	7
873	¿Que movimiento abogo por la abolicion de la esclavitud?	\N	Movimiento abolicionista	Movimiento monárquico	Movimiento teocrático	Movimiento literario	A	7
874	¿Que lucha define al movimiento LGBT+	\N	Igualdad de derechos para personas LGBT+	Proteccion de monarquias	Promocion de guerras	Restriccion de prensa	A	7
875	¿Que documento establece la organizacion politica de un Estado?	\N	Constitucion	Ley penal	Reglamento	Decreto	A	7
876	¿Que principio describe la separacion de poderes?	\N	Division entre ejecutivo, legislativo y judicial	Poder único	Anarquia	Teocracia	A	7
877	¿Quien ejerce el poder legislativo en Chile?	\N	Congreso Nacional	Presidente	Corte Suprema	Municipalidades	A	7
878	¿Que garantia fundamental protege la libertad de expresion?	\N	Derecho a la libertad de opinion	Derecho de autor	Secreto bancario	Derecho de patentes	A	7
879	¿Que derecho social reconoce la educacion gratuita?	\N	Derechos sociales	Derechos civiles	Derechos politicos	Derechos economicos	A	7
880	¿En que documento aparece el derecho al sufragio universal en Chile?	\N	Constitucion de 1980	Codigo Civil	Ley Orgánica Constitucional	Reglamento Electoral	A	7
881	¿Que rama del gobierno se encarga de impartir justicia?	\N	Judicial	Ejecutiva	Legislativa	Militar	A	7
882	¿Cuál es la funcion del Poder Ejecutivo?	\N	Ejecutar leyes y administrar el Estado	Redactar leyes	Juzgar delitos	Control militar	A	7
883	¿Que significa el principio de igualdad ante la ley?	\N	Todos tienen los mismos derechos y obligaciones	Algunos son privilegiados	Solo los ciudadanos votan	Solo el presidente decide	A	7
884	¿Que derecho protege la inviolabilidad del hogar?	\N	Derecho a la privacidad	Derecho al trabajo	Derecho a la propiedad	Derecho de reunion	A	7
885	¿Cuál es la capital de Chile?	\N	Santiago	Valparaiso	Concepcion	La Serena	A	7
886	¿Que oceano baña la costa de Chile Occidental?	\N	Pacifico	Atlántico	├ìndico	Glacial artico	A	7
887	¿Cuál es el rio más largo del mundo?	\N	Nilo	Amazonas	Yangtse	Misisipi	A	7
888	¿Cuál es la montaña más alta del mundo?	\N	Everest	K2	Kangchenjunga	Lhotse	A	7
889	¿Que pais tiene la mayor poblacion mundial?	\N	China	India	EE.UU.	Rusia	A	7
890	¿En que hemisferio se ubica Chile principalmente?	\N	Sur	Norte	Este	Oeste	A	7
891	¿Cuál es la superficie aproximada de Chile?	\N	756.000 km²	1.000.000 km²	500.000 km²	2.000.000 km²	A	7
892	¿Que idioma es oficial en la Asamblea General de la ONU?	\N	Ingles	Español	Frances	Ruso	A	7
893	¿Que continente comprende mayor diversidad cultural?	\N	Asia	Europa	Oceania	Antártida	A	7
894	¿Cuál es el pais más extenso de America del Sur?	\N	Brasil	Argentina	Perú	Colombia	A	7
895	¿Que caracteristica define a la economia de mercado?	\N	Libre interaccion de oferta y demanda	Control estatal total	Trueque sin moneda	Monopolio gubernamental	A	7
896	¿Que evento provoco la Gran Depresion en 1929?	\N	Crack de Wall Street	Primera Guerra Mundial	Segunda Guerra Mundial	Revolucion Rusa	A	7
897	¿Que conferencia establecio el sistema monetario internacional posguerra?	\N	Bretton Woods	Yalta	Versalles	Teherán	A	7
898	¿Que organismo promueve las politicas del Consenso de Washington?	\N	FMI	UNESCO	CERN	Interpol	A	7
899	¿Que modelo economico combina iniciativa privada y regulacion estatal?	\N	Economia mixta	Economia planificada	Economia extractiva	Economia feudal	A	7
900	¿Que doctrina politica propone el minimo estado	\N	Liberalismo clásico	Socialismo	Anarquismo	Comunismo	A	7
901	¿Que crisis global se referia a la recesion iniciada en 2008?	\N	Crisis financiera mundial	Crisis del petroleo	Crisis asiática	Crisis de deuda latinoamericana	A	7
902	¿Que teoria economica enfatiza el papel del capital humano?	\N	Teoria del capital humano	Teoria de la dependencia	Teoria de la oferta	Teoria mercantilista	A	7
903	¿Que bloque economico integro a Argentina, Brasil, Paraguay y Uruguay?	\N	Mercosur	NAFTA	Union Europea	ASEAN	A	7
904	¿Que politica implico privatizaciones y apertura economica en Chile a partir de 1975?	\N	Neoliberalismo	Keynesianismo	Socialismo	Autarquia	A	7
905	¿En que año se promulgo la Constitucion de Cádiz, la primera en España que reconocio derechos fundamentales?	\N	1812	1808	1823	1833	A	7
906	¿Que tratado puso fin a la Guerra de los Cien Años entre Inglaterra y Francia?	\N	Tratado de Castillon	Tratado de Troyes	Paz de Westfalia	Tratado de Paris	A	7
907	¿Que filosofo griego es considerado el padre de la politica en Occidente?	\N	Aristoteles	Platon	Socrates	Jenofonte	A	7
908	¿Cuál fue la principal causa de la Caida del Imperio Romano de Occidente?	\N	Invasiones bárbaras	Crisis economica	Pandemias	Fallas tecnologicas	A	7
909	¿Que imperio establecio la Ruta de la Seda conectando Asia y Europa?	\N	Imperio Persa	Imperio Romano	Imperio Otomano	Imperio Español	A	7
910	¿Quien lidero la unificacion de Alemania en el siglo XIX?	\N	Otto von Bismarck	Napoleon III	Wilhelm II	Friedrich Engels	A	7
911	¿Que revolucion influyo en numerosas independencias latinoamericanas a principios del siglo XIX?	\N	Revolucion Francesa	Revolucion Industrial	Revolucion Rusa	Revolucion Cientifica	A	7
912	¿En que conferencia se acordo la particion de africa entre potencias europeas en 1884-1885?	\N	Conferencia de Berlin	Tratado de Berlin	Congreso de Viena	Conferencia de Paris	A	7
913	¿Que civilizacion precolombina construyo Machu Picchu?	\N	Imperio Inca	Imperio Azteca	Maya	Tolteca	A	7
914	¿Que acontecimiento marco el comienzo de la Edad Moderna?	\N	Caida de Constantinopla	Descubrimiento de America	Reforma Protestante	Invencion de la imprenta	A	7
915	¿Quien fue la figura central de la Reforma Protestante en 1517?	\N	Martin Lutero	Juan Calvino	Enrique VIII	Ulrich Zwinglio	A	7
916	¿Que movimiento artistico florecio en Europa tras la Edad Media, centrado en el humanismo y la antigúedad clásica?	\N	Renacimiento	Barroco	Romanticismo	Gotico	A	7
917	¿Que sistema de trabajo fue impuesto en America colonial basado en encomiendas?	\N	Sistema de encomienda	Sistema feudal	Mita	Ayllu	A	7
918	¿Que guerra civil dividio Inglaterra entre 1642 y 1651?	\N	Guerra Civil Inglesa	Guerra de las Dos Rosas	Rebelion de los Boxers	Conquista de Irlanda	A	7
919	¿Que lider de la independencia de India proclamo la teoria de la no violencia?	\N	Mahatma Gandhi	Jawaharlal Nehru	Subhas Chandra Bose	Sardar Patel	A	7
920	¿Cuál fue el objetivo principal del Plan Marshall tras la Segunda Guerra Mundial?	\N	Reconstruccion de Europa Occidental	Descolonizacion	Expansion sovietica	Sudánizacion	A	7
921	¿Que año marco el fin oficial del apartheid en Sudáfrica con las primeras elecciones multirraciales?	\N	1994	1989	2000	1976	A	7
922	¿Que doctrina estadounidense declaro la oposicion al expansionismo sovietico durante la Guerra Fria?	\N	Doctrina Truman	Doctrina Monroe	Plan Marshall	Pacto de Varsovia	A	7
923	¿Quien fue el primer presidente de los Estados Unidos tras la independencia?	\N	George Washington	Thomas Jefferson	John Adams	James Madison	A	7
924	¿Que evento detono la Crisis de los Misiles en Cuba de 1962?	\N	Instalacion de misiles sovieticos en Cuba	Invasion de Bahia de Cochinos	Construccion del Muro de Berlin	Desclasificacion de la Doctrina Monroe	A	7
\.


--
-- Data for Name: respuestas; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.respuestas (id, resultado_id, pregunta_id, respuesta_dada, correcta) FROM stdin;
\.


--
-- Data for Name: resultados; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.resultados (id, ensayo_id, alumno_id, puntaje, fecha) FROM stdin;
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.usuarios (id, nombre, correo, contrasena, rol) FROM stdin;
1	Juan Perez	juan@correo.com	1234	docente
2	Camila Yael Loayza Arredondo	caca@gmail.com	123	alumno
3	Agustin Santibañez	agus@gmail.com	123	docente
4	alicia	ali@gmail.com	123	docente
\.


--
-- Name: ensayo_pregunta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.ensayo_pregunta_id_seq', 25, true);


--
-- Name: ensayos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.ensayos_id_seq', 1, true);


--
-- Name: materias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.materias_id_seq', 1, false);


--
-- Name: preguntas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.preguntas_id_seq', 924, true);


--
-- Name: respuestas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.respuestas_id_seq', 1, false);


--
-- Name: resultados_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.resultados_id_seq', 1, false);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 4, true);


--
-- Name: ensayo_pregunta ensayo_pregunta_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.ensayo_pregunta
    ADD CONSTRAINT ensayo_pregunta_pkey PRIMARY KEY (id);


--
-- Name: ensayos ensayos_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.ensayos
    ADD CONSTRAINT ensayos_pkey PRIMARY KEY (id);


--
-- Name: materias materias_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.materias
    ADD CONSTRAINT materias_pkey PRIMARY KEY (id);


--
-- Name: preguntas preguntas_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.preguntas
    ADD CONSTRAINT preguntas_pkey PRIMARY KEY (id);


--
-- Name: respuestas respuestas_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.respuestas
    ADD CONSTRAINT respuestas_pkey PRIMARY KEY (id);


--
-- Name: resultados resultados_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.resultados
    ADD CONSTRAINT resultados_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: ensayo_pregunta ensayo_pregunta_ensayo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.ensayo_pregunta
    ADD CONSTRAINT ensayo_pregunta_ensayo_id_fkey FOREIGN KEY (ensayo_id) REFERENCES public.ensayos(id);


--
-- Name: ensayo_pregunta ensayo_pregunta_pregunta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.ensayo_pregunta
    ADD CONSTRAINT ensayo_pregunta_pregunta_id_fkey FOREIGN KEY (pregunta_id) REFERENCES public.preguntas(id);


--
-- Name: ensayos ensayos_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.ensayos
    ADD CONSTRAINT ensayos_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.usuarios(id);


--
-- Name: ensayos ensayos_materia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.ensayos
    ADD CONSTRAINT ensayos_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materias(id);


--
-- Name: preguntas preguntas_materia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.preguntas
    ADD CONSTRAINT preguntas_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materias(id);


--
-- Name: respuestas respuestas_pregunta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.respuestas
    ADD CONSTRAINT respuestas_pregunta_id_fkey FOREIGN KEY (pregunta_id) REFERENCES public.preguntas(id);


--
-- Name: respuestas respuestas_resultado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.respuestas
    ADD CONSTRAINT respuestas_resultado_id_fkey FOREIGN KEY (resultado_id) REFERENCES public.resultados(id);


--
-- Name: resultados resultados_alumno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.resultados
    ADD CONSTRAINT resultados_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES public.usuarios(id);


--
-- Name: resultados resultados_ensayo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.resultados
    ADD CONSTRAINT resultados_ensayo_id_fkey FOREIGN KEY (ensayo_id) REFERENCES public.ensayos(id);


--
-- PostgreSQL database dump complete
--

