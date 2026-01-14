import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const validateEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setShowModal(true);

    // Simulate backend request and redirect after 3 seconds
    setTimeout(() => {
      setShowModal(false);
      navigate("/login");
    }, 3000);
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
        className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-xl w-full max-w-md text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          Forgot Password
        </h2>
        <p className="text-gray-200 text-sm mb-6">
          Enter your registered email address and we’ll send you instructions to
          reset your password.
        </p>

        <div className="text-left mb-4">
          <label className="block text-white mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="Enter your email"
          />
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>

        <motion.button
          type="submit"
          className="w-full py-2 mt-3 rounded-md font-semibold text-white bg-white/20 hover:bg-white/30 transition-all"
          whileTap={{ scale: 0.95 }}
        >
          Send Reset Link
        </motion.button>

        <p className="text-gray-300 text-sm mt-4">
          Remember your password?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-white underline cursor-pointer"
          >
            Login here
          </span>
        </p>
      </motion.form>

      {/* ✅ Animated Modal Popup */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl shadow-2xl text-center text-white w-[90%] max-w-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-bold mb-2">✅ Email Sent!</h3>
              <p className="text-gray-200 text-sm">
                Please check your inbox for password reset instructions.
              </p>
              <p className="mt-2 text-sm text-gray-300">
                Redirecting to login...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
