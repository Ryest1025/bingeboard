import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function SuggestionCard({
  title,
  description,
  icon,
  gradient,
  details,
  button,
  highlightInfo
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  details: string[];
  button: { label: string; icon: React.ReactNode; onClick: () => void };
  highlightInfo?: { text: string; icon: React.ReactNode; color: string };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${gradient} backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 cursor-pointer`}
      onClick={button.onClick}
    >
      <div className="text-center">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-to-br flex items-center justify-center">
          {icon}
        </div>

        <h3 className="font-medium text-white mb-1">{title}</h3>
        <p className="text-gray-300 text-sm mb-3">{description}</p>

        <div className="flex justify-center gap-4 text-xs text-gray-400 mb-4">
          {details.map((detail, i) => <span key={i}>{detail}</span>)}
        </div>

        {highlightInfo && (
          <div className={`${highlightInfo.color} rounded-lg p-2 mb-4`}>
            <p className="text-xs flex items-center justify-center">
              {highlightInfo.icon}
              {highlightInfo.text}
            </p>
          </div>
        )}

        <Button size="sm" className="w-full">
          {button.icon}
          {button.label}
        </Button>
      </div>
    </motion.div>
  );
}
