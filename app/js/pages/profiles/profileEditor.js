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
 Utils, DBMS
 */

"use strict";

(function(exports){

    var state = {
        'character':{},
        'player':{}
    };
    var root = ".profile-editor-tab ";
    var characterSelector = root + ".character-profile-selector";
    var playerSelector = root + ".player-profile-selector";
    var characterProfileDiv = root + ".character-profile-div";
    var playerProfileDiv = root + ".player-profile-div";
    var characterReportDiv = root + ".character-report-div tbody";
    var profileEditorCore;
    
    exports.init = function () {
        $(characterSelector).select2().on("select2:select", showProfileInfoDelegate2('character'));
        $(playerSelector).select2().on("select2:select", showProfileInfoDelegate2('player'));
        profileEditorCore = ProfileEditorCore.makeProfileEditorCore();
        exports.content = queryEl(root);
    };
    
    exports.refresh = function () {
        clearEl(queryEl(characterReportDiv));
        refreshPanel('character', characterSelector, characterProfileDiv, () => {
            refreshPanel('player', playerSelector, playerProfileDiv, ()=>{
                applySettings('character', characterSelector, characterProfileDiv);
            });
        });
    };
    
    var refreshPanel = function(type, selector, profileDiv, callback){
        PermissionInformer.getEntityNamesArray(type, false, function(err, names){
            if(err) {Utils.handleError(err); return;}
            
            names.push({displayName: '', value: '', editable: false});
            
            clearEl(queryEl(selector));
            $(selector).select2(getSelect2Data(names));
            state[type].names = names;
            
            DBMS.getProfileStructure(type, function(err, allProfileSettings){
                if(err) {Utils.handleError(err); return;}
                profileEditorCore.initProfileStructure(profileDiv, type, allProfileSettings, callback);
            });
        });
    };
    
    var applySettings = function (type, selector, profileDiv) {
        var names = state[type].names;
        if (names.length > 0) {
            var name = names[0].value;
            var settings = DBMS.getSettings();
            if(!settings["ProfileEditor"]){
                settings["ProfileEditor"] = {};
                settings["ProfileEditor"][type] = name;
            }
            var profileName = settings["ProfileEditor"][type];
            if(names.map(nameInfo => nameInfo.value).indexOf(profileName) === -1){
                settings["ProfileEditor"][type] = name;
                profileName = name;
            }
            showProfileInfoDelegate2(type)({target: {value: profileName}});
        }
    };
    
    var selectProfiles = function(charName, playerName){
        showProfileInfoDelegate('character', characterProfileDiv, charName);
        showProfileInfoDelegate('player', playerProfileDiv, playerName);
        $(characterSelector).select2().val(charName).trigger('change');
        $(playerSelector).select2().val(playerName).trigger('change');
    };
    
    var showProfileInfoDelegate2 = function(type){
        return function(event){
            var name = event.target.value.trim();
            if(name === ''){
                selectProfiles('','');
                return;
            }
            DBMS.getProfileBinding(type, name, function(err, binding){
                if(err) {Utils.handleError(err); return;}
                selectProfiles(binding[0],binding[1]);
            });
        };
    }
    
    var showProfileInfoDelegate = function (type, profileDiv, name) {
        updateSettings(type, name);
        if(name === ''){
            addClass(queryEl(profileDiv),'hidden');
            if(type === 'character'){
                addClass(queryEl(characterReportDiv),'hidden');
            }
            return;
        }
        DBMS.getProfile(type, name, function(err, profile){
            if(err) {Utils.handleError(err); return;}
            PermissionInformer.isEntityEditable(type, name, function(err, isCharacterEditable){
                if(err) {Utils.handleError(err); return;}
                profileEditorCore.fillProfileInformation(profileDiv, type, profile, isCharacterEditable);
                
                if(type === 'character'){
                    DBMS.getCharacterReport(name, function(err, characterReport){
                        if(err) {Utils.handleError(err); return;}
                        removeClass(queryEl(characterReportDiv),'hidden');
                        addEls(clearEl(queryEl(characterReportDiv)), characterReport.map(makeReportRow));
                    });
                }
            });
        });
    };
    
    var makeCompletenessLabel = function(value, total) {
        return strFormat('{0} ({1}/{2})', [total === 0 ? '-': (value / total * 100).toFixed(0) + '%', value, total]);
    };
    
    var getCompletenessColor = function(value, total) {
        if(total === 0){return 'transparent';}
        function calc(b,a,part){
            return (a*part + (1-part)*b).toFixed(0);
        }
        
        var p = value / total;
        if(p<0.5){
            p=p*2;
            return strFormat('rgba({0},{1},{2}, 1)', [calc(251,255,p),calc(126,255,p),calc(129,0,p)]); // red to yellow mapping
        } else {
            p=(p-0.5)*2;
            return strFormat('rgba({0},{1},{2}, 1)', [calc(255,123,p),calc(255,225,p),calc(0,65,p)]); // yellow to green mapping
        }
    };
    
    var makeReportRow = function(storyInfo){
        var act = storyInfo.activity;
        var label = makeCompletenessLabel(storyInfo.finishedAdaptations, storyInfo.totalAdaptations);
        var color = getCompletenessColor(storyInfo.finishedAdaptations, storyInfo.totalAdaptations);
        return addEls(makeEl('tr'), [ addEl(makeEl('td'), makeText(storyInfo.storyName)), 
                                      addEl(setClassByCondition(makeEl('td'),'green-back',act.active   ), makeText(constL10n('active-s'))), 
                                      addEl(setClassByCondition(makeEl('td'),'green-back',act.follower ), makeText(constL10n('follower-s'))), 
                                      addEl(setClassByCondition(makeEl('td'),'green-back',act.defensive), makeText(constL10n('defensive-s'))), 
                                      addEl(setClassByCondition(makeEl('td'),'green-back',act.passive  ), makeText(constL10n('passive-s'))), 
                                      addEl(addClass(setStyle(makeEl('td'),'backgroundColor', color), 'text-right') , makeText(label)), 
                                      addEl(makeEl('td'), makeText(storyInfo.meets.join(', '))), 
                                      addEl(makeEl('td'), makeText(storyInfo.inventory)), ]);
    };
    
    var updateSettings = function (type, name) {
        var settings = DBMS.getSettings();
        settings["ProfileEditor"][type] = name;
    };
    
})(this['ProfileEditor']={});