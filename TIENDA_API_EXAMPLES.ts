/**
 * TESTING DE LA TIENDA ANGELICAL
 * ==============================
 * 
 * Este archivo contiene ejemplos de cómo probar las APIs de la tienda angelical.
 * Puedes usar estos endpoints con herramientas como Postman, curl, o desde el frontend.
 */

// EJEMPLOS DE USO DE LAS APIS

// 1. PRODUCTOS
const productExamples = {
  // Obtener todos los productos
  getAllProducts: 'GET /api/products',
  
  // Obtener productos con filtros
  getFilteredProducts: 'GET /api/products?category=ESSENCES&search=amor&page=1&limit=10',
  
  // Crear nuevo producto (requiere admin)
  createProduct: {
    method: 'POST',
    url: '/api/products',
    body: {
      name: 'Aceite de Arcángel Miguel',
      description: 'Aceite sagrado para protección y fuerza espiritual',
      price: 450.00, // Se convertirá automáticamente a centavos
      category: 'OILS',
      imageUrls: ['https://example.com/aceite-miguel.jpg'],
      stock: 15,
      tags: ['protección', 'arcángel', 'miguel', 'aceite']
    }
  },
  
  // Obtener producto específico
  getProduct: 'GET /api/products/[productId]',
  
  // Actualizar producto (requiere admin)
  updateProduct: {
    method: 'PUT', 
    url: '/api/products/[productId]',
    body: {
      stock: 20,
      price: 500.00
    }
  },
  
  // Eliminar producto (requiere admin)
  deleteProduct: 'DELETE /api/products/[productId]'
}

// 2. CARRITO
const cartExamples = {
  // Obtener carrito del usuario
  getCart: 'GET /api/cart',
  
  // Agregar producto al carrito
  addProduct: {
    method: 'POST',
    url: '/api/cart',
    body: {
      productId: 'producto-id-aqui',
      quantity: 2
    }
  },
  
  // Agregar videoconsulta al carrito
  addConsultation: {
    method: 'POST', 
    url: '/api/cart',
    body: {
      consultationId: 'consulta-id-aqui',
      quantity: 1
    }
  },
  
  // Actualizar cantidad de item
  updateQuantity: {
    method: 'PUT',
    url: '/api/cart/[itemId]',
    body: {
      quantity: 3
    }
  },
  
  // Eliminar item del carrito
  removeItem: 'DELETE /api/cart/[itemId]',
  
  // Vaciar carrito completo
  clearCart: 'DELETE /api/cart'
}

// 3. ÓRDENES
const orderExamples = {
  // Obtener órdenes del usuario
  getOrders: 'GET /api/orders?page=1&limit=10&status=PENDING',
  
  // Crear orden desde carrito
  createOrder: {
    method: 'POST',
    url: '/api/orders',
    body: {
      shippingAddress: {
        street: 'Calle Espiritual 123, Col. Angelical',
        city: 'Ciudad de México',
        state: 'CDMX',
        zipCode: '12345',
        country: 'México'
      },
      paymentMethod: 'MERCADOPAGO',
      notes: 'Entrega por favor después de las 2pm'
    }
  },
  
  // Obtener orden específica
  getOrder: 'GET /api/orders/[orderId]',
  
  // Actualizar estado de orden (requiere admin)
  updateOrderStatus: {
    method: 'PATCH',
    url: '/api/orders/[orderId]',
    body: {
      status: 'CONFIRMED'
    }
  },
  
  // Cancelar orden
  cancelOrder: 'DELETE /api/orders/[orderId]'
}

// EJEMPLO DE FLUJO COMPLETO
const completeFlow = {
  step1: 'Usuario navega a /tienda',
  step2: 'Usuario busca y filtra productos',
  step3: 'Usuario agrega productos al carrito via POST /api/cart',
  step4: 'Usuario también agrega una videoconsulta al carrito',
  step5: 'Usuario va a /carrito para revisar sus items',
  step6: 'Usuario actualiza cantidades si es necesario',
  step7: 'Usuario procede al checkout',
  step8: 'Sistema crea orden via POST /api/orders',
  step9: 'Carrito se vacía automáticamente',
  step10: 'Usuario recibe confirmación de orden',
  step11: 'Admin puede actualizar estado de la orden'
}

// CATEGORÍAS DISPONIBLES
const categorias = [
  'CLOTHING',     // Ropa Angelical
  'JEWELRY',      // Joyería Espiritual  
  'ESSENCES',     // Esencias Sagradas
  'OILS',         // Aceites Místicos
  'RITUALS',      // Rituales Mágicos
  'ACCESSORIES'   // Accesorios
]

// ESTADOS DE ORDEN
const orderStatuses = [
  'PENDING',      // Pendiente
  'CONFIRMED',    // Confirmada
  'PROCESSING',   // En proceso
  'SHIPPED',      // Enviada
  'DELIVERED',    // Entregada
  'CANCELLED'     // Cancelada
]

// MÉTODOS DE PAGO
const paymentMethods = [
  'MERCADOPAGO',
  'STRIPE', 
  'PAYPAL'
]

export {
  productExamples,
  cartExamples,
  orderExamples,
  completeFlow,
  categorias,
  orderStatuses,
  paymentMethods
}