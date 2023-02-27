const axios = require('axios');
const User = require('../models/user');

// Get Ethereum balance function
exports.getTrothBalance = (req, res) => {
  const userId = req.userData.userId;

  // Find user in database by ID
  User.findById(userId)
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get Ethereum balance from Alchemy API
      axios.get(`https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}?module=account&action=balance&address=${user.ethereumAddress}&tag=latest`)
        .then(response => {
          // Update user's Ethereum balance in database
          const balance = parseInt(response.data.result) / 10 ** 18;
          user.ethereumBalance = balance;
          user.save();
          
          res.status(200).json({ balance: balance });
        })
        .catch(err => {
          res.status(500).json({ error: err });
        });
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
};
