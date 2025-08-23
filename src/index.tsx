import { Hono } from 'hono'
import { renderer } from './renderer'

const app = new Hono()

app.use(renderer)

// Página principal - redirige al dashboard
app.get('/', (c) => {
  return c.redirect('/dashboard')
})

// Dashboard principal
app.get('/dashboard', (c) => {
  return c.render(
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <h1 class="text-xl font-bold text-indigo-600">💰 Efectivo Fácil</h1>
              </div>
            </div>
            <nav class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <a href="/dashboard" class="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                <a href="/perfil" class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Perfil</a>
                <a href="/transacciones" class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Transacciones</a>
                <a href="/configuracion" class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Configuración</a>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div class="px-4 py-6 sm:px-0">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Cash-out para talleres textiles
            </h2>
            <p class="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Convierte tu inventario textil en efectivo de manera rápida y segura
            </p>
          </div>

          {/* Stats Cards */}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <span class="text-2xl">📊</span>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Inventario Total</dt>
                      <dd class="text-lg font-medium text-gray-900">$125,450</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <span class="text-2xl">💵</span>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Cash-out Disponible</dt>
                      <dd class="text-lg font-medium text-gray-900">$89,250</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <span class="text-2xl">🎯</span>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Transacciones Mes</dt>
                      <dd class="text-lg font-medium text-gray-900">24</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div class="bg-white shadow rounded-lg p-6 mb-8">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button class="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors">
                🚀 Solicitar Cash-out
              </button>
              <button class="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors">
                📦 Agregar Inventario
              </button>
              <button class="bg-yellow-600 text-white px-4 py-2 rounded-md font-medium hover:bg-yellow-700 transition-colors">
                📈 Ver Reportes
              </button>
              <button class="bg-purple-600 text-white px-4 py-2 rounded-md font-medium hover:bg-purple-700 transition-colors">
                ⚙️ Configurar Cuenta
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Transacciones Recientes</h3>
            <div class="flow-root">
              <ul class="-my-5 divide-y divide-gray-200">
                <li class="py-4">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <span class="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                        <span class="text-sm font-medium text-green-800">✓</span>
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">Cash-out Completado</p>
                      <p class="text-sm text-gray-500">Lote #CO-2024-001 • $15,750</p>
                    </div>
                    <div class="text-sm text-gray-500">Hace 2 horas</div>
                  </div>
                </li>
                <li class="py-4">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <span class="inline-flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100">
                        <span class="text-sm font-medium text-yellow-800">⏳</span>
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">Evaluación en Proceso</p>
                      <p class="text-sm text-gray-500">Lote #CO-2024-002 • $23,400</p>
                    </div>
                    <div class="text-sm text-gray-500">Hace 1 día</div>
                  </div>
                </li>
                <li class="py-4">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <span class="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                        <span class="text-sm font-medium text-blue-800">📦</span>
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">Inventario Agregado</p>
                      <p class="text-sm text-gray-500">150 piezas deportivas • $18,900</p>
                    </div>
                    <div class="text-sm text-gray-500">Hace 3 días</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

// Página de perfil
app.get('/perfil', (c) => {
  return c.render(
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <h1 class="text-xl font-bold text-indigo-600">💰 Efectivo Fácil</h1>
              </div>
            </div>
            <nav class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <a href="/dashboard" class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                <a href="/perfil" class="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium">Perfil</a>
                <a href="/transacciones" class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Transacciones</a>
                <a href="/configuracion" class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Configuración</a>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="mb-8">
            <h2 class="text-3xl font-bold text-gray-900">Perfil del Taller</h2>
            <p class="mt-2 text-gray-600">Gestiona la información de tu taller textil y configuraciones de cuenta</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div class="lg:col-span-2">
              <div class="bg-white shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Información del Taller</h3>
                  
                  <form class="space-y-6">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Nombre del Taller</label>
                        <input type="text" value="Textiles George S.A." class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"/>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700">RFC/NIT</label>
                        <input type="text" value="TGS240815ABC" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"/>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Dirección</label>
                      <input type="text" value="Av. Industrial 123, Zona Textil" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"/>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Ciudad</label>
                        <input type="text" value="Ciudad de México" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"/>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Código Postal</label>
                        <input type="text" value="03100" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"/>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Teléfono</label>
                      <input type="tel" value="+52 55 1234-5678" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"/>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Email</label>
                      <input type="email" value="george@textiles.mx" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"/>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Especialidad Textil</label>
                      <select class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border">
                        <option>Ropa Deportiva Femenina</option>
                        <option>Ropa Casual</option>
                        <option>Ropa Formal</option>
                        <option>Uniformes</option>
                        <option>Accesorios Textiles</option>
                        <option>Otro</option>
                      </select>
                    </div>

                    <div class="flex justify-end">
                      <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors">
                        Guardar Cambios
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div class="space-y-6">
              {/* Profile Photo */}
              <div class="bg-white shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Foto del Taller</h3>
                  <div class="text-center">
                    <div class="mx-auto h-32 w-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span class="text-4xl">🏭</span>
                    </div>
                    <div class="mt-4">
                      <button class="bg-white text-indigo-600 border border-indigo-600 px-4 py-2 rounded-md font-medium hover:bg-indigo-50 transition-colors">
                        Cambiar Foto
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div class="bg-white shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Estado de la Cuenta</h3>
                  <div class="space-y-3">
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600">Verificación</span>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Verificado
                      </span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600">Límite Cash-out</span>
                      <span class="text-sm font-medium text-gray-900">$100,000</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600">Comisión</span>
                      <span class="text-sm font-medium text-gray-900">3.5%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div class="bg-white shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Estadísticas</h3>
                  <div class="space-y-3">
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600">Miembro desde</span>
                      <span class="text-sm font-medium text-gray-900">Ene 2024</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600">Total Cash-outs</span>
                      <span class="text-sm font-medium text-gray-900">47</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600">Valor Total</span>
                      <span class="text-sm font-medium text-gray-900">$890,450</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

// Páginas adicionales (temporales)
app.get('/transacciones', (c) => {
  return c.render(
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">📊 Transacciones</h1>
        <p class="text-gray-600 mb-6">Esta sección está en desarrollo</p>
        <a href="/dashboard" class="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors">
          Volver al Dashboard
        </a>
      </div>
    </div>
  )
})

app.get('/configuracion', (c) => {
  return c.render(
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">⚙️ Configuración</h1>
        <p class="text-gray-600 mb-6">Esta sección está en desarrollo</p>
        <a href="/dashboard" class="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors">
          Volver al Dashboard
        </a>
      </div>
    </div>
  )
})

export default app