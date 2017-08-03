const ENGINE = {
  config: {
   paths: {
      doc: 'Paths required by ES6 templates',
      format: Object,
      default: {
        helpers: 'workspace/utils/helpers'
      }
    }
  },
  extensions: ['.js'],
  handle: 'es6'
}

module.exports = () => {
  const fs = require('fs')
  const path = require('path')
  const helpers = require(path.join(__dirname, 'lib/helpers'))

  const debug = require('debug')('web:templates:es6')

  const es6 = require('es6-template-strings')
  const compile = require('es6-template-strings/compile')
  const resolve = require('es6-template-strings/resolve-to-string')

  const EngineES6 = function (options) {
    debug('Starting ES6 templates engine...')

    this.additionalTemplates = options.additionalTemplates
    this.config = options.config
    this.helpers = options.helpers
    this.pagesPath = options.pagesPath
    this.templates = {}

    // https://stackoverflow.com/a/37217166
  }

  /**
    * Returns the engine core module.
    *
    * @return {function} The engine core module.
    */
  EngineES6.prototype.getCore = function () {
    return es6
  }

  /**
    * Returns information about the engine.
    *
    * @return {object} An object containing the engine name and version.
    */
  EngineES6.prototype.getInfo = function () {
    return {
      engine: ENGINE.handle
    }
  }

  /**
    * Requires all JS files within a directory.
    *
    * @param {string} directory The full path to the directory.
    */
  EngineES6.prototype._requireDirectory = function (directory) {
    return helpers
      .readDirectory(directory, {
        extensions: ['.js'],
        recursive: true
      })
      .then(files => {
        files.forEach(file => {
          require(path.resolve(file))
        })

        return files
      })
  }

  /**
  * Loads any additional templates.
  *
  * @return {Promise} The names of the partials loaded.
  */
  EngineES6.prototype._loadPartials = function () {
    return helpers.readFiles(this.additionalTemplates, {
      callback: file => {
        return new Promise((resolve, reject) => {
          fs.readFile(file, 'utf8', (err, data) => {
            if (err) return reject(err)

            const extension = path.extname(file)
            const templateName = path.relative(this.pagesPath, file)
              .slice(0, -extension.length).replace('/', '_');

            this.register(templateName, data)

            resolve(templateName)
          })
        })
      }
    })
  }

  /**
    * Initialises the engine.
    *
    * @return {Promise} A Promise that resolves when the engine is fully loaded.
    */
  EngineES6.prototype.initialise = function () {
    const paths = this.config.get('engines.es6.paths')

    const helpersPath = path.resolve(paths.helpers)

    return this._requireDirectory(helpersPath)
      .then(helpers => {
        debug('helpers loaded %o', helpers)

        return this._loadPartials()
      })
      .then(partials => {
        debug('partials loaded %o', partials)
      })

    debug('ES6 templates initialised')
  }

  /**
    * Registers the template with markup.
    *
    * @return {Promise} A Promise that resolves with the loaded data.
    */
  EngineES6.prototype.register = function (name, data, path) {
    this.templates[name] = compile(data)
  }

  /**
    * Renders a template.
    *
    * @param {string} name The name of the template.
    * @param {string} data The template content.
    * @param {object} locals The variables to add to the context.
    * @param {object} options Additional render options.
    *
    * @return {Promise} A Promise that resolves with the render result.
    */
  EngineES6.prototype.render = function (name, data, locals, options) {
    // Look for and resolve partials
    Object.keys(this.templates).forEach(i => {
      locals[i] = resolve(this.templates[i], locals)
    })

    return Promise.resolve(resolve(this.templates[name], locals))
  }

  return EngineES6
}

module.exports.metadata = ENGINE
