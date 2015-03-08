# StreamSql
A node.js stream-based API for communicating with Microsoft SQL Server 

# Initial Overview

The goal of this node package is to provide a non-buffered and easier to use API for Tedious. Primarily this means
reducing the number of touchpoints necessary to make a SQL Query using Tedious, particularly with respect to connection
handling and query execution.

NOTE: This module does not support fully buffering all rows in the result set into memory, which is contrary
to the goal of this module.