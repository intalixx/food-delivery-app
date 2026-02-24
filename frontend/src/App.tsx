import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Navbar from './components/shared/Navbar'

function App() {
  return (
    <div className="relative min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<div className="p-8 text-center pt-20 text-2xl font-bold dark:text-white">Cart Page Coming Soon</div>} />
        <Route path="/profile" element={<div className="p-8 text-center pt-20 text-2xl font-bold dark:text-white">Profile Page Coming Soon</div>} />
      </Routes>
      <Navbar />
    </div>
  )
}

export default App
