const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const  createToken  = require('../utils/utils');
const Web3 = require('web3');


  // User signup function
exports.signup = (req, res) => {
    const { name, email, password,ethereumAddress } = req.body;
    
    // Hash password using bcrypt
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return res.status(500).json({ error: err });
      } else {
        // Create new Ethereum account
        const web3 = new Web3();
        const newAccount = web3.eth.accounts.create();
        const ethereumAddress = newAccount.address;
  
        // Create new user object with hashed password and Ethereum address
        const user = new User({
          name,
          email,
          password: hash,
          ethereumBalance: 0, // Initialize balance to 0
          ethereumAddress: ethereumAddress // Set Ethereum address to new account address
        });
  
        console.log(ethereumAddress)
      // Save user object to database
      user.save()
        .then(result => {
          // Generate JWT token with user ID
          const token = createToken(user);
          res.status(201).json({ message: 'User created', token: token });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
          });
      }
    });
  };
  
  // User login function
  exports.login = (req, res) => {
    const { email, password } = req.body;
  
    // Check if user with email exists in database
    User.findOne({ email: email })
      .then(user => {
        if (!user) {
          return res.status(401).json({ message: 'Authentication failed' });
        }
  
        // Compare input password with hashed password
        bcrypt.compare(password, user.password, (err, result) => {
          if (err || !result) {
            return res.status(401).json({ message: 'Authentication failed' });
          }
  
          // Generate JWT token with user ID
          const token = createToken(user._id);
          res.status(200).json({ message: 'Authentication successful', token: token });
        });
      })
      .catch(err => {
        res.status(500).json({ error: err });
      });
  };
         
