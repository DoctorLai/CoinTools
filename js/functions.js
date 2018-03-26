'use strict';

// convert unix time stamp to human-readable string
const timestampToString = (ts) => {
	let a = new Date(ts * 1000);
	let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	let year = a.getFullYear();
	let month = months[a.getMonth()];
	let date = a.getDate();
	let hour = a.getHours();
	let min = a.getMinutes();
	let sec = a.getSeconds();
	return date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
}

// button click when press enter in text
const textPressEnterButtonClick = (text, button) => {
    text.keydown(function(e) {
        if (e.keyCode == 13) {
            button.click();
        }
    });        
}

// get chrome version
const getChromeVersion = () => {
    var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return raw ? parseInt(raw[2], 10) : false;
}

// log in the textarea
const logit = (msg) => {
    let d = new Date();
    let n = d.toLocaleTimeString();
    let dom = $('textarea#about');
    let s = dom.val();
    dom.val(s + "\n" + n + ": " + msg);
}

// read as text
const readResponseAsText = (response) => {
    return response.text();
}

// read as json
const readResponseAsJSON = (response) => { 
    return response.json(); 
} 

// check if valid response
const validateResponse = (response) => { 
    if (!response.ok) { 
        throw Error(response.statusText); 
    } 
    return response; 
}

// remove invalid characters for HTML id
const removeInvalid = (x) => {
    return x.replace("-", "");
}

// timestamp to Date
const getDateString = (ts) => {
    return new Date(ts * 1000).toISOString().substring(0, 10);
}

// isnumeric
const isNumeric = (n) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

// get random identifier
const random_id = () => {
    let S4 = function() {
       return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return "_" + (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
}

const up_or_down_img = (x, elem = 'div', text = '') => {
    if (x > 0.5) {
        //return "📈" + x;
        return "<" + elem + " class='upupup'>+" + x + "%<sub class='sub'>" + text + "</sub></" + elem + ">";
    } else if (x < -0.5) {
        //return "📉" + x;
        return "<" + elem + " class='downdowndown'>" + x + "%<sub class='sub'>" + text + "</sub></" + elem + ">";
    } else {
        if (x >= 0) {
            return "<" + elem + " class='normal'>+" + x + "%<sub class='sub'>" + text + "</sub></" + elem + ">";
        }
        return "<" + elem + " class='normal'>" + x + "%<sub class='sub'>" + text + "</sub></" + elem + ">";
    }
}