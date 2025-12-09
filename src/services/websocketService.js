// Servicio para gestionar conexiones WebSocket usando STOMP
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const WS_URL = 'http://localhost:8080/ws' // URL del endpoint WebSocket

class WebSocketService {
  constructor() {
    this.client = null
    this.subscriptions = new Map() // Guarda las suscripciones activas por orderNumber
    this.isConnected = false
    this.reconnecting = false
  }

  /**
   * Conecta al WebSocket si aún no está conectado
   */
  async connect() {
    if (this.client && this.isConnected) {
      return true
    }

    if (this.reconnecting) {
      return false
    }

    this.reconnecting = true

    try {
      return await new Promise((resolve) => {
        this.client = new Client({
          webSocketFactory: () => new SockJS(WS_URL),
          
          debug: (str) => {
            // Solo mostrar errores importantes, no todo el tráfico
            if (str.includes('ERROR') || str.includes('CONNECTED')) {
              console.log('STOMP:', str)
            }
          },

          reconnectDelay: 10000, // Intentar reconectar cada 10 segundos
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,

          onConnect: () => {
            console.log('✅ WebSocket conectado correctamente')
            this.isConnected = true
            this.reconnecting = false
            resolve(true)
          },

          onDisconnect: () => {
            console.log('❌ WebSocket desconectado')
            this.isConnected = false
            this.reconnecting = false
          },

          onStompError: (frame) => {
            console.error('⚠️ Error STOMP:', frame.headers['message'])
            this.isConnected = false
            this.reconnecting = false
            resolve(false)
          },

          onWebSocketError: (error) => {
            console.error('⚠️ Error de conexión WebSocket:', error.message || 'Error desconocido')
            this.isConnected = false
            this.reconnecting = false
            resolve(false)
          },

          onWebSocketClose: () => {
            console.log('🔌 Conexión WebSocket cerrada')
            this.isConnected = false
            this.reconnecting = false
          }
        })

        try {
          this.client.activate()
          // Si no se conecta en 5 segundos, resolver como false
          setTimeout(() => {
            if (!this.isConnected) {
              console.log('⏰ Timeout de conexión WebSocket')
              this.reconnecting = false
              resolve(false)
            }
          }, 5000)
        } catch (error) {
          this.isConnected = false
          this.reconnecting = false
          resolve(false)
        }
      })
    } catch (error) {
      this.isConnected = false
      this.reconnecting = false
      return false
    }
  }

  /**
   * Desconecta el WebSocket
   */
  disconnect() {
    if (this.client) {
      this.client.deactivate()
      this.isConnected = false
      this.subscriptions.clear()
    }
  }

  /**
   * Suscribe a los detalles de una orden específica
   * 
   * @param {string} orderNumber - Número de la orden
   * @param {Function} callback - Función que se ejecuta cuando llegan datos
   * @returns {Promise<Function|null>} - Función para desuscribirse o null si falla
   */
  async subscribeToOrderDetails(orderNumber, callback) {
    // Asegurar que esté conectado
    if (!this.isConnected) {
      const connected = await this.connect()
      if (!connected) {
        return null
      }
    }

    const topic = `/topic/detail/${orderNumber}`

    try {
      // Si ya existe una suscripción para esta orden, desuscribirse primero
      if (this.subscriptions.has(orderNumber)) {
        const oldSubscription = this.subscriptions.get(orderNumber)
        oldSubscription.unsubscribe()
      }

      // Crear nueva suscripción
      const subscription = this.client.subscribe(topic, (message) => {
        try {
          const detail = JSON.parse(message.body)
          
          // Validar que el callback sea una función antes de llamarlo
          if (typeof callback === 'function') {
            callback(detail)
          }
        } catch (error) {
          // Error al parsear mensaje
        }
      })

      this.subscriptions.set(orderNumber, subscription)
      console.log(`✅ Suscrito a: ${topic}`)

      // Retornar función para desuscribirse
      return () => {
        subscription.unsubscribe()
        this.subscriptions.delete(orderNumber)
        console.log(`❌ Desuscrito de: ${topic}`)
      }
    } catch (error) {
      console.error(`❌ Error al suscribirse a ${topic}:`, error)
      return null
    }
  }

  /**
   * Suscribe a las alarmas de temperatura
   * 
   * @param {Function} callback - Función que se ejecuta cuando llega una alarma
   * @returns {Promise<Function>} - Función para desuscribirse
   */
  async subscribeToAlarms(callback) {
    // Asegurar que esté conectado
    if (!this.isConnected) {
      await this.connect()
    }

    const topic = '/topic/alarm'

    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const alarm = JSON.parse(message.body)
        console.log('🚨 Alarma recibida:', alarm)
        callback(alarm)
      } catch (error) {
        console.error('Error al parsear alarma WebSocket:', error)
      }
    })

    console.log(`✅ Suscrito a alarmas: ${topic}`)

    // Retornar función para desuscribirse
    return () => {
      subscription.unsubscribe()
      console.log(`❌ Desuscrito de alarmas: ${topic}`)
    }
  }

  /**
   * Verifica si el WebSocket está conectado
   */
  getConnectionStatus() {
    return this.isConnected
  }
}

// Exportar instancia única (singleton)
export default new WebSocketService()
