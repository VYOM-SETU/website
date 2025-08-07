// postcss.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),   // ← updated
    require('autoprefixer'),
    // any other PostCSS plugins you use…
  ]
}
