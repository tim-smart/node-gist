Gist = require '../'

#testLoad = (id) ->
gist = new Gist
  id:    '8ff9209f495c2cc9cacb'
  user:  'Tim-Smart'
  token: '1ea2c37e8d532a9ceb06bb3c8fd4912f'

gist.load (error, meta) ->
  console.log meta
  console.log this

#gist = new Gist
  #user:   'Tim-Smart'
  #token:  '1ea2c37e8d532a9ceb06bb3c8fd4912f'
  #private: yes

#gist.addFile 'test', 'testing 123'

#gist.save (error) ->
  #console.log 'Saved.'
  #console.log @
  #testLoad(@id)
