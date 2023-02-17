const User = require('../models/user');
const createAlchemyWeb3 = require('@alch/alchemy-web3');
const kronTokenABI  = require('../contract/kronTokenABI');

// Claim reward function
exports.claimReward = async (req, res) => {
  try {
    const user = await User.findById(req.userData.userId);
    console.log(user)
    const web3 = createAlchemyWeb3(
      "https://eth-mainnet.alchemyapi.io/v2/q5TdqmV2NZ5jMLDnFoNpDfBZvHna_s3_",
    );
    // const web3 = AlchemyWeb3(new AlchemyWeb3.providers.HttpProvider(process.env.ALCHEMY_ENDPOINT));
    if(web3){
      console.log("********************")
    }
    const contractAddress = process.env.KRON_CONTRACT_ADDRESS; // Change this
    const privateKey = process.env.MNEMONIC;
    const fromAddress = process.env.POLYGON_ADDRESS;
    const contract = new web3.eth.Contract(kronTokenABI, contractAddress);
    const data = contract.methods.transfer(user.ethereumAddress, 5).encodeABI();
    const nonce = await web3.eth.getTransactionCount(fromAddress);
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 300000;
    const tx = {
      from: fromAddress,
      to: contractAddress,
      data: data,
      nonce: nonce,
      gasPrice: gasPrice,
      gasLimit: gasLimit
    };
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    // Update user document with latest balance
    const balance = await web3.eth.getBalance(user.ethereumAddress);
    user.ethereumBalance = balance;
    await user.save();

    res.status(200).json({ message: 'Reward claimed successfully' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
};
