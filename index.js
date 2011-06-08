// The MIT License
// 
// Copyright (c) 2011 Tim Smart
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var nest = require('nest')

var Client = exports.Client = function Client (options) {
  var client_options =
    { host:     'api.github.com'
    , secure:    true
    , response: 'json'
    , type:     'json'
    , path:     '/gists'
    , headers:   {}
    }

  options || (options = {})

  if (options.token) {
    client_options.headers.Authorization = 'token ' + options.token
  } else if (options.user && options.password) {
    client_options.headers.Authorization =
      'Basic ' + new Buffer(options.user + ':' + options.password).toString('base64')
  }

  nest.Client.call(this, client_options)
}

Client.prototype.__proto__ = nest.Client.prototype

Client.prototype._request = function (method, path, body, callback) {
  var options = null

  if (body) {
    options = { body: body }
  }

  return nest.Client.prototype._request.call
    ( this, method, path, options
    , function (error, response, data) {
        callback(error, data)
      }
    )
}
