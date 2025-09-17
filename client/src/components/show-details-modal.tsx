import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Info, Youtube } from "lucide-react";
import DetailsTab from "./details-tab";
import TrailerTab from "./trailer-tab";
import { useAuth } from "@/hooks/useAuth";
import { getShowId } from "@/utils/show-utils";
import type { Show } from "@/lib/utils";

interface ShowDetailsModalProps {
  show: Show | null;
  open: boolean;
  onClose: () => void;
  onAddToList?: (show: Show) => void;
  onWatchNow?: (show: Show) => void;
  onWatchTrailer?: (show: Show) => void;
}

export default function ShowDetailsModal({
  show,
  open,
  onClose,
  onAddToList,
  onWatchNow,
  onWatchTrailer
}: ShowDetailsModalProps) {
  // All hooks must be called at the top level, before any conditional returns
  const [activeTab, setActiveTab] = useState<'details' | 'trailer'>('details');
  const { user } = useAuth();

  // Early return after all hooks are called
  if (!show) return null;

  const showId = getShowId(show);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-slate-900 text-white border border-slate-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">
              {show.title || show.name}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose} 
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg w-fit">
            <Button
              variant={activeTab === 'details' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('details')}
              className={activeTab === 'details'
                ? "bg-slate-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-slate-700"
              }
            >
              <Info className="w-4 h-4 mr-2" />
              Details
            </Button>
            <Button
              variant={activeTab === 'trailer' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('trailer')}
              className={activeTab === 'trailer'
                ? "bg-slate-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-slate-700"
              }
            >
              <Youtube className="w-4 h-4 mr-2" />
              Trailer
            </Button>
          </div>
        </DialogHeader>

        {activeTab === 'details' ? (
          <DetailsTab 
            show={show} 
            onWatchNow={onWatchNow} 
            onAddToList={onAddToList} 
            onWatchTrailer={() => setActiveTab('trailer')}
          />
        ) : (
          <TrailerTab 
            show={show} 
            user={user} 
            onWatchNow={onWatchNow} 
            onAddToList={onAddToList}
            onBackToDetails={() => setActiveTab('details')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
