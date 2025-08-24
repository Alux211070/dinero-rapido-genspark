import { Hono } from 'hono'
import { renderer } from './renderer'
import { obtenerEstadisticasTaller, obtenerTransaccionesRecientes, obtenerTaller, actualizarComisionTaller, crearTransaccionCashout } from './database'
import { tiempoRelativo, formatearEstado, formatearMoneda, tipoTransaccion } from './utils'
import type { CloudflareBindings } from './types'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use(renderer)

// Página principal - redirige al dashboard
app.get('/', (c) => {
  return c.redirect('/dashboard')
})

// Dashboard principal
app.get('/dashboard', async (c) => {
  const db = c.env?.DB
  const tallerId = 1 // Por ahora usamos taller fijo, después implementaremos auth
  
  let estadisticas
  let transaccionesRecientes
  
  if (db) {
    try {
      estadisticas = await obtenerEstadisticasTaller(db, tallerId)
      transaccionesRecientes = await obtenerTransaccionesRecientes(db, tallerId, 3)
    } catch (error) {
      console.error('Error accediendo a DB:', error)
    }
  }
  
  // Fallback data si no hay DB
  if (!estadisticas) {
    estadisticas = {
      inventario_total: 125450,
      cashout_disponible: 89250,
      transacciones_mes: 24,
      total_cashouts: 47,
      valor_total_retirado: 890450,
      comision_actual: 3.5,
      limite_actual: 100000
    }
  }
  
  if (!transaccionesRecientes) {
    transaccionesRecientes = [
      {
        id: 1, taller_id: 1, lote_numero: 'CO-2024-001', valor_inventario: 15750,
        comision_aplicada: 3.5, monto_comision: 551.25, monto_neto: 15198.75,
        estado: 'completado' as const, fecha_solicitud: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        created_at: '', updated_at: ''
      },
      {
        id: 2, taller_id: 1, lote_numero: 'CO-2024-002', valor_inventario: 23400,
        comision_aplicada: 3.5, monto_comision: 819, monto_neto: 22581,
        estado: 'evaluacion' as const, fecha_solicitud: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        created_at: '', updated_at: ''
      }
    ]
  }
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
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <span class="text-2xl">📊</span>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Inventario Total</dt>
                      <dd class="text-lg font-medium text-gray-900">${estadisticas.inventario_total.toLocaleString()}</dd>
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
                      <dd class="text-lg font-medium text-gray-900">${estadisticas.cashout_disponible.toLocaleString()}</dd>
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
                      <dd class="text-lg font-medium text-gray-900">{estadisticas.transacciones_mes}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <span class="text-2xl">💳</span>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Tu Comisión</dt>
                      <dd class="text-lg font-medium text-green-600">{estadisticas.comision_actual}%</dd>
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
                {transaccionesRecientes.map((transaccion) => {
                  const estado = formatearEstado(transaccion.estado)
                  const tipo = tipoTransaccion(transaccion.lote_numero)
                  const tiempo = tiempoRelativo(transaccion.fecha_solicitud)
                  
                  return (
                    <li key={transaccion.id} class="py-4">
                      <div class="flex items-center space-x-4">
                        <div class="flex-shrink-0">
                          <span class={`inline-flex items-center justify-center h-8 w-8 rounded-full bg-${estado.color}-100`}>
                            <span class={`text-sm font-medium text-${estado.color}-800`}>{estado.icono}</span>
                          </span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-gray-900 truncate">
                            {tipo.tipo} {estado.texto}
                          </p>
                          <p class="text-sm text-gray-500">
                            Lote #{transaccion.lote_numero} • {formatearMoneda(transaccion.valor_inventario)}
                            {transaccion.estado === 'completado' && transaccion.comision_aplicada > 0 && 
                              ` • Comisión: ${transaccion.comision_aplicada}%`}
                          </p>
                        </div>
                        <div class="text-sm text-gray-500">{tiempo}</div>
                      </div>
                    </li>
                  )
                })}
                
                {transaccionesRecientes.length === 0 && (
                  <li class="py-8 text-center text-gray-500">
                    No hay transacciones recientes
                  </li>
                )}
              </ul>
            </div>
            
            <div class="mt-4 text-center">
              <a href="/transacciones" class="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                Ver todas las transacciones →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

// Página de perfil
app.get('/perfil', async (c) => {
  const db = c.env?.DB
  const tallerId = 1 // Por ahora usamos taller fijo
  
  let taller = null
  let estadisticas = null
  
  if (db) {
    try {
      taller = await obtenerTaller(db, tallerId)
      estadisticas = await obtenerEstadisticasTaller(db, tallerId)
    } catch (error) {
      console.error('Error accediendo a DB:', error)
    }
  }
  
  // Datos de fallback
  if (!taller) {
    taller = {
      id: 1,
      nombre: 'Textiles George S.A.',
      rfc_nit: 'TGS240815ABC',
      email: 'george@textiles.mx',
      telefono: '+52 55 1234-5678',
      direccion: 'Av. Industrial 123, Zona Textil',
      ciudad: 'Ciudad de México',
      codigo_postal: '03100',
      especialidad_textil: 'Ropa Deportiva Femenina',
      comision_personalizada: 2.5,
      limite_cashout: 250000,
      verificado: true,
      created_at: '2024-01-15T00:00:00.000Z',
      updated_at: new Date().toISOString()
    }
  }
  
  if (!estadisticas) {
    estadisticas = {
      inventario_total: 125450,
      cashout_disponible: 89250,
      transacciones_mes: 24,
      total_cashouts: 47,
      valor_total_retirado: 890450,
      comision_actual: taller.comision_personalizada,
      limite_actual: taller.limite_cashout
    }
  }
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
                        <input type="text" value={taller.nombre} class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"/>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700">RFC/NIT</label>
                        <input type="text" value={taller.rfc_nit} class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"/>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Dirección</label>
                      <input type="text" value={taller.direccion} class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"/>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Ciudad</label>
                        <input type="text" value={taller.ciudad} class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"/>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Código Postal</label>
                        <input type="text" value={taller.codigo_postal} class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"/>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Teléfono</label>
                      <input type="tel" value={taller.telefono} class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"/>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Email</label>
                      <input type="email" value={taller.email} class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"/>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Especialidad Textil</label>
                      <select class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border">
                        <option selected={taller.especialidad_textil === 'Ropa Deportiva Femenina'}>Ropa Deportiva Femenina</option>
                        <option selected={taller.especialidad_textil === 'Ropa Casual'}>Ropa Casual</option>
                        <option selected={taller.especialidad_textil === 'Ropa Formal'}>Ropa Formal</option>
                        <option selected={taller.especialidad_textil === 'Uniformes'}>Uniformes</option>
                        <option selected={taller.especialidad_textil === 'Accesorios Textiles'}>Accesorios Textiles</option>
                        <option selected={taller.especialidad_textil === 'Otro'}>Otro</option>
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
                      <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        taller.verificado 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {taller.verificado ? '✓ Verificado' : '⏳ Pendiente'}
                      </span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600">Límite Cash-out</span>
                      <span class="text-sm font-medium text-gray-900">{formatearMoneda(estadisticas.limite_actual)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600">Tu Comisión</span>
                      <span class="text-sm font-medium text-green-600">{estadisticas.comision_actual}%</span>
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
                      <span class="text-sm font-medium text-gray-900">
                        {new Date(taller.created_at).toLocaleDateString('es-MX', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600">Total Cash-outs</span>
                      <span class="text-sm font-medium text-gray-900">{estadisticas.total_cashouts}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600">Valor Total Retirado</span>
                      <span class="text-sm font-medium text-gray-900">{formatearMoneda(estadisticas.valor_total_retirado)}</span>
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

// API para actualizar comisión personalizada
app.post('/api/actualizar-comision', async (c) => {
  const db = c.env?.DB
  if (!db) {
    return c.json({ error: 'Base de datos no disponible' }, 500)
  }

  try {
    const { tallerId, comision, limite } = await c.req.json()
    
    if (!tallerId || comision < 0 || comision > 20) {
      return c.json({ error: 'Datos inválidos' }, 400)
    }

    const resultado = await actualizarComisionTaller(db, tallerId, comision, limite)
    
    if (resultado) {
      return c.json({ 
        success: true, 
        message: `Comisión actualizada a ${comision}%`,
        nueva_comision: comision,
        nuevo_limite: limite 
      })
    } else {
      return c.json({ error: 'No se pudo actualizar la comisión' }, 500)
    }
  } catch (error) {
    console.error('Error actualizando comisión:', error)
    return c.json({ error: 'Error interno del servidor' }, 500)
  }
})

// API para crear transacción de cash-out
app.post('/api/solicitar-cashout', async (c) => {
  const db = c.env?.DB
  if (!db) {
    return c.json({ error: 'Base de datos no disponible' }, 500)
  }

  try {
    const { tallerId, valorInventario, descripcion } = await c.req.json()
    
    if (!tallerId || !valorInventario || valorInventario <= 0) {
      return c.json({ error: 'Datos inválidos' }, 400)
    }

    const transaccion = await crearTransaccionCashout(db, tallerId, valorInventario, descripcion)
    
    if (transaccion) {
      return c.json({ 
        success: true, 
        message: 'Solicitud de cash-out creada exitosamente',
        transaccion 
      })
    } else {
      return c.json({ error: 'No se pudo crear la transacción' }, 500)
    }
  } catch (error) {
    console.error('Error creando cash-out:', error)
    return c.json({ error: 'Error interno del servidor' }, 500)
  }
})

app.get('/configuracion', (c) => {
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
                <a href="/perfil" class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Perfil</a>
                <a href="/transacciones" class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Transacciones</a>
                <a href="/configuracion" class="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium">Configuración</a>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="mb-8">
            <h2 class="text-3xl font-bold text-gray-900">Configuración de Comisiones</h2>
            <p class="mt-2 text-gray-600">Ajusta las comisiones y límites personalizados por taller</p>
          </div>

          {/* Formulario de solicitud de cash-out */}
          <div class="bg-white shadow rounded-lg mb-8">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">🚀 Solicitar Cash-out</h3>
              
              <form id="cashout-form" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Valor del Inventario ($)</label>
                  <input 
                    type="number" 
                    id="valor-inventario"
                    min="100" 
                    step="0.01" 
                    placeholder="Ejemplo: 25000.00"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Descripción (opcional)</label>
                  <textarea 
                    id="descripcion"
                    rows="3" 
                    placeholder="Describe el inventario que quieres convertir en cash-out..."
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                  ></textarea>
                </div>
                <div class="flex justify-end">
                  <button 
                    type="submit" 
                    class="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Solicitar Cash-out
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Información actual */}
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">📊 Tu Configuración Actual</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="font-medium text-gray-900 mb-2">Comisión Personalizada</h4>
                  <div class="text-2xl font-bold text-green-600" id="comision-actual">2.5%</div>
                  <p class="text-sm text-gray-500">Menor que el estándar (3.5%)</p>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="font-medium text-gray-900 mb-2">Límite de Cash-out</h4>
                  <div class="text-2xl font-bold text-indigo-600" id="limite-actual">$250,000</div>
                  <p class="text-sm text-gray-500">Mayor que el estándar ($100K)</p>
                </div>
              </div>

              <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 class="font-medium text-blue-900 mb-2">💡 Beneficios de tu cuenta</h4>
                <ul class="text-sm text-blue-700 space-y-1">
                  <li>✓ Comisión reducida por volumen alto</li>
                  <li>✓ Límite extendido para transacciones grandes</li>
                  <li>✓ Procesamiento prioritario</li>
                  <li>✓ Soporte dedicado</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

export default app