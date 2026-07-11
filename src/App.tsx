import { Routes, Route } from 'react-router-dom'
import { useTokens } from './hooks/useTokens'
import Home from './pages/Home'
import DesignSystem from './pages/DesignSystem'
import Clarisa from './pages/Clarisa'

export default function App() {
  // Applies any saved design tokens (from the design-system page) on load.
  useTokens()

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/design-system" element={<DesignSystem />} />
      <Route path="/clarisa" element={<Clarisa />} />
    </Routes>
  )
}
