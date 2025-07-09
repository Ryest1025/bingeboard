import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Bell, 
  BellRing, 
  BellOff,
  Edit, 
  Trash2, 
  Clock,
  Search,
  Filter,
  Calendar,
  MoreVertical
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SearchAlert {
  id: number;
  name: string;
  searchQuery: string;
  genres: string[];
  networks: string[];
  yearFrom: number;
  yearTo: number;
  minRating: number;
  maxRating: number;
  contentRatings: string[];
  languages: string[];
  countries: string[];
  runtimeMin: number;
  runtimeMax: number;
  keywords: string[];
  withCompanies: string[];
  withPeople: string[];
  awards: string[];
  status: string;
  mediaType: string;
  includeAdult: boolean;
  trendingPeriod: string;
  sortBy: string;
  isActive: boolean;
  notificationFrequency: string;
  lastChecked: string;
  lastTriggered: string | null;
  resultsFound: number;
  createdAt: string;
}

const getFrequencyIcon = (frequency: string) => {
  switch (frequency) {
    case "immediate":
      return <BellRing className="h-4 w-4" />;
    case "daily":
      return <Calendar className="h-4 w-4" />;
    case "weekly":
      return <Clock className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getFrequencyLabel = (frequency: string) => {
  switch (frequency) {
    case "immediate":
      return "Immediate";
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    default:
      return "Unknown";
  }
};

const formatActiveFilters = (alert: SearchAlert) => {
  const filters = [];
  
  if (alert.searchQuery) filters.push(`"${alert.searchQuery}"`);
  if (alert.genres.length) filters.push(`${alert.genres.length} genres`);
  if (alert.networks.length) filters.push(`${alert.networks.length} networks`);
  if (alert.contentRatings.length) filters.push(`${alert.contentRatings.length} ratings`);
  if (alert.yearFrom !== 1950 || alert.yearTo !== new Date().getFullYear() + 2) {
    filters.push(`${alert.yearFrom}-${alert.yearTo}`);
  }
  if (alert.minRating > 0 || alert.maxRating < 10) {
    filters.push(`${alert.minRating}-${alert.maxRating} stars`);
  }
  if (alert.keywords.length) filters.push(`${alert.keywords.length} keywords`);
  if (alert.withPeople.length) filters.push(`${alert.withPeople.length} people`);
  if (alert.awards.length) filters.push(`${alert.awards.length} awards`);
  if (alert.status) filters.push(alert.status);
  if (alert.trendingPeriod) filters.push(`trending ${alert.trendingPeriod}`);
  
  return filters.length > 0 ? filters.slice(0, 3).join(", ") + (filters.length > 3 ? "..." : "") : "No specific filters";
};

export function SearchAlerts() {
  const [deleteAlertId, setDeleteAlertId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch search alerts
  const { 
    data: alerts = [], 
    isLoading 
  } = useQuery<SearchAlert[]>({
    queryKey: ["/api/search-alerts"],
    retry: false,
  });

  // Toggle alert active status
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      apiRequest("PATCH", `/api/search-alerts/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/search-alerts"] });
      toast({
        title: "Alert Updated",
        description: "Search alert status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Unable to update search alert. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete search alert
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/search-alerts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/search-alerts"] });
      toast({
        title: "Alert Deleted",
        description: "Search alert has been successfully deleted.",
      });
      setDeleteAlertId(null);
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Unable to delete search alert. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Test alert (trigger check manually)
  const testMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/search-alerts/${id}/test`),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/search-alerts"] });
      toast({
        title: "Alert Tested",
        description: `Found ${data.results || 0} new matches for your search criteria.`,
      });
    },
    onError: () => {
      toast({
        title: "Test Failed",
        description: "Unable to test search alert. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleAlert = (id: number, currentStatus: boolean) => {
    toggleMutation.mutate({ id, isActive: !currentStatus });
  };

  const handleDeleteAlert = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleTestAlert = (id: number) => {
    testMutation.mutate(id);
  };

  const formatLastChecked = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Bell className="h-5 w-5 animate-pulse" />
            Loading search alerts...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Search Alerts
              {alerts.length > 0 && (
                <Badge variant="secondary">{alerts.length} alerts</Badge>
              )}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {alerts.filter(alert => alert.isActive).length} active
            </div>
          </div>
        </CardHeader>
        
        {alerts.length === 0 ? (
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <BellOff className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">No search alerts</h3>
                <p className="text-muted-foreground">
                  Create search alerts to get notified when new content matches your criteria.
                </p>
              </div>
              <Button onClick={() => window.location.href = "/discover"}>
                <Search className="h-4 w-4 mr-2" />
                Create Your First Alert
              </Button>
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Card key={alert.id} className={`${!alert.isActive ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          {/* Alert Header */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {alert.isActive ? (
                                <BellRing className="h-4 w-4 text-green-500" />
                              ) : (
                                <BellOff className="h-4 w-4 text-muted-foreground" />
                              )}
                              <h3 className="font-semibold">{alert.name}</h3>
                            </div>
                            
                            <Badge 
                              variant={alert.isActive ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {alert.isActive ? "Active" : "Paused"}
                            </Badge>
                            
                            <Badge variant="outline" className="text-xs">
                              {getFrequencyIcon(alert.notificationFrequency)}
                              <span className="ml-1">{getFrequencyLabel(alert.notificationFrequency)}</span>
                            </Badge>
                          </div>

                          {/* Alert Criteria */}
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">
                              <Filter className="h-3 w-3 inline mr-1" />
                              {formatActiveFilters(alert)}
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Last checked: {formatLastChecked(alert.lastChecked)}</span>
                              {alert.lastTriggered && (
                                <span>Last triggered: {formatLastChecked(alert.lastTriggered)}</span>
                              )}
                              <span>{alert.resultsFound} results found</span>
                            </div>
                          </div>

                          {/* Alert Actions */}
                          <div className="flex items-center gap-2 pt-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={alert.isActive}
                                onCheckedChange={() => handleToggleAlert(alert.id, alert.isActive)}
                                disabled={toggleMutation.isPending}
                              />
                              <Label className="text-sm">
                                {alert.isActive ? "Active" : "Paused"}
                              </Label>
                            </div>
                            
                            <Separator orientation="vertical" className="h-4" />
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTestAlert(alert.id)}
                              disabled={testMutation.isPending}
                            >
                              <Search className="h-3 w-3 mr-2" />
                              Test
                            </Button>
                          </div>
                        </div>

                        {/* Alert Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              // TODO: Implement edit functionality
                              toast({
                                title: "Edit Alert",
                                description: "Edit functionality coming soon!",
                              });
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteAlertId(alert.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        )}
      </Card>

      {/* Alert Statistics */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alert Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {alerts.filter(alert => alert.isActive).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Alerts</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {alerts.reduce((sum, alert) => sum + alert.resultsFound, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Results Found</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {alerts.filter(alert => alert.lastTriggered).length}
                </div>
                <div className="text-sm text-muted-foreground">Alerts Triggered</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {alerts.filter(alert => 
                    alert.notificationFrequency === "immediate"
                  ).length}
                </div>
                <div className="text-sm text-muted-foreground">Immediate Alerts</div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="text-center text-sm text-muted-foreground">
              Search alerts run automatically based on your notification frequency settings. 
              You'll receive notifications when new content matches your saved search criteria.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteAlertId !== null} onOpenChange={() => setDeleteAlertId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Search Alert</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this search alert? This action cannot be undone and you will no longer receive notifications for this search criteria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAlertId && handleDeleteAlert(deleteAlertId)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Alert"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}