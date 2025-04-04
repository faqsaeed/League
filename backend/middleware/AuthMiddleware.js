const jwt = require("jsonwebtoken");

const JWT_SECRET = "FaiqSaeed"; // Keep it the same as in authRoutes.js


const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) 
        return res.status(401).json({ error: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: "Invalid or expired token" });
    }
};


const verifyAdmin = (req, res, next) => {
    if (req.user.role !== "Admin") {
        return res.status(403).json({ error: "Access denied. Admins only." });
    }
    next();
};


const verifyAdminOrOwner = (req, res, next) => {
    if (req.user.role !== "Admin" && req.user.role !== "Owner") {
        return res.status(403).json({ error: "Access denied. Owners or Admins only." });
    }
    next();
};


const verifyOwnerForTeam = (req, res, next) => {
    const { teamID } = req.params;

    if (req.user.role !== "Admin" && req.user.teamID != teamID) 
    {
        return res.status(403).json({ error: "Access denied. You can only manage your own team." });
    }
    next();
};

module.exports = { verifyToken, verifyAdmin, verifyAdminOrOwner, verifyOwnerForTeam };
