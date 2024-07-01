let selectedLang, 
    autoTranslate, 
    transcription, 
    translateAreas,
    allTranslates,
    systemLang,
    themeColor,
    theme,

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
        let rule=document.getElementById("settingPageRule").value;
        currentPageRule=rule;
        SendChangedSettings();
    });
    
    // --- More settings --- //

    // Auto translate
    document.getElementById("settingAutoTranslate").addEventListener('click', function() {
        let rule=document.getElementById("settingAutoTranslate").value;
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
        let rule=document.getElementById("settingAlltranslation").value;
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
    
    
    // Add bts events
    document.getElementById("btmMoreSettings").addEventListener('click', function() {SwitchPage("MoreSettings")});
    document.getElementById("btnShowMap").addEventListener('click', function() {SwitchPage("Map")});
    document.getElementById("btnGoBack").addEventListener('click', function() {SwitchPage("Basic")});
    document.getElementById("btnGoBack2").addEventListener('click', function() {SwitchPage("Basic")});
});

// Apply loaded settings
function ApplySettings(){
    document.getElementById("settingOnThisPage").checked=currentPageRule;
    document.getElementById("settingCurrentLang").checked=selectedLang;
    // >>> selected map point

    // More info
    document.getElementById("settingAutoTranslate").checked=autoTranslate;
    document.getElementById("settingAreas").checked=translateAreas;
    document.getElementById("settingAlltranslation").checked=allTranslates;
    document.getElementById("settingTranscription").checked=transcription;

    document.getElementById("settingColor").checked=colorTheme;
    document.getElementById("settingSystemLang").checked=systemLang;
    document.getElementById("settingTheme").checked=theme;

    SetThemeColors();
}

// Switch page
const pages=["Basic", "Map", "MoreSettings"];
let lastPage="Basic";

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
    currentPageRule=json.CurrentPageRule;
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

    chrome.runtime.sendMessage({
        command: "popup_to_background",
        sender: "popup",
        receiver: "background",
        data: json,
    });
}

function receviederHandler() {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log("Recevieded", request);
        if (request.receiver == "popup") {
            if (request.command === "settings_set") {
                LoadSettings(msg.data);
                statePopUp="loaded";
                ApplySettings();
            }
        }
    });
}

function SetThemeColors(){
    for (let s of document.styleSheets) {
        if (s.href.endsWith('popup.css')) {
            let styles = s.cssRules[0].style;

            if (theme == "dark") {
                styles.setProperty('--colorForward', '255,255,255');

                styles.setProperty('--colorBackground', 'hsl(' + themeColor + 'deg 100% 2%)');
                styles.setProperty('--colorBackgroundUp', 'hsl(' + themeColor + 'deg 100% 20%)');
                styles.setProperty('--colorControls', "black");
                
                styles.setProperty('--colorDisabled', "gray");
                styles.setProperty('--colorDisabledBack', 'hsl(' + 0 + 'deg 0% 10%)');
                
                styles.setProperty('--colorEnabled', 'hsl(' + themeColor + 'deg 60% 50%)');
                styles.setProperty('--colorEnabledBack', 'hsl(' + themeColor + 'deg 30% 20%)');
               
            } else if (theme == "light") {               
                styles.setProperty('--colorForward', '0,0,0');

                styles.setProperty('--colorBackground', 'hsl(' + themeColor + 'deg 100% 100%)');
                styles.setProperty('--colorBackgroundUp', 'hsl(' + themeColor + 'deg 100% 92%)');
                styles.setProperty('--colorControls', "white");
                
                styles.setProperty('--colorDisabled', "gray");
                styles.setProperty('--colorDisabledBack', 'hsl(' + 0 + 'deg 0% 90%)');
                
                styles.setProperty('--colorEnabled', 'hsl(' + themeColor + 'deg 60% 50%)');
                styles.setProperty('--colorEnabledBack', 'hsl(' + themeColor + 'deg 30% 80%)');
            } else {               
                styles.setProperty('--colorForward', '0,0,0');

                styles.setProperty('--colorBackground', 'hsl(' + themeColor + 'deg 100% 98%)');
                styles.setProperty('--colorBackgroundUp', 'hsl(' + themeColor + 'deg 100% 90%)');
                styles.setProperty('--colorControls', "white");
                
                styles.setProperty('--colorDisabled', "gray");
                styles.setProperty('--colorDisabledBack', 'hsl(' + 0 + 'deg 0% 90%)');
                
                styles.setProperty('--colorEnabled', 'hsl(' + themeColor + 'deg 60% 50%)');
                styles.setProperty('--colorEnabledBack', 'hsl(' + themeColor + 'deg 30% 80%)');
            }
        }
    }
}

