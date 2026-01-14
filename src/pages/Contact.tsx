import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { motion } from "framer-motion";

export default function Contact() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    console.log("[Contact] mounted");
    return () => console.log("[Contact] unmounted");
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSent(true);
    setTimeout(() => setSent(false), 1800);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-2xl font-bold text-white mb-4">Contact Support</h2>
      <form onSubmit={onSubmit} className="bg-white/5 p-6 rounded-xl space-y-4">
        <textarea className="w-full p-3 rounded-md bg-white/10 text-white" value={message} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)} rows={5} />
        <div>
          <button className="px-4 py-2 rounded-md bg-linear-to-r from-blue-600 to-purple-600">Send</button>
        </div>
      </form>
      {sent && <div className="mt-4 text-green-400">Message sent.</div>}
    </motion.div>
  );
}
