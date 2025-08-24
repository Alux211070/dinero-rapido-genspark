// Tipos para la aplicación Efectivo Fácil

export interface Taller {
  id: number
  nombre: string
  rfc_nit: string
  email: string
  telefono?: string
  direccion?: string
  ciudad?: string
  codigo_postal?: string
  especialidad_textil?: string
  comision_personalizada: number // Porcentaje personalizado por taller
  limite_cashout: number
  verificado: boolean
  fecha_verificacion?: string
  foto_url?: string
  notas_admin?: string
  created_at: string
  updated_at: string
}

export interface Transaccion {
  id: number
  taller_id: number
  lote_numero: string
  valor_inventario: number
  comision_aplicada: number
  monto_comision: number
  monto_neto: number
  estado: 'pendiente' | 'evaluacion' | 'aprobado' | 'completado' | 'cancelado'
  fecha_solicitud: string
  fecha_evaluacion?: string
  fecha_aprobacion?: string
  fecha_completado?: string
  metodo_pago?: string
  referencia_pago?: string
  notas_admin?: string
  created_at: string
  updated_at: string
}

export interface Inventario {
  id: number
  taller_id: number
  categoria: string
  descripcion: string
  cantidad: number
  valor_unitario: number
  valor_total: number
  estado: 'disponible' | 'en_evaluacion' | 'vendido'
  created_at: string
  updated_at: string
}

export interface CloudflareBindings {
  DB?: D1Database
}

export interface EstadisticasTaller {
  inventario_total: number
  cashout_disponible: number
  transacciones_mes: number
  total_cashouts: number
  valor_total_retirado: number
  comision_actual: number
  limite_actual: number
}