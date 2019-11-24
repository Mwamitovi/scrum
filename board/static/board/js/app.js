// board/js/app.js

const app = (function ($) {
  let config = $('#config'),
      app = JSON.parse(config.text())
  
      $(document).ready(function () {
        let router = new app.router();
      });

  return app;
})(jQuery);
