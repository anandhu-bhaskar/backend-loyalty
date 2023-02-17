const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

// // Check if user is authenticated
module.exports = (req, res, next) => {
    let token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) 
    {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = decoded;
        console.log(req.userData)
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Authentication failed'
        });
    }
    }
    // if (!token) {
    //     console.log("No token")
    //     res.status(401)
    //     throw new Error('Not authorized')
    // }
};
           