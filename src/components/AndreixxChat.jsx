import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { FaGamepad, FaUser, FaKeyboard, FaHeadset, FaMouse } from 'react-icons/fa'

// Configuración de axios
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000, // 10 segundos de timeout
});

const AndreixxChat = () => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Generar un userId único al cargar el componente
  useEffect(() => {
    const storedUserId = localStorage.getItem('andreixxUserId')
    if (storedUserId) {
      setUserId(storedUserId)
    } else {
      const newUserId = 'user_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('andreixxUserId', newUserId)
      setUserId(newUserId)
    }
  }, [])

  // Auto-scroll cuando hay nuevos mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Manejar envío con Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!inputMessage.trim()) return
    
    try {
      setIsLoading(true)
      
      // Agregar el mensaje del usuario
      const newMessages = [
        ...messages,
        { role: 'user', content: inputMessage }
      ]
      setMessages(newMessages)
      setInputMessage('')
      
      // Preparar el cuerpo de la petición con el formato requerido
      const requestBody = {
        prompt: inputMessage.trim(),
        user: userId || 'anonymous'
      }

      // Verificar que los valores no sean undefined o null
      if (!requestBody.prompt || !requestBody.user) {
        throw new Error('El prompt y el usuario son requeridos')
      }

      console.log('Enviando petición con body:', requestBody)
      
      // Enviar mensaje al backend con la configuración correcta
      const response = await api.post('/api/chat', requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Respuesta del servidor:', response.data)
      
      // Verificar la respuesta
      if (response.data) {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: response.data.message || response.data.response || response.data.content }
        ])
      } else {
        throw new Error('No se recibió una respuesta válida del servidor')
      }
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Detalles de la petición:', {
        url: 'http://localhost:5000/api/chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          prompt: inputMessage.trim(),
          user: userId || 'anonymous'
        }
      });
      console.error('Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });
      
      let errorMessage = 'Error desconocido';
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'No se pudo conectar al servidor. Por favor, asegúrate de que el backend esté ejecutándose en http://localhost:5000';
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = 'La conexión al servidor tardó demasiado. Por favor, intenta de nuevo.';
      } else if (error.response) {
        errorMessage = `Error del servidor (${error.response.status}): ${error.response.statusText}`;
        if (error.response.data?.message) {
          errorMessage += ` - ${error.response.data.message}`;
        }
      } else if (error.request) {
        errorMessage = 'No se recibió respuesta del servidor. Por favor, verifica que el backend esté ejecutándose.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      setMessages([
        ...messages,
        { role: 'user', content: inputMessage },
        { role: 'system', content: errorMessage }
      ])
      setInputMessage('')
    } finally {
      setIsLoading(false)
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }

  // Formatear el texto con saltos de línea
  const formatText = (text) => {
    return text.split('\n').map((paragraph, i) => (
      <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
    ))
  }

  return (
    <div className="bg-gray-900 shadow-2xl rounded-xl overflow-hidden border border-purple-500 mx-auto max-w-2xl">
      {/* Header del chat */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 text-center shadow-md">
        <h2 className="text-xl font-bold flex items-center justify-center">
          <FaGamepad className="mr-2 text-yellow-400" /> Andreixx - Asistente Gamer
        </h2>
      </div>
      
      {/* Historial de mensajes */}
      <div className="h-[500px] overflow-y-auto p-4 bg-gradient-to-b from-gray-800 to-gray-900">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300">
            <div className="p-6 bg-purple-900 rounded-full mb-4 shadow-inner">
              <FaGamepad className="text-5xl text-purple-400" />
            </div>
            <p className="text-xl font-semibold text-purple-400">¡Bienvenido a Andreixx! 🎮</p>
            <p className="mt-2 text-gray-400">Tu asistente especializado en equipos y accesorios gaming</p>
            <div className="mt-6 flex space-x-4">
              <div className="text-center">
                <FaKeyboard className="text-2xl text-purple-400 mx-auto mb-2" />
                <span className="text-sm text-gray-400">Teclados</span>
              </div>
              <div className="text-center">
                <FaMouse className="text-2xl text-purple-400 mx-auto mb-2" />
                <span className="text-sm text-gray-400">Mouse</span>
              </div>
              <div className="text-center">
                <FaHeadset className="text-2xl text-purple-400 mx-auto mb-2" />
                <span className="text-sm text-gray-400">Audífonos</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl shadow-md ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-tr-none' 
                      : message.role === 'system'
                        ? 'bg-red-900 text-red-200 border border-red-700'
                        : 'bg-gray-800 text-gray-200 border border-purple-500 rounded-tl-none shadow-md'
                  }`}
                >
                  <div className="flex items-center mb-1 font-medium">
                    {message.role === 'user' ? (
                      <>
                        <FaUser className="mr-1 text-yellow-400" /> <span className="text-yellow-400 font-bold">Tú</span>
                      </>
                    ) : message.role === 'system' ? (
                      'Sistema'
                    ) : (
                      <>
                        <FaGamepad className="mr-1 text-purple-400" /> <span className="text-purple-400">Andreixx</span>
                      </>
                    )}
                  </div>
                  <div className={`whitespace-pre-wrap leading-relaxed text-sm md:text-base ${message.role === 'user' ? 'font-medium text-white' : ''}`}>
                    {formatText(message.content)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-start mt-4">
            <div className="max-w-[85%] p-3 bg-gray-800 border border-purple-500 rounded-2xl rounded-tl-none shadow-md">
              <div className="flex items-center mb-1 font-medium">
                <FaGamepad className="mr-1 text-purple-400" /> <span className="text-purple-400">Andreixx</span>
              </div>
              <div className="flex space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Formulario para enviar mensajes */}
      <form onSubmit={handleSubmit} className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-t border-purple-500">
        <div className="mb-2">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregunta sobre equipos y accesorios gaming..."
            className="w-full p-3 border border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-800 text-gray-200 resize-none shadow-inner transition-all placeholder-gray-500"
            rows="2"
            disabled={isLoading}
          />
        </div>
        
        <div className="flex items-center">
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg disabled:bg-gray-700 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <FaGamepad className="mr-2" /> Enviar
          </button>
        </div>
        
        <p className="text-xs text-purple-400 mt-1 text-center">
          {isLoading ? '⏳ Procesando...' : '💬 Presiona Enter para enviar'}
        </p>
      </form>
    </div>
  )
}

export default AndreixxChat 