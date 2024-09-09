const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') >= 0;
if (isFirefox) {
    console.log("firefox");
    var chrome=browser;

    let importScripts=function(src){
        var script = document.createElement('script');
        script.src = src;
        document.head.appendChild(script);
    }

    importScripts('/engine/inicialize.js');
    importScripts('/engine/translate.js');
}else{
    importScripts("/engine/inicialize.js");
    importScripts("/engine/translate.js");
}

// Keep running! otherwise loading again and again whole translations, thats it's slow
// Code on service worker
/* not working
const pingInterval = setInterval(() => {
    chrome.tabs.query(filter, function (tabs) {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {"status": "ping"});
        });
    });
  }, 10000); // Ping every 10 seconds
*/

var langArrEleOptions={items:[]};
var progressLoading=0;
const fullDev=false;

var 
    dev=true,
    loadedLangs=-1, //-1 nothing, 0 = staring, 1=downloaded
    // Page rules [Unknown=-1, Disabled=0, Enabled=1]
    pageRules=[], // item: {Rule: "0"/"1", Url: string}
    domainRules=[], // item: {Rule: "0"/"1", Url: string}
    sendingLoading=false,

    // Settings
    selectedLang=0, 
    autoTranslate=false, // Default disabled or enabled
    transcriptionType="czech", 
    allTranslates=false,
   // liveSubTitles=true,
    areaTranslations="default",
    mouseContext=true,
    defaultRule=true,
    activated=true,
    systemLang="default",
    theme="default",
    translateMethod="default",
    translateOnlyCSSites=true,
    themeColor=210;

//#region Main events
// activeted
self.addEventListener('activate', event => {
    if (dev)console.log("activating");
    if (loadedLangs==-1) {
        LoadSettings();
        LoadPageRules();
        translator_init();
    }
});

// unloading
chrome.runtime.onSuspend.addListener(function() {
    if (dev)console.log("Unloading...");
});

// get messages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (dev) console.log("Received", request);  

    if (request.receiver=="background") {  
        let command=request.command;
        let data=request.data;

        if (loadedLangs<1){
            if (!sendingLoading){
                if (loadedLangs==-1) {
                    LoadSettings();
                    LoadPageRules();
                    translator_init();
                }
                SendLoadingTillLoaded();
                sendingLoading=true;
            }
        } else {
            // Popup needs settings
            if (command=="settings_get") {
                if (loadedLangs==1) {
                    SendSettings();
                    SendPageRule();
                }
            }
            if (command=="settings_set") {
                if (loadedLangs==1) {
                    let activatedBefore=activated;
                    SetSettingsFromPopup(data);
                    SaveSettings();

                    let allTabs=activated && !activatedBefore;
                    SendContentSetting(undefined, allTabs);
                }
            } 
            if (command=="setting_get_content"){
                SendContentSetting(data.url);
            }            
            if (command=="pagerule_set") {
                if (activated){
                    if (loadedLangs==1) {
                        EditPageRule(data.pageRule, data.url);
                        //EditDomainRule(data.CurrentDomainRule, data.url)
                        SavePageRules();
                    }
                }
            }            
            if (command=="translate_simpleDimpleAll" || command == "translate_textNodeId") {
                if (activated) {
                    if (loadedLangs==1) {
                        if (data.url==undefined) consolw.warn("data.url is undefined");
                        let rule=GetCurrentPageRule(data.url);
                        if (rule || (rule==undefined && defaultRule)) {
                            if (command == "translate_simpleDimpleAll"){
                                let translatedBody=Translate(data.body);
                                let translatedTitle=Translate(data.title);
                                
                                SendTranslate_simpleDimpleAll(translatedBody, translatedTitle);
                            } else if (command == "translate_textNodeId"){
                                let translatedTexts=[];
                                for (let str of data.strings) {
                                    translatedTexts.push({text: Translate(str.text), id: str.id});
                                }
                                let translatedTitle=Translate(data.title);
                                
                                SendTranslate_textNodeId(translatedTexts, translatedTitle);
                            } else console.error("unknown command");
                        } else console.log("Site "+data.url+" is disabled for translating, change settings", {rule: rule, autoTranslate: autoTranslate});
                    }
                }else{
                    SendNotActive();
                }
            }
        }        
    }
});
//#endregion

//#region Contex menu
chrome.runtime.onInstalled.addListener(() => {
    if (activated) {
        if (mouseContext) {
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
            //console.log(info.menuItemId);
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
            /*if (info.menuItemId === 'TCSs') {
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
            }*/
        }
    }
});
//#endregion

//#region Settings
function GetJsonSettings() {
    return {
        SelectedLang: selectedLang,
        Activated: activated,
        AutoTranslate: autoTranslate,
        Transcription: transcriptionType,
        AllTranslates: allTranslates,
        TranslateMethod: translateMethod,
        Theme: theme,
        ThemeColor: themeColor,
        SystemLang: systemLang,
        MouseContext: mouseContext,
       // LiveSubTitles: liveSubTitles
        DefaultRule: defaultRule,
        TranslateOnlyCSSites: translateOnlyCSSites,
    };
}

function LoadJsonSettings(json) {
    selectedLang =json.SelectedLang;
    activated=json.Activated;
    transcriptionType=json.Transcription;
    autoTranslate=json.AutoTranslate;
    areaTranslations=json.AreaTranslations;
    mouseContext=json.MouseContext;
    //liveSubTitles=json.LiveSubTitles;
    allTranslates=json.AllTranslates;
    themeColor=json.ThemeColor;
    theme=json.Theme;
    systemLang=json.SystemLang;
    translateMethod=json.TranslateMethod;
    defaultRule=json.DefaultRule;
    translateOnlyCSSites=json.TranslateOnlyCSSites;
}

function SaveSettings() {
    if (dev) console.log("Saving settings");
    chrome.storage.local.set({'Settings': JSON.stringify(GetJsonSettings())});
}

function LoadSettings() {
    if (dev) console.log("Loading settings");
    
    chrome.storage.local.get('Settings', function(result) {
        if (result.Settings) {
            let json=JSON.parse(result.Settings);
            LoadJsonSettings(json);            
            transcription = SetCurrentTranscription(transcriptionType);
        } else {
            console.warn("No settings found");
        }
    });    
}

function SavePageRules() {
    if (dev) console.log("saving pagerules...",JSON.stringify(pageRules));
    chrome.storage.local.set({'PageRules': JSON.stringify(pageRules)});
}

function LoadPageRules() {
    if (dev) console.log("Loading pageRules...");
    chrome.storage.local.get('PageRules', function(result) {
        if (result.PageRules) {
            pageRules=JSON.parse(result.PageRules);
            if (dev) console.log("pageRules loaded", result.PageRules);
        } else if (dev) console.log("pageRules are not loaded, empty value ", result.PageRules);
    });
   /* chrome.storage.local.get('DomainRules', function(result) {
        if (result.DomainRules) {
            domainRules=JSON.parse(result.DomainRules);
            if (dev) console.log("DomainRules loaded", result.DomainRules);
        } else if (dev) console.log("DomainRules are not loaded, empty value ", result.DomainRules);
    });*/
}

// send content settings
function SendContentSetting(url, all) {    
    if (dev && url==undefined) console.warn("url is undefined");
    let json={ 
        command: "settings_cnt",
        sender: "background",
        receiver: "content",
        data: { 
            Url: url, // if it's really that site
            TranslateMethod: translateMethod, // for translate requests
            Activated: activated, // enable
            AutoTranslate: autoTranslate,
            PageRule: GetCurrentPageRule(url),
            DefaultRule: defaultRule,
            TranslateOnlyCSSites: translateOnlyCSSites
        }
    };


    if (dev)console.log("sending setting to content", json);
    
    let filter={active: true, currentWindow: true};
    if (all) filter={};
    chrome.tabs.query(filter, function (tabs) {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, json);
            console.log("send refresh ",tab.url);
        });
    });
}
//#endregion

//#region Page rules
function GetCurrentPageRule(url) {
    if (dev && url==undefined) console.warn("function 'GetCurrentPageRule' has unknown url!");
    for (let rule of pageRules) {
        if (rule.Url==url) {
          //  console.log("pageRules", pageRules, "url", url, "rule",rule);
            return rule.Rule;
        }
    }
   // console.log("pageRules", pageRules, "url", url, "no");
    return null;
}

// Edit page rule
function EditPageRule(newRule, url) {
    console.log("set url ", url, " to ", newRule);
    // Find existing
    let existingRule;
    for (let rule of pageRules) {
        if (rule.Url==url) {
            existingRule=rule;
            break;
        }
    };

    if (existingRule!=undefined) {
        if (newRule) existingRule.Rule=true;
        else existingRule.Rule=false;
    } else {
        // Add new
        pageRules.push({Url: url, Rule: newRule});
    }
}

function SendPageRule(){
    chrome.tabs.query({active:true,currentWindow:true}, function(tab){
        //Be aware that `tab` is an array of Tabs 
        let currentUrl=tab[0].url;
        if (currentUrl==undefined) consolw.warn("currentUrl is undefined");
        chrome.runtime.sendMessage({
            command: "pagerule",
            sender: "background",
            receiver: "popup",
            data: {
                url:  currentUrl,
                pageRule: GetCurrentPageRule(currentUrl),
                //  domainRule: GetCurrentDomainRule(currentUrl.origin)
            },
        });

      //  console.log("send pagerule", currentUrl, GetCurrentPageRule(currentUrl));
    });
}
//#endregion

//#region Send Translated to content (current page)
function SendTranslate_simpleDimpleAll(translatedBody, translatedTitle) {    
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

function SendTranslate_textNodeId(strings, translatedTitle) {    
    let json={ 
        command: "translate_textNodeId",
        sender: "background",
        receiver: "content",
        data: { 
            strings: strings, 
            title: translatedTitle
        }
    };

    if (dev)console.log("sending translate_textNodeId", json);
    
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, json);
    });
}
//#endregion

//#region Popup settings
function SendSettings() {    
    let json=GetJsonSettings();
    json.Langs=langArrEleOptions;
    json.LanguagesList=[];
    for (let l of languagesList) {
        if (!isNaN(l.locationX)) json.LanguagesList.push({Name: l.Name, locationX: l.locationX, locationY: l.locationY, Quality: l.Quality, id: l.id, ColorFillStyle: l.ColorFillStyle, ColorStrokeStyle: l.ColorStrokeStyle});
    }
    chrome.runtime.sendMessage({
        command: "settings_set_popup",
        sender: "background",
        receiver: "popup",
        data: json,
    });
    if (dev)console.log("sending settings", json);
}

function SetSettingsFromPopup(jsonData) {  
    LoadJsonSettings(jsonData);    
    transcription = SetCurrentTranscription(transcriptionType);
    if (dev) console.log("seting settings", jsonData);
}
//#endregion

//#region Send still loading
function SendLoadingTillLoaded(){
    let timerLoading = setInterval(tickLoading, 100);

    function tickLoading(){
        SendLoading();
        if (loadedLangs==1) clearInterval(timerLoading);
    }
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
//#endregion

function Translate(string) {
    let currentLang=undefined;

    for (let lang of languagesList){
        if (lang.id==selectedLang){
            currentLang=lang;
            break;
        }
    }

    if (currentLang==undefined) {
        console.warn("currentLang is undefined!");
        return string;
    }

    let translated=currentLang.Translate(string);
    
    if (translated==null || translated==undefined) {
        console.warn("translated is null or undefined!");
        return string;
    }

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
function OpenPage(url, tab) {
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

function SendMessageToContent(tabUrl, command, data) {    
    let json={ 
        command: command,
        sender: "background",
        receiver: "content",
        data: data
    };

    if (dev) console.log("Sending mesage to content...", json);
    
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        for (let tab of tabs) {
            if (tab.url==tabUrl){
                chrome.tabs.sendMessage(tab.id, json);
                return;
            }
        }
        if (dev) console.error("Couldn't find tag of url ", url);     
    });
}

/*
function TestSaveObject(){
    let input=languagesList[0];
    console.log("input: ", input);

    let saved=SaveObject(input);
    console.log("saved: ", saved);

    let loaded=LoadObject(saved);
    console.log("loaded", loaded);
}

function SaveObject(obj) {
    // Prototype
    if (typeof obj == "number" || typeof obj == "string" || typeof obj == "boolean" || typeof obj == "undefined") return obj;

    // Array
    else if (Array.isArray(obj)) {
        let json=[];
        for (let i of obj) {            
            json.push(SaveObject(i));
        }
        return json;

    } else if (obj==null) {
        return null;
    
    // my class
    } else {
        console.log(obj.constructor.name);
        let saveData={};
        saveData.Type=obj.constructor.name;
        console.log(Object.keys(obj));
        for (let i of Object.keys(obj)){
            saveData[i]=SaveObject(obj[i]);
        }

        return saveData;
    }
    return null;
}

function LoadObject(json) {
    // Prototype
    if (typeof json == "number" || typeof json == "string" || typeof json == "boolean" || typeof json == "undefined") return json;

    // Array
    else if (Array.isArray(json)){
        let obj=[];
        for (let i of json) {            
            obj.push(LoadObject(i));
        }

    // my class
    } else {
        console.log(json.Type);
        let obj=new this[json.Type]();
        
        for (let key of json){
            if (key!="Type"){
                obj[key]=LoadObject(json[key]);
            }
        }

        return obj;
    }
    return null;
}*/