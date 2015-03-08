var configUtil = require("../config-util.js");

function ExpectConfigError(assert, config) {
    assert.throws(function() {
       configUtil.CheckMinimumConfig(config);
    });
    assert.done();
}

exports.minimumConfigAccepted = function(assert) {
    var config = {
        connections : {
            "DefaultConnection" : {
                server : "localhost"
            }
        }
    };
    assert.doesNotThrow(function() {
        configUtil.CheckMinimumConfig(config);
    });
    assert.done();
};

exports.nullConfigThrows = function(assert) {
    var config = null;
    ExpectConfigError(assert, config);
};

exports.missingConnectionsThrows = function(assert) {
    var config = {

    };
    ExpectConfigError(assert, config);
};

exports.missingConnectionsKeyThrows = function(assert) {
    var config = {
        connections: {}

    };
    ExpectConfigError(assert, config);
};

exports.falseyConnectionsKeyThrows = function(assert) {
    var config = {
        connections: {
            "Default": null
        }
    };
    ExpectConfigError(assert, config);
};

exports.missingConnectionServerThrows = function(assert) {
    var config = {
        connections : {
            "Whatevs" : {

            }
        }
    };
    ExpectConfigError(assert, config);
};

exports.invalidConnectionServerTypeThrows = function(assert) {
    var config = {
        connections: {
            "whaeves" : {
                server : 1
            }
        }
    };
    ExpectConfigError(assert, config);
};

exports.rowCollectionOptionDoneSetThrows = function(assert) {
    var config = {
        connections : {
            "what ever dude" : {
                server : "localhost",
                options : {
                    rowCollectionOnDone : true
                }
            }
        }
    };
    ExpectConfigError(assert, config);
};

exports.rowCollectionRequestCompleteSetThrows = function(assert) {
    var config = {
        connections : {
            "what ever dude" : {
                server : "localhost",
                options : {
                    rowCollectionOnRequestCompletion : true
                }
            }
        }
    };
    ExpectConfigError(assert, config);
};

exports.rowCollectionBothSetThrows = function(assert) {
    var config = {
        connections : {
            "what ever dude" : {
                server : "localhost",
                options : {
                    rowCollectionOnDone : true,
                    rowCollectionOnRequestCompletion : true
                }
            }
        }
    };
    ExpectConfigError(assert, config);
};

exports.configObjectCopied = function(assert) {
    var config = {
        connections : {
            "default" : {
                server : "localhost",
                username : "user",
                password : "pass",
                options : {
                    encrypt : true
                }
            }
        }
    };
    var copiedConfig = configUtil.CopyConfig(config);
    assert.ok(config !== copiedConfig);

    var configJson = JSON.stringify(config);
    var copiedJson = JSON.stringify(copiedConfig);
    assert.equal(configJson, copiedJson);

    assert.done();
};

