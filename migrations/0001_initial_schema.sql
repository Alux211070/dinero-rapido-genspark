-- Efectivo Fácil - Schema inicial con comisiones personalizadas

-- Tabla de usuarios administradores
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de talleres textiles (clientes)
CREATE TABLE IF NOT EXISTS talleres (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  rfc_nit TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  direccion TEXT,
  ciudad TEXT,
  codigo_postal TEXT,
  especialidad_textil TEXT,
  
  -- Configuración personalizada por cliente
  comision_personalizada REAL NOT NULL DEFAULT 3.5, -- % comisión única por taller
  limite_cashout REAL NOT NULL DEFAULT 100000,
  
  -- Estado de verificación
  verificado BOOLEAN DEFAULT FALSE,
  fecha_verificacion DATETIME,
  
  -- Metadata
  foto_url TEXT,
  notas_admin TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de inventario por taller
CREATE TABLE IF NOT EXISTS inventario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  taller_id INTEGER NOT NULL,
  categoria TEXT NOT NULL, -- 'ropa_deportiva', 'casual', 'formal', etc.
  descripcion TEXT NOT NULL,
  cantidad INTEGER NOT NULL,
  valor_unitario REAL NOT NULL,
  valor_total REAL NOT NULL,
  estado TEXT DEFAULT 'disponible', -- 'disponible', 'en_evaluacion', 'vendido'
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (taller_id) REFERENCES talleres(id)
);

-- Tabla de transacciones de cash-out
CREATE TABLE IF NOT EXISTS transacciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  taller_id INTEGER NOT NULL,
  lote_numero TEXT UNIQUE NOT NULL, -- CO-2024-001, etc.
  
  -- Montos
  valor_inventario REAL NOT NULL,
  comision_aplicada REAL NOT NULL, -- % real aplicado para esta transacción
  monto_comision REAL NOT NULL, -- dinero de comisión
  monto_neto REAL NOT NULL, -- lo que recibe el taller
  
  -- Estados del proceso
  estado TEXT DEFAULT 'pendiente', -- 'pendiente', 'evaluacion', 'aprobado', 'completado', 'cancelado'
  fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_evaluacion DATETIME,
  fecha_aprobacion DATETIME,
  fecha_completado DATETIME,
  
  -- Información de pago
  metodo_pago TEXT, -- 'transferencia', 'paypal', 'stripe', etc.
  referencia_pago TEXT,
  notas_admin TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (taller_id) REFERENCES talleres(id)
);

-- Tabla de autenticación de talleres (sesiones)
CREATE TABLE IF NOT EXISTS taller_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  taller_id INTEGER NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (taller_id) REFERENCES talleres(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_talleres_email ON talleres(email);
CREATE INDEX IF NOT EXISTS idx_talleres_rfc ON talleres(rfc_nit);
CREATE INDEX IF NOT EXISTS idx_inventario_taller ON inventario(taller_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_taller ON transacciones(taller_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_estado ON transacciones(estado);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON taller_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON taller_sessions(expires_at);

-- Datos de ejemplo (opcional para desarrollo)
INSERT OR IGNORE INTO talleres (
  nombre, rfc_nit, email, telefono, direccion, ciudad, codigo_postal, 
  especialidad_textil, comision_personalizada, limite_cashout, verificado
) VALUES 
  ('Textiles George S.A.', 'TGS240815ABC', 'george@textiles.mx', '+52 55 1234-5678', 
   'Av. Industrial 123, Zona Textil', 'Ciudad de México', '03100', 
   'Ropa Deportiva Femenina', 2.5, 250000, TRUE),
   
  ('Confecciones Rápidas', 'CRS240816DEF', 'contacto@confeccionesrapidas.mx', '+52 33 2345-6789',
   'Calle Textil 456', 'Guadalajara', '44100', 
   'Ropa Casual', 4.0, 150000, TRUE),
   
  ('Deportivos Premium', 'DPR240817GHI', 'admin@deportivospremium.mx', '+52 81 3456-7890',
   'Blvd. Industrial 789', 'Monterrey', '64000',
   'Uniformes Deportivos', 3.0, 200000, FALSE);

-- Inventario de ejemplo
INSERT OR IGNORE INTO inventario (taller_id, categoria, descripcion, cantidad, valor_unitario, valor_total) VALUES 
  (1, 'ropa_deportiva', 'Leggings deportivos dama talla S-XL', 150, 125.0, 18750.0),
  (1, 'ropa_deportiva', 'Tops deportivos con soporte', 100, 95.0, 9500.0),
  (1, 'ropa_deportiva', 'Conjuntos yoga premium', 80, 245.0, 19600.0),
  (2, 'ropa_casual', 'Blusas casuales variadas', 200, 85.0, 17000.0),
  (2, 'ropa_casual', 'Pantalones mezclilla', 120, 155.0, 18600.0),
  (3, 'uniformes', 'Uniformes escolares completos', 300, 180.0, 54000.0);

-- Transacciones de ejemplo
INSERT OR IGNORE INTO transacciones (
  taller_id, lote_numero, valor_inventario, comision_aplicada, 
  monto_comision, monto_neto, estado
) VALUES 
  (1, 'CO-2024-001', 18750.0, 2.5, 468.75, 18281.25, 'completado'),
  (1, 'CO-2024-002', 28100.0, 2.5, 702.50, 27397.50, 'evaluacion'),
  (2, 'CO-2024-003', 17000.0, 4.0, 680.0, 16320.0, 'pendiente'),
  (3, 'CO-2024-004', 54000.0, 3.0, 1620.0, 52380.0, 'evaluacion');