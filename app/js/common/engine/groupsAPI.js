/*Copyright 2016 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
   limitations under the License. */

"use strict";

(function(callback){

    function groupsAPI(LocalDBMS, R, Constants, CommonUtils, Errors, listeners) {
        
        LocalDBMS.prototype.getGroupNamesArray = function(callback) {
            callback(null, Object.keys(this.database.Groups).sort(CommonUtils.charOrdA));
        };
        
        LocalDBMS.prototype.getGroup = function(groupName, callback) {
            callback(null, CommonUtils.clone(this.database.Groups[groupName]));
        };
        
        var _getCharacterGroupTexts = function(groups, info, profileId){
            var dataArray = CommonUtils.getDataArray(info, profileId);
            var array = R.values(groups).filter(function(group){
                return group.doExport && CommonUtils.acceptDataRow(group.filterModel, dataArray);
            }).map(function(group){
                return {
                    groupName: group.name,
                    text: group.characterDescription
                }
            });
            array.sort(CommonUtils.charOrdAFactory(R.prop('groupName')));
            return array;
        }
        
        // preview
        LocalDBMS.prototype.getCharacterGroupTexts = function(characterName, callback) {
            var that = this;
            this.getProfileBinding('character', characterName, function(err, profileId){
                if(err) {callback(err); return;}
                that.getProfileFilterInfo(function(err, info){
                    if(err) {callback(err); return;}
                    callback(null, _getCharacterGroupTexts(that.database.Groups, info, profileId));
                });
            })
        };
        
        // export
        LocalDBMS.prototype.getAllCharacterGroupTexts = function(callback) {
            var that = this;
            
            this.getProfileFilterInfo(function(err, info){
                if(err) {callback(err); return;}
                that.getProfileBindings(function(err, bindings){
                    if(err) {callback(err); return;}
                    var texts = Object.keys(that.database.Characters).reduce(function(result, characterName){
                        var profileId = bindings[characterName] === undefined ? [characterName, ''] : [characterName, bindings[characterName]];
                        result[characterName] = _getCharacterGroupTexts(that.database.Groups, info, profileId);
                        return result;
                    }, {});
                    callback(null, texts);
                })
            });
        };
        
        LocalDBMS.prototype.isGroupNameUsed = function(groupName, callback) {
            callback(null, this.database.Groups[groupName] !== undefined);
        };
        
        LocalDBMS.prototype.createGroup = function(groupName, callback) {
            if(groupName === ""){
                callback(new Errors.ValidationError("groups-group-name-is-not-specified"));
                return;
            }
            
            if(this.database.Groups[groupName]){
                callback(new Errors.ValidationError("groups-group-name-already-used", [groupName]));
                return;
            }
            
            var newGroup = {
                name : groupName,
                masterDescription : "",
                characterDescription : "",
                filterModel: [],
                doExport: true
            };
    
            this.database.Groups[groupName] = newGroup;
            this.ee.trigger("createGroup", arguments);
            if(callback) callback();
        };

        LocalDBMS.prototype.renameGroup = function(fromName, toName, callback) {
            if (toName === "") {
                callback(new Errors.ValidationError("groups-new-group-name-is-not-specified"));
                return;
            }

            if (fromName === toName) {
                callback(new Errors.ValidationError("groups-names-are-the-same"));
                return;
            }
            
            if(this.database.Groups[toName]){
                callback(new Errors.ValidationError("groups-group-name-already-used", [toName]));
                return;
            }
            
            var data = this.database.Groups[fromName];
            data.name = toName;
            this.database.Groups[toName] = data;
            delete this.database.Groups[fromName];
            
            this.ee.trigger("renameGroup", arguments);
    
            if(callback) callback();
        };
    
        LocalDBMS.prototype.removeGroup = function(groupName, callback) {
            delete this.database.Groups[groupName];
            this.ee.trigger("removeGroup", arguments);
            if(callback) callback();
        };
        
        LocalDBMS.prototype.saveFilterToGroup = function(groupName, filterModel, callback) {
            var conflictTypes = CommonUtils.isFilterModelCompatibleWithProfiles({
                characters: this.database.CharacterProfileStructure,
                players: this.database.PlayerProfileStructure
            }, filterModel);
            if(conflictTypes.length != 0){
                callback(new Errors.ValidationError("groups-page-filter-is-incompatible-with-base-profiles", [conflictTypes.join(',')]));
                return;
            }
            this.database.Groups[groupName].filterModel = filterModel;
            if(callback) callback();
        };
    
        LocalDBMS.prototype.updateGroupField = function(groupName, fieldName, value, callback) {
            var profileInfo = this.database.Groups[groupName];
            profileInfo[fieldName] = value;
            if(callback) callback();
        };
        
        var initProfileInfo = function(that, type, ownerMapType, callback){
            that.getAllProfiles(type, function(err, profiles){
                if(err) {callback(err); return;}
                var owners = R.keys(profiles);
                if(that._getOwnerMap){
                    owners = that._getOwnerMap(ownerMapType);
                } else {
                    owners = R.zipObj(owners, R.repeat('user', owners.length));
                }
                that.getProfileStructure(type, function(err, profileStructure){
                    if(err) {callback(err); return;}
                    callback(null, {
                        'profileStructure':profileStructure,
                        'owners':owners,
                        'profiles':profiles
                    });
                });
            });
        };
        
        LocalDBMS.prototype.getProfileFilterInfo = function(callback) {
            var that = this;
            initProfileInfo(that, 'character', 'Characters', function(err, charactersInfo){
                if(err) {callback(err); return;}
                initProfileInfo(that, 'player', 'Players', function(err, playersInfo){
                    if(err) {callback(err); return;}
                    that.getCharactersSummary(function(err, charactersSummary){
                        if(err) {callback(err); return;}
                        that.getExtendedProfileBindings(function(err, bindingData){
                            if(err) {callback(err); return;}
                            var info = CommonUtils.makeGroupedProfileFilterInfo({
                                'characters' : charactersInfo,
                                'players' : playersInfo,
                                charactersSummary : charactersSummary,
                                bindingData : bindingData
                            });
                            callback(null, info);
                        });
                    });
                });
            });
        };
        
        var _getGroupCharacterSets = function(groups, characterNames, bindings, info){
            var groupNames = R.keys(groups);
            var groupCharacterSets = R.zipObj(groupNames, R.ap([R.clone], R.repeat({}, groupNames.length)));
            characterNames.forEach(function(characterName){
                var profileId = bindings[characterName] === undefined ? [characterName, ''] : [characterName, bindings[characterName]];
                var dataArray = CommonUtils.getDataArray(info, profileId);
                groupNames.forEach(function(groupName){
                    if(CommonUtils.acceptDataRow(groups[groupName].filterModel, dataArray)){
                        groupCharacterSets[groupName][characterName] = true;
                    }
                });
            });
            return groupCharacterSets;
        };
        
        LocalDBMS.prototype.getGroupCharacterSets = function(callback) {
            var that = this;
            
            this.getProfileFilterInfo(function(err, info){
                if(err) {callback(err); return;}
                callback(null, _getGroupCharacterSets(that.database.Groups, R.keys(that.database.Characters), R.clone(that.database.ProfileBindings), info));
            });
        };

        function _removeProfileItem(type, index, profileItemName){
            let prefix = (type === 'character' ? Constants.CHAR_PREFIX : Constants.PLAYER_PREFIX);
            let subFilterName = prefix + profileItemName;
            var that = this;
            Object.keys(this.database.Groups).forEach(function(groupName) {
                var group = that.database.Groups[groupName];
                group.filterModel = group.filterModel.filter(function(filterItem){
                    return filterItem.name !== subFilterName;
                });
            });
        };
        
        listeners.removeProfileItem = listeners.removeProfileItem || [];
        listeners.removeProfileItem.push(_removeProfileItem);

        function _changeProfileItemType(type, profileItemName, newType){
            _removeProfileItem.apply(this, [type, -1, profileItemName]);
        };
        
        listeners.changeProfileItemType = listeners.changeProfileItemType || [];
        listeners.changeProfileItemType.push(_changeProfileItemType);

        function _renameProfileItem(type, newName, oldName){
            let prefix = (type === 'character' ? Constants.CHAR_PREFIX : Constants.PLAYER_PREFIX);
            let subFilterName = prefix + oldName;
            var that = this;
            Object.keys(this.database.Groups).forEach(function(groupName) {
                var group = that.database.Groups[groupName];
                group.filterModel = group.filterModel.map(function(filterItem){
                    if(filterItem.name === subFilterName){
                        filterItem.name = prefix + newName;
                    }
                    return filterItem;
                });
            });
        };
        
        listeners.renameProfileItem = listeners.renameProfileItem || [];
        listeners.renameProfileItem.push(_renameProfileItem);
        
        function _replaceEnumValue(type, profileItemName, defaultValue, newOptionsMap){
            var subFilterName = (type === 'character' ? Constants.CHAR_PREFIX : Constants.PLAYER_PREFIX) + profileItemName;
            var that = this;
            Object.keys(this.database.Groups).forEach(function(groupName) {
                var group = that.database.Groups[groupName];
                group.filterModel.forEach(function(filterItem){
                    if(filterItem.name === subFilterName){
                        for(var selectedOption in filterItem.selectedOptions){
                            if (!newOptionsMap[selectedOption]) {
                                delete filterItem.selectedOptions[selectedOption];
                            }
                        }
                    }
                });
            });
            Object.keys(this.database.Groups).forEach(function(groupName) {
                var group = that.database.Groups[groupName];
                group.filterModel = group.filterModel.filter(function(filterItem){
                    if(filterItem.name !== subFilterName){
                        return true;
                    }
                    return Object.keys(filterItem.selectedOptions).length != 0;
                });
            });
        };
        
        listeners.replaceEnumValue = listeners.replaceEnumValue || [];
        listeners.replaceEnumValue.push(_replaceEnumValue);
        
        listeners.replaceMultiEnumValue = listeners.replaceMultiEnumValue || [];
        listeners.replaceMultiEnumValue.push(_replaceEnumValue);
    };
    
    callback(groupsAPI);

})(function(api){
    typeof exports === 'undefined'? this['groupsAPI'] = api: module.exports = api;
}.bind(this));