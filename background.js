importScripts("/engine/inicialize.js");
importScripts("/engine/translate.js");

let langArrEleOptions={items:[]};
let progressLoading=0;
let fullDev=true;

let 
    dev=true,
    loadedLangs=-1, //-1 nothing, 0 = staring, 1=downloaded
    // Page rules [Unknown=-1, Disabled=0, Enabled=1]
    pageRules=[],

    // Settings
    selectedLang=0, 
    autoTranslate=false, // Default disabled or enabled
    transcription="default", 
    allTranslates=false,
    liveSubTitles=true,
    areaTranslations="default",
    mouseContext=true,
    activated=true,
    systemLang="default",
    theme="default",
    themeColor=210;

// load
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (dev) console.log("Received", request);

    if (loadedLangs==-1) {
        LoadSettings();
        init();
    }

    if (request.receiver=="background") {
        let command=request.command;
        let data=request.data;

        // Popup needs settings
        if (command=="settings_get") {
            SendSettings();
        } 
        if (command=="settings_set") {
            SetSettingsFromPopup(data);
            SaveSettings();
        } 
        if (command == "translate_simpleDimpleAll") {
            if (activated){
                let translatedBody=Translate(data.body);
                let translatedTitle=Translate(data.title);
                
                //console.log(data.body, translatedBody);
               // console.log(data.title, translatedTitle);
                
                SendTranslate(translatedBody, translatedTitle);
            }else{

            }
        }
    }
});

/* Contex menu*/
chrome.runtime.onInstalled.addListener(() => {
    if (activated) {
        if (mouseContext){
            chrome.contextMenus.create({title: 'Přeložit označený text', id: 'TCS', contexts: ['selection']});
        }
       // chrome.contextMenus.create({title: 'Označený text odeslat do MP', id: 'TCSs', contexts: ['selection']});
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    let getSelectedText = function () {
        return window.getSelection().toString();
    }

    if (activated) {
        if (mouseContext){
            if (info.menuItemId === 'TCS') {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: getSelectedText
                }, (results) => {
                    if (results && results[0]) {
                    const selectedText = results[0].result;
                    TranslateSelectedText(selectedText, tab);
                    }
                });
            }
            if (info.menuItemId === 'TCSs') {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: getSelectedText
                }, (results) => {
                    if (results && results[0]) {
                        const selectedText = results[0].result;
                        let enscape=encodeURIComponent(selectedText);
                        OpenPage("https://geftgames.github.io/moravskyprekladac/?translate&lang="+selectedLang+"&input="+enscape,tab)
                    }
                });
            }
        }
    }
});

// Send selected translated text
function TranslateSelectedText(string, tab){
    let translatedText=Translate(string);

    let json={ 
        command: "translateSelected",
        sender: "background",
        receiver: "content",
        data: { 
            selected: translatedText, 
        }
    };

    if (dev)console.log("sending translateSelected", json);
      
    chrome.tabs.sendMessage(tab.id, json);
}

// Send open page
function OpenPage(url, tab){
    let json={ 
        command: "openPage",
        sender: "background",
        receiver: "content",
        data: { 
            url: url, 
        }
    };
     
    chrome.tabs.sendMessage(tab.id, json);
}

// Settings
function SaveSettings() {
    if (dev) console.log("Saving settings");
    let json={};
    json.SelectedLang =selectedLang;
    json.Activated=activated;
    json.AutoTranslate=autoTranslate;
    json.Transcription=transcription;
    json.AllTranslates=allTranslates;
    json.Theme=theme;
    json.ThemeColor=themeColor;
    json.SystemLang=systemLang;
    json.MouseContext=mouseContext;
    json.LiveSubTitles=liveSubTitles;

    chrome.storage.local.set({'Settings': JSON.stringify(json)});
}

function LoadSettings() {
    if (dev) console.log("Loading settings");
    
    chrome.storage.local.get('Settings', function(result) {
        console.log("Setting loaded", result);
        if (result.Settings) {
            let json=JSON.parse(result.Settings);
            
            selectedLang =json.SelectedLang;
            activated=json.Activated;
            transcription=json.Transcription;
            autoTranslate=json.AutoTranslate;
            areaTranslations=json.AreaTranslations;
            mouseContext=json.MouseContext;
            liveSubTitles=json.LiveSubTitles;
            allTranslates=json.AllTranslates;
            themeColor=json.ThemeColor;
            theme=json.Theme;
            systemLang=json.SystemLang;
        } else {
            console.warn("No settings found");
        }
    });    
}

function SavePageRules() {
    chrome.storage.local.set({'Settings': JSON.stringify(pageRules)});
}

function LoadPageRules() {
    chrome.storage.local.get('PageRules', function(result){
        pageRules=JSON.parse(result);
    });
}

// Get current page rule
function GetCurrentPageRule(url){
    for (let rule of pageRules){
        if (rule.Url==url) {
            return rule.rule;
        }
    }
    return -1;
}

// Edit page rule
function EditPageRule(newRule, url) {
    // Find existing
    let existingRule;
    for (let rule of pageRules){
        if (rule.Url==url) {
            existingRule=rule;
            break;
        }
    }

    if (existingRule!=undefined) {
        if (newRule) existingRule.Rule="1";
        else existingRule.Rule="0";
    } else {
        // Add new
        pageRules.push({Url: url, Rule: newRule});
    }
}

// Send Translated to content (current page)
function SendTranslate(translatedBody, translatedTitle) {
    
    let json={ 
        command: "translate_simpleDimpleAll",
        sender: "background",
        receiver: "content",
        data: { 
            body: translatedBody, 
            title: translatedTitle
        }
    };

    if (dev)console.log("sending translate_simpleDimpleAll", json);
    
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, json);
    });
}

function SendSettings() {
    
    let json={};
    
    json.SelectedLang=selectedLang;
    json.Activated=activated;
    json.AutoTranslate=autoTranslate;
    json.Transcription=transcription;
    json.AllTranslates= allTranslates;
    json.LiveSubTitles=liveSubTitles,
    json.AreaTranslations=areaTranslations,
    json.MouseContext=mouseContext;
    json.ThemeColor =themeColor;
    json.CurrentPageRule=GetCurrentPageRule("");
    json.Langs      =langArrEleOptions.items;
    json.SystemLang=systemLang;
    json.Theme      =theme;
    
    chrome.runtime.sendMessage({
        command: "settings_set_popup",
        sender: "background",
        receiver: "popup",
        data: json,
    })
    if (dev)console.log("sending settings", json);
}

function SetSettingsFromPopup(jsonData) {   
    selectedLang =jsonData.SelectedLang;
    activated   =jsonData.Activated;
    autoTranslate=jsonData.AutoTranslate;
    transcription=jsonData.Transcription;
    areaTranslations=jsonData.AreaTranslations,
    allTranslates=jsonData.AllTranslates;
    mouseContext =jsonData.MouseContext;
    liveSubTitles=jsonData.LiveSubTitles,
    themeColor   =jsonData.ThemeColor;
    theme        =jsonData.Theme;
    systemLang   =jsonData.SystemLang;
    if (dev)console.log("seting settings", jsonData);
}

// Send loading...
function SendLoading() {    
    let json={
        State: loadedLangs,
        Progress: progressLoading
    }; 

    chrome.runtime.sendMessage({
        command: "loading",
        sender: "background",
        receiver: "popup",
        data: json,
    })
    if (dev)console.log("sending loading", json);
}

function Translate(string) {
    if (currentLang==undefined) return string;

    let translated=currentLang.Translate(string);
    
    if (translated==null) return string;
    if (translated==undefined) return string;

    return translated;
}

// Send Not active
function SendNotActive() {
    
    let json={ 
        command: "activated",
        sender: "background",
        receiver: "content",
        data: activated
    };
    
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, json);
    });
}