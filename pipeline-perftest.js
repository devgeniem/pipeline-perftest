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
                        "treshold": tresholds[prop],
                        "offenders": json.offenders[prop]});
                }
            }
            for(var i in config.advancedTests){
                var test = config.advancedTests[i];
                //TODO: expand this
                switch(test.method){
                    case("eq"):{
                        if(result[test.param1] != result[test.param2]){
                            var fail = {"url": url, "testCase": test.name};
                            fail[test.param1] = result[test.param1];
                            fail[test.param2] = result[test.param2];
                            failures.push(fail);
                        }
                        break;
                    }
                    case("nop"): break;
                    default: console.log("WARNING: Not supported test method ignored: " + test.method); break;
                }
            }
            resolve(failures);
        });
    });
}

var handleAdvancedTestOverride = function(test, config){
    var overrode = false;
    for(var j in config.advancedTests){
        if(config.advancedTests[j].name === test.name){
            config.advancedTests[j] = test;
            overrode = true;
        }
    }
    if(!overrode){
        config.advancedTests.push(test);
    }
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
            for(var i in override.advancedTests){
                handleAdvancedTestOverride(override.advancedTests[i], config);
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