import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import CartPage from '@/pages/CartPage'
import ProfilePage from '@/pages/ProfilePage'
import Navbar from '@/components/shared/Navbar'
import { Toaster } from 'sonner'

function App() {
  return (
    <div className="relative min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      <Toaster position="top-center" richColors />
      <Navbar />
    </div>
  )
}

export default App
