// board/js/app.js

// eslint-disable-next-line
const app = (function ($) {
  const config = $('#config')
  const app = JSON.parse(config.text())

  $(document).ready(function () {
    // eslint-disable-next-line
    const router = new app.router()
  })

  return app
// eslint-disable-next-line
})(jQuery)
