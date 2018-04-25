'use strict';

chrome.contextMenus.removeAll();

let handy_crypto_urls = {
	"Coinmarketcap": "https://coinmarketcap.com/",
	"Cryptocompare": "https://www.cryptocompare.com/",
	"Bittrex": "https://bittrex.com",
	"Blocktrades": "https://blocktrades.us",
	"Coinbase": "https://www.coinbase.com/join/59f21412b8770300d98bd9a5"
};

// create parent context menu item
let parent = chrome.contextMenus.create({
	title: "CoinTools - Crypto URLs",
	contexts: ["all", "page", "frame"]
});

// switch to click and sub menus
let keys = Object.keys(handy_crypto_urls) ;
let sz = keys.length;
for (let i = 0; i < sz; ++ i) {
	let cur_domain = handy_crypto_urls[keys[i]];
	let child = chrome.contextMenus.create({
		title: keys[i], 
		parentId: parent, 
		onclick: (info, tab) => {
			let url = tab.url;
			chrome.tabs.update(info.tab, {"url": cur_domain});
		}	
	});	
}
