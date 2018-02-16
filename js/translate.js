'use strict';

// translation a text
const translate_text = (dom, lang, text) => {
    let s = lang[text];
    if (s) {
        dom.html(s);
    }
}

// translation language
const translation = (lang) => {
    translate_text($('a#text_general'), lang, 'general');
    translate_text($('a#text_rank'), lang, 'rank');
    translate_text($('a#text_setting'), lang, 'setting');
    translate_text($('a#text_log'), lang, 'log');
    translate_text($('h4#text_global_stats'), lang, 'global_stats');   
    translate_text($('h4#text_local_currency'), lang, 'local_currency');
    translate_text($('h4#text_ui_language'), lang, 'ui_language');
    translate_text($('button#setting_save_btn'), lang, 'save');
	translate_text($('h4#text_cryptocurrency_ranking_table'), lang, 'text_cryptocurrency_ranking_table');
	translate_text($('span#proudly_brought_to_you_by'), lang, 'proudly_brought_to_you_by');
	translate_text($('h4#text_convert'), lang, 'convert');
	translate_text($('a#text_chart'), lang, 'chart');
	translate_text($('h4#text_total_market_cap_usd'), lang, 'total_market_cap_usd');
    translate_text($('h4#text_total_market_cap_usd_24'), lang, 'total_market_cap_24_usd');
    translate_text($('option#text_select_a_currency'), lang, 'text_select_a_currency');
}

// get ui lang data
const get_lang = () => {
    let lang = $('select#lang').val();
    switch (lang) {
        case 'zh-cn': return (translation_simplified_chinese); 
        case 'en-us': return (translation_english); 
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