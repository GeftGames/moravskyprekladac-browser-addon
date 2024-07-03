let dev=true;
let activated=true;

let ignoreSites=[
    "edge:",
    "chrome:",
    "firefox:"
];

// html leaded
window.addEventListener("load", function() {
    if (dev) console.log("moravskyprekladac showed in action!");   
    handlerMessages();

    if(!ignoreSites.includes(window.location.protocol)) {
        SendNeedToTranslate();
    }
});

// Send to background
function SendNeedToTranslate() {
    chrome.runtime.sendMessage({
        command: "translate_simpleDimpleAll",
        sender: "content",
        receiver: "background",
        data: {
            body: document.body.innerHTML,
            title: document.title
        }
    });
}

// receive all messages from background
function handlerMessages() {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (dev) console.log("Get message", request);

        if (request.receiver == 'content') {
            if (activated) {
                if (request.command == 'translate_simpleDimpleAll') {
                    if(!ignoreSites.includes(window.location.protocol)) ChangePageSimpleDimpleAll(request.data);
                }
                if (request.command == 'translateSelected') {
                    ShowTranslatedText(request.data.selected);
                }
                if (request.command == 'openPage') {
                    console.log("opening page");
                    window.open(request.data.url, '_blank').focus();
                }
            }
           
            if (request.command == 'activated') {
                activated=request.data;
            }
           
        }
    })
}

function ShowTranslatedText(text) {
    alert(text);
}

// Set translated text to page
function ChangePageSimpleDimpleAll(data) {
    if (dev) console.log("shitting your site");
    if (data.body!=undefined)document.body.innerHTML=data.body;

    if (data.title!=undefined) document.title=data.title;
}

//https://stackoverflow.com/questions/75788234/how-to-make-popup-js-content-js-and-background-js-communicate-in-the-chrome-ex