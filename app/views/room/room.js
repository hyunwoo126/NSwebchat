var Observable = require("data/observable").fromObject;
var ObservableArray = require("data/observable-array").ObservableArray;
var dialogs = require("ui/dialogs");

var messagesList = new ObservableArray([]);

var pageData = new Observable({
    messagesList: messagesList,
    inputUser: 'sky-NS',
    inputMsg: "",
});

var page;
function loaded(args) {
    page = args.object;
    page.bindingContext = pageData;


    //prevent auto focus of textfield
    if(page.android){
        var msg = page.getViewById('msg');
        msg.android.setFocusable(false);
        setTimeout(function () {
            msg.android.setFocusableInTouchMode(true);
        }, 300);
    }

    //grab data from backend and add to pageData
    send('ini');
}
exports.loaded = loaded;

function send(route){
    if(typeof route != 'string'){ var route = ''; }
    console.log('send()');
    console.log(pageData.get('inputMsg'));

    var body = {};
    if(route == 'ini'){
        body = { ini: true };
    } else {
        body = {
            name: pageData.get('inputUser'),
            msg: pageData.get('inputMsg'),
            timestamp: Date.now(),
        }
    }

    //fetch("http://webchat.lincko.sky")
    fetch("http://192.168.1.29:333/"+route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    .then(r => { return r.json(); })
    .then(function (r) {
        messagesList = new ObservableArray(r);
        pageData.set('messagesList', messagesList);
    }).catch(function(done){
        console.log('error');
        console.log(done);
    });


    if(route != 'ini'){
        pageData.set('inputMsg', '');
    }
}
exports.send = send;

exports.changeUser = function(){
    var options = {
        title: "Change your name:",
        defaultText: pageData.get('inputUser'),
        inputType: dialogs.inputType.text,
        okButtonText: "OK",
        cancelButtonText: "cancel",
    };
    dialogs.prompt(options).then(function(r){ 
        if(r.result){
            pageData.set('inputUser', r.text);
        }
    });
}


