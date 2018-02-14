'use strict';

// save settings
const saveSettings = () => {
    let settings = {};
    settings['currency'] = $('select#currency').val();
    settings['lang'] = $('select#lang').val();
    settings['conversion'] = $('textarea#conversion').val();
    chrome.storage.sync.set({ 
        cointools: settings
    }, function() {
        alert(get_text('alert_save'));
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
    logit("calling " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let s = '';
            s += '<table>';
            s += '<tr>';
            s += '<td>Total Market Cap USD</td>';
            s += '<td>' + result['total_market_cap_usd'] + '</td>';
            s += '</tr>';
            s += '<tr>';
            s += '<td>Total 24 Hour Volumn USD</td>';
            s += '<td>' + result['total_24h_volume_usd'] + '</td>';
            s += '</tr>';
            s += '<tr>';
            s += '<td>Bitcoin Percentage of Market Cap</td>';
            s += '<td>' + result['bitcoin_percentage_of_market_cap'] + '%</td>';
            s += '</tr>';
            s += '<tr>';
            s += '<td>Active Currencies</td>';
            s += '<td>' + result['active_currencies'] + '</td>';
            s += '</tr>';
            s += '<tr>';
            s += '<td>Active Assets</td>';
            s += '<td>' + result['active_assets'] + '</td>';
            s += '</tr>';
            s += '<tr>';
            s += '<td>Active Markets</td>';
            s += '<td>' + result['active_markets'] + '</td>';
            s += '</tr>';
            s += '<tr>';
            let key1 = "total_market_cap_" + currency_lower;
            if (key1 in result) {
                s += '<tr>';
                s += '<td>Total Market Cap ' + currency_upper + '</td>';
                s += '<td>' + result[key1] + '</td>';
                s += '</tr>';
                s += '<tr>';
            }
            let key2 = "total_24h_volume_" + currency_lower;
            if (key2 in result) {
                s += '<tr>';
                s += '<td>Total 24 Hour Volumn ' + currency_upper + '</td>';
                s += '<td>' + result[key2] + '</td>';
                s += '</tr>';
                s += '<tr>';
            }
            s += '<td>Last Updated</td>';
            s += '<td>' + timestampToString(result['last_updated']) + '</td>';
            s += '</tr>';            
            s += '</table>';
            dom.html(s);
        },
        error: function(request, status, error) {
            logit('Response: ' + request.responseText);
            logit('Error: ' + error );
            logit('Status: ' + status);
        },
        complete: function(data) {
            logit("API Finished: " + api);
        }             
    }); 
}

// get ranking table from coinmarketcap
const getRankingTable = (currency, dom, limit = 100) => {
    let currency_upper = currency.toUpperCase();
    let currency_lower = currency.toLowerCase();
    let api = "https://api.coinmarketcap.com/v1/ticker/?limit=" + limit;
    if (currency != '') {
        api += "&convert=" + currency_upper;
    }
    logit("calling " + api);
    dom.html('<img src="images/loading.gif" />');
    var up_or_down_img = function(x) {
        if (x >= 0) {
            return "📈" + x;
        } else {
            return "📉" + x;
        }
    }
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let s = '';
            s += '<table id="ranking" class="sortable">';
            s += '<thead><tr>';
            s += '<th class=sorttable_sorted>' + get_text('coin', 'Coin') + '</th>';
            s += '<th>' + get_text('price_usd', 'Price USD') + '</th>';
            s += '<th>' + get_text('price_btc', 'Price BTC') + '</th>';
            s += '<th>' + get_text('change_1hr', 'Change 1 Hours') + '</th>';
            s += '<th>' + get_text('change_24hr', 'Change 24 Hours') + '</th>';
            s += '<th>' + get_text('change_7days', 'Change 7 Days') + '</th>';
            s += '<th>' + get_text('last_updated', 'Last Updated') + '</th>';
            s += '</tr></thead><tbody>';            
            for (let i = 0; i < result.length; i ++) {
                s += '<tr>';
                s += '<td>' + result[i]['name'] + ' (' + result[i]['symbol'] + ')</td>';
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
            sorttable.makeSortable(document.getElementById("ranking"));
            // chart
            let data = [];
            let total = 0;
            for (let i = 0; i < Math.min(15, result.length); i ++) {
                data.push({'coin': result[i]['name'], 'market_cap_usd': result[i]['market_cap_usd']});
                total += parseInt(result[i]['market_cap_usd']);
            }
            api = "https://api.coinmarketcap.com/v1/global/";
            $.ajax({
                type: "GET",
                url: api,
                success: function(result) {       
                    let total_usd = parseInt(result.total_market_cap_usd);
                    let others = total_usd - total;
                    data.push({'coin': 'Others', 'market_cap_usd': others});
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
                },
                error: function(request, status, error) {
                    logit('Response: ' + request.responseText);
                    logit('Error: ' + error );
                    logit('Status: ' + status);
                },
                complete: function(data) {
                    logit("API Finished: " + api);
                }   
            });                               
        },
        error: function(request, status, error) {
            logit('Response: ' + request.responseText);
            logit('Error: ' + error );
            logit('Status: ' + status);
        },
        complete: function(data) {
            logit("API Finished: " + api);
        }             
    }); 
}

// ajax calling API
const getPriceOfUSD = (coin) => {
    return new Promise((resolve, reject) => {
        let api = "https://api.coinmarketcap.com/v1/ticker/" + coin + '/';
        fetch(api, {mode: 'cors'}).then(validateResponse).then(readResponseAsJSON).then(function(result) {
            resolve(result[0].price_usd);
        });        
    });
}

// ajax get conversion
const getConversion = async(coin1, coin2) => {
    let api1 = getPriceOfUSD(coin1);
    let api2 = getPriceOfUSD(coin2);
    return await api1 / await api2;
}

// conversion
const processConversion = (s) => {
    let arr = s.trim().split("\n");
    for (let i = 0; i < arr.length; i ++) {
        let pair = arr[i].split(" ");
        if (pair.length == 2) {
            let a = pair[0].trim().toLowerCase();
            let b = pair[1].trim().toLowerCase();
            var pat = /^[a-zA-Z\-]+$/;
            if (pat.test(a) && pat.test(b)) {
                let dom = $('div#conversion_results');
                let dom_id = "convert_" + a.replace("-", "") + "_" + b.replace("-", "");
                dom.append('<div id="' + dom_id + '"> </div>');
                getConversion(a, b).then(x => {
                    $('div#' + dom_id).html("<h4>1 " + a.toUpperCase() + " = <span class=yellow>" + x + "</span> " + b.toUpperCase() + "</h4>");
                });
            }
        }
    }
}

// on document ready
document.addEventListener('DOMContentLoaded', function() {
    // init tabs
    $(function() {
        $( "#tabs" ).tabs();
    });
    // populate currency symbols
    for (let i = 0; i < currency_array.length; i ++) {
        $('select#currency').append($("<option>").attr('value', currency_array[i]).text(currency_array[i]));
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
            processConversion(conversion);
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
        // translate
        ui_translate();
    });
    // save settings when button 'save' is clicked
    $('button#setting_save_btn').click(function() {
        saveSettings();
        // translate
        ui_translate();        
    });
    // about
    let manifest = chrome.runtime.getManifest();    
    let app_name = manifest.name + " v" + manifest.version;
    // version number
    $('textarea#about').val('Application: ' + app_name + '\n' + 'Chrome Version: ' + getChromeVersion());
}, false);