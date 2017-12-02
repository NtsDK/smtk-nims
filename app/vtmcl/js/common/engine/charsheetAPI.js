/*Copyright 2017 Timofey Rechkalov <ntsdk@yandex.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
    limitations under the License. */

/* eslint-disable func-names */

'use strict';

((callback2) => {
    function api(LocalDBMS, opts) {
        const { Migrator } = opts;
        const CU = opts.CommonUtils;
        const PC = opts.Precondition;
        const { Constants } = opts;
        const { R } = opts;

        const containerPath = ['Charsheet'];

        const char = db => R.path(containerPath, db.database);

        const getter = R.curry(function (subPath, enumArr, itemName, callback) {
            const chain = PC.chainCheck([PC.isString(itemName), PC.elementFromEnum(itemName, enumArr())]);
            PC.precondition(chain, callback, () => {
                callback(null, R.path(subPath, char(this))[itemName]);
            });
        });
        const setter = R.curry(function (subPath, enumArr, valueCheck, itemName, itemValue, callback) {
            const chain = PC.chainCheck([PC.isString(itemName),
                PC.elementFromEnum(itemName, enumArr.bind(this)()), valueCheck(itemName, itemValue)]);
            PC.precondition(chain, callback, () => {
                R.path(subPath, char(this))[itemName] = itemValue;
                if (callback) callback();
            });
        });

        const objListGetter = container => function () {
            return R.keys(char(this)[container]);
        };

        const isValString = (itemName, value) => PC.chainCheck([PC.isString(value)]);
        const maxPoints = R.always(Constants.maxPoints);
        const extrasMaxPoints = itemName => (itemName === 'bloodpool' ? Constants.bloodpoolMax : Constants.extrasMaxPoints);
        const isValInRange = R.curry((min, max, itemName, value) =>
            PC.chainCheck([PC.isNumber(value), PC.isInRange(value, min, max(itemName))]));

        LocalDBMS.prototype.getProfileItem = getter(['profile'], R.always(Constants.profileItemList));
        LocalDBMS.prototype.setProfileItem = setter(['profile'], R.always(Constants.profileItemList), isValString);

        LocalDBMS.prototype.getAttribute = getter(['attributes'], R.always(Constants.attributeList));
        LocalDBMS.prototype.setAttribute = setter(['attributes'], R.always(Constants.attributeList), isValInRange(0, maxPoints));

        LocalDBMS.prototype.getAbility = getter(['abilities'], R.always(Constants.abilityList));
        LocalDBMS.prototype.setAbility = setter(['abilities'], R.always(Constants.abilityList), isValInRange(0, maxPoints));

        LocalDBMS.prototype.getVirtue = getter(['virtues'], R.always(Constants.virtues));
        LocalDBMS.prototype.setVirtue = setter(['virtues'], R.always(Constants.virtues), isValInRange(1, maxPoints));

        LocalDBMS.prototype.getState = getter(['state'], R.always(Constants.basicStateList));
        LocalDBMS.prototype.setState = setter(['state'], R.always(Constants.basicStateList), isValInRange(1, extrasMaxPoints));

        LocalDBMS.prototype.getHealth = getter(['state', 'health'], R.always(Constants.healthList));
        LocalDBMS.prototype.setHealth = setter(['state', 'health'], R.always(Constants.healthList), isValInRange(0, R.always(2)));

        LocalDBMS.prototype.setBackground = setter(['backgrounds'], objListGetter('backgrounds'), isValInRange(0, maxPoints));

        LocalDBMS.prototype.setDiscipline = setter(['disciplines'], objListGetter('disciplines'), isValInRange(0, maxPoints));

        const arrGetter = R.curry(function (initter, enumArr, type, callback) {
            const chain = PC.chainCheck([PC.isString(type), PC.elementFromEnum(type, enumArr)]);
            PC.precondition(chain, callback, () => {
                callback(null, initter(char(this)[type]));
            });
        });

        const namer = R.curry(function (defaultValue, enumArr, type, oldName, newName, callback) {
            const chain = [PC.isString(type), PC.elementFromEnum(type, enumArr),
                PC.isString(oldName), PC.isString(newName)];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                const container = char(this)[type];
                oldName = oldName.trim();
                newName = newName.trim();
                const chain2 = [];
                if (oldName !== '') {
                    chain2.push(PC.entityExistsCheck(oldName, R.keys(container)));
                }
                if (newName !== '') {
                    chain2.push(PC.createEntityCheck(newName, R.keys(container)));
                }
                PC.precondition(PC.chainCheck(chain2), callback, () => {
                    if (oldName === '' && newName !== '') {
                        char(this)[type][newName] = defaultValue;
                    }
                    if (oldName !== '' && newName === '') {
                        delete char(this)[type][oldName];
                    }
                    if (oldName !== '' && newName !== '') {
                        char(this)[type][newName] = char(this)[type][oldName];
                        delete char(this)[type][oldName];
                    }
                    if (callback) callback();
                });
            });
        });

        LocalDBMS.prototype.getBackstory = arrGetter(R.keys, Constants.backstoryList);
        LocalDBMS.prototype.setBackstory = namer(true, Constants.backstoryList);

        LocalDBMS.prototype.getAdvantages = arrGetter(R.toPairs, Constants.advantagesList);
        LocalDBMS.prototype.renameAdvantage = namer(0, Constants.advantagesList);

        LocalDBMS.prototype.getNotes = function (callback) {
            callback(null, char(this).notes);
        };

        LocalDBMS.prototype.setNotes = function (text, callback) {
            const chain = PC.chainCheck([PC.isString(text)]);
            PC.precondition(chain, callback, () => {
                char(this).notes = text;
                if (callback) callback();
            });
        };
    }

    callback2(api);
})(api => (typeof exports === 'undefined' ? (this.charsheetAPI = api) : (module.exports = api)));