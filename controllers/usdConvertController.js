const User = require('../models/user');

exports.convertTrothToUSD = async (req, res) => {
  // Get the user's TrothToken balance
  const userId = req.userData.userId;
  const user = await User.findById(userId);
  const trothBalance = user.ethereumBalance;

  // Calculate the USD balance
  const usdBalance = trothBalance * 0.013; // Assuming 1 INR = 0.013 USD

  return res.json({ usdBalance: usdBalance.toFixed(3) });
};

// ************************************************************************************************
// remove this during cleanup
// ************************************************************************************************
