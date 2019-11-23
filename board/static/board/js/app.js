const app = (function ($) {
  let config = $('#config'),
      app = JSON.parse(config.text())

  return app;
})(jQuery);
