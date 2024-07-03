const languagesPackage = "/engine/v3.trw_a"; //"https://raw.githubusercontent.com/GeftGames/moravskyprekladac/main/v1.trw_a";
let loadedversion = "TW 3";

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

function init() {
    if (dev) console.log("Translator inicializating starting...");

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

function GetTranslations() {
    loadedLangs=0;
    
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
        AddLang(tr);
        console.log(tr.Name);
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
            
            if ((!allTranslates && stats >= 10 && FilterCountry(lang.Country)) || (allTranslates && lang.Quality >= 0)) {
                let name = lang.Name;
  
                if (lang.Quality > 2) name += " ✅";
                if (stats == 0) name += " 💩";

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
                    Id: lang.id,
                    Name: lang.Name,
                    type: "Option"
                };
              
                category.items.push(nodeLang);
            }

        } else {
            if (dev) console.log("This lang has problems: ", lang.fileName);
        }
    }


    // Usage example
    fetchWithProgress(chrome.runtime.getURL(languagesPackage), (loaded, total) => {
        if (total>0){
            progressLoading=loaded / total;
            if (dev) console.log((progressLoading * 100) + "%");
        }
    }).then(data => {
       // console.log('Fetched data:', data);
          // ovření kalibrace mapy
        if (false) {
            let handlova = new LanguageTr();
            handlova.Load("TW v0.1\ntHandlova\ncTesting point\ng48.7283153,18.7590888\nq=5".split('\n'));
            AddLang(handlova);

            let nymburk = new LanguageTr();
            nymburk.Load("TW v0.1\ntNymburk\ncTesting point\ng50.1856607,15.0428904\nq=5".split('\n'));
            AddLang(nymburk);
        }

        const delimiter = '§'
        let fileContents = data.split(delimiter);

        // Po souborech
        for (let i = 0; i < fileContents.length; i += 2) {
            let //fileName = fileContents[i],
                fileText = fileContents[i + 1];

            if (typeof fileText === 'string' || fileText instanceof String) RegisterLang(fileText, i/2);
        }
        
        setTimeout(function() {
            progressLoading=1;
            loadedLangs=1;
        }, 100)
    })/*.catch(error => {
        console.log('Error fetching data:', error);
    })*/;
/*
    const xhttp = new XMLHttpRequest();

    let select2 = document.getElementById("selectorTo");

    // background.js or any other JS file in your extension
    

    xhttp.onload = function() {
      

        
    }
    xhttp.addEventListener('error', (e) => {
        console.log('error', e);
    });

    // github nemá dnou maximální velkost souborů
    function ProgressE(e) {
       
    }

    xhttp.onprogress = ProgressE;
    let urlPackage=chrome.runtime.getURL(languagesPackage);
    console.log("Download lang package begin! ", urlPackage);
    xhttp.open("GET", urlPackage);
    xhttp.send();*/
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

        if (done) {
            break;
        }

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
    //console.log("input: ", input);

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