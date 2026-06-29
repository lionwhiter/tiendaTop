import tailwindcss from '@tailwindcss/vite'

export default {
  site: 'https://tiendaTop.github.io',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    assets: '_assets',
  },
}
