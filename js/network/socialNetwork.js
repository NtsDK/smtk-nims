/*global
 Utils, DBMS, Database, StoryCharacters
 */

"use strict";

var SocialNetwork = {};

SocialNetwork.colorMap = {};

//SocialNetwork.networks = [ "Простая сеть", "Детальная сеть", "Человек-история", "Человек-история 2" ];
SocialNetwork.networks = [ "Детальная сеть", "Человек-история", "Человек-история 2" ];

SocialNetwork.activityColors = {
        "active": "red", 
        "follower": "blue", 
        "defensive": "green", 
        "passive": "grey"
};

SocialNetwork.generatedColors = [];

// used http://tools.medialab.sciences-po.fr/iwanthue/
//SocialNetwork.generatedColors = ["#47CA9D",
//                                 "#F7ABE7",
//                                 "#D1CE4A",
//                                 "#62D8FD",
//                                 "#E1A07B",
//                                 "#DADDEC",
//                                 "#8CCB64",
//                                 "#F5DE8F",
//                                 "#FFB3C2",
//                                 "#9FC3F7",
//                                 "#C1A5C3",
//                                 "#37DAE2",
//                                 "#BBE65C",
//                                 "#98B6BD",
//                                 "#BDA7E4",
//                                 "#E4A197",
//                                 "#CBF1F2",
//                                 "#E89A6C",
//                                 "#F0A9BA",
//                                 "#F1ABA2"];

// the Colour Alphabet Project suggested by Paul Green-Armytage 
//SocialNetwork.generatedColors = [
//"rgb(240,163,255)",
//"rgb(0,117,220)",
//"rgb(153,63,0)",
//"rgb(76,0,92)",
//"rgb(25,25,25)",
//"rgb(0,92,49)",
//"rgb(43,206,72)",
//"rgb(255,204,153)",
//"rgb(128,128,128)",
//"rgb(148,255,181)",
//"rgb(143,124,0)",
//"rgb(157,204,0)",
//"rgb(194,0,136)",
//"rgb(0,51,128)",
//"rgb(255,164,5)",
//"rgb(255,168,187)",
//"rgb(66,102,0)",
//"rgb(255,0,16)",
//"rgb(94,241,242)",
//"rgb(0,153,143)",
//"rgb(224,255,102)",
//"rgb(116,10,255)",
//"rgb(153,0,0)",
//"rgb(255,255,128)",
//"rgb(255,255,0)",
//"rgb(255,80,5)"
//];

SocialNetwork.colorPalette = [
//  {color: {border: "#2B7CE9", background: "#97C2FC", highlight: {border: "#2B7CE9", background: "#D2E5FF"}, hover: {border: "#2B7CE9", background: "#D2E5FF"}}}, // 0: blue
//  {color: {border: "#FFA500", background: "#FFFF00", highlight: {border: "#FFA500", background: "#FFFFA3"}, hover: {border: "#FFA500", background: "#FFFFA3"}}}, // 1: yellow
  {color: {border: "#FA0A10", background: "#FB7E81", highlight: {border: "#FA0A10", background: "#FFAFB1"}, hover: {border: "#FA0A10", background: "#FFAFB1"}}}, // 2: red
  {color: {border: "#41A906", background: "#7BE141", highlight: {border: "#41A906", background: "#A1EC76"}, hover: {border: "#41A906", background: "#A1EC76"}}}, // 3: green
  {color: {border: "#E129F0", background: "#EB7DF4", highlight: {border: "#E129F0", background: "#F0B3F5"}, hover: {border: "#E129F0", background: "#F0B3F5"}}}, // 4: magenta
  {color: {border: "#7C29F0", background: "#AD85E4", highlight: {border: "#7C29F0", background: "#D3BDF0"}, hover: {border: "#7C29F0", background: "#D3BDF0"}}}, // 5: purple
  {color: {border: "#C37F00", background: "#FFA807", highlight: {border: "#C37F00", background: "#FFCA66"}, hover: {border: "#C37F00", background: "#FFCA66"}}}, // 6: orange
  {color: {border: "#4220FB", background: "#6E6EFD", highlight: {border: "#4220FB", background: "#9B9BFD"}, hover: {border: "#4220FB", background: "#9B9BFD"}}}, // 7: darkblue
  {color: {border: "#FD5A77", background: "#FFC0CB", highlight: {border: "#FD5A77", background: "#FFD1D9"}, hover: {border: "#FD5A77", background: "#FFD1D9"}}}, // 8: pink
  {color: {border: "#4AD63A", background: "#C2FABC", highlight: {border: "#4AD63A", background: "#E6FFE3"}, hover: {border: "#4AD63A", background: "#E6FFE3"}}}, // 9: mint

  {color: {border: "#990000", background: "#EE0000", highlight: {border: "#BB0000", background: "#FF3333"}, hover: {border: "#BB0000", background: "#FF3333"}}}, // 10:bright red

  {color: {border: "#FF6000", background: "#FF6000", highlight: {border: "#FF6000", background: "#FF6000"}, hover: {border: "#FF6000", background: "#FF6000"}}}, // 12: real orange
  {color: {border: "#97C2FC", background: "#2B7CE9", highlight: {border: "#D2E5FF", background: "#2B7CE9"}, hover: {border: "#D2E5FF", background: "#2B7CE9"}}}, // 13: blue
  {color: {border: "#399605", background: "#255C03", highlight: {border: "#399605", background: "#255C03"}, hover: {border: "#399605", background: "#255C03"}}}, // 14: green
  {color: {border: "#B70054", background: "#FF007E", highlight: {border: "#B70054", background: "#FF007E"}, hover: {border: "#B70054", background: "#FF007E"}}}, // 15: magenta
  {color: {border: "#AD85E4", background: "#7C29F0", highlight: {border: "#D3BDF0", background: "#7C29F0"}, hover: {border: "#D3BDF0", background: "#7C29F0"}}}, // 16: purple
  {color: {border: "#4557FA", background: "#000EA1", highlight: {border: "#6E6EFD", background: "#000EA1"}, hover: {border: "#6E6EFD", background: "#000EA1"}}}, // 17: darkblue
  {color: {border: "#FFC0CB", background: "#FD5A77", highlight: {border: "#FFD1D9", background: "#FD5A77"}, hover: {border: "#FFD1D9", background: "#FD5A77"}}}, // 18: pink
  {color: {border: "#C2FABC", background: "#74D66A", highlight: {border: "#E6FFE3", background: "#74D66A"}, hover: {border: "#E6FFE3", background: "#74D66A"}}}, // 19: mint

  {color: {border: "#EE0000", background: "#990000", highlight: {border: "#FF3333", background: "#BB0000"}, hover: {border: "#FF3333", background: "#BB0000"}}} // 20:bright red
];

//SocialNetwork.colorPalette = [ 
////                               {
////    color : { // aquamarine-blue
////        background : 'rgb(151,194,252)',
////        border : 'rgb(43,124,233)'
////    }
////}, { // rose-red
////    color : {
////        background : 'rgb(251,126,129)',
////        border : 'rgb(250,10,16)'
////    }
////}, { // green-deep green
////    color : { 
////        background : 'rgb(123,225,65)',
////        border : 'rgb(65,169,6)'
////    }
////} 
//
//];

SocialNetwork.fixedColors = {
    "storyColor" : {
        color : {
            background : 'rgb(255,255,0)',
            border : 'rgb(255,168,3)'
        }
    },
    "Без групп" : {
        color : {
            background : 'rgb(151,194,252)',
            border : 'rgb(43,124,233)'
        }
    },
    "thirdDegreeNode" : {
        color : {
            background : 'rgba(200,200,200,0.5)',
            border : 'rgba(200,200,200,0.5)'
        }
    },
    "secondDegreeNode" : {
        color : {
            background : 'rgba(150,150,150,0.75)',
            border : 'rgba(150,150,150,0.75)'
        }
    },
    "firstDegreeNode" : {
        color : {
            background : 'rgb(151,194,252)',
            border : 'rgb(43,124,233)'
        }
    }
};

SocialNetwork.init = function () {
    "use strict";

    SocialNetwork.highlightActive = true;
    
    NetworkSubsetsSelector.init();
    
    SocialNetwork.fillColorPalette();
    
    var selector = document.getElementById("networkNodeGroupSelector");
    selector.addEventListener("change", function (event) {
        SocialNetwork.updateNodes(event.target.value);
    });


    
    selector = document.getElementById("networkSelector");
    selector.addEventListener("change", SocialNetwork.onNetworkSelectorChangeDelegate);
    
    var button = document.getElementById("drawNetworkButton");
    button.addEventListener("click", SocialNetwork.onDrawNetwork);

    var option;
    SocialNetwork.networks.forEach(function (network) {
        option = document.createElement("option");
        option.appendChild(document.createTextNode(network));
        selector.appendChild(option);
    });
    
    selector = document.getElementById("activitySelector");
    selector.addEventListener("change", SocialNetwork.onActivitySelectorChangeDelegate);
    
    var st;
    StoryCharacters.characterActivityTypes.forEach(function (activity, i) {
        option = document.createElement("option");
        option.appendChild(document.createTextNode(StoryCharacters.characterActivityDisplayNames[i]));
        st = option.style;
        st.color = SocialNetwork.activityColors[StoryCharacters.characterActivityTypes[i] ];
        //option.style = "color:" + SocialNetwork.activityColors[StoryCharacters.characterActivityTypes[i] ] + ";";
        option.activity = activity;
        selector.appendChild(option);
    });
    
    SocialNetwork.selectedActivities = {};

    SocialNetwork.network;
//    SocialNetwork.allNodes;
    SocialNetwork.highlightActive = false;
    
    
    document.getElementById("hideNetworkSettingsButton").addEventListener("click", SocialNetwork.hidePanel);
    document.getElementById("showNetworkSettingsButton").addEventListener("click", SocialNetwork.showPanel);
    

    SocialNetwork.content = document.getElementById("socialNetworkDiv");
};

SocialNetwork.fillColorPalette = function(){
    "use strict";
    SocialNetwork.generatedColors.forEach(function(genColor){
        SocialNetwork.colorPalette.push({
            color : { 
                background : genColor,
                border : genColor
            }
        });  
    });
};

SocialNetwork.refresh = function () {
    "use strict";
    
    var selector = document.getElementById("networkSelector");
    selector.value = SocialNetwork.networks[0];
    
    selector = document.getElementById("networkNodeGroupSelector");
    Utils.removeChildren(selector);
    
    var groups = Database.ProfileSettings.filter(function (element) {
        return element.type === "enum" || element.type === "checkbox";
    });
    
    var groupNames = [ "Без групп" ].concat(groups.map(function (elem) {
        return elem.name;
    }));

    groupNames.forEach(function (group) {
        var option = document.createElement("option");
        option.appendChild(document.createTextNode(group));
        selector.appendChild(option);
    });
    
    SocialNetwork.groupColors = {};
    
    for ( var groupName in SocialNetwork.fixedColors) {
        SocialNetwork.groupColors[groupName] = SocialNetwork.fixedColors[groupName];
    }
    
    groups.forEach(function (group) {
        if(group.type === "enum"){
            group.value.split(",").forEach(function (subGroupName, i){
                SocialNetwork.groupColors[group.name + "." + subGroupName.trim()] = SocialNetwork.colorPalette[i];
            });
        } else if( group.type === "checkbox"){
            if(group.value){
                SocialNetwork.groupColors[group.name + ".true"] = SocialNetwork.colorPalette[0];
                SocialNetwork.groupColors[group.name + ".false"] = SocialNetwork.colorPalette[1];
            } else {
                SocialNetwork.groupColors[group.name + ".true"] = SocialNetwork.colorPalette[1];
                SocialNetwork.groupColors[group.name + ".false"] = SocialNetwork.colorPalette[0];
            }
        }
    });
    
    NetworkSubsetsSelector.refresh();
//    SocialNetwork.onNetworkSelectorChange(SocialNetwork.networks[0]);
//    SocialNetwork.updateNodes("Без групп");
};

SocialNetwork.refreshLegend = function (groupName) {
    "use strict";
    var colorLegend = document.getElementById("colorLegend");
    Utils.removeChildren(colorLegend);
    var colorDiv;
    
    Object.keys(SocialNetwork.groupColors).filter(function (value){
        return value.substring(0, groupName.length) === groupName;
    }).forEach(function (value) {
        colorDiv = document.createElement("div");
        colorDiv.appendChild(document.createTextNode(value));
        colorDiv.style.backgroundColor = SocialNetwork.groupColors[value].color.background;
        colorDiv.style.border = "solid 2px " + SocialNetwork.groupColors[value].color.border;
        colorLegend.appendChild(colorDiv);
    });
    
    if(SocialNetwork.selectedNetwork === "Человек-история"){
        colorDiv = document.createElement("div");
        colorDiv.appendChild(document.createTextNode("История"));
        colorDiv.style.backgroundColor = SocialNetwork.fixedColors["storyColor"].color.background;
        colorDiv.style.border = "solid 2px " + SocialNetwork.fixedColors["storyColor"].color.border;
        colorLegend.appendChild(colorDiv);
    }
};

SocialNetwork.updateNodes = function (groupName) {
    "use strict";
    SocialNetwork.refreshLegend(groupName);
    
//    Object.keys(Database.Characters).forEach(function (characterName) {
    var group;
    NetworkSubsetsSelector.getCharacterNames().forEach(function (characterName) {
        var character = Database.Characters[characterName];
        group = groupName === "Без групп" ? groupName : groupName + "." + character[groupName];
        SocialNetwork.nodesDataset.update({
            id : character.name,
            // label : name,
//            label : character.name.split(" ").join("\n"),
//            color: SocialNetwork.groupColors[group],
            // group: character[groupName]+""
            // color: SocialNetwork.colorMap[groupName + "." +
            // character[groupName]]
            // group: groupName + "." + character[groupName]
            group : group
        // group: character[groupName]+""
        // group: 0
        });
    });
};

SocialNetwork.onActivitySelectorChangeDelegate = function (event) {
    "use strict";
    SocialNetwork.selectedActivities = {};

    var i;
    for (i = 0; i < event.target.selectedOptions.length; i +=1) {
        SocialNetwork.selectedActivities[event.target.selectedOptions[i].activity] = true;
    }
};

SocialNetwork.onNetworkSubsetsChange = function (event) {
    var selectedSubset = event.target.value;
    
    var selector1 = document.getElementById("networkCharacterDiv");
    var selector2 = document.getElementById("networkStoryDiv");
    selector1.className = selectedSubset === SocialNetwork.objectSubsets[1] ? "" : "hidden";
    selector2.className = selectedSubset === SocialNetwork.objectSubsets[2] ? "" : "hidden";
    
};

SocialNetwork.onNetworkSelectorChangeDelegate = function (event) {
    "use strict";
    var selectedNetwork = event.target.value;
    var activityBlock = document.getElementById("activityBlock");
    activityBlock.className = selectedNetwork === "Человек-история 2" ? "" : "hidden";
};

SocialNetwork.onDrawNetwork = function () {
    "use strict";
    var selector = document.getElementById("networkSelector");
    
    SocialNetwork.onNetworkSelectorChange(selector.value);
};

SocialNetwork.onNetworkSelectorChange = function (selectedNetwork) {
    "use strict";
    SocialNetwork.selectedNetwork = selectedNetwork;
    SocialNetwork.nodes = [];
    SocialNetwork.edges = [];

    switch (selectedNetwork) {
    case "Простая сеть":
        SocialNetwork.nodes = SocialNetwork.getCharacterNodes();
        SocialNetwork.edges = SocialNetwork.getSimpleEdges();
        break;
    case "Детальная сеть":
        SocialNetwork.nodes = SocialNetwork.getCharacterNodes();
        SocialNetwork.edges = SocialNetwork.getDetailedEdges();
        break;
    case "Человек-история":
        SocialNetwork.nodes = SocialNetwork.getCharacterNodes().concat(SocialNetwork.getStoryNodes());
        SocialNetwork.edges = SocialNetwork.getStoryEdges();
        break;
    case "Человек-история 2":
        SocialNetwork.nodes = SocialNetwork.getCharacterNodes().concat(SocialNetwork.getStoryNodes());
        SocialNetwork.edges = SocialNetwork.getActivityEdges();
        break;
    }
    
    SocialNetwork.refreshLegend(document.getElementById("networkNodeGroupSelector").value);

//    SocialNetwork.refresh();
    
    SocialNetwork.nodesDataset = new vis.DataSet(SocialNetwork.nodes);
    SocialNetwork.edgesDataset = new vis.DataSet(SocialNetwork.edges);
    SocialNetwork.redrawAll();
};

SocialNetwork.getCharacterNodes = function () {
    "use strict";
    var groupName = document.getElementById("networkNodeGroupSelector").value;

    var nodes = [];
//    Object.keys(Database.Characters).forEach(
    NetworkSubsetsSelector.getCharacterNames().forEach(
            function (characterName) {
                var character = Database.Characters[characterName];
                nodes.push({
                    id : character.name,
                    // label : name,
                    label : character.name.split(" ").join("\n"),
                    // group: character[groupName]+""
                    group : groupName === "Без групп" ? groupName : groupName
                            + "." + character[groupName]
                // color: SocialNetwork.colorMap[groupName + "." +
                // character[groupName]]
                // group: 0
                });
            });

    // for ( var name in Database.Characters) {
    // nodes.push({
    // id : name,
    // // label : name,
    // label : name.split(" ").join("\n"),
    // group: 0
    // });
    // }
    return nodes;
};

SocialNetwork.getStoryNodes = function () {
    "use strict";
//    var nodes = Object.keys(Database.Stories).map(function (name) {
    var nodes = NetworkSubsetsSelector.getStoryNames().map(function (name) {
        return {
            id : "St:" + name,
            // label : name,
            label : name.split(" ").join("\n"),
            value : Object.keys(Database.Stories[name].characters).length,
            title : Object.keys(Database.Stories[name].characters).length,
            // color : SocialNetwork.colorMap["storyColor"]
            group : "storyColor"
        // color : SocialNetwork.colorMap["storyColor"]
        // group: 1
        };
    });
    return nodes;
};



SocialNetwork.getActivityEdges = function () {
    "use strict";
    var edges = [];
    var edgesCheck = {};
    for ( var name in Database.Stories) {
        var story = Database.Stories[name];
        for ( var char1 in story.characters) {
            for(var activity in story.characters[char1].activity){
                if(SocialNetwork.selectedActivities[activity]){
                    edges.push({
                        from : "St:" + name,
                        to : char1,
                        color : SocialNetwork.activityColors[activity],
                        width: 2,
                        hoverWidth: 4
                    });
                }
                
            }
        }
    }
    return edges;
};

SocialNetwork.getStoryEdges = function () {
    "use strict";
    var edges = [];
    var edgesCheck = {};
    for ( var name in Database.Stories) {
        var story = Database.Stories[name];
        for ( var char1 in story.characters) {
            edges.push({
                from : "St:" + name,
                to : char1,
                color : "grey"
            });
        }
    }
    return edges;
};

SocialNetwork.getSimpleEdges = function () {
    "use strict";
    var edges = [];
    var edgesCheck = {};
    for ( var name in Database.Stories) {
        var story = Database.Stories[name];
        
        story.events.forEach(function (event) {
            for ( var char1 in event.characters) {
                for ( var char2 in event.characters) {
                    if (char1 !== char2 && !edgesCheck[name + char1 + char2] && !edgesCheck[name + char2 + char1]) {
                        edgesCheck[name + char1 + char2] = true;
                        edges.push({
                            from : char1,
                            to : char2,
                            color : "grey"
                        });
                    }
                }
            }
        });
    }
    return edges;
};

SocialNetwork.getDetailedEdges = function () {
    "use strict";
    
    var edgesCheck = {};
    for ( var name in Database.Stories) {
        var story = Database.Stories[name];
        story.events.forEach(function (event) {
            for ( var char1 in event.characters) {
                for ( var char2 in event.characters) {
                    
                    if (char1 !== char2) {
                        if (!edgesCheck[char1 + char2] && !edgesCheck[char2 + char1]) {
                            var obj = {};
                            obj[name] = true;
                            edgesCheck[char1 + char2] = {
                                    value : 1,
                                    from : char1,
                                    to : char2,
                                    title : obj
                            };
                        } else if (edgesCheck[char1 + char2] || edgesCheck[char2 + char1]) {
                            var value = edgesCheck[char1 + char2] ? edgesCheck[char1 + char2] : edgesCheck[char2 + char1];
                            if (!value.title[name]) {
                                value.title[name] = true;
                                value.value++;
                            }
                        }
                    }
                }
            }
        });
    }

    var edges = Object.keys(edgesCheck).map(function (name) {
        var edgeInfo = edgesCheck[name];
        var title = "";
        // var title = edgeInfo.title.join(",");
        var isFirst = true;
        for ( var storyName in edgeInfo.title) {
            title += (isFirst ? "" : ",") + storyName;
            isFirst = false;
        }
        
        return {
            from : edgeInfo.from,
            to : edgeInfo.to,
            title : edgeInfo.value + ":" + title,
            value : edgeInfo.value,
            color : "grey"
        };
    });
    
    return edges;
};

SocialNetwork.redrawAll = function () {
    "use strict";
    var container = document.getElementById('socialNetworkContainer');
    var options = {
        nodes : {
            shape : 'dot',
            scaling : {
                min : 10,
                max : 30,
                label : {
                    min : 8,
                    // min : 4,
                    max : 30,
                    // max : 50,
                    // drawThreshold : 12,
                    drawThreshold : 5,
                    maxVisible : 30
                // maxVisible : 20
                }
            },
            font : {
                // size : 12,
                size : 20,
                face : 'Tahoma'
            }
        },
        edges : {
            width : 0.15,
            color : {
                inherit : 'from'
            },
            smooth : {
//                type : 'continuous'
                type : 'dynamic'
            }
        },
        physics : {
            barnesHut : {
//                gravitationalConstant : -15000
                gravitationalConstant : -30000,
//             gravitationalConstant : -60000
//                springLength: 20,
                springConstant: 0.1
            },
            stabilization : {
//                iterations : 2500
                iterations : 50
            }
        },
        // physics : false,
        // layout : true,
        layout : {
            randomSeed : 1200
        },
        interaction : {
            tooltipDelay : 200,
        // hideEdgesOnDrag : true
        },
        groups : SocialNetwork.groupColors
    };
    var data = {
        nodes : SocialNetwork.nodesDataset,
        edges : SocialNetwork.edgesDataset
    } // Note: data is coming from ./datasources/WorldCup2014.js

    SocialNetwork.network = new vis.Network(container, data, options);
    
//    var options = {
//            manipulation: {
//              enabled: false,
//              initiallyActive: false,
//              addNode: true,
//              addEdge: true,
//              editNode: undefined,
//              editEdge: true,
//              deleteNode: true,
//              deleteEdge: true,
//              controlNodeStyle:{
//                // all node options are valid.
//              }
//            }
//          }
//    
//    SocialNetwork.network.setOptions(options);

//    // get a JSON object
//    SocialNetwork.allNodes = SocialNetwork.nodesDataset.get({
//        returnType : "Object"
//    });

    SocialNetwork.network.on("click", SocialNetwork.neighbourhoodHighlight);
};

SocialNetwork.neighbourhoodHighlight = function (params) {
    "use strict";
    // if something is selected:
    

    // get a JSON object
    var allNodes = SocialNetwork.nodesDataset.get({
        returnType : "Object"
    });

    var network = SocialNetwork.network;
    var nodesDataset = SocialNetwork.nodesDataset;
    if (params.nodes.length > 0) {
        SocialNetwork.highlightActive = true;
        var i, j;
        var selectedNode = params.nodes[0];
        var degrees = 2;
        
//        Object.keys(Database.Characters).forEach(function (characterName) {
//            var character = Database.Characters[characterName];
//            SocialNetwork.nodesDataset.update({
//                id : character.name,
//                label : "",
//                group : "thirdDegreeNode"
//            });
//        });

        // mark all nodes as hard to read.
        for ( var nodeId in allNodes) {
            allNodes[nodeId].color = 'rgba(200,200,200,0.5)';
            if (allNodes[nodeId].hiddenLabel === undefined) {
                allNodes[nodeId].hiddenLabel = allNodes[nodeId].label;
                allNodes[nodeId].label = undefined;
            }
        }
        var firstDegreeNodes = network.getConnectedNodes(selectedNode);
        var secondDegreeNodes = [];
//        var connectedNodes = network.getConnectedNodes(selectedEdge);
//        var allConnectedNodes = [];

        // get the second degree nodes
        for (i = 1; i < degrees; i++) {
            for (j = 0; j < firstDegreeNodes.length; j++) {
                secondDegreeNodes = secondDegreeNodes.concat(network
                        .getConnectedNodes(firstDegreeNodes[j]));
            }
        }

//        secondDegreeNodes.forEach(function (node) {
//            SocialNetwork.nodesDataset.update({
//                id : node,
//                label : node.split(" ").join("\n"),
//                group : "secondDegreeNode"
//            });
//        });
//        
//        firstDegreeNodes.forEach(function (node) {
//            SocialNetwork.nodesDataset.update({
//                id : node,
//                label : node.split(" ").join("\n"),
//                group : "firstDegreeNode"
//            });
//        });
//        
//        SocialNetwork.nodesDataset.update({
//            id : selectedNode,
//            label : selectedNode.split(" ").join("\n"),
//            group : "firstDegreeNode"
//        });
        
        // all second degree nodes get a different color and their label back
        for (i = 0; i < secondDegreeNodes.length; i++) {
            allNodes[secondDegreeNodes[i]].color = 'rgba(150,150,150,0.75)';
            if (allNodes[secondDegreeNodes[i]].hiddenLabel !== undefined) {
                allNodes[secondDegreeNodes[i]].label = allNodes[secondDegreeNodes[i]].hiddenLabel;
                allNodes[secondDegreeNodes[i]].hiddenLabel = undefined;
            }
        }

        // all first degree nodes get their own color and their label back
        for (i = 0; i < firstDegreeNodes.length; i++) {
            allNodes[firstDegreeNodes[i]].color = undefined;
            if (allNodes[firstDegreeNodes[i]].hiddenLabel !== undefined) {
                allNodes[firstDegreeNodes[i]].label = allNodes[firstDegreeNodes[i]].hiddenLabel;
                allNodes[firstDegreeNodes[i]].hiddenLabel = undefined;
            }
        }

        // the main node gets its own color and its label back.
        allNodes[selectedNode].color = undefined;
        if (allNodes[selectedNode].hiddenLabel !== undefined) {
            allNodes[selectedNode].label = allNodes[selectedNode].hiddenLabel;
            allNodes[selectedNode].hiddenLabel = undefined;
        }

    } else if (params.edges.length > 0) {
        SocialNetwork.highlightActive = true;
        var i, j;
        // var selectedNode = params.nodes[0];
        var selectedEdge = params.edges[0];
        var degrees = 2;

        // mark all nodes as hard to read.
        for ( var nodeId in allNodes) {
            allNodes[nodeId].color = 'rgba(200,200,200,0.5)';
            if (allNodes[nodeId].hiddenLabel === undefined) {
                allNodes[nodeId].hiddenLabel = allNodes[nodeId].label;
                allNodes[nodeId].label = undefined;
            }
        }
        var connectedNodes = network.getConnectedNodes(selectedEdge);
        var allConnectedNodes = [];

        // get the second degree nodes
        for (i = 1; i < degrees; i++) {
            for (j = 0; j < connectedNodes.length; j++) {
                allConnectedNodes = allConnectedNodes.concat(network
                        .getConnectedNodes(connectedNodes[j]));
            }
        }

        // all second degree nodes get a different color and their label back
        for (i = 0; i < allConnectedNodes.length; i++) {
            allNodes[allConnectedNodes[i]].color = 'rgba(150,150,150,0.75)';
            if (allNodes[allConnectedNodes[i]].hiddenLabel !== undefined) {
                allNodes[allConnectedNodes[i]].label = allNodes[allConnectedNodes[i]].hiddenLabel;
                allNodes[allConnectedNodes[i]].hiddenLabel = undefined;
            }
        }

        // all first degree nodes get their own color and their label back
        for (i = 0; i < connectedNodes.length; i++) {
            allNodes[connectedNodes[i]].color = undefined;
            if (allNodes[connectedNodes[i]].hiddenLabel !== undefined) {
                allNodes[connectedNodes[i]].label = allNodes[connectedNodes[i]].hiddenLabel;
                allNodes[connectedNodes[i]].hiddenLabel = undefined;
            }
        }

        // // the main node gets its own color and its label back.
        // allNodes[selectedNode].color = undefined;
        // if (allNodes[selectedNode].hiddenLabel !== undefined) {
        // allNodes[selectedNode].label = allNodes[selectedNode].hiddenLabel;
        // allNodes[selectedNode].hiddenLabel = undefined;
        // }

    } else if (SocialNetwork.highlightActive === true) {
        // reset all nodes
        for ( var nodeId in allNodes) {
            allNodes[nodeId].color = undefined;
            if (allNodes[nodeId].hiddenLabel !== undefined) {
                allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
                allNodes[nodeId].hiddenLabel = undefined;
            }
        }
        SocialNetwork.highlightActive = false;
    }

    // transform the object into an array
    var updateArray = [];
    for (nodeId in allNodes) {
        if (allNodes.hasOwnProperty(nodeId)) {
            updateArray.push(allNodes[nodeId]);
        }
    }
    nodesDataset.update(updateArray);
};

SocialNetwork.hidePanel = function () {
    document.getElementById("commonSettingsContainer").className = "storySelectorContainer hidden";
    document.getElementById("privateSettingsContainer").className = "storySelectorContainer hidden";
    document.getElementById("showSettingsButtonContainer").className = "storySelectorContainer2";
};

SocialNetwork.showPanel = function () {
    document.getElementById("commonSettingsContainer").className = "storySelectorContainer";
    document.getElementById("privateSettingsContainer").className = "storySelectorContainer";
    document.getElementById("showSettingsButtonContainer").className = "storySelectorContainer2 hidden";
};