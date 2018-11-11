'use strict';

var loopback = require('loopback');
var PersistedDataModel = loopback.PersistedModel || loopback.DataModel;
var BaseModel = loopback.Model;

function loadPersistedModel(jsonFile) {
    var modelDefinition = require(jsonFile);
    return PersistedDataModel.extend(modelDefinition.name,
        modelDefinition.properties,
        {
            relations: modelDefinition.relations,
            foreignKeys: modelDefinition.foreignKeys
        });
}

function loadBaseModel(jsonFile) {
    var modelDefinition = require(jsonFile);
    return BaseModel.extend(modelDefinition.name,
        modelDefinition.properties, {
            plural: modelDefinition.plural
        });
}

var Openstack = loadBaseModel('./models/openstack.json');
// var NodeTypeModel = loadModel('./models/node-type.json');
// var NodeModel = loadModel('./models/node.json');

exports.Openstack = require('./models/openstack')(Openstack);
// exports.Nodetype = require('./models/node-type')(NodeTypeModel);
// exports.Node = require('./models/node')(NodeModel);

module.exports = function (nfvinspector, options) {
    nfvinspector.model(exports.Openstack);
    // nfvinspector.model(exports.Nodetype, { dataSource: 'mysql' });
    // nfvinspector.model(exports.Node, { dataSource: 'mysql' });
};