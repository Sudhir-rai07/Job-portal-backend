import jwt from 'jsonwebtoken'

const protectRoute = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token =req.headers.authorization && req.headers.authorization.split(' ')[1];

    // Check if the token exists
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error('Error in protectRoute:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
export default protectRoute
