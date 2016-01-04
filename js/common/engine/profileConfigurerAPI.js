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

(function(callback){

	function profileConfigurerAPI(LocalDBMS, Constants, CommonUtils, Errors) {
		// profile configurer
		LocalDBMS.prototype.createProfileItem = function(name, type, value, toEnd, selectedIndex, callback) {
			"use strict";
			var that = this;
		    this.isProfileItemNameUsed(name, function(err, value){
		    	if(err) {callback(err);return;}
		    	
		    	if(value){
		    		callback(new Errors.ValidationError("Такое имя уже используется"));
		    		return;
		    	}
		    	
		    	var profileItem = {
		    			name : name,
		    			type : type,
		    			value : value
		    	};
		    	
		    	
		    	Object.keys(that.database.Characters).forEach(function(characterName) {
		    		that.database.Characters[characterName][name] = value;
		    	});
		    	
		    	if (toEnd) {
		    		that.database.ProfileSettings.push(profileItem);
		    	} else {
		    		that.database.ProfileSettings.splice(selectedIndex, 0, profileItem);
		    	}
		    	callback();
		    });
			
		};
	
		// profile configurer
		LocalDBMS.prototype.swapProfileItems = function(index1, index2, callback) {
			"use strict";
			var tmp = this.database.ProfileSettings[index1];
			this.database.ProfileSettings[index1] = this.database.ProfileSettings[index2];
			this.database.ProfileSettings[index2] = tmp;
			callback();
		};
		// profile configurer
		LocalDBMS.prototype.removeProfileItem = function(index, profileItemName, callback) {
			"use strict";
			var that = this;
			Object.keys(this.database.Characters).forEach(function(characterName) {
				delete that.database.Characters[characterName][profileItemName];
			});
			CommonUtils.removeFromArrayByIndex(this.database.ProfileSettings, index);
			callback();
		};
		// profile configurer
		LocalDBMS.prototype.changeProfileItemType = function(profileItemName, newType, callback) {
			"use strict";
	
			var profileItem = this.database.ProfileSettings.filter(function(elem) {
				return elem.name === profileItemName;
			})[0];
	
			profileItem.type = newType;
	
			profileItem.value = Constants.profileFieldTypes[newType].value;
	
			var that = this;
			Object.keys(this.database.Characters).forEach(function(characterName) {
				that.database.Characters[characterName][profileItemName] = Constants.profileFieldTypes[newType].value;
			});
			callback();
		};
	
		// profile configurer
		LocalDBMS.prototype.isProfileItemNameUsed = function(profileItemName, callback) {
			"use strict";
			
		    if (profileItemName === "") {
		    	callback(new Errors.ValidationError("Название поля не указано"));
		        return;
		    }
		    
		    if (profileItemName === "name") {
		    	callback(new Errors.ValidationError("Название поля не может быть name"));
		        return;
		    }
		    
			var nameUsedTest = function(profile) {
				return profileItemName === profile.name;
			};
	
			callback(null, this.database.ProfileSettings.some(nameUsedTest));
		};
		// profile configurer
		LocalDBMS.prototype.renameProfileItem = function(newName, oldName, callback) {
			"use strict";
			var that = this;
		    this.isProfileItemNameUsed(newName, function(err, value){
		    	if(err) {callback(err);return;}
		    	
		    	if(value){
		    		callback(new Errors.ValidationError("Такое имя уже используется"));
		    		return;
		    	}
		    	
		    	Object.keys(that.database.Characters).forEach(function(characterName) {
		    		var tmp = that.database.Characters[characterName][oldName];
		    		delete that.database.Characters[characterName][oldName];
		    		that.database.Characters[characterName][newName] = tmp;
		    	});
		    	
		    	that.database.ProfileSettings.filter(function(elem) {
		    		return elem.name === oldName;
		    	})[0].name = newName;
		    	callback();
		    });
			
		};
	
		// profile configurer
		LocalDBMS.prototype.updateDefaultValue = function(profileItemName, value, callback) {
			"use strict";
	
			var info = this.database.ProfileSettings.filter(function(elem) {
				return elem.name === profileItemName;
			})[0];
	
			var oldOptions, newOptions, newOptionsMap, missedValues;
	
			switch (info.type) {
			case "text":
			case "string":
			case "checkbox":
				info.value = value;
				break;
			case "number":
				// if (isNaN(value)) {
				// Utils.alert("Введено не число");
				// callback(info.value);
				// return;
				// }
				info.value = Number(value);
				break;
			case "enum":
				if (value === "") {
					callback(new Errors.ValidationError("Значение поля с единственным выбором не может быть пустым"));
					return;
				}
				oldOptions = info.value.split(",");
				newOptions = value.split(",");
	
				newOptions = newOptions.map(function(elem) {
					return elem.trim();
				});
	
				newOptionsMap = [ {} ].concat(newOptions).reduce(function(a, b) {
					a[b] = true;
					return a;
				});
	
				missedValues = oldOptions.filter(function(oldOption) {
					return !newOptionsMap[oldOption];
				});
	
				if (missedValues.length !== 0) {
					info.value = newOptions.join(",");
	
					var that = this;
					Object.keys(this.database.Characters).forEach(function(characterName) {
						var enumValue = that.database.Characters[characterName][profileItemName];
						if (!newOptionsMap[enumValue]) {
							that.database.Characters[characterName][profileItemName] = newOptions[0];
						}
					});
	
					return;
				}
	
				info.value = newOptions.join(",");
				break;
			}
			callback();
		};
	
	};
	callback(profileConfigurerAPI);

})(function(api){
	typeof exports === 'undefined'? this['profileConfigurerAPI'] = api: module.exports = api;
});