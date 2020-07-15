'use strict';

chrome.contextMenus.removeAll();

const handy_crypto_urls = {
	"LocalBitcoins": "https://localbitcoins.com/?ch=rndf",
	"Coinmarketcap": "https://coinmarketcap.com",
	"Coingecko": "https://coingecko.com",
	"Cryptocompare": "https://www.cryptocompare.com",
	"Bittrex": "https://bittrex.com",
	"Blocktrades": "https://blocktrades.us",
	"Coinbase": "https://www.coinbase.com/join/59f21412b8770300d98bd9a5",
	"Gdax": "https://www.gdax.com"
};

// create parent context menu item
const parent = chrome.contextMenus.create({
	title: "CoinTools (Alt + Q)",
	contexts: ["page", "frame"]
});

// switch to click and sub menus
const keys = Object.keys(handy_crypto_urls);
const sz = keys.length;
for (let i = 0; i < sz; ++ i) {
	let cur_domain = handy_crypto_urls[keys[i]];
	chrome.contextMenus.create({
		title: keys[i], 
		parentId: parent, 
		onclick: (info, tab) => {
			chrome.tabs.update(info.tab, {"url": cur_domain});
		}	
	});	
}
