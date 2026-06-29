import tailwindcss from '@tailwindcss/vite'

export default {
  site: 'https://tutienda-ssg.github.io',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    assets: '_assets',
  },
}
