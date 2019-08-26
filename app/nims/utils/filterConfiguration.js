
//const Constants = require('dbms/constants');
// const ProjectUtils = require('db-utils/projectUtils');
//const R = require('ramda');

import ProjectUtils from 'db-utils/projectUtils';

function FilterConfiguration(info, t) {
  this.info = info;
  this.t = t;
  function populateProfileItems(item) {
    if (!R.startsWith(Constants.CHAR_PREFIX, item.name)
            && !R.startsWith(Constants.PLAYER_PREFIX, item.name)) {
      item.displayName = t(item.displayName);
      // item.displayName = L10n.getValue(item.displayName);
      item.value = '';
    }
  }
  this.groupedProfileFilterItems = R.clone(info.groupedProfileFilterItems);
  this.groupedProfileFilterItems.map(R.prop('profileFilterItems')).map(R.map(populateProfileItems));
}

FilterConfiguration.makeFilterConfiguration = function (dbms, t) {
  return new Promise((resolve, reject) => {
    dbms.getProfileFilterInfo().then((info) => {
      const filterConfiguration = new FilterConfiguration(info, t);
      resolve(filterConfiguration);
    }).catch(reject);
  });
};

FilterConfiguration.prototype.getProfileFilterItems = function () {
  return R.flatten(this.groupedProfileFilterItems.map(R.prop('profileFilterItems')));
};

FilterConfiguration.prototype.getProfileItemSource = function (name) {
  let source;
  this.groupedProfileFilterItems.forEach((el) => {
    const arr = el.profileFilterItems.map(R.prop('name'));
    if (R.contains(name, arr)) {
      source = el.name;
    }
  });
  return source;
};

FilterConfiguration.prototype.getName2SourceMapping = function () {
  return this.groupedProfileFilterItems.reduce((acc, group) => {
    group.profileFilterItems.forEach(item => (acc[item.name] = group.name));
    return acc;
  }, {});
};

FilterConfiguration.prototype.getName2DisplayNameMapping = function () {
  return this.groupedProfileFilterItems.reduce((acc, group) => {
    group.profileFilterItems.forEach(item => (acc[item.name] = item.displayName));
    return acc;
  }, {});
};

FilterConfiguration.prototype.getItemDisplayName = function (item) {
  const localItem = R.flatten(this.groupedProfileFilterItems.map(R.prop('profileFilterItems')))
    .find(item2 => item2.name === item.name);
  return localItem.displayName;
};

FilterConfiguration.prototype.getItemSetName = function (item) {
  return ProjectUtils.getItemSetName(item);
};

FilterConfiguration.prototype.getGroupedProfileFilterItems = function () {
  return this.groupedProfileFilterItems;
};

FilterConfiguration.prototype.getGroupsForSelect = function () {
  return this.groupedProfileFilterItems.map(group => ({
    // displayName: L10n.getValue(`profile-filter-${group.name}`),
    displayName: this.t(`profile-filter.${group.name}`),
    array: group.profileFilterItems
  }));
};

FilterConfiguration.prototype.getBaseProfileSettings = function () {
  return {
    characters: this.info.characters.profileStructure,
    players: this.info.players.profileStructure
  };
};

FilterConfiguration.prototype.getDataArrays = function (filterModel) {
  return ProjectUtils.getDataArrays(this.info, filterModel);
};

FilterConfiguration.prototype.haveProfiles = function () {
  return R.keys(this.info.characters.profiles).length > 0 || R.keys(this.info.players.profiles).length > 0;
};

FilterConfiguration.prototype.haveProfileStructures = function () {
  return this.info.characters.profileStructure.length > 0 || this.info.players.profileStructure.length > 0;
};

FilterConfiguration.prototype.haveData = function () {
  return this.haveProfiles() && this.haveProfileStructures();
};

FilterConfiguration.prototype.getProfileIds = function (filterModel) {
  const offset = this.groupedProfileFilterItems[0].profileFilterItems.length;
  return this.getDataArrays(filterModel).map(dataArray => `${dataArray[0].value || ''}/${dataArray[offset].value || ''}`).sort();
};

export default FilterConfiguration;

// module.exports = FilterConfiguration;
