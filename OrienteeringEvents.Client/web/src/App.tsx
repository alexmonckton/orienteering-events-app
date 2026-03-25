import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'

import Button from './components/button'
import Navigation from './components/navigation'
import HomeView from './views/HomeView'
import MapView from './views/MapView'
import { Box } from '@mui/material'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Navigation>
        <Box sx={{ paddingBottom: { xs: "56px", md: 0 } }}>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/contact" element={<div>Contact Page</div>} />
          </Routes>
        </Box>
      </Navigation>
    </BrowserRouter>
  )
}

export default App
