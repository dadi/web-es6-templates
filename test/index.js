const fs = require('fs')
const htmlLooksLike = require('html-looks-like')
const path = require('path')
const should = require('should')
const helpers = require(path.join(__dirname, '/helpers'))

let engine
let factory

const PATHS = {
  engine: path.join(__dirname, '/../index'),
  workspace: path.join(__dirname, '/workspace')
}

describe('Dust.js interface', function () {
  // Get a fresh instance of the engine
  beforeEach(done => {
    factory = require(PATHS.engine)

    engine = {
      extensions: factory.metadata.extensions,
      handle: factory.metadata.handle,
      factory: factory,
      started: false
    }

    done()
  })

  // Get rid of the current instance of the engine
  afterEach(done => {
    delete require.cache[PATHS.engine]

    done()
  })

  it('should contain a metadata block with handle and extensions', done => {
    factory.metadata.should.be.Object
    factory.metadata.handle.should.be.String
    factory.metadata.extensions.should.be.Array

    done()
  })
})
