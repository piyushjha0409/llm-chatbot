import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'

import './App.css'
import Landingpage from './components/Landingpage'
import Signin from './components/Signin'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'

function App() {
  const [userId, setUserId] = useState<string | null>(localStorage.getItem("userId"));

  useEffect(() => {
    const handleStorageChange = () => {
      setUserId(localStorage.getItem("userId"));
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [])

  return (
    <>
      <Router>
        <Routes>
          <Route path="/demo" element={<Dashboard />} />
          {
            !userId && (
              <>
                <Route path="/" element={<Landingpage />} />
                <Route path="/sign-in" element={<Signin />} />
                <Route path="/register" element={<Signup />} />
              </>
            )
          }
        </Routes>
      </Router>
    </>
  )
}

export default App
