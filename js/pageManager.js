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
PageManager, Utils, Overview, Characters, Stories, Events, Briefings, Timeline, SocialNetwork, FileUtils
 */

"use strict";

var PageManager = {};

PageManager.onLoad = function () {
//    PageManager.enableFullScreenElements();
    
    var root = PageManager;
    root.views = {};
    var nav = "navigation";
    var content = "contentArea";
    var button;
    var navigation = document.getElementById(nav);
    Utils.addView(root, "Overview", Overview, "Обзор", nav, content, true);
    Utils.addView(root, "Characters", Characters, "Персонажи", nav, content);
    Utils.addView(root, "Stories", Stories, "Истории", nav, content);
    Utils.addView(root, "Events", Events, "Адаптации", nav, content);
    Utils.addView(root, "Briefings", Briefings, "Вводные", nav, content);
    
    button = document.createElement("div");
    addClass(button, "nav-separator");
    navigation.appendChild(button);
    
    Utils.addView(root, "Timeline", Timeline, "Хронология", nav, content);
    Utils.addView(root, "SocialNetwork", SocialNetwork, "Социальная сеть", nav,
            content);
    Utils.addView(root, "CharacterFilter", CharacterFilter, "Фильтр", nav,
            content);

    button = document.createElement("div");
    addClass(button, "nav-separator");
    navigation.appendChild(button);
    
    button = document.createElement("div");
    button.id = "dataLoadButton";
    addClass(button, "action-button");
        var input = document.createElement("input");
        input.type = "file";
        button.appendChild(input);
    navigation.appendChild(button);

    button = document.createElement("div");
    addClass(button, "action-button");
    button.id = "dataSaveButton";
    navigation.appendChild(button);
    
    button = document.createElement("div");
    button.id = "newBaseButton";
    addClass(button, "action-button");
    navigation.appendChild(button);

    button = document.createElement("div");
    button.id = "mainHelpButton";
    addClass(button, "action-button");
    navigation.appendChild(button);

    FileUtils.init();
    


    PageManager.currentView.refresh();
};

//PageManager.enableFullScreenElements = function(){
//    "use strict";
//    var elems = document.getElementsByClassName("full-screen-elem");
//    var i, elem, button;
//    for (i = 0; i < elems.length; i++) {
//        elem = elems[i];
//        button = document.createElement("button");
//        button.appendChild(document.createTextNode("%"));
//        addClass(button, "fullScreenButton");
//        button.addEventListener("click", PageManager.fullScreenToggler(elem));
//        elem.appendChild(button);
//    }
//};
//
//PageManager.fullScreenToggler = function(elem){
//    "use strict";
//    return function(){
//        toggleClass(elem, "full-screen");
//    };
//};

window.onbeforeunload = function (evt) {
    var message = "Убедитесь, что сохранили данные. После закрытия страницы все несохраненные изменения будут потеряны.";
    if (typeof evt == "undefined") {
        evt = window.event;
    }
    if (evt) {
        evt.returnValue = message;
    }
    return message;
};
