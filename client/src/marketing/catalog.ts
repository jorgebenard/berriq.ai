import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  ClipboardCheck,
  ClipboardList,
  ContactRound,
  CreditCard,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Hotel,
  LayoutDashboard,
  MapPinned,
  Package,
  PawPrint,
  ReceiptText,
  Scissors,
  Settings2,
  ShoppingBag,
  ShoppingBasket,
  Sparkles,
  Store,
  Tags,
  TicketCheck,
  Truck,
  UsersRound,
  Utensils,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export type CatalogColor = 'violet' | 'blue' | 'aqua' | 'coral' | 'orange' | 'pink' | 'lime' | 'gold';
export type AppCategoryId = 'sales' | 'booking' | 'commerce' | 'finance' | 'people' | 'operations' | 'automation';

export interface AppCategory {
  id: AppCategoryId;
  label: string;
}

export interface CatalogApp {
  id: string;
  name: string;
  category: AppCategoryId;
  icon: LucideIcon;
  color: CatalogColor;
  summary: string;
  manages: string;
  helps: string;
  connections: string[];
  example: string;
  keywords?: string[];
}

export interface Industry {
  id: string;
  name: string;
  icon: LucideIcon;
  color: CatalogColor;
  businesses: string[];
  apps: string[];
}

export const appCategories: AppCategory[] = [
  { id: 'sales', label: 'Ventas y clientes' },
  { id: 'booking', label: 'Reservas y recurrencia' },
  { id: 'commerce', label: 'Comercio' },
  { id: 'finance', label: 'Finanzas y compras' },
  { id: 'people', label: 'Personas' },
  { id: 'operations', label: 'Dirección y operación' },
  { id: 'automation', label: 'Automatización e IA' },
];

export const applications: CatalogApp[] = [
  {
    id: 'crm', name: 'CRM y oportunidades', category: 'sales', icon: ContactRound, color: 'violet',
    summary: 'Clientes y oportunidades en un mismo lugar.',
    manages: 'Contactos, clientes y oportunidades comerciales.',
    helps: 'Organizar el seguimiento de cada relación comercial.',
    connections: ['Cotizaciones', 'Actividades', 'Facturación y cobros'],
    example: 'Una consultora registra una oportunidad y organiza el siguiente contacto.',
    keywords: ['prospectos', 'ventas', 'clientes'],
  },
  {
    id: 'quotes', name: 'Cotizaciones', category: 'sales', icon: ReceiptText, color: 'coral',
    summary: 'Prepara propuestas para tus clientes.',
    manages: 'Cotizaciones de productos y servicios.',
    helps: 'Dar seguimiento a las propuestas comerciales.',
    connections: ['CRM y oportunidades', 'Catálogo y pedidos', 'Servicios'],
    example: 'Un estudio prepara una propuesta para un servicio solicitado.',
    keywords: ['presupuestos', 'propuestas'],
  },
  {
    id: 'activities', name: 'Actividades y seguimiento', category: 'sales', icon: ClipboardCheck, color: 'blue',
    summary: 'Ordena tareas, contactos y pendientes.',
    manages: 'Actividades relacionadas con la operación y el seguimiento comercial.',
    helps: 'Identificar las tareas pendientes del equipo.',
    connections: ['CRM y oportunidades', 'Empleados y asistencia', 'Reportes'],
    example: 'Un equipo anota una llamada pendiente después de enviar una cotización.',
    keywords: ['tareas', 'seguimiento'],
  },
  {
    id: 'booking', name: 'Reservas y espacios', category: 'booking', icon: CalendarCheck2, color: 'aqua',
    summary: 'Organiza tiempos y espacios disponibles.',
    manages: 'Reservas y espacios de la operación.',
    helps: 'Consultar y coordinar la ocupación.',
    connections: ['Servicios', 'Planes y membresías', 'Sedes'],
    example: 'Un centro de bienestar organiza las reservas de sus espacios.',
    keywords: ['citas', 'agenda', 'salas'],
  },
  {
    id: 'services', name: 'Servicios', category: 'booking', icon: Sparkles, color: 'pink',
    summary: 'Reúne la oferta de servicios de tu negocio.',
    manages: 'La información de los servicios ofrecidos.',
    helps: 'Tener una oferta organizada para la atención y la venta.',
    connections: ['Reservas y espacios', 'Cotizaciones', 'Clientes'],
    example: 'Un centro de capacitación organiza los servicios que ofrece a sus clientes.',
    keywords: ['atención', 'oferta'],
  },
  {
    id: 'memberships', name: 'Planes y membresías', category: 'booking', icon: TicketCheck, color: 'violet',
    summary: 'Organiza relaciones de servicio recurrentes.',
    manages: 'Planes y membresías de clientes.',
    helps: 'Consultar la relación de cada cliente con su plan.',
    connections: ['CRM y oportunidades', 'Reservas y espacios', 'Facturación y cobros'],
    example: 'Un club consulta el plan asociado a una membresía.',
    keywords: ['vigencias', 'suscripciones', 'recurrencia'],
  },
  {
    id: 'catalog-orders', name: 'Catálogo y pedidos', category: 'commerce', icon: ShoppingBag, color: 'orange',
    summary: 'Productos y pedidos con contexto compartido.',
    manages: 'Productos del catálogo y pedidos de clientes.',
    helps: 'Organizar la venta y el seguimiento de pedidos.',
    connections: ['Inventario', 'Promociones', 'Facturación y cobros'],
    example: 'Una tienda registra un pedido a partir de su catálogo.',
    keywords: ['productos', 'ventas'],
  },
  {
    id: 'inventory', name: 'Inventario', category: 'commerce', icon: Package, color: 'blue',
    summary: 'Da visibilidad a tus productos y existencias.',
    manages: 'Productos y existencias de la operación.',
    helps: 'Consultar información de inventario al organizar pedidos y compras.',
    connections: ['Catálogo y pedidos', 'Compras y proveedores', 'Sedes'],
    example: 'Un comercio revisa las existencias antes de preparar un pedido.',
    keywords: ['stock', 'almacén'],
  },
  {
    id: 'promotions', name: 'Promociones', category: 'commerce', icon: Tags, color: 'pink',
    summary: 'Organiza ofertas para tu catálogo.',
    manages: 'Promociones relacionadas con la oferta comercial.',
    helps: 'Reunir la información de las ofertas disponibles.',
    connections: ['Catálogo y pedidos', 'Clientes', 'Reportes'],
    example: 'Una tienda organiza una promoción para una selección de productos.',
    keywords: ['ofertas', 'descuentos'],
  },
  {
    id: 'billing', name: 'Facturación y cobros', category: 'finance', icon: CreditCard, color: 'aqua',
    summary: 'Consulta facturación y seguimiento de cobros.',
    manages: 'Información de facturación y seguimiento de cobros.',
    helps: 'Tener a la vista los cobros pendientes de seguimiento.',
    connections: ['CRM y oportunidades', 'Cotizaciones', 'Catálogo y pedidos'],
    example: 'Un negocio revisa el seguimiento de cobro de un servicio.',
    keywords: ['facturas', 'pagos', 'finanzas'],
  },
  {
    id: 'purchasing', name: 'Compras y proveedores', category: 'finance', icon: ShoppingBasket, color: 'gold',
    summary: 'Reúne compras y relaciones con proveedores.',
    manages: 'Compras e información de proveedores.',
    helps: 'Organizar la información necesaria para abastecer la operación.',
    connections: ['Inventario', 'Catálogo y pedidos', 'Sedes'],
    example: 'Un negocio consulta a sus proveedores al planear una compra.',
    keywords: ['abastecimiento', 'proveeduría'],
  },
  {
    id: 'employees', name: 'Empleados y asistencia', category: 'people', icon: UsersRound, color: 'coral',
    summary: 'Ordena la información de tu equipo.',
    manages: 'Información de empleados y asistencia.',
    helps: 'Consultar datos del equipo y su asistencia.',
    connections: ['Permisos y ausencias', 'Sedes', 'Actividades y seguimiento'],
    example: 'Un equipo administrativo consulta la asistencia de su personal.',
    keywords: ['personal', 'equipo', 'asistencias'],
  },
  {
    id: 'leave', name: 'Permisos y ausencias', category: 'people', icon: ClipboardList, color: 'orange',
    summary: 'Consulta permisos y ausencias del equipo.',
    manages: 'Información de permisos y ausencias del personal.',
    helps: 'Mantener ordenada la información de disponibilidad del equipo.',
    connections: ['Empleados y asistencia', 'Sedes', 'Administración y accesos'],
    example: 'Una organización registra un permiso de un integrante del equipo.',
    keywords: ['vacaciones', 'personal'],
  },
  {
    id: 'talent', name: 'Reclutamiento y capacitación', category: 'people', icon: GraduationCap, color: 'blue',
    summary: 'Organiza procesos de incorporación y formación.',
    manages: 'Información de reclutamiento y capacitación.',
    helps: 'Dar seguimiento a los procesos de personas.',
    connections: ['Empleados y asistencia', 'Actividades y seguimiento', 'Administración y accesos'],
    example: 'Una organización reúne la información de una capacitación para su equipo.',
    keywords: ['selección', 'formación', 'talento'],
  },
  {
    id: 'locations', name: 'Sedes', category: 'operations', icon: MapPinned, color: 'aqua',
    summary: 'Organiza tu operación por ubicación.',
    manages: 'Información de las sedes de un negocio.',
    helps: 'Ordenar la operación según sus ubicaciones.',
    connections: ['Empleados y asistencia', 'Reservas y espacios', 'Reportes'],
    example: 'Un negocio organiza sus actividades por sede.',
    keywords: ['sucursales', 'ubicaciones'],
  },
  {
    id: 'reports', name: 'Reportes', category: 'operations', icon: BarChart3, color: 'violet',
    summary: 'Consulta información para supervisar tu operación.',
    manages: 'Información de las distintas áreas para su consulta.',
    helps: 'Revisar la operación desde una perspectiva de dirección.',
    connections: ['Ventas y clientes', 'Inventario', 'Sedes'],
    example: 'Una persona responsable revisa la información de varias áreas del negocio.',
    keywords: ['indicadores', 'dirección', 'análisis'],
  },
  {
    id: 'admin', name: 'Administración y accesos', category: 'operations', icon: Settings2, color: 'lime',
    summary: 'Organiza la administración de la plataforma.',
    manages: 'Información administrativa y permisos de acceso.',
    helps: 'Ordenar la administración y el acceso del equipo.',
    connections: ['Empleados y asistencia', 'Sedes', 'Reportes'],
    example: 'Una organización revisa los accesos de su equipo.',
    keywords: ['permisos', 'roles', 'configuración'],
  },
];

export const industries: Industry[] = [
  {
    id: 'health', name: 'Salud', icon: HeartPulse, color: 'coral',
    businesses: ['Hospitales', 'Clínicas', 'Consultorios', 'Centros dentales', 'Fisioterapia', 'Nutrición', 'Centros de diagnóstico'],
    apps: ['Reservas y espacios', 'CRM y oportunidades', 'Facturación y cobros'],
  },
  {
    id: 'fitness', name: 'Fitness y bienestar', icon: Dumbbell, color: 'aqua',
    businesses: ['Gimnasios', 'Yoga', 'Pilates', 'Entrenamiento personal', 'Centros de bienestar', 'Clubes'],
    apps: ['Planes y membresías', 'Reservas y espacios', 'Facturación y cobros'],
  },
  {
    id: 'beauty', name: 'Belleza', icon: Scissors, color: 'pink',
    businesses: ['Salones', 'Barberías', 'Spas', 'Estudios de uñas', 'Centros de estética'],
    apps: ['Reservas y espacios', 'Servicios', 'CRM y oportunidades'],
  },
  {
    id: 'education', name: 'Educación', icon: GraduationCap, color: 'gold',
    businesses: ['Colegios', 'Universidades', 'Academias', 'Escuelas de idiomas', 'Escuelas de música', 'Centros de capacitación'],
    apps: ['CRM y oportunidades', 'Planes y membresías', 'Facturación y cobros'],
  },
  {
    id: 'hospitality', name: 'Hotelería y alojamiento', icon: Hotel, color: 'blue',
    businesses: ['Hoteles', 'Hostales', 'Apartahoteles', 'Villas', 'Glampings', 'Rentas vacacionales'],
    apps: ['Reservas y espacios', 'Servicios', 'Facturación y cobros'],
  },
  {
    id: 'retail', name: 'Comercio', icon: Store, color: 'orange',
    businesses: ['Boutiques', 'Tiendas especializadas', 'Distribuidores', 'Mayoristas', 'Comercios electrónicos'],
    apps: ['Catálogo y pedidos', 'Inventario', 'Promociones'],
  },
  {
    id: 'marketplaces', name: 'Marketplaces', icon: LayoutDashboard, color: 'violet',
    businesses: ['Plataformas de productos', 'Plataformas de servicios', 'Plataformas de espacios', 'Plataformas de experiencias', 'Plataformas de proveedores'],
    apps: ['Catálogo y pedidos', 'Servicios', 'Compras y proveedores'],
  },
  {
    id: 'property', name: 'Oficinas e inmobiliario', icon: Building2, color: 'aqua',
    businesses: ['Coworkings', 'Centros de negocios', 'Inmobiliarias', 'Administradores de propiedades', 'Coliving'],
    apps: ['Reservas y espacios', 'Planes y membresías', 'CRM y oportunidades'],
  },
  {
    id: 'food', name: 'Gastronomía', icon: Utensils, color: 'coral',
    businesses: ['Restaurantes', 'Cafeterías', 'Catering', 'Dark kitchens', 'Cocinas compartidas'],
    apps: ['Inventario', 'Compras y proveedores', 'Catálogo y pedidos'],
  },
  {
    id: 'professional', name: 'Servicios profesionales', icon: BriefcaseBusiness, color: 'blue',
    businesses: ['Despachos', 'Consultoras', 'Agencias', 'Arquitectura', 'Ingeniería', 'Gestorías'],
    apps: ['CRM y oportunidades', 'Cotizaciones', 'Actividades y seguimiento'],
  },
  {
    id: 'sports', name: 'Deportes y recreación', icon: Activity, color: 'lime',
    businesses: ['Academias deportivas', 'Clubes', 'Canchas', 'Centros recreativos', 'Campamentos'],
    apps: ['Reservas y espacios', 'Planes y membresías', 'CRM y oportunidades'],
  },
  {
    id: 'events', name: 'Eventos y creatividad', icon: Sparkles, color: 'pink',
    businesses: ['Planners', 'Recintos', 'Estudios fotográficos', 'Productoras', 'Estudios de grabación'],
    apps: ['Cotizaciones', 'Reservas y espacios', 'Servicios'],
  },
  {
    id: 'pets', name: 'Mascotas', icon: PawPrint, color: 'gold',
    businesses: ['Veterinarias', 'Estéticas para mascotas', 'Guarderías para mascotas', 'Hoteles para mascotas', 'Tiendas de mascotas'],
    apps: ['Reservas y espacios', 'CRM y oportunidades', 'Catálogo y pedidos'],
  },
  {
    id: 'technical', name: 'Servicios técnicos', icon: Wrench, color: 'orange',
    businesses: ['Talleres', 'Mantenimiento', 'Limpieza', 'Instalaciones', 'Reparación', 'Remodelación'],
    apps: ['Servicios', 'Cotizaciones', 'Actividades y seguimiento'],
  },
  {
    id: 'logistics', name: 'Logística y almacenamiento', icon: Truck, color: 'blue',
    businesses: ['Almacenes', 'Distribución', 'Minibodegas', 'Estacionamientos'],
    apps: ['Inventario', 'Reservas y espacios', 'Sedes'],
  },
  {
    id: 'franchises', name: 'Franquicias y grupos', icon: Building2, color: 'violet',
    businesses: ['Cadenas', 'Redes de franquicias', 'Organizaciones multiempresa'],
    apps: ['Sedes', 'Reportes', 'Administración y accesos'],
  },
];
