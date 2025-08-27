import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Share2, 
  Copy, 
  MessageCircle, 
  Mail, 
  ExternalLink,
  QrCode 
} from "lucide-react";
import {
  SiFacebook,
  SiWhatsapp,
  SiTelegram,
  SiReddit,
  SiX
} from "react-icons/si";

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  type: "show" | "watchlist" | "recommendation" | "profile";
  size?: "sm" | "default" | "lg";
  variant?: "default" | "secondary" | "outline" | "ghost";
}

export default function ShareButton({
  title,
  description = "",
  url,
  imageUrl,
  type,
  size = "default",
  variant = "outline"
}: ShareButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Generate the sharing URL
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled sharing or error occurred
      }
    } else {
      // Fallback to copy to clipboard
      copyToClipboard();
    }
  };

  const openSocialShare = (platform: string) => {
    let shareLink = "";
    
    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case "telegram":
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case "reddit":
        shareLink = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
        break;
      case "email":
        shareLink = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, "_blank", "width=600,height=400");
    }
  };

  const generateQRCode = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
  };

  const getShareText = () => {
    switch (type) {
      case "show":
        return `Check out "${title}" on BingeBoard!`;
      case "watchlist":
        return `See my watchlist on BingeBoard`;
      case "recommendation":
        return `I recommend "${title}" - check it out on BingeBoard!`;
      case "profile":
        return `Follow me on BingeBoard to see what I'm watching`;
      default:
        return `Check this out on BingeBoard!`;
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={shareViaWebShare}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Share via device
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-2" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            <MessageCircle className="w-4 h-4 mr-2" />
            More options
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share {type}</DialogTitle>
          <DialogDescription>
            {getShareText()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={copyToClipboard}
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={shareViaWebShare}
            >
              <ExternalLink className="w-4 h-4" />
              Share
            </Button>
          </div>

          {/* Social Media Platforms */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Share on social media
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => openSocialShare("facebook")}
              >
                <SiFacebook className="w-4 h-4 text-blue-600" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => openSocialShare("twitter")}
              >
                <SiX className="w-4 h-4 text-blue-400" />
                X (Twitter)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => openSocialShare("reddit")}
              >
                <SiReddit className="w-4 h-4 text-orange-500" />
                Reddit
              </Button>
            </div>
          </div>

          {/* Messaging Apps */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Share via messaging
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => openSocialShare("whatsapp")}
              >
                <SiWhatsapp className="w-4 h-4 text-green-500" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => openSocialShare("telegram")}
              >
                <SiTelegram className="w-4 h-4 text-blue-500" />
                Telegram
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => openSocialShare("email")}
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Share link
            </h4>
            <div className="flex gap-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              QR Code
            </h4>
            <div className="flex justify-center">
              <img
                src={generateQRCode()}
                alt="QR Code"
                className="w-32 h-32 border rounded-lg"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Scan with phone camera to open
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick share button for inline use
export function QuickShareButton({
  title,
  description,
  url,
  type,
  size = "sm"
}: Omit<ShareButtonProps, "variant">) {
  const { toast } = useToast();
  
  const shareUrl = url || window.location.href;

  const quickShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: shareUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Link copied!",
            description: "The link has been copied to your clipboard.",
          });
        } catch (clipboardError) {
          toast({
            title: "Share failed",
            description: "Unable to share or copy link.",
            variant: "destructive",
          });
        }
      }
    } else {
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "The link has been copied to your clipboard.",
        });
      } catch (error) {
        toast({
          title: "Copy failed",
          description: "Please copy the link manually.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={quickShare}
      className="gap-1 text-muted-foreground hover:text-foreground"
    >
      <Share2 className="w-3 h-3" />
    </Button>
  );
}