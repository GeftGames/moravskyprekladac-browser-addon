var dev=true;
var refreshPage=false;
var languagesList=[]; // for map

var selectedLang, 
    autoTranslate, 
    transcription, 
    translateAreas,
    allTranslates,
    systemLang,
    themeColor,
    theme,
    activated,
    langsInSelect,
    liveSubTitles,
    mouseContext,
    translateMethod,
    currentPageRule,
    currentDomainRule,
    translateOnlyCSSites,
    
    statePopUp="loading"; // Loading,...

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

if (isFirefox) {
    var chrome=browser;
}


// Load popup page
document.addEventListener('DOMContentLoaded', function() {
    // register receiveing info
    receviederHandler();

    // Load page settings
    GetSettings();
   
    // changed language of current page
    document.getElementById("settingCurrentLang").addEventListener('change', function() {
        let lang=document.getElementById("settingCurrentLang").value;
        selectedLang=parseInt(lang);
        SendChangedSettings();
        ShowRefreshPage();
    });

    // changed rule of translating of current page
    document.getElementById("settingPageRule").addEventListener('click', function() {
        let rule=document.getElementById("settingPageRule").checked;
        currentPageRule=rule;
        PageRule();
        ShowRefreshPage();
    });

    // changed rule of translating of current page
    /*document.getElementById("textThisPageRuleDomain").addEventListener('click', function() {
        let rule=document.getElementById("textThisPageRuleDomain").checked;
        currentDomainRule=rule;
        PageRule();
    });*/
    
    // --- More settings --- //

    // Auto translate
    document.getElementById("settingAutoTranslate").addEventListener('click', function() {
        let rule=document.getElementById("settingAutoTranslate").checked;
        autoTranslate=rule;
        SendChangedSettings();
    });
    
    // Areas of translations
    document.getElementById("settingAreas").addEventListener('change', function() {
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
    
    // translateOnlyCSSites
    document.getElementById("settingsTranslateOnlyCSSites").addEventListener('click', function() {
        let rule=document.getElementById("settingsTranslateOnlyCSSites").checked;
        translateOnlyCSSites=rule;
        SendChangedSettings();
    });

    // transcription
    document.getElementById("settingTranscription").addEventListener('change', function() {
        let rule=document.getElementById("settingTranscription").value;
        transcription=rule;
        SendChangedSettings();
        ShowRefreshPage();
    }); 
    
    // theme color
    document.getElementById("settingColor").addEventListener('change', function() {
        let rule=document.getElementById("settingColor").value;
        themeColor=rule;
        SendChangedSettings();
        SetThemeColors();
    });

    // theme
    document.getElementById("settingTheme").addEventListener('change', function() {
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
        ShowRefreshPage();
        if (activated) GetSettings();
    });

    // live subs
    /*document.getElementById("settingsLiveSubs").addEventListener('click', function() {
        let rule=document.getElementById("settingsLiveSubs").checked;
        liveSubTitles=rule;
        console.log("Set active to", liveSubTitles);
        SendChangedSettings();
    });*/

    // default rule
    document.getElementById("settingsDefaultRule").addEventListener('click', function() {
        let rule=document.getElementById("settingsDefaultRule").checked;
        defaultRule=rule;
        SendChangedSettings();
    });

    // mouse contex
    document.getElementById("settingsMouseContex").addEventListener('click', function() {
        let rule=document.getElementById("settingsMouseContex").checked;
        mouseContext=rule;
        console.log("mouseContext to", mouseContext);
        SendChangedSettings();
    });

    // system lang
    document.getElementById("settingSystemLang").addEventListener('click', function() {
        let rule=document.getElementById("settingSystemLang").value;
        systemLang=rule;
        SetLangTexts();
        SendChangedSettings();
    });

    // Translate method
    document.getElementById("settingsTranslateMethod").addEventListener('click', function() {
        let rule=document.getElementById("settingsTranslateMethod").value;
        translateMethod=rule;
        SendChangedSettings();
        if (currentPageRule)ShowRefreshPage();
    });
    
    
    // Add bts events
    document.getElementById("btmSettings").addEventListener('click', function() {SwitchPage("Settings")});
    document.getElementById("btnShowMap" ).addEventListener('click', function() {SwitchPage("Map")});
    document.getElementById("btnGoBack"  ).addEventListener('click', function() {SwitchPage("Basic")});
    document.getElementById("btnGoBack2" ).addEventListener('click', function() {SwitchPage("Basic")});

    // refresh button
    document.getElementById("btnRefreshPage" ).addEventListener('click', function() {
        document.getElementById("refreshPage").style.display="none";
     
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                    command: "refresh",
                    sender: "popup",
                    receiver: "content",
                    data: { /*url: tabs[0].url*/},
                }
            );
        });
    });
});

function ShowRefreshPage(){
    document.getElementById("refreshPage").style.display="flex";
    refreshPage=true;
}

// Apply loaded settings
function ApplySettings(){
    document.getElementById("settingPageRule").checked=currentPageRule;
   // document.getElementById("settingDomainRule").checked=currentDomainRule;
   console.log("selectedLang",selectedLang);
    document.getElementById("settingCurrentLang").value=selectedLang;
    // >>> selected map point

    // More info
    document.getElementById("settingActive").checked=activated;
    
    document.getElementById("settingAutoTranslate").checked=autoTranslate;
    document.getElementById("settingAreas").checked=translateAreas;
    document.getElementById("settingAlltranslation").checked=allTranslates;
    document.getElementById("settingTranscription").value=transcription;
    document.getElementById("settingsMouseContex").value=mouseContext;
    document.getElementById("settingsDefaultRule").checked=defaultRule;
    document.getElementById("settingsTranslateOnlyCSSites").checked=translateOnlyCSSites;
    
    document.getElementById("settingsTranslateMethod").value=translateMethod;

    document.getElementById("settingColor").value=themeColor;
    document.getElementById("settingSystemLang").value=systemLang;
    document.getElementById("settingTheme").value=theme;

    SetThemeColors();
}

// Switch page
const pages=["Loading", "Basic", "Map", "Settings"];
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
    translateMethod=json.TranslateMethod;
    systemLang=json.SystemLang;
    theme=json.Theme;
    activated=json.Activated;
    //liveSubTitles=json.LiveSubTitles;
    mouseContext=json.MouseContext;
    defaultRule=json.DefaultRule;
    translateOnlyCSSites=json.TranslateOnlyCSSites;
}

// Get settings from background page
function GetSettings() {
    console.log("settings_get");
    chrome.runtime.sendMessage({
        command: "settings_get",
        sender: "popup",
        receiver: "background",
        data: {},
    });
}

// Send settings to background page
function SendChangedSettings() {
    let json={};
    json.SelectedLang =selectedLang;
    json.AutoTranslate=autoTranslate;
    json.Transcription=transcription;
    json.AllTranslates=allTranslates;
    json.TranslateMethod=translateMethod;
    json.Theme=theme;
    json.ThemeColor=themeColor;
    json.SystemLang=systemLang;
    json.Activated=activated;
    json.MouseContext=mouseContext;
    //json.LiveSubTitles=liveSubTitles;
    json.DefaultRule=defaultRule;
    json.TranslateOnlyCSSites=translateOnlyCSSites;

    chrome.runtime.sendMessage({
        command: "settings_set",
        sender: "popup",
        receiver: "background",
        data: json,
    });
}

// set list of lang
function SetLangs(arr_angs) {
    if (arr_angs==undefined) console.error("data.Langs is undefined!");
    langsInSelect=arr_angs.items;
    if (dev) console.log("Setting langs", langsInSelect);
    let select=document.getElementById("settingCurrentLang");
    SetGroup(langsInSelect, select);

    function SetGroup(arr, parent) {
        for (let item of arr) {
            if (item.type=="Category") {
                let optgroup=document.createElement("optgroup");
                optgroup.label=item.Name;
                parent.appendChild(optgroup);
                if (item.items!=undefined) {
                    if (item.items.length>0) {
                        SetGroup(item.items, optgroup);
                    }
                }
            } else {
                let option=document.createElement("option");
                option.innerText=item.Name;
                option.value=item.id;
                parent.appendChild(option);
            }    
        }
    }
}

function receviederHandler() {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log("Recevieded", request);
        if (request.receiver == "popup") {
            let data=request.data;
            if (request.command === "settings_set_popup") {
                Load(data);
            }
            if (request.command === "loading") {
                document.getElementById("progness").width=data.Progress+"px";
                console.log(data.Progress);
                if (data.State==-1) document.getElementById("textDownloadingList").innerText="Inicializace";
                else if (data.State==0) document.getElementById("textDownloadingList").innerText="Načítání...";
                else if (data.State==1) {
                    document.getElementById("textDownloadingList").innerText="Načítání";
                    GetSettings();
                }
            }
            if (request.command === "pagerule") {
                currentPageRule=data.pageRule;
                //currentDomainRule=data.domainRule;
                currentUrl=data.url;

                document.getElementById("settingPageRule").checked=currentPageRule;
            }
        }
    });
}

// After inicialized and loaded service-wrker
function Load(data) {
    statePopUp="loaded";
    SwitchPage("Basic");
    languagesList=data.LanguagesList;
    SetLangs(data.Langs);
    LoadSettings(data);
    ApplySettings();
    SetLangTexts();
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

function PageRule(){
    chrome.tabs.query({active:true, currentWindow:true}, function(tab) {
        //Be aware that `tab` is an array of Tabs 
        let currentUrl=tab[0].url;

        chrome.runtime.sendMessage({
            command: "pagerule_set",
            sender: "popup",
            receiver: "background",
            data: {
                url: currentUrl,
                pageRule: currentPageRule,
               // domainRule: currentDomainRule
            },
        })
    });
}

function SetLangTexts() {
    let langCode=systemLang;
    if (langCode=="default" || langCode==undefined) {
        const arrOfAceptedLangs = ["cs", "cs-CZ", "sk", "sk-SK", "pl", "pl-PL", "jp", "jp-JP", "de", "de-DE", "en-GB", "en-US"];
        for (let clientLang of navigator.language) {
            for (let a of arrOfAceptedLangs) {
                if (a.includes(clientLang)) {
                    if (a.length==2) langCode=a;
                    else langCode=a.substring(0,2);
                    break;
                }
            }
            if (langCode!="default" || langCode==undefined) break;
        }
    }
    if (langCode=="default" || langCode==undefined) langCode="en";
    let langsInFile=langs[systemLang];
    if (langsInFile==undefined) {
        console.warn("Unknown language", systemLang);
        return;
    }
    // <body lang="cs">
    document.body.lang=langsInFile.Code;

    document.getElementById("headerTitle").innerText=langsInFile.TranslatorCM;
    document.getElementById("trBitSlz").innerText=langsInFile.BitSlz;
    document.getElementById("forWeb").innerText=langsInFile.ForWeb;
    document.getElementById("chooseFromMap").innerText=langsInFile.ChooseFromMap;
    document.getElementById("btnGoBack").innerText=langsInFile.GoBack;
    document.getElementById("btnGoBack2").innerText=langsInFile.GoBack;
    document.getElementById("textTranscription").innerText=langsInFile.Transcription;
    document.getElementById("textAutoTranslate").innerText=langsInFile.AutoTranslate;
    document.getElementById("textTypeOfTranslate").innerText=langsInFile.TypeOfTranslate;
    document.getElementById("textDefaultType").innerText=langsInFile.Default;
    document.getElementById("textDefaultType2").innerText=langsInFile.Default;
    document.getElementById("textDefaultArea").innerText=langsInFile.Default;
    document.getElementById("textMouseContext").innerText=langsInFile.MouseContext;
    document.getElementById("textTranslateSelectedText").innerText=langsInFile.TranslateSelectedText;
    document.getElementById("textLiveSubs").innerText=langsInFile.LiveSubs;
    document.getElementById("textSupportsLiveSubs").innerText=langsInFile.LiveSubsSupport;
    document.getElementById("textAllTranslates").innerText=langsInFile.AllTranslates;
    document.getElementById("textEvenBadOnes").innerText=langsInFile.EvenBadOnes;
    document.getElementById("textThemeColor").innerText=langsInFile.Color;
    document.getElementById("textTheme").innerText=langsInFile.Theme;
    document.getElementById("textLanguage").innerText=langsInFile.Language;
    document.getElementById("textAbout").innerText=langsInFile.About;
    document.getElementById("textSystem").innerText=langsInFile.System;
    document.getElementById("textArea").innerText=langsInFile.Area;
    document.getElementById("textMoreAboutAreas").innerText=langsInFile.MoreAboutAreas;
    document.getElementById("btmSettings").innerText=langsInFile.Settings;
    document.getElementById("textFrom").innerText=langsInFile.From;
    document.getElementById("textThisPageRule").innerText=langsInFile.ThisPageRule;
    document.getElementById("textDark").innerText=langsInFile.Dark;
    document.getElementById("textLight").innerText=langsInFile.Light;
    document.getElementById("textSemi").innerText=langsInFile.Semi;
    document.getElementById("textShow").innerText=langsInFile.Show;
    document.getElementById("textGlobalEnabled").innerText=langsInFile.GlobalEnabled;
    document.getElementById("textCyrillic").innerText=langsInFile.Cyrillic;
    document.getElementById("textIpa").innerText=langsInFile.Ipa;
}