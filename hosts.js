var path          = require('path');
var child_process = require('child_process');
var url           = require('url');
var dns           = require('dns');
var Q             = require('q');
var phantomjs     = require('phantomjs');
var fs            = require('fs');
var requestsjs    = path.join(__dirname, 'request.js');
var pages         = fs.readFileSync('urls').toString().trim().split('\n');

Q.all(pages.map(function(page) {
  return gethosts(page);
})).then(function(hosts) {
  console.log(hosts.join('\n\n'));
}).catch(function(err) {
  console.error(err);
});

function gethosts(pageurl) {
  if (typeof pageurl !== 'string' || !pageurl) return undefined;
  var deferred = Q.defer();
  child_process.execFile(phantomjs.path, [ requestsjs, pageurl ],
    function(err, stdout, stderr) {
    if (stderr) return deferred.reject(stderr);
    var requests = JSON.parse(stdout);
    var hostnames = [];
    var ipv4s = [];
    var promises = [];
    for (var i = 0; i < requests.length; i++) {
      var hostname = url.parse(requests[i]).hostname;
      if (hostnames.indexOf(hostname) > -1) continue;
      hostnames.push(hostname);
      promises.push(Q.nfcall(dns.resolve4, hostname))
    }
    var hosts = [];
    deferred.resolve(Q.all(promises).then(function(addresses) {
      for (var i = 0; i < hostnames.length; i++) {
        var spaces = Array(17 - addresses[i][0].length).join(' ');
        hosts.push(addresses[i][0] + spaces + hostnames[i]);
      }
      hosts.sort();
      return hosts.join('\n');
    }));
  });
  return deferred.promise;
}
