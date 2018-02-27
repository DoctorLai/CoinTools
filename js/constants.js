'use strict';

let currency_array = [
    "AUD", "BRL", "CAD", "CHF", "CLP", "CNY", "CZK", "DKK", "EUR", "GBP", "HKD", "HUF", "IDR", "ILS", "INR", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PKR", "PLN", "RUB", "SEK", "SGD", "THB", "TRY", "TWD", "ZAR", "USD"
];

// check if x is fiat
const isFiat = (x, arr) => {
	arr = arr || currency_array;
	return arr.includes(x.toUpperCase());
}