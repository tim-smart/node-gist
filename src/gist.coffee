# Node API for Gist
# =================
#
# Constructor to use to communicate with, and manipulate gists on
# gist.github.com
path = require 'path'
nest = require 'nest'
Task = require('parallel').Task

# Helper method to load gist content in parallel.
loadGist = (c, id, file, callback) ->
  c.get "raw/#{id}/#{file}", (error, response, data) ->
    return callback error if error
    callback null, data

# ## Gist Class
class Gist
  constructor: (options) ->
    options or= {}

    @id      = options.id      or null
    @private = options.private or no

    @data   = null
    @upload =
      file_name:     {}
      file_contents: {}
      file_ext:      {}

    @description = options.description or ''
    @user        = options.user
    @token       = options.token

  # We use a `nest` client to communicate with the Gist API
  client: nest.createClient
    host:   'gist.github.com'
    secure: yes

  # Load a gist from an existing id.
  load: (callback) ->
    @client.get "api/v1/json/#{@id}",
      response: 'json'
    , (error, response, meta) =>
      return callback.call this, error                           if error
      return callback.call this, new Error 'Could not load gist' unless meta

      meta      = meta.gists[0]
      @private  = not meta.public
      @comments = meta.comments
      task      = new Task

      for file in meta.files
        task.add file, [
          loadGist
          @client
          @id
          file
        ]

      has_error = null
      data      = {}

      task.run (name, error, content) =>
        if name is null
          return callback.call this, has_error if has_error
          @data = data
          return callback.call this, null, meta

        return has_error = error if error

        data[name] = content

    this

  # Add a file to the gist.
  addFile: (filename, content, extension) ->
    extension   = path.extname filename if filename and not extension
    extension or= '.txt'
    i           = Object.keys(@upload.file_name).length + 1
    key         = "gistfile#{i}"

    @upload.file_name[key]     = filename or "file#{i}#{extension}"
    @upload.file_contents[key] = content
    @upload.file_ext[key]      = extension

    this

  # We either create the gist and get it's id, or update an already
  # created gist. If we create the gist, we then assign the id and
  # put the Gist instance into modify mode.
  #
  # **TODO**: Update support.
  save: (callback) ->
    body =
      description: @description
      login:       @user
      token:       @token

    body.action_button = 'private' if @private

    body.file_name     = @upload.file_name
    body.file_ext      = @upload.file_ext
    body.file_contents = @upload.file_contents

    @client.post 'gists',
      body: body
    , (error, response, body) =>
      id = response.headers.location.split('/').pop() or @id

      if id is 'new' or (@id and @id isnt id)
        error = new Error 'Could not save gist.'
        @id   = null
        return callback.call this, error

      @id  = id
      data = {}

      for key, filename of @upload.file_name
        data[filename] =
          extension: @upload.file_ext[key]
          content:   @upload.file_contents[key]

      @data = {}
      @upload.file_name     = {}
      @upload.file_ext      = {}
      @upload.file_contents = {}

      for filename, file of data
        @data[filename]                 = file.content
        @upload.file_name[filename]     = filename
        @upload.file_ext[filename]      = file.extension
        @upload.file_contents[filename] = file.content

      callback.call this if callback

    this

# Export the Gist class
module.exports = Gist
