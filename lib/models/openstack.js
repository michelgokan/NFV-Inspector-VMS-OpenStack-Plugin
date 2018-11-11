'use strict';

module.exports = Openstack;

function Openstack(Openstack) {

    Openstack.executeCommand = async function (command) {
        var openstack_command = "source ./openstack_fulladmin && openstack " + command + " --format json";

        var exec = require('child_process').exec;
        console.log(openstack_command);

        var result = new Promise(function (resolve, reject) {
            exec(openstack_command, {maxBuffer: 1024 * 10000}, function (error, stdout, stderr) {
                resolve(JSON.parse(stdout));
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
