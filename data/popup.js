var dev=true;
var languagesList=[]; // for map

let selectedLang, 
    autoTranslate, 
    transcription, 
    translateAreas,
    allTranslates,
    systemLang,
    themeColor,
    theme,
    activated,
    langs,
    liveSubTitles,
    mouseContext,

    currentPageRule,
    
    statePopUp="loading"; // Loading,...

// Load
document.addEventListener('DOMContentLoaded', function() {
    // register receiveing info
    receviederHandler();

    // Load page settings
    GetSettings();
   
    // changed language of current page
    document.getElementById("settingCurrentLang").addEventListener('click', function() {
        let lang=document.getElementById("settingCurrentLang").value;
        selectedLang=lang;
        SendChangedSettings();
    });

    // changed rule of translating of current page
    document.getElementById("settingPageRule").addEventListener('click', function() {
        let rule=document.getElementById("settingPageRule").checked;
        currentPageRule=rule;
        SendChangedSettings();
    });
    
    // --- More settings --- //

    // Auto translate
    document.getElementById("settingAutoTranslate").addEventListener('click', function() {
        let rule=document.getElementById("settingAutoTranslate").checked;
        autoTranslate=rule;
        SendChangedSettings();
    });
    
    // Areas of translations
    document.getElementById("settingAreas").addEventListener('click', function() {
        let rule=document.getElementById("settingAreas").value;
        translateAreas=rule;
        SendChangedSettings();
    });
    
    // All translations
    document.getElementById("settingAlltranslation").addEventListener('click', function() {
        let rule=document.getElementById("settingAlltranslation").checked;
        allTranslates=rule;
        SendChangedSettings();
    });
    
    // transcription
    document.getElementById("settingTranscription").addEventListener('click', function() {
        let rule=document.getElementById("settingTranscription").value;
        transcription=rule;
        SendChangedSettings();
    }); 
    
    // theme color
    document.getElementById("settingColor").addEventListener('click', function() {
        let rule=document.getElementById("settingColor").value;
        themeColor=rule;
        SendChangedSettings();
        SetThemeColors();
    });

    // theme
    document.getElementById("settingTheme").addEventListener('click', function() {
        let rule=document.getElementById("settingTheme").value;
        theme=rule;
        SendChangedSettings();
        SetThemeColors();
    });

    // activated
    document.getElementById("settingActive").addEventListener('click', function() {
        let rule=document.getElementById("settingActive").checked;
        activated=rule;
        console.log("Set active to" ,activated);
        SendChangedSettings();
        SetThemeColors();
    });

    // live subs
    document.getElementById("settingsLiveSubs").addEventListener('click', function() {
        let rule=document.getElementById("settingsLiveSubs").checked;
        liveSubTitles=rule;
        console.log("Set active to", liveSubTitles);
        SendChangedSettings();
    });

    // mouse contex
    document.getElementById("settingsMouseContex").addEventListener('click', function() {
        let rule=document.getElementById("settingsMouseContex").checked;
        mouseContext=rule;
        console.log("mouseContext to", mouseContext);
        SendChangedSettings();
    });
    
    
    // Add bts events
    document.getElementById("btmMoreSettings").addEventListener('click', function() {SwitchPage("MoreSettings")});
    document.getElementById("btnShowMap").addEventListener('click', function() {SwitchPage("Map")});
    document.getElementById("btnGoBack").addEventListener('click', function() {SwitchPage("Basic")});
    document.getElementById("btnGoBack2").addEventListener('click', function() {SwitchPage("Basic")});
});

// Apply loaded settings
function ApplySettings(){
    document.getElementById("settingPageRule").checked=currentPageRule;
    document.getElementById("settingCurrentLang").value=selectedLang;
    // >>> selected map point

    // More info
    document.getElementById("settingActive").checked=activated;
    
    document.getElementById("settingAutoTranslate").checked=autoTranslate;
    document.getElementById("settingAreas").checked=translateAreas;
    document.getElementById("settingAlltranslation").checked=allTranslates;
    document.getElementById("settingTranscription").checked=transcription;

    document.getElementById("settingColor").value=themeColor;
    document.getElementById("settingSystemLang").value=systemLang;
    document.getElementById("settingTheme").value=theme;

    SetThemeColors();
}

// Switch page
const pages=["Loading", "Basic", "Map", "MoreSettings"];
let lastPage="Loading";

function SwitchPage(newPage) {
    let pageLast=document.getElementById("page"+lastPage);
    if (pageLast==undefined) throw new Exception("Unknown pageLast: "+pageLast);
     
    let pageEle=document.getElementById("page"+newPage);
    if (pageEle==undefined) throw new Exception("Unknown pageEle: "+pageEle);

    pageEle.style.display="block";
    pageLast.style.display="none";

    lastPage=newPage;
}

// Load & save setting
function LoadSettings(json) {
    selectedLang =json.SelectedLang;
    autoTranslate=json.AutoTranslate;
    transcription=json.Transcription;
    allTranslates=json.AllTranslates;
    translateAreas=json.TranslateAreas;
    themeColor=json.ThemeColor;
    systemLang=json.SystemLang;
    theme=json.Theme;
    activated=json.Activated;
    currentPageRule=json.CurrentPageRule;

    //langs=json.Langs;
}

// Get settings from background page
function GetSettings() {
    console.log("settings_get");
    chrome.runtime.sendMessage({
        command: "settings_get",
        sender: "popup",
        receiver: "background",
        data: {},
    })
}

// Send settings to background page
function SendChangedSettings() {
    //var port = chrome.extension.connect({ name: "Set Settings" });

    let json={};
    json.SelectedLang =selectedLang;
    json.AutoTranslate=autoTranslate;
    json.Transcription=transcription;
    json.AllTranslates=allTranslates;
    json.Theme=theme;
    json.ThemeColor=themeColor;
    json.SystemLang=systemLang;
    json.Activated=activated;

    chrome.runtime.sendMessage({
        command: "settings_set",
        sender: "popup",
        receiver: "background",
        data: json,
    });
}

// set list of lang
function SetLangs(arr_angs) {
    langs=arr_angs;
    if (dev) console.log("Setting langs", langs);
    let select=document.getElementById("settingCurrentLang");
    SetGroup(langs, select);

    function SetGroup(arr, parent) {
        for (let item of arr) {
            if (item.type=="Category") {
                let optgroup=document.createElement("optgroup");
                optgroup.label=item.Name;
                parent.appendChild(optgroup);

                SetGroup(item.items, optgroup);
            } else {
                let option=document.createElement("option");
                option.innerText=item.Name;
                option.value=item.Id;
                parent.appendChild(option);
            }    
        }
    }
}

function receviederHandler() {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log("Recevieded", request);
        if (request.receiver == "popup") {
            if (request.command === "settings_set_popup") {
                LoadSettings(request.data);
                statePopUp="loaded";
                SetLangs(request.data.Langs);
                ApplySettings();
                SwitchPage("Basic");
            }
            if (request.command === "loading") {
                document.getElementById("progness").width=data.Progress;
                if (data.State==-1) document.getElementById("textDownloadingList").innerText="Inicializace...";
                else if (data.State==0) document.getElementById("textDownloadingList").innerText="Načítání...";
                else if (data.State==1) document.getElementById("textDownloadingList").innerText="Dokončování...";
            }
        }
    });
}

function SetThemeColors(){
    let modifierS=1;
    if (!activated)modifierS=0;
    if (themeColor==undefined) themeColor=0;
    for (let s of document.styleSheets) {
        if (s.href.endsWith('popup.css')) {
            let styles = s.cssRules[0].style;

            if (theme == "dark") {
                styles.setProperty('--colorForward', '255,255,255');

                styles.setProperty('--colorBackground', 'hsl(' + themeColor + 'deg '+100*modifierS+'% 2%)');
                styles.setProperty('--colorBackgroundUp', 'hsl(' + themeColor + 'deg '+100*modifierS+'% 20%)');
                styles.setProperty('--colorControls', 'hsl(' + themeColor + 'deg '+100*modifierS+'% 10%)');
                
                styles.setProperty('--colorDisabled', "gray");
                styles.setProperty('--colorDisabledBack', 'hsl(' + 0 + 'deg 0% 20%)');
                
                styles.setProperty('--colorEnabled', 'hsl(' + themeColor + 'deg '+60+'% 50%)');
                styles.setProperty('--colorEnabledBack', 'hsl(' + themeColor + 'deg '+30+'% 20%)');
               
            } else if (theme == "light") {               
                styles.setProperty('--colorForward', '0,0,0');

                styles.setProperty('--colorBackground', 'hsl(' + themeColor + 'deg '+100*modifierS+'% 100%)');
                styles.setProperty('--colorBackgroundUp', 'hsl(' + themeColor + 'deg '+100*modifierS+'% 92%)');
                styles.setProperty('--colorControls', "white");
                
                styles.setProperty('--colorDisabled', "gray");
                styles.setProperty('--colorDisabledBack', 'hsl(' + 0 + 'deg 0% 90%)');
                
                styles.setProperty('--colorEnabled', 'hsl(' + themeColor + 'deg '+60+'% 50%)');
                styles.setProperty('--colorEnabledBack', 'hsl(' + themeColor + 'deg '+30+'% 80%)');
            } else {               
                styles.setProperty('--colorForward', '0,0,0');

                styles.setProperty('--colorBackground', 'hsl(' + themeColor + 'deg '+100*modifierS+'% 98%)');
                styles.setProperty('--colorBackgroundUp', 'hsl(' + themeColor + 'deg '+100*modifierS+'% 90%)');
                styles.setProperty('--colorControls', "white");
                
                styles.setProperty('--colorDisabled', "gray");
                styles.setProperty('--colorDisabledBack', 'hsl(' + 0 + 'deg 0% 90%)');
                
                styles.setProperty('--colorEnabled', 'hsl(' + themeColor + 'deg '+60+'% 50%)');
                styles.setProperty('--colorEnabledBack', 'hsl(' + themeColor + 'deg '+30+'% 80%)');
            }
        }
    }
}

