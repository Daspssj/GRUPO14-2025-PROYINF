import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use((req, _res, next) => { console.log(req.method, req.originalUrl); next(); });
app.get("/health", (_req, res) => res.json({ ok: true, service: "colegios-cursos" }));
app.use("/api", routes);


const PORT = process.env.PORT ? Number(process.env.PORT) : 5007;
app.listen(PORT, () => {
  console.log(`colegios-cursos-service listening on ${PORT}`);
});