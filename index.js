const TelegramBot = require('node-telegram-bot-api');

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const botToken = '6387844458:AAHaBXg5gVbZec0ZCrpe83aHNNAH_oGlU84';
const bot = new TelegramBot(botToken, { polling: true });
const axios = require('axios');

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

// // Call the functions and handle the responses
// crypto.ping().then((result) => {
//   console.log('Ping result:', result);
// });

// crypto.getPrice('BTCUSDT', 'ETHUSDT').then((prices) => {
//   console.log('Prices:', prices);
// });

// crypto.getFuturesPrice('BTCUSDT').then((price) => {
//   console.log('Futures price:', price);
// });

// crypto.getUFutureKline('15m', 3, 'BTCUSDT').then((kline) => {
//   console.log('UFuture kline:', kline);
// });

// crypto.getMemePrice('query', 'eth').then((pair) => {
//   console.log('Meme price:', pair);
// });

// crypto.getMemeCheck('query', 'eth').then((memeChecker) => {
//   console.log('Meme check:', memeChecker);
// });

// crypto.honeypotCheck('address').then((result) => {
//   console.log('Honeypot check:', result);
// });



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