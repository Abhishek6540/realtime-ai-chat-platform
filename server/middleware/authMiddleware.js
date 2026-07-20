import { verifyToken } from "../services/AuthService.js";

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({
      error: "No token",
    });

  const decoded = verifyToken(token);

  if (!decoded)
    return res.status(401).json({
      error: "Invalid Token",
    });

  req.userId = decoded.userId;

  next();
};

export default authMiddleware;