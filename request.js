var page = require('webpage').create();
var system = require('system');
var address = system.args[1];
var requests = [];
page.onResourceRequested = function (req) {
  requests.push(req.url);
};
page.onInitialized = function() {
  page.evaluate(function() {
    Function.prototype.bind = Function.prototype.bind || function (thisp) {
      var fn = this;
      return function() {
        return fn.apply(thisp, arguments);
      };
    };
  });
};
page.open(address, function (status) {
  setTimeout(function() {
    console.log(JSON.stringify(requests));
    phantom.exit();
  }, 10000);
});
