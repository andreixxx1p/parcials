import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa'

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Generar un userId único al cargar el componente
  useEffect(() => {
    const storedUserId = localStorage.getItem('chatUserId')
    if (storedUserId) {
      setUserId(storedUserId)
    } else {
      const newUserId = 'user_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('chatUserId', newUserId)
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
      
      // Enviar mensaje al backend
      const response = await axios.post('https://parcial3-ashy.vercel.app/api/chat', {
        message: inputMessage,
        userId: userId
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      // Agregar la respuesta del asistente
      setMessages([
        ...newMessages,
        { role: 'assistant', content: response.data.message || response.data.response }
      ])
    } catch (error) {
      console.error('Error detallado:', error.response || error)
      setMessages([
        ...messages,
        { role: 'user', content: inputMessage },
        { role: 'system', content: `Error: ${error.response?.data?.message || error.message || 'Error desconocido'}` }
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
    <div className="bg-white shadow-2xl rounded-xl overflow-hidden border border-purple-200 mx-auto max-w-2xl">
      {/* Header del chat */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 text-center shadow-md">
        <h2 className="text-xl font-bold flex items-center justify-center">
          <FaRobot className="mr-2 text-purple-200" /> Chat con IA
        </h2>
      </div>
      
      {/* Historial de mensajes */}
      <div className="h-[500px] overflow-y-auto p-4 bg-gradient-to-b from-purple-50 to-white">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600">
            <div className="p-6 bg-purple-100 rounded-full mb-4 shadow-inner">
              <FaRobot className="text-5xl text-purple-600" />
            </div>
            <p className="text-xl font-semibold text-purple-800">¡Bienvenido al Chat! 👋</p>
            <p className="mt-2 text-purple-600">¿En qué puedo ayudarte hoy?</p>
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
                      ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-tr-none' 
                      : message.role === 'system'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-white text-gray-800 border border-purple-100 rounded-tl-none shadow-md'
                  }`}
                >
                  <div className="flex items-center mb-1 font-medium">
                    {message.role === 'user' ? (
                      <>
                        <FaUser className="mr-1 text-white" /> <span className="text-white font-bold">Tú</span>
                      </>
                    ) : message.role === 'system' ? (
                      'Sistema'
                    ) : (
                      <>
                        <FaRobot className="mr-1 text-purple-600" /> <span className="text-purple-800">Asistente</span>
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
            <div className="max-w-[85%] p-3 bg-white border border-purple-100 rounded-2xl rounded-tl-none shadow-md">
              <div className="flex items-center mb-1 font-medium">
                <FaRobot className="mr-1 text-purple-600" /> <span className="text-purple-800">Asistente</span>
              </div>
              <div className="flex space-x-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Formulario para enviar mensajes */}
      <form onSubmit={handleSubmit} className="p-4 bg-gradient-to-r from-purple-100 to-indigo-100 border-t border-purple-200">
        <div className="mb-2">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje aquí..."
            className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800 resize-none shadow-inner transition-all"
            rows="2"
            disabled={isLoading}
          />
        </div>
        
        <div className="flex items-center">
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <FaPaperPlane className="mr-2" /> Enviar
          </button>
        </div>
        
        <p className="text-xs text-purple-500 mt-1 text-center">
          {isLoading ? '⏳ Procesando...' : '💬 Presiona Enter para enviar'}
        </p>
      </form>
    </div>
  )
}

export default Chat 