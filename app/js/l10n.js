/*Copyright 2015 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
   limitations under the License. */

/*global
PageManager, Utils, Overview, Characters, Stories, Adaptations, Briefings, Timeline, SocialNetwork, FileUtils
 */

"use strict";

(function(exports, Dictionaries){

    var state = {};
    
    state.initialized = false;
    state.l10nDelegates = [];
    state.dictionaries = {};
    state.lang = defaultLang;
    
    var init = function(){
        if(state.initialized){
            return;
        }
//        console.log(navigator.language);
        
        for(var name in Dictionaries){
            state.dictionaries[name] = processDictionary(Dictionaries[name]);
        }
        
    //    var lang = (navigator.languages ? navigator.languages[0] : navigator.browserLanguage).split('-')[0];
    //    var lang = 'ru';
//        var lang = defaultLang;
//        console.log(lang);
        
        if(state.dictionaries[defaultLang]){
            state.dict = state.dictionaries[defaultLang];
        } else {
            state.dict = state.dictionaries['en'];
        }
        setHtmlLang(defaultLang)
        state.initialized = true;
    };
    
    var processDictionary = function(dictionary){
        var processedDictionary = {};
        for(var sectionName in dictionary){
            for(var name in dictionary[sectionName]){
                processedDictionary[sectionName+"-"+name] = dictionary[sectionName][name];
            }
        } 
        return processedDictionary;
    };
    
    var setHtmlLang = (lang) => setAttr(document.getElementsByTagName("html")[0],'lang', lang);
    
    exports.toggleL10n = function(){
        if(state.lang === "ru"){
            state.dict = state.dictionaries['en'];
            state.lang = "en";
        } else {
            state.dict = state.dictionaries['ru'];
            state.lang = "ru";
        }
        setHtmlLang(state.lang);
        exports.localizeStatic();
        state.l10nDelegates.forEach(function(delegate){
            delegate();
        });
        PageManager.currentView.refresh();
    };
    
    exports.getLang = () => state.lang.toLowerCase();
    
    exports.getValue = function(name){
        var value = state.dict[name];
        return value ? value : name + ":RA RA-AH-AH-AH ROMA ROMA-MA GAGA OH LA-LA";
    };
    
    exports.onL10nChange = function(delegate){
        state.l10nDelegates.push(delegate);
    };
    
    exports.localizeStatic = function(){
        init();
        nl2array(document.querySelectorAll("[l10n-id]")).map(el => addEl(clearEl(el), makeText(exports.getValue(getAttr(el,"l10n-id")))));
        nl2array(document.querySelectorAll("[l10n-placeholder-id]")).map(el => setAttr(el,"placeholder", exports.getValue(getAttr(el,"l10n-placeholder-id"))));
    };

})(this['L10n']={}, Dictionaries);