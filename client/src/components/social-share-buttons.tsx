import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Share2, 
  Facebook, 
  MessageCircle, 
  Send, 
  Copy,
  X,
  Heart,
  ExternalLink
} from "lucide-react";
import {
  SiX,
  SiTelegram,
  SiWhatsapp,
  SiReddit,
  SiDiscord
} from "react-icons/si";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SocialShareButtonsProps {
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  type?: 'show' | 'watchlist' | 'recommendation' | 'activity';
  compact?: boolean;
}

export default function SocialShareButtons({
  title,
  description = "",
  url,
  imageUrl,
  type = 'show',
  compact = false
}: SocialShareButtonsProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Generate share URL and text based on context
  const shareUrl = url || window.location.href;
  const shareText = getShareText(type, title, description);
  const hashtags = "#BingeBoard #TVShows #Streaming";

  function getShareText(type: string, title: string, description: string): string {
    switch (type) {
      case 'show':
        return `Check out "${title}" on BingeBoard! ${description}`;
      case 'watchlist':
        return `I'm tracking "${title}" on my BingeBoard watchlist! Join me and discover your next binge.`;
      case 'recommendation':
        return `BingeBoard recommended "${title}" and it's perfect! Get personalized recommendations too.`;
      case 'activity':
        return `Just updated my progress on "${title}" - loving this show! Track yours on BingeBoard.`;
      default:
        return `Discovered "${title}" on BingeBoard - the smart way to track TV shows!`;
    }
  }

  const sharePlatforms = [
    {
      name: 'Twitter',
      icon: SiX,
      color: 'text-blue-500 hover:text-blue-600',
      action: () => shareToTwitter(shareText, shareUrl, hashtags)
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600 hover:text-blue-700',
      action: () => shareToFacebook(shareUrl, title, description)
    },
    {
      name: 'WhatsApp',
      icon: SiWhatsapp,
      color: 'text-green-500 hover:text-green-600',
      action: () => shareToWhatsApp(shareText, shareUrl)
    },
    {
      name: 'Telegram',
      icon: SiTelegram,
      color: 'text-blue-400 hover:text-blue-500',
      action: () => shareToTelegram(shareText, shareUrl)
    },
    {
      name: 'Reddit',
      icon: SiReddit,
      color: 'text-orange-500 hover:text-orange-600',
      action: () => shareToReddit(title, shareUrl, description)
    },
    {
      name: 'Discord',
      icon: SiDiscord,
      color: 'text-indigo-500 hover:text-indigo-600',
      action: () => shareToDiscord(shareText, shareUrl)
    }
  ];

  function shareToTwitter(text: string, url: string, hashtags: string) {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags.replace('#', ''))}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  }

  function shareToFacebook(url: string, title: string, description: string) {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`${title} - ${description}`)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  }

  function shareToWhatsApp(text: string, url: string) {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`;
    window.open(whatsappUrl, '_blank');
  }

  function shareToTelegram(text: string, url: string) {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank');
  }

  function shareToReddit(title: string, url: string, description: string) {
    const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&text=${encodeURIComponent(description)}`;
    window.open(redditUrl, '_blank');
  }

  function shareToDiscord(text: string, url: string) {
    // Discord doesn't have direct sharing URL, so copy to clipboard
    copyToClipboard(`${text} ${url}`);
    toast({
      title: "Copied for Discord",
      description: "Link copied to clipboard - paste it in your Discord chat!",
    });
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Link Copied",
        description: "Share link copied to clipboard!",
      });
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function useNativeShare() {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Native share failed:', err);
      }
    }
  }

  if (compact) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Share2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Native share if available */}
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <>
              <DropdownMenuItem onClick={useNativeShare}>
                <Send className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* Platform-specific shares */}
          {sharePlatforms.slice(0, 4).map((platform) => (
            <DropdownMenuItem key={platform.name} onClick={platform.action}>
              <platform.icon className={`mr-2 h-4 w-4 ${platform.color}`} />
              {platform.name}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => copyToClipboard(`${shareText} ${shareUrl}`)}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share this {type}
          </h4>
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <Button variant="outline" size="sm" onClick={useNativeShare}>
              <Send className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {sharePlatforms.map((platform) => (
            <Button
              key={platform.name}
              variant="outline"
              size="sm"
              onClick={platform.action}
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <platform.icon className={`h-5 w-5 ${platform.color}`} />
              <span className="text-xs">{platform.name}</span>
            </Button>
          ))}
        </div>
        
        <div className="mt-3 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(`${shareText} ${shareUrl}`)}
            className="w-full justify-start text-muted-foreground"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy share link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}