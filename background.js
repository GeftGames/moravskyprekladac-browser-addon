let 
    dev=true,

    // Page rules [Unknown=-1, Disabled=0, Enabled=1]
    pageRules=[], 

    // Settings
    selectedLang="Lanžhot", 
    autoTranslate=false, // Default disabled or enabled
    transcription="default", 
    allTranslates=false,
    liveSubTitles=true,
    areaTranslations="default",
    mouseContext=true,
    theme="default",
    themeColor=50;

// load
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (dev) console.log("Received", request);

    if (request.receiver=="background") {
        let command=request.command;
        let data=request.data;

        // Popup needs settings
        if (command=="get_settings") {
            SendSettings();
        } 
        if (command == "translate_simpleDimpleAll") {
            let translatedBody=Translate(data.body);
            let translatedTitle=Translate(data.title);
        
            SendTranslate(translatedBody, translatedTitle);
        }
    }
});

function SaveSettings() {
    let json={};
    json.SelectedLang =selectedLang;
    json.AutoTranslate=autoTranslate;
    json.Transcription=transcription;
    json.AllTranslates=allTranslates;
    json.Theme=theme;
    json.ThemeColor=themeColor;

    localStorage.setItem('Settings', JSON.stringify(json));
}

function LoadSettings() {
    let rawJson = localStorage.getItem('Settings');
    let json=JSON.parse(rawJson);

    selectedLang =json.SelectedLang;
    autoTranslate=json.AutoTranslate;
    transcription=json.Transcription;
    allTranslates=json.AllTranslates;
    themeColor=json.ThemeColor;
    theme=json.Theme;
}

function SavePageRules() {
    localStorage.setItem('PageRules', JSON.stringify(pageRules));
}

function LoadPageRules() {
    let rawPageRules = localStorage.getItem('PageRules');
 
    pageRules=JSON.parse(rawPageRules);
}

// Get current page rule
function GetCurrentPageRule(url){
    for (let rule of pageRules){
        if (rule.Url==url) {
            return rule.rule;
            break;
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

// Send Translated to contend (current page)
function SendTranslate(translatedBody, translatedTitle) {
    if (dev)console.log("sending translate_simpleDimpleAll");

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, 
        { 
            command: "translate_simpleDimpleAll",
            sender: "background",
            receiver: "content",
            data: { 
                body: translatedBody, 
                title: translatedTitle
            }
        });
    });
}

function SendSettings() {
    
    let json={};
    
    json.SelectedLang=selectedLang;
    json.AutoTranslate=autoTranslate;
    json.Transcription=transcription;
    json.AllTranslates= allTranslates;
    json.LiveSubTitles=liveSubTitles,
    json.AreaTranslations=areaTranslations,
    json.MouseContext=mouseContext;
    json.CurrentPageRule=GetCurrentPageRule("");
    
    chrome.runtime.sendMessage({
        command: "settings",
        sender: "background",
        receiver: "popup",
        data: json,
    })
    if (dev)console.log("sending settings", json);
}

function Translate(string){

    return string.replaceAll("ú", "u");
}