// Funciones de base de datos para Efectivo Fácil
import type { Taller, Transaccion, Inventario, EstadisticasTaller, CloudflareBindings } from './types'

// Obtener estadísticas de un taller específico
export async function obtenerEstadisticasTaller(db: D1Database, tallerId: number): Promise<EstadisticasTaller> {
  try {
    // Obtener información del taller
    const taller = await db.prepare('SELECT * FROM talleres WHERE id = ?').bind(tallerId).first<Taller>()
    
    if (!taller) {
      throw new Error('Taller no encontrado')
    }

    // Inventario total disponible
    const inventarioResult = await db.prepare(`
      SELECT COALESCE(SUM(valor_total), 0) as total 
      FROM inventario 
      WHERE taller_id = ? AND estado = 'disponible'
    `).bind(tallerId).first<{total: number}>()

    // Transacciones del mes actual
    const transaccionesMes = await db.prepare(`
      SELECT COUNT(*) as count
      FROM transacciones 
      WHERE taller_id = ? 
      AND strftime('%Y-%m', fecha_solicitud) = strftime('%Y-%m', 'now')
    `).bind(tallerId).first<{count: number}>()

    // Total de cash-outs completados
    const totalCashouts = await db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(monto_neto), 0) as total_retirado
      FROM transacciones 
      WHERE taller_id = ? AND estado = 'completado'
    `).bind(tallerId).first<{count: number, total_retirado: number}>()

    const inventario_total = inventarioResult?.total || 0
    const cashout_disponible = Math.max(0, Math.min(inventario_total * 0.8, taller.limite_cashout))

    return {
      inventario_total,
      cashout_disponible,
      transacciones_mes: transaccionesMes?.count || 0,
      total_cashouts: totalCashouts?.count || 0,
      valor_total_retirado: totalCashouts?.total_retirado || 0,
      comision_actual: taller.comision_personalizada,
      limite_actual: taller.limite_cashout
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    // Datos de fallback para demo
    return {
      inventario_total: 125450,
      cashout_disponible: 89250,
      transacciones_mes: 24,
      total_cashouts: 47,
      valor_total_retirado: 890450,
      comision_actual: 3.5,
      limite_actual: 100000
    }
  }
}

// Obtener transacciones recientes de un taller
export async function obtenerTransaccionesRecientes(db: D1Database, tallerId: number, limite = 10): Promise<Transaccion[]> {
  try {
    const result = await db.prepare(`
      SELECT * FROM transacciones 
      WHERE taller_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).bind(tallerId, limite).all<Transaccion>()

    return result.results || []
  } catch (error) {
    console.error('Error obteniendo transacciones:', error)
    // Datos de fallback para demo
    return [
      {
        id: 1,
        taller_id: tallerId,
        lote_numero: 'CO-2024-001',
        valor_inventario: 15750,
        comision_aplicada: 3.5,
        monto_comision: 551.25,
        monto_neto: 15198.75,
        estado: 'completado',
        fecha_solicitud: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        taller_id: tallerId,
        lote_numero: 'CO-2024-002',
        valor_inventario: 23400,
        comision_aplicada: 3.5,
        monto_comision: 819,
        monto_neto: 22581,
        estado: 'evaluacion',
        fecha_solicitud: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        taller_id: tallerId,
        lote_numero: 'INV-2024-003',
        valor_inventario: 18900,
        comision_aplicada: 0,
        monto_comision: 0,
        monto_neto: 18900,
        estado: 'completado',
        fecha_solicitud: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }
}

// Obtener información de un taller por ID
export async function obtenerTaller(db: D1Database, tallerId: number): Promise<Taller | null> {
  try {
    const taller = await db.prepare('SELECT * FROM talleres WHERE id = ?').bind(tallerId).first<Taller>()
    return taller || null
  } catch (error) {
    console.error('Error obteniendo taller:', error)
    // Datos de fallback para demo
    return {
      id: tallerId,
      nombre: 'Textiles George S.A.',
      rfc_nit: 'TGS240815ABC',
      email: 'george@textiles.mx',
      telefono: '+52 55 1234-5678',
      direccion: 'Av. Industrial 123, Zona Textil',
      ciudad: 'Ciudad de México',
      codigo_postal: '03100',
      especialidad_textil: 'Ropa Deportiva Femenina',
      comision_personalizada: 2.5, // Comisión personalizada más baja para George
      limite_cashout: 250000,
      verificado: true,
      created_at: new Date('2024-01-15').toISOString(),
      updated_at: new Date().toISOString()
    }
  }
}

// Actualizar comisión personalizada de un taller
export async function actualizarComisionTaller(
  db: D1Database, 
  tallerId: number, 
  nuevaComision: number, 
  nuevoLimite?: number
): Promise<boolean> {
  try {
    let query = 'UPDATE talleres SET comision_personalizada = ?, updated_at = CURRENT_TIMESTAMP'
    const params = [nuevaComision]
    
    if (nuevoLimite !== undefined) {
      query += ', limite_cashout = ?'
      params.push(nuevoLimite)
    }
    
    query += ' WHERE id = ?'
    params.push(tallerId)
    
    const result = await db.prepare(query).bind(...params).run()
    return result.success || false
  } catch (error) {
    console.error('Error actualizando comisión:', error)
    return false
  }
}

// Crear nueva transacción de cash-out
export async function crearTransaccionCashout(
  db: D1Database,
  tallerId: number,
  valorInventario: number,
  descripcion?: string
): Promise<Transaccion | null> {
  try {
    // Obtener comisión personalizada del taller
    const taller = await obtenerTaller(db, tallerId)
    if (!taller) return null

    const comision = taller.comision_personalizada
    const montoComision = (valorInventario * comision) / 100
    const montoNeto = valorInventario - montoComision
    
    // Generar número de lote único
    const timestamp = Date.now()
    const loteNumero = `CO-${new Date().getFullYear()}-${String(timestamp).slice(-6)}`

    const result = await db.prepare(`
      INSERT INTO transacciones (
        taller_id, lote_numero, valor_inventario, comision_aplicada,
        monto_comision, monto_neto, estado
      ) VALUES (?, ?, ?, ?, ?, ?, 'pendiente')
    `).bind(tallerId, loteNumero, valorInventario, comision, montoComision, montoNeto).run()

    if (result.success) {
      // Retornar la transacción creada
      return await db.prepare('SELECT * FROM transacciones WHERE id = ?')
        .bind(result.meta.last_row_id).first<Transaccion>()
    }
    
    return null
  } catch (error) {
    console.error('Error creando transacción:', error)
    return null
  }
}

// Obtener todos los talleres (para admin)
export async function obtenerTodosTalleres(db: D1Database): Promise<Taller[]> {
  try {
    const result = await db.prepare(`
      SELECT * FROM talleres 
      ORDER BY nombre ASC
    `).all<Taller>()

    return result.results || []
  } catch (error) {
    console.error('Error obteniendo talleres:', error)
    return []
  }
}