/**!
 * collection-sync
 *
 * @author Enrico Marino and Federico Spini
 * @copyright 2013 Enrico Marino and Federico Spini
 * @licence MIT
 */

/** 
 * Component dependencies.
 */

var request = require('request');
var model_sync = require('model-sync');

/**
 * Expose component
 */

module.exports = function (collection) {

  collection.model.use(model_sync);

  /**
   * root
   */
  
  collection.prototype.root = '';
  
  /**
   * path
   */
   
  collection.prototype.path = '/';
  
  /**
   * url
   * Get the model url.
   *
   * @return {String} the collection url.
   * @api public
   */
  
  collection.prototype.url = function () {
    return this.root
      .concat('/')
      .concat(this.path)
      .replace(/\/\//, '/');
  };
  
  /**
   * get_by_id
   * 
   * @param {String} id id of the model to get
   * @return {Model} model
   * @api public
   */
   
  collection.prototype.get_by_id = function (id) {
    var models = this.models;
    var len = models.length;
    var i;
    var model;
    
    for (i = 0; i < len; i += 1) {
      model = models[i];
      if (model.id() === id) {
        return model;      
      }
    }
    
    return;
  }
  
  /**
   * obtain
   * obtain a model (get or fetch)
   * 
   * @param {String} id id
   * @param {Function} callback callback
   * @api public
   */
  
  collection.prototype.obtain = function (id, callback) {
   var model = this.get_by_id(id);
   
   if (!model) {
     model = new this.model();
     model.set(model.primary_key, id);
     this.add(model);
     model.fetch(callback);
     return;
   }
   
   callback(null, model);
  }
  
  /**
   * create
   *
   * @param {Object} data data
   * @param {Function} callback callback
   *   @param {Object} err error
   *   @param {Model} model model
   * @param {Object} context
   * @api public
   */
  
  collection.prototype.create = function (attributes, options, callback, context) {
    attributes = attributes || {};
    options = options || {};
    callback = callback || function () {};
    var collection = this;
    var url = collection.url();
    var data = attributes;
  
    request
      .post(url)
      .data(data)
      .end(function (res) {
        var models;
  
        if (res.ok) {
          models = collection.add(res.body, options);
          callback.call(context, null, models);
        } else {
          callback.call(context, res.body, null);
        }
      });
  };
  
  /**
   * fetch
   *
   * @param {Object} options options
   * @param {Function} callback callback
   *   @param {Object} err error
   *   @param {Object} res response
   * @param {Object} context
   * @api public
   */
  
  collection.prototype.fetch = function (options, callback, context) {
    options = options || {};
    callback = callback || function () {};
    var query = options.query || {};
    var collection = this;
    var url = collection.url();
    
    request
      .get(url)
      .query(query)
      .end(function (res) {
        var models;
        
        if (res.ok) {
          models = collection.add(res.body, options);
          callback.call(context, null, models);
        } else {
          callback.call(context, res.text, null);
        }
      });
  };
  
  return collection;
};
