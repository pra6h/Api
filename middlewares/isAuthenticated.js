import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "User not Authenticated.",
        success: false,
      });
    }

    // ✅ Correct method: jwt.verify
    const decode = jwt.verify(token, process.env.SECRET_KEY);

    req.id = decode.userId; // ✅ correct field
    req.role = decode.role;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      message: "Authentication failed",
      success: false,
    });
  }
};

export default isAuthenticated;
