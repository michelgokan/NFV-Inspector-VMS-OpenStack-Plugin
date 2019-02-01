'use strict';

module.exports = Openstack;

function Openstack(Openstack) {

    Openstack.executeCommand = async function (command) {
        var openstack_command = ". ./openstack_fulladmin && openstack " + command + " --format json";

        var exec = require('child_process').exec;
        console.log(openstack_command);

        var result = new Promise(function (resolve, reject) {
            exec(openstack_command, {maxBuffer: 1024 * 10000}, function (error, stdout, stderr) {
                if (stderr === "undefined" || stderr === "") {
                    //console.log("SUCCESS: " + stdout);
                    try {
                        resolve(JSON.parse(stdout));
                    } catch (error) {
                        console.error("ERROR parsing JSON: " + stdout);
                        resolve("ERROR: " + stdout);
                    }
                }
                else {
                    console.error("ERROR: " + stderr);
                    resolve("ERROR: " + stderr);
                }
            });
        });

        return result;
    };

    Openstack.getHypervisors = async function () {
        var result = Openstack.executeCommand("hypervisor list --long").then(function (hypervisorsInOpenStackFormat) {
            var hypervisorsName = hypervisorsInOpenStackFormat.map(item => item["Hypervisor Hostname"]);
            var hypervisorsAddress = hypervisorsInOpenStackFormat.map(item => item["Host IP"]);
            var hypervisorsCPUCap = hypervisorsInOpenStackFormat.map(item => item["vCPUs"]);
            //var hypervisorsStorageCap = hypervisorsInOpenStackFormat.map(item => item.status.allocatable["ephemeral-storage"]);
            var hypervisorsMemoryCap = hypervisorsInOpenStackFormat.map(item => item["Memory MB"] * 1000 * 1000);
            var hypervisorsMetadata = hypervisorsInOpenStackFormat;

            var hypervisorsData = [];

            for (var i = 0; i < hypervisorsInOpenStackFormat.length; i++) {
                hypervisorsData.push({
                    "name": hypervisorsName[i],
                    "address": hypervisorsAddress[i],
                    "cpu_cap": hypervisorsCPUCap[i],
                    //"storage_cap": hypervisorsStorageCap[i],
                    "memory_cap": hypervisorsMemoryCap[i],
                    "metadata": JSON.stringify(hypervisorsMetadata[i])
                });
            }

            return hypervisorsData;
        });

        return result;
    };

    Openstack.getFlavors = async function () {
        var result = Openstack.executeCommand("flavor list --long").then(function (flavorsInOpenStackFormat) {
            var flavorID = flavorsInOpenStackFormat.map(item => item["ID"]);
            var flavorName = flavorsInOpenStackFormat.map(item => item["Name"]);
            var flavorVCPUCap = flavorsInOpenStackFormat.map(item => item["VCPUs"]);
            //var hypervisorsStorageCap = hypervisorsInOpenStackFormat.map(item => item.status.allocatable["ephemeral-storage"]);
            var flavorMemoryCap = flavorsInOpenStackFormat.map(item => item["RAM"] * 1000 * 1000);
            var flavorsMetadata = flavorsInOpenStackFormat;

            var flavorsData = [];

            for (var i = 0; i < flavorsInOpenStackFormat.length; i++) {
                flavorsData.push({
                    "id": flavorID[i],
                    "name": flavorName[i],
                    "cpu_cap": flavorVCPUCap[i],
                    //"storage_cap": hypervisorsStorageCap[i],
                    "memory_cap": flavorMemoryCap[i],
                    "metadata": JSON.stringify(flavorsMetadata[i])
                });
            }

            return flavorsData;
        });

        return result;
    };

    Openstack.getVMs = async function () {
        var result = Openstack.executeCommand("server list --long").then(function (VMsInOpenStackFormat) {
            var json = Openstack.getFlavors().then(function (flavors) {

                var VMsName = VMsInOpenStackFormat.map(item => item["Name"]);
                var VMsAddress = VMsInOpenStackFormat.map(item => item["Networks"]);
                var VMsVCPUCap = VMsInOpenStackFormat.map(item=>flavors.filter(item2=>item2["id"]===item["Flavor ID"])[0].cpu_cap);
                //var hypervisorsStorageCap = hypervisorsInOpenStackFormat.map(item => item.status.allocatable["ephemeral-storage"]);
                var VMsMemoryCap = VMsInOpenStackFormat.map(item=>flavors.filter(item2=>item2["id"]===item["Flavor ID"])[0].memory_cap);
                var VMsMetadata = VMsInOpenStackFormat;

                var VMsData = [];

                for (var i = 0; i < VMsInOpenStackFormat.length; i++) {
                    VMsData.push({
                        "name": VMsName[i],
                        "address": VMsAddress[i],
                        "cpu_cap": VMsVCPUCap[i],
                        //"storage_cap": hypervisorsStorageCap[i],
                        "memory_cap": VMsMemoryCap[i],
                        "metadata": JSON.stringify(VMsMetadata[i])
                    });
                }

                return VMsData;
            });

            return json
        });
        return result;
    };

    Openstack.remoteMethod('executeCommand', {
        accepts: [{arg: 'command', type: 'string'}],
        returns: {arg: 'result', type: 'json'},
        http: {path: '/executeCommand', verb: 'get'}
    });

    Openstack.remoteMethod('getHypervisors', {
        returns: {arg: 'result', type: 'json'},
        http: {path: '/getHypervisors', verb: 'get'}
    });

    Openstack.remoteMethod('getFlavors', {
        returns: {arg: 'result', type: 'json'},
        http: {path: '/getFlavors', verb: 'get'}
    });

    Openstack.remoteMethod('getVMs', {
        returns: {arg: 'result', type: 'json'},
        http: {path: '/getVMs', verb: 'get'}
    });

    Openstack.observe('access', function (ctx, next) {
        console.log(ctx.args);
        console.log("OpenStack has been called!\n");
        next();
    });

    return Openstack;
}
