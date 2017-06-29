var frameModule = require("ui/frame");
var Observable = require("data/observable").fromObject;

var page;
function loaded(args) {
    page = args.object;
    page.bindingContext = global.data;
}
exports.loaded = loaded;

exports.go = function(){
    page.getViewById("input").dismissSoftInput();
    frameModule.topmost().navigate("views/room/room");
}