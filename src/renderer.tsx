import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Efectivo Fácil - Cash-out para talleres textiles</title>
        <meta name="description" content="Convierte tu inventario textil en efectivo de manera rápida y segura. Plataforma especializada en cash-out para talleres textiles." />
        
        {/* PWA Meta tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Efectivo Fácil" />
        
        {/* Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Styles */}
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body class="antialiased">
        {children}
        <script src="/static/app.js"></script>
      </body>
    </html>
  )
})
