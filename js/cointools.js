'use strict';

// should be either fiat or cryptocurrency symbols like BTC or bitcoin
const isValidSymbol = (x) => {
    return isCoin(x) || isFiat(x);
}

// save settings
const saveSettings = (msgbox = true) => {
    let settings = {};
    settings['currency'] = $('select#currency').val();
    settings['lang'] = $('select#lang').val();
    settings['conversion'] = $('textarea#conversion').val();
    settings['amount'] = $('input#amount').val();
    settings['convert_from'] = $('input#convert_from').val();
    settings['convert_to'] = $('input#convert_to').val();
    settings['convert_from_history'] = $('input#convert_from_history').val();
    settings['convert_to_history'] = $('input#convert_to_history').val();
    settings['history_limit'] = $('input#history_limit').val();
    settings['pairs_id'] = $('input#pairs_id').val();
    chrome.storage.sync.set({ 
        cointools: settings
    }, function() {
        if (msgbox) {
            alert(get_text('alert_save'));
        }
    });
}

// get news and articles
const getFeed = (dom) => {
    let api = "https://min-api.cryptocompare.com/data/news/?lang=EN";
    logit(get_text("calling", "calling") + " " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let s = '<ol>';
            let len = result.length;
            for (let i = 0; i < len; ++ i) {
                s += "<li>";
                s += ": <a target=_blank href='" + result[i]['url'] + "'>"; 
                s += result[i]['title'];
                s += "<BR/><img style='height:100px' src='" + result[i]['imageurl'];
                s += "' /></a>";
                s += "<i>" + timestampToString(result[i]['published_on']) + "</i>";
                s += "<blockquote>";
                s += result[i]['body'];
                s += "</blockquote>";
                s += "</li>";
            }
            s += "</ol>";
            dom.html(s);
        },
        error: function(request, status, error) {
            logit(get_text('response', 'Response') + ': ' + request.responseText);
            logit(get_text('error', 'Error') + ': ' + error );
            logit(get_text('status', 'Status') + ': ' + status);
        },
        complete: function(data) {
            logit(get_text("api_finished", "API Finished") + ": " + api);
        }             
    }); 
}

// general data from coinmarkcap
const getGeneralData = (currency, dom) => {
    let currency_upper = currency.toUpperCase();
    let currency_lower = currency.toLowerCase();
    let api = "https://api.coinmarketcap.com/v1/global/";
    if (currency != '') {
        api += "?convert=" + currency_upper;
    }
    logit(get_text("calling", "calling") + " " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let s = '';
            s += '<table>';
            s += '<tr>';
            s += '<td>' + get_text("total_market_cap_usd", "Total Market Cap USD") + '</td>';
            s += '<td>' + result['total_market_cap_usd'] + '</td>';
            s += '</tr>';
            s += '<tr>';
            s += '<td>' + get_text("total_market_cap_24_usd", 'Total 24 Hour Volumn USD') + '</td>';
            s += '<td>' + result['total_24h_volume_usd'] + '</td>';
            s += '</tr>';
            s += '<tr>';
            s += '<td>' + get_text('bitcoin_percentage', 'Bitcoin Percentage of Market Cap') + '</td>';
            s += '<td>' + result['bitcoin_percentage_of_market_cap'] + '%</td>';
            s += '</tr>';
            s += '<tr>';
            s += '<td>' + get_text('active_currencies', 'Active Currencies') + '</td>';
            s += '<td>' + result['active_currencies'] + '</td>';
            s += '</tr>';
            s += '<tr>';
            s += '<td>' + get_text('active_assets', 'Active Assets') + '</td>';
            s += '<td>' + result['active_assets'] + '</td>';
            s += '</tr>';
            s += '<tr>';
            s += '<td>' + get_text('active_markets', 'Active Markets') + '</td>';
            s += '<td>' + result['active_markets'] + '</td>';
            s += '</tr>';
            s += '<tr>';
            let key1 = "total_market_cap_" + currency_lower;
            if (key1 in result) {
                s += '<tr>';
                s += '<td>' + get_text('total_market_cap', 'Total Market Cap') +' ' + currency_upper + '</td>';
                s += '<td>' + result[key1] + '</td>';
                s += '</tr>';
                s += '<tr>';
            }
            let key2 = "total_24h_volume_" + currency_lower;
            if (key2 in result) {
                s += '<tr>';
                s += '<td>' + get_text('total_24_hour_volumn', 'Total 24 Hour Volumn') + ' ' + currency_upper + '</td>';
                s += '<td>' + result[key2] + '</td>';
                s += '</tr>';
                s += '<tr>';
            }
            s += '<td>' + get_text('last_updated', 'Last Updated') + '</td>';
            s += '<td>' + timestampToString(result['last_updated']) + '</td>';
            s += '</tr>';            
            s += '</table>';
            dom.html(s);
        },
        error: function(request, status, error) {
            logit(get_text('response', 'Response') + ': ' + request.responseText);
            logit(get_text('error', 'Error') + ': ' + error );
            logit(get_text('status', 'Status') + ': ' + status);
        },
        complete: function(data) {
            logit(get_text("api_finished", "API Finished") + ": " + api);
        }             
    }); 
}

// get ranking table from coinmarketcap
const getRankingTable = (currency, dom, keyword = "", limit = 200) => {
    let currency_upper = currency.toUpperCase();
    let currency_lower = currency.toLowerCase();
    keyword = keyword.trim().toLowerCase();
    if (keyword.length > 0) {
        // search a coin
        limit = 99999; 
    }
    let api = "https://api.coinmarketcap.com/v1/ticker/?limit=" + limit;
    if (currency != '') {
        api += "&convert=" + currency_upper;
    }
    logit(get_text("calling", "calling") + " " + api);
    dom.html('<img src="images/loading.gif" />');
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let s = '';
            s += '<table id="ranking" class="sortable">';
            s += '<thead><tr>';
            s += '<th>' + get_text('coin', 'Coin') + '</th>';
            s += '<th>' + get_text('price_usd', 'Price USD') + '</th>';
            s += '<th>' + get_text('price_btc', 'Price BTC') + '</th>';
            s += '<th>' + get_text('change_1hr', 'Change 1 Hours') + '</th>';
            s += '<th>' + get_text('change_24hr', 'Change 24 Hours') + '</th>';
            s += '<th>' + get_text('change_7days', 'Change 7 Days') + '</th>';
            s += '<th>' + get_text('last_updated', 'Last Updated') + '</th>';
            s += '</tr></thead><tbody>';            
            for (let i = 0; i < result.length; i ++) {
                if (keyword.length > 0) {
                    let id = result[i]['id'].toLowerCase();
                    let name = result[i]['name'].toLowerCase();
                    let symbol = result[i]['symbol'].toLowerCase();
                    if (!(id.includes(keyword) || name.includes(keyword) || symbol.includes(keyword) )) {
                        continue;
                    }
                }
                s += '<tr>';
                s += '<td><button coin="' + result[i]['id'] + '" class="crypto">' + result[i]['name'] + ' (' + result[i]['symbol'] + ')</button></td>';
                s += '<td>' + result[i]['price_usd'] + '</td>';
                s += '<td>' + result[i]['price_btc'] + '</td>';
                s += '<td>' + up_or_down_img(result[i]['percent_change_1h']) + '</td>';
                s += '<td>' + up_or_down_img(result[i]['percent_change_24h']) + '</td>';
                s += '<td>' + up_or_down_img(result[i]['percent_change_7d']) + '</td>';
                s += '<td>' + timestampToString(result[i]['last_updated']) + '</td>';
                s += '</tr>';
            }
            s += '</tbody>';
            s += '</table>';
            dom.html(s);
            // coins in ranking table
            $('button.crypto').click(function() {                
                let coin = $(this).attr("coin");
                let currency = $('select#currency').val();
                let api = 'https://api.coinmarketcap.com/v1/ticker/' + coin.toLowerCase() + '/';
                if (currency != '') {
                    api += '?convert=' + currency;
                }                
                fetch(api, {mode: 'cors'}).then(validateResponse).then(readResponseAsJSON).then(function(result) {
                    result = result[0];
                    alert(getCoinReport(result, currency));
                }).catch(function(error) {
                    logit(get_text("request_failed", "Request failed") + ': ' + api + ": " + error);                    
                });                                 
            });            
            sorttable.makeSortable(document.getElementById("ranking"));
            // chart
            let data = [];
            let total = 0;
            // 24 hour vol
            let total_24 = 0;
            let data_24 = [];
            for (let i = 0; i < Math.min(15, result.length); i ++) {
                data.push({'coin': result[i]['name'], 'market_cap_usd': result[i]['market_cap_usd']});
                data_24.push({'coin': result[i]['name'], '24h_volume_usd': result[i]['24h_volume_usd']});
                total += parseInt(result[i]['market_cap_usd']);
                total_24 += parseInt(result[i]['24h_volume_usd']);
            }
            api = "https://api.coinmarketcap.com/v1/global/";
            $.ajax({
                type: "GET",
                url: api,
                success: function(result) {       
                    let total_usd = parseInt(result.total_market_cap_usd);
                    let others = total_usd - total;
                    let total_usd_24 = parseInt(result.total_24h_volume_usd);
                    let others_24 = total_usd_24 - total_24;                    
                    data.push({'coin': 'Others', 'market_cap_usd': others});
                    data_24.push({'coin': 'Others', '24h_volume_usd': others_24});
                    let chart = AmCharts.makeChart( "chart_div", {
                        "type": "pie",
                        "theme": "light",
                        "dataProvider": data,
                        "startDuration": 0,
                        "valueField": "market_cap_usd",
                        "titleField": "coin",
                        "balloon":{
                          "fixedPosition": true
                        },
                        "export": {
                          "enabled": false
                        }
                    });   
                    let chart_24 = AmCharts.makeChart( "chart_24_div", {
                        "type": "pie",
                        "theme": "light",
                        "dataProvider": data_24,
                        "startDuration": 0,
                        "valueField": "24h_volume_usd",
                        "titleField": "coin",
                        "balloon":{
                          "fixedPosition": true
                        },
                        "export": {
                          "enabled": false
                        }
                    });                                       
                },
                error: function(request, status, error) {
                    logit(get_text('response', 'Response') + ': ' + request.responseText);
                    logit(get_text('error', 'Error') + ': ' + error );
                    logit(get_text('status', 'Status') + ': ' + status);
                    dom.html("");
                },
                complete: function(data) {
                    logit(get_text("api_finished", "API Finished") + ": " + api);
                }   
            });                               
        },
        error: function(request, status, error) {
            logit(get_text('response', 'Response') + ': ' + request.responseText);
            logit(get_text('error', 'Error') + ': ' + error );
            logit(get_text('status', 'Status') + ': ' + status);
            dom.html("");
        },
        complete: function(data) {
            logit(get_text("api_finished", "API Finished") + ": " + api);
        }             
    }); 
}

// ajax calling API to return the price of USD for coin
const getPriceOfUSD = (coin) => {
    return new Promise((resolve, reject) => {
        let api = "https://api.coinmarketcap.com/v1/ticker/" + coin + '/';
        fetch(api, {mode: 'cors'}).then(validateResponse).then(readResponseAsJSON).then(function(result) {
            resolve(result[0].price_usd);
        }).catch(function(error) {
            logit(get_text("request_failed", "Request failed") + ': ' + api + ": " + error);
            reject(error);
        });
    });
}

// ajax calling API to return the price of currency for 1 BTC
const getPriceOf1BTC = (currency) => {
    return new Promise((resolve, reject) => {
        let api = "https://api.coinmarketcap.com/v1/ticker/bitcoin/?convert=" + currency.toUpperCase();
        fetch(api, {mode: 'cors'}).then(validateResponse).then(readResponseAsJSON).then(function(result) {            
            resolve(result[0]['price_' + currency.toLowerCase()]);
        }).catch(function(error) {
            logit(get_text("request_failed", "Request failed") + ': ' + api + ": " + error);
            reject(error);
        });
    });
}

// ajax calling API to return the price of USD for coin
const getPriceOf = (coin, fiat) => {
    return new Promise((resolve, reject) => {
        let api = "https://api.coinmarketcap.com/v1/ticker/" + coin + '/?convert=' + fiat.toUpperCase();
        fetch(api, {mode: 'cors'}).then(validateResponse).then(readResponseAsJSON).then(function(result) {
            resolve(result[0]['price_' + fiat.toLowerCase()]);
        }).catch(function(error) {
            logit(get_text("request_failed", "Request failed") + ': ' + api + ": " + error);
            reject(error);
        });
    });
}

// ajax calling coinbase to return fiat conversion
const getPriceOf_Coinbase_Fiat = (a, b) => {
    return new Promise((resolve, reject) => {
        let api = 'https://api.coinbase.com/v2/exchange-rates/?currency=' + a.toUpperCase();
        fetch(api, {mode: 'cors'}).then(validateResponse).then(readResponseAsJSON).then(function(result) {
            let data = result.data.rates;
            resolve(data[b.toUpperCase()]);
        }).catch(function(error) {
            logit(get_text("request_failed", "Request failed") + ': ' + api + ": " + error);
            reject(error);
        });
    });
}

// ajax get conversion
const getConversion = async(coin1, coin2) => {
    coin1 = coin1.toUpperCase();
    coin2 = coin2.toUpperCase();
    if (coin1 in coinmarkcap) {
        coin1 = coinmarkcap[coin1];
    }
    if (coin2 in coinmarkcap) {
        coin2 = coinmarkcap[coin2];
    }
    // determine if input is coin or currency
    let is_coin1 = !currency_array.includes(coin1);
    let is_coin2 = !currency_array.includes(coin2);
    // both are coins
    if ((is_coin1) && (is_coin2)) {
        let api1 = getPriceOfUSD(coin1);
        let api2 = getPriceOfUSD(coin2);
        return await api1 / await api2;
    }
    // both are currencies e.g. USD to CNY
    if ((!is_coin1) && (!is_coin2)) {
        try {
            return await getPriceOf_Coinbase_Fiat(coin1, coin2);
        } catch (e) {
            let api1 = getPriceOf1BTC(coin1);        
            let api2 = getPriceOf1BTC(coin2);
            return await api2 / await api1;
        }
    }
    // converting coin1 to fiat coin2
    if (is_coin1) {
        return await getPriceOf(coin1, coin2);
    } else { // convert coin2 to fiat coin1
        return 1.0 / await getPriceOf(coin2, coin1);
    }
}

// get cryptocurrency report
const getCoinReport = (result, currency = '') => {
    let s = '---------------\n';
    s += get_text("rank", "Rank") + ": " + result['rank'] + "\n";
    s += get_text("id", "ID") + ": " + result['id'] + "\n";
    s += get_text("price_usd", "Price of USD") + ": " + result['price_usd'] + "\n";
    s += get_text("price_btc", "Price of BTC") + ": " + result['price_btc'] + "\n";
    s += get_text("total_market_cap_24_usd", "24 Hour Total Market Cap (USD)") + ": " + result['24h_volume_usd'] + "\n";
    s += get_text("total_market_cap_usd", "Total Market Cap (USD)") + ": " + result['market_cap_usd'] + "\n";
    s += get_text("available_supply", "Available Supply") + ": " + result['available_supply'] + "\n";
    s += get_text("total_supply", "Total Supply") + ": " + result['total_supply'] + "\n";
    s += get_text("max_supply", "Max Supply") + ": " + result['max_supply'] + "\n";
    s += get_text("change_1hr", "Percentage Change 1 Hour") + ": " + result['percent_change_1h'] + "\n";
    s += get_text("change_24hr", "Percentage Change 24 Hours") + ": " + result['percent_change_24h'] + "\n";
    s += get_text("change_7days", "Percentage Change 7 Days") + ": " + result['percent_change_7d'] + "\n";
    if (currency != '') {
        let cur = currency; 
        currency = currency.toLowerCase();
        s += get_text("price_cur", "Price of ") + " (" + cur + "): " + result['price_' + currency] + "\n";
        s += get_text("24h_volume_cur", "24 Hour Total Market Cap") + " (" + cur + "): " + result['24h_volume_' + currency] + "\n";
        s += get_text("market_cap_cur", "Total Market Cap") + " (" + cur + "): " + result['market_cap_' + currency] + "\n";
    }
    let dateobject = new Date(result['last_updated'] * 1000);
    let datestring = dateobject.toISOString();
    s += get_text("last_updated", "Last Updated") + ": " + datestring + "\n";
    return s;
}

// get fit report
const getFiatReport = (result, from = '', to = '') => {
    let s = '---------------\n';
    let data = result.data.rates;
    let cur = Object.keys(data);
    let curlen = cur.length;
    if (to == '') {
        for (let i = 0; i < curlen; i ++) {
            s += "1 " + from + " = " + data[cur[i]] + " " + cur[i] + "\n";
        }
    } else {
        s += "1 " + from + " = " + data[to] + " " + to + "\n";            
    }
    return s;
}

// conversion
const processConversion = (s, local_currency = '') => {
    local_currency = local_currency.toUpperCase();
    let arr = s.trim().split("\n");
    for (let i = 0; i < arr.length; i ++) {
        arr[i] = arr[i].trim();
        if (arr[i].length == 0) {
            continue
        }
        if ((arr[i][0] == ';') || (arr[i][0] == '#')) { // comments
            continue;
        }
        let pair = arr[i].split(" ");
        if (pair.length == 2) {
            let a = pair[0].trim().toUpperCase();
            let b = pair[1].trim().toUpperCase();
            if (isNumeric(a)) {
                if (isValidSymbol(b)) {
                    let dom = $('div#conversion_results');
                    let dom_id = "convert" + random_id();
                    dom.append('<div id="' + dom_id + '"> </div>');
                    getConversion(b, "BTC").then(x => {
                        $('div#' + dom_id).html("<h4>" + a + " " + b +  " = <span class=yellow>" + (x * a) + "</span> " + "BTC" + "</h4>");
                    });                    
                    if (local_currency != '') {
                        let dom = $('div#conversion_results');
                        let dom_id = "convert" + random_id();
                        dom.append('<div id="' + dom_id + '"> </div>');
                        getConversion(b, local_currency).then(x => {
                            $('div#' + dom_id).html("<h4>" + a + " " + b +  " = <span class=yellow>" + (x * a) + "</span> " + local_currency + "</h4>");
                        });                                            
                    }
                }
            }
            var pat = /^[a-zA-Z\-]+$/;
            if (pat.test(a) && pat.test(b) && isValidSymbol(a) && isValidSymbol(b)) {
                let dom = $('div#conversion_results');
                let dom_id = "convert" + random_id();
                dom.append('<div id="' + dom_id + '"> </div>');
                getConversion(a, b).then(x => {
                    $('div#' + dom_id).html("<h4>1 " + a + " = <span class=yellow>" + x + "</span> " + b + "</h4>");
                });
            }
        } else if (pair.length == 1) {
            let a = pair[0].trim().toUpperCase();
            let b = a;
            let currency = $('select#currency').val();
            var pat = /^[a-zA-Z\-]+$/;
            if (pat.test(a)) {
                if (a in coinmarkcap) {
                    a = coinmarkcap[a];                    
                }                             
                // if it is a fiat currency
                if (isFiat(a)) {
                    let api = 'https://api.coinbase.com/v2/exchange-rates/?currency=' + a.toUpperCase();
                    fetch(api, {mode: 'cors'}).then(validateResponse).then(readResponseAsJSON).then(function(result) {
                        $('textarea#convert_result').append(getFiatReport(result, a, currency));
                    }).catch(function(error) {
                        logit(get_text("request_failed", "Request failed") + ': ' + api + ": " + error);                    
                    }); 
                } else if (isCoin(a)) {
                    let api = 'https://api.coinmarketcap.com/v1/ticker/' + a.toLowerCase() + '/';
                    if (currency != '') {
                        api += '?convert=' + currency;
                    }                
                    fetch(api, {mode: 'cors'}).then(validateResponse).then(readResponseAsJSON).then(function(result) {
                        result = result[0];
                        $('textarea#convert_result').append(getCoinReport(result, currency));
                        let change_7d = result['percent_change_7d'];
                        let change_24h = result['percent_change_24h'];
                        let change_1h = result['percent_change_1h'];
                        let dom = $('div#conversion_results');
                        let change24h = up_or_down_img(change_24h, 'span', get_text("change_24hr", "24 hrs"));
                        let change1h = up_or_down_img(change_1h, 'span', get_text("change_1hr", "1 hr"));
                        let change7d = up_or_down_img(change_7d, 'span', get_text("change_7days", "7 days"));                        
                        dom.append("<h4>" + b + " " + change1h + " " + change24h + " " + change7d + "</h4>");
                    }).catch(function(error) {
                        logit(get_text("request_failed", "Request failed") + ': ' + api + ": " + error);                    
                    });     
                } else {
                    logit(get_text('unknown_symbol', "Unknown Symbol") + ": " + a);
                }         
            }
        } else if (pair.length == 3) {
            let a = pair[0].trim().toUpperCase();
            let b = pair[1].trim().toUpperCase();
            let c = pair[2].trim().toUpperCase();
            // e.g. 100 BTC SBD
            if (isNumeric(a) && isValidSymbol(b) && isValidSymbol(c)) {
                let dom = $('div#conversion_results');
                let dom_id = "convert" + random_id();
                dom.append('<div id="' + dom_id + '"> </div>');
                getConversion(b, c).then(x => {
                    $('div#' + dom_id).html("<h4>" + a + " " + b + " = <span class=yellow>" + (x * a) + "</span> " + c + "</h4>");
                });
            } else if (isNumeric(b) && isValidSymbol(a) && isValidSymbol(c)) {
                // e.g. BTC 100 SBD
                let dom = $('div#conversion_results');
                let dom_id = "convert" + random_id();
                dom.append('<div id="' + dom_id + '"> </div>');
                getConversion(a, c).then(x => {
                    $('div#' + dom_id).html("<h4>" + (b * 1.0 / x) + " " + a + " = <span class=yellow>" + (b) + "</span> " + c + "</h4>");
                });
            } else {
                logit(get_text('error', "Error") + ": " + a + ", " + b + ", " + c);
            }
        }
    }
}

// get history
const getHistory = (a, b, dom, dom2) => {
    a = a.toUpperCase().trim();
    b = b.toUpperCase().trim();
    // if not valid pairs are given, then quit
    if (!(isValidSymbol(a) && isValidSymbol(b))) {
        return;
    }
    let limit = $("input#history_limit").val();
    if (!isNumeric(limit)) {
        limit = 30;
    }
    limit = parseInt(limit);
    let api;
    if (limit <= 3) {
        api = "https://min-api.cryptocompare.com/data/histominute?fsym=" + a + "&tsym=" + b + "&limit=" + (limit * 24 * 60) + "&e=CCCAGG";
    } else if (limit <= 7) {
        api = "https://min-api.cryptocompare.com/data/histohour?fsym=" + a + "&tsym=" + b + "&limit=" + (limit * 24) + "&e=CCCAGG";
    } else {        
        api = "https://min-api.cryptocompare.com/data/histoday?fsym=" + a + "&tsym=" + b + "&limit=" + limit + "&e=CCCAGG";
    }
    logit(get_text("calling", "calling") + " " + api);
    dom.html('<img src="images/loading.gif" />');
    $.ajax({
        type: "GET",
        url: api,
        success: function(data) {
            if (data && data.Data && data.Response == 'Success') {
                let data_open = [];
                let data_close = [];
                let data_high = [];
                let data_low = [];
                let data_mid = [];
                let arr = data.Data;
                let datalen = arr.length;
                for (let i = 0; i < datalen; ++ i) {
                    let date = new Date(arr[i].time * 1000);
                    data_open.push({x: date, y: arr[i].open});
                    data_close.push({x: date, y: arr[i].close});
                    data_high.push({x: date, y: arr[i].high});
                    data_low.push({x: date, y: arr[i].low});
                    data_mid.push({x: date, y: (arr[i].high + arr[i].low) * 0.5});
                }
                let date = new Date();
                let chart_id = "chart_" + date.toISOString().replace('-', '').replace(':', '').replace('.', '');
                let chartdiv = dom2.prepend('<div id="' + chart_id + '" style="height: 450px; width: 750px;"></div>');
                let chart = new CanvasJS.Chart(chart_id, {
                    title:{
                        text: a + " => " + b
                    },
                    axisY:[{
                        title: b,
                        lineColor: "#C24642",
                        tickColor: "#C24642",
                        labelFontColor: "#C24642",
                        titleFontColor: "#C24642",
                        suffix: ""
                    }],
                    toolTip: {
                        shared: true
                    },
                    legend: {
                        cursor: "pointer",
                        itemclick: function(e) {
                            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                                e.dataSeries.visible = false;
                            } else {
                                e.dataSeries.visible = true;
                            }
                            e.chart.render();
                        }           
                    },
                    data: [{
                        type: "line",
                        name: "Open",
                        color: "#369EAD",
                        showInLegend: true,
                        visible: false,
                        axisYIndex: 0,
                        dataPoints: data_open
                    },
                    {
                        type: "line",
                        name: "Close",
                        color: "#C24642",
                        axisYIndex: 0,
                        visible: false,
                        showInLegend: true,
                        dataPoints: data_close
                    },
                    {
                        type: "line",
                        name: "Low",
                        color: "blue",
                        visible: false,
                        axisYIndex: 0,
                        showInLegend: true,
                        dataPoints: data_low
                    },                    
                    {
                        type: "line",
                        name: "High",
                        color: "#7F6084",
                        axisYIndex: 0,
                        visible: false,
                        showInLegend: true,
                        dataPoints: data_high
                    },                    
                    {
                        type: "line",
                        name: "Average",
                        color: "black",
                        axisYIndex: 0,
                        showInLegend: true,
                        dataPoints: data_mid
                    }]
                });
                chart.render();
            }
        },
        error: function(request, status, error) {
            logit(get_text('response', 'Response') + ': ' + request.responseText);
            logit(get_text('error', 'Error') + ': ' + error );
            logit(get_text('status', 'Status') + ': ' + status);            
        },
        complete: function(data) {
            logit(get_text("api_finished", "API Finished") + ": " + api);
            dom.html("");
        }             
    });     
}

// get top pairs
const getPairs = (a, dom, dom2) => {
    a = a.toUpperCase().trim();
    // if not valid pairs are given, then quit
    if (!isCoin(a)) {
        return;
    }
    let api = "https://min-api.cryptocompare.com/data/top/pairs?fsym=" + a + "&limit=100";
    logit(get_text("calling", "calling") + " " + api);
    dom.html('<img src="images/loading.gif" />');
    $.ajax({
        type: "GET",
        url: api,
        success: function(data) {
            if (data && data.Data && data.Response == 'Success') {
                let s = '';
                let date = new Date();
                let div_id = "pairs_div_" + date.toISOString().replace('-', '').replace(':', '').replace('.', '');
                s += '<table id="' + div_id + '" class="sortable">';
                s += '<thead><tr>';
                s += '<th>' + get_text('exchange_center', 'Exchange') + '</th>';
                s += '<th>' + get_text('cryptocurrency', 'Cryptocurrency') + '</th>';
                s += '<th>' + get_text('volume24h', 'Volume 24 Hrs') + '</th>';
                s += '<th>' + get_text('symbol', 'Symbol') + '</th>';
                s += '<th>' + get_text('volume24h', 'Volume 24 Hrs') + '</th>';
                s += '</tr></thead><tbody>';        
                let result = data.Data;    
                for (let i = 0; i < result.length; i ++) {
                    s += '<tr>';
                    s += '<td>' + result[i]['exchange'] + '</td>';
                    s += '<td>' + result[i]['fromSymbol'] + '</td>';
                    s += '<td>' + result[i]['volume24h'].toFixed(3) + '</td>';
                    s += '<td>' + result[i]['toSymbol'] + '</td>';
                    s += '<td>' + result[i]['volume24hTo'].toFixed(3) + '</td>';                                       
                    s += '</tr>';
                }
                s += '</tbody>';
                s += '</table><BR/>';      
                dom2.prepend(s);
                sorttable.makeSortable(document.getElementById(div_id));
            } 
        },
        error: function(request, status, error) {
            logit(get_text('response', 'Response') + ': ' + request.responseText);
            logit(get_text('error', 'Error') + ': ' + error );
            logit(get_text('status', 'Status') + ': ' + status);            
        },
        complete: function(data) {
            logit(get_text("api_finished", "API Finished") + ": " + api);
            dom.html("");
        }             
    });     
}

// on document ready
document.addEventListener('DOMContentLoaded', function() {
    // init tabs
    $(function() {
        $( "#tabs" ).tabs();
    });
    // Replace all multiline textarea's placeholder.
    let textAreas = document.getElementsByTagName('textarea');
    Array.prototype.forEach.call(textAreas, function(elem) {
        elem.placeholder = elem.placeholder.replace(/\\n/g, '\n');
    });    
    // populate currency symbols
    let currency_array_length = currency_array.length;
    for (let i = 0; i < currency_array_length; ++ i) {
        $('select#currency').append($("<option>").attr('value', currency_array[i]).text(currency_array[i]));
        $('datalist#convert_from_list').append($("<option>").attr('value', currency_array[i]).text(currency_array[i]));
        $('datalist#convert_to_list').append($("<option>").attr('value', currency_array[i]).text(currency_array[i]));
    }
    $('datalist#convert_from_list').append($("<option id='source_type_crypto'>").attr('value', '').text(get_text('source_type_crypto')));
    $('datalist#convert_to_list').append($("<option id='target_type_crypto'>").attr('value', '').text(get_text('target_type_crypto')));
    // populate coin symbols
    let coin_array = Object.keys(coinmarkcap);
    let coin_array_length = coin_array.length;
    for (let i = 0; i < coin_array_length; ++ i) {
        let coin_key = coin_array[i];
        let coin = coin_key;
        $('datalist#convert_from_list').append($("<option>").attr('value', coin).text(coin));
        $('datalist#convert_to_list').append($("<option>").attr('value', coin).text(coin));
    }
    // load steem id
    chrome.storage.sync.get('cointools', function(data) {
        if (data && data.cointools) {
            let settings = data.cointools;
            let currency = settings['currency'];
            let lang = settings['lang'];
            let conversion = settings['conversion'];
            $("select#currency").val(currency);
            $("select#lang").val(lang);
            $("textarea#conversion").val(conversion);
            $("input#amount").val(settings['amount']);
            $("input#convert_from").val(settings['convert_from']);
            $("input#convert_to").val(settings['convert_to']);
            $("input#convert_from_history").val(settings['convert_from_history']);
            $("input#convert_to_history").val(settings['convert_to_history']);
            $("input#pairs_id").val(settings['pairs_id']);
            if (settings['history_limit']) {
                $("input#history_limit").val(settings['history_limit']);
            } else {
                $("input#history_limit").val("30");
            }
            processConversion(conversion, currency);
            //general - api https://api.coinmarketcap.com/v1/global/
            getGeneralData(currency, $('div#general_div'));
            // ranking tables - api https://api.coinmarketcap.com/v1/ticker/?convert=EUR&limit=2000
            getRankingTable(currency, $('div#rank_div'));
        } else {
            // first time set default parameters
            // general - api https://api.coinmarketcap.com/v1/global/
            getGeneralData("", $('div#general_div'));
            // ranking tables - api https://api.coinmarketcap.com/v1/ticker/?convert=EUR&limit=2000
            getRankingTable("", $('div#rank_div'));            
            // default conversion
            processConversion($('textarea#conversion').val());
        }
        // about
        let manifest = chrome.runtime.getManifest();    
        let app_name = manifest.name + " v" + manifest.version;
        // version number
        $('textarea#about').val(get_text('application', 'Application') + ': ' + app_name + '\n' + get_text('chrome_version', 'Chrome Version') + ': ' + getChromeVersion());        
        // translate
        ui_translate();
    });
    // save settings when button 'save' is clicked
    $('button#setting_save_btn').click(function() {
        saveSettings();
        // translate
        ui_translate();        
    });
    // convert currency calculator
    $('button#btn_convert').click(function() {
        let amount = $('input#amount').val();
        let a = $('input#convert_from').val();
        let b = $('input#convert_to').val();
        if ((a != '') && (b != '')) {
            if (amount >= 0) {
                // this solves the equation of `x A = ? B`
                getConversion(a, b).then(x => {
                    $('textarea#convert_result').append(amount + " " + a.toUpperCase() + " = " + (x * amount) + " " + b.toUpperCase() + "\n");
                    let psconsole = $('textarea#convert_result');
                    if (psconsole.length) {
                        psconsole.scrollTop(psconsole[0].scrollHeight - psconsole.height());
                    }
                    saveSettings(false);
                });
            } else {
                // this solves the equation of `? A = x B`
                getConversion(a, b).then(x => {
                    amount = -amount;
                    let amount2 = amount * 1.0 / x;
                    $('textarea#convert_result').append(amount2 + " " + a.toUpperCase() + " = " + (amount) + " " + b.toUpperCase() + "\n");
                    let psconsole = $('textarea#convert_result');
                    if (psconsole.length) {
                        psconsole.scrollTop(psconsole[0].scrollHeight - psconsole.height());
                    }
                    saveSettings(false);
                });                
            }
        }
    });
    // clear console
    $('button#btn_clear').click(function() {
        $('textarea#convert_result').text('');
    });
    // clear history graph
    $('button#btn_clear2').click(function() {
        $('div#chartContainerDiv').html('');
    });    
    // history data
    $('button#btn_history').click(function() {
        saveSettings(false);        
        let a = $('input#convert_from_history').val();
        let b = $('input#convert_to_history').val();
        if ((a != '') && (b != '')) {
            getHistory(a, b, $('div#chartContainer'), $('div#chartContainerDiv'));            
        }        
    });
    // calling history of last settings
    setTimeout(function () {
        let a = $('input#convert_from_history').val();
        let b = $('input#convert_to_history').val();
        if ((a != '') && (b != '')) {
            getHistory(a, b, $('div#chartContainer'), $('div#chartContainerDiv'));            
        }        
    }, 100);
    // top pairs
    $('button#btn_pairs_history').click(function() {
        saveSettings(false);        
        let a = $('input#pairs_id').val();
        if (isCoin(a)) {
            getPairs(a, $('div#pairs_gif'), $('div#pairs_div'));            
        }        
    });
    // clear top pairs
    $('button#btn_pairs_clear2').click(function() {
        $('div#pairs_div').html('');
    });     
    // calling top pairs of last settings
    setTimeout(function () {
        let a = $('input#pairs_id').val();
        if (isCoin(a)) {
            getPairs(a, $('div#pairs_gif'), $('div#pairs_div'));
        }        
    }, 100);    
    // get news and articles
    getFeed($('div#news_div'));
    // search while you type
    $('input#ranking_search_id').on("keyup", function() {
        getRankingTable("", $('div#rank_div'), this.value);
    });
}, false);