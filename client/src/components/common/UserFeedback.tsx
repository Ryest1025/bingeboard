import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Heart, 
  Star, 
  MessageSquare,
  Send,
  X,
  BookmarkPlus,
  Eye,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserFeedbackProps {
  contentId: number;
  contentType: 'movie' | 'tv';
  contentTitle: string;
  onClose?: () => void;
  initialRating?: number;
}

interface FeedbackData {
  rating: number;
  feedback_type: 'like' | 'dislike' | 'love' | 'recommend' | 'not_interested';
  comment?: string;
  watch_status: 'want_to_watch' | 'watching' | 'completed' | 'dropped' | 'on_hold';
  tags: string[];
}

export default function UserFeedback({ 
  contentId, 
  contentType, 
  contentTitle, 
  onClose,
  initialRating = 0 
}: UserFeedbackProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [feedback, setFeedback] = useState<FeedbackData>({
    rating: initialRating,
    feedback_type: 'like',
    comment: '',
    watch_status: 'want_to_watch',
    tags: []
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: FeedbackData) => {
      const response = await fetch('/api/user-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'user-id', // Replace with actual user ID
          content_id: contentId,
          content_type: contentType,
          ...feedbackData
        })
      });
      if (!response.ok) throw new Error('Failed to submit feedback');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-feedback'] });
      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback!'
      });
      if (onClose) onClose();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive'
      });
    }
  });

  const quickActions = [
    { type: 'like' as const, icon: ThumbsUp, label: 'Like', color: 'text-green-500' },
    { type: 'dislike' as const, icon: ThumbsDown, label: 'Dislike', color: 'text-red-500' },
    { type: 'love' as const, icon: Heart, label: 'Love', color: 'text-pink-500' },
    { type: 'recommend' as const, icon: Star, label: 'Recommend', color: 'text-yellow-500' },
    { type: 'not_interested' as const, icon: X, label: 'Not Interested', color: 'text-gray-500' }
  ];

  const watchStatusOptions = [
    { value: 'want_to_watch', label: 'Want to Watch', icon: BookmarkPlus },
    { value: 'watching', label: 'Currently Watching', icon: Eye },
    { value: 'completed', label: 'Completed', icon: Star },
    { value: 'dropped', label: 'Dropped', icon: X },
    { value: 'on_hold', label: 'On Hold', icon: Clock }
  ];

  const tagOptions = [
    'Binge-worthy', 'Great Acting', 'Amazing Visuals', 'Good Plot', 'Funny',
    'Emotional', 'Mind-bending', 'Action-packed', 'Romantic', 'Scary',
    'Educational', 'Family-friendly', 'Nostalgic', 'Unique Style', 'Great Soundtrack'
  ];

  const handleTagToggle = (tag: string) => {
    setFeedback(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleQuickFeedback = (type: FeedbackData['feedback_type']) => {
    const updatedFeedback = { ...feedback, feedback_type: type };
    setFeedback(updatedFeedback);
    
    if (!isExpanded) {
      // Submit quick feedback immediately
      submitFeedbackMutation.mutate(updatedFeedback);
    }
  };

  const handleDetailedSubmit = () => {
    submitFeedbackMutation.mutate(feedback);
  };

  if (!isExpanded) {
    return (
      <Card className="glass-effect border-white/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Rate "{contentTitle}"</h3>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="flex justify-center gap-2 mb-4">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <Button
                key={action.type}
                variant={feedback.feedback_type === action.type ? "default" : "outline"}
                size="sm"
                className={`${action.color} ${feedback.feedback_type === action.type ? 'bg-primary' : ''}`}
                onClick={() => handleQuickFeedback(action.type)}
                disabled={submitFeedbackMutation.isPending}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>

        <div className="text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(true)}
            className="text-xs text-gray-400 hover:text-gray-200"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Add detailed feedback
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-white/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Feedback for "{contentTitle}"</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Rating */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Rating ({feedback.rating}/10)
            </Label>
            <div className="px-3">
              <Slider
                value={[feedback.rating]}
                min={0}
                max={10}
                step={0.5}
                onValueChange={([rating]) => {
                  setFeedback(prev => ({ ...prev, rating }));
                }}
                className="w-full"
              />
            </div>
          </div>

          {/* Feedback Type */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Overall Feeling</Label>
            <div className="flex flex-wrap gap-2">
              {quickActions.map(action => {
                const Icon = action.icon;
                return (
                  <Badge
                    key={action.type}
                    variant={feedback.feedback_type === action.type ? "default" : "outline"}
                    className={`cursor-pointer hover:opacity-80 transition-opacity ${action.color}`}
                    onClick={() => setFeedback(prev => ({ ...prev, feedback_type: action.type }))}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {action.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Watch Status */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Watch Status</Label>
            <RadioGroup 
              value={feedback.watch_status} 
              onValueChange={(value) => setFeedback(prev => ({ ...prev, watch_status: value as any }))}
            >
              <div className="grid grid-cols-2 gap-3">
                {watchStatusOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label 
                        htmlFor={option.value} 
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Tags (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map(tag => (
                <Badge
                  key={tag}
                  variant={feedback.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Comments (optional)</Label>
            <Textarea
              placeholder="Share your thoughts about this content..."
              value={feedback.comment}
              onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-700">
            <Button 
              variant="outline" 
              onClick={() => setIsExpanded(false)}
            >
              Quick Mode
            </Button>
            <Button 
              onClick={handleDetailedSubmit}
              disabled={submitFeedbackMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Feedback
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick feedback hook for use in recommendation cards
export function useQuickFeedback() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitQuickFeedback = useMutation({
    mutationFn: async ({
      contentId,
      contentType,
      feedbackType,
      rating = 7
    }: {
      contentId: number;
      contentType: 'movie' | 'tv';
      feedbackType: FeedbackData['feedback_type'];
      rating?: number;
    }) => {
      const response = await fetch('/api/user-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'user-id', // Replace with actual user ID
          content_id: contentId,
          content_type: contentType,
          rating,
          feedback_type: feedbackType,
          watch_status: 'want_to_watch',
          tags: []
        })
      });
      if (!response.ok) throw new Error('Failed to submit feedback');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-feedback'] });
      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback!',
        duration: 2000
      });
    }
  });

  return {
    submitQuickFeedback: submitQuickFeedback.mutate,
    isSubmitting: submitQuickFeedback.isPending
  };
}
