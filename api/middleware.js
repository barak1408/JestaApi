const admin = require("firebase-admin");

const authenticate = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    // no token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.sendStatus(401);
    }

    const token = authHeader.split("Bearer ")[1];

    // verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    // attach user info to request
    req.user = decoded;

    next();

  } catch (err) {
    console.log("Auth error:", err.message);
    return res.sendStatus(403);
  }
};

module.exports = authenticate;