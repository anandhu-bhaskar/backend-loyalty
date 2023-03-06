const Web3 = require('web3');
const User = require('../models/user');
const httpStatusCodes = require('http-status-codes');
const https = require('https');

const StatusCodes = httpStatusCodes.StatusCodes;
const getReasonPhrase = httpStatusCodes.getReasonPhrase;

// Define constants
const RPC_ENDPOINT = process.env.RPC_URL; // replace this with your Alchemy endpoint URL
// const CONTRACT_ADDRESS = process.env.TROTH_CONTRACT_ADDRESS;
const MAX_TRANSACTIONS = 5;

// Define the transaction controller
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.userData.userId;
    // Find user in database by ID
    const user = await User.findById(userId);
    // console.log(user);
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'User not found',
        error: getReasonPhrase(StatusCodes.UNAUTHORIZED),
      });
    } else {
      // Define the JSON-RPC request payload
      const account = user.ethereumAddress;
      const CONTRACT_ADDRESS = process.env.TROTH_CONTRACT_ADDRESS;

      const web3 = new Web3(RPC_ENDPOINT);
      const contractAbi = require('../contract/TrothToken.json');
      const contract = new web3.eth.Contract(contractAbi.abi, CONTRACT_ADDRESS);

      // Get the user's transactions using the contract's Transfer event
      const events = await contract.getPastEvents('Transfer', {
        filter: { to: account },
        fromBlock: 0,
        toBlock: 'latest',
      });

      // Map the transaction data to a more readable format
      const transactions = events
        .map((event) => {
          const { transactionHash, returnValues } = event;
          const { from, to, value } = returnValues;
          return {
            hash: transactionHash,
            from: from,
            to: to,
            amount: value / Math.pow(10, 18),
          };
        })
        .slice(0, MAX_TRANSACTIONS);

      res.json({ message: 'Success', data: transactions });
    }
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.SERVICE_UNAVAILABLE)
      .json({ message: 'Something went wrong', error });
  }
};
