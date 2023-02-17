const axios = require('axios');
const User = require('../models/user');

// Get KRON token balance function
exports.getKronBalance = (req, res) => {
  const userId = req.userData.userId;

  // Find user in database by ID
  User.findById(userId)
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get KRON token balance from Ethereum address
      axios.get(`https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${process.env.KRON_CONTRACT_ADDRESS}&address=${user.ethereumAddress}&tag=latest&apikey=${process.env.INFURA_API_KEY}`)
        .then(response => {
          // Update user's Ethereum balance in database
          const balance = response.data.result / 10 ** 18;
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