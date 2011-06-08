var test   = require('microtest').module('index.js')
  , assert = require('assert')
  , fs     = require('fs')

test.requires('nest', [{ class: 'Client' }])

test.context.Buffer = test.function('buffer')

var EXPORTS     = test.compile()
  , CONFIG      = test.object('config')
  , CLIENT      = test.object('client')
  , CREATE_JSON = fs.readFileSync('test/fixture/create.json', 'utf8')
  , CREATE_OBJ  = JSON.parse(CREATE_JSON)

test.required.Client.call = test.function('call')

test.describe('new Client no user/token', function () {
  var clientCallCall, args

  assert.equal
    ( EXPORTS.Client.prototype.__proto__
    , test.required.Client.prototype
    )

  clientCallCall = test.expect(test.required.Client.call, 1, null)

  CLIENT = new EXPORTS.Client(CONFIG)

  args = clientCallCall.getLastArgs()
  assert.equal(2, args.length)
  assert.equal(CLIENT, args[0])
  assert.deepEqual
    ( { host:     'api.github.com'
      , secure:    true
      , response: 'json'
      , type:     'json'
      , path:     '/gists'
      , headers:   {}
      }
    , args[1]
    )
})

test.describe('new Client basic auth', function () {
  var clientCallCall, args, auth_string
    , BUFFER = test.object('buffer')

  assert.equal
    ( EXPORTS.Client.prototype.__proto__
    , test.required.Client.prototype
    )

  CONFIG.user     = 'USER'
  CONFIG.password = 'PASSWORD'

  test.expect('new', test.context.Buffer, 1, ['USER:PASSWORD'], BUFFER)
  test.expect(BUFFER, 'toString', 1, ['base64'], 'BASE64STRING')

  clientCallCall = test.expect(test.required.Client.call, 1, null)

  CLIENT = new EXPORTS.Client(CONFIG)

  args = clientCallCall.getLastArgs()
  assert.equal(2, args.length)
  assert.equal(CLIENT, args[0])
  assert.deepEqual
    ( { host:     'api.github.com'
      , secure:    true
      , response: 'json'
      , type:     'json'
      , path:     '/gists'
      , headers:
        { Authorization: 'Basic BASE64STRING'
        }
      }
    , args[1]
    )
})

test.describe('new Client', function () {
  var clientCallCall, args, auth_string
    , BUFFER = test.object('buffer')

  assert.equal
    ( EXPORTS.Client.prototype.__proto__
    , test.required.Client.prototype
    )

  CONFIG.token = 'TOKEN'

  clientCallCall = test.expect(test.required.Client.call, 1, null)

  CLIENT = new EXPORTS.Client(CONFIG)

  args = clientCallCall.getLastArgs()
  assert.equal(2, args.length)
  assert.equal(CLIENT, args[0])
  assert.deepEqual
    ( { host:     'api.github.com'
      , secure:    true
      , response: 'json'
      , type:     'json'
      , path:     '/gists'
      , headers:
        { Authorization: 'token TOKEN'
        }
      }
    , args[1]
    )
})

test.describe('Client#_request', function () {
  var METHOD   = test.object('method')
    , PATH     = test.object('path')
    , BODY     = test.object('body')
    , CB       = test.function('cb')
    , ERROR    = test.object('error')
    , RESPONSE = test.object('response')
    , DATA     = test.object('data')
    , _requestCall, args

  _requestCall = test.expect(test.required.Client.prototype, '_request', 1)

  CLIENT._request(METHOD, PATH, BODY, CB)

  args = _requestCall.getLastArgs()
  assert.equal(4, args.length)
  assert.equal(METHOD, args[0])
  assert.equal(PATH, args[1])
  assert.deepEqual
    ( { body: BODY
      }
    , args[2]
    )

  _requestCallback = args[3]

  test.expect(CB, 1, [ERROR, DATA])

  _requestCallback(ERROR, RESPONSE, DATA)
})
