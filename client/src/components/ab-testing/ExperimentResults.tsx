import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Award, 
  Target,
  Users,
  Eye,
  MousePointer,
  Activity,
  Calendar,
  Download,
  Share2,
  Zap
} from "lucide-react";

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

interface ExperimentResultsProps {
  experiments: Experiment[];
}

export default function ExperimentResults({ experiments }: ExperimentResultsProps) {
  const [selectedExperiment, setSelectedExperiment] = useState<string>(
    experiments.find(exp => exp.status === 'active')?.id || experiments[0]?.id || ''
  );
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

  const experiment = experiments.find(exp => exp.id === selectedExperiment);

  if (!experiment) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">No experiments available</div>
        <p className="text-gray-500 text-sm">Create your first experiment to see results here</p>
      </div>
    );
  }

  const getWinnerData = () => {
    if (!experiment.winner) return null;
    
    const winnerVariant = experiment.variants.find(v => v.id === experiment.winner);
    const controlVariant = experiment.variants.find(v => v.id !== experiment.winner);
    
    if (!winnerVariant || !controlVariant) return null;
    
    const improvement = ((winnerVariant.conversionRate - controlVariant.conversionRate) / controlVariant.conversionRate) * 100;
    
    return {
      variant: winnerVariant,
      control: controlVariant,
      improvement: improvement
    };
  };

  const winnerData = getWinnerData();

  const getStatisticalSignificance = () => {
    if (experiment.confidence >= 95) return { level: 'High', color: 'text-green-400', bgColor: 'bg-green-600/20' };
    if (experiment.confidence >= 90) return { level: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-600/20' };
    return { level: 'Low', color: 'text-red-400', bgColor: 'bg-red-600/20' };
  };

  const significance = getStatisticalSignificance();

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-400">Select Experiment</label>
            <Select value={selectedExperiment} onValueChange={setSelectedExperiment}>
              <SelectTrigger className="w-80 bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {experiments.map(exp => (
                  <SelectItem key={exp.id} value={exp.id}>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${
                        exp.status === 'active' ? 'bg-green-600' :
                        exp.status === 'completed' ? 'bg-blue-600' :
                        exp.status === 'paused' ? 'bg-yellow-600' :
                        'bg-gray-600'
                      } text-white text-xs`}>
                        {exp.status}
                      </Badge>
                      <span>{exp.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-400">View Mode</label>
            <Select value={viewMode} onValueChange={(value: 'summary' | 'detailed') => setViewMode(value)}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="border-slate-700 text-gray-300 hover:text-white">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="border-slate-700 text-gray-300 hover:text-white">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Experiment Overview */}
      <Card className="glass-effect border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl">{experiment.name}</CardTitle>
              <p className="text-gray-400 mt-1">{experiment.description}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={`${
                experiment.status === 'active' ? 'bg-green-600' :
                experiment.status === 'completed' ? 'bg-blue-600' :
                experiment.status === 'paused' ? 'bg-yellow-600' :
                'bg-gray-600'
              } text-white`}>
                <Activity className="h-3 w-3 mr-1" />
                {experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)}
              </Badge>
              <Badge className={`${significance.bgColor} ${significance.color} border-current/30`}>
                <Target className="h-3 w-3 mr-1" />
                {significance.level} Confidence
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{experiment.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{experiment.metrics.conversions.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Conversions</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${experiment.confidence > 95 ? 'text-green-400' : 'text-yellow-400'}`}>
                {experiment.confidence.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">Confidence Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {Math.floor((new Date().getTime() - new Date(experiment.startDate).getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-gray-400">Days Running</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Winner Analysis */}
      {winnerData && (
        <Card className="glass-effect border-slate-700/50 border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-400" />
              <span>Statistical Winner Detected</span>
              <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                {experiment.confidence.toFixed(1)}% Confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {winnerData.variant.name} vs {winnerData.control.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {winnerData.improvement > 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-400" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-400" />
                      )}
                      <span className={`text-xl font-bold ${
                        winnerData.improvement > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {winnerData.improvement > 0 ? '+' : ''}{winnerData.improvement.toFixed(1)}%
                      </span>
                      <span className="text-gray-400">improvement in conversion rate</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-green-600/10 rounded-lg border border-green-600/20">
                      <div className="text-green-400 font-medium">Winner: {winnerData.variant.name}</div>
                      <div className="text-white text-lg font-bold">{winnerData.variant.conversionRate.toFixed(1)}%</div>
                      <div className="text-gray-400">{winnerData.variant.conversions.toLocaleString()} / {winnerData.variant.users.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700">
                      <div className="text-gray-400 font-medium">Control: {winnerData.control.name}</div>
                      <div className="text-white text-lg font-bold">{winnerData.control.conversionRate.toFixed(1)}%</div>
                      <div className="text-gray-400">{winnerData.control.conversions.toLocaleString()} / {winnerData.control.users.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-3">Key Metrics</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sample Size:</span>
                      <span className="text-white font-medium">{experiment.totalUsers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Statistical Power:</span>
                      <span className="text-white font-medium">
                        {experiment.confidence > 95 ? 'High' : experiment.confidence > 90 ? 'Medium' : 'Low'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Effect Size:</span>
                      <span className="text-white font-medium">
                        {Math.abs(winnerData.improvement) > 20 ? 'Large' : 
                         Math.abs(winnerData.improvement) > 10 ? 'Medium' : 'Small'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Recommendation:</span>
                      <span className="text-green-400 font-medium">
                        {experiment.confidence > 95 ? 'Deploy Winner' : 'Continue Testing'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variant Performance */}
      <div className="grid gap-6">
        <h2 className="text-xl font-bold text-white">Variant Performance</h2>
        {experiment.variants.map((variant, index) => (
          <Card key={variant.id} className={`glass-effect border-slate-700/50 ${
            experiment.winner === variant.id ? 'border-l-4 border-l-green-500 bg-green-500/5' : ''
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <span>{variant.name}</span>
                    {experiment.winner === variant.id && (
                      <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                        <Award className="h-3 w-3 mr-1" />
                        Winner
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-gray-400 text-sm mt-1">
                    Allocated {variant.allocation}% of traffic
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{variant.conversionRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-400">Conversion Rate</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'summary' ? (
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="text-xl font-bold text-white">{variant.users.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Users</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="text-xl font-bold text-white">{variant.conversions.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Conversions</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <BarChart3 className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="text-xl font-bold text-white">{variant.conversionRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-400">Rate</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Eye className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-gray-400">Impressions</span>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {Math.floor(experiment.metrics.impressions * variant.allocation / 100).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <MousePointer className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-gray-400">Clicks</span>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {Math.floor(experiment.metrics.clicks * variant.allocation / 100).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-gray-400">CTR</span>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {((experiment.metrics.clicks * variant.allocation / 100) / 
                          (experiment.metrics.impressions * variant.allocation / 100) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-gray-400">CVR</span>
                      </div>
                      <div className="text-lg font-bold text-white">{variant.conversionRate.toFixed(1)}%</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-400">Performance Progress</span>
                      <span className="text-sm text-white font-medium">{variant.conversionRate.toFixed(1)}% conversion rate</span>
                    </div>
                    <Progress 
                      value={variant.conversionRate} 
                      className="h-3 bg-slate-700"
                    />
                  </div>

                  {experiment.winner === variant.id && winnerData && (
                    <div className="p-4 bg-green-600/10 rounded-lg border border-green-600/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-green-400">Winner Analysis</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        This variant outperformed the control by{' '}
                        <span className="font-bold text-green-400">
                          +{winnerData.improvement.toFixed(1)}%
                        </span>{' '}
                        with {experiment.confidence.toFixed(1)}% statistical confidence.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Experiment Timeline */}
      <Card className="glass-effect border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            <span>Experiment Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Start Date</div>
                <div className="text-gray-400 text-sm">
                  {new Date(experiment.startDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">Duration</div>
                <div className="text-gray-400 text-sm">
                  {Math.floor((new Date().getTime() - new Date(experiment.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
              </div>
            </div>
            
            {experiment.endDate && (
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <div>
                  <div className="text-white font-medium">End Date</div>
                  <div className="text-gray-400 text-sm">
                    {new Date(experiment.endDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">Status</div>
                  <div className="text-gray-400 text-sm capitalize">{experiment.status}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
