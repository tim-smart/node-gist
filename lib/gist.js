var Gist, Task, loadGist, nest, path;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
path = require('path');
nest = require('nest');
Task = require('parallel').Task;
loadGist = function(c, id, file, callback) {
  return c.get("raw/" + id + "/" + file, function(error, response, data) {
    if (error) {
      return callback(error);
    }
    return callback(null, data);
  });
};
Gist = (function() {
  function Gist(options) {
    options || (options = {});
    this.id = options.id || null;
    this.private = options.private || false;
    this.data = null;
    this.upload = {
      file_name: {},
      file_contents: {},
      file_ext: {}
    };
    this.description = options.description || '';
    this.user = options.user;
    this.token = options.token;
  }
  Gist.prototype.client = nest.createClient({
    host: 'gist.github.com',
    secure: true
  });
  Gist.prototype.load = function(callback) {
    this.client.get("api/v1/json/" + this.id, {
      response: 'json'
    }, __bind(function(error, response, meta) {
      var data, file, has_error, task, _i, _len, _ref;
      if (error) {
        return callback.call(this, error);
      }
      if (!meta) {
        return callback.call(this, new Error('Could not load gist'));
      }
      meta = meta.gists[0];
      this.private = !meta.public;
      this.comments = meta.comments;
      task = new Task;
      _ref = meta.files;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        task.add(file, [loadGist, this.client, this.id, file]);
      }
      has_error = null;
      data = {};
      return task.run(__bind(function(name, error, content) {
        if (name === null) {
          if (has_error) {
            return callback.call(this, has_error);
          }
          this.data = data;
          return callback.call(this, null, meta);
        }
        if (error) {
          return has_error = error;
        }
        return data[name] = content;
      }, this));
    }, this));
    return this;
  };
  Gist.prototype.addFile = function(filename, content, extension) {
    var i, key;
    if (filename && !extension) {
      extension = path.extname(filename);
    }
    extension || (extension = '.txt');
    i = Object.keys(this.upload.file_name).length + 1;
    key = "gistfile" + i;
    this.upload.file_name[key] = filename || ("file" + i + extension);
    this.upload.file_contents[key] = content;
    this.upload.file_ext[key] = extension;
    return this;
  };
  Gist.prototype.save = function(callback) {
    var body;
    body = {
      description: this.description,
      login: this.user,
      token: this.token
    };
    if (this.private) {
      body.action_button = 'private';
    }
    body.file_name = this.upload.file_name;
    body.file_ext = this.upload.file_ext;
    body.file_contents = this.upload.file_contents;
    this.client.post('gists', {
      body: body
    }, __bind(function(error, response, body) {
      var data, file, filename, id, key, _ref;
      console.log(body);
      id = response.headers.location.split('/').pop() || this.id;
      if (id === 'new' || (this.id && this.id !== id)) {
        error = new Error('Could not save gist.');
        this.id = null;
        return callback.call(this, error);
      }
      this.id = id;
      data = {};
      _ref = this.upload.file_name;
      for (key in _ref) {
        filename = _ref[key];
        data[filename] = {
          extension: this.upload.file_ext[key],
          content: this.upload.file_contents[key]
        };
      }
      this.data = {};
      this.upload.file_name = {};
      this.upload.file_ext = {};
      this.upload.file_contents = {};
      for (filename in data) {
        file = data[filename];
        this.data[filename] = file.content;
        this.upload.file_name[filename] = filename;
        this.upload.file_ext[filename] = file.extension;
        this.upload.file_contents[filename] = file.content;
      }
      if (callback) {
        return callback.call(this);
      }
    }, this));
    return this;
  };
  return Gist;
})();
module.exports = Gist;