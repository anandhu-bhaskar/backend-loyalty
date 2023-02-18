const fs = require('fs');
const User = require('../models/user');
const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
const contractJson = fs.readFileSync('./contract/kronTokenABI.json');
const kronTokenABI = JSON.parse(contractJson);
const BigNumber = require('bignumber.js');


// Claim reward function
exports.claimReward = async (req, res) => {
  try {
    const user = await User.findById(req.userData.userId);
    // console.log(user);
    if (!user.jBonusClaimed) {
      const alchemyWeb3 = createAlchemyWeb3(process.env.ALCHEMY_ENDPOINT);
      const contractAddress = process.env.KRON_CONTRACT_ADDRESS; // Change this
      const privateKey = process.env.META_ACC_PRIV_KEY;
      const fromAddress = process.env.META_ACC;
      const contract = new alchemyWeb3.eth.Contract(kronTokenABI, contractAddress);
      const tokenDecimals = await contract.methods.decimals().call(); // Get the token's decimals
      const amount = new BigNumber(5).times(new BigNumber(10).pow(tokenDecimals)); // Multiply the desired transfer amount by the token's decimal factor 
      console.log("amount: " + amount +"type: " + typeof(amount)); //
      const data = contract.methods.transfer(user.ethereumAddress, amount).encodeABI();
      const nonce = await alchemyWeb3.eth.getTransactionCount(fromAddress);
      const gasPrice = await alchemyWeb3.eth.getGasPrice();
      const gasLimit = 300000;
      const tx = {
        from: fromAddress,
        to: contractAddress,
        data: data,
        nonce: nonce,
        gasPrice: gasPrice,
        gasLimit: gasLimit
      };
      const signedTx = await alchemyWeb3.eth.accounts.signTransaction(tx, privateKey);
      const txHash = await alchemyWeb3.eth.sendSignedTransaction(signedTx.rawTransaction);
      // Update user document with latest balance
      const KRONcontract = new alchemyWeb3.eth.Contract(kronTokenABI, contractAddress);
      const balance = await KRONcontract.methods.balanceOf(user.ethereumAddress).call();
      const actualBalance = new BigNumber(balance).div(new BigNumber(10).pow(tokenDecimals)).toNumber();
      user.ethereumBalance = actualBalance;
      user.jBonusClaimed = true;
      console.log(user);
      await user.save();
      res.status(200).json({ message: 'Reward claimed successfully' });
    } else {
      res.status(200).json({ message: 'Already claimed' });
    }    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
