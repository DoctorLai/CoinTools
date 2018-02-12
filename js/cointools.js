'use strict';

// save settings
const saveSettings = () => {
    let settings = {};
    settings['currency'] = $('select#currency').val();
    chrome.storage.sync.set({ 
        cointools: settings
    }, function() {
        alert('Settings Saved (Required: Reload Extension)');
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
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let s = '';
            s += '<table id="ranking" class="sortable">';
            s += '<thead><tr>';
            s += '<th class=sorttable_sorted>Coin</th>';
            s += '<th>Price USD</th>';
            s += '<th>Price BTC</th>';
            s += '<th>Change 1 Hours</th>';
            s += '<th>Change 24 Hours</th>';
            s += '<th>Change 7 Days</th>';
            s += '<th>Last Updated</th>';
            s += '</tr></thead><tbody>';            
            for (let i = 0; i < result.length; i ++) {
                s += '<tr>';
                s += '<td>' + result[i]['name'] + ' (' + result[i]['symbol'] + ')</td>';
                s += '<td>' + result[i]['price_usd'] + '</td>';
                s += '<td>' + result[i]['price_btc'] + '</td>';
                s += '<td>' + result[i]['percent_change_1h'] + '</td>';
                s += '<td>' + result[i]['percent_change_24h'] + '</td>';
                s += '<td>' + result[i]['percent_change_7d'] + '</td>';
                s += '<td>' + timestampToString(result[i]['last_updated']) + '</td>';
                s += '</tr>';
            }
            s += '</tbody>';
            s += '</table>';
            dom.html(s);
            sorttable.makeSortable(document.getElementById("ranking"));
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
            $("select#currency").val(currency);
            // general - api https://api.coinmarketcap.com/v1/global/
            getGeneralData(currency, $('div#general_div'));
            // ranking tables - api https://api.coinmarketcap.com/v1/ticker/?convert=EUR&limit=2000
            getRankingTable(currency, $('div#rank_div'));
        } else {
            // TODO: first time set default parameters
        }
    });
    // save settings when button 'save' is clicked
    $('button#setting_save_btn').click(function() {
        saveSettings();
    });
    // about
    let manifest = chrome.runtime.getManifest();    
    let app_name = manifest.name + " v" + manifest.version;
    // version number
    $('textarea#about').val('Application: ' + app_name + '\n' + 'Chrome Version: ' + getChromeVersion());
}, false);