'use strict';

var request = require('request').defaults({
  proxy: process.env.http_proxy ||
         process.env.HTTP_PROXY ||
         process.env.https_proxy ||
         process.env.HTTPS_PROXY
});

/**
 * Build a (sub)query string from search options
 * @param  {Object} options  search options
 * @param  {String} operator operator to use between options, ie. AND/OR
 * @return {String}          solr compliant query string
 */
function buildQuery(search, operator) {
  search   = search   || {};
  operator = operator || 'AND';

  var parts = [];
  var negation; // NOT subquery

  if (Array.isArray(search)) {
    search.forEach(function (subquery) {
      var part = buildQuery(subquery, 'AND');
      if (part) { parts.push(part); }
    });
  } else {
    var subquery;

    for (var p in search) {
      switch (p) {
        case '$or':
          subquery = buildQuery(search[p], 'OR');
          if (subquery) { parts.push(subquery); }
          break;
        case '$and':
          subquery = buildQuery(search[p], 'AND');
          if (subquery) { parts.push(subquery); }
          break;
        case '$not':
          subquery = buildQuery(search.$not, 'OR');
          if (subquery) { negation = 'NOT(' + subquery + ')'; }
          break;
        default:
          parts.push(p + ':' + search[p].toString());
      }
    }
  }

  if (parts.length === 0) {
    return negation || '';
  }
  
  if (parts.length > 1 || negation) {
    var query = negation ? negation + operator + '(' : '(';
    return (query += parts.join(')' + operator + '(') + ')');
  }
  
  return parts[0];
}

/**
 * Shorthand function to get multiple docs
 * @param  {Object}   options
 * @param  {Function} callback(err, docs)
 */
exports.find = function (search, options, callback) {

  if (typeof options === 'function') {
    callback = options;
    options  = {};
  }

  exports.query(search, options, function (err, result) {
    if (err) { return callback(err); }

    if (result.response && Array.isArray(result.response.docs)) {
      callback(null, result.response.docs);
    } else {
      callback(new Error('unexpected result, documents not found'));
    }
  });
};

/**
 * Shorthand function to get one doc
 * @param  {Object}   search
 * @param  {Object}   options
 * @param  {Function} callback(err, docs)
 */
exports.findOne = function (search, options, callback) {
  options = options || {};

  if (typeof options === 'function') {
    callback = options;
    options  = {};
  }

  options.rows = 1;

  exports.query(search, options, function (err, result) {
    if (err) { return callback(err); }

    if (result.response && Array.isArray(result.response.docs)) {
      callback(null, result.response.docs[0]);
    } else {
      callback(new Error('unexpected result, documents not found'));
    }
  });
};

/**
 * Query HAL and get results
 * @param  {Object}   search   the actual query parameters
 * @param  {Object}   options  proxy and query options (sort, rows, fl...)
 * @param  {Function} callback(err, result)
 */
exports.query = function (search, options, callback) {
  options = options || {};

  if (typeof options === 'function') {
    callback = options;
    options  = {};
  }

  var query = (typeof search === 'string' ? search : buildQuery(search, 'AND') || '*:*');

  var requestOptions = {};
  if (options.hasOwnProperty('proxy')) {
    requestOptions.proxy = options.proxy;
    delete options.proxy;
  }

  // query link
  var url = 'http://api.archives-ouvertes.fr/search/?wt=json&q=' + encodeURIComponent(query);

  // for convenience, add fields as an alias for fl
  if (options.fields) {
    options.fl = options.fields;
    delete options.fields;
  }
  // for convenience, convert fl to string if it's an array
  if (Array.isArray(options.fl)) {
    options.fl = options.fl.join(',');
  }

  // append options to the query (ex: start=1, rows=10)
  for (var p in options) {
    url += '&' + p + '=' + options[p];
  }

  request.get(url, requestOptions, function (err, res, body) {
    if (err) { return callback(err); }

    if (res.statusCode !== 200) {
      return callback(new Error('unexpected status code : ' + res.statusCode));
    }

    var info;

    try {
      info = JSON.parse(body);
    } catch(e) {
      return callback(e);
    }

    // if an error is thown, the json should contain the status code and a detailed message
    if (info.error) {
      var error = new Error(info.error.msg || 'got an unknown error from the API');
      error.code = info.error.code;
      return callback(error) ;
    }

    callback(null , info);
  });
};
