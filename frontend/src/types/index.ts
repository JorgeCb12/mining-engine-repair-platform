export interface User {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Cliente {
  id: string;
  razon_social: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  contacto_nombre: string;
  contacto_email: string;
  contacto_telefono: string;
  ubicacion: string;
  estado_activo: boolean;
  created_at: string;
}

export interface Motor {
  id: string;
  codigo_interno: string;
  numero_serie: string;
  fabricante: string;
  modelo: string;
  tipo_motor: string;
  potencia_hp: number;
  horas_de_uso: number;
  ubicacion_actual: string;
  cliente_propietario_id: string;
  estado_activo: boolean;
  created_at: string;
}

export interface Orden {
  id: string;
  numero_orden: string;
  motor_id: string;
  cliente_id: string;
  estado_actual: string;
  descripcion_falla: string;
  fecha_recepcion: string;
  created_at: string;
}

export interface HistorialEstado {
  id: string;
  estado_anterior: string;
  estado_nuevo: string;
  usuario_id: string;
  comentario: string | null;
  timestamp: string;
}
