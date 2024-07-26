const dev=true;

var translated=false; //if it's site changes
var translatedTexts=[];

// Settings
var autoTranslate,
    activated,
    translateMethod,
    pageRule;

const translatePeriod=1000;
var timerLiveTranslate=null;
let ignoreSites=[
    "edge:",
    "chrome:",
    "firefox:"
];

//#region Main events
// html loaded
window.addEventListener("load", function() {
    if (dev) console.log("moravskyprekladac showed in action!");   
    handlerMessages();

    getSettings();

    if (autoTranslate) {
        timerLiveTranslate=setInterval(LiveTranslateJob, translatePeriod);
    }
});

// receive all messages from background
function handlerMessages() {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (dev) console.log("Get message", request);
        if (request.receiver == 'content') {
            let data=request.data;
            
            if (activated) {
                if (request.command == 'translate_simpleDimpleAll') {
                    ChangePageSimpleDimpleAll(data);
                    translated=true;
                }
                if (request.command == 'translate_textNodeId') {
                    TextNodesForAtributes(data.strings);
                    document.title=data.title;
                    if (dev) console.log("Translated!");
                    translated=true;
                }
                if (request.command == 'translateSelected') {
                    ShowTranslatedText(data.selected);
                }
                if (request.command == 'openPage') {
                    console.log("opening page");
                    window.open(data.url, '_blank').focus();
                }
            }
           
            if (request.command == 'activated') {
                activated=data;
            }

            if (request.command == "settings_cnt") {
                LoadSettingsCnt(data);
                console.log("settings_cnt",activated,pageRule);
                if (activated && pageRule) {
                    if (!ignoreSites.includes(window.location.protocol)) {
                        SendNeedToTranslate();
                    }
                }
            }
        }
    })
}

function LiveTranslateJob() {
    if (activated) SendNeedToTranslate();
}
//#endregion

//#region Settings
// Send to background i need settings
function getSettings() {
    chrome.runtime.sendMessage({
        command: "setting_get_content",
        sender: "content",
        receiver: "background",
        data: {
            url: document.location.toString(),
        }
    });
    console.log("Send request of setting");
}

function LoadSettingsCnt(data) {
    translateMethod=data.TranslateMethod;
    activated=data.Activated;
    autoTranslate=data.AutoTranslate;
    pageRule=data.PageRule;
    defaultRule=data.DefaultRule;
    if (pageRule==null) pageRule=defaultRule;
}
//#endregion
    
//#region translate simpleDimpleAll
// Send to background
function SendNeedToTranslate_simpleDimpleAll() {
    chrome.runtime.sendMessage({
        command: "translate_simpleDimpleAll",
        sender: "content",
        receiver: "background",
        data: {
            body: document.body.innerHTML,
            title: document.title,
            url: document.location.toString(),
        }
    });
    console.log("Send request of web translate");
}

// Set translated text to page
function ChangePageSimpleDimpleAll(data) {
    if (dev) console.log("shitting your site", data);
    if (data.body!=undefined)document.body.innerHTML=data.body;

    if (data.title!=undefined) document.title=data.title;
}
//#endregion

//#region translate textnodeId function
// Send to background textNodeId translate
function SendNeedToTranslate_textNodeId() {
    let strings=TextNodesAddIds();
    if (strings.length==0) return;
    chrome.runtime.sendMessage({
        command: "translate_textNodeId",
        sender: "content",
        receiver: "background",
        data: {
            strings: strings,
            title: document.title,
            url: document.location.toString(),
        }
    });
    console.log("Send request of web translate");
}

const ignoreTextChars = ["\n", "\t", " ", "•", "|", "(", ")", "[", "]","1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ":", ";", ",", ".", " ", "↑"];
function onlyConsistsOf(str) {
    for (let char of str.split('')) {
        if (!ignoreTextChars.includes(char)) {
            return false;
        }
    }
    return true;
}

// Assign ids
function TextNodesAddIds() {   
    let strings=[];
    // get all textNodes
    let allTextNodes=textNodesUnder(document.body);
    
    let id=DatabaseTranslatedTextMaxId()+1;

    // foreach all textNodes, prepare text for translator
    for (let node of allTextNodes) {
        if (!onlyConsistsOf(node.nodeValue)) {
            let inDatabase=DatabaseTranslatedTextGet(node.motrId);

            // not translated, not in database of translated texts
            if (inDatabase==null) {
                node.motrId=id;
                strings.push({id: id, text: node.nodeValue});

                translatedTexts.push({
                     Id: id,
                     OriginalText: node.nodeValue,
                     Status: "waintingFotTranslate"
                 });

                id++;

            // text changed?
            } 
            //else if (inDatabase.translatedText!=node.nodeValue) {
            //    strings.push({id: id, text: node.nodeValue});
            //}
        }
    }
    return strings;
}

// set texts to textnodes
function TextNodesForAtributes(strings) {
    // get all textNodes
    let allTextNodes=textNodesUnder(document.body);

    // foreach all textNodes
    for (let node of allTextNodes) {
        let motrId=node.motrId;
        //console.log(motrId, node.nodeValue, str.text);
        if (motrId==undefined) continue;
        // same id => replace text
        for (let str of strings) {
            if (str.id==motrId) {
                node.nodeValue=str.text;
                
                // set values in dabase of translated texts
                let v=DatabaseTranslatedTextGet(motrId);
                v.status="translated";
                v.TranslatedText=str.text;
                break;
            }
        }        
    }
}

// get all textnodes
function textNodesUnder(el) {
    const children = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode: function(node) {
            // Skip empty text nodes and nodes with only whitespace
            if (!node.nodeValue.trim()) {
                return NodeFilter.FILTER_REJECT;
            }
            
            // Skip script and style nodes
            if (node.parentNode.nodeName === 'SCRIPT' || node.parentNode.nodeName === 'STYLE') {
                return NodeFilter.FILTER_REJECT;
            }
            
            // Accept all other text nodes
            return NodeFilter.FILTER_ACCEPT;
        }
    });
    while(walker.nextNode()) {
        children.push(walker.currentNode);
    }
    return children;
}
//#endregion

function ShowTranslatedText(text) {
    alert(text);
}

// Send need to translate
function SendNeedToTranslate() {
    // translate all document.body and replace document.body
    if (translateMethod=="simpleDimpleAll") {
        SendNeedToTranslate_simpleDimpleAll();

    // assign ids to all textnodes and get textnodes's text and then look up textnode of text id
    } else if (translateMethod=="textNodeId") {
        SendNeedToTranslate_textNodeId();

    // default type
    } else SendNeedToTranslate_simpleDimpleAll();
}

//#region DatabaseTranslatedText TextNodeIds
function DatabaseTranslatedTextGet(id) {
    for (let trText of translatedTexts){
        if (trText.Id==id) return trText;
    }
    return null;
}

// Get max id
function DatabaseTranslatedTextMaxId() {
    let max=-1;
    for (let trText of translatedTexts){
        if (trText.id>max) max=trText.id;
    }
    return max;
}

function DatabaseTranslatedTextAdd(text, translatedText, id, status) {
    translatedTexts.push({
       // Time: Date.now(),
        Id: id,
        OriginalText: text,
        TranslatedText: translatedText,
        Status: status // WaitingForTranslate or Translated
    });
}
//#endregion