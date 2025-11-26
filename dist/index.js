import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 4000;
const SECRET = "ma_cle_secrete"; // à changer en prod
// Utilisateurs mockés
const users = [
    { id: "1", username: "admin", password: "admin123", role: "admin" },
    { id: "2", username: "agent", password: "agent123", role: "agent" },
    { id: "3", username: "user", password: "user123", role: "user" },
];
// Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user)
        return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, {
        expiresIn: "1h",
    });
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const time = new Date().toISOString();
    const role = user.role;
    console.log(`🔐 Nouvelle connexion :
  ➤ IP : ${ip}
  ➤ Heure : ${time}
  ➤ Utilisateur : ${username}
  ➤ Rôle : ${role}
    `);
    res.json({ token, role: user.role });
});
// Vérifier le token (middleware)
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ message: "No token" });
    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, SECRET);
        req.user = payload;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
// Exemple route protégée
app.get("/profile", authMiddleware, (req, res) => {
    res.json({ message: "Protected route", user: req.user });
});
app.listen(PORT, () => console.log(`Auth API running on http://localhost:${PORT}`));
