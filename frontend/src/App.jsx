import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Container } from '@mui/material'
import Navigation from './components/Navigation'
import UrlShortener from './pages/UrlShortener'
import UrlStatistics from './pages/UrlStatistics'

function App() {
  return (
    <Router>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<UrlShortener />} />
          <Route path="/stats" element={<UrlStatistics />} />
        </Routes>
      </Container>
    </Router>
  )
}

export default App