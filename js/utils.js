"use strict";

var Utils = {};

Utils.addView = function (rootObject, name, view, displayName, navigationId, contentAreaId, mainPage) {
    "use strict";
    view.init();
    var buttonClass = "navigation-button";
    rootObject.views[name] = view;
    var navigation = document.getElementById(navigationId);
    var button = document.createElement("div");
    button.className = buttonClass;
    button.appendChild(document.createTextNode(displayName));
    navigation.appendChild(button);
    

    var contentArea, elems, i;
    var onClickDelegate = function (view) {
        return function (evt) {
            elems = navigation.getElementsByClassName(buttonClass);
            for (i = 0; i < elems.length; i++) {
                removeClass(elems[i], "active");
            }
            addClass(evt.target, "active");
            
            contentArea = document.getElementById(contentAreaId);
            Utils.removeChildren(contentArea);
            contentArea.appendChild(view.content);
            rootObject.currentView = view;
            view.refresh();
        };
    };

    button.addEventListener("click", onClickDelegate(view));
    if (mainPage) {
        addClass(button, "active");
        var contentArea = document.getElementById(contentAreaId);
        contentArea.appendChild(view.content);
        rootObject.currentView = view;
        // view.refresh();
    }
};

Utils.globStringToRegex = function (str) {
    "use strict";
    return new RegExp(Utils.preg_quote(str).replace(/\\\*/g, '.*').replace(
            /\\\?/g, '.'), 'g');
};
Utils.preg_quote = function (str, delimiter) {
    "use strict";
    // http://kevin.vanzonneveld.net
    // + original by: booeyOH
    // + improved by: Ates Goral (http://magnetiq.com)
    // + improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // + bugfixed by: Onno Marsman
    // + improved by: Brett Zamir (http://brett-zamir.me)
    // * example 1: preg_quote("$40");
    // * returns 1: '\$40'
    // * example 2: preg_quote("*RRRING* Hello?");
    // * returns 2: '\*RRRING\* Hello\?'
    // * example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
    // * returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'
    return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\'
            + (delimiter || '') + '-]', 'g'), '\\$&');
};

String.prototype.endsWith = function (suffix) {
    "use strict";
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function (from, to) {
    "use strict";
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

if (document.getElementsByClassName) {

    var getElementsByClass = function (classList, node) {
        return (node || document).getElementsByClassName(classList);
    };

} else {

    var getElementsByClass = function (classList, node) {
        var node = node || document, list = node.getElementsByTagName('*'), length = list.length, classArray = classList
                .split(/\s+/), classes = classArray.length, result = [], i, j
        for (i = 0; i < length; i++) {
            for (j = 0; j < classes; j++) {
                if (list[i].className.search('\\b' + classArray[j] + '\\b') !== -1) {
                    result.push(list[i]);
                    break;
                }
            }
        }

        return result;
    };
};

Utils.charOrdA = function (a, b) {
    "use strict";
    a = a.toLowerCase();
    b = b.toLowerCase();
    if (a > b)
        return 1;
    if (a < b)
        return -1;
    return 0;
};

function eventsByTime (a, b) {
    "use strict";
    a = new Date(a.time);
    b = new Date(b.time);
    if (a > b)
        return 1;
    if (a < b)
        return -1;
    return 0;
};

Utils.alert = function (message) {
    "use strict";
    window.alert(message);
};

Utils.confirm = function (message) {
    "use strict";
    return window.confirm(message);
};

Utils.removeChildren = function (myNode) {
    "use strict";
    if (!myNode) {
        return;
    }
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
};

function isEmpty (obj) {
    "use strict";
    return (Object.getOwnPropertyNames(obj).length === 0);
};

Utils.clone = function (o) {
    "use strict";
    if (!o || 'object' !== typeof o) {
        return o;
    }
    var c = 'function' === typeof o.pop ? [] : {};
    var p, v;
    for (p in o) {
        if (o.hasOwnProperty(p)) {
            v = o[p];
            if (v && 'object' === typeof v) {
                c[p] = Utils.clone(v);
            } else {
                c[p] = v;
            }
        }
    }
    return c;
};

//Utils.makeTextAreaAutoResizable = function(textarea){
////    textarea.autoresize="true";
//    addClass(textarea, "autoresizable");
////    textarea.setAttribute('autoresize', 'autoresize');
//    textarea.addEventListener('input', textAreaAutoresize, false);
//    textAreaAutoresize.call(textarea);
//};
//
//function textAreaAutoresize() {
//    this.style.height = 'auto';
//    this.style.height = this.scrollHeight+'px';
//    this.scrollTop = this.scrollHeight;
////    window.scrollTo(window.scrollLeft,(this.scrollTop+this.scrollHeight));
//  }

function addClass(o, c){
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g")
    if (re.test(o.className)) return;
    o.className = (o.className + " " + c).replace(/\s+/g, " ").replace(/(^ | $)/g, "")
};

function toggleClass(o, c){
    if(hasClass(o, c)){
        removeClass(o, c);
    } else {
        addClass(o, c);
    }
};

function hasClass(o, c){
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g")
    return (re.test(o.className));
};
 
function removeClass(o, c){
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g")
    o.className = o.className.replace(re, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "")
};
