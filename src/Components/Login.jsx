import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { VITE_API_URL } from '../config';

export default function Login() {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid credentials. Please try again.');
        return;
      }

      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      console.log('Logged in successfully:', data.user);
      
      
      navigate('/dashboard');
    } catch (err) {
      setError('Could not connect to server. Please ensure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#030303] text-neutral-900 dark:text-neutral-100 transition-colors duration-500 font-sans relative flex flex-col justify-between overflow-hidden">
      
      
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/5 blur-3xl pointer-events-none animate-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/5 dark:bg-purple-500/5 blur-3xl pointer-events-none animate-glow" style={{ animationDelay: '-5s' }} />

      
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 md:px-16 lg:px-24 py-12 relative z-10">
        
        <div className="w-full max-w-[440px] flex flex-col">
          
          
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white font-heading mb-8 leading-tight text-center">
            Welcome back to your<br />workspace.
          </h1>

          
          <div className="w-full bg-white/80 dark:bg-[#0d0d0d]/80 backdrop-blur-xl border border-neutral-250 dark:border-neutral-900 p-8 rounded-2xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-slide-up">
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-xs px-4 py-2.5 rounded-lg text-center font-medium">
                  {error}
                </div>
              )}

             
              <div>
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 block">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="bg-neutral-50/50 dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-3 w-full text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all duration-200 text-neutral-900 dark:text-white"
                />
              </div>

              
              <div>
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 block">
                  Password
                </label>
                
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="bg-neutral-50/50 dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-3 w-full text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all duration-200 text-neutral-900 dark:text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors duration-200 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </div>

              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-neutral-900 text-white dark:bg-white dark:text-black rounded-lg font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-300 text-sm hover:scale-[1.01] active:scale-[0.99] hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>

          
          <div className="text-sm text-neutral-500 mt-6 text-center">
            Don't have an account?{' '}
            <Link 
              to="/get-started" 
              className="font-semibold text-indigo-650 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline transition-colors"
            >
              Sign up for free
            </Link>
          </div>

        </div>

      </div>

      

    </div>
  );
}
