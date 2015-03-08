exports.configuredTwiceThrows = function(assert) {
    var module = require("../index.js");
    var config = {
        connections : {
            "default" : {
                server : "localhost"
            }
        }
    };

    module.configure(config);
    assert.throws(function() {
        module.configure(config);
    });
    assert.done();
};

