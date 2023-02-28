const User = require('../models/user');
const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
const BigNumber = require('bignumber.js');
const trothTokenABI = require('../contract/TrothToken.json');

// Get Ethereum balance function
exports.getTrothBalance = async (req, res) => {
  const userId = req.userData.userId;
  // Find user in database by ID
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Get KRON token balance from Ethereum address
  const alchemyWeb3 = createAlchemyWeb3(process.env.ALCHEMY_ENDPOINT);
  const contractAddress = process.env.TROTH_CONTRACT_ADDRESS; // Change this
  const contract = new alchemyWeb3.eth.Contract(trothTokenABI.abi, contractAddress);
  const tokenDecimals = await contract.methods.decimals().call(); // Get the token's decimals
  const balance = await contract.methods.balanceOf(user.ethereumAddress).call(); // Get the balance of the user's Ethereum address

  // Update user's Ethereum balance in database
  const actualBalance = new BigNumber(balance).div(new BigNumber(10).pow(tokenDecimals)).toNumber();
  user.ethereumBalance = actualBalance;
  await user.save();

  return res.json({ balance: actualBalance });
};
