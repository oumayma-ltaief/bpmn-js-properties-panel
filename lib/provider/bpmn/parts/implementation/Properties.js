'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var factory = require('../../../../factory/EntryFactory');

var elementHelper = require('../../../../helper/ElementHelper'),
    cmdHelper = require('../../../../helper/CmdHelper'),
    utils = require('../../../../Utils');

var assign = require('lodash/assign'),
    forEach = require('lodash/forEach');

function generatePropertyId() {
  return utils.nextId('Property_');
}

/**
 * Get all bpmn:Property list objects for a specific business object
 *
 * @param element bpmn:Process
 *
 * @return array a bpmn:Property list objects
 */
function getPropertiesElement(element) {
  return element.properties;
}

/**
 * Create a camunda:property entry using tableEntryFactory
 *
 * @param  {djs.model.Base} element
 * @param  {BpmnFactory} bpmnFactory
 * @param  {Object} options {id: {string}, modelProperties: {Array<string>}, labels: {Array<string>}, getParent: {function}}
 * @param {function} translate
 */
module.exports = function(element, bpmnFactory, options, translate) {

  var getParent = options.getParent;

  var modelProperties = options.modelProperties;

  var bo = getBusinessObject(element);

  // build properties group only when the participant have a processRef
  if (!bo) {
    return;
  }

  assign(options, {
    addLabel: translate('Add Property'),
    getElements: function(element, node) {
      var parent = getParent(element, node, bo);
      return getPropertiesElement(parent);
    },
    addElement: function(element, node) {
      var commands = [],
          parent = getParent(element, node, bo);

      var properties = getPropertiesElement(parent);

      if (!properties) {
        properties = [];
        commands.push(cmdHelper.updateBusinessObject(element, parent, { 'properties': properties }));
      }

      var propertyProps = {};
      forEach(modelProperties, function(prop) {
        propertyProps[prop] = undefined;
      });

      // create id if necessary
      if (modelProperties.indexOf('id') >= 0) {
        propertyProps.id = generatePropertyId();
      }

      var property = elementHelper.createElement('bpmn:Property', propertyProps, parent, bpmnFactory);
      properties.push(property);
      commands.push(cmdHelper.updateBusinessObject(element, parent, { properties: properties }));

      return commands;
    },
    updateElement: function(element, value, node, idx) {
      var parent = getParent(element, node, bo),
          property = getPropertiesElement(parent)[idx];

      forEach(modelProperties, function(prop) {
        value[prop] = value[prop] || undefined;
      });

      return cmdHelper.updateBusinessObject(element, property, value);
    },
    validate: function(element, value, node, idx) {
      // validate id if necessary
      if (modelProperties.indexOf('id') >= 0) {

        var parent = getParent(element, node, bo),
            properties = getPropertiesElement(parent),
            property = properties[idx];

        if (property) {
          // check if id is valid
          var validationError = utils.isIdValid(property, value.id);

          if (validationError) {
            return { id: validationError };
          }
        }
      }
    },
    removeElement: function(element, node, idx) {
      var commands = [],
          parent = getParent(element, node, bo),
          properties = getPropertiesElement(parent);
      properties.splice(idx, 1); // remove property
      commands.push(cmdHelper.updateBusinessObject(element, parent, { properties: properties }));

      return commands;
    }
  });

  return factory.table(options);
};
