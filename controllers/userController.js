const User = require('../models/user');

// Get user details function
exports.getUserDetails = (req, res) => {
  const userId = req.userData.userId;

  // Find user in database by ID
  User.findById(userId)
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(user);
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
};