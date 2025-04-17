const jwt = require("jsonwebtoken");

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    // Verificar si el encabezado de autorización está presente
    if (!authHeader) {
      return res.status(401).json({ message: "Acceso denegado. Encabezado de autorización no proporcionado." });
    }

    // Extraer el token del encabezado
    const token = authHeader.split(" ")[1]; // Formato esperado: Bearer TOKEN
    if (!token) {
      return res.status(401).json({ message: "Acceso denegado. Token no proporcionado." });
    }

    // Verificar el token
    const verified = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.user = verified; // Agregar los datos del usuario al objeto `req`
    next();
  } catch (error) {
    console.error("Error al verificar el token:", error);
    res.status(401).json({ message: "Token inválido o expirado." });
  }
};

// Middleware para verificar roles
const checkRole = (roles) => {
  return (req, res, next) => {
    try {
      // Verificar si el usuario está autenticado
      if (!req.user) {
        return res.status(401).json({ message: "No autenticado. Por favor, inicia sesión." });
      }

      // Verificar si el rol del usuario está permitido
      if (!roles.includes(req.user.rol)) {
        return res.status(403).json({ message: "No tienes permisos para realizar esta acción." });
      }

      next();
    } catch (error) {
      console.error("Error al verificar el rol:", error);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  };
};

module.exports = {
  verifyToken,
  checkRole,
};