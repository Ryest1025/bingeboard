import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Smile } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EmojiReaction {
  emoji: string;
  count: number;
  users: string[];
  youReacted: boolean;
}

interface EmojiReactionBarProps {
  reactions: EmojiReaction[];
  onReact: (emoji: string) => void;
  compact?: boolean;
}

const QUICK_EMOJIS = [
  '🔥', '💯', '😍', '😱', '🤯', '😭', '💀', '🎯',
  '⭐', '👏', '❤️', '🙌', '😂', '🤔', '👀', '🚀'
];

export function EmojiReactionBar({ reactions, onReact, compact = false }: EmojiReactionBarProps) {
  const [showAll, setShowAll] = useState(false);
  const displayReactions = showAll ? reactions : reactions.slice(0, 5);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Existing Reactions */}
      {displayReactions.map((reaction, idx) => (
        <motion.button
          key={reaction.emoji}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ delay: idx * 0.05 }}
          onClick={() => onReact(reaction.emoji)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full
            ${reaction.youReacted 
              ? 'bg-cyan-500/20 border-2 border-cyan-500/50 text-cyan-400' 
              : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800'
            }
            transition-all group
          `}
        >
          <span className="text-base group-hover:scale-125 transition-transform">
            {reaction.emoji}
          </span>
          <span className={`text-sm font-medium ${reaction.youReacted ? 'text-cyan-400' : 'text-slate-400'}`}>
            {reaction.count}
          </span>
        </motion.button>
      ))}

      {/* Show More Button */}
      {!showAll && reactions.length > 5 && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowAll(true)}
          className="h-8 px-2 text-slate-400 hover:text-white"
        >
          +{reactions.length - 5}
        </Button>
      )}

      {/* Add Reaction Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800/30 border border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
          >
            <Smile className="h-4 w-4" />
            {!compact && <span className="text-sm">React</span>}
          </motion.button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-64 p-2 bg-slate-900 border-slate-800"
          align="start"
        >
          <div className="grid grid-cols-8 gap-1">
            {QUICK_EMOJIS.map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onReact(emoji)}
                className="text-2xl p-2 rounded hover:bg-slate-800 transition-colors"
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Compact version for cards
export function EmojiReactionCompact({ reactions, onReact }: EmojiReactionBarProps) {
  return (
    <div className="flex items-center gap-1.5">
      {reactions.slice(0, 3).map((reaction) => (
        <motion.button
          key={reaction.emoji}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onReact(reaction.emoji)}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-full text-xs
            ${reaction.youReacted 
              ? 'bg-cyan-500/20 text-cyan-400' 
              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
            }
          `}
        >
          <span>{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </motion.button>
      ))}
      
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <Plus className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-48 p-2 bg-slate-900 border-slate-800"
          align="start"
        >
          <div className="grid grid-cols-6 gap-1">
            {QUICK_EMOJIS.slice(0, 12).map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReact(emoji)}
                className="text-xl p-1 rounded hover:bg-slate-800"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
