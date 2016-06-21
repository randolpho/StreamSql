# stream-sql
A node.js stream-based API for communicating with Microsoft SQL Server 

# Overview

Stream-sql is a node package with a simple goal: provide a stream-based and easier to use API for 
[Tedious](http://github.com/pekim/tedious). Stream-sql transforms the result sets read from Tedious into a node object 
stream, enabling a functional approach to your noding when dealing with Microsoft SQL Server on the backend. 
 
**NOTE:** Stream-sql does not support fully buffering all rows in the result set into memory. If you want your 
result-set as an array, either buffer it yourself or use Tedious directly. 

# Installation
Stream-sql is registered with npm as *stream-sql*, so installation is as easy as 

    npm install stream-sql

# Getting Started
Below is a simple example that connects to a SQL Server hosted at *localhost* and writes the result objects
to standard out. It uses JSONStream to transform the objects into JSON on the fly.   

```javascript

    var sql = require("stream-sql");
    var JSONStream = require("JSONStream");
    
    var config = {
        connections : {
            "default" : {
                server  : "localhost",
                userName: "user",
                password: "pass"
            }
        }
    };
    sql.configure(config);
    
    var transformStream = JSONStream.stringify();
    var query = "select * from mytable";
    
    var responseStream = sql.execute(query);
    responseStream.pipe(transformStream).pipe(process.stdout);
    
```
