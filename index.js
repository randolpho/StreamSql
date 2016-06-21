var tds = require("tedious");
var util = require("util");
var stream = require("stream");
var configUtil = require("./config-util.js");

var globalConfig = {};

var configured = false;

function CheckConfigured() {
    if (!configured) {
        throw new Error("StreamSql -> StreamSql has not been configured.");
    }
}

function GetConnectionConfig(name) {
    if(name) {
        var conn = globalConfig.connections[name];
        if(conn) {
            return conn;
        }
        // invalid name, better to throw than default
        throw new Error("StreamSql -> Unrecognized connection name '" + name + "'");
    }

    var key = Object.keys(globalConfig.connections)[0];
    return globalConfig.connections[key];
}

exports.TYPES = tds.TYPES;

exports.configure = function configure(newConfig) {
    if(configured) {
        throw new Error("StreamSql -> StreamSql can only be configured once. Calling configure a second time indicates a major error in your program.");
    }
    configUtil.CheckMinimumConfig(newConfig);
    globalConfig = configUtil.CopyConfig(newConfig);
    configured = true;
};

// Executes a t-sql query or stored procedure without any parameters as a single statement.
//
//   query              a string containing a single t-sql statement to execute
//   connectionName     an optional string containing the keyname of the connection configuration to use.
//                      defaults to the first connection in the connections map if not specified
//
// Returns an object stream of row objects.
exports.execute = function execute(query, connectionName) {
    var request = new StreamSqlRequest(query);
    return request.execute(connectionName);
};

// Creates a request object for building a parameterized query
//
//   query    a string containing a single t-sql statement to execute
//   connectionName     an optional string containing the keyname of the connection configuration to use.
//                      defaults to the first connection in the connections map if not specified
//
// Returns a StreamSqlRequest object
exports.createRequest = function createRequest(query) {
    return new StreamSqlRequest(query);
};

// funny thing about util.inherits -- you have to call it *before*
// you define any prototype overrides.
util.inherits(StreamSqlResponseStream, stream.Readable);

function StreamSqlResponseStream(options) {
    this._executing = false;
    stream.Readable.call(this, options);
}

StreamSqlResponseStream.prototype.ExecuteQuery = function() {
    // deliberately left blank; intended to be overridden
};

StreamSqlResponseStream.prototype._read = function _read() {
    if(!this._executing) {
        this._executing = true;
        this.ExecuteQuery();
    }
};


function StreamSqlRequest(query) {
    var connectionConfig = null;
    var responseStream = new StreamSqlResponseStream({objectMode:true});
    var tdsConnection = null;
    var tdsRequest = new tds.Request(query, TdsRequestComplete);

    tdsRequest.on("row", TdsRow);

    responseStream.ExecuteQuery = StartExecution;

    function TdsRequestComplete(err, rowCount) {
        if(err) {
            responseStream.emit("error", err);
        }
        responseStream.push(null);
        tdsConnection.close();
    }

    function TdsRow(columns) {
        var rowObj = {};
        if (columns.length == 1 &&
                (columns[0].metadata.colName == "JSON_F52E2B61-18A1-11d1-B105-00805F49916B" 
                || columns[0].metadata.colName == "XML_F52E2B61-18A1-11d1-B105-00805F49916B")) {
            rowObj = columns[0].value;
        } else {
            columns.forEach(function (column) {
                rowObj[column.metadata.colName] = column.value;
            });
        }
        responseStream.push(rowObj);
    }

    function StartExecution() {
        tdsConnection = new tds.Connection(connectionConfig);
        tdsConnection.on("connect", function(err) {
            if(err) {
                responseStream.emit("error", err);
                return;
            }
            tdsConnection.execSql(tdsRequest);
        })

    }

    this.addParameter = function StreamSqlRequest_addParameter(name, type, value, options) {
        tdsRequest.addParameter(name, type, value, options);
    };

    this.addOutParameter = function StreamSqlRequest_addOutParameter(name, type, value, options) {
        tdsRequest.addOutputParameter(name, type, value, options);
    };

    this.execute = function StreamSqlRequest_execute(connectionName) {
        CheckConfigured();
        connectionConfig = GetConnectionConfig(connectionName);
        return responseStream;
    };

    this.cancel = function StreamSqlRequest_cancel() {
        tdsConnection.cancel();
    };
}