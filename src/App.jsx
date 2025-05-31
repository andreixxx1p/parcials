import AndreixxChat from './components/AndreixxChat'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4 mt-2">
        Andreixx Gaming Store
      </h1>
      
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
        <div className="flex-1 flex flex-col pb-4">
          <AndreixxChat />
        </div>
        
        <p className="text-center text-purple-400 font-medium text-sm my-2">
          Tu asistente especializado en equipos y accesorios gaming 🎮
        </p>
      </div>
    </div>
  )
}

export default App
