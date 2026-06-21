import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

export default function GetStarted() {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), 
      });

      const data = await response.json();

      if (!response.ok) {
        
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

     
      console.log('Registered:', data);

     
      navigate('/dashboard');

    } catch (err) {
      
      setError('Could not connect to server. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 transition-colors duration-500 font-sans relative flex items-center justify-center p-6 overflow-hidden">


      <div className="absolute top-12 left-12 text-[9vw] font-extrabold tracking-widest select-none pointer-events-none text-gray-200 font-heading animate-fade-in opacity-60">
        THINK
      </div>
      <div className="absolute bottom-12 right-12 text-[9vw] font-extrabold tracking-widest select-none pointer-events-none text-gray-200 font-heading animate-fade-in opacity-80" style={{ animationDelay: '0.2s' }}>
        CREATE
      </div>


      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-3xl pointer-events-none animate-glow" />
      <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-3xl pointer-events-none animate-glow" style={{ animationDelay: '-5s' }} />


      <header className="absolute top-0 left-0 w-full px-6 sm:px-8 h-20 flex justify-between items-center z-20">
        <div className="flex-1" />


        
        


        <div className="flex-1 flex justify-end" />
      </header>


      <div className="relative z-10 w-full max-w-[420px] bg-white/70 border 0 p-8 rounded-2xl shadow-xl animate-slide-up">


        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Welcome
          </h2>
          <p className="text-xs text-neutral-500 mt-1.5 font-normal">
            Refined space for your brilliant thoughts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {error && (
            <p className="text-red-500 text-xs text-center mb-2">{error}</p>
          )}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="bg-neutral-100/50 border border-neutral-200/80 rounded-lg px-3.5 py-2.5 w-full text-sm placeholder:text-neutral-400 focus:outline-none transition-all duration-200 text-neutral-900"
            />
          </div>


          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="example@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="bg-neutral-100/50 border border-neutral-200/80 rounded-lg px-3.5 py-2.5 w-full text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all duration-200 text-neutral-900"
            />
          </div>


          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Password
              </label>

            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="bg-neutral-100/50 border border-neutral-200/80 rounded-lg px-3.5 py-2.5 w-full text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all duration-200 text-neutral-900 pr-10"
              />


              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-6 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-all duration-300 text-sm hover:scale-[1.01] active:scale-[0.99] hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>


        <div className="text-xs text-neutral-500 mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-neutral-800 hover:underline">
            Sign In
          </Link>
        </div>




      

      </div>
    </div>
  );
}
