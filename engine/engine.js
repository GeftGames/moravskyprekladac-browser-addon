var imgMap;

var mapper_starting_input;
var usingTheme;
var error = false;
var errorText;
var enabletranslate = true;
var forceTranslate = false;
var language, autoTranslate, styleOutput, dev;
var saved = [];
var loaded = false;
var TranscriptionText;
var chngtxt;

var textRefreshTooltip;
var textCHTranslator, textHCTranslator;
var textNightDark;
var textCopy,
    textCannotTranslate,
    textWriteSomething,
    textHereShow,
    textFrom,
    textTo,
    textConClear,
    textSavedTrans,
    textAddChar,
    textTranslation,
    textCopyThisTrans,
    textSettings,
    textWeblanguage,
    textAutoTranslate,
    textMark,
    textMoreInfo,
    textMoreInfoDev,
    textSaved,
    //	textDeveloper,
    textPCSaving,
    textCookies,
    textInfo,
    textRemove,
    text2CSje,
    //textCH,
    //textHC,
    text2CS,
    text2HA,
    text2VA,
    text2SO,
    text2SL,
    text2HAOB,
    text2HAOLA,
    text2HASL,
    text2BH, text2Slez,
    text2MO,
    textWoc;
var NotenterredMozFirstSpace = true;
var textSaveTrans;
var textTheme,
    textDefault2,
    textLight,
    textDark;
var ThemeLight, ThemeDay, Power;
var lastInputText = [];
var textNote;


// ze slovníku tvarosloví
function ShowPageLangD(element) {
    document.body.style.overflow = "clip";
    window.scrollTo({ top: 0 });

    if (typeof element == undefined) return;
    const pagelangDFill = document.getElementById("pagelangDFill");
    pagelangDFill.innerHTML = "";
    pagelangDFill.appendChild(element);

    document.getElementById("pagePop_pageLangD").style.display = "block";
    document.getElementById("pagePop_pageLangD").style.opacity = "1";
    document.getElementById("pagePop_pageLangD").style.position = "absolute";
    document.getElementById("pagePop_pageLangD").style.top = "99px";
    if (document.getElementById('nav').style.opacity == '1') {
        document.getElementById('butShow').style.opacity = '1';
        document.getElementById('butclose').style.opacity = '0';
        document.getElementById('nav').classList.add('navTrans');
        document.getElementById('nav').style.opacity = '0.1';
    }
}

function ClosePageLangD() {
    document.body.style.overflow = "unset";
    document.getElementById("pageLangD").style.opacity = "0";
    document.getElementById("pageLangD").style.top = "500px";
    document.getElementById("pageLangD").style.position = "fixed";
    //document.getElementById("aboutPage").style.display="none";
    //document.getElementById("translatingPage").style.display="block";
    if (document.getElementById('nav').style.opacity == '1') {
        document.getElementById('butShow').style.opacity = '1';
        document.getElementById('butclose').style.opacity = '0';
        document.getElementById('nav').classList.add('navTrans');
        document.getElementById('nav').style.opacity = '0.1';
    }
    setTimeout(() => {
        document.getElementById("pageLangD").style.display = "none";
    }, 300);
}

var langFile;

function SetLanguage() {
    let tmpLang;
    if (language == "default") {
        var userLang = navigator.language || navigator.userLanguage;
        let defc = localStorage.getItem("DefaultCountry");
        if (userLang == "cs") {
            if (defc === null) {
                tmpLang = "cs";
            } else {
                if (defc == "Morava") tmpLang = "mor";
                else if (defc == "Slezsko") tmpLang = "slz";
                else if (defc == "Slezsko") tmpLang = "ces";
                tmpLang = "cs"; //console.log(defc=="Morava");
            }
        } else if (userLang == "de") tmpLang = "de";
        else if (userLang == "sk") tmpLang = "sk";
        else if (userLang == "jp") tmpLang = "jp";
        else tmpLang = "en";
    } else tmpLang = language;

    langFile = langs[tmpLang];
    if (langFile == undefined) {
        console.log("Unknown lang: " + lang + ", userLang" + tmpLang);
        return;
    }

    localStorage.setItem('setting-language', language);

    document.documentElement.lang = tmpLang;

    var headID = document.getElementsByTagName('manifest');
    headID.href = "data/manifests/manifest" + tmpLang.toUpperCase() + ".json";
    cententlang.content = tmpLang;

    document.getElementById("from").innerText = langFile.From;
    document.getElementById("to").innerText = langFile.To;
    if (document.getElementById("cannotTr") != null) document.getElementById("cannotTr").innerText = langFile.CannotTranslate;
    document.getElementById("note").innerText = langFile.Note;
    document.getElementById("textTheme").innerText = langFile.Theme;
    document.getElementById("textDefaultPower").innerText = langFile.Default;
    document.getElementById("textDefaultTheme").innerText = langFile.Default;
    document.getElementById("textLight").innerText = langFile.Light;
    document.getElementById("textDark").innerText = langFile.Dark;
    document.getElementById("refresh").title = langFile.RefreshTooltip;
    document.getElementById("metaDescription").title = langFile.RefreshTooltip;
    document.getElementById("metaDescription2").title = langFile.RefreshTooltip;
    document.getElementById("metaDescription3").title = langFile.RefreshTooltip;
    document.getElementById("textSettings").innerText = langFile.Settings;
    document.getElementById("textWeblanguage").innerText = langFile.WebLanguage;
    document.getElementById("textAutoTranslate").innerText = langFile.AutoTranslate;
    document.getElementById("textMark").innerText = langFile.MarkTranslate;
    document.getElementById("textMoreInfo").innerText = langFile.MoreInfo;
    document.getElementById("textMoreInfoDev").innerText = langFile.MoreInfoDev;
    document.getElementById("textSaved").innerText = langFile.SavedTranslations;
    document.getElementById("textPCSaving").innerText = langFile.SavingToPC;
    document.getElementById("textCookies").innerText = langFile.CookiesMessage;
    document.getElementById("textRemove").innerText = langFile.Remove;
    document.getElementById("textSettings").innerText = langFile.Settings;
    document.getElementById("textAbout").innerText = langFile.About;
    document.getElementById("txtSavedTrans").innerText = langFile.SavedTrans;
    document.getElementById("specialTextarea").placeholder = langFile.WriteSomething;
    document.getElementById("note").innerText = langFile.noteStillInDev;
    //document.getElementById("textTranslator").innerText = langFile.Translator;
    document.getElementById("tabText").innerText = langFile.Text;
    document.getElementById("tabTxtFiles").innerText = simpleTabContent ? langFile.TextFilesShort : langFile.TextFiles;
    document.getElementById("tabSubs").innerText = simpleTabContent ? langFile.SubtitlesFilesShort : langFile.SubtitlesFiles;
    document.getElementById("textSettingsTranslate").innerText = langFile.TranslateOptions;
    document.getElementById("textbetaFunctions").innerText = langFile.UnfinishedTranslate;
    document.getElementById("textSettings").innerText = langFile.Settings;
    document.getElementById("closeAbout").innerText = langFile.Close;
    document.getElementById("aboutTranslator").innerText = langFile.About;
    document.getElementById("comment").innerText = langFile.Comment;
    document.getElementById("contact").innerText = langFile.Contact;
    document.getElementById("forGoodComputerUsers").innerText = langFile.CommentForDev;
    document.getElementById("downloadSubs").innerText = langFile.Download;
    document.getElementById("downloadFile").innerText = langFile.Download;
    document.getElementById("btnTranslateTxt").innerText = langFile.Translate;
    document.getElementById("btnTranslateSubs").innerText = langFile.Translate;
    document.getElementById("VideoNote").innerText = langFile.VideoNote;
    document.getElementById("supportFiles").innerText = langFile.FileSupport;
    document.getElementById("textbetaFunctionsDetails").innerText = langFile.MoreInfoBetaTranslate;
    document.getElementById("czech").innerText = langFile.Czech;
    document.getElementById("aboutTranslatorText").innerText = langFile.AboutTranslator;
    document.getElementById("textItsNotBest").innerText = langFile.ItsNotBest;
    document.getElementById("textNoMoney").innerText = langFile.NoMoney;
    document.getElementById("textWhatIsQ").innerText = langFile.WhatIsQ;
    document.getElementById("textStillWorking").innerText = langFile.StillWorking;
    document.getElementById("textWhatWeUse").innerText = langFile.WhatWeUse;
    document.getElementById("textHowWeTranslate").innerText = langFile.HowWeTranslate;
    document.getElementById("textWeFree").innerText = langFile.WeFree;
    document.getElementById("tabDic").innerText = langFile.Dic;
    document.getElementById("textDownloadingList").innerText = langFile.DownloadingDic;
    document.getElementById("tabApp_translate").innerText = langFile.AppTabTranslate;
    document.getElementById("tabApp_search").innerText = langFile.AppTabSearch;
    document.getElementById("tabApp_mapper").innerText = langFile.AppTabMapper;
    document.getElementById("tabApp2_translate").innerText = langFile.AppTabTranslateShort;
    document.getElementById("tabApp2_search").innerText = langFile.AppTabSearchShort;
    document.getElementById("tabApp2_mapper").innerText = langFile.AppTabMapperShort;
    document.getElementById("searchInputCaption").innerText = langFile.SearchInputCaption;
    document.getElementById("searchButton").innerText = langFile.SearchButton;
    document.getElementById("mapperSearchWord").innerText = langFile.MapperInputLabel;
    document.getElementById("btnMakeMap").innerText = langFile.MapperMakeMap;
    if (document.getElementById("searchOutPlaceholder") != undefined) document.getElementById("searchOutPlaceholder").innerText = langFile.HereShow;
    document.getElementById("textMode").innerText = langFile.Mode;
    document.getElementById("textPower").innerText = langFile.Power;
    document.getElementById("textThemeColor").innerText = langFile.Color;
    document.getElementById("trBitSlz").innerText = langFile.BitSlz;
    document.getElementById("navSideClose").innerText = langFile.Close;
    document.getElementById("textOnlyMoravia").innerText = langFile.Region;
    document.getElementById("textOnlyMoraviaMore").innerText = langFile.RegionWithTr;
    document.getElementById("textTranscription").innerText = langFile.Transcription;

    document.getElementById("notePhonetics").innerHTML = langFile.UsePhonetics.substring(0, langFile.UsePhonetics.indexOf("%")) + `<a class="link" onclick="PopPageShow('phonetics')">` + langFile.UsePhonetics.substring(langFile.UsePhonetics.indexOf("%") + 1, langFile.UsePhonetics.lastIndexOf("%")) + "</a>" + langFile.UsePhonetics.substring(langFile.UsePhonetics.lastIndexOf("%") + 1);

    if (document.getElementById('specialTextarea').value == "") document.getElementById('outputtext').innerHTML = '<span class="placeholder">' + langFile.HereShow + '</span>';

    let headername = document.getElementById('headername');
    headername.innerText = langFile.TranslatorCM;


    var botPattern = "(googlebot\/|bot|Googlebot-Mobile|Googlebot-Image|Google favicon|Mediapartners-Google|bingbot|slurp|java|wget|curl|Commons-HttpClient|Python-urllib|libwww|httpunit|nutch|phpcrawl|msnbot|jyxobot|FAST-WebCrawler|FAST Enterprise Crawler|biglotron|teoma|convera|seekbot|gigablast|exabot|ngbot|ia_archiver|GingerCrawler|webmon |httrack|webcrawler|grub.org|UsineNouvelleCrawler|antibot|netresearchserver|speedy|fluffy|bibnum.bnf|findlink|msrbot|panscient|yacybot|AISearchBot|IOI|ips-agent|tagoobot|MJ12bot|dotbot|woriobot|yanga|buzzbot|mlbot|yandexbot|purebot|Linguee Bot|Voyager|CyberPatrol|voilabot|baiduspider|citeseerxbot|spbot|twengabot|postrank|turnitinbot|scribdbot|page2rss|sitebot|linkdex|Adidxbot|blekkobot|ezooms|dotbot|Mail.RU_Bot|discobot|heritrix|findthatfile|europarchive.org|NerdByNature.Bot|sistrix crawler|ahrefsbot|Aboundex|domaincrawler|wbsearchbot|summify|ccbot|edisterbot|seznambot|ec2linkfinder|gslfbot|aihitbot|intelium_bot|facebookexternalhit|yeti|RetrevoPageAnalyzer|lb-spider|sogou|lssbot|careerbot|wotbox|wocbot|ichiro|DuckDuckBot|lssrocketcrawler|drupact|webcompanycrawler|acoonbot|openindexspider|gnam gnam spider|web-archive-net.com.bot|backlinkcrawler|coccoc|integromedb|content crawler spider|toplistbot|seokicks-robot|it2media-domain-crawler|ip-web-crawler.com|siteexplorer.info|elisabot|proximic|changedetection|blexbot|arabot|WeSEE:Search|niki-bot|CrystalSemanticsBot|rogerbot|360Spider|psbot|InterfaxScanBot|Lipperhey SEO Service|CC Metadata Scaper|g00g1e.net|GrapeshotCrawler|urlappendbot|brainobot|fr-crawler|binlar|SimpleCrawler|Livelapbot|Twitterbot|cXensebot|smtbot|bnf.fr_bot|A6-Indexer|ADmantX|Facebot|Twitterbot|OrangeBot|memorybot|AdvBot|MegaIndex|SemanticScholarBot|ltx71|nerdybot|xovibot|BUbiNG|Qwantify|archive.org_bot|Applebot|TweetmemeBot|crawler4j|findxbot|SemrushBot|yoozBot|lipperhey|y!j-asr|Domain Re-Animator Bot|AddThis)";
    var re = new RegExp(botPattern, 'i');
    var userAgent = navigator.userAgent;

    // if not crawler
    if (!re.test(userAgent)) {
        document.title = langFile.TranslatorCM;
    }

    let manifest = document.getElementById("manifest");
    if (manifest == null) {
        manifest = document.createElement("link");
        manifest.href = "data/manifests/manifest" + langFile.Code.toUpperCase() + ".json";
        manifest.rel = "manifest";
        manifest.id = "manifest";
        document.getElementsByTagName('head')[0].appendChild(manifest);
    } else {
        manifest.href = "data/manifests/manifest" + langFile.Code.toUpperCase() + ".json";
    }
}

function TabSelect(enableElement, tab) {
    if (tab == tabText) {
        //location.hash = "text";
        urlParamChange("page","text", false);
        tabText.classList.add("tabSelected");
        tabSubs.classList.remove("tabSelected");
        tabDic.classList.remove("tabSelected");
        tabTxtFiles.classList.remove("tabSelected");
    } else if (tab == tabSubs) {
        //location.hash = "subs";
        urlParamChange("page","subs", false);
        tabText.classList.remove("tabSelected");
        tabSubs.classList.add("tabSelected");
        tabDic.classList.remove("tabSelected");
        tabTxtFiles.classList.remove("tabSelected");
    } else if (tab == tabTxtFiles) {
        //location.hash = "files";
        urlParamChange("page","files", false);
        tabText.classList.remove("tabSelected");
        tabDic.classList.remove("tabSelected");
        tabSubs.classList.remove("tabSelected");
        tabTxtFiles.classList.add("tabSelected");
    } else if (tab == tabDic) {
       // location.hash = "dic";
        urlParamChange("page","dic", false);
        tabText.classList.remove("tabSelected");
        tabTxtFiles.classList.remove("tabSelected");
        tabSubs.classList.remove("tabSelected");
        tabDic.classList.add("tabSelected");
    }

    // Disable all
    translateText.style.display = 'none';
    translateDic.style.display = 'none';
    translateSubs.style.display = 'none';
    translateFiles.style.display = 'none';

    //tabText.style.zIndex=0;
    //tabSubs.style.zIndex=0;
    //tabTxtFiles.style.zIndex=0;

    //tabText.style.backgroundColor="white";
    //tabSubs.style.backgroundColor="white";
    //tabTxtFiles.style.backgroundColor="white";

    // Enable
    enableElement.style.display = 'block';
    //tab.style.zIndex=3;
    //tab.style.backgroundColor="aliceBlue";
}

function RemoveTrans() {
    if (confirm(textConClear)) {
        localStorage.removeItem("saved");
        document.getElementById("savedDiv").style.display = "none";
        document.getElementById("transl").innerHTML = "";

        document.getElementById('nav').style.display = 'none';
        document.getElementById('nav').style.left = '-400px;';
        document.getElementById('butShow').style.opacity = '1';
        document.getElementById('butclose').style.opacity = '0';
    }
}

function RegisterSpecialTextarea() {
    let sp = document.getElementById("specialTextarea");
    lastInputText.push(sp.innerText);

    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey) {
            switch (e.keyCode) {
                case 90: // ctrl+Z
                    if (lastInputText.length > 0) {
                        if (lastInputText[lastInputText.length - 1] == sp.innerText) {
                            lastInputText.pop();
                        }
                    }

                    if (lastInputText.length > 0) {
                        sp.innerText = lastInputText.pop();
                        //	SpellingJob();
                        //   prepareToTranslate(true);
                    }
                    break;
            }
        }
        if (e.keyCode == 32) {
            // Firefox repair, I don't know why firefox works like that
            if (navigator.userAgent.indexOf("Firefox") > 0) {
                if (NotenterredMozFirstSpace) {
                    NotenterredMozFirstSpace = false;

                    reportSelection();
                    sp.innerHTML += "\xa0";
                    //	sp.focus();

                    pos = EditorCursorStart;
                    setCursor();

                    //	sp.innerText+="\xa0";
                }
            }
        }
        /* if (e.keyCode === 13) {
        	 //insert2("<div style='margin: 30px'></div>");
         reportSelection();
        	sp.innerText+="\r\n";
        	 pos = EditorCursorStart;
        			setCursor();
        	return false;
        }*/
    });

    sp.addEventListener("input", function() {
        //SpellingJob();

        // Add to undo history
        if (lastInputText[lastInputText.length - 1] != sp.innerText) {
            lastInputText.push(sp.value /*innerText*/ );

            // Dont make big text array
            if (lastInputText.length > 10) lastInputText.shift();
        }

        //   prepareToTranslate(true);
    }, false);
}

function hideNav() {
    let nav = document.getElementById('nav');
    if (nav.style.opacity == 1) {
        /*		document.getElementById('nav').style.display='none';*/
        /*document.getElementById('nav').style.left='-400px;';*/
        document.getElementById('butShow').style.opacity = '1';
        document.getElementById('butclose').style.opacity = '0';
        /*		document.getElementById('nav').style.marginLeft='10px';*/
        document.getElementById('nav').classList.add('navTrans');
        document.getElementById('nav').style.opacity = '0.1';
    }
}

function Load() {
    //geolocation();
    /* document.documentElement.style.visibility="unset";
    Reload hash - need twice refresh for new page without cacheTabSelect */
    //if (window.location=="https://geftgames.github.io/moravskyprekladac/") window.location="https://moravskyprekladac.pages.dev/"
    if (window.location.hash == "#reload") {
        console.log("INFO|Reloading...");
        /*caches.keys().then(function (names) {
        	for (let name of names) caches.delete(name);
        });*/

        var url = window.location.href;
        var hash = window.location.hash;
        var index_of_hash = url.indexOf(hash) || url.length;
        var hashless_url = url.substr(0, index_of_hash);
        window.location = hashless_url;
        return;
    }

    let hashes=[];    
    if (location.search.startsWith("?")) {
        hashes=location.search.substring(1).split("&");
    } else if (location.hash.startsWith("#")) {
        hashes=location.hash.split("#");
        //location.hash=undefined;
        history.replaceState({}, document.title, window.location.href.split('#')[0]);
    }
    //console.log(location.hash);
    if (hashes.includes("about")) {
        //ShowAboutPage()
        PopPageShow("about");
        urlParamChange("page", "about", false);
    } else if (hashes.includes("mapper")) {
        appSelected = "mapper";
        let input_text_var="input=";
        for (let l of hashes) {  
            if (l.startsWith(input_text_var)) {
                let s=input_text_var.length;
                input_text=decodeURI(l.substring(s));
                
                if (input_text!="") {
                   // document.getElementById("specialTextarea").value=input_text;
                    mapper_starting_input=input_text;
                    //console.log("mapeer");
                 //   mapper_init(false,input_text)
                }
            }     
        }
        urlParamChange("page", "mapper", false);
    } else if (hashes.includes("search")) {
        appSelected = "search";
        urlParamChange("page", "search", false);

    } else if (hashes.includes("translate")) {
        appSelected = "translate";
        urlParamChange("page", "translate", false);

        var input_text="";
       
        let input_text_var="input=", input_lang_var="lang=";

        for (let l of hashes) {            
            if (l.startsWith(input_text_var)) {
                let s=input_text_var.length;
                input_text=decodeURI(l.substring(s));
                urlParamChange("input", input_text, true);
                if (input_text!="") {
                    document.getElementById("specialTextarea").value=input_text;
                }
            }            
            
            if (l.startsWith(input_lang_var)) {
                let s=input_lang_var.length;
                input_lang=decodeURI(l.substring(s));
                urlParamChange("lang", input_lang, true);
                if (input_lang!="") {
                    document.getElementById("selectorTo").value=input_lang;
                }
            }
        }
       
    } else if (hashes.includes("dic")) {
        TabSelect(document.getElementById('translateDic'), document.getElementById('tabDic'));
        var input_text="";
       
        let input_text_var="input=", input_lang_var="lang=";

        for (let l of hashes) {            
            if (l.startsWith(input_text_var)) {
                let s=input_text_var.length;
                input_text=decodeURI(l.substring(s));
                urlParamChange("input", input_text, true);
                if (input_text!="") {
                    document.getElementById("dicInput").value=input_text;
                }
            }            
            
            if (l.startsWith(input_lang_var)) {
                let s=input_lang_var.length;
                input_lang=decodeURI(l.substring(s));
                urlParamChange("lang", input_lang, true);
                if (input_lang!="") {
                    document.getElementById("selectorTo").value=input_lang;
                }
            }
        }
    } else if (hashes.includes("files")) {
        TabSelect(document.getElementById('translateFiles'), document.getElementById('tabTxtFiles'));
    } else if (hashes.includes("subs")) {
        TabSelect(document.getElementById('translateSubs'), document.getElementById('tabSubs'));
    } else if (hashes.includes("text")) {
        TabSelect(document.getElementById('translateText'), document.getElementById('tabText'));
    }else{
        urlParamChange("page", "translate", false);
    }
  

    simpleTabContent = window.innerWidth < 550;

    SetSwitchForced();

    /*
    	if ('serviceWorker' in navigator) {
    		window.addEventListener('load', function () {
    			navigator.serviceWorker.register('service-worker.js')
    				.then(function (registration) {
    					// Registration was successful
    					console.log('ServiceWorker registration successful with scope: ', registration.scope);
    				}, function (err) {
    					// registration failed :(
    					console.log('ServiceWorker registration failed: ', err);
    				})
    		});
    	}
    */

    document.getElementById("mapperInput").addEventListener("keydown", (e) => {
        if (e.key === 'Enter') {
            mapper_init();
        }
    });

    // Load setting
    let ztheme;
    try {
        ztheme = localStorage.getItem('ThemeLight');
    } catch (error) {}

    if (ztheme === null) {
        ThemeLight = "default";
    } else ThemeLight = ztheme;

    if (ThemeLight == "default") {} else {
        switch (ThemeLight) {
            case "light":
                document.getElementById("themeLight").selectedIndex = 1;
                break;

            default: //semi
                document.getElementById("themeLight").selectedIndex = 2;
                break;

            case "dark":
                document.getElementById("themeLight").selectedIndex = 3;
                break;
        }
    }

    let zthemeDay;
    try {
        zthemeDay = localStorage.getItem('ThemeDay');
    } catch (error) {}

    if (zthemeDay === null) {
        ThemeDay = "default";
    } else ThemeDay = zthemeDay;

    if (ThemeDay == "default") {} else {
        switch (ThemeDay) {
            case "day":
                document.getElementById("themeDay").selectedIndex = 1;
                break;

            case "night":
                document.getElementById("themeDay").selectedIndex = 2;
                break;
        }
    }

    let zPower;
    try {
        zPower = localStorage.getItem('Power');
    } catch (error) {}

    if (zPower === null) {
        Power = "default";
    } else Power = zPower;

    if (Power == "default") {} else {
        switch (Power) {
            case "fast":
                document.getElementById("power").selectedIndex = 3;
                break;

            case "optimal":
                document.getElementById("power").selectedIndex = 2;
                break;

            case "fancy":
                document.getElementById("power").selectedIndex = 1;
                break;
        }
    }

    let zColor;
    try {
        zColor = localStorage.getItem('Color');
    } catch (error) {}
    if (zColor === null) {
        Power = 208;
    } else Power = parseInt(zColor);
    myRange.value = Power;

    //  toggleNoTransitionOn();

    document.documentElement.style.display = "unset";

    RegisterSpecialTextarea();

    let zlanguage = "default";
    let zautoTranslate;
    let zstyleOutput;
    let zdev;
    let savedget;
    let zmyvocabHA;
    let zmyvocabCS;
    let trTo = "mo";
    let trFrom = "cs";
    let zDicAbc = true;
    let zTestingFunc;
    let zTranscription;
    try {
        zlanguage = localStorage.getItem('setting-language');
        zautoTranslate = localStorage.getItem('setting-autoTranslate');
        zstyleOutput = localStorage.getItem('setting-styleOutput');
        zTestingFunc = localStorage.getItem('setting-testingFunc');
        zdev = localStorage.getItem('setting-dev');
        zbetaFunctions = localStorage.getItem('setting-betaFunctions');
        zOnlyMoravia = localStorage.getItem('setting-Country');
        zTranscription = localStorage.getItem('Transcription');
        zDicAbc = localStorage.getItem('setting-dic-abc');

        savedget = localStorage.getItem('saved');
        zmyvocabHA = localStorage.getItem('vocab-ha');
        zmyvocabCS = localStorage.getItem('vocab-cs');
        trTo = localStorage.getItem('trTo');
        trFrom = localStorage.getItem('trFrom');

        zTextStyle = localStorage.getItem('TextStyle');
    } catch (error) {}

    /*  if (trFrom === null) {
          if (trFrom == "cs") document.getElementById("selRevFcs").selected = true;
      } else {
          if (trFrom == "cs") document.getElementById("selRevFcs").selected = true;
          if (trFrom == "ha") document.getElementById("selRevFha").selected = true;
          if (trFrom == "va") document.getElementById("selRevFva").selected = true;
          if (trFrom == "so") document.getElementById("selRevFso").selected = true;
          if (trFrom == "sk") document.getElementById("selRevFsk").selected = true;
          if (trFrom == "mo") document.getElementById("selRevFmo").selected = true;
          if (trFrom == "la") document.getElementById("selRevFla").selected = true;
          if (trFrom == "ceskytesin") document.getElementById("selRevFceskytesin").selected = true;
          if (trFrom == "slez") document.getElementById("selRevFslez").selected = true;
      }


      if (trTo === null) {
          if (trTo == "mo") document.getElementById("selRevTmo").selected = true;
      } else {
          if (trTo == "cs") document.getElementById("selRevTcs").selected = true;
          if (trTo == "ha") document.getElementById("selRevTha").selected = true;
          if (trTo == "va") document.getElementById("selRevTva").selected = true;
          if (trTo == "so") document.getElementById("selRevTso").selected = true;
          if (trTo == "mo") document.getElementById("selRevTmo").selected = true;
          if (trTo == "sk") document.getElementById("selRevTsk").selected = true;
          if (trTo == "la") document.getElementById("selRevTla").selected = true;
          if (trTo == "ceskytesin") document.getElementById("selRevTceskytesin").selected = true;
          if (trTo == "slez") document.getElementById("selRevTslez").selected = true;
      }*/

    if (zTextStyle === null) {
        TextStyle = "";
    } else TextStyle = zTextStyle;
    //	document.getElementById("textStyle").value=TextStyle;

    if (zmyvocabCS === null) {
        myVocabCS = new Array();
        myVocabCS.push('');
    } else myVocabCS = zmyvocabCS;

    if (zDicAbc == null) dicAbc = true;
    else dicAbc = zDicAbc;

    if (zmyvocabHA === null) {
        myVocabHA = new Array();
        myVocabHA.push('');
    } else myVocabHA = zmyvocabHA;

    if (zTranscription === null) {
        TranscriptionText = "default";
    } else TranscriptionText = zTranscription;
    if (document.getElementById("sTranscription") !== null) document.getElementById("sTranscription").value = TranscriptionText;

    transcription = SetCurrentTranscription(TranscriptionText);

    if (savedget === null) saved = new Array();
    else saved = JSON.parse(savedget);
    /*	<? php if (!isset($_GET['t'])):?>
    	let ft = localStorage.getItem('trFromTo');
    if (ft == 0) document.getElementById('selRev').selected = true;
    if (ft == 1) document.getElementById('selRev2').selected = true;
    	<? php endif ?>*/

    if (zlanguage != null) {
        //	

        language = zlanguage;
        if (document.getElementById("manifest") !== null) document.getElementById("manifest").href = "data/manifests/manifest" + zlanguage.toUpperCase() + ".json";
    } else {

        var userLang = navigator.language || navigator.userLanguage;
        language = "default";
        let l = "";
        if (navigator.language.includes("cs")) l = "cs";
        else if (userLang.includes("cs")) l = "cs";
        else if (userLang == "cs") l = "cs";
        else if (userLang == "de") l = "de";
        else if (userLang == "sk") l = "sk";
        else if (userLang == "jp") l = "jp";
        else l = "en";

        let el = document.getElementById("manifest");
        if (el == undefined) {
            let manifest = document.createElement("link");
            manifest.link = "data/manifests/manifest" + l.toUpperCase() + ".json";
            manifest.id = "manifest";
            manifest.rel = "manifest";
            document.head.appendChild(manifest);
        } else el.href = "data/manifests/manifest" + l.toUpperCase() + ".json";
    }
    DetectLoacation();
    if (zdev == null) dev = false;
    else dev = (zdev == "true");
    if (dev) {
        document.getElementById('whiteabout').style.display = 'block';
        document.getElementById('refresh').style.display = 'block';
        document.getElementById('uploadown').style.display = 'block';
    } else {
        document.getElementById('whiteabout').style.display = 'none';
        document.getElementById('refresh').style.display = 'none';
        document.getElementById('uploadown').style.display = 'none';
    }

    if (zbetaFunctions == null) betaFunctions = false;
    else betaFunctions = (zbetaFunctions == "true");
    document.getElementById('betaFunctions').checked = betaFunctions;

    if (zOnlyMoravia == null) onlyMoravia = "default";
    else onlyMoravia = zOnlyMoravia;
    document.getElementById('onlyMoravia').value = onlyMoravia;

    if (zstyleOutput == null) styleOutput = false;
    else styleOutput = (zstyleOutput == "true");
    if (zautoTranslate == null) {
        autoTranslate = true;
    } else autoTranslate = (zautoTranslate == "true");

    if (zTestingFunc == null) {
        testingFunc = false;
    } else {
        testingFunc = (zTestingFunc == "true");
    }

    if (!testingFunc) // document.querySelectorAll('.devlang').forEach(e => e.style.display='initial');
    //else
    { //document.getElementsByClassName('devFunction').forEach(e => e.style.display='none');
        document.querySelectorAll('.devFunction').forEach(e => /*e.classList.toggle("hidden")console.log(*/ e.style.display = 'none');
        //	console.log("!!!");
    }
    SetLanguage();

    //let sel = document.getElementById('selectorTo');

    //let n;

    /*   if (document.getElementById('selectorTo').value == "ha") {
           //n = "hanácko-český";
           document.getElementById('charHa').style.display = "flex";
           document.getElementById('charSo').style.display = "none";
       }
       if (document.getElementById('selectorTo').value == "so") {
           //n = "hanácko-český";
           document.getElementById('charSo').style.display = "flex";
           document.getElementById('charHa').style.display = "none";
       } else {
           //n = "česko-hanácký";
           document.getElementById('charsHa').style.display = "none";
           document.getElementById('charsVa').style.display = "none";
       }*/

    if (!autoTranslate) {
        document.getElementById('autoTranslate').style.display = "inline-block";
    }

    document.getElementById('lang').value = language;
    document.getElementById('manual').checked = autoTranslate;
    document.getElementById('styleOutput').checked = styleOutput;
    /* document.getElementById('testingFunc').checked = testingFunc;*/
    document.getElementById('dev').checked = dev;



    /*	if (dev) {
    		document.getElementById('moreInfo').style.display = 'block';
    		document.getElementById('refresh').style.display = 'block';
    	} else {
    		document.getElementById('moreInfo').style.display = 'none';
    		document.getElementById('refresh').style.display = 'none';
    	}*/
    loaded = true;
    imgMap = new Image();
    imgMap.src = "data/images/map.svg";

    imgMap_bounds = new Image();
    imgMap_bounds.src = "data/images/map_bounds.svg";

    //imgMap_hory = new Image();
    //imgMap_hory.src = "data/images/morava_hory.png";
    SetSavedTranslations();
    customTheme();

    //GetVocabulary();
    /*
	langHA_CS = new LanguageTr("HA_CS");
	langCS_HA = new LanguageTr("CS_HA");
	langHA = new LanguageTr("HA");
	langVA = new LanguageTr("VA");
	langMO = new LanguageTr("MO");
	langSL = new LanguageTr("SL");
	langSK = new LanguageTr("SK");
	langSLEZ = new LanguageTr("SLEZ");
	langLA = new LanguageTr("LA");
	langCT = new LanguageTr("Tesin");
	langHA_zabr = new LanguageTr("HA_ZABR");
	langBR = new LanguageTr("BR");
	langCS_je = new LanguageTr("CS_JE");

	langHA_CS.GetVocabulary(dev);
	langCS_HA.GetVocabulary(dev);
	langHA.GetVocabulary(dev);
	langVA.GetVocabulary(dev);
	langMO.GetVocabulary(dev);
	langSL.GetVocabulary(dev);
	langSK.GetVocabulary(dev);
	langSLEZ.GetVocabulary(dev);
	langLA.GetVocabulary(dev);
	langBR.GetVocabulary(dev);
	langCS_je.GetVocabulary(dev);
	langHA_zabr.GetVocabulary(dev);
	langCT.GetVocabulary(dev);
*/
    // Set transition
    /*if (theme=="theme")*/
    /*document.body.style.transition="background-color .3s";
    document.style.transition="background-color .3s";
    document.getElementById("nav").style.transition="background-color .3s";
    document.getElementById("lte").style.transition="background-color .3s, box-shadow .3s, outline 50ms, outline-offset 50ms";
    document.getElementById("rte").style.transition="background-color .3s, box-shadow .3s, outline 50ms, outline-offset 50ms";
    document.getElementById("header").style.transition="background-color .3s, color .3s;";*/
    window.addEventListener("resize", (event) => {
        window.requestAnimationFrame(mapRedraw);
    });

    mapSelectLang.addEventListener("wheel", function(e) {
        e.preventDefault();
        let prevZoom = map_Zoom;
        let delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);

        if (delta > 0) map_Zoom *= 1.2;
        else map_Zoom /= 1.2;
        if (map_Zoom <= 0.2) map_Zoom = 0.2;
        if (map_Zoom > 12) map_Zoom = 12;

        const rect = document.getElementById("mapSelectLang").getBoundingClientRect(); // Get canvas position relative to viewport
        const mouseX = e.clientX - rect.left; // Calculate mouse position relative to canvas
        const mouseY = e.clientY - rect.top;

        const imgMX = mouseX - map_LocX,
            imgMY = mouseY - map_LocY;

        const imgPMX = imgMX / (imgMap.width * prevZoom),
            imgPMY = imgMY / (imgMap.height * prevZoom);

        map_LocX -= (map_Zoom - prevZoom) * imgMap.width * imgPMX;
        map_LocY -= (map_Zoom - prevZoom) * imgMap.height * imgPMY;

        window.requestAnimationFrame(mapRedraw);
    });

    // Počet prstů na obrazovce
    mapSelectLang.addEventListener('mousedown', (e) => {
        e.preventDefault();
        moved = true;
        map_LocTmpX = e.clientX - map_LocX;
        map_LocTmpY = e.clientY - map_LocY;

        window.requestAnimationFrame(mapRedraw);
    });

    mapSelectLang.addEventListener('mouseup', (e) => {
        moved = false;
        window.requestAnimationFrame(mapRedraw);
    });

    mapSelectLang.addEventListener('click', (e) => {
        const rect = document.getElementById("mapSelectLang").getBoundingClientRect(); // Get canvas position relative to viewport
        const mouseX = e.clientX - rect.left; // Calculate mouse position relative to canvas
        const mouseY = e.clientY - rect.top /*-*/ ;
        mapClick(mouseX, mouseY);
        window.requestAnimationFrame(mapRedraw);
    });

    mapSelectLang.addEventListener('mousemove', (e) => {
        e.preventDefault();
        if (moved) {
            //	console.log('moved');
            map_LocX = e.clientX - map_LocTmpX;
            map_LocY = e.clientY - map_LocTmpY;

            //		const rect = document.getElementById("mapSelectLang"); // Get canvas position relative to viewport

            //		if (map_LocX>rect.clientWidth)map_LocX=rect.clientWidth;
            //		else if (map_LocX<-rect.clientWidth)map_LocX=-rect.clientWidth;

            //		if (map_LocY>rect.clientHeight)map_LocY=rect.clientHeight;
            //	else if (map_LocY<-rect.clientHeight)map_LocY=-rect.clientHeight;

            //	console.log(map_LocX,rect.clientWidth);
            //path1602.style.transform = "translate(" + (e.pageX-79.819305) + "px, " + (e.pageY-105.69204) + "px)";
            //setTransform();	
            //mapRedraw();
            window.requestAnimationFrame(mapRedraw);
            //mapZoom.style.top=positionY+"px";
            //mapZoom.style.left=positionX+"px";
        } else {
            const rect = document.getElementById("mapSelectLang").getBoundingClientRect(); // Get canvas position relative to viewport
            const mouseX = e.clientX - rect.left; // Calculate mouse position relative to canvas
            const mouseY = e.clientY - rect.top;
            //console.log('not moved')
            mapMove(mouseX, mouseY);
        }
    });

    var map_Touches = -1;
    var map_TouchStartX, map_TouchStartY;
    var map_MoveTime;
    mapSelectLang.addEventListener('touchstart', (e) => {
        //start move
        const rect = document.getElementById("mapSelectLang").getBoundingClientRect();
        var touch1 = e.touches[0] || e.changedTouches[0];
        let mx = touch1.pageX,
            my = touch1.pageY - rect.top;

        if (e.touches.length == 1) {
            console.log("touchstart move");
            e.preventDefault();
            moved = true;

            map_LocTmpX = mx - map_LocX;
            map_LocTmpY = my - map_LocY;

            map_TouchStartX = mx;
            map_TouchStartY = my;
            map_MoveTime = Date.now();
            map_Touches = 1;
            window.requestAnimationFrame(mapRedraw);
        } else {
            console.log("touchstart zoom");
            var touch2 = e.touches[1] || e.changedTouches[1];
            let m2x = touch2.pageX,
                m2y = touch2.pageY - rect.top;
            map_Touches = 2;
            e.preventDefault();

            // nastav hodnoty začáteční pozice
            map_LocTmpX = mx - map_LocX;
            map_LocTmpY = my - map_LocY;
            map_LocTmp2X = m2x - map_LocX;
            map_LocTmp2Y = m2y - map_LocY;
            map_ZoomInit = map_Zoom;
        }
    });

    mapSelectLang.addEventListener('touchend', (e) => {
        console.log("touchend");
        var touch = e.touches[0] || e.changedTouches[0];
        const rect = document.getElementById("mapSelectLang").getBoundingClientRect();

        // Jeden prst
        if (map_Touches == 1) {
            let mx = touch.pageX;
            let my = touch.pageY - rect.top;

            if (map_Touches == 2) {
                map_LocX -= map_LocTmpX;
                map_LocY -= map_LocTmpY;

                map_LocTmpX = 0;
                map_LocTmpY = 0;
                map_Touches = 1;
            }

            // <300ms kliknutí
            if ((Date.now() - map_MoveTime) < 300) {
                // <10px vzdálenost od začátku 
                let dX = mx - map_TouchStartX,
                    dY = my - map_TouchStartY;
                let d = Math.sqrt(dX * dX + dY * dY);
                if (d < 10) {
                    console.log("click!");
                    mapClick(mx, my);
                    return;
                }
            }
            map_Touches = 1;
        }

        window.requestAnimationFrame(mapRedraw);
    });
    let map_ZoomInit;
    mapSelectLang.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = document.getElementById("mapSelectLang").getBoundingClientRect();


        if (e.touches.length == 1) {
            console.log("mousemove move");
            var touch = e.touches[0] || e.changedTouches[0];
            let mx = touch.pageX,
                my = touch.pageY - rect.top;
            /*	if (map_Touches==2){
            		map_LocX-=map_LocTmpX;
            		map_LocY-=map_LocTmpY;

            		map_LocTmpX=0;
            		map_LocTmpY=0;
            		map_Touches=1;
            	}*/
            //console.log(touch.pageX,touch.pageY);

            if (moved) {
                map_LocX = mx - map_LocTmpX;
                map_LocY = my - map_LocTmpY;

                window.requestAnimationFrame(mapRedraw);
            } else {
                mapMove(touch.pageX, touch.pageY);
            }
            map_Touches = 1;
        } else if (e.touches.length == 2) {
            console.log("mousemove zoom");
            var touch1 = e.touches[0] || e.changedTouches[0];
            let m1x = touch1.pageX,
                m1y = touch1.pageY - rect.top;

            var touch2 = e.touches[1] || e.changedTouches[1];
            let m2x = touch2.pageX,
                m2y = touch2.pageY - rect.top;

            // start
            if (map_Touches != 2) {
                map_LocTmpX = m1x - map_LocX;
                map_LocTmpY = m1y - map_LocY;
                map_LocTmp2X = m2x - map_LocX;
                map_LocTmp2Y = m2y - map_LocY;
                map_ZoomInit = map_Zoom;
                map_Touches = 2;
            } else {
                // start distance
                let dx = map_LocTmpX - map_LocTmp2X,
                    dy = map_LocTmpY - map_LocTmp2Y;

                let start = Math.sqrt(dx * dx + dy * dy);

                // now distance
                dx = (m1x - map_LocX) - (m2x - map_LocX), dy = (m1y - map_LocY) - (m2y - map_LocY);
                console.log(map_LocTmpX, m1x - map_LocX);
                console.log(map_LocTmpY, m1y - map_LocY);
                console.log(map_LocTmp2Y, m2y - map_LocY);
                console.log(map_LocTmp2Y, m2y - map_LocY);
                let now = Math.sqrt(dx * dx + dy * dy);
                let prevZoom = map_Zoom;
                map_Zoom = map_ZoomInit / (start / now);

                // corect center of zoom
                const imgMX = (m1x + m2x) / 2 - map_LocX,
                    imgMY = (m1y + m2y) / 2 - map_LocY;

                const imgPMX = imgMX / (imgMap.width * prevZoom),
                    imgPMY = imgMY / (imgMap.height * prevZoom);

                map_LocX -= (map_Zoom - prevZoom) * imgMap.width * imgPMX;
                map_LocY -= (map_Zoom - prevZoom) * imgMap.height * imgPMY;

                window.requestAnimationFrame(mapRedraw);
            }
        }
    });

    /*	mapSelectLang.addEventListener('gesturechange', (e) => {
    		var touch = e.touches[0] || e.changedTouches[0];
    		//e.scale
    		//mapRedraw();
    	});
    	
    	mapSelectLang.addEventListener('gestureend', (e) => {
    		var touch = e.touches[0] || e.changedTouches[0];
    		
    		//mapRedraw();
    	});
    	
    	mapSelectLang.addEventListener('gesturestart', (e) => {
    		var touch = e.touches[0] || e.changedTouches[0];
    	//	e.scale
    		//mapRedraw();
    	});*/


    //	let el=document.getElementById("mapSelector");
    //	var zoom=1;
    //	let ZOOM_SPEED=1.2;
    //	var positionX=0;
    //var positionY=0;
    //let mapZoom=document.getElementById("map");
    let moved;
    //	let dPosX=0,dPosY=0;
    /*el.addEventListener("wheel", function(e) {
		//positionX=e.pageX-dPosX;
		//positionY=e.pageY-dPosY;
		e.preventDefault();
		//let scale=zoom;
		//if (scale>1.3) scale=1.3;
		//else if (scale<0.3) scale=0.7;
		//console.log(positionX);
	//	mapZoom.style.transformOrigin = positionX + "px, " + positionY + "px";
		
		
	//console.log("x",e.clientX);
	//console.log("y",e.clientY);
	//console.log("xx",positionX);
	//console.log("yy",positionY);
		let dX=-(positionX-e.clientX+e.currentTarget.offsetLeft)/zoom;
		let dY=-(positionY-e.clientY+e.currentTarget.offsetTop)/zoom;
		
		let delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);

		if (delta > 0) zoom *= 1.2; else  zoom /= 1.2;
if (zoom<=0.1)zoom=0.1;
if (zoom>10)zoom=10;
		//if (e.deltaY > 0) {   
		//	zoom *= ZOOM_SPEED;
			//mapZoom.style.transform = `scale(${zoom})`; 
			//positionX*=ZOOM_SPEED;
			//positionY*=ZOOM_SPEED; 
		//}else{    
		//	if (zoom<=0.1) return;
	//		zoom /= ZOOM_SPEED;
		//	mapZoom.style.transform = `scale(${zoom})`; 
			//positionX/=ZOOM_SPEED;
			//positionY/=ZOOM_SPEED;
	//	}		


	//	let dX2=(positionX-e.pageX)/zoom;
	//	let dY2=(positionY-e.pageY)/zoom;
	
		positionX=e.clientX-e.currentTarget.offsetLeft-dX*zoom;
		positionY=e.clientY-e.currentTarget.offsetTop-dY*zoom;

		//mapZoom.style.transform = `scale(${zoom})`; 
		setTransform();
	//	mapZoom.style.top=positionY+"px";
	//	mapZoom.style.left=positionX+"px";
//	mapRedraw();
	});

	el.addEventListener('mousedown', (e) => {
		e.preventDefault();
		moved = true;
		dPosX=e.clientX-positionX;
		dPosY=e.clientY-positionY;	mapRedraw();
	});
	
	el.addEventListener('mouseup', (e) => {
		moved = false;	mapRedraw();
	});

	el.addEventListener('mousemove', (e) => {
		e.preventDefault();
		if (moved) {
			
		//	console.log('moved');
			positionX=e.clientX-dPosX;
			positionY=e.clientY-dPosY;
			//path1602.style.transform = "translate(" + (e.pageX-79.819305) + "px, " + (e.pageY-105.69204) + "px)";
			setTransform();	mapRedraw();
			//mapZoom.style.top=positionY+"px";
			//mapZoom.style.left=positionX+"px";
		} else {
			//console.log('not moved')
		}
	});
	el.addEventListener('mouseup', () => {
		moved = false;mapRedraw();
	});

	function setTransform() {
        mapZoom.style.transform = "translate(" + positionX + "px, " + positionY + "px) scale(" + zoom + ")";

		let elements=document.getElementById("layer2").childNodes;
		for (let ele of elements) {
			if (ele.nodeName=="circle"){
				if (4/zoom>4)ele.setAttribute("r", 4);
				else ele.setAttribute("r", 4/zoom);
			}
			//console.log(ele.r);
		}

		
		for (let ele of document.getElementById("mapZoom").childNodes) {
			if (ele.nodeName=="SPAN"){
				//ele.style.fontSize=(1/zoom*100)+"%";
				//ele.style.fontSize=(1/zoom*10)+"px";
				ele.style.scale=(1/zoom);
					ele.style.marginTop=(8/zoom)+"mm";
				//ele.style.height=(1/zoom*100)+"%";
			}
			//console.log(ele.r);
		}
	 //mapZoom.style.width=(100*zoom) + "%";
	 //mapZoom.style.height=(100*zoom) + "%";
	 //mapZoom.style.top=positionY + "px";
	 //mapZoom.style.left=positionX + "px";
      }*/
}

function SetSavedTranslations() {
    if (saved.length > 0) {
        document.getElementById("savedDiv").style.display = "block";

        let parent = document.getElementById("transl");
        parent.innerHTML = "";

        for (let i = 0; i < saved.length; i++) {
            let tr = saved[i];
            let p = document.createElement("p");
            p.className = "savedItem";
            if (usingTheme) p.classList.add("theme");
            p.id = "savedTrans" + i;
            p.index = i;
            let txt = document.createElement("div");
            txt.style = "display: grid; width: -webkit-fill-available;";
            txt.className = "innertxttranscont";
            if (usingTheme) txt.classList.add("theme");
            txt.onclick = function() {
                if (!tr.fromTo) document.getElementById("selectorTo").selectedIndex = 1;
                else document.getElementById("selectorTo").selectedIndex = 0;
                document.getElementById("specialTextarea").value = tr.input;
                document.getElementById("outputtext").innerText = tr.output;
            };
            p.appendChild(txt);
            txt.addEventListener('mouseover', function() {
                p.classList.add('mouseover');
                /*if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                	p.style.backgroundColor = "#001b33";
                	p.style.boxShadow = "0 0 3px 2px #001b33";
                } else {
                	p.style.backgroundColor = "#cce7ff";
                	p.style.boxShadow = "0 0 3px 2px #cce7ff";
                }*/
            });
            txt.addEventListener('mouseleave', function() {
                p.classList.remove('mouseover');
                /*if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                	p.style.backgroundColor = "#001227";
                	p.style.boxShadow = "0 0 5px #001227";
                } else {
                	p.style.backgroundColor = "aliceblue";
                	p.style.boxShadow = "0 0 5px aliceblue";
                }*/
            });

            let buttonClose = document.createElement('a');
            buttonClose.className = "butIc";
            buttonClose.style = "height: 24px; width:24px; padding: 18px;";
            buttonClose.innerHTML = "<svg id='butclose' class='ib' focusable='false' viewBox='0 0 24 24' style=''><path d='M 10 12 L 2 20 L 4 22 L 12 14 L 20 22 L 22 20 L 14 12 L 22 4 L 20 2 L 12 10 L 4 2 L 2 4 Z'/></svg>";
            buttonClose.onclick = function() {
                saved.splice(p.index, 1);
                localStorage.setItem('saved', JSON.stringify(saved));

                document.getElementById("savedTrans" + p.index).remove();
                SetSavedTranslations();
            };
            p.appendChild(buttonClose);
            let spanF = document.createElement("span");
            spanF.innerText = tr.input;
            spanF.className = "savedItemFrom";
            if (usingTheme) spanF.classList.add("theme");
            txt.appendChild(spanF);

            let spanTo = document.createElement("span");
            spanTo.innerText = tr.output;
            spanTo.className = "savedItemTo";
            if (usingTheme) spanTo.classList.add("theme");
            txt.appendChild(spanTo);

            parent.appendChild(p);
        }
    } else {
        document.getElementById("savedDiv").style.display = "none";
    }
}

function comparelr(a, b) {
    if (a.input.length > b.input.length) {
        return -1;
    }
    if (a.input.length < b.input.length) {
        return 1;
    }
    return 0;
}

function Count(text, find) {
    let count = 0;
    for (let i = 0; i < text.length; i++) {
        if (find == text.charAt(i)) count++;
    }
    return count;
}

function handleEnter(e) {
    var keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode == '13') {
        document.activeElement.click();
    }
}

function textAreaAdjust() {
    let textarea = document.getElementById("specialTextarea");
    textarea.style.height = "1px";
    textarea.style.height = (25 + textarea.scrollHeight) + "px";
}

function isNumber(num) {
    return !isNaN(num);
}

function SetText(input) {
    let from = document.getElementById('selectorFrom').value;
    let to = document.getElementById('selectorTo').value;


    if (from == "cs" && to == "ha") {
        {
            let selectedReplace1 = document.getElementById("langHaStriska").value;
            if (selectedReplace1 == 'Zadna') {
                input = input.replaceAll('ê', 'e');
                input = input.replaceAll('ô', 'o');
            }
        }
    }

    if (from == "cs" && to == "slez") {
        {
            let selectedReplace1 = document.getElementById("langSlezSraj").value;
            if (selectedReplace1 == 'Steuer') {
                if (input)
                    if (input.startsWith('ô')) input.replace('ô', 'uůd');
            }
            if (selectedReplace1 == 'Slabikor') {

            }
        }
    }
    if (from == "cs" && to == 'mo') {
        let selectedReplace0 = document.getElementById("langMoOU").value;
        if (selectedReplace0 == 'u') {
            input = input.replaceAll('ou', 'ú');
        }
        if (selectedReplace0 == 'o') {
            input = input.replaceAll('ou', 'ó');
        } {
            let selectedReplace1 = document.getElementById("langMoD").value;
            if (selectedReplace1 == 'dj') {
                input = input.replaceAll('ď', 'dj');
                input = input.replaceAll('ť', 'tj');
                input = input.replaceAll('ň', 'nj');
            }
        } {
            let selectedReplace2 = document.getElementById("langMoNEJ").value;
            if (selectedReplace2 == 'ne') {
                input = input.replaceAll('nej', 'né');
            }
            if (selectedReplace2 == 'naj') {
                input = input.replaceAll('nej', 'naj');
            }
        } {
            let selectedReplace3 = document.getElementById("langMoL").value;
            if (selectedReplace3 == 'ł') {
                input = input.replaceAll('ł', 'l');
                input = input.replaceAll('Ł', 'Ł');
            }
        } {
            let selectedReplace = document.getElementById("langMoT").value;
            if (selectedReplace == 't') {
                input = input.replaceAll('ṫ', 't');
            }
            if (selectedReplace == 'ť') {
                input = input.replaceAll('ṫ', 'ť');
            }
        } {
            let selectedReplace = document.getElementById("langMoCh").value;
            if (selectedReplace == 'ch') {
                input = input.replaceAll('x', 'ch');
            }
        } {
            let selectedReplace = document.getElementById("langMoX").value;
            if (selectedReplace == 'x') {
                input = input.replaceAll('ks', 'x');
            }
        } {
            let selectedReplace = document.getElementById("langMoEj").value;
            if (selectedReplace == 'e') {
                input = input.replaceAll('dej', 'dé');
                input = input.replaceAll('nej', 'né');
            }
            if (selectedReplace == 'aj') {
                input = input.replaceAll('dej', 'daj');
                input = input.replaceAll('nej', 'naj');
            }
        }
    }

    return input;
}

function ConvertHTMLCodeToUpperCase(input) {
    let building = "";
    let htmlTag;

    for (let i = 0; i < input.length; i++) {
        let char = input[i];
        if (char == "<") {
            htmlTag = true;
        } else if (char == ">") {
            htmlTag = false;
        }

        if (htmlTag) {
            building += char;
        } else {
            building += char.toUpperCase();
        }
    }

    return building;
}

function ConvertHTMLCodeSetUpperCaseFirst(input) {
    //	if (index.length==1) return input.charAt(0).toUpperCase();

    let building = "";
    let setUp = false;
    let htmlTag;

    for (let i = 0; i < input.length; i++) {
        let char = input[i];
        if (char == "<") {
            htmlTag = true;
        } else if (char == ">") {
            htmlTag = false;
        }

        if (htmlTag) {
            building += char;
        } else {
            if (setUp) {
                building += char;
            } else {
                building += char.toUpperCase();
                setUp = true;
            }
        }
    }
    return building;
}

function timeoutEnableTranslating() {
    enabletranslate = true;
}

function insertAtCursor(myField, myValue) {
    //myField.focus();
    reportSelection();
    var posssd = EditorCursorStart + 1;
    myField.innerText += myValue;
    
    pos = posssd;
    EditorCursorStart = posssd;
    setCursor();
    myField.focus();
}


var EditorCursorStart;
var EditorCursorEnd;

function reportSelection() {
    HidePopUps();
    var selOffsets = getSelectionCharacterOffsetWithin(document.getElementById("specialTextarea"));
    EditorCursorStart = selOffsets.start;
    EditorCursorEnd = selOffsets.end;
    //console.log("EditorCursorStart"+EditorCursorStart);
    //	console.log("EditorCursorEnd"+EditorCursorEnd);
    //document.getElementById("selectionLog").innerHTML = "Selection offsets: " + selOffsets.start + ", " + selOffsets.end;
}
var cp = 0,
    pos = 0;
var cup;

function setCursor() {
    HidePopUps();
    let tag = document.getElementById("specialTextarea");

    // Creates range object
    var setpos = document.createRange();

    // Creates object for selection
    let set = window.getSelection();

    // Set start position of range

    //SearchIn(tag);
    //console.log(EditorCursorStart);
    //cp=0;
    cup = pos;
    //setpos.setStart(tag, EditorCursorStart);
    //	setpos.setStart(tag,1/* EditorCursorStart*/);
    //	setpos.setEnd(tag, 1/*EditorCursorEnd*/);
    //	console.log('len:'+tag.innerText.length);
    //setpos.setStart(tag, cup/*-cp*/);
    /*	for (let i=0; i<tag.childNodes.length; i++) {
    		let at=tag.childNodes[i];
    		if (at.nodeType != Node.TEXT_NODE){
    			if (cup-at.innerText.length<=pos) {

    				// setpos.setStart(at, cup);
    				setpos.setStart(at, cup);
    				break;
    			} else {
    				if (cup-at.innerText.length<=pos) {
    					cup-=at.innerText.length;
    					break;
    				}
    			}
    		}else{
    			setpos.setStart(tag, cup);
    			break;
    		}
    	//	at.innerText
    	}*/
    SearchIn(tag);

    function SearchIn(parent) {
        //console.log("setpos: "+cp);
        //	console.log("pos: "+pos);
        if (!parent.hasChildNodes()) {

            // Inside this node

            let txt = parent.nodeValue;
            //console.log("parent.nodeValue: "+parent.nodeValue);
            //console.log("|"+(txt)+"|");
            //	console.log("pos: "+(cup/*-cp*/));

            if (txt == " ") {
                if (txt.length >= cup) {
                    setpos.setStart(parent, /*20*/ cup);
                    //	console.log("cursor set: "+pos);
                    return true;
                }
                cup -= 1;
                return false;
            } else {
                if (txt == null) return false;
                if (parent.rightNode)
                    if (txt.length > cup || txt.length == cup) {
                        if (cup < 0) {
                            setpos.setStart(parent, 0);
                            return true;
                        } else setpos.setStart(parent, cup);
                        //	console.log("setpos def: "+pos));
                        //	console.log("cursor set: "+cup);
                        return true;

                    } else {
                        cup -= txt.length;
                        //console.log("setpos: "+(cup));
                        return false;
                    }
            }


        } else {
            //	console.log(parent.childNodes);
            for (let i = 0; i < parent.childNodes.length; i++) {
                let child = parent.childNodes[i];
                if (child.innerText != "") {
                    if (SearchIn(child)) return true;
                }
                /*else {
                	// Enter
                	console.log("cursor set: "+pos);
                	cup++;
                	if (1 >= cup) {
                		setpos.setStart(parent, cup);
                		return true;
                	}else{
                	//cup--;
                	}
                }*/
            }
        }
    }

    // Collapse range within its boundary points
    // Returns boolean
    setpos.collapse(true);

    // Remove all ranges set
    set.removeAllRanges();

    // Add range with respect to range object.
    set.addRange(setpos);

    // Set cursor on focus
    tag.focus();
}

String.prototype.insert = function(index, string) {
    if (this == "") return string;
    if (index == this.length - 1) return string + this;
    if (index > 0) return this.substring(0, index) + string + this.substr(index);

    return string + this;
};
var pos2;

function insert2(strins) {
    HidePopUps();
    let tag = document.getElementById("specialTextarea");
    tag.focus();

    reportSelection();
    pos2 = EditorCursorStart;
    var setpos = document.createRange();

    let set = window.getSelection();
    //let cup2=pos2;

    SearchIn(tag);

    if (tag.childNodes.length == 0) {
        tag.innerText = strins;
        setpos.setStart(tag, 1);
    }

    function SearchIn(parent) {
        if (!parent.hasChildNodes()) {
            let txt = parent.nodeValue;

            //	if (parent.tag="br") {
            //	console.log(parent);
            //} else
            if (txt == " ") {
                if (txt.length >= pos2) {
                    //	console.log("pos1: "+pos2);
                    parent.nodeValue = txt.insert(pos2, strins);
                    setpos.setStart(parent, pos2 + 1);
                    return true;
                }
                pos2 -= 1;
                return false;
            } else {
                if (txt == null) return false;
                //	console.log("txt.length: "+txt.length);
                //	console.log("pos2: "+pos2);

                if (txt.length > pos2 || txt.length == pos2) {
                    if (pos2 < 0) {
                        parent.nodeValue = txt.insert(0, strins);
                        setpos.setStart(parent, pos2 + 1 /*1 0*/ );
                        //	console.log("pos2: "+pos2);
                        return true;
                    } else {
                        parent.nodeValue = txt.insert(pos2, strins);
                        setpos.setStart(parent, pos2 + 1);
                        //	console.log("pos3: "+pos2);
                        return true;
                    }
                    return true;

                } else {
                    pos2 -= txt.length;
                    return false;
                }
            }
        } else {
            for (let i = 0; i < parent.childNodes.length; i++) {
                let child = parent.childNodes[i];
                if (child.innerText != "") {
                    if (SearchIn(child)) return true;
                }
            }

        }
    }

    setpos.collapse(true);
    set.removeAllRanges();
    set.addRange(setpos);
    tag.focus();

    //	SpellingJob();
}

function getSelectionCharacterOffsetWithin(element) {
    var start = 0;
    var end = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;

    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.startContainer, range.startOffset);
            start = preCaretRange.toString().length;
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            end = preCaretRange.toString().length;
        }
    } else if ((sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToStart", textRange);
        start = preCaretTextRange.text.length;
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        end = preCaretTextRange.text.length;
    }

    return { start: start, end: end };
}

function HidePopUps() {
    let popups = document.getElementsByClassName('pop');
    for (let i = 0; i < popups.length; i++) {
        let el = popups[i];
        if (!(typeof el == 'undefined')) {
            el.remove();
        }
    }
}

var spellingDoing = false;
var idPopsSpelling;

function SpellingJob() {
    if (spellingDoing) return;
    spellingDoing = true;

    HidePopUps();

    reportSelection();
    console.log(EditorCursorStart);
    let parent = document.getElementById("specialTextarea");
    //let tr=document.createElement('textarea');
    //	tr.value=
    let text = parent.innerText; //tr.value;textContent

    //	let parent = document.createElement('div');
    //pparent.appendChild(parent);
    idPopsSpelling = 0;
    //	console.log("EditorCursorStart "+EditorCursorStart);
    if (text == "") {
        if (dev) console.log("Done spelling!");
        spellingDoing = false;
        //parent.innerHTML='<span class="placeholder" pseudo="-webkit-input-placeholder">Zde se objeví překlad</span>';
        return;
    }
    parent.innerHTML = "";

    let limit = text.length + 5;
    //let outText="";
    let separators = [ /*nbsp->*/ '\xa0', ' ', '%', '.', ',', ';', '!', '–', '…', '‚', '‘', '(', ')', '/', '?', ':', '-', '°', '„', '“', '"', "'", '’', '=', '<', '>', '+', '\t'];


    while (true) {
        // No infinitive
        limit--;
        if (limit < 0) {
            if (dev) console.log("Špatně neprogramováno SpellingJob");
            break;
        }

        let near = 10000000000;
        var sepIndex = -1;

        for (let i = 0; i < separators.length; i++) {
            let sep = separators[i];
            if (text.includes(sep)) {
                let len = text.indexOf(sep);
                if (len < near) {
                    near = len;
                    sepIndex = i;
                }
            }
        }

        if (sepIndex != -1) {
            if (near > 0) {
                AddWord(parent, text.substr(0, near));

                text = text.substring(near);
            }
            if (text.length > 0) {
                let f1 = text[0];

                if (isSymbolUnsuported(f1)) {
                    let skjblkblk = document.createElement('span');
                    skjblkblk.innerText = f1;
                    skjblkblk.className = "symolerror";
                    parent.appendChild(skjblkblk);
                    text = text.substring(1);
                    continue;
                }

                if (text.length > 1) {
                    let f2 = text[1];

                    if (f1 == " " || f1 == "\xa0") {
                        if (isSymbolAfterSpace(f2)) {
                            let skjblkblk = document.createElement('span');
                            skjblkblk.innerText = f1;
                            skjblkblk.className = "symolerror";
                            parent.appendChild(skjblkblk);
                            text = text.substring(2);
                            continue;
                        }
                        if (f2 == " " || f2 == "\xa0") {
                            let skjblkblk = document.createElement('span');
                            skjblkblk.innerText = f1;
                            skjblkblk.className = "symolerror";
                            parent.appendChild(skjblkblk);
                            text = text.substring(2);
                            continue;
                        }
                    }

                    if (isSymbolBeforeSpace(f1)) {
                        if (f2 == " " || f2 == "\xa0") {
                            let skjblkblk = document.createElement('span');
                            skjblkblk.innerText = f1;
                            skjblkblk.className = "symolerror";
                            parent.appendChild(skjblkblk);
                            text = text.substring(2);
                            continue;
                        }
                        if (isLetterAbcd(f2)) {
                            let skjblkblk = document.createElement('span');
                            skjblkblk.innerText = f1;
                            skjblkblk.className = "symolerror";
                            parent.appendChild(skjblkblk);
                            text = text.substring(1);
                            continue;
                        }
                    }

                    if (isSymbolAfterSpace(f1)) {
                        if (isLetterAbcd(f2)) {
                            let skjblkblk = document.createElement('span');
                            skjblkblk.innerText = f1;
                            skjblkblk.className = "symolerror";
                            parent.appendChild(skjblkblk);
                            text = text.substring(1);
                            continue;
                        }
                    }
                }
                /*let xx=text.substring(0,2);

				if (xx=="  " || xx==" ." || xx==" ," || xx==" ?" || xx==" ;" || xx=="'" || xx=='"' || xx=='”'|| xx=='‘'
				||	xx=="\xa0\xa0" || xx=="\xa0." || xx=="\xa0," || xx=="\xa0?" || xx=="\xa0;"
					) {
			//	console.log("|"+xx+"|");
					let skjblkblk=document.createElement('span');
					skjblkblk.innerText=xx;
					skjblkblk.className="symolerror";
					parent.appendChild(skjblkblk);
					text=text.substring(xx.length);
					continue;
				}
				if (xx[1].is)*/
            }

            let symbol = document.createTextNode(separators[sepIndex]);
            parent.appendChild(symbol);
            text = text.substring(1);
        } else {
            AddWord(parent, text);
            text = "";
            break;
        }
    }

    pos = EditorCursorStart;
    setCursor();

    if (dev) console.log("Done spelling!");
    spellingDoing = false;
}

function isLetterAbcd(ch) {
    let code = ch.charCodeAt();

    // basic slall
    if (code > 96 && code < 123) return true;

    // basic big
    if (code > 64 && code < 91) return true;

    switch (ch) {
        case 'ô':
            return true;
        case 'ê':
            return true;
        case 'á':
            return true;
        case 'é':
            return true;
        case 'ó':
            return true;
        case 'í':
            return true;
        case 'ý':
            return true;
        case 'ú':
            return true;
        case 'ů':
            return true;

        case 'Ô':
            return true;
        case 'Ê':
            return true;
        case 'Á':
            return true;
        case 'É':
            return true;
        case 'Ó':
            return true;
        case 'Í':
            return true;
        case 'Ý':
            return true;
        case 'Ú':
            return true;
        case 'Ů':
            return true;

        case 'š':
            return true;
        case 'č':
            return true;
        case 'ř':
            return true;
        case 'ž':
            return true;
        case 'ě':
            return true;
        case 'ň':
            return true;
        case 'ď':
            return true;
        case 'ť':
            return true;

        case 'Š':
            return true;
        case 'Č':
            return true;
        case 'Ř':
            return true;
        case 'Ž':
            return true;
        case 'Ě':
            return true;
        case 'Ň':
            return true;
        case 'Ď':
            return true;
        case 'Ť':
            return true;
    }

    return false;
}

function isLetterNumber(ch) {
    switch (ch) {
        case '0':
            return true;
        case '1':
            return true;
        case '2':
            return true;
        case '3':
            return true;
        case '4':
            return true;
        case '5':
            return true;
        case '6':
            return true;
        case '7':
            return true;
        case '8':
            return true;
        case '9':
            return true;
    }

    return false;
}

function isSymbolAfterSpace(ch) {
    switch (ch) {
        case ',':
            return true;
        case '.':
            return true;
        case ';':
            return true;
        case '?':
            return true;
        case '!':
            return true;
        case '%':
            return true;

        case '„':
            return true;
        case '‚':
            return true;
    }

    return false;
}

function isSymbolUnsuported(ch) {
    switch (ch) {
        case "'":
            return true;
        case '"':
            return true;
        case '‘':
            return true;
        case '»':
            return true;
        case '«':
            return true;
    }

    return false;
}

function isSymbolBeforeSpace(ch) {
    switch (ch) {
        //	case '“': return true;
        //	case '‘': return true;
    }

    return false;
}

function AddWord(parentToAdd, w) {
    if (w == "") return;
    let search = w.toLowerCase();
    let reverse = document.getElementById('selRev').selected;

    for (let i = 0; i < dic.Words.length; i++) {
        let word = dic.Words[i];

        let dggdfg = reverse ? word.input : word.output;

        for (let j = 0; j < dggdfg.length; j++) {
            if (search == dggdfg[j]) {
                let span = document.createTextNode(w);
                parentToAdd.appendChild(span);
                return;
            }
        }
    }

    for (let i = 0; i < Phrases.length; i++) {
        let phrase = Phrases[i];

        let dggdfg = reverse ? phrase.input : phrase.output;

        for (let j = 0; j < dggdfg.length; j++) {
            if (search == dggdfg[j]) {
                let span = document.createTextNode(w);
                parentToAdd.appendChild(span);
                return;
            }
        }
    }

    for (let i = 0; i < SameWords.length; i++) {
        let word = SameWords[i];

        if (search == word.input) {
            let span = document.createTextNode(w);
            parentToAdd.appendChild(span);
            return;
        }
    }

    // Projít opravy
    if (reverse) {
        /*	for (let i = 0; i < RepairsC.length; i++) {
        		let rep = RepairsC[i];
        		if (rep.input == search) {
        			let pack = document.createElement("span");
        			pack.style = "display: inline-block;";
        			//let idText = "txts" + idPopsSpelling, idPopUp = "pops" + idPopsSpelling;
        			let span = document.createElement("span");

        			span.addEventListener('click', function () {
        				if (box.style.opacity == "1") {
        					box.style.opacity = "0";
        					setTimeout(function () { box.style.display = 'none'; }, 100);
        				} else {
        					box.style.display = 'block';
        					box.style.opacity = "1";
        					box.setAttribute("canHide", false);
        					setTimeout(function () { box.setAttribute("canHide", true); }, 100);
        				}
        			});

        			let box = document.createElement("ul");

        			if (styleOutput) span.className = "chigau";

        		//	box.id = idPopUp;
        			box.style = "opacity: 0;";
        			box.setAttribute("canHide", false);
        			box.style.display = "none";
        			box.className = "pop";
        			box.contenteditable=false;

        			let set = re.output;

        			for (let i = 0; i < set.length; i++) {
        				let tagspe = document.createElement("li");
        				tagspe.style = "cursor: pointer;";

        				if (w == search.toUpperCase()) {
        					tagspe.innerText = set[i].toUpperCase();
        				} else if (w.charAt(0) == search.charAt(0).toUpperCase()) {
        					tagspe.innerText = set[i].charAt(0).toUpperCase() + set[i].substring(1);
        				} else {
        					tagspe.innerText = set[i];
        				}

        				tagspe.addEventListener('click', function () {
        					rep.selectedIndex = i;
        					span.innerText = tagspe.innerText;
        				//	console.log("i"+i);
        				//	console.log("tagspe.innerText"+tagspe.innerText);
        					box.style.opacity = "0";
        					box.style.display = "none";
        					box.setAttribute("canHide", false);
        					setTimeout(function () { box.style.display = 'none'; }, 100);
        				});
        				box.appendChild(tagspe);
        			}



        			window.addEventListener('click', function (e) {
        				if (!box.contains(e.target)) {
        					if (!span.contains(e.target)) {
        						if (box.style.opacity == "1") {
        							if (box.getAttribute("canHide")) {
        								box.style.opacity = "0";
        								setTimeout(function () {
        									if (box.getAttribute("canHide")) {
        										box.style.display = 'none';
        										box.setAttribute("canHide", false);
        									}
        								}, 100);
        							}
        						}
        					}
        				}
        			});

        			if (w == search.toUpperCase()) {
        				span.innerText = set[rep.selectedIndex].toUpperCase();
        			} else if (w.charAt(0) == search.charAt(0).toUpperCase()) {
        				span.innerText = set[rep.selectedIndex].charAt(0).toUpperCase() + set[rep.selectedIndex].substring(1);
        			} else {
        				span.innerText = set[rep.selectedIndex];
        			}
        			pack.appendChild(span);
        				pack.appendChild(box);

        			parentToAdd.appendChild(pack);
        			idPopsSpelling++;

        			return;
        		}
        	}*/
    } else {
        for (let i = 0; i < RepairsH.length; i++) {
            let rep = RepairsH[i];

            if (rep.input == search) {
                /*let pack = document.createElement("span");
				pack.style = "display: inline-block;";
				let idText = "txts" + idPopsSpelling, idPopUp = "pops" + idPopsSpelling;
				let span = document.createElement("span");
				let set = rep.output;
				//span.setAttribute=idPopUp;
				 span.className = "chigau";

				span.addEventListener('click', function () {
					let el=document.getElementById(idPopUp);

					if (el === null) {

						let box = document.createElement("ul");

						box.id = idPopUp;
						box.style = "opacity: 1; user-select: none;caret-color: transparent;";
						box.setAttribute("canHide", false);
						box.style.display = "block";
						box.className = "pop";
						box.contenteditable=false;
						box.readonly=true;

						for (let i = 0; i < set.length; i++) {
							let tagspe = document.createElement("li");
							box.appendChild(tagspe);
							tagspe.height="30";
							tagspe.width="100";
							//tagspe.class="popspe";
							tagspe.style = "cursor: pointer;height: 30px;width:100px;display: block;";
							//var ctx = tagspe.getContext("2d");
							//ctx.font = "5mm system-ui";

							tagspe.innerHTML=set[i];
							if (w == search.toUpperCase()) {
								tagspe.innerText = set[i].toUpperCase();
							} else if (w.charAt(0) == search.charAt(0).toUpperCase()) {
								tagspe.innerText = set[i].charAt(0).toUpperCase() + set[i].substring(1);
							} else {
								tagspe.innerText = set[i];
							}
						//	ctx.fillText(tagspe.innerText,10,20);

							tagspe.addEventListener('click', function () {
								rep.selectedIndex = i;
								span.innerText = tagspe.innerText;//set[i];
							//	box.style.opacity = "0";
							//	box.style.display = "none";
							//	box.setAttribute("canHide", false);
							//	setTimeout(function () { box.style.display = 'none'; }, 100);
								box.outerHTML="";
							});
						}

						box.addEventListener('click', function () {
							this.innerHTML=this.innerHTML;
						});

						window.addEventListener('click', function (e) {
							if (!box.contains(e.target)) {
								if (!span.contains(e.target)) {
									if (box.style.opacity == "1") {
									//	if (box.getAttribute("canHide")) {
										if (!(box === null)){
										//	console.log(box.parent);
											if (typeof box.parent == 'undefined'){
												box.remove();
											}
										}
										//	box.style.opacity = "0";
										//	setTimeout(function () {
										///		if (box.getAttribute("canHide")) {
										//			box.style.display = 'none';
											//		box.setAttribute("canHide", false);
										//		}
										//	}, 100);
										//}
									}
								}
							}
						});
						pack.appendChild(box);
					} else {
						el.outerHTML="";
					}
				});

				if (w == search.toUpperCase()) {
					span.innerText = search[rep.selectedIndex].toUpperCase();
				} else if (w.charAt(0) == search.charAt(0).toUpperCase()) {
					span.innerText = set[rep.selectedIndex].charAt(0).toUpperCase() + set[rep.selectedIndex].substring(1);
				} else {
					span.innerText = set[rep.selectedIndex];
				}

				pack.appendChild(span);
				//	pack.appendChild(box);

				parentToAdd.appendChild(pack);
			//	let x=document.createElement("span");

			//	parentToAdd.appendChild(x);
				idPopsSpelling++;*/
                let pack = document.createElement("span");
                pack.style = "display: inline-block;";
                let idPopUp = "pops" + idPopsSpelling;
                let span = document.createElement("span");

                span.className = "chigau";

                span.addEventListener('click', function() {
                    let el = document.getElementById(idPopUp);

                    if (el === null) {

                        let box = document.createElement("ul");

                        box.id = idPopUp;
                        box.style = "padding: 0px; opacity: 1; user-select: none; caret-color: transparent;";
                        box.setAttribute("canHide", false);
                        box.style.display = "block";
                        box.className = "pop";
                        box.contenteditable = false;
                        box.readonly = true;

                        for (let i = 0; i < rep.output.length; i++) {
                            let tagspe = document.createElement("li");
                            box.appendChild(tagspe);
                            tagspe.style = "cursor: pointer; height: 30px; width:100px; display: block;margin: 7px;font-style: italic;";
                            //if (i==0) tagspe.style.color="rgb(200,0,0)";
                            tagspe.innerHTML = rep.output[i];
                            if (w == search.toUpperCase()) {
                                tagspe.innerText = rep.output[i].toUpperCase();
                            } else if (w.charAt(0) == search.charAt(0).toUpperCase()) {
                                tagspe.innerText = rep.output[i].charAt(0).toUpperCase() + rep.output[i].substring(1);
                            } else {
                                tagspe.innerText = rep.output[i];
                            }

                            tagspe.addEventListener('click', function() {
                                //rep.output.selectedIndex = i;
                                span.innerText = tagspe.innerText;
                                box.outerHTML = "";
                                SpellingJob();
                            });
                        }
                        pack.appendChild(box);

                        // separator
                        let tagsep = document.createElement("li");
                        tagsep.style = "height: 2px; /*width:100px;*/ display: block; padding: 0px; background-color: gray; margin: 0px;";
                        box.appendChild(tagsep);

                        // Add to vocab
                        let tagcan = document.createElement("li");
                        box.appendChild(tagcan);
                        tagcan.style = "border-radius: 0 0 5px 5px; cursor: pointer; /*height: 30px; width:100px;*/ display: block; padding: 7px; background-color: #cce7ff; margin: 0;";

                        tagcan.innerText = "Přidat do slovníku";

                        tagcan.addEventListener('click', function() {
                            AddToVocabHA(w.toLowerCase());
                            if (pack.contains(box)) box.outerHTML = "";
                        });

                        box.addEventListener('click', function() {
                            this.innerHTML = this.innerHTML;
                        });

                        window.addEventListener('click', function(e) {
                            if (!box.contains(e.target)) {
                                if (!span.contains(e.target)) {
                                    if (box.style.opacity == "1") {
                                        if (!(box === null)) {
                                            if (typeof box.parent == 'undefined') {
                                                box.remove();
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        el.outerHTML = "";
                    }
                });
                span.innerText = w;

                pack.appendChild(span);

                parentToAdd.appendChild(pack);

                idPopsSpelling++;
                return;
            }
        }
    }

    if (!isNaN(w)) {
        let span = document.createTextNode(w);
        parentToAdd.appendChild(span);
        return;
    }

    if (!reverse) {
        // From vocabulary
        for (let i = 0; i < myVocabHA.length; i++) {
            let voc = myVocabHA[i];

            if (search == voc) {
                let span = document.createTextNode(w);
                parentToAdd.appendChild(span);
                return;
            }
        }

        // Foreach world to find without circumflex
        let xsearch = search;

        for (let i = 0; i < dic.Words.length; i++) {
            let word = dic.Words[i];

            let set = reverse ? word.input : word.output;

            for (let j = 0; j < set.length; j++) {
                if (xsearch == set[j].replaceAll('ô', 'o').replaceAll('ê', 'e')) {

                    let pack = document.createElement("span");
                    pack.style = "display: inline-block;";
                    let idPopUp = "pops" + idPopsSpelling;
                    let span = document.createElement("span");

                    span.className = "chigau";

                    span.addEventListener('click', function() {
                        let el = document.getElementById(idPopUp);

                        if (el === null) {

                            let box = document.createElement("ul");

                            box.id = idPopUp;
                            box.style = "padding: 0px; opacity: 1; user-select: none; caret-color: transparent;";
                            box.setAttribute("canHide", false);
                            box.style.display = "block";
                            box.className = "pop";
                            box.contenteditable = false;
                            box.readonly = true;

                            for (let i = 0; i < set.length; i++) {
                                let tagspe = document.createElement("li");
                                box.appendChild(tagspe);
                                tagspe.style = "cursor: pointer; height: 30px; width:100px; display: block;margin: 7px;font-style: italic;";
                                //if (i==0) tagspe.style.color="rgb(200,0,0)";
                                tagspe.innerHTML = set[i];
                                if (w == search.toUpperCase()) {
                                    tagspe.innerText = set[i].toUpperCase();
                                } else if (w.charAt(0) == search.charAt(0).toUpperCase()) {
                                    tagspe.innerText = set[i].charAt(0).toUpperCase() + set[i].substring(1);
                                } else {
                                    tagspe.innerText = set[i];
                                }

                                tagspe.addEventListener('click', function() {
                                    set.selectedIndex = i;
                                    span.innerText = tagspe.innerText;
                                    box.outerHTML = "";
                                    SpellingJob();
                                });
                            }
                            pack.appendChild(box);

                            // separator
                            let tagsep = document.createElement("li");
                            tagsep.style = "height: 2px; /*width:100px;*/ display: block; padding: 0px; background-color: gray; margin: 0px;";
                            box.appendChild(tagsep);

                            // Add to vocab
                            let tagcan = document.createElement("li");
                            box.appendChild(tagcan);
                            tagcan.style = "border-radius: 0 0 5px 5px; cursor: pointer; /*height: 30px; width:100px;*/ display: block; padding: 7px; background-color: #cce7ff; margin: 0;";

                            tagcan.innerText = "Přidat do slovníku";

                            tagcan.addEventListener('click', function() {
                                AddToVocabHA(w.toLowerCase());
                                if (pack.contains(box)) box.outerHTML = "";
                            });

                            box.addEventListener('click', function() {
                                this.innerHTML = this.innerHTML;
                            });

                            window.addEventListener('click', function(e) {
                                if (!box.contains(e.target)) {
                                    if (!span.contains(e.target)) {
                                        if (box.style.opacity == "1") {
                                            if (!(box === null)) {
                                                if (typeof box.parent == 'undefined') {
                                                    box.remove();
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        } else {
                            el.outerHTML = "";
                        }
                    });
                    span.innerText = w;

                    pack.appendChild(span);

                    parentToAdd.appendChild(pack);

                    idPopsSpelling++;
                    return;
                }
            }
        }
    }

    if (styleOutput) {
        let span = document.createElement("span");
        span.className = "wrong";
        span.innerText = w;
        parentToAdd.appendChild(span);
    } else {
        if (!reverse) {
            //if (w.includes('í')) {
            //	let span=document.createElement("span");
            //	span.className="wrong";
            //	span.innerText=w;
            //	parentToAdd.appendChild(span);
            //	return;
            //}
            //if (w.includes('ý')) {
            //	let span=document.createElement("span");
            //	span.className="wrong";
            //	span.innerText=w;
            //	parentToAdd.appendChild(span);
            //	return;
            //}
            //if (w.includes('ů')) {
            //	let span=document.createElement("span");
            //	span.className="wrong";
            //	span.innerText=w;
            //	parentToAdd.appendChild(span);
            //	return;
            //}
            //if (w.includes('ú')) {
            //	let span=document.createElement("span");
            //	span.className="wrong";
            //	span.innerText=w;
            //	parentToAdd.appendChild(span);
            //	return;
            //}
            //if (w.includes('ou')) {
            //	let span=document.createElement("span");
            //	span.className="wrong";
            //	span.innerText=w;
            //	parentToAdd.appendChild(span);
            //	return;
            //}
        } else {
            //if (w.includes('ê')) {
            //	let span=document.createElement("span");
            //	span.className="wrong";
            //	span.innerText=w;
            //	parentToAdd.appendChild(span);
            //	return;
            //}
            //if (w.includes('ô')) {
            //	let span=document.createElement("span");
            //	span.className="wrong";
            //	span.innerText=w;
            //	parentToAdd.appendChild(span);
            //	return;
            //}
        }
        //	console.log(w);
        let span = document.createTextNode(w);
        parentToAdd.appendChild(span);
    }

    return;
}

function auto_grow() {
    document.getElementById("specialTextarea").style.minHeight = "5px";
    document.getElementById("specialTextarea").style.minHeight = (document.getElementById('specialTextarea').scrollHeight) + "px";
}

let ownLang;
let loadedOwnLang = false;
//var loadedVersionNumber;


function SetCurrentTranscription(transCode) {

    if (transCode == "czechsimple") return [
        { from: "mňe", to: "mě" },
        { from: "fje", to: "fě" },
        { from: "pje", to: "pě" },

        { from: "ďe", to: "dě" },
        { from: "ťe", to: "tě" },
        { from: "ňe", to: "ně" },

        { from: "ďi", to: "di" },
        { from: "ťi", to: "ti" },
        { from: "ňi", to: "ni" },

        { from: "ďí", to: "dí" },
        { from: "ťí", to: "tí" },
        { from: "ňí", to: "ní" },

        { from: "ijo", to: "io" },
        { from: "iju", to: "iu" },
        { from: "ije", to: "ie" },
        { from: "ija", to: "ia" },

        { from: "ijó", to: "ió" },
        { from: "ijú", to: "iú" },
        { from: "ijé", to: "ié" },
        { from: "ijá", to: "iá" },

        { from: "ô", to: "o" },
        { from: "ê", to: "e" },
        { from: "ạ́", to: "ó" },
        { from: "ạ́", to: "ó" },
        { from: "ə", to: "e" },
        { from: "ṵ", to: "u" },
        { from: "ł", to: "l" },
        { from: "ŕ", to: "r" },
        { from: "ĺ", to: "l" },

        { from: "ni", to: "ny" },
        { from: "ní", to: "ný" },

        { from: "ti", to: "ty" },
        { from: "tí", to: "tý" },

        { from: "di", to: "dy" },
        { from: "dí", to: "dý" },

        { from: "chi", to: "chy" },
        { from: "hi", to: "hy" },
        { from: "ki", to: "ky" },
        { from: "ri", to: "ry" },

        { from: "ẹ", to: "e" },
        { from: "ọ", to: "o" },
        { from: "ó́", to: "ó" },

        { from: "ŋ", to: "n" },

        { from: "vje", to: "vě", type: "end" },
        { from: "bje", to: "bě", type: "end" },
        { from: "bjející", to: "bějící", type: "end" },
    ];

    if (transCode == "czech") return [
        { from: "dz", to: "ʒ" },
        { from: "dž", to: "ʒ̆" },
        { from: "vě", to: "vje" },
        { from: "bě", to: "bje" },
        { from: "pě", to: "pje" },

        { from: "au", to: "au̯" },
        { from: "eu", to: "eu̯" },
        { from: "ou", to: "ou̯" },
        { from: "ẹ", to: "e" },
        { from: "ọ", to: "e" },
        { from: "ó́", to: "ó" },
        { from: "ṵ", to: "u̯" },
    ];

    if (transCode == "moravian") return [
        { from: "ch", to: "x" },
        { from: "x", to: "ks" },
        { from: "ď", to: "dj" },
        { from: "ť", to: "tj" },
        { from: "ň", to: "nj" },

        { from: "Ch", to: "X" },
        { from: "X", to: "Ks" },
        { from: "Ď", to: "Dj" },
        { from: "Ť", to: "Tj" },
        { from: "Ň", to: "Nj" },

        { from: "ẹ", to: "e" },
        { from: "ọ", to: "o" },
        { from: "ŋ", to: "n" },

        { from: "ň", to: "ň", type: "end" },
        { from: "ó́", to: "ó" },
    ];

    if (transCode == "slovak") return [
        { from: "ňje", to: "nie" },
        { from: "ňjé", to: "nié" },
        { from: "ňja", to: "nia" },
        { from: "ňjá", to: "niá" },
        { from: "ňju", to: "niu" },
        { from: "ňi", to: "ni" },
        { from: "ňí", to: "ní" },
        { from: "ňe", to: "ně" },

        { from: "ťje", to: "tie" },
        { from: "ťjé", to: "tié" },
        { from: "ťja", to: "tia" },
        { from: "ťjá", to: "tiá" },
        { from: "ťju", to: "tiu" },
        { from: "ťi", to: "ti" },
        { from: "ťí", to: "tí" },
        { from: "ťe", to: "tě" },

        { from: "ďje", to: "die" },
        { from: "ďjé", to: "dié" },
        { from: "ďja", to: "dia" },
        { from: "ďjá", to: "diá" },
        { from: "ďju", to: "diu" },
        { from: "ďi", to: "di" },
        { from: "ďí", to: "dí" },
        { from: "ďe", to: "dě" },

        { from: "ŋ", to: "n" },
    ];

    if (transCode == "silezian_slabikorzovy") return [
        { from: "bje", to: "bie" },
        { from: "vje", to: "vie" },
        { from: "vě", to: "vie" },
        { from: "pě", to: "pie" },
        { from: "mje", to: "mie" },
        { from: "mě", to: "mie" },
        { from: "dźe", to: "dzie" },
        { from: "ňa", to: "nia" },
        
        { from: "tě", to: "tie" },
        { from: "ťe", to: "tie" },
        
        { from: "ňe", to: "nie" },
        { from: "ně", to: "nie" },
        { from: "ńe", to: "nie" },

        { from: "ṕi", to: "pi" },

        { from: "ća", to: "cia" },
        { from: "će", to: "cie" },
        { from: "ći", to: "ci" },
        { from: "ćo", to: "cio" },
        { from: "ću", to: "ciu" },
        { from: "ćy", to: "ciy" },

        { from: "śa", to: "sia" },
        { from: "śe", to: "sie" },
        { from: "śi", to: "si" },
        { from: "śo", to: "sio" },
        { from: "śu", to: "siu" },
        { from: "śy", to: "siy" },

        { from: "źa", to: "zia" },
        { from: "źe", to: "zie" },
        { from: "źi", to: "zi" },
        { from: "źo", to: "zio" },
        { from: "źu", to: "ziu" },
        { from: "źy", to: "ziy" },

        { from: "ňí", to: "ní" },
        { from: "ďí", to: "dí" },
        { from: "ťí", to: "tí" },

        { from: "ňi", to: "ni" },
        { from: "ďi", to: "di" },
        { from: "ťi", to: "ti" },

        { from: "č", to: "cz" },
        { from: "š", to: "sz" },
        { from: "ř", to: "rz" },
        { from: "ž", to: "ż" },
        { from: "v", to: "w" },

        { from: "Č", to: "Cz" },
        { from: "Š", to: "Sz" },
        { from: "Ř", to: "Rz" },
        { from: "Ž", to: "Ż" },
        { from: "V", to: "W" },

        { from: "ů", to: "ō" },

        { from: "ṵ", to: "ł" },
        { from: "ẹ", to: "e" },
        { from: "ọ", to: "o" },
        { from: "ó́", to: "ó" },

        { from: "ŋ", to: "n" },
    ];

    if (transCode == "ipa") return [
        { from: "ř", to: "r̝̊" }, //̝̊
        { from: "vě", to: "vjɛ" },
        { from: "mě", to: "mɲɛ" },
        { from: "mňe", to: "mɲɛ" },
        { from: "u", to: "ʊ" },

        { from: "á", to: "aː" },
        { from: "é", to: "eː" },
        { from: "í", to: "iː" },
        { from: "ó", to: "ɔː" },
        { from: "ú", to: "uː" },
        { from: "ů", to: "uː" },

        { from: "au", to: "aʊ" },
        { from: "eu", to: "eʊ" },
        { from: "ou", to: "oʊ̯" },

        { from: "ť", to: "c" },
        { from: "ď", to: "ɟ" },
        { from: "c", to: "t͡s" },
        { from: "dz", to: "d͡z" },
        { from: "č", to: "t͡ʃ" },
        { from: "dž", to: "d͡ʒ" },
        { from: "ch", to: "x" },
        //{ from: "ch", 	to: "ɣ", type: "end"},
        { from: "h", to: "ɦ" },

        { from: "ai", to: "aɪ̯" },
        { from: "ei", to: "eɪ̯" },
        { from: "oi", to: "ɔɪ̯" },

        { from: "š", to: "ʃ" },
        { from: "ž", to: "ʒ" },

        { from: "ň", to: "ɲ" },
        { from: "ně", to: "ɲe" },

        { from: "ẹ", to: "e" },
        { from: "ọ", to: "o" },
        { from: "ó́", to: "ó" },
    ];

    if (transCode == "katakana") return [
        { from: "če", to: "チェ" },
        { from: "kó", to: "コー" },

        { from: " ", to: "・" },

        { from: "ła", to: "ワ" }, { from: "Ła", to: "ワ" },
        
        { from: "mě", to: "ミェ" }, { from: "Mě", to: "ミェ" },
        { from: "mje", to: "ミェ" }, { from: "Mje", to: "ミェ" },


        { from: "dy", to: "ディ" }, { from: "Dy", to: "ディ" },
        { from: "fi", to: "フィ" }, { from: "Fi", to: "フィ" },

        { from: "bě", to: "ビェ" }, { from: "Bě", to: "ビェ" },
        { from: "bje", to: "ビェ" }, { from: "Bje", to: "ビェ" },

        { from: "fo", to: "フォ" }, { from: "Fo", to: "フォ" },
        { from: "fó", to: "フォー" }, { from: "Fó", to: "フォー" },

        { from: "vu", to: "ヴ" }, { from: "Vu", to: "ヴ" },
        { from: "vů", to: "ヴー" }, { from: "Vů", to: "ヴー" },

        { from: "ka", to: "カ" }, { from: "Ka", to: "カ" },
        { from: "ká", to: "カー" }, { from: "Ká", to: "カー" },

        { from: "ra", to: "ラ" }, { from: "Ra", to: "ラ" },
        { from: "rá", to: "ラー" }, { from: "Rá", to: "ラー" },

        { from: "la", to: "ラ゚" },   { from: "La", to: "ラ゚" },
        { from: "lá", to: "ラ゚ー" }, { from: "Lá", to: "ラ゚ー" },

        { from: "sa", to: "サ" }, { from: "Sa", to: "サ" },
        { from: "sá", to: "サー" }, { from: "Sá", to: "サー" },

        { from: "ta", to: "タ" }, { from: "Ta", to: "タ" },
        { from: "tá", to: "ター" }, { from: "Tá", to: "ター" },

        { from: "na", to: "ナ" }, { from: "Na", to: "ナ" },
        { from: "ná", to: "ナー" }, { from: "Ná", to: "ナー" },

        { from: "ha", to: "ハ" }, { from: "Ha", to: "ハ" },
        { from: "há", to: "ハー" }, { from: "Há", to: "ハー" },

        { from: "ma", to: "マ" }, { from: "Ma", to: "マ" },
        { from: "má", to: "マー" }, { from: "Má", to: "マー" },

        { from: "ja", to: "ヤ" }, { from: "Ja", to: "ヤ" },
        { from: "já", to: "ヤー" }, { from: "Já", to: "ヤー" },

        { from: "va", to: "ワ" }, { from: "Va", to: "ワ" },
        { from: "vá", to: "ワー" }, { from: "Vá", to: "ワー" },

        { from: "ga", to: "ガ" }, { from: "Ga", to: "ガ" },
        { from: "gá", to: "ガー" }, { from: "Gá", to: "ガー" },

        { from: "za", to: "ザ" }, { from: "Za", to: "ザ" },
        { from: "zá", to: "ザー" }, { from: "Zá", to: "ザー" },

        { from: "da", to: "ダ" }, { from: "Da", to: "ダ" },
        { from: "dá", to: "ダー" }, { from: "Dá", to: "ダー" },

        { from: "ba", to: "バ" }, { from: "Ba", to: "バ" },
        { from: "bá", to: "バー" }, { from: "Bá", to: "バー" },

        { from: "pa", to: "パ" }, { from: "Pa", to: "パ" },
        { from: "pá", to: "パー" }, { from: "Pá", to: "パー" },


        { from: "ki", to: "キ" }, { from: "Ki", to: "キ" },
        { from: "kí", to: "キー" }, { from: "Kí", to: "キー" },
        { from: "ky", to: "キ" }, { from: "Ky", to: "キ" },
        { from: "ký", to: "キー" }, { from: "Ký", to: "キー" },

        { from: "ši", to: "シ" }, { from: "Ši", to: "シ" },
        { from: "ší", to: "シー" }, { from: "Ší", to: "シー" },

        { from: "či", to: "チ" }, { from: "Či", to: "チ" },
        { from: "čí", to: "チー" }, { from: "Čí", to: "チー" },

        { from: "ni", to: "ニ" }, { from: "Ni", to: "ニ" },
        { from: "ní", to: "ニー" }, { from: "Ní", to: "ニー" },
        { from: "ny", to: "ニ" }, { from: "Ny", to: "ニ" },
        { from: "ný", to: "ニー" }, { from: "Ný", to: "ニー" },

        { from: "hi", to: "ヒ" }, { from: "Hi", to: "ヒ" },
        { from: "hí", to: "ヒー" }, { from: "Hí", to: "ヒー" },
        { from: "hy", to: "ヒ" }, { from: "Hy", to: "ヒ" },
        { from: "hý", to: "ヒー" }, { from: "Hý", to: "ヒー" },

        { from: "mi", to: "ミ" }, { from: "Mi", to: "ミ" },
        { from: "mí", to: "ミー" }, { from: "Mí", to: "ミー" },
        { from: "my", to: "ミ" }, { from: "My", to: "ミ" },
        { from: "mý", to: "ミー" }, { from: "Mý", to: "ミー" },

        { from: "ri", to: "リ" }, { from: "Ri", to: "リ" },
        { from: "rí", to: "リー" }, { from: "Rí", to: "リー" },
        { from: "ry", to: "リ" }, { from: "Ry", to: "リ" },
        { from: "rý", to: "リー" }, { from: "Rý", to: "リー" },

        { from: "li", to: "リ゚" },   { from: "Li", to: "リ゚" },
        { from: "lí", to: "リ゚ー" }, { from: "Lí", to: "リ゚ー" },
        { from: "ly", to: "リ゚" },   { from: "Ly", to: "リ゚" },
        { from: "lý", to: "リ゚ー" }, { from: "Lý", to: "リ゚ー" },

        { from: "vi", to: "ヰ" }, { from: "Vi", to: "ヰ" },
        { from: "ví", to: "ヰー" }, { from: "Ví", to: "ヰー" },
        { from: "vy", to: "ヰ" }, { from: "Vy", to: "ヰ" },
        { from: "vý", to: "ヰー" }, { from: "Vý", to: "ヰー" },

        { from: "gi", to: "ギ" }, { from: "Gi", to: "ギ" },
        { from: "gí", to: "ギー" }, { from: "Gí", to: "ギー" },

        { from: "dźi", to: "ジ" }, { from: "Dźi", to: "ジ" },
        { from: "dźí", to: "ジー" }, { from: "Dží", to: "ジー" },

        { from: "bi", to: "ビ" }, { from: "Bi", to: "ビ" },
        { from: "bí", to: "ビー" }, { from: "Bí", to: "ビー" },
        { from: "by", to: "ビ" }, { from: "By", to: "ビ" },
        { from: "bý", to: "ビー" }, { from: "Bý", to: "ビー" },

        { from: "pi", to: "ピ" }, { from: "Pi", to: "ピ" },
        { from: "pí", to: "ピー" }, { from: "Pí", to: "ピー" },

        { from: "py", to: "ピ" }, { from: "Py", to: "ピ" },
        { from: "pý", to: "ピー" }, { from: "Pý", to: "ピー" },

        { from: "ci", to: "チィ" }, { from: "Ci", to: "チィ" },
        { from: "cí", to: "チィー" }, { from: "Cí", to: "チィー" },


        { from: "nu", to: "ヌ" },   { from: "Nu", to: "ヌ" },
        { from: "nů", to: "ヌー" }, { from: "Nů", to: "ヌー" },

        { from: "su", to: "ス" },   { from: "Su", to: "ス" },
        { from: "sů", to: "スー" }, { from: "Sů", to: "スー" },

        { from: "lu", to: "ル゚" },   { from: "Lu", to: "ル゚" },
        { from: "lů", to: "ル゚ー" }, { from: "Lů", to: "ル゚ー" },
                
        { from: "du", to: "ドゥ" },   { from: "Du", to: "ドゥ" },
        { from: "dů", to: "ドゥー" }, { from: "Dů", to: "ドゥー" },
        
        { from: "bu", to: "ブ" },   { from: "Bu", to: "ブ" },
        { from: "bů", to: "ブー" }, { from: "Bů", to: "ブー" },
        
        { from: "pu", to: "プ" },   { from: "Pu", to: "プ" },
        { from: "pů", to: "プー" }, { from: "Pů", to: "プー" },
        
        { from: "ru", to: "ル" },   { from: "Ru", to: "ル" },
        { from: "rů", to: "ルー" }, { from: "Rů", to: "ルー" },
        
        { from: "ču", to: "チゥ" },   { from: "Ču", to: "チゥ" },
        { from: "čů", to: "チゥー" }, { from: "Čů", to: "チゥー" },
        { from: "čú", to: "チゥー" }, { from: "Čú", to: "チゥー" },
        

        { from: "ne", to: "ネ" },   { from: "Ne", to: "ネ" },
        { from: "né", to: "ネー" }, { from: "Né", to: "ネー" },
        
        { from: "ke", to: "ケ" },   { from: "Ke", to: "ケ" },
        { from: "ké", to: "ケー" }, { from: "Ké", to: "ケー" },
 
        { from: "se", to: "セ" },   { from: "Se", to: "セ" },
        { from: "sé", to: "セー" }, { from: "Sé", to: "セー" },
 
        { from: "re", to: "レ" },   { from: "Re", to: "レ" },
        { from: "ré", to: "レー" }, { from: "Ré", to: "レー" },

        { from: "le", to: "レ゚" },   { from: "Le", to: "レ゚" },
        { from: "lê", to: "レ゚" },   { from: "Lê", to: "レ゚" },
        { from: "lé", to: "レ゚ー" }, { from: "Lé", to: "レ゚ー" },

        { from: "me", to: "メ" },   { from: "Me", to: "メ" },
        { from: "mé", to: "メー" }, { from: "Mé", to: "メー" },

        { from: "ve", to: "ヱ" },   { from: "Ve", to: "ヱ" },
        { from: "vé", to: "ヱー" }, { from: "Vé", to: "ヱー" },


        { from: "to", to: "ト" },   { from: "To", to: "ト" },
        { from: "tó", to: "トー" }, { from: "Tó", to: "トー" },
         
        { from: "ho", to: "ホ" },   { from: "Ho", to: "ホ" },
        { from: "hó", to: "ホー" }, { from: "Hó", to: "ホー" },
         
        { from: "ro", to: "ロ" },   { from: "Ro", to: "ロ" },
        { from: "rô", to: "ロ" },   { from: "Rô", to: "ロ" },
        { from: "ró", to: "ロー" }, { from: "Ró", to: "ロー" },   
  
        { from: "ko", to: "コ" },   { from: "Ko", to: "コ" },
        { from: "kô", to: "コ" },   { from: "Kô", to: "コ" },
        { from: "kó", to: "コー" }, { from: "Kó", to: "コー" },
  
        { from: "do", to: "ド" },   { from: "Do", to: "ド" },
        { from: "dó", to: "ドー" }, { from: "Dó", to: "ドー" },
  
        { from: "no", to: "ノ" },   { from: "No", to: "ノ" },
        { from: "nó", to: "ノー" }, { from: "Nó", to: "ノー" },

        { from: "bo", to: "ボ" },   { from: "Bo", to: "ボ" },
        { from: "bó", to: "ボー" }, { from: "Bó", to: "ボー" },

        { from: "lo", to: "ロ゚" },   { from: "Lo", to: "ロ゚" },
        { from: "ló", to: "ロ゚ー" }, { from: "Ló", to: "ロ゚ー" },

        { from: "vo", to: "ヲ" },   { from: "Vo", to: "ヲ" },
        { from: "vô", to: "ヲ" },   { from: "Vô", to: "ヲ" },
        { from: "vó", to: "ヲー" }, { from: "Vó", to: "ヲー" },
 
        { from: "po", to: "ポ" },   { from: "Po", to: "ポ" },
        { from: "pó", to: "ポー" }, { from: "Pó", to: "ポー" },
 

        { from: "je", to: "イエ" },   { from: "Je", to: "イエ" },
        { from: "jé", to: "イエー" }, { from: "Jé", to: "イエー" },

        { from: "še", to: "シェ" },   { from: "Še", to: "シェ" },
        { from: "šé", to: "シェー" }, { from: "Šé", to: "シェー" },


        { from: "vje", to: "ヴィェ" },  { from: "Vje", to: "ヴィェ" },
        { from: "vě", to: "ヴィェ" },   { from: "Vě", to: "ヴィェ" },

        { from: "nje", to: "ニェ" },  { from: "Nje", to: "ニェ" },
        { from: "ně", to: "ニェ" },   { from: "Ně", to: "ニェ" },

        { from: "pje", to: "ピェ" },  { from: "Pje", to: "ピェ" },
        { from: "pě", to: "ピェ" },   { from: "Pě", to: "ピェ" },

        { from: "bje", to: "ビェ" },  { from: "Bje", to: "ビェ" },
        { from: "bě", to: "ビェ" },   { from: "Bě", to: "ビェ" },


        { from: "i", to: "イ" },    { from: "I", to: "イ" },
        { from: "í", to: "イー" },  { from: "Í", to: "イー" },

        { from: "a", to: "ア" },    { from: "A", to: "ア" },
        { from: "á", to: "アー" },  { from: "Á", to: "アー" },


        { from: "ň", to: "ン" }, { from: "Ň", to: "ン" },
        { from: "n", to: "ン" }, { from: "N", to: "ン" },
        { from: "ŋ", to: "ン" },
    ];

    if (transCode == "hiragana") return [
        { from: "ľu", to: "りゅ" },
        { from: "rjú", to: "りゅう" },

        { from: "ča", to: "ちゃ" }, { from: "Ča", to: "ちゃ" },
        { from: "čá", to: "ちゃあ" }, { from: "Ké", to: "ちゃあ" },

        { from: "dži", to: "ぢ" },

        { from: "ka", to: "か" }, { from: "Ka", to: "か" },
        { from: "ga", to: "が" },

        { from: "ki", to: "き" },
        { from: "ku", to: "く" },
        { from: "ke", to: "け" },

        { from: "ja", to: "や" }, { from: "Ja", to: "や" },
        { from: "ju", to: "ゆ" }, { from: "Ju", to: "ゆ" },
        { from: "jo", to: "よ" }, { from: "Jo", to: "よ" },

        { from: "re", to: "れ" }, { from: "Re", to: "れ" },
        { from: "ré", to: "れえ" }, { from: "Ré", to: "れえ" },

        { from: "se", to: "せ" }, { from: "Se", to: "せ" },
        { from: "sé", to: "せえ" }, { from: "Sé", to: "せえ" },

        { from: "pi", to: "ぴ" }, { from: "Pi", to: "ぴ" },
        { from: "pí", to: "ぴい" }, { from: "Pí", to: "ぴい" },

        { from: "ni", to: "に" }, { from: "Ni", to: "に" },
        { from: "ní", to: "にい" }, { from: "Ní", to: "にい" },

        { from: "mo", to: "も" }, { from: "Mo", to: "も" },
        { from: "mó", to: "もう" }, { from: "Mó", to: "もう" },

        { from: "to", to: "と" }, { from: "To", to: "と" },
        { from: "tó", to: "とう" }, { from: "Tó", to: "とう" },

        { from: "ra", to: "ら" }, { from: "Ra", to: "ら" },
        { from: "rá", to: "らあ" }, { from: "Rá", to: "らあ" },

        { from: "ta", to: "た" }, { from: "Ta", to: "た" },
        { from: "tá", to: "たあ" }, { from: "Tá", to: "たあ" },

        { from: "ke", to: "け" }, { from: "Ke", to: "け" },
        { from: "ké", to: "けい" }, { from: "Ké", to: "けい" },

        { from: "hi", to: "ひ" }, { from: "Hi", to: "ひ" },
        { from: "hí", to: "ひい" }, { from: "Hí", to: "ひい" },

        { from: "ko", to: "こ" }, { from: "Ko", to: "こ" },
        { from: "kó", to: "こお" }, { from: "Kó", to: "こお" },

        { from: "do", to: "ど" }, { from: "Do", to: "ど" },
        { from: "dó", to: "どお" }, { from: "Dó", to: "どお" },

        { from: "bo", to: "ぼ" }, { from: "Bo", to: "ぼ" },
        { from: "bó", to: "ぼお" }, { from: "Bó", to: "ぼお" },

        { from: "ro", to: "ろ" }, { from: "Ro", to: "ろ" },
        { from: "ró", to: "ろお" }, { from: "Ró", to: "ろお" },

        { from: "za", to: "ざ" }, { from: "Za", to: "ざ" },
        { from: "zá", to: "ざあ" }, { from: "Zá", to: "ざあ" },

        { from: "bu", to: "ぶ" }, { from: "Bu", to: "ぶ" },
        { from: "bů", to: "ぶう" }, { from: "Bů", to: "ぶう" },

        { from: "du", to: "どぅづ" }, { from: "Du", to: "どぅ" },
        { from: "dů", to: "どぅう" }, { from: "Dů", to: "どぅう" },


        { from: "vu", to: "ゔ" }, { from: "Vu", to: "ゔ" },
        { from: "vů", to: "ゔう" }, { from: "Vů", to: "ゔう" },


        { from: "ne", to: "ね" }, { from: "Ne", to: "ね" },
        { from: "né", to: "ねえ" }, { from: "ne", to: "ねえ" },

        { from: "da", to: "だ" },   { from: "Da", to: "だ" },
        { from: "dá", to: "だあ" }, { from: "Dá", to: "だあ" },

        { from: "ky", to: "き" },   { from: "Ky", to: "き" },
        { from: "ký", to: "きい" }, { from: "Ký", to: "きい" },
   
    
        { from: "va", to: "わ" },   { from: "Va", to: "わ" },
        { from: "Vá", to: "わあ" }, { from: "Vá", to: "わあ" },
 
        { from: "vo", to: "を" },   { from: "Vo", to: "を" },
        { from: "vó", to: "をう" }, { from: "Vó", to: "をう" },


        { from: "ho", to: "ほ" }, { from: "Ho", to: "ほ" },
        { from: "hó", to: "ほう" }, { from: "Hó", to: "ほう" },

        { from: "fi", to: "ふい" }, { from: "Fi", to: "ふい" },
        { from: "fí", to: "ふいい" }, { from: "Fí", to: "ふいい" },

        { from: "ľu", to: "りゅ" },
        { from: "sa", to: "さ" },
        { from: "na", to: "な" },
        { from: "ma", to: "ま" },
        { from: "chi", to: "ち" },
        { from: "cu", to: "つ" },
        { from: "fu", to: "ふ" },
        { from: "he", to: "へ" },



        { from: "a", to: "あ" }, { from: "A", to: "あ" },
        { from: "i", to: "い" }, { from: "I", to: "い" },
        { from: "u", to: "う" }, { from: "U", to: "う" },
        { from: "e", to: "え" }, { from: "E", to: "え" },
        { from: "o", to: "お" }, { from: "O", to: "お" },

        { from: "á", to: "ああ" }, { from: "Á", to: "ああ" },
        { from: "í", to: "いい" }, { from: "Í", to: "いい" },
        { from: "ú", to: "うう" }, { from: "Ú", to: "うう" },
        { from: "é", to: "ええ" }, { from: "É", to: "ええ" },
        { from: "ó", to: "おお" }, { from: "Ó", to: "おお" },

        { from: "n", to: "ん" }, { from: "N", to: "ん" }, { from: "ŋ", to: "ん" },
    ];

    if (transCode == "steuer") return [
        { from: "vě", to: "vje" },
    ];

    if (transCode == "runy") return [
        // https://www.wmmagazin.cz/preklad-slovanskeho-pisma-z-breclavi/
        { from: "ó", to: "ᛟ" }, { from: "Ó", to: "ᛟ" },
        { from: "ch", to: "ᛞ" }, { from: "CH", to: "ᛞ" },
        { from: "či", to: "ᛗ" }, { from: "Či", to: "ᛗ" },
        { from: "ma", to: "ᛖ" }, { from: "Ma", to: "ᛖ" },
        { from: "r", to: "ᚱ" }, { from: "R", to: "ᚱ" },
        { from: "já", to: "ᚢ" }, { from: "Já", to: "ᚢ" },
        
        //?????https://www.wmmagazin.cz/wp-content/uploads/2020/09/slovani3-slovnik-praslovani.jpg        
        { from: "f", to: "ᚠ" }, { from: "F", to: "ᚠ" },
        { from: "u", to: "ᚢ" }, { from: "U", to: "ᚢ" },
        { from: "a", to: "ᚨ" }, { from: "A", to: "ᚨ" },
        { from: "á", to: "ᚨᚨ" }, { from: "Á", to: "ᚨᚨ" },
        
        { from: "ně", to: "ᚾᛁᛖ" }, { from: "Ně", to: "ᚾᛁᛖ" },
        { from: "ňe", to: "ᚾᛁᛖ" }, { from: "Ňe", to: "ᚾᛁᛖ" },

        { from: "vě", to: "ᚹᛁᛖ" }, { from: "Vě", to: "ᚹᛁᛖ" },
        { from: "vje", to: "ᚹᛖ" }, { from: "Vje", to: "ᚹᛁᛖ" },
        
        { from: "mňe", to: "ᛗᚾᛁᛖ" }, { from: "Mňe", to: "ᛗᚾᛁᛖ" },
        { from: "mě", to: "ᛗᚾᛁᛖ" }, { from: "Mě", to: "ᛗᚾᛁᛖ" },

        { from: "x", to: "ᚲᛊ" }, { from: "X", to: "ᚲᛊ" },
        
        { from: "ř", to: "ᚱᛉ" }, { from: "Ř", to: "ᚱᛉ" },
        { from: "ž", to: "ᛉᚺ" }, { from: "Ž", to: "ᛉᚺ" },
        
        { from: "k", to: "ᚲ" },{ from: "K", to: "ᚲ" },
        { from: "g", to: "ᚷ" }, { from: "G", to: "ᚷ" },
        { from: "w", to: "ᚹ" }, { from: "W", to: "ᚹ" },
        { from: "v", to: "ᚹ" }, { from: "V", to: "ᚹ" },
        { from: "h", to: "ᚺ" }, { from: "H", to: "ᚺ" },
        { from: "n", to: "ᚾ" }, { from: "N", to: "ᚾ" },{ from: "ŋ", to: "ᚾ" },
        { from: "i", to: "ᛁ" }, { from: "I", to: "ᛁ" },
        { from: "í", to: "ᛁᛁ" },
        { from: "y", to: "ᛁ" },
        { from: "ý", to: "ᛁᛁ" },

                { from: "j", to: "ᛃ" }, { from: "J", to: "ᛃ" },
        { from: "p", to: "ᛈ" }, { from: "P", to: "ᛈ" },
        { from: "z", to: "ᛉ" }, { from: "Z", to: "ᛉ" },
        { from: "s", to: "ᛊ" }, { from: "S", to: "ᛊ" },
        { from: "t", to: "ᛏ" }, { from: "T", to: "ᛏ" },
        { from: "b", to: "ᛒ" }, { from: "B", to: "ᛒ" },
        { from: "e", to: "ᛖ" }, { from: "E", to: "ᛖ" },
        { from: "ê", to: "ᛖ" }, { from: "Ê", to: "ᛖ" },
        { from: "é", to: "ᛖᛖ" }, { from: "É", to: "ᛖᛖ" },
        { from: "m", to: "ᛗ" }, { from: "M", to: "ᛗ" },
        { from: "l", to: "ᛚ" }, { from: "L", to: "ᛚ" },
        { from: "d", to: "ᛞ" }, { from: "D", to: "ᛞ" },
        { from: "o", to: "ᛟ" }, { from: "O", to: "ᛟ" },
        { from: "ô", to: "ᛟ" }, { from: "Ô", to: "ᛟ" },

        { from: "c", to: "ᛋ" },
    ];

    if (transCode == "hlaholice") return [
        //{ from: "št", to: "Ⱋ" }, { from: "Št", to: "Ⱋ" },
        { from: "jo", to: "ⱖ" }, { from: "Jo", to: "Ⱖ" },
        { from: "ju", to: "ⱓ" }, { from: "Ju", to: "Ⱓ" },
        { from: "ch", to: "ⱈ" }, { from: "Ch", to: "Ⱈ" },

        { from: "h", to: "ⱈ" },

        { from: "dz", to: "Ⰷ" },

        { from: "ť", to: "ⱏ" },
        { from: "ň", to: "ⱀ" },
        { from: "ž", to: "ⰶ" }, { from: "Ž", to: "Ⰶ" },

        { from: "a", to: "ⰰ" }, { from: "A", to: "Ⰰ" },
        { from: "á", to: "ⰰⰰ" }, { from: "Á", to: "ⰀⰀ" },
        { from: "b", to: "ⰱ" }, { from: "B", to: "Ⰱ" },
        { from: "v", to: "ⰲ" }, { from: "V", to: "Ⰲ" },
        { from: "g", to: "ⰳ" }, { from: "G", to: "Ⰳ" },
        { from: "d", to: "ⰴ" }, { from: "D", to: "Ⰴ" },
        { from: "e", to: "ⰵ" }, { from: "E", to: "Ⰵ" },
        { from: "é", to: "ⰵⰵ" }, { from: "É", to: "ⰅⰅ" },
        { from: "ê", to: "ⰵ" }, { from: "Ê", to: "Ⰵ" },
        { from: "ʒ", to: "Ⰶ" },
        { from: "z", to: "ⰸ" }, { from: "Z", to: "Ⰸ" },
        { from: "i", to: "ⰹ" },{ from: "I", to: "Ⰹ" },
        { from: "í", to: "ⰹⰹ" }, { from: "Í", to: "ⰉⰉ" },
        { from: "pě", to: "ⱂⰵ" }, { from: "Pě", to: "Ⱂⰵ" },
        { from: "y", to: "ⱏⰺ" }, { from: "Y", to: "ⰟⰊ" },
        { from: "ý", to: "ⱏⰺⰺ" }, { from: "Ý", to: "ⰟⰊⰊ" },
        { from: "j", to: "ⰺ" }, { from: "J", to: "Ⰻ" },
        { from: "k", to: "ⰽ" }, { from: "K", to: "Ⰽ" },
        { from: "l", to: "ⰾ" }, { from: "L", to: "Ⰾ" },
        { from: "m", to: "ⰿ" }, { from: "M", to: "Ⰿ" },
        { from: "n", to: "ⱀ" }, { from: "N", to: "Ⱀ" }, { from: "ŋ", to: "Ⱀ" },
        { from: "o", to: "ⱁ" }, { from: "O", to: "Ⱁ" },
        { from: "ó", to: "ⱁⱁ" }, { from: "Ó", to: "ⰑⰑ" },
        { from: "ô", to: "ⱁ" }, { from: "Ô", to: "Ⱁ" },
        { from: "p", to: "ⱂ" }, { from: "P", to: "Ⱂ" },
        { from: "r", to: "ⱃ" }, { from: "R", to: "Ⱃ" },
        { from: "s", to: "ⱄ" }, { from: "S", to: "Ⱄ" },
        { from: "t", to: "ⱅ" }, { from: "T", to: "Ⱅ" },
        { from: "u", to: "ⱆ" }, { from: "U", to: "Ⱆ" },
        { from: "f", to: "ⱇ" }, { from: "F", to: "Ⱇ" },
        { from: "č", to: "ⱍ" }, { from: "Č", to: "ⱍ" },
        { from: "c", to: "ⱌ" }, { from: "C", to: "Ⱌ" },
        { from: "š", to: "ⱎ" }, { from: "Š", to: "Ⱎ" },
    ];

    if (transCode == "cyrilice") return [
        { from: "vě", to: "вје" }, { from: "Vě", to: "Вје" },
        { from: "pě", to: "пје" }, { from: "Pě", to: "Пје" },
        { from: "bě", to: "бје" }, { from: "Bě", to: "Бје" },

        { from: "á", to: "aa" }, { from: "Á", to: "Аа" },
        { from: "é", to: "ее" }, { from: "É", to: "Еe" },
        { from: "í", to: "ии" }, { from: "Í", to: "Ии" },
        { from: "ó", to: "оо" }, { from: "Ó", to: "Oa" },
        { from: "ú", to: "уу" }, { from: "Ú", to: "Иу" },
        { from: "ĺ", to: "уу" }, { from: "Ĺ", to: "Лл" },
        { from: "ŕ", to: "рр" }, { from: "Ŕ", to: "Рр" },

        { from: "dź", to: "ђ" }, { from: "Dź", to: "Ђ" },
        { from: "dž", to: "џ" }, { from: "Dž", to: "Џ" },

        { from: "ć", to: "ћ" }, { from: "Dž", to: "Ћ" },
        { from: "ś", to: "сь" }, //{ from: "Dž", to: "Ћ" },

        { from: "ň", to: "њ" }, { from: "Ň", to: "Њ" },

        { from: "b", to: "б" }, { from: "B", to: "Б" },

        { from: "v", to: "в" }, { from: "V", to: "В" },

        { from: "h", to: "г" }, { from: "H", to: "Г" },

        { from: "g", to: "ґ" }, { from: "G", to: "Ґ" },

        { from: "d", to: "д" }, { from: "D", to: "Д" },

        { from: "je", to: "e" },

        { from: "e", to: "є" }, { from: "E", to: "Є" },

        { from: "ž", to: "ж" }, { from: "Ž", to: "Ж" },

        { from: "z", to: "з" }, { from: "Z", to: "З" },

        { from: "y", to: "и" }, { from: "Y", to: "И" },

        { from: "ji", to: "ї" },

        { from: "j", to: "й" }, { from: "J", to: "Й" },

        { from: "š", to: "ш" }, { from: "Š", to: "Ш" },

        { from: "šč", to: "щ" }, { from: "Šč", to: "Щ" },

        { from: "č", to: "ч" }, { from: "Č", to: "Ч" },

        { from: "c", to: "ц" }, { from: "C", to: "Ц" },

        { from: "ch", to: "x" }, { from: "Ch", to: "X" },

        { from: "f", to: "ф" }, { from: "F", to: "Ф" },

        { from: "u", to: "у" }, { from: "U", to: "У" },

        { from: "t", to: "т" }, { from: "T", to: "Т" },

        { from: "s", to: "с" }, { from: "S", to: "С" },

        { from: "r", to: "р" }, { from: "R", to: "Р" },

        { from: "p", to: "п" }, { from: "P", to: "П" },

        { from: "n", to: "н" }, { from: "N", to: "Н" }, { from: "ŋ", to: "н" },

        { from: "m", to: "м" }, { from: "M", to: "М" },

        { from: "l", to: "л" }, { from: "L", to: "Л" },

        { from: "ľ", to: "љ" }, { from: "Ľ", to: "Љ" },

        { from: "ł", to: "ль" }, { from: "Ł", to: "Ль" },

        { from: "k", to: "к" }, { from: "K", to: "К" },

        { from: "k", to: "к" }, { from: "K", to: "К" },
    ];

    // málo vyskytující se jevy potlačit (v datech moc neřešené)
    if (transCode == "default") return [
        { from: "ẹ", to: "e" },
        { from: "ọ", to: "o" },
        { from: "ó́", to: "ó" },
        { from: "ŋ", to: "n" },
        { from: "vě", to: "vje" },
        { from: "bě", to: "bje" },
        { from: "pě", to: "pje" },
        { from: "ně", to: "ňe" },
        { from: "dě", to: "ďe" },
        { from: "tě", to: "ťe" },
    ];

    if (transCode == "none") return [];

    console.log("Unknown code transcription: ", transCode)
    return null;
}

