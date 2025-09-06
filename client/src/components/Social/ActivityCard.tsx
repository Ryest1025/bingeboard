import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Play } from "lucide-react";

import type { Activity } from "@/types/social";

export const activityTypeLabel = (type: Activity["type"]) => {
  switch (type) {
    case "watched": return "Watched";
    case "rated": return "Rated";
    case "added_to_list": return "Added to List";
    case "liked": return "Liked";
    case "shared": return "Shared";
    default: return type;
  }
};

export function ActivityCard({
  activity,
  isLiked,
  onToggleLike
}: {
  activity: Activity;
  isLiked: boolean;
  onToggleLike: (id: string) => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 border-2 border-gray-600">
          <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
          <AvatarFallback className="bg-gray-700 text-white">
            {activity.user.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-white">{activity.user.name}</span>
            <span className="text-gray-400 text-sm">{activity.user.username}</span>
            <Badge variant="secondary" className="bg-gray-700/50 text-gray-300 text-xs">
              {activityTypeLabel(activity.type)}
            </Badge>
            <span className="text-gray-500 text-sm ml-auto">{activity.timestamp}</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={`https://image.tmdb.org/t/p/w200${activity.content.poster_path}`}
                alt={activity.content.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <h3 className="font-medium text-white mb-1">{activity.content.title}</h3>
              <p className="text-gray-400 text-sm mb-3">
                {activity.type === "watched" && "Just finished watching this"}
                {activity.type === "rated" && `Rated ${activity.content.rating} stars`}
                {activity.type === "added_to_list" && "Added to watchlist"}
              </p>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-gray-400 hover:text-red-400 ${isLiked ? "text-red-400" : ""}`}
                  onClick={() => onToggleLike(activity.id)}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                  {activity.likes + (isLiked ? 1 : 0)}
                </Button>

                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {activity.comments || 0}
                </Button>

                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-400">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>

                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 ml-auto">
                  <Play className="h-4 w-4 mr-2" />
                  Watch
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
