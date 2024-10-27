const TelegramBot = require('node-telegram-bot-api');

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const botToken = '7583674462:AAGuQrn38ZUcxsV7p4QrDjOHaTG5rTFt_Co';
const bot = new TelegramBot(botToken, { polling: true });
const axios = require('axios');
const https = require('https')
class Crypto {
  constructor(apiKey, secretKey) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.chainMap = {
      ethereum: '1',
      optimism: '10',
      cronos: '25',
      bsc: '56',
      okc: '66',
      gnosis: '100',
      heco: '128',
      polygon: '137',
      fantom: '250',
      kcc: '321',
      zksync: '324',
      ethw: '10001',
      fon: '201022',
      arbitrum: '42161',
      avalanche: '43114',
      linea: '59140',
      harmony: '1666600000',
      tron: 'tron'
    };
  }

  async ping() {
    try {
      await axios.get('https://data.binance.com/api/v3/ping');
      return true;
    } catch (error) {
      return false;
    }
  }

  async getPrice(...names) {
    const prices = {};
    if (names.length === 0) {
      return prices;
    }
    const symbols = `["${names.join('","')}"]`;
    const url = `https://data.binance.com/api/v3/ticker/price?symbols=${symbols}`;
    try {
      const response = await axios.get(url);
      const priceList = response.data;
      for (const item of priceList) {
        prices[item.symbol] = item.price;
      }
    } catch (error) {
      console.error('Error getting prices:', error);
    }
    return prices;
  }

  async getFuturesPrice(name) {
    if (!name) {
      return '';
    }
    const url = `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${name}`;
    try {
      const response = await axios.get(url);
      return response.data.price;
    } catch (error) {
      console.error('Error getting futures price:', error);
      return '';
    }
  }

  async getUFutureKline(interval, limit, symbol) {
    const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const result = [];
    try {
      const response = await axios.get(url);
      const klines = response.data;
      for (const kline of klines) {
        const end = parseFloat(kline[4]);
        const start = parseFloat(kline[1]);
        result.push(end - start >= 0 ? 1 : -1);
      }
    } catch (error) {
      console.error('Error getting  UFuture kline:', error);
    }
    return result;
  }

  async getMemePrice(address) {
    // const formattedChain = chain.toLowerCase() === 'eth' ? 'ethereum' : chain.toLowerCase();
    const url = `https://api.dexscreener.com/latest/dex/search/?q=${address}`;
    try {
      console.log(url)
      const response = await axios.get(url);
      const meme = response.data;
      return meme
    } catch (error) {
      console.error('Error getting meme price:', error);
    }
    return null;
  }

  async getMemeCheck(query, chain) {
    const formattedChain = chain.toLowerCase() === 'eth' ? 'ethereum' : chain.toLowerCase();
    const chainId = this.chainMap[formattedChain];
    const url = `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${query}`;
    try {
      const response = await axios.get(url);
      const memeCheckers = response.data.memeCheckers;
      for (const memeChecker of memeCheckers) {
        let lockedLp = 0.0;
        for (const lpHolder of memeChecker.lpHolders) {
          if (lpHolder.isLocked === 1) {
            lockedLp += parseFloat(lpHolder.percent);
          }
        }
        memeChecker.lpLockedTotal = lockedLp;
        return memeChecker;
      }
    } catch (error) {
      console.error('Error getting meme check:', error);
    }
    return null;
  }

  async honeypotCheck(address) {
    const url = `https://api.honeypot.is/v2/IsHoneypot?address=${address}`;
    try {
      const response = await axios.get(url);
      console.log('API response:', response.data);
      const tokenName = response.data.token.name;
      const isHoneypot = response.data.honeypotResult.isHoneypot;
      const result = isHoneypot ? `${tokenName} - HONEYPOT DETECTED!!! RUN THE FUCK AWAY!` : `${tokenName} - DOES NOT SEEM LIKE A HONEYPOT`;
      return result;
    } catch (error) {
      console.error('Error checking honeypot:', error);
      return 'Do your own research';
    }
  }
  

  async whetherHoneypot(address) {
    const url = `https://api.honeypot.is/v2/IsHoneypot?address=${address}`;
    try {
      const response = await axios.get(url);
      const honeypot = response.data.honeypotResult.isHoneypot;
      return honeypot;
    } catch (error) {
      console.error('Error checking honeypot:', error);
      return false;
    }
  }
}

// Example usage
const crypto = new Crypto('your-api-key', 'your-secret-key');


// Replace 'YOUR_API_KEY' with your actual API key
const apiKey = '5U9P2CYXAKXVZX6Q9MA17PICY1RW2QIU1N';

// Sample API object with placeholder functions


const api = {
  async getTokenPrice(address) {
    const url = `https://api.dexscreener.com/latest/dex/search/?q=${address}`;
    
    try {
      const response = await axios.get(url);
      const data = response.data;
      
      // // Debug output to inspect the API response
      // console.log('API Response:', data);
      
      // Assuming the response contains an array of pairs
      if (data && Array.isArray(data.pairs) && data.pairs.length > 0) {
        const pairs = data.pairs;
        const priceusd = pairs[0].priceUsd
        console.log('price:', priceusd )
        return priceusd
      } else {
        throw new Error('No data or invalid response');
      }
    } catch (error) {
      console.error('Error fetching price:', error.message);
      throw error;
    }
  },

  getTokenDecimals: (tokenSymbol) => {
    // Implement logic to fetch token decimals based on token symbol
    // Return the token decimals
  }
};

// Sample Task object
const Task = {};

// Sample Probed object
const Probed = {};

function analyzeAddrTokenProfit(walletAddress, contractAddress) {
  return new Promise((resolve, reject) => {
    const url = `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${walletAddress}&tag=latest&apikey=${apiKey}`;
  
    https.get(url, async (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', async () => {
        const balanceResponse = JSON.parse(data);
        if (balanceResponse.status === '1') {
          const balance = parseFloat(balanceResponse.result) / Math.pow(10, 18); // Adjust for token decimals
          const price = await api.getTokenPrice(contractAddress); // Fetch token price
          const profit = (balance * price).toFixed(6);
          console.log('Total profit for wallet', walletAddress, 'and contract', contractAddress, ':', profit);
          resolve(profit);
        } else {
          console.log(balanceResponse);
          console.log('Failed to retrieve token balance.');
          reject(new Error('Failed to retrieve token balance.'));
        }
      });
    }).on('error', (err) => {
      console.error('Error:', err.message);
      reject(err);
    });
  });
}


function smartAddrFinder(walletAddress, minProfit, minHolding) {
  const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      const txListResponse = JSON.parse(data);
      if (txListResponse.status === '1') {
        const transactions = txListResponse.result;
        const tokenMap = {};

        for (let i = 0; i < transactions.length; i++) {
          const tx = transactions[i];
          const tokenSymbol = tx.tokenSymbol;
          const tokenValue = parseFloat(tx.value) / Math.pow(10, api.getTokenDecimals(tokenSymbol));
          const tokenPrice = api.getTokenPrice(tokenSymbol);
          const profit = tokenValue * tokenPrice;

          if (profit >= minProfit) {
            if (!tokenMap[tokenSymbol]) {
              tokenMap[tokenSymbol] = {
                addresses: [],
                totalProfit: 0,
              };
            }
            tokenMap[tokenSymbol].addresses.push(walletAddress);
            tokenMap[tokenSymbol].totalProfit += profit;
          }
        }

        for (let symbol in tokenMap) {
          const tokenData = tokenMap[symbol];
          if (tokenData.addresses.length >= minHolding) {
            console.log('Smart addresses for token', symbol);
            console.log('Total Profit:', tokenData.totalProfit);
            console.log('Addresses:', tokenData.addresses);
          }
        }
      } else {
        console.log('Failed to retrieve transaction list.');
      }
    });
  }).on('error', (err) => {
    console.error('Error:', err.message);
  });
}

function listWalletTracking() {
  const trackedAddresses = Object.keys(Task);
  console.log('Currently tracked addresses:');
  trackedAddresses.forEach((address) => {
    console.log(address);
  });
}

function listSmartAddrProbe() {
  const probedAddresses = Object.keys(Probed);
  console.log('Currently probed addresses:');
  probedAddresses.forEach((address) => {
    console.log(address);
  });
}

function walletTxAnalyze(walletAddress, numTransactions) {
  const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
      
    });
    res.on('end', () => {
      const txListResponse = JSON.parse(data);
      if (txListResponse.status === '1') {
        const transactions = txListResponse.result.slice(0, numTransactions);
        console.log('Transaction analysis for wallet', walletAddress);
        transactions.forEach((tx) => {
          const tokenSymbol = tx.tokenSymbol;
          // const tokenValue = parseFloat(tx.value) / Math.pow(10, api.getTokenDecimals(tokenSymbol));
          const tokenPrice = api.getTokenPrice(tokenSymbol);
          // const profit = tokenValue * tokenPrice;
          console.log('Transaction:', tx.hash);
          console.log('Token Symbol:', tokenSymbol);
          // console.log('Token Value:', tokenValue);
          // console.log('Profit:', profit);
          console.log('-------------------');
        });
      } else {
        console.log('Failed to retrieve transaction list.');
      }
    });
  }).on('error', (err) => {
    console.error('Error:', err.message);
  });
}

// const walletAddress = '0xEa23abDb7896141a56AA122e3dcF21C0085c954f';
// const contractAddress = '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE';

// analyzeAddrTokenProfit(walletAddress, contractAddress);
// walletTxAnalyze(walletAddress, 30)




bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const menu = {
    reply_markup:{
      keyboard: [
        ['/price', '/honeypot'],
        ['/memecheck']
      ],
      one_time_keyboard:true
    }
  }
  bot.sendMessage(chatId, `Hello, welcome to Numbers AI!` , menu);
});

bot.onText(/\/price/, (msg) => {
    const chatId = msg.chat.id;
    crypto.getPrice('BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ARBUSDT')
      .then((prices) => {
        console.log('Prices:', prices);
        const priceArray = Object.entries(prices).map(([symbol, price]) => ({ symbol, price }));
        const response = priceArray.map((price) => `📊${price.symbol}: ${parseFloat(price.price).toFixed(2)}`);
        bot.sendMessage(chatId, response.join('\n'));
      })
      .catch((error) => {
        console.log('Error:', error);
        bot.sendMessage(chatId, 'Error: Unable to fetch prices.');
      });
  });
  

  bot.onText(/\/honeypot/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Please send the contract address');
  
    const messageListener = (msg) => {
      if (msg.text) {
        const address = msg.text.trim();
        crypto.honeypotCheck(address)
          .then((result) => {
            console.log('Honeypot check:', result);
            bot.sendMessage(chatId, result);
            // Remove the message listener after executing once
            bot.removeListener('message', messageListener);
          })
          .catch((error) => {
            console.log('Error:', error);
            bot.sendMessage(chatId, 'Error: Unable to perform honeypot check.');
            // Remove the message listener after executing once
            bot.removeListener('message', messageListener);
          });
      }
    };
  
    // Add the message listener
    bot.on('message', messageListener);
  });
  
  
  bot.onText(/\/memecheck/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Please send the contract address');

  const messageListener = (msg) => {
    if (msg.text) {
      const address = msg.text.trim();
      crypto.getMemePrice(address)
        .then((result) => {
          console.log('Meme check:', result);
          const formattedResult = formatMemeCheckResult(result);
          bot.sendMessage(chatId, formattedResult);
          // Remove the message listener after executing once
          bot.removeListener('message', messageListener);
        })
        .catch((error) => {
          console.log('Error:', error);
          bot.sendMessage(chatId, 'Error: Unable to perform meme check.');
          // Remove the message listener after executing once
          bot.removeListener('message', messageListener);
        });
    }
  };

  // Add the message listener
  bot.on('message', messageListener);
});

function formatMemeCheckResult(result) {
  const emojiCheckMark = '✅';
  const emojiCrossMark = '❌';
  const emojiClock = '⏰';

  // Check if the result has valid pair information
  if (result.pairs && result.pairs.length > 0) {
    const pair = result.pairs[0];
    // Format the result with emojis
    let formattedResult = '';
    formattedResult += `${emojiCheckMark} Chain: ${pair.chainId}\n`;
    formattedResult += `${emojiCheckMark} DEX: ${pair.dexId}\n`;
    formattedResult += `${emojiCheckMark} Pair Address: ${pair.pairAddress}\n`;
    formattedResult += `${emojiCheckMark} Base Token: ${pair.baseToken.name} (${pair.baseToken.symbol})\n`;
    formattedResult += `${emojiCheckMark} Quote Token: ${pair.quoteToken.name} (${pair.quoteToken.symbol})\n`;
    formattedResult += `${emojiCheckMark} Price (Native): ${pair.priceNative}\n`;
    formattedResult += `${emojiCheckMark} Price (USD): ${pair.priceUsd}\n`;
    formattedResult += `${emojiCheckMark} Liquidity (USD): $${pair.liquidity.usd}\n`;
    formattedResult += `${emojiClock} Price Change:\n`;
    formattedResult += `${emojiClock} 5 min: ${pair.priceChange.m5}%\n`;
    formattedResult += `${emojiClock} 1 hour: ${pair.priceChange.h1}%\n`;
    formattedResult += `${emojiClock} 6 hours: ${pair.priceChange.h6}%\n`;
    formattedResult += `${emojiClock} 24 hours: ${pair.priceChange.h24}%\n`;
    formattedResult += `${emojiCheckMark} Volume (24 hours): ${pair.volume.h24}\n`;
    formattedResult += `${emojiCheckMark} Buys (24 hours): ${pair.txns.h24.buys}\n`;
    formattedResult += `${emojiCheckMark} Sells (24 hours): ${pair.txns.h24.sells}\n`;

    return formattedResult;
  } else {
    return 'Error: Invalid meme check result.';
  }
}


bot.onText(/\/analyze/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Please provide the wallet address and contract address in the following format:\n/wallet <wallet_address> <contract_address>');

  const messageListener = (msg) => {
    if (msg.text) {
      const input = msg.text.trim();
      const inputArr = input.split(' ');

      // Check if the input has the correct format
      if (inputArr.length !== 3 || inputArr[0] !== '/wallet') {
        bot.sendMessage(chatId, '⚠️ Invalid command. Please provide the wallet address and contract address in the correct format:\n/wallet <wallet_address> <contract_address>');
        return;
      }

      const walletAddress = inputArr[1];
      const contractAddress = inputArr[2];

      // Call the analyzeAddrTokenProfit function
      analyzeAddrTokenProfit(walletAddress, contractAddress)
        .then((profit) => {
          const formattedProfit = parseFloat(profit).toFixed(6);
          bot.sendMessage(chatId, `💰 Total profit for wallet ${walletAddress}: ${formattedProfit}USD`);
        })
        .catch((error) => {
          bot.sendMessage(chatId, `❌ Error: ${error.message}`);
        });

      // Remove the message listener after executing once
      bot.removeListener('message', messageListener);
    }
  };

  // Add the message listener
  bot.on('message', messageListener);
});

