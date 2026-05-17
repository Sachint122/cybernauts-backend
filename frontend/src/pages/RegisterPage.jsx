import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApi, useToggle } from "devil-frontend";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    hobbies: [],
  });
  const [availableHobbies, setAvailableHobbies] = useState([]);
  const [loading, setLoading] = useState(false);
  const { state: showPassword, toggle: togglePassword } = useToggle(false);
  const { register } = useAuth();
  const { get } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHobbies = async () => {
      try {
        const response = await get("/hobbies?limit=100");
        setAvailableHobbies(response.data.hobbies || []);
      } catch (err) {
        console.error("Failed to fetch hobbies", err);
      }
    };
    fetchHobbies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.hobbies.length === 0) {
      toast.error("Please select at least one hobby");
      return;
    }

    setLoading(true);
    const success = await register(formData);
    setLoading(false);
    if (success) navigate("/");
  };


  const toggleHobby = (hobbyId) => {
    setFormData(prev => {
      const exists = prev.hobbies.includes(hobbyId);
      if (exists) {
        return { ...prev, hobbies: prev.hobbies.filter(h => h !== hobbyId) };
      } else {
        return { ...prev, hobbies: [...prev.hobbies, hobbyId] };
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 py-2">
      <div className="max-w-md w-full space-y-8 p-10 bg-[#141414] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white">
            Join <span className="text-blue-500">Cybernauts</span>
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Create an account to explore connections
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Full Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-4 py-3 bg-[#0d0d0d] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Email Address</label>
              <input
                type="email"
                required
                className="mt-1 block w-full px-4 py-3 bg-[#0d0d0d] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Select Hobbies</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 bg-[#0d0d0d] border border-white/10 rounded-xl custom-scrollbar">
                {availableHobbies.map((hobby) => (
                  <button
                    key={hobby.id}
                    type="button"
                    onClick={() => toggleHobby(hobby.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${formData.hobbies.includes(hobby.id)
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20"
                        : "bg-white/5 border-white/5 text-gray-400 hover:border-white/10 hover:bg-white/10"
                      }`}
                  >
                    {hobby.name}
                  </button>
                ))}

                {availableHobbies.length === 0 && (
                  <p className="text-xs text-gray-500 italic">No hobbies found...</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="mt-1 block w-full px-4 py-3 bg-[#0d0d0d] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-blue-500 hover:text-blue-400">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;

