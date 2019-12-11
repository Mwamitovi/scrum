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

  app.session = new Session()
// eslint-disable-next-line
})(jQuery, Backbone, _, app)
