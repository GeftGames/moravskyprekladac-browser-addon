let dev=true;

// html leaded
window.addEventListener("load", function() {
    if (dev) console.log("moravskyprekladac showed in action!");
    handlerMessages();

    SendNeedToTranslate();
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
            if (request.command == 'translate_simpleDimpleAll') {
                ChangePageSimpleDimpleAll(request.data);
            }
        }
    })
}

// Set translated text to page
function ChangePageSimpleDimpleAll(data) {
    if (dev) console.log("shitting your site");
    document.body.innerHTML=data.body;
    document.title=data.title;
}

//https://stackoverflow.com/questions/75788234/how-to-make-popup-js-content-js-and-background-js-communicate-in-the-chrome-ex