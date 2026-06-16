const admin = require("firebase-admin");

// ✅ FIX: make sure admin is initialized before using auth()
const { getAuth } = require("firebase-admin/auth");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.sendStatus(401);
    }

    const token = authHeader.split("Bearer ")[1];

    const decoded = await getAuth().verifyIdToken(token);

    req.user = decoded;
    next();

  } catch (err) {
    console.log("Auth error:", err.message);
    console.log("AUTH HEADER =", req.headers.authorization);
    return res.sendStatus(403);
  }
};

module.exports = authenticate;