import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./Components/navbar";
import Landing from "./Components/Landing";
import GetStarted from "./Components/GetStarted";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";

const App = () => {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  }, []);

  return (
    <Router>
      <Routes>
        
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-neutral-50 text-neutral-900 transition-colors duration-500 font-sans relative overflow-hidden">
             
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-70">
                <div className="absolute  transition-opacity duration-500" />
              </div>

              <Navbar />
              
              <main className="relative z-10">
                <Landing />
              </main>
            </div>
          }
        />

        
        <Route
          path="/get-started"
          element={
            <GetStarted />
          }
        />
        <Route
          path="/login"
          element={
            <Login />
          }
        />
       
        <Route
          path="/dashboard"
          element={
            <Dashboard />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;