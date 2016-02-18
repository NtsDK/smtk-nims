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

var BriefingExport = {};

BriefingExport.templates = {};

BriefingExport.briefingNumber = [1,5,10,20];

BriefingExport.init = function () {
    "use strict";
    listen(getEl("makeDefaultTextBriefings"), "click", function(){
      BriefingExport.makeTextBriefings("txt",TEXT_TEMPLATE);
    });

    listen(getEl("makeCustomTextBriefings"), "click", function(){
      BriefingExport.makeTextBriefings(getEl("textTypeSelector").value, getEl("templateArea").value);
    });
    
    var el = document.getElementById("docxBriefings");
    el.addEventListener("change", BriefingExport.readTemplateFile);

//    el = document.getElementById("eventGroupingByStoryRadio2");
//    el.checked = true;

    el = document.getElementById("exportSelectionAll");
    el.checked = true;
    el.addEventListener("change", BriefingExport.onExportSelectionChange);
    BriefingExport.exportSelectionAll = el;

    el = document.getElementById("exportSelectionSpecific");
    el.addEventListener("change", BriefingExport.onExportSelectionChange);

    el = getEl("briefingNumberSelector");
    var option;
    BriefingExport.briefingNumber.forEach(function(number){
      option = makeEl("option");
      option.appendChild(makeText(number));
      el.appendChild(option);
    });
    
    listen(el, "change", BriefingExport.onNumberSelectorChange);
    
    BriefingExport.briefingNumberSelector = el;
    BriefingExport.briefingIntervalSelector = getEl("briefingIntervalSelector");
    
    document.getElementById("makeBriefingsByTime ".trim()).addEventListener("click", BriefingExport.makeExport("templateByTime")); 
    document.getElementById("makeBriefingsByStory".trim()).addEventListener("click", BriefingExport.makeExport("templateByStory")); 
    document.getElementById("makeInventoryList   ".trim()).addEventListener("click", BriefingExport.makeExport("inventoryTemplate")); 
    
    var containers = getEls("exportContainer");
    
    for (var i = 1; i < containers.length; i++) { // don't hide 1st element
      addClass(containers[i], "hidden");
    }
    var exportModeButtons = getEls("exportModeButton");
    
    addClass(exportModeButtons[0], "active");
    
    for (var i = 0; i < exportModeButtons.length; i++) {
      listen(exportModeButtons[i], "click", BriefingExport.exportModeButtonClick(exportModeButtons, containers));
    }
    
    listen(getEl("previewTextOutput"), "click", BriefingExport.previewTextOutput);
    getEl("textBriefingPreviewArea").value = "";

    listen(getEl("showRawData"), "click", BriefingExport.previewTextDataAsIs);

    BriefingExport.briefingSelector = document.getElementById("briefingSelector");
    BriefingExport.content = document.getElementById("briefingExportDiv");
};

BriefingExport.exportModeButtonClick = function (buttons, containers) {
  "use strict";
  return function(event){
    for (var i = 0; i < buttons.length; i++) { 
      setClassByCondition(buttons[i], "active", event.target.id === buttons[i].id);
    }
    for (var i = 0; i < containers.length; i++) {
      setClassByCondition(containers[i], "hidden", event.target.id + "Container" !== containers[i].id);
    }
  };
};

BriefingExport.refresh = function () {
  "use strict";
  
  getEl("templateArea").value = TEXT_TEMPLATE;
  BriefingExport.onNumberSelectorChange();
};

BriefingExport.onExportSelectionChange = function () {
  "use strict";
  toggleClass(BriefingExport.briefingSelector, "hidden");
};

BriefingExport.getSelectedUsers = function () {
  "use strict";
  if(!BriefingExport.exportSelectionAll.checked){
    return BriefingExport.briefingIntervalSelector.selectedOptions[0].valueObject;
  }
  return null;
};

BriefingExport.onNumberSelectorChange = function () {
  "use strict";
  var selector = BriefingExport.briefingIntervalSelector;
  Utils.removeChildren(selector);
  var num = Number(BriefingExport.briefingNumberSelector.value);
  
  var option, chunks, displayText;
  PermissionInformer.getCharacterNamesArray(false, function(err, names){
    if(err) {Utils.handleError(err); return;}
    if (names.length > 0) {
      chunks = arr2Chunks(names, num);
      
      chunks.forEach(function (chunk) {
        if(chunk.length === 1){
          displayText = chunk[0].displayName;
        } else {
          displayText = chunk[0].displayName + " - " + chunk[chunk.length-1].displayName;
        }
        
        option = makeEl("option");
        option.appendChild(makeText(displayText));
        
        option.valueObject = chunk.reduce(function(map, nameInfo){
          map[nameInfo.value] = true;
          return map;
        }, {}); 
        selector.appendChild(option);
      });
    }
  });
};

BriefingExport.makeExport = function (type) {
    "use strict";
    return function(){
        if(!BriefingExport.templates[type]){
            BriefingExport.templates[type] = atob(templatesArr[type]);
        }
        BriefingExport.exportByDefaultTemplate(type);
    };
};

BriefingExport.exportByDefaultTemplate = function(type){
    "use strict";
    
    var template = BriefingExport.templates[type];
    var groupingByStory;
    switch(type){
    case "templateByTime"   : 
      groupingByStory = false;
      break;
    case "templateByStory"  : 
    case "inventoryTemplate": 
      groupingByStory = true;
      break;
    }
    DBMS.getBriefingData(groupingByStory, BriefingExport.getSelectedUsers(), function(err, briefingData){
      if(err) {Utils.handleError(err); return;}
      BriefingExport.generateDocxBriefings(template, briefingData);
    });
};

BriefingExport.previewTextDataAsIs = function () {
  "use strict";
  
  DBMS.getBriefingData(BriefingExport.isGroupingByStory(), BriefingExport.getSelectedUsers(), function(err, briefingData){
    if(err) {Utils.handleError(err); return;}
    getEl('textBriefingPreviewArea').value = JSON.stringify(briefingData, null, "  ");
  });
};

BriefingExport.renderText = function(textTemplate, delegate){
  "use strict";
  DBMS.getBriefingData(BriefingExport.isGroupingByStory(), BriefingExport.getSelectedUsers(), function(err, data){
    if(err) {Utils.handleError(err); return;}
    var characterList = {};
    data.briefings.forEach(function (briefingData) {
      characterList[briefingData.name] = Mustache.render(textTemplate, briefingData);
    });
    
    delegate(characterList);
  });
}

BriefingExport.previewTextOutput = function () {
  "use strict";
  
  BriefingExport.renderText(getEl("templateArea").value, function(characterList){
    var str = "";
    for(var name in characterList){
      str += characterList[name];
    }
    
    getEl("textBriefingPreviewArea").value = str;
  });
};

BriefingExport.makeTextBriefings = function (fileType, textTemplate) {
    "use strict";
    
  BriefingExport.renderText(textTemplate, function(characterList){
    var toSeparateFiles = getEl("toSeparateFileCheckbox").checked;
    
    if (toSeparateFiles) {
      var zip = new JSZip();
      
      var blob;
      for ( var charName in characterList) {
        zip.file(charName + "." + fileType, characterList[charName]);
      }
      
      var archive = zip.generate({type : "blob"});
      saveAs(archive, "briefings.zip");
    } else {
      var result = "";
      for ( var charName in characterList) {
          result += characterList[charName];
      }
      var blob = new Blob([ result ], {
          type : "text/plain;charset=utf-8"
      });
      saveAs(blob, "briefings." + fileType);
    }
  });
};

BriefingExport.isGroupingByStory = function () {
    "use strict";
    return true;
//    return document.getElementById("eventGroupingByStoryRadio2").checked;
};

BriefingExport.readTemplateFile = function (evt) {
    "use strict";
    // Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0];

    if (f) {
        var r = new FileReader();
        r.onload = function (e) {
            var contents = e.target.result;
            var briefingData = DBMS.getBriefingData(BriefingExport.isGroupingByStory(), BriefingExport.getSelectedUsers(), function(err, briefingData){
            	if(err) {Utils.handleError(err); return;}
            	BriefingExport.generateDocxBriefings(contents, briefingData);
            });
        }
        r.readAsBinaryString(f);
    } else {
        Utils.alert("Ошибка при загрузке файла");
    }
};

BriefingExport.generateDocxBriefings = function (contents, briefingData, fileName) {
    "use strict";
    
    var toSeparateFiles = document.getElementById("toSeparateFileCheckbox").checked;
    var exportStatus = document.getElementById("exportStatus");
    
    var updateStatus = function(text){
      Utils.removeChildren(exportStatus);
      exportStatus.appendChild(document.createTextNode(text));
    };
    
    if(!fileName){
        fileName = "briefings";
    }

    var out, archive;
    updateStatus("Подготовка к выгрузке.");
    if (toSeparateFiles) {
        var zip = new JSZip();
        content = zip.generate();
        updateStatus("Данные подготовлены. Начинаю выгрузку.");

        briefingData.briefings.forEach(function (briefing, i) {
            var doc = new window.Docxgen(contents);
            var tmpData = {
                    briefings : [ briefing ]
            };
            doc.setData(tmpData);
            doc.render() // apply them (replace all occurences of
            // {first_name} by Hipp, ...)
            out = doc.getZip().generate({
                type : "Uint8Array"
            });
            zip.file(briefing.name + ".docx", out);
            updateStatus("Выгружено " + (i+1) + " из " + briefingData.briefings.length + ".");
        });
        updateStatus("Данные выгружены. Архивирую.");
        archive = zip.generate({type : "blob"});
        updateStatus("Архив готов.");
        if(Utils.confirm("Архив сформирован. Сохраняем?")){
          saveAs(archive, fileName + ".zip");
        }
    } else {
        updateStatus("Данные подготовлены. Начинаю выгрузку.");
        var doc = new window.Docxgen(contents);
        doc.setData(briefingData);
        doc.render() // apply them (replace all occurences of {first_name} by
        // Hipp, ...)
        out = doc.getZip().generate({
            type : "blob"
        });
        updateStatus("Файл выгружен.");
        if(Utils.confirm("Документ сформирован. Сохраняем?")){
          saveAs(out, fileName + ".docx");
        }
    }
};