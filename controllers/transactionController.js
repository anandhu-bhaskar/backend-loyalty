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
        filter: { $or: [{ from: account }, { to: account }] },
        fromBlock: 0,
        toBlock: 'latest',
      });

      // Map the transaction data to a more readable format
      const transactions = await Promise.all(
        events.map(async (event) => {
          const { transactionHash, returnValues, blockNumber } = event;
          const { from, to, value } = returnValues;
          const transactionType =
            from.toLowerCase() === account.toLowerCase() ? 'sent' : 'received';
          const amountInTroth = value / Math.pow(10, 18);
          const amountInUSD = amountInTroth * 0.014; // Convert troth amount to USD
          const formattedAmountInUSD = parseFloat(amountInUSD).toFixed(7); // Convert to a string with 2 decimal places
          const block = await web3.eth.getBlock(blockNumber);
          const timestamp = block.timestamp;
          console.log('Timestamp:', timestamp);
          return {
            hash: transactionHash,
            from: from,
            to: to,
            amount: amountInTroth.toFixed(3), // Convert to a string with 2 decimal places
            usdValue: formattedAmountInUSD, // Add USD value to the response
            type: transactionType,
            timestamp: timestamp,
          };
        })
      );

      const latestTransactions = transactions
        .slice(-MAX_TRANSACTIONS)
        .reverse(); // Get the latest MAX_TRANSACTIONS transactions and reverse the order

      res.json({ message: 'Success', data: latestTransactions });
    }
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.SERVICE_UNAVAILABLE)
      .json({ message: 'Something went wrong', error });
  }
};
