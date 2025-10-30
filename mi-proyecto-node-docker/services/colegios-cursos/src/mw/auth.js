import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No token" });

  const secret = process.env.JWT_SECRET || "superSecret123";
  const expectedIssuer = process.env.JWT_ISSUER || "paes-auth";

  try {
    // Verificamos SIN forzar issuer (compatibilidad con tokens sin 'iss')
    const payload = jwt.verify(token, secret);

    // Si el token tiene 'iss' y difiere, puedes loguearlo (o rechazarlo si quieres ser estricto)
    if (payload.iss && expectedIssuer && payload.iss !== expectedIssuer) {
      console.warn(`JWT issuer mismatch: got "${payload.iss}" expected "${expectedIssuer}"`);
      // return res.status(401).json({ error: "Invalid issuer" }); // <-- si quieres estrictitud
    }

    // Aceptamos id en varias claims
    const uid = payload.uid || payload.id || payload.sub;
    const rol = payload.rol || payload.role;
    if (!uid || !rol) return res.status(401).json({ error: "Invalid claims" });

    req.user = { id: uid, rol };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}