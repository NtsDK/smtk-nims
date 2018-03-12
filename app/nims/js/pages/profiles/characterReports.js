/*Copyright 2018 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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

'use strict';

((exports) => {
    
    const root = '.character-reports-tmpl';
    
    exports.makeStoryReportRow = (storyInfo) => {
        const act = storyInfo.activity;
        const completness = makeCompletenessLabel(storyInfo.finishedAdaptations, storyInfo.totalAdaptations);
        const color = getCompletenessColor(storyInfo.finishedAdaptations, storyInfo.totalAdaptations);
        const row = qte(`${root} .story-report-row-tmpl` );
        const qe = qee(row);
        L10n.localizeStatic(row);
        addEl(qe('.story-name'), makeText(storyInfo.storyName));
        setClassByCondition(qe('.activity-active'), 'green-back', act.active);
        setClassByCondition(qe('.activity-follower'), 'green-back', act.follower);
        setClassByCondition(qe('.activity-defensive'), 'green-back', act.defensive);
        setClassByCondition(qe('.activity-passive'), 'green-back', act.passive);
        addEl(qe('.completness'), makeText(completness));
        setStyle(qe('.completness'), 'background-color', color);
        addEl(qe('.meets'), makeText(storyInfo.meets.join(', ')));
        addEl(qe('.inventory'), makeText(storyInfo.inventory));
        return row;
//        return addEls(makeEl('tr'), [addEl(makeEl('td'), makeText(storyInfo.storyName)),
//            addEl(setClassByCondition(makeEl('td'), 'green-back', act.active), makeText(constL10n('active-s'))),
//            addEl(setClassByCondition(makeEl('td'), 'green-back', act.follower), makeText(constL10n('follower-s'))),
//            addEl(setClassByCondition(makeEl('td'), 'green-back', act.defensive), makeText(constL10n('defensive-s'))),
//            addEl(setClassByCondition(makeEl('td'), 'green-back', act.passive), makeText(constL10n('passive-s'))),
//            addEl(addClass(setStyle(makeEl('td'), 'background-color', color), 'text-right'), makeText(label)),
//            addEl(makeEl('td'), makeText(storyInfo.meets.join(', '))),
//            addEl(makeEl('td'), makeText(storyInfo.inventory))]);
    }
    
    exports.makeRelationReportRow = R.curry((characterName, rel) => {
        const row = qte(`${root} .relation-report-row-tmpl` );
        const qe = qee(row);
        L10n.localizeStatic(row);
        addEl(qe('.character-name'), makeText(ProjectUtils.get2ndRelChar(characterName, rel)));
        const isStarter = rel.starter === characterName;
        
        setClassByCondition(qe('.direction-starterToEnder'), 'green-back', 
            R.contains(isStarter ? 'starterToEnder' : 'enderToStarter', rel.essence));
        setClassByCondition(qe('.direction-allies'), 'green-back', R.contains('allies', rel.essence));
        setClassByCondition(qe('.direction-enderToStarter'), 'green-back', 
            R.contains(!isStarter ? 'starterToEnder' : 'enderToStarter', rel.essence));
        
        const finished = isStarter ? rel.starterTextReady : rel.enderTextReady;
        
        addEl(qe('.completness'), makeText(L10n.get('constant', finished ? 'finished' : 'unfinished')));
        setClassByCondition(qe('.completness'), 'relation-finished', finished);
        setClassByCondition(qe('.completness'), 'relation-unfinished', !finished);
        
        addEl(qe('.origin'), makeText(rel.origin));
        return row;
    });
    
    function makeCompletenessLabel(value, total) {
        return strFormat('{0} ({1}/{2})', [total === 0 ? '-' : `${((value / total) * 100).toFixed(0)}%`, value, total]);
    }

    function getCompletenessColor(value, total) {
        if (total === 0) { return 'transparent'; }
        function calc(b, a, part) {
            return ((a * part) + ((1 - part) * b)).toFixed(0);
        }

        let p = value / total;
        if (p < 0.5) {
            p *= 2;
            return strFormat('rgba({0},{1},{2}, 1)', [calc(251, 255, p), calc(126, 255, p), calc(129, 0, p)]); // red to yellow mapping
        }
        p = (p - 0.5) * 2;
        return strFormat('rgba({0},{1},{2}, 1)', [calc(255, 123, p), calc(255, 225, p), calc(0, 65, p)]); // yellow to green mapping
    }
})(this.CharacterReports = {});