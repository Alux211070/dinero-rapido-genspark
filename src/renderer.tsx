import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Efectivo Fácil - Cash-out para talleres textiles</title>
        <meta name="description" content="Convierte tu inventario textil en efectivo de manera rápida y segura. Plataforma especializada en cash-out para talleres textiles." />
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body class="antialiased">{children}</body>
    </html>
  )
})
