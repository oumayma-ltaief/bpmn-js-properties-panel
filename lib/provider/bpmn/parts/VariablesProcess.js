'use strict';

var properties = require('./implementation/Properties'),
    is = require('bpmn-js/lib/util/ModelUtil').is;


module.exports = function(group, element, bpmnFactory, translate) {

  var propertiesEntry;

  if (is(element, 'bpmn:Process')) {

    propertiesEntry = properties(element, bpmnFactory, {
      id: 'properties',
      modelProperties: [ 'id', 'name' ],
      labels: [ translate('Id'), translate('Name') ],

      getParent: function(element, node, bo) { 
        return bo;
      }
    }, translate);

  }

  if (propertiesEntry) {
    group.entries.push(propertiesEntry);
  }

};
