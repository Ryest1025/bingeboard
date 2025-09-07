import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Zap, 
  Target, 
  Users, 
  Calendar,
  Plus,
  Minus,
  Settings,
  Brain,
  TrendingUp,
  BarChart3,
  Clock
} from "lucide-react";

interface ExperimentCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (experimentData: any) => void;
}

const ML_PRESETS = [
  {
    id: 'RECOMMENDATION_ENGINE_TEST',
    name: 'Recommendation Engine A/B Test',
    description: 'Test enhanced ML recommendation algorithm vs standard algorithm',
    icon: <Brain className="h-5 w-5" />,
    variants: [
      { name: 'Control (Standard Algorithm)', allocation: 50 },
      { name: 'Treatment (Enhanced ML)', allocation: 50 }
    ]
  },
  {
    id: 'CONTENT_PERSONALIZATION_TEST',
    name: 'Content Personalization Test',
    description: 'Test AI-driven content ordering vs chronological ordering',
    icon: <Target className="h-5 w-5" />,
    variants: [
      { name: 'Control (Chronological)', allocation: 50 },
      { name: 'Treatment (AI Personalized)', allocation: 50 }
    ]
  },
  {
    id: 'WATCHLIST_OPTIMIZATION_TEST',
    name: 'Watchlist Optimization',
    description: 'Test smart watchlist recommendations vs manual additions',
    icon: <TrendingUp className="h-5 w-5" />,
    variants: [
      { name: 'Control (Manual)', allocation: 50 },
      { name: 'Treatment (Smart Recommendations)', allocation: 50 }
    ]
  }
];

export default function ExperimentCreator({ isOpen, onClose, onSubmit }: ExperimentCreatorProps) {
  const [activeTab, setActiveTab] = useState('preset');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    preset: '',
    variants: [
      { name: 'Control', allocation: 50 },
      { name: 'Treatment', allocation: 50 }
    ],
    targetMetric: 'conversion_rate',
    sampleSize: 1000,
    duration: 30,
    confidenceLevel: 95,
    autoEnd: true
  });

  const handlePresetSelect = (presetId: string) => {
    const preset = ML_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setFormData({
        ...formData,
        preset: presetId,
        name: preset.name,
        description: preset.description,
        variants: preset.variants
      });
    }
  };

  const handleAddVariant = () => {
    const newVariants = [...formData.variants, { name: '', allocation: 0 }];
    const equalAllocation = Math.floor(100 / newVariants.length);
    const updatedVariants = newVariants.map((variant, index) => ({
      ...variant,
      allocation: index === newVariants.length - 1 
        ? 100 - (equalAllocation * (newVariants.length - 1))
        : equalAllocation
    }));
    setFormData({ ...formData, variants: updatedVariants });
  };

  const handleRemoveVariant = (index: number) => {
    if (formData.variants.length > 2) {
      const newVariants = formData.variants.filter((_, i) => i !== index);
      const totalAllocation = newVariants.reduce((sum, v) => sum + v.allocation, 0);
      if (totalAllocation !== 100) {
        const equalAllocation = Math.floor(100 / newVariants.length);
        const updatedVariants = newVariants.map((variant, i) => ({
          ...variant,
          allocation: i === newVariants.length - 1 
            ? 100 - (equalAllocation * (newVariants.length - 1))
            : equalAllocation
        }));
        setFormData({ ...formData, variants: updatedVariants });
      } else {
        setFormData({ ...formData, variants: newVariants });
      }
    }
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const handleSubmit = () => {
    const experimentData = {
      ...formData,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + (formData.duration * 24 * 60 * 60 * 1000)).toISOString()
    };
    
    onSubmit(experimentData);
  };

  const totalAllocation = formData.variants.reduce((sum, variant) => sum + variant.allocation, 0);
  const isValid = formData.name && formData.description && totalAllocation === 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span>Create A/B Testing Experiment</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Set up a new experiment to test different variants and measure their performance
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="preset" className="data-[state=active]:bg-slate-700">
              <Brain className="h-4 w-4 mr-2" />
              ML Presets
            </TabsTrigger>
            <TabsTrigger value="custom" className="data-[state=active]:bg-slate-700">
              <Settings className="h-4 w-4 mr-2" />
              Custom
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preset" className="space-y-4">
            <div className="grid gap-4">
              <Label className="text-white font-medium">Choose ML Preset</Label>
              <div className="grid gap-3">
                {ML_PRESETS.map(preset => (
                  <Card 
                    key={preset.id}
                    className={`cursor-pointer border transition-all duration-200 hover:shadow-lg ${
                      formData.preset === preset.id
                        ? 'border-teal-500 bg-teal-500/10'
                        : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                    }`}
                    onClick={() => handlePresetSelect(preset.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          formData.preset === preset.id
                            ? 'bg-teal-500/20 text-teal-400'
                            : 'bg-slate-700 text-gray-400'
                        }`}>
                          {preset.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{preset.name}</h3>
                          <p className="text-sm text-gray-400 mt-1">{preset.description}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {preset.variants.map((variant, index) => (
                              <Badge 
                                key={index}
                                className={`${
                                  formData.preset === preset.id
                                    ? 'bg-teal-600/20 text-teal-400'
                                    : 'bg-slate-700 text-gray-300'
                                }`}
                              >
                                {variant.name}: {variant.allocation}%
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white font-medium">Experiment Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter experiment name"
                  className="bg-slate-800 border-slate-700 text-white placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metric" className="text-white font-medium">Target Metric</Label>
                <Select value={formData.targetMetric} onValueChange={(value) => setFormData({ ...formData, targetMetric: value })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                    <SelectItem value="click_through_rate">Click Through Rate</SelectItem>
                    <SelectItem value="engagement_rate">Engagement Rate</SelectItem>
                    <SelectItem value="retention_rate">Retention Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white font-medium">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this experiment tests"
                className="bg-slate-800 border-slate-700 text-white placeholder-gray-400"
                rows={3}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Variants Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-white font-medium">Variants</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddVariant}
              className="border-slate-700 text-gray-300 hover:text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </div>

          <div className="space-y-3">
            {formData.variants.map((variant, index) => (
              <Card key={index} className="bg-slate-800/30 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        value={variant.name}
                        onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                        placeholder={`Variant ${index + 1} name`}
                        className="bg-slate-800 border-slate-700 text-white placeholder-gray-400"
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={variant.allocation}
                        onChange={(e) => handleVariantChange(index, 'allocation', parseInt(e.target.value) || 0)}
                        className="bg-slate-800 border-slate-700 text-white text-center"
                      />
                    </div>
                    <div className="text-gray-400 text-sm">%</div>
                    {formData.variants.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveVariant(index)}
                        className="border-red-700 text-red-400 hover:bg-red-700/20"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalAllocation !== 100 && (
            <div className="text-red-400 text-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Total allocation must equal 100% (currently {totalAllocation}%)</span>
            </div>
          )}
        </div>

        {/* Experiment Settings */}
        <div className="space-y-4">
          <Label className="text-white font-medium">Experiment Settings</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-400 text-sm">Sample Size</Label>
              <Input
                type="number"
                value={formData.sampleSize}
                onChange={(e) => setFormData({ ...formData, sampleSize: parseInt(e.target.value) || 0 })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400 text-sm">Duration (days)</Label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400 text-sm">Confidence Level (%)</Label>
              <Select 
                value={formData.confidenceLevel.toString()} 
                onValueChange={(value) => setFormData({ ...formData, confidenceLevel: parseInt(value) })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="90">90%</SelectItem>
                  <SelectItem value="95">95%</SelectItem>
                  <SelectItem value="99">99%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700">
            <div>
              <div className="text-white font-medium">Auto-end experiment</div>
              <div className="text-gray-400 text-sm">Automatically stop when statistical significance is reached</div>
            </div>
            <Switch
              checked={formData.autoEnd}
              onCheckedChange={(checked) => setFormData({ ...formData, autoEnd: checked })}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-gray-300 hover:text-white">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 disabled:opacity-50"
          >
            <Zap className="h-4 w-4 mr-2" />
            Create Experiment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
