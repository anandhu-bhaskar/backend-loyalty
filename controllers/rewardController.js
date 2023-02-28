const fs = require('fs');
const User = require('../models/user');
const Web3 = require('web3');
 // Connect to your Ethereum node
const web3 = new Web3(process.env.RPC_URL);
const BigNumber = require('bignumber.js');
const TrothTokenABI = require(process.env.TROTH_TOKEN_CONTRACT_ABI); // Import the TrothToken contract's ABI file
const trothTokenAddress = process.env.TROTH_CONTRACT_ADDRESS; // Get the address of the deployed TrothToken contract from an environment variable
const trothTokenContract = new web3.eth.Contract(TrothTokenABI.abi, trothTokenAddress);

// Claim reward function
exports.claimReward = async (req, res) => {
    const user = await User.findById(req.userData.userId);
    const actualAmount = 10;
    const { to, amount } = {to:user.ethereumAddress,amount:actualAmount*10**18}
    console.log(to,amount)
    try {
      const bigAmount = web3.utils.toBN(amount); // Convert amount to a BigNumber
      console.log("Big Amount : ",bigAmount);
      const tokenDecimals = await trothTokenContract.methods.decimals().call(); 
      // Estimate the gas consumption of the mint() function
      const gasEstimate = await trothTokenContract.methods.mint(to, bigAmount).estimateGas({ from: "0x7edAdF760C4f6e9f492aa9fbC36Fa11499931A0B" });
      // in the above LOC we are making use of the owner's account to pay for gas as owner is the only one who can mint tokens 
      // Set the gasLimit value to the estimated gas consumption + a buffer value
      const gasLimit = gasEstimate + 100000;
  
      // Send the transaction with the adjusted gasLimit value
      const tx = {
        from: process.env.FROM_ADDRESS,
        to: trothTokenContract.options.address,
        gasLimit: web3.utils.toHex(gasLimit),
        gasPrice: web3.utils.toHex(await web3.eth.getGasPrice()),
        data: trothTokenContract.methods.mint(to, bigAmount).encodeABI()
      };
      const signedTx = await web3.eth.accounts.signTransaction(tx, process.env.META_ACC_PRIV_KEY);
      const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      if(result){
        const balance = await trothTokenContract.methods.balanceOf(to).call();
        const actualBalance = balance / 10 ** tokenDecimals; // Divide by decimal factor to convert to human-readable value
        console.log("Big Balance:",actualBalance);
        console.log("Actual Balance:",actualBalance);
        user.ethereumBalance = actualBalance;
        await user.save();
      }
      res.status(200).json({ result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  };

























// async (req, res) => {
//   try {
//     const user = await User.findById(req.userData.userId);
//     // console.log(user);

//     const alchemyWeb3 = createAlchemyWeb3(process.env.ALCHEMY_ENDPOINT);
//     const contractAddress = process.env.KRON_CONTRACT_ADDRESS; // Change this
//     const privateKey = process.env.META_ACC_PRIV_KEY;
//     const fromAddress = process.env.META_ACC;
//     console.log(fromAddress)
//     const contract = new alchemyWeb3.eth.Contract(trothTokenABI, contractAddress);
//     const tokenDecimals = await contract.methods.decimals().call(); // Get the token's decimals
//     console.log(tokenDecimals)
//     var amount = 5 * 10 ** tokenDecimals; // Multiply the desired transfer amount by the token's decimal factor 
//     const data = contract.methods.transfer(user.ethereumAddress, amount).encodeABI();
//     const nonce = await alchemyWeb3.eth.getTransactionCount(fromAddress);
//     const gasPrice = await alchemyWeb3.eth.getGasPrice();
//     const gasLimit = 300000;
//     const tx = {
//       from: fromAddress,
//       to: contractAddress,
//       data: data,
//       nonce: nonce,
//       gasPrice: gasPrice,
//       gasLimit: gasLimit
//     };
//     const signedTx = await alchemyWeb3.eth.accounts.signTransaction(tx, privateKey);
//     const txHash = await alchemyWeb3.eth.sendSignedTransaction(signedTx.rawTransaction);
//     // 500000000000002500000
//     // Update user document with latest balance
//     const KRONcontract = new alchemyWeb3.eth.Contract(kronTokenABI, contractAddress);
//     const balance = await KRONcontract.methods.balanceOf(user.ethereumAddress).call();
//     const actualBalance = balance / 10 ** tokenDecimals;
//     console.log(actualBalance);
//     user.ethereumBalance = actualBalance;
//     await user.save();

//     res.status(200).json({ message: 'Reward claimed successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
