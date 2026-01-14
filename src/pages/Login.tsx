import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    // 🔐 SIMULATE LOGIN
    setTimeout(() => {
      // ✅ THIS LINE FIXES EVERYTHING
      localStorage.setItem("token", "fake-jwt-token");

      setLoading(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        navigate("/dashboard", { replace: true });
      }, 2000);
    }, 2000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: `linear-gradient(135deg, oklch(12.9% 0.042 264.695), oklch(13% 0.028 261.692))`,
      }}
    >
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold text-center text-white">
          Welcome Back
        </h2>

        {/* Email */}
        <div>
          <label className="block text-white mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-white/20 text-white"
          />
          {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-white mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white/20 text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-gray-200"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-sm">{errors.password}</p>
          )}
        </div>

        <p
          onClick={() => navigate("/forgot-password")}
          className="text-gray-300 text-sm text-right cursor-pointer"
        >
          Forgot Password?
        </p>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-md font-semibold text-white bg-white/20"
          whileTap={{ scale: 0.96 }}
        >
          {loading ? "Processing..." : "Login"}
        </motion.button>
      </motion.form>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div className="fixed inset-0 bg-black/70 flex items-center justify-center">
            <p className="text-white">Logging in...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div className="fixed inset-0 bg-black/70 flex items-center justify-center">
            <p className="text-white">✅ Login Successful</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


