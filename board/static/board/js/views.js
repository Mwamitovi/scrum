// board/js/views.js

(function ($, Backbone, _, app) {
  const TemplateView = Backbone.View.extend({
    templateName: '',
    initialize: function () {
      this.template = _.template($(this.templateName).html())
    },
    render: function () {
      const context = this.getContext()
      const html = this.template(context)

      this.$el.html(html)
    },
    getContext: function () {
      return {}
    }
  })

  const FormView = TemplateView.extend({
    events: {
      'submit form': 'submit'
    },
    errorTemplate: _.template('<span class="error"><%- msg %></span>'),
    clearErrors: function () {
      $('.error', this.form).remove()
    },
    showErrors: function (errors) {
      _.map(errors, function (fieldErrors, name) {
        const field = $(':input[name=' + name + ']', this.form)
        let label = $('label[for=' + field.attr('id') + ']', this.form)

        if (label.length === 0) {
          label = $('label', this.form).first()
        }

        function appendError (msg) {
          label.before(this.errorTemplate({ msg: msg }))
        }

        _.map(fieldErrors, appendError, this)
      }, this)
    },
    serializeForm: function (form) {
      return _.object(_.map(form.serializeArray(), function (item) {
        // convert object to tuple of (name, value)
        return [item.name, item.value]
      }))
    },
    submit: function (e) {
      e.preventDefault()
      this.form = $(e.currentTarget)
      this.clearErrors()
    },
    failure: function (xhr, status, error) {
      const errors = xhr.responseJSON
      this.showErrors(errors)
    },
    modelFailure: function (model, xhr, options) {
      // While $.ajax() failure callback has the response object
      // as the first param,
      // the Model.save has the model instance as the first param
      // and response as the second
      const errors = xhr.responseJSON
      this.showErrors(errors)
    },
    done: function (e) {
      if (e) {
        e.preventDefault()
      }
      this.trigger('done')
      this.remove()
    }
  })

  const HeaderView = TemplateView.extend({
    tagName: 'header',
    templateName: '#header-template',
    events: {
      'click a.logout': 'logout'
    },
    getContext: function () {
      return { authenticated: app.session.authenticated() }
    },
    logout: function (e) {
      e.preventDefault()
      app.session.delete()
      window.location = '/'
    }
  })

  // Should be defined just before the HomepageView
  const NewSprintView = FormView.extend({
    templateName: '#new-sprint-template',
    className: 'new-sprint',
    events: _.extend({
      // Event handler to cancel, calls done()
      'click button.cancel': 'done'
    }, FormView.prototype.events),
    submit: function (e) {
      const self = this
      let attributes = {}
      // form values are serialized,
      // utilize app.sprints.create() instead of $.post(),
      // success and error handlers are binded to this view
      FormView.prototype.submit.apply(this, arguments)
      attributes = this.serializeForm(this.form)
      app.collections.ready.done(function () {
        app.sprints.create(attributes, {
          wait: true,
          success: $.proxy(self.success, self),
          error: $.proxy(self.modelFailure, self)
        })
      })
    },
    success: function (model) {
      // Once a sprint is created,
      // the view calls done(),
      this.done()
      // and redirects to sprint-detail route
      window.location.hash = '#sprint/' + model.get('id')
    }
  })

  const HomepageView = TemplateView.extend({
    templateName: '#home-template',
    events: {
      'click button.add': 'renderAddForm'
    },
    initialize: function (options) {
      // Once view is created,
      // sprints with end-dates greater than seven days ago are fetched
      // and the view is re-rendered to display once available
      const self = this
      TemplateView.prototype.initialize.apply(this, arguments)
      app.collections.ready.done(function () {
        let end = new Date()
        end.setDate(end.getDate() - 7)
        end = end.toISOString().replace(/T.*/g, '')
        app.sprints.fetch({
          data: { end_min: end },
          success: $.proxy(self.render, self)
        })
      })
    },
    getContext: function () {
      // template context now contains the current sprints from app.sprints
      // if app.collections isn't ready, this is a "null" value
      return { sprints: app.sprints || null }
    },
    renderAddForm: function (e) {
      // handles click event for the add-button,
      // creates a NewSprintView instance just above the button
      const view = new NewSprintView()
      const link = $(e.currentTarget)

      e.preventDefault()
      link.before(view.el)
      link.hide()
      view.render()
      view.on('done', function () {
        link.show()
      })
    }
  })

  const SprintView = TemplateView.extend({
    templateName: '#sprint-template',
    initialize: function (options) {
      const self = this

      TemplateView.prototype.initialize.apply(this, arguments)
      this.sprintId = options.sprintId
      this.sprint = null

      app.collections.ready.done(function () {
        // we replace fetch() with getOrFetch(),
        // since it returns a deferred object,
        app.sprint.getOrFetch(self.sprintId)
          // we chain a done() callback for when a sprint is available
          .done(function (sprint) {
            self.sprint = sprint
            self.render()
          })
          // if fetching the model raises an error, fail() callback is fired
          .fail(function (sprint) {
            self.sprint = sprint
            self.sprint.invalid = true
            self.render()
          })
      })
    },
    getContext: function () {
      return { sprint: this.sprint }
    }
  })

  const LoginView = FormView.extend({
    id: 'login',
    templateName: '#login-template',
    submit: function (e) {
      let data = {}

      FormView.prototype.submit.apply(this, arguments)
      data = this.serializeForm(this.form)
      $.post(app.apiLogin, data)
        .done($.proxy(this.loginSuccess, this))
        .fail($.proxy(this.failure, this))
    },
    loginSuccess: function (data) {
      app.session.save(data.token)
      this.done()
    }
  })

  app.views.HeaderView = HeaderView
  app.views.HomepageView = HomepageView
  app.views.SprintView = SprintView
  app.views.LoginView = LoginView
// eslint-disable-next-line
})(jQuery, Backbone, _, app)
