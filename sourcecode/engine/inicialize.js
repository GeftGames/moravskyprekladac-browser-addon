const languagesPackage = "/engine/v3.json"; //"https://raw.githubusercontent.com/GeftGames/moravskyprekladac/main/v1.trw_a";
let loadedversion = "TW 3";
var dev=false;
var currentLang;
var languagesList = [];

let translations = [
    "Morava", [
        "Slovácko", [
            	"Podluží",
            	"Horňácko",
            	"Hanácké Slovácko",
                "Dolňácko",
                "Moravské Kopanice",
                "Luhačovické Zálesí",
        ],

        "Valašsko", [
            "Uherskohradišťské Závrší",
            "Podřevnicko",
            "Vsacko",
            "Meziříčsko",
            "Klouboukovsko",
            "Vsetínsko",
            "Vizovicko",
        ],

        "Moravské Horácko", [
            "Horácko", [],
            "Podhorácko", [],
            "Malá haná",
            "Horácké Dolsko",
        ],

        "Blansko", [

        ],

        "Haná", [
            "Zábečví",
            "Jižní Haná",
            "Vyškovsko",
            "Střední Haná",
            "Čuhácko",
            "Blaťácko",
            "Litovelsko",
            "Horní Haná",
        ],

        "Hranicko",
        "Pobečví",
        "Šumpersko",

        "Záhoří", [
            "Kelečsko",
            "Hostýnské Záhoří",
            "Lipeňské Záhoří",
        ],

        "Drahansko", [],
        "Hřebečsko",
        "Lašsko", [],
        "Kravařsko", [],        
        "Jesenicko", [],
        "Brněnsko",
    ],

    "Slezsko", [
        "Zaolší", [],        
        "Goralsko", [],
        "Hlučínsko", [],
        "Opavsko", [],
        "Lašsko", []
    ],

    "Moravský jazyk",

    "Ostatní"
];

function translator_init() {
    loadedLangs=0;
    if (dev) console.log("Translator inicializating starting...");
    
    transcription = SetCurrentTranscription(transcriptionType);

    InnerSearch(translations, langArrEleOptions, 0);
    GetTranslations();

    function InnerSearch(arr, parent, level) {
        if (typeof arr === 'string') {
            let group = {};
                group.Name = arr;
                group.type="Category";
                group.items=[];
                group.className = "selectGroup" + level;
            parent.items.push(group);
            return;
        }
        for (const name of arr) {
            if (typeof name === 'string') {
                group = {
                    Name: name,
                    type: "Category",
                    items: [],
                    className: "selectGroup" + level,
                };
                
                parent.items.push(group);
            } else {
                if (Array.isArray(name)) InnerSearch(name, parent, level + 1);
            }
        }
    }
}

let totalDirFiles = -1;
let downloadedFiles = 0;

var sSimpleWord=[], sPhrase=[], sSentence=[], sSentencePart=[], sSentencePattern=[],sSentencePatternPart=[],
sReplaceS=[], sReplaceG=[], sReplaceE=[],
sPatternNounFrom=[], sPatternNounTo=[],
sPatternAdjectiveFrom=[],sPatternAdjectiveTo=[],
sPatternPronounFrom=[],sPatternPronounTo=[],
sPatternNumberFrom=[],sPatternNumberTo=[],
sPatternVerbFrom=[],sPatternVerbTo=[],
sAdverb=[],sPreposition=[],sConjunction=[],sParticle=[],sInterjection=[];

function GetTranslations() {
   // loadedLangs=0;
    
    if (dev) console.log("Downloading file", chrome.runtime.getURL(languagesPackage));

    function RegisterLang(content, id) {
        //console.log(content);
        let lines = content.split(/\r?\n/);

        if (lines.length < 10) {
            if (dev) console.warn("Downloaded twr seems too small");
            return;
        }

        let tr = new LanguageTr();
       // tr.fileName = fileName;
        tr.id=id;

        tr.Load(lines);
        if (tr.Name!='Moravština "spisovná"') AddLang(tr);
       // console.log(tr.Name);
    }   
    
    function AddLang(lang) {
        function insideSearch(list, cat) {
            for (let n of list.items) {
                if (n.type == "Category") {
                    if (n.Name == cat) {
                        return n;
                    }
                }
            }
            for (let n of list.items) {
                if (n.type == "Category") {
                    insideSearch(n, cat);
                }
            }
            return langArrEleOptions;
        }

        // pick & up = better
        if (lang.Name != "") {
            let stats=lang.Stats();
            
            if ((!allTranslates && stats >= 50 && FilterCountry(lang.Country)) || (allTranslates && lang.Quality >= 0)) {
                let name = lang.Name;
  
                if (lang.Quality > 2) name += " ✅";
                if (stats < 50) name += " 💩";

                languagesList.push(lang);

                let category;
                if (Array.isArray(lang.Category)) {
                    for (let c of lang.Category.reverse()) {
                        let cat = insideSearch(langArrEleOptions, c);
                        if (cat != langArrEleOptions) {
                            category = cat;
                            break;
                        }
                    }
                    if (category == undefined) category = langArrEleOptions
                } else {
                    category = insideSearch(langArrEleOptions, lang.Category);
                }

                // Add color
                if (lang.Quality == 5) {
                    lang.ColorFillStyle = "Gold";
                    lang.ColorStrokeStyle = "Black";
                } else if (lang.Quality == 4) {
                    lang.ColorFillStyle = "Yellow";
                    lang.ColorStrokeStyle = "Black";
                } else if (lang.Quality == 3) {
                    lang.ColorFillStyle = "Orange";
                    lang.ColorStrokeStyle = "Black";
                } else if (lang.Quality == 2) {
                    lang.ColorFillStyle = "#cd7f32";
                    lang.ColorStrokeStyle = 'rgb(0,0,0,.9)';
                } else if (lang.Quality == 1) {
                    lang.ColorFillStyle = "Red";
                    lang.ColorStrokeStyle = 'rgb(0,0,0,.8)';
                } else if (lang.Quality == 0) {
                    lang.ColorFillStyle = "rgb(128,128,128,.1)";
                    lang.ColorStrokeStyle = 'rgb(0,0,0,.5)';
                } else { lang.ColorFillStyle = "Black"; }

                let nodeLang = {
                    id: lang.id,
                    Name: lang.Name,
                    type: "Option"
                };
              
                category.items.push(nodeLang);
            }

        } else {
            if (dev) console.log("This lang has problems: ", lang.fileName);
        }
    }

    function loadLangFile(fileText) {
        const delimiter = '§'
        let fileContents = fileText.split(delimiter);

        // Same lines
        let lines=fileContents[0].split('\n');
        let lineNumber=1;
        sSimpleWord=loadShortcuts(lines, lineNumber);
        sPhrase=loadShortcuts(lines, lineNumber);
        sSentence=loadShortcuts(lines, lineNumber);
        sSentencePart=loadShortcuts(lines, lineNumber);
        sSentencePattern=loadShortcuts(lines, lineNumber);
        sSentencePatternPart=loadShortcuts(lines, lineNumber);
        sReplaceS=loadShortcuts(lines, lineNumber);
        sReplaceG=loadShortcuts(lines, lineNumber);
        sReplaceE=loadShortcuts(lines, lineNumber);
        sPatternNounFrom=loadShortcuts(lines, lineNumber);
        sPatternNounTo=loadShortcuts(lines, lineNumber);
        sPatternAdjectiveFrom=loadShortcuts(lines, lineNumber);
        sPatternAdjectiveTo=loadShortcuts(lines, lineNumber);
        sPatternPronounFrom=loadShortcuts(lines, lineNumber);
        sPatternPronounTo=loadShortcuts(lines, lineNumber);
        sPatternNumberFrom=loadShortcuts(lines, lineNumber);
        sPatternNumberTo=loadShortcuts(lines, lineNumber);
        sPatternVerbFrom=loadShortcuts(lines, lineNumber);
        sPatternVerbTo=loadShortcuts(lines, lineNumber);
        sAdverb=loadShortcuts(lines, lineNumber);
        sPreposition=loadShortcuts(lines, lineNumber);
        sConjunction=loadShortcuts(lines, lineNumber);
        sParticle=loadShortcuts(lines, lineNumber);
        sInterjection=loadShortcuts(lines, lineNumber);

        // Po souborech
        for (let i = 1; i < fileContents.length; i++) {
            let fileText = fileContents[i];
            RegisterLang(fileText, i);
            progressLoading=i/fileContents.length/2+0.5;
        }        
    
        function loadShortcuts(lines, start) {
            let listShortcuts=[];
            for (let i=start; i<lines.length; i++) {
                let line=lines[i];
                lineNumber++;
                if (line=="-") return listShortcuts;
                listShortcuts.push({id: i-start, data: line});
            }
            return listShortcuts;
        }
    }

    // Usage example
    fetchWithProgress(chrome.runtime.getURL(languagesPackage), (loaded, total) => {
        if (total>0){
            progressLoading=loaded / total/2;
            if (dev) console.log((progressLoading * 100) + "%");
        }
    }).then(downloadedData => {
        // console.log('Fetched data:', downloadedData);
        // ovření kalibrace mapy
        /*if (false) {
            let handlova = new LanguageTr();
            handlova.Load("TW v0.1\ntHandlova\ncTesting point\ng48.7283153,18.7590888\nq=5".split('\n'));
            AddLang(handlova);

            let nymburk = new LanguageTr();
            nymburk.Load("TW v0.1\ntNymburk\ncTesting point\ng50.1856607,15.0428904\nq=5".split('\n'));
            AddLang(nymburk);
        }*/

        // Sorry for everyone for bigger file, but Opera extensions block custom format (.trw_a files)
        let data=JSON.parse(downloadedData);
        loadLangFile(data.data);
               
        setTimeout(function() {
            progressLoading=1;
            loadedLangs=1;
        }, 100)
    })/*.catch(error => {
        console.log('Error fetching data:', error);
    })*/;
}

async function fetchWithProgress(url, onProgress) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const contentLength = +response.headers.get('Content-Length');

    let receivedLength = 0; // Received bytes so far
    const chunks = []; // Array to hold the downloaded chunks

    while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (onProgress) {
            onProgress(receivedLength, contentLength);
        }
    }

    const chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (let chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
    }

    const result = new TextDecoder("utf-8").decode(chunksAll);

    return result;
}

function TranslateSimpleText(input) {
    currentLang = GetCurrentLanguage();

    if (currentLang !== null) {
        let out = currentLang.Translate(input, false);
        if (dev) console.log("Transtated as: ", out);
        return out;
    }
}

function GetDic() {
    currentLang = GetCurrentLanguage();
    let input = dicInput.value;

    urlParamChange("input", input, true);
    urlParamChange("lang", currentLang.Name, true);

    if (currentLang.Quality < 2) document.getElementById("nodeTranslateTextLowQuality").style.display = "block";
    else document.getElementById("nodeTranslateTextLowQuality").style.display = "none";

    if (currentLang !== null) {
        let out = currentLang.GetDic(input);
        document.getElementById("dicOut").innerHTML = "";
        document.getElementById("dicOut").appendChild(out);
    }
}

// Získat zvolený překlad
function GetCurrentLanguage() {
    for (let e of languagesList) {
        if (e.Name == currentLang) {
            currentLang=e;
            return e;
        }
    }
    return null;
}

let step = 0;
let stepEnd = NaN;

function BuildSelect(lang) {
    if (lang == null) return "";
    let parent = document.getElementById("optionsSelect");
    parent.innerHTML = "";
    if (lang.SelectReplace == undefined) return;
    if (lang.SelectReplace == null) return;

    // lang.SelectReplace = např. [["ł", ["ł", "u"]], ["ê", ["e", "ê"]]]
    for (let i = 0; i < lang.SelectReplace.length; i++) {
        const l = lang.SelectReplace[i];
        let to = l[1];
        let node = document.createElement("select");
        node.setAttribute("languageTo", lang.Name)
        node.setAttribute("languageSelectIndex", i);

        // Options
        for (const z of to) {
            let option = document.createElement("option");
            option.innerText = z;
            node.appendChild(option);
        }


        // text
        let info = document.createElement("span");
        info.innerText = "Výběr: ";
        parent.appendChild(info);

        parent.appendChild(node);
    }
}

function isNumeric(str) {
    if (typeof str != "string") return false;
    return !isNaN(str) && !isNaN(parseFloat(str));
}

function ToXOcur(char, ocur, string) {
    let cnt = 0;
    let ret = "",
        bef = "";

    for (let i = 0; i < string.length; i++) {
        let ch = string[i];

        if (cnt == ocur) {
            ret += ch;
        } else {
            if (ch == char) cnt++;
            bef += ch;
        }
    }
    return [bef, ret];
}

function FilterCountry(country) {
    // vše
    if (areaTranslations=="all") return true;

    // neznámé
    if (country<=0) return true;
    if (country==undefined) return true;

    // morava
    if (country==1) return true;

    // morav enklávy
    if (country==8 && (areaTranslations=="mor+e"|| areaTranslations=="mor+sl"|| areaTranslations=="default")) return true;
    
    // slezsko v čr
    if (country==2 && (areaTranslations=="mor+sl" || areaTranslations=="default")) return true;

    return false;
}

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
        { from: "̥á", to: "ó" },
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

    // czech phonetics
    if (transCode == "czech") return [
        { from: "dz", to: "ʒ" },
        { from: "dž", to: "ʒ̆" },
        { from: "vě", to: "vje" },
        { from: "bě", to: "bje" },
        { from: "pě", to: "pje" },
        { from: "fě", to: "fje" },

        { from: "Vě", to: "Vje" },
        { from: "Bě", to: "Bje" },
        { from: "Pě", to: "Pje" },
        { from: "Fě", to: "Fje" },
        
        //{ from: "au", to: "au̯" },
        //{ from: "eu", to: "eu̯" },
        //{ from: "ou", to: "ou̯" },
        { from: "ẹ", to: "e" },
        { from: "ọ", to: "e" },
        { from: "ó́", to: "ó" },
        { from: "ṵ", to: "u̯" },
        { from: "ạ́", to: "̥á" },
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