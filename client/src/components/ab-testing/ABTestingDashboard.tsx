import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Play, 
  Pause, 
  Plus,
  Eye,
  Activity,
  Award,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import ExperimentCreator from "./ExperimentCreator";
import ExperimentResults from "./ExperimentResults";
import { useToast } from "../../hooks/use-toast";

interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'completed' | 'paused';
  variants: Array<{
    id: string;
    name: string;
    allocation: number;
    users: number;
    conversions: number;
    conversionRate: number;
  }>;
  startDate: string;
  endDate?: string;
  totalUsers: number;
  confidence: number;
  winner?: string;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue?: number;
  };
}

export default function ABTestingDashboard() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/ab-testing/experiments');
      // const data = await response.json();
      
      // Mock data for now
      const mockExperiments: Experiment[] = [
        {
          id: 'rec-engine-test-001',
          name: 'ML Recommendation Engine A/B Test',
          description: 'Testing enhanced recommendation algorithm vs. standard algorithm',
          status: 'active',
          variants: [
            {
              id: 'control',
              name: 'Control (Standard)',
              allocation: 50,
              users: 1247,
              conversions: 529,
              conversionRate: 42.4
            },
            {
              id: 'treatment',
              name: 'Treatment (Enhanced ML)',
              allocation: 50,
              users: 1253,
              conversions: 668,
              conversionRate: 53.3
            }
          ],
          startDate: '2025-09-01',
          totalUsers: 2500,
          confidence: 95.7,
          winner: 'treatment',
          metrics: {
            impressions: 12450,
            clicks: 3200,
            conversions: 1197,
            revenue: 5985
          }
        },
        {
          id: 'ui-layout-test-002',
          name: 'Dashboard Layout Optimization',
          description: 'Testing new card layout vs. current list layout',
          status: 'active',
          variants: [
            {
              id: 'control',
              name: 'Current List Layout',
              allocation: 50,
              users: 892,
              conversions: 156,
              conversionRate: 17.5
            },
            {
              id: 'treatment',
              name: 'New Card Layout',
              allocation: 50,
              users: 908,
              conversions: 199,
              conversionRate: 21.9
            }
          ],
          startDate: '2025-09-05',
          totalUsers: 1800,
          confidence: 87.3,
          metrics: {
            impressions: 8900,
            clicks: 1250,
            conversions: 355
          }
        }
      ];
      
      setExperiments(mockExperiments);
    } catch (error) {
      console.error('Error loading experiments:', error);
      toast({
        title: "Error",
        description: "Failed to load A/B testing experiments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExperiment = async (experimentData: any) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/ab-testing/experiments/ml-preset', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(experimentData)
      // });
      
      toast({
        title: "Success",
        description: "A/B testing experiment created successfully",
      });
      
      setShowCreateModal(false);
      loadExperiments();
    } catch (error) {
      console.error('Error creating experiment:', error);
      toast({
        title: "Error",
        description: "Failed to create A/B testing experiment",
        variant: "destructive"
      });
    }
  };

  const toggleExperimentStatus = async (experimentId: string, newStatus: string) => {
    try {
      // TODO: Replace with actual API call
      toast({
        title: "Success",
        description: `Experiment ${newStatus === 'paused' ? 'paused' : 'resumed'} successfully`,
      });
      
      // Update local state
      setExperiments(prev => 
        prev.map(exp => 
          exp.id === experimentId 
            ? { ...exp, status: newStatus as any }
            : exp
        )
      );
    } catch (error) {
      console.error('Error updating experiment:', error);
      toast({
        title: "Error",
        description: "Failed to update experiment status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'paused': return 'bg-yellow-600';
      case 'completed': return 'bg-blue-600';
      case 'draft': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-3 w-3" />;
      case 'paused': return <Pause className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'draft': return <Eye className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const activeExperiments = experiments.filter(exp => exp.status === 'active');
  const totalUsers = experiments.reduce((sum, exp) => sum + exp.totalUsers, 0);
  const avgConversionRate = experiments.length > 0 
    ? experiments.reduce((sum, exp) => {
        const expConversionRate = exp.variants.reduce((vSum, variant) => 
          vSum + variant.conversionRate, 0) / exp.variants.length;
        return sum + expConversionRate;
      }, 0) / experiments.length
    : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-700 rounded w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-700 rounded"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span>A/B Testing Dashboard</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Monitor and manage your machine learning experiments
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 transition-all duration-200 hover:scale-105"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Experiment
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-effect border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Experiments</p>
                <p className="text-2xl font-bold text-white">{activeExperiments.length}</p>
              </div>
              <div className="p-3 bg-green-600/20 rounded-lg group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <div className="mt-2">
              <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                {experiments.length} Total
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Test Users</p>
                <p className="text-2xl font-bold text-white">{totalUsers.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-600/20 rounded-lg group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-2">
              <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                Last 30 days
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Avg Conversion Rate</p>
                <p className="text-2xl font-bold text-white">{avgConversionRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-yellow-600/20 rounded-lg group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm">
                <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                <span className="text-green-400">+12.3%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Significant Winners</p>
                <p className="text-2xl font-bold text-white">
                  {experiments.filter(exp => exp.winner && exp.confidence > 95).length}
                </p>
              </div>
              <div className="p-3 bg-purple-600/20 rounded-lg group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6 text-purple-400" />
              </div>
            </div>
            <div className="mt-2">
              <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30">
                95%+ Confidence
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="experiments" className="data-[state=active]:bg-slate-700">
            <Zap className="h-4 w-4 mr-2" />
            Experiments
          </TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-slate-700">
            <TrendingUp className="h-4 w-4 mr-2" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Experiments */}
            <Card className="glass-effect border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-400" />
                  <span>Active Experiments</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeExperiments.length > 0 ? (
                  activeExperiments.map(exp => (
                    <div key={exp.id} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-white text-sm">{exp.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusColor(exp.status)} text-white`}>
                            {getStatusIcon(exp.status)}
                            <span className="ml-1 capitalize">{exp.status}</span>
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Users: </span>
                          <span className="text-white font-medium">{exp.totalUsers.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Confidence: </span>
                          <span className={`font-medium ${exp.confidence > 95 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {exp.confidence.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      {exp.winner && (
                        <div className="mt-2">
                          <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                            <Award className="h-3 w-3 mr-1" />
                            Winner: {exp.variants.find(v => v.id === exp.winner)?.name}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">No active experiments</div>
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Experiment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Performance */}
            <Card className="glass-effect border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                  <span>Performance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">ML Algorithm Performance</span>
                      <span className="text-sm font-medium text-white">+25.7% improvement</span>
                    </div>
                    <Progress value={75} className="h-2 bg-slate-800" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">User Engagement</span>
                      <span className="text-sm font-medium text-white">+18.4% improvement</span>
                    </div>
                    <Progress value={68} className="h-2 bg-slate-800" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Conversion Rate</span>
                      <span className="text-sm font-medium text-white">+12.3% improvement</span>
                    </div>
                    <Progress value={61} className="h-2 bg-slate-800" />
                  </div>

                  <div className="pt-4 border-t border-slate-700/50">
                    <div className="text-sm text-gray-400 mb-2">Key Insights:</div>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Enhanced ML algorithm shows 25% better performance</li>
                      <li>• User engagement increased across all test groups</li>
                      <li>• Statistical significance reached in 2/3 active tests</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-6">
          <div className="grid gap-6">
            {experiments.map(experiment => (
              <Card key={experiment.id} className="glass-effect border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">{experiment.name}</CardTitle>
                      <p className="text-gray-400 text-sm mt-1">{experiment.description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={`${getStatusColor(experiment.status)} text-white`}>
                        {getStatusIcon(experiment.status)}
                        <span className="ml-1 capitalize">{experiment.status}</span>
                      </Badge>
                      {experiment.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleExperimentStatus(experiment.id, 'paused')}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      ) : experiment.status === 'paused' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleExperimentStatus(experiment.id, 'active')}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-white">{experiment.totalUsers.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Total Users</div>
                    </div>
                    <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-white">{experiment.metrics.conversions.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Conversions</div>
                    </div>
                    <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                      <div className={`text-2xl font-bold ${experiment.confidence > 95 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {experiment.confidence.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">Confidence</div>
                    </div>
                    <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {Math.floor((new Date().getTime() - new Date(experiment.startDate).getTime()) / (1000 * 60 * 60 * 24))}
                      </div>
                      <div className="text-sm text-gray-400">Days Running</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-white">Variant Performance</h4>
                    {experiment.variants.map(variant => (
                      <div key={variant.id} className="p-4 bg-slate-800/20 rounded-lg border border-slate-700/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <h5 className="font-medium text-white">{variant.name}</h5>
                            {experiment.winner === variant.id && (
                              <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                                <Award className="h-3 w-3 mr-1" />
                                Winner
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">{variant.conversionRate.toFixed(1)}%</div>
                            <div className="text-sm text-gray-400">Conversion Rate</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Users: </span>
                            <span className="text-white font-medium">{variant.users.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Conversions: </span>
                            <span className="text-white font-medium">{variant.conversions.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Allocation: </span>
                            <span className="text-white font-medium">{variant.allocation}%</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Progress 
                            value={variant.conversionRate} 
                            className="h-2 bg-slate-700"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <ExperimentResults experiments={experiments} />
        </TabsContent>
      </Tabs>

      {/* Create Experiment Modal */}
      {showCreateModal && (
        <ExperimentCreator
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateExperiment}
        />
      )}
    </div>
  );
}
