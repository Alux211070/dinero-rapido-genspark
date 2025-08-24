// Utilidades para Efectivo Fácil

// Formatear tiempo relativo (ej: "hace 2 horas")
export function tiempoRelativo(fecha: string): string {
  const ahora = new Date()
  const fechaObj = new Date(fecha)
  const diferencia = ahora.getTime() - fechaObj.getTime()
  
  const minutos = Math.floor(diferencia / (1000 * 60))
  const horas = Math.floor(diferencia / (1000 * 60 * 60))
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
  
  if (minutos < 60) {
    return `Hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`
  } else if (horas < 24) {
    return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`
  } else {
    return `Hace ${dias} día${dias !== 1 ? 's' : ''}`
  }
}

// Formatear estado de transacción
export function formatearEstado(estado: string): { texto: string, icono: string, color: string } {
  switch (estado) {
    case 'completado':
      return { texto: 'Completado', icono: '✓', color: 'green' }
    case 'evaluacion':
      return { texto: 'En Evaluación', icono: '⏳', color: 'yellow' }
    case 'pendiente':
      return { texto: 'Pendiente', icono: '📋', color: 'blue' }
    case 'aprobado':
      return { texto: 'Aprobado', icono: '👍', color: 'purple' }
    case 'cancelado':
      return { texto: 'Cancelado', icono: '❌', color: 'red' }
    default:
      return { texto: estado, icono: '📦', color: 'gray' }
  }
}

// Formatear moneda
export function formatearMoneda(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Determinar el tipo de transacción
export function tipoTransaccion(loteNumero: string): { tipo: string, icono: string } {
  if (loteNumero.startsWith('CO-')) {
    return { tipo: 'Cash-out', icono: '💰' }
  } else if (loteNumero.startsWith('INV-')) {
    return { tipo: 'Inventario Agregado', icono: '📦' }
  } else {
    return { tipo: 'Transacción', icono: '💳' }
  }
}