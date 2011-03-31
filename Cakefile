fs       = require 'fs'
{ exec } = require 'child_process'

run = (command, cb) ->
  child = exec command, cb
  child.stdout.on 'data', (data) -> process.stdout.write data
  child.stderr.on 'data', (data) -> process.stderr.write data

task 'build', 'Create the ecmascript', ->
  invoke 'docs'

  run 'coffee -cb -o lib src/gist.coffee'
  run 'coffee -cb -o test src/test/*.coffee'

task 'docs', 'Use docco to create HTML docs', ->
  run 'docco src/*.coffee'
