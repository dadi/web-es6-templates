const fs = require('fs')
const htmlLooksLike = require('html-looks-like')
const path = require('path')
const should = require('should')
const helpers = require(path.join(__dirname, '/helpers'))

let config = require(path.join(__dirname, '/helpers/config'))
let engine
let factory

const PATHS = {
  engine: path.join(__dirname, '/../index'),
  workspace: path.join(__dirname, '/workspace')
}

describe('ES6 template literals interface', function () {
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

  it('should declare .js as a supported extension', done => {
    factory.metadata.extensions.indexOf('.js').should.not.equal(-1)

    done()
  })

  it('should load pages', done => {
    const Engine = factory()
    const instance = new Engine({
      config: config,
      pagesPath: path.join(helpers.paths.workspace, 'pages')
    })

    instance.initialise().then(() => {
      return instance.register('products', helpers.pages.products)
    }).then(() => {
      const core = instance.getCore()

      console.log(core)
      //const type = typeof core.cache.products

     // type.should.eql('function')

      done()
    })
  })

})
