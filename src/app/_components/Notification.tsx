import { motion } from "framer-motion";

interface NotificationProps {
  message: string | null;
}

export default function Notification({ message }: NotificationProps) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-6 py-3 rounded-full"
    >
      {message}
    </motion.div>
  );
}
