exports.fetchBNBtoUSDT = async (bnbAmount) => {
  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT");
    const data = await res.json();
    const bnbPrice = parseFloat(data.price); // BNB price in USDT

    if (bnbPrice > 0) {
      const convertedUSDT = bnbAmount * bnbPrice; // No toFixed used
      return convertedUSDT;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching BNB price:", error);
    return 0;
  }
};

exports.fetchUSDTtoBNB = async (usdtAmount) => {
  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT");
    const data = await res.json();
    const bnbPrice = parseFloat(data.price); // BNB price in USDT

    if (bnbPrice > 0) {
      const convertedBNB = usdtAmount / bnbPrice; // No toFixed used
      return convertedBNB;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching BNB price:", error);
    return 0;
  }
};

exports.convertUSDTToTokens = (usdtAmount) => {
  const tokenPerUSDT = 10;
  return usdtAmount * tokenPerUSDT;
};

exports.convertTokensToUSDT = (tokenAmount) => {
  const usdtPerToken = 1 / 10; // 0.1
  return tokenAmount * usdtPerToken;
};
