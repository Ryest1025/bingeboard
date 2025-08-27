import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, MessageCircle } from "lucide-react";
import type { Friend } from "@/types/social";

export function FriendCard({ friend }: { friend: Friend }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
    >
      <div className="text-center">
        <Avatar className="h-16 w-16 mx-auto mb-4 border-2 border-purple-500/50">
          <AvatarImage src={friend.avatar} alt={friend.name} />
          <AvatarFallback className="bg-purple-600 text-white">
            {friend.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>

        <h3 className="font-medium text-white mb-1">{friend.name}</h3>
        <p className="text-gray-400 text-sm mb-3">{friend.username}</p>

        <div className="flex justify-center gap-4 text-xs text-gray-500 mb-4">
          <span>{friend.mutualFriends} mutual friends</span>
          <span>{friend.commonShows} common shows</span>
        </div>

        {friend.recentActivity && (
          <p className="text-gray-400 text-sm mb-4 bg-gray-700/30 rounded-lg p-2">
            <Eye className="h-3 w-3 inline mr-1" />
            {friend.recentActivity}
          </p>
        )}

        <Button variant="outline" size="sm" className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20">
          <MessageCircle className="h-4 w-4 mr-2" />
          Message
        </Button>
      </div>
    </motion.div>
  );
}
