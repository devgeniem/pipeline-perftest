var phantomas = require('phantomas');
var fs = require('fs');

var performTest = function(url, config){
    return new Promise((resolve, reject) => {
        phantomas(url, {"analyze-css": true, "timeout": 60}, function(err, json, results) {
            if(err) reject(err);
            var failures = [];
            var result = json.metrics;
            var tresholds = config.tresholds;
            for(var prop in tresholds){
                if(tresholds[prop] != -1 && result[prop] > tresholds[prop]){
                    failures.push(
                        {"url": url, 
                        "testCase": prop, 
                        "result": result[prop],
                        "limit": tresholds[prop],
                        "offenders": json.offenders[prop]});
                }
            }
            resolve(failures);
        });
    });
}

var readConfiguration = function(testFunction){
    fs.readFile('tresholds_default.json', 'utf8', function(err, data) {
        if (err) throw err;
        var config = JSON.parse(data);
        fs.readFile('tresholds_override.json', 'utf8', function(err, data) {
            if (err) throw err;
            var override = JSON.parse(data);
            for(var prop in override.tresholds){
                config.tresholds[prop] = override.tresholds[prop];
            }
            readTargetUrls(function(urls){
                testFunction(config, urls);
            });
        });
    });
}

var readTargetUrls = function(callback){
    fs.readFile('target_urls.json', 'utf8', function(err, data) {
        if (err) throw err;
        callback(JSON.parse(data));
    });
}

var main = function(config, urls){
    console.log("Running performance test suite");
    var promises = urls.map(url => {return performTest(url, config)});
    Promise.all(promises)
        .then(failuresByUrl => {
            var failures = failuresByUrl.reduce(
                (sum, part) => {
                    return sum.concat(part);
                }, []);
            failures.forEach(failure => {
                console.log(["Failed test", failure]);
            });
            var passed = failures.length === 0;
            console.log(passed 
                ? "Performance tests successful!" 
                : "Performance tests FAILED: " + failures.length);
            process.exit(passed ? 0 : 1)
        })
        .catch(error => { 
            console.log(error);
            process.exit(1);
        });
}
readConfiguration(main);                                                                                                                             