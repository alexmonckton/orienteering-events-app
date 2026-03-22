import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'

import Button from './components/button'
import Navigation from './components/navigation'
import Home from './views/home'
import { Box } from '@mui/material'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Navigation>
        <Box sx={{ paddingBottom: { xs: "56px", md: 0 } }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<div>About Page</div>} />
          <Route path="/contact" element={<div>Contact Page</div>} />
        </Routes>
      </Box>
      </Navigation>
    </BrowserRouter>
  )
}

export default App
