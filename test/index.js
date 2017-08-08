'use strict'

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

  it('should render pages containing includes with locals', done => {
    const Engine = factory()
    const instance = new Engine({
      additionalTemplates: Object.keys(helpers.additionalTemplates).map(name => helpers.additionalTemplates[name]),
      config: config,
      pagesPath: path.join(helpers.paths.workspace, 'pages')
    })

    const locals = {
      products: [
        {
          name: 'Super Thing 3000',
          price: 5000
        },
        {
          name: 'Mega Thang XL',
          price: 8000
        }
      ]
    }

    const expected = `
      <header>My online store</header>
      <h1>Products:</h1>
      <ul>
        ${locals.products.map(product => {
          return `<li>${product.name} - £${product.price}</li>`
        }).join('\n')}
      </ul>
      <footer>Made by DADI</footer>
    `

    Promise.resolve(instance.initialise()).then(() => {
      return instance.register('products', helpers.pages.products)
    }).then(() => {
      return instance.render('products', helpers.pages.products, locals)
    }).then(output => {
      htmlLooksLike(output, expected)

      done()
    })
  })

  it('should have access to custom helpers', done => {
    const Engine = factory()
    const instance = new Engine({
      additionalTemplates: [],
      config: config,
      pagesPath: path.join(helpers.paths.workspace, 'pages')
    })

    const pageContent = '<p>${trim("   space jam        ")}</p>'
    const expected = '<p>space jam</p>'

    instance.initialise().then(() => {
      return instance.register('testHelpers', pageContent)
    }).then(() => {
      return instance.render('testHelpers', pageContent, {})
    }).then(output => {
      htmlLooksLike(output, expected)

      done()
    })
  })
})
