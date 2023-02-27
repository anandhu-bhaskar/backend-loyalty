const Web3 = require('web3');

const TrothTokenABI = require(process.env.TROTH_TOKEN_CONTRACT_ABI); // Import the TrothToken contract's ABI file
const web3 = new Web3(process.env.RPC_URL); // Connect to your Ethereum node
const trothTokenAddress = process.env.TROTH_CONTRACT_ADDRESS; // Get the address of the deployed TrothToken contract from an environment variable
const trothTokenContract = new web3.eth.Contract(TrothTokenABI.abi, trothTokenAddress);// Create an instance of the TrothToken contract using its ABI and address


exports.trothTokenController = {
  // Define the controller methods
  totalSupply: async (req, res) => {
    try {
      const totalSupply = await trothTokenContract.methods.totalSupply().call();
      // Call the totalSupply() function of the TrothToken contract
      res.status(200).json({ totalSupply });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  },
  name: async (req, res) => {
    try {
      const name = await trothTokenContract.methods.name().call();
      // Call the name() function of the TrothToken contract
      res.status(200).json({ name });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  },
  symbol: async (req, res) => {
    try {
      const symbol = await trothTokenContract.methods.symbol().call();
      // Call the symbol() function of the TrothToken contract
      res.status(200).json({ symbol });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  },
  decimals: async (req, res) => {
    try {
      const decimals = await trothTokenContract.methods.decimals().call();
      // Call the decimals() function of the TrothToken contract
      res.status(200).json({ decimals });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  },
  balanceOf: async (req, res) => {
    const { account } = req.body;
    try {
      const balance = await trothTokenContract.methods.balanceOf(account).call();
      // Call the balanceOf() function of the TrothToken contract with the account parameter
      res.status(200).json({ balance });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  },
  mint: async (req, res) => {
    const { to, amount } = req.body;
    try {
      const bigAmount = web3.utils.toBN(amount); // Convert amount to a BigNumber
  
      // Estimate the gas consumption of the mint() function
      const gasEstimate = await trothTokenContract.methods.mint(to, bigAmount).estimateGas({ from: "0x7edAdF760C4f6e9f492aa9fbC36Fa11499931A0B" });
      
      // Set the gasLimit value to the estimated gas consumption + a buffer value
      const gasLimit = gasEstimate + 100000;
  
      // Send the transaction with the adjusted gasLimit value
      const tx = {
        from: "0x7edAdF760C4f6e9f492aa9fbC36Fa11499931A0B",
        to: trothTokenContract.options.address,
        gasLimit: web3.utils.toHex(gasLimit),
        gasPrice: web3.utils.toHex(await web3.eth.getGasPrice()),
        data: trothTokenContract.methods.mint(to, bigAmount).encodeABI()
      };
      const signedTx = await web3.eth.accounts.signTransaction(tx, process.env.META_ACC_PRIV_KEY);
      const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  
      res.status(200).json({ result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  },
  setOwner: async (req, res) => {
    const { owner } = req.body;
    try {
    const result = await trothTokenContract.methods.setOwner(owner).send({ from: web3.eth.defaultAccount });
    res.status(200).json({ result });
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
    }
    },
    
    pause: async (req, res) => {
    try {
    const result = await trothTokenContract.methods.pause().send({ from: web3.eth.defaultAccount });
    res.status(200).json({ result });
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
    }
    },
    
    unpause: async (req, res) => {
    try {
    const result = await trothTokenContract.methods.unpause().send({ from: web3.eth.defaultAccount });
    res.status(200).json({ result });
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
    }
    },
    
    transfer: async (req, res) => {
      const { to, amount, fromAddress,privateKey } = req.body;
      try {
        const transferAmount = web3.utils.toBN(amount); // Convert amount to a BigNumber


        
        const transferData = trothTokenContract.methods.transfer(to, transferAmount).encodeABI();

        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = 230000.; // standard gas limit for token transfers

        const nonce = await web3.eth.getTransactionCount(fromAddress);

        const signedTx = await web3.eth.accounts.signTransaction({
            to: trothTokenContract.options.address,
            data: transferData,
            gasPrice: gasPrice,
            gasLimit: gasLimit,
            nonce: nonce,
        }, privateKey);
        const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        // console.log('Transaction hash:', txHash);
        res.status(200).json({ txHash });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    },
    
    
    transferFrom: async (req, res) => {
    const { from, to, amount } = req.body;
    try {
    const result = await trothTokenContract.methods.transferFrom(from, to, amount).send({ from: web3.eth.defaultAccount });
    res.status(200).json({ result });
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
    }
    },
    
    burn: async (req, res) => {
    const { amount } = req.body;
    try {
    const result = await trothTokenContract.methods.burn(amount).send({ from: web3.eth.defaultAccount });
    res.status(200).json({ result });
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
    }
    },
    
    burnFrom: async (req, res) => {
    const { account, amount } = req.body;
    try {
    const result = await trothTokenContract.methods.burnFrom(account, amount).send({ from: web3.eth.defaultAccount });
    res.status(200).json({ result });
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
    }
    },
    
    airdrop: async (req, res) => {
    const { recipients, amounts } = req.body;
    try {
      const result = await trothTokenContract.methods.airdrop(recipients, amounts).send({ from: web3.eth.defaultAccount });
      res.status(200).json({ result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};