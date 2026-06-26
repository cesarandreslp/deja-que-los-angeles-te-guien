-- Optimización de índices para mejorar el rendimiento de la base de datos
-- Ejecutar en PostgreSQL (Neon)

-- Índice para consultas del mentor (userId + ordenado por fecha)
CREATE INDEX IF NOT EXISTS idx_mentor_consultations_userId_createdAt 
  ON mentor_consultations(userId, createdAt DESC);

-- Índice para videoconsultas por usuario
CREATE INDEX IF NOT EXISTS idx_video_consultations_userId 
  ON video_consultations(userId);

-- Índice para videoconsultas por consultor
CREATE INDEX IF NOT EXISTS idx_video_consultations_consultorId 
  ON video_consultations(consultorId);

-- Índice para órdenes por usuario
CREATE INDEX IF NOT EXISTS idx_orders_userId 
  ON orders(userId);

-- Índice compuesto para posts de blog (status + fecha de publicación)
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_publishedAt 
  ON blog_posts(status, publishedAt DESC);

-- Índice para búsqueda de posts por categoría
CREATE INDEX IF NOT EXISTS idx_blog_posts_categoryId 
  ON blog_posts(categoryId);

-- Índice para búsqueda de productos activos
CREATE INDEX IF NOT EXISTS idx_products_isActive 
  ON products(isActive) WHERE isActive = true;

-- Índice para verificación de tokens de email
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token 
  ON verification_tokens(token);

-- Índice para tokens de reseteo de contraseña
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token 
  ON password_reset_tokens(token);

-- Índice para membresías activas por usuario
CREATE INDEX IF NOT EXISTS idx_memberships_userId_status 
  ON memberships(userId, status);

-- Índice para user_memberships por usuario y estado
CREATE INDEX IF NOT EXISTS idx_user_memberships_userId_status 
  ON user_memberships(userId, status);

-- Índice para lecturas del oráculo por usuario
CREATE INDEX IF NOT EXISTS idx_oracle_readings_userId_createdAt 
  ON oracle_readings(userId, createdAt DESC);

-- Índice para carritos por usuario
CREATE INDEX IF NOT EXISTS idx_carts_userId 
  ON carts(userId);

-- Índice para items del carrito por carrito
CREATE INDEX IF NOT EXISTS idx_cart_items_cartId 
  ON cart_items(cartId);

-- Índice para items de órdenes por orden
CREATE INDEX IF NOT EXISTS idx_order_items_orderId 
  ON order_items(orderId);

-- Índice para comisiones por consultor
CREATE INDEX IF NOT EXISTS idx_commissions_consultorId_status 
  ON commissions(consultorId, status);

-- Verificar que los índices se crearon correctamente
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
