import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import CartPage from '@/pages/CartPage'
import ProfilePage from '@/pages/ProfilePage'
import MyOrdersPage from '@/pages/MyOrdersPage'
import Navbar from '@/components/shared/Navbar'
import { Toaster } from 'sonner'

function App() {
  return (
    <div className="relative min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/orders" element={<MyOrdersPage />} />
      </Routes>
      <Toaster position="top-center" richColors />
      <Navbar />
    </div>
  )
}

export default App
