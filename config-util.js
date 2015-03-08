function MissingError(path) {
    ConfigurationError("missing configuration field at path " + path);
}

function ConfigurationError(msg) {
    throw new Error("StreamSql -> Configuration error: " + msg);
}

function BufferError(key, field) {
    ConfigurationError("not compatible with buffered rowCollections. Path connections['"
        + key + "'].options." + field);
}

exports.CheckMinimumConfig = function CheckMinimumConfig(newConfig) {
    if (!newConfig) {
        ConfigurationError("missing argument [newConfig]");
    }

    if (!newConfig.connections) {
        MissingError("connections");
    }

    var keys = Object.keys(newConfig.connections);
    if (keys.length == 0) {
        ConfigurationError("missing a connections key")
    }
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var connection = newConfig.connections[key];
        if (!connection) {
            ConfigurationError("falsey connection object with key '" + key + "'");
        }
        if (!connection.server) {
            MissingError("connections['" + key + "'].server");
        }
        if((typeof connection.server) !== "string") {
            ConfigurationError("connections['" + key + "'].server must be a string");
        }
        if (connection.options) {
            if (connection.options.rowCollectionOnDone) {
                BufferError(key, "rowCollectionOnDone");
            }
            if (connection.options.rowCollectionOnRequestCompletion) {
                BufferError(key, "rowCollectionOnRequestCompletion")
            }
        }
    }
};

exports.CopyConfig = function CopyConfig(oldConfig) {
    return JSON.parse(JSON.stringify(oldConfig));
};