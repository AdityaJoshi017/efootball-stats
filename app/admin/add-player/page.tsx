'use client';

import { useState } from 'react';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AddPlayerPage() {
  const [formData, setFormData] = useState({
    name: '',
    team: '',
    position: '',
    age: '',
    cardType: '',
    apps: '',
    goal: '',
    assists: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculatedStats, setCalculatedStats] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-calculate stats when relevant fields change
    if (['apps', 'goal', 'assists'].includes(name)) {
      calculateStats();
    }
  };

  const calculateStats = () => {
    const apps = parseInt(formData.apps) || 0;
    const goals = parseInt(formData.goal) || 0;
    const assists = parseInt(formData.assists) || 0;
    
    if (apps > 0) {
      const gPlusA = goals + assists;
      setCalculatedStats({
        gPlusA,
        gPm: (goals / apps).toFixed(3),
        aPm: (assists / apps).toFixed(3),
        gAPm: (gPlusA / apps).toFixed(3),
      });
    } else {
      setCalculatedStats(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please drop an image file (JPEG, PNG, WebP)');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const playerData = {
        name: formData.name,
        team: formData.team || 'N/A',
        position: formData.position,
        age: parseInt(formData.age),
        cardType: formData.cardType,
        apps: parseInt(formData.apps) || 0,
        goal: parseInt(formData.goal) || 0,
        assists: parseInt(formData.assists) || 0,
      };

      const result = await adminApi.createPlayer(playerData, imageFile || undefined);
      
      console.log('Player created:', result);
      toast.success('Player created successfully! Redirecting to players page...');
      
      // Redirect to players page after successful creation
      setTimeout(() => {
        window.location.href = '/players';
      }, 1500);
      
      // Reset form
      setFormData({
        name: '',
        team: '',
        position: '',
        age: '',
        cardType: '',
        apps: '',
        goal: '',
        assists: '',
      });
      setImageFile(null);
      setImagePreview(null);
      setCalculatedStats(null);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Failed to create player. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Player</CardTitle>
          <CardDescription>
            Add a new player card with their statistics. Stats will be automatically calculated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Player Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Lionel Messi"
                  required
                  className="text-lg font-semibold"
                />
                <p className="text-xs text-muted-foreground">Full name of the player</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">Team</Label>
                <Input
                  id="team"
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  placeholder="e.g., Barcelona"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Select name="position" value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CF">CF (Center Forward)</SelectItem>
                    <SelectItem value="SS">SS (Second Striker)</SelectItem>
                    <SelectItem value="AMF">AMF (Attacking Midfielder)</SelectItem>
                    <SelectItem value="CMF">CMF (Central Midfielder)</SelectItem>
                    <SelectItem value="DMF">DMF (Defensive Midfielder)</SelectItem>
                    <SelectItem value="LWF">LWF (Left Winger)</SelectItem>
                    <SelectItem value="RWF">RWF (Right Winger)</SelectItem>
                    <SelectItem value="LMF">LMF (Left Midfielder)</SelectItem>
                    <SelectItem value="RMF">RMF (Right Midfielder)</SelectItem>
                    <SelectItem value="CB">CB (Center Back)</SelectItem>
                    <SelectItem value="LB">LB (Left Back)</SelectItem>
                    <SelectItem value="RB">RB (Right Back)</SelectItem>
                    <SelectItem value="GK">GK (Goalkeeper)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  min="16"
                  max="50"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g., 25"
                  required
                  className="text-lg font-semibold"
                />
                <p className="text-xs text-muted-foreground">Player age (16-50 years)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardType">Card Type *</Label>
                <Select name="cardType" value={formData.cardType} onValueChange={(value) => setFormData(prev => ({ ...prev, cardType: value }))} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select card type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="epic-big time">Epic Big Time</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                    <SelectItem value="show-time">Show Time</SelectItem>
                    <SelectItem value="highlight">Highlight</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="potw">Player of the Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Performance Statistics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Performance Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apps">Appearances <span className="text-muted-foreground text-xs">(Matches Played)</span></Label>
                  <Input
                    id="apps"
                    name="apps"
                    type="number"
                    min="0"
                    value={formData.apps}
                    onChange={handleChange}
                    placeholder="e.g., 100"
                    className="text-lg font-semibold"
                  />
                  <p className="text-xs text-muted-foreground">Total number of matches played</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Goals <span className="text-muted-foreground text-xs">(Total Goals Scored)</span></Label>
                  <Input
                    id="goal"
                    name="goal"
                    type="number"
                    min="0"
                    value={formData.goal}
                    onChange={handleChange}
                    placeholder="e.g., 50"
                    className="text-lg font-semibold"
                  />
                  <p className="text-xs text-muted-foreground">Total goals scored in all matches</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assists">Assists <span className="text-muted-foreground text-xs">(Total Assists Made)</span></Label>
                  <Input
                    id="assists"
                    name="assists"
                    type="number"
                    min="0"
                    value={formData.assists}
                    onChange={handleChange}
                    placeholder="e.g., 25"
                    className="text-lg font-semibold"
                  />
                  <p className="text-xs text-muted-foreground">Total assists provided to teammates</p>
                </div>
              </div>

              {/* Auto-calculated Stats Preview */}
              {calculatedStats && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-4 rounded-lg space-y-3 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400">📊</span>
                    Auto-Calculated Stats
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-white dark:bg-gray-800 p-2 rounded">
                      <div className="text-xs text-muted-foreground">Goals + Assists</div>
                      <div className="font-bold text-lg text-blue-600 dark:text-blue-400">{calculatedStats.gPlusA}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded">
                      <div className="text-xs text-muted-foreground">Goals/Match</div>
                      <div className="font-bold text-lg text-green-600 dark:text-green-400">{calculatedStats.gPm}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded">
                      <div className="text-xs text-muted-foreground">Assists/Match</div>
                      <div className="font-bold text-lg text-purple-600 dark:text-purple-400">{calculatedStats.aPm}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded">
                      <div className="text-xs text-muted-foreground">G+A/Match</div>
                      <div className="font-bold text-lg text-orange-600 dark:text-orange-400">{calculatedStats.gAPm}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Player Image</h3>
              
              <div 
                className={`space-y-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-2">
                  <Label htmlFor="image" className="cursor-pointer">
                    {isDragging ? 'Drop image here' : 'Upload Image'}
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Accepted formats: JPEG, PNG, WebP (Max 5MB)<br />
                    Or drag and drop an image here
                  </p>
                </div>

                {imagePreview && (
                  <div className="mt-4">
                    <Label>Image Preview</Label>
                    <div className="mt-2 w-24 h-34 rounded-lg overflow-hidden border mx-auto">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating Player...' : 'Add Player'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
