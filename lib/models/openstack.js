'use strict';

module.exports = Openstack;

function Openstack(Openstack) {

    Openstack.executeCommand = async function (command) {
        var openstack_command = ". ./openstack_fulladmin && openstack " + command + " --format json";

        var exec = require('child_process').exec;
        console.log(openstack_command);

        var result = new Promise(function (resolve, reject) {
            exec(openstack_command, {maxBuffer: 1024 * 10000}, function (error, stdout, stderr) {
                if(stderr === undefined || stderr === ""){
                    //console.log("SUCCESS: " + stdout);
                    try {
                        resolve(JSON.parse(stdout));
                    } catch{
                        console.error("ERROR parsing JSON: " + stdout);
                        resolve("ERROR: "+stdout);
                    }
                }
                else {
                    console.error("ERROR: "+stderr);
                    resolve("ERROR: "+stderr);
                }
            });
        });

        return result;
    };

    Openstack.remoteMethod('executeCommand', {
        accepts: [{arg: 'command', type: 'string'}],
        returns: {arg: 'result', type: 'json'},
        http: {path: '/executeCommand', verb: 'get'}
    });

    Openstack.observe('access', function (ctx, next) {
        console.log(ctx.args);
        console.log("OpenStack has been called!\n");
        next();
    });

    return Openstack;
}