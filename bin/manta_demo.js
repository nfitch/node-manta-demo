#!/usr/bin/env node
// Copyright (c) 2013, Nate Fitch. All rights reserved.

var bunyan = require('bunyan');
var manta = require('manta');
var path = require('path');

var log = bunyan.createLogger({
    name: path.basename(process.argv[1]),
    level: (process.env.LOG_LEVEL || 'info'),
    stream: process.stdout
});

//You can init a Manta using the CLI signer, which automatically looks at the
// environment and pulls in the relevant env vars.
var client = manta.createBinClient({ 'log': log });

//Some light error handling
if (process.argv.length !== 3) {
    console.error('Usage: ' + process.argv[1] + ' [manta_directory]');
    process.exit(1);
}

//Listing uses an emitter
client.ls(process.argv[2], function (err, res) {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    //The 'res' will emit an 'object' each time it encounters an object.
    res.on('object', function (o) {
        console.log(o.name);
    });

    //Or a 'directory' when it encounters a directory.
    res.on('directory', function (d) {
        console.log(d.name + '/');
    });

    //Don't forget to catch errors!
    res.once('error', function (err) {
        console.error(err);
        process.exit(1);
    });

    //When we're done, we close the client.
    res.once('end', function () {
        client.close();
    });
});
