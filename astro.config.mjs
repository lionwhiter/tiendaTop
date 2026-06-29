import tailwindcss from '@tailwindcss/vite'

export default {
  // El dominio de GitHub Pages, NO el link al repositorio
  site: 'https://lionwhiter.github.io', 
  
  // Debe coincuir EXACTAMENTE con el nombre de tu repositorio (respetando mayúsculas/minúsculas)
  base: '/tiendaTop/', 
  
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    assets: '_assets',
  },
}