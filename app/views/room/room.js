var Observable = require("data/observable").fromObject;
var ObservableArray = require("data/observable-array").ObservableArray;
var dialogs = require("ui/dialogs");

//https://github.com/NathanaelA/nativescript-websockets
require('nativescript-websockets');

var messagesList = new ObservableArray([]);

var pageData = new Observable({
    messagesList: messagesList,
    inputUser: 'sky-NS',
    inputMsg: "",
});

var mySocket;
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

    //websocket connection (nativescript-websockets)
    mySocket = new WebSocket('ws://192.168.1.29:8080', [ /* "protocol","another protocol" */]);
    mySocket.addEventListener('open', function (e){ 
        console.log("Connection established!"); 
    });
    mySocket.addEventListener('message', function(e){
         //console.log("We got a message: ", e.data); e.target.close();
        var new_msg = JSON.parse(e.data);
        new_msg.time = new_msg.timestamp;
        messagesList.push(new_msg);
        scrollToBottom(true);
    });
    mySocket.addEventListener('close', function(e){ 
        console.log("The Socket was Closed:", e.code, e.reason); 
    });
    mySocket.addEventListener('error', function(e){
        console.log("The socket had an error", e.error); 
    });
    

    //grab data from backend and add to pageData
    send('ini');
}
exports.loaded = loaded;

function scrollToBottom(animate){
    var view_list = page.getViewById('messagesList');
    if(animate && page.android){
        view_list.android.smoothScrollToPosition(view_list.items.length);
    } else {
        view_list.scrollToIndex(view_list.items.length);
    }
}

function tapInput(){
    setTimeout(function(){
        scrollToBottom(true);
    },100);
}
exports.tapInput = tapInput;

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
        scrollToBottom(route == 'ini'?false:true);
    }).catch(function(done){
        console.log('error');
        console.log(done);
    });


    if(route != 'ini'){
        mySocket.send(JSON.stringify(body));
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


