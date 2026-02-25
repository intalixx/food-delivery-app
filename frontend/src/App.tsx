import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import CartPage from '@/pages/CartPage'
import Navbar from '@/components/shared/Navbar'
import { Toaster } from 'sonner'

function App() {
  return (
    <div className="relative min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/profile" element={<div className="p-8 text-center pt-20 text-2xl font-bold dark:text-white">Profile Page Coming Soon</div>} />
      </Routes>
      <Toaster position="top-center" richColors />
      <Navbar />
    </div>
  )
}

export default App
