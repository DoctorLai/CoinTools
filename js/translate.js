'use strict';

// translation a text
const translate_text = (dom, lang, text) => {
    let s = lang[text];
    if (s) {
        dom.html(s);
    }
}

// translation a placeholder text
const translate_placeholder_text = (dom, lang, text) => {
    let s = lang[text];
    if (s) {
        dom.attr("placeholder", s);
    }
}

// translation language
const translation = (lang) => {
    translate_text($('a#text_general'), lang, 'general');
    translate_text($('a#text_rank'), lang, 'rank');
    translate_text($('a#text_setting'), lang, 'setting');
    translate_text($('a#text_log'), lang, 'log');
    translate_text($('a#text_news'), lang, 'text_news');
    translate_text($('h4#text_news'), lang, 'text_news');
    translate_text($('h4#text_global_stats'), lang, 'global_stats');   
    translate_text($('h4#text_local_currency'), lang, 'local_currency');
    translate_text($('h4#text_ui_language'), lang, 'ui_language');
    translate_text($('button#setting_save_btn'), lang, 'save');
	translate_text($('h4#text_cryptocurrency_ranking_table'), lang, 'text_cryptocurrency_ranking_table');
	translate_text($('span#proudly_brought_to_you_by'), lang, 'proudly_brought_to_you_by');
	translate_text($('h4#text_convert'), lang, 'convert');
	translate_text($('a#text_chart'), lang, 'chart');
    translate_text($('a#text_pairs'), lang, 'text_pairs');
    translate_text($('h4#text_pairs'), lang, 'text_pairs');
	translate_text($('h4#text_total_market_cap_usd'), lang, 'total_market_cap_usd');
    translate_text($('h4#text_total_market_cap_usd_24'), lang, 'total_market_cap_24_usd');
    translate_text($('option#text_select_a_currency'), lang, 'text_select_a_currency');
    translate_text($('a#text_tool'), lang, 'text_tool');
    translate_text($('a#text_history'), lang, 'history');
    translate_text($('h4#text_currency_convertor'), lang, 'text_currency_convertor');
    translate_text($('h4#text_history_data'), lang, 'text_history_data');
    translate_text($('button#btn_convert'), lang, 'convert');
    translate_text($('button#btn_history'), lang, 'query');
    translate_text($('button#btn_pairs_history'), lang, 'query');
    translate_text($('button#btn_clear'), lang, 'clear');
    translate_text($('button#btn_clear2'), lang, 'clear');
    translate_text($('button#btn_pairs_clear2'), lang, 'clear');    
    translate_text($('option#source_type'), lang, 'source_type');
    translate_text($('option#target_type'), lang, 'target_type');
    translate_text($('option#source_type_crypto'), lang, 'source_type_crypto');
    translate_text($('option#target_type_crypto'), lang, 'target_type_crypto');    
    translate_placeholder_text($('input#amount'), lang, 'amount');
}

// get ui lang data
const get_lang = () => {
    let lang = $('select#lang').val();
    switch (lang) {
        case 'zh-cn': return (translation_simplified_chinese); 
        case 'en-us': return (translation_english); 
        case 'zh-hk': return (translation_traditional_chinese); 
        case 'pt-br': return (translation_portuguese);
        case 'nl-nl': return (translation_dutch);
        case 'tr-tr': return (translation_turkish);
        case 'es-sp': return (translation_spanish);
        case 'it-it': return (translation_italian);
        case 'bn-bd': return (translation_bengali);
        case 'ru-ru': return (translation_russian);
        case 'ar-ar': return (translation_arabic);
        case 'pl-pl': return (translation_polish);
        case 'de-de': return (translation_german);
        case 'ro-ro': return (translation_romanian);
        case 'fl-ph': return (translation_filipino);
    }	
}

// ui translate
const ui_translate = () => {
	let data = get_lang();
	translation(data);
}

// translate
const get_text = (x, default_text = '') => {
	let lang = get_lang();
	if (lang && lang[x]) {
		return lang[x];
	}
	return default_text;
}