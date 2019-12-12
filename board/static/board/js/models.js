// board/js/models.js

(function ($, Backbone, _, app) {
  // CSRF helper functions taken directly from Django docs
  function csrfSafeMethod (method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/i.test(method))
  }

  function getCookie (name) {
    // This function gets the cookie with a given name
    var cookieValue = null
    if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';')
      for (var i = 0; i < cookies.length; i++) {
        // eslint-disable-next-line
        var cookie = jQuery.trim(cookies[i])
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(
            cookie.substring(name.length + 1))
          break
        }
      }
    }
    return cookieValue
  }

  // Setup jQuery ajax calls to handle CSRF
  $.ajaxPrefilter(function (settings, originalOptions, xhr) {
    let csrftoken
    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
      // Send the token to same-origin, relative URLs only.
      // Send the token only if the method warrants CSRF protection
      // Using the CSRFToken value acquired earlier
      csrftoken = getCookie('csrftoken')
      xhr.setRequestHeader('X-CSRFToken', csrftoken)
    }
  })

  const Session = Backbone.Model.extend({
    defaults: {
      token: null
    },
    initialize: function (options) {
      this.options = options
      $.ajaxPrefilter($.proxy(this._setupAuth, this))
      this.load()
    },
    load: function () {
      // eslint-disable-next-line
      const token = localStorage.apiToken
      if (token) {
        this.set('token', token)
      }
    },
    save: function (token) {
      this.set('token', token)
      if (token === null) {
        // eslint-disable-next-line
        localStorage.removeItem('apiToken')
      } else {
        // eslint-disable-next-line
        localStorage.apiToken = token
      }
    },
    delete: function () {
      this.save(null)
    },
    authenticated: function () {
      return this.get('token') !== null
    },
    _setupAuth: function (settings, originalOptions, xhr) {
      if (this.authenticated()) {
        xhr.setRequestHeader(
          'Authorization',
          'Token ' + this.get('token')
        )
      }
    }
  })

  const BaseModel = Backbone.Model.extend({
    url: function () {
      // override the default URL construction
      // And look for the `self` value from links attribute
      const links = this.get('links')
      let url = links && links.self

      if (!url) {
        // If URL isn't given by the API,
        // we use original Backbone method to construct it
        url = Backbone.Model.prototype.url.call(this)
      }

      return url
    }
  })

  const BaseCollection = Backbone.Collection.extend({
    parse: function (response) {
      // store the next, previous and count metadata on the collection
      // returns the object list, which comes from the API results key
      this._next = response.next
      this._previous = response.previous
      this._count = response.count

      return response.results || []
    },
    getOrFetch: function (id) {
      // returns: deferred "object" which resolves to the model instance
      const result = new $.Deferred()
      // we look for a model matching the given ID,
      // in the current in-memory list of models in the collection
      let model = this.get(id)

      if (!model) {
        model = this.push({ id: id })
        // if the model wasn't in the collection,
        // it is fetched from the API
        model.fetch({
          success: function (model, response, options) {
            result.resolve(model)
          },
          error: function (model, response, options) {
            result.reject(model, response)
          }
        })
      } else {
        // if the model is found in the collection,
        // the deferred object is immediately resolved with the result
        result.resolve(model)
      }

      return result
    }
  })

  app.models.Sprint = BaseModel.extend({})
  app.models.Task = BaseModel.extend({})
  app.models.User = BaseModel.extend({
    idAttributemodel: 'username'
  })

  app.collections.ready = $.getJSON(app.apiRoot)

  app.collections.ready.done(function (data) {
    app.collections.Sprints = BaseCollection.extend({
      model: app.models.Sprint,
      url: data.sprints
    })
    app.sprints = new app.collections.Sprints()

    app.collections.Tasks = BaseCollection.extend({
      model: app.models.Task,
      url: data.tasks
    })
    app.tasks = new app.collections.Tasks()

    app.collections.Users = BaseCollection.extend({
      model: app.models.User,
      url: data.Users
    })
    app.users = new app.collections.Users()
  })

  app.session = new Session()
// eslint-disable-next-line
})(jQuery, Backbone, _, app)
