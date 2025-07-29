'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Plus, 
  X, 
  Search,
  Check,
  ChevronDown,
  Palette,
  Image,
  Settings
} from 'lucide-react';
import { getIcon, getIconList } from '@/lib/icons';
import { Link as LinkType } from '@/types';
import { config } from '@/config';

interface FormColorStop {
  color: string;
  position: number;
}

interface LinkFormData {
  name: string;
  display_name: string;
  link: string;
  description: string;
  icon: string;
  visible: boolean;
  enabled: boolean;
  mini: boolean;
  gradient_type: string;
  gradient_angle: number;
  color_stops: FormColorStop[];
  custom_accent_color_enabled: boolean;
  custom_accent_color: string;
  custom_title_color_enabled: boolean;
  custom_title_color: string;
  custom_description_color_enabled: boolean;
  custom_description_color: string;
  mini_background_enabled: boolean;
}

interface LinkEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LinkFormData) => void;
  initialData?: Partial<LinkType>;
  isEditing?: boolean;
  isSubmitting?: boolean;
  nodeSubdomain?: string;
}

export default function LinkEditor({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isEditing = false,
  isSubmitting = false,
  nodeSubdomain
}: LinkEditorProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    display_name: initialData?.display_name || '',
    link: initialData?.link || '',
    description: initialData?.description || '',
    icon: initialData?.icon || '',
    visible: initialData?.visible ?? true,
    enabled: initialData?.enabled ?? true,
    mini: initialData?.mini ?? false,
    gradient_type: initialData?.gradient_type || 'solid',
    gradient_angle: initialData?.gradient_angle || 0,
    custom_accent_color_enabled: initialData?.custom_accent_color_enabled ?? false,
    custom_accent_color: initialData?.custom_accent_color || '',
    custom_title_color_enabled: initialData?.custom_title_color_enabled ?? false,
    custom_title_color: initialData?.custom_title_color || '',
    custom_description_color_enabled: initialData?.custom_description_color_enabled ?? false,
    custom_description_color: initialData?.custom_description_color || '',
    mini_background_enabled: initialData?.mini_background_enabled ?? false,
  });

  const [colorStops, setColorStops] = useState<FormColorStop[]>(
    initialData?.color_stops?.map(stop => ({ color: stop.color, position: stop.position })) || []
  );
  const [selectedGradientType, setSelectedGradientType] = useState<string>(
    initialData?.gradient_type || 'solid'
  );
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconSearchTerm, setIconSearchTerm] = useState('');

  // Update slider background based on angle
  useEffect(() => {
    const slider = document.querySelector('.slider') as HTMLInputElement;
    if (slider) {
      const angle = formData.gradient_angle || 0;
      const percentage = (angle / 360) * 100;
      slider.style.background = `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
    }
  }, [formData.gradient_angle]);

  // Initialize form data when dialog opens with initial data
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || '',
        display_name: initialData.display_name || '',
        link: initialData.link || '',
        description: initialData.description || '',
        icon: initialData.icon || '',
        visible: initialData.visible ?? true,
        enabled: initialData.enabled ?? true,
        mini: initialData.mini ?? false,
        gradient_type: initialData.gradient_type || 'solid',
        gradient_angle: initialData.gradient_angle || 0,
        custom_accent_color_enabled: initialData.custom_accent_color_enabled ?? false,
        custom_accent_color: initialData.custom_accent_color || '',
        custom_title_color_enabled: initialData.custom_title_color_enabled ?? false,
        custom_title_color: initialData.custom_title_color || '',
        custom_description_color_enabled: initialData.custom_description_color_enabled ?? false,
        custom_description_color: initialData.custom_description_color || '',
        mini_background_enabled: initialData.mini_background_enabled ?? false,
      });
      setColorStops(initialData.color_stops || []);
      setSelectedGradientType(initialData.gradient_type || 'solid');
    } else if (isOpen && !initialData) {
      // Reset form for new link
      setFormData({
        name: '',
        display_name: '',
        link: '',
        description: '',
        icon: '',
        visible: true,
        enabled: true,
        mini: false,
        gradient_type: 'solid',
        gradient_angle: 0,
        custom_accent_color_enabled: false,
        custom_accent_color: '',
        custom_title_color_enabled: false,
        custom_title_color: '',
        custom_description_color_enabled: false,
        custom_description_color: '',
        mini_background_enabled: false,
      });
      setColorStops([]);
      setSelectedGradientType('solid');
    }
  }, [isOpen, initialData]);

  const handleInputChange = (field: keyof typeof formData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure there's always at least one color stop
    let finalColorStops = colorStops;
    if (colorStops.length === 0) {
      finalColorStops = [{ color: '#F5F1E8', position: 0 }];
    }
    
    // For solid fill, ensure we only have one color stop
    if (formData.gradient_type === 'solid' && finalColorStops.length > 1) {
      finalColorStops = [finalColorStops[0]];
    }
    
    // Validate that at least one of name or link is provided
    if (!formData.name && !formData.link) {
      alert('Please provide either a link name or URL');
      return;
    }
    
    const linkData = {
      ...formData,
      color_stops: finalColorStops
    };
    
    try {
      await onSubmit(linkData);
      // If we reach here, the submission was successful
      handleClose();
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Link submission failed:', error);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: '',
      display_name: '',
      link: '',
      description: '',
      icon: '',
      visible: true,
      enabled: true,
      mini: false,
      gradient_type: 'solid',
      gradient_angle: 0,
      custom_accent_color_enabled: false,
      custom_accent_color: '',
      custom_title_color_enabled: false,
      custom_title_color: '',
      custom_description_color_enabled: false,
      custom_description_color: '',
      mini_background_enabled: false,
    });
    setColorStops([]);
    setSelectedGradientType('solid');
    setIconSearchTerm('');
    setShowIconPicker(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Link' : 'Add New Link'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="link_name">Link Name (URL)</Label>
                  <Input
                    id="link_name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="my-link"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be used in the URL: {config.getBaseUrl()}/{nodeSubdomain || '[subdomain]'}/{formData.name || '[name]'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link_display_name">Link Title</Label>
                  <Input
                    id="link_display_name"
                    value={formData.display_name}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    placeholder="My Awesome Link"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This is what users will see
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_url">URL</Label>
                <Input
                  id="link_url"
                  type="url"
                  value={formData.link}
                  onChange={(e) => handleInputChange('link', e.target.value)}
                  placeholder="https://example.com"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to disable redirect (link will be displayed as text only)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_description">Description</Label>
                <Input
                  id="link_description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Optional description for this link"
                />
                <p className="text-xs text-muted-foreground">
                  This will be displayed below the link name
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="link_visible"
                    checked={formData.visible}
                    onChange={(e) => handleInputChange('visible', e.target.checked)}
                  />
                  <Label htmlFor="link_visible">Visible</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="link_enabled"
                    checked={formData.enabled}
                    onChange={(e) => handleInputChange('enabled', e.target.checked)}
                  />
                  <Label htmlFor="link_enabled">Enabled</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="link_mini"
                    checked={formData.mini}
                    onChange={(e) => handleInputChange('mini', e.target.checked)}
                  />
                  <Label htmlFor="link_mini">Mini (Icon Only)</Label>
                </div>
                {formData.mini && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="link_mini_background_enabled"
                      checked={formData.mini_background_enabled}
                      onChange={(e) => handleInputChange('mini_background_enabled', e.target.checked)}
                    />
                    <Label htmlFor="link_mini_background_enabled">Enable Background Fill</Label>
                  </div>
                )}
              </div>
            </div>

            {/* Icon Section */}
            <Collapsible className="space-y-4">
              <CollapsibleTrigger>
                <div className="flex items-center">
                  <Image className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Icon</span>
                </div>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-2">
                  <Label htmlFor="link_icon">Icon</Label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 p-2 border rounded-md bg-cottage-cream flex items-center space-x-2">
                      {formData.icon ? (
                        <>
                          {React.createElement(getIcon(formData.icon), { className: "h-5 w-5" })}
                          <span className="text-sm text-muted-foreground">{formData.icon}</span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">Select an icon</span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowIconPicker(true)}
                    >
                      Pick Icon
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Color Customization Section */}
            <Collapsible className="space-y-4">
              <CollapsibleTrigger>
                <div className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Color Customization</span>
                </div>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                {/* Accent Color (Icons & Outlines) */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="custom_accent_color_enabled"
                      checked={formData.custom_accent_color_enabled}
                      onChange={(e) => handleInputChange('custom_accent_color_enabled', e.target.checked)}
                    />
                    <Label htmlFor="custom_accent_color_enabled">Use Custom Accent Color</Label>
                  </div>
                  
                  {formData.custom_accent_color_enabled && (
                    <div className="space-y-2">
                      <Label htmlFor="custom_accent_color">Accent Color (Icons & Outlines)</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          id="custom_accent_color"
                          value={formData.custom_accent_color || '#000000'}
                          onChange={(e) => handleInputChange('custom_accent_color', e.target.value)}
                          className="w-12 h-8 border rounded"
                        />
                        <Input
                          value={formData.custom_accent_color || '#000000'}
                          onChange={(e) => handleInputChange('custom_accent_color', e.target.value)}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Title Color */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="custom_title_color_enabled"
                      checked={formData.custom_title_color_enabled}
                      onChange={(e) => handleInputChange('custom_title_color_enabled', e.target.checked)}
                    />
                    <Label htmlFor="custom_title_color_enabled">Use Custom Title Color</Label>
                  </div>
                  
                  {formData.custom_title_color_enabled && (
                    <div className="space-y-2">
                      <Label htmlFor="custom_title_color">Title Color</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          id="custom_title_color"
                          value={formData.custom_title_color || '#000000'}
                          onChange={(e) => handleInputChange('custom_title_color', e.target.value)}
                          className="w-12 h-8 border rounded"
                        />
                        <Input
                          value={formData.custom_title_color || '#000000'}
                          onChange={(e) => handleInputChange('custom_title_color', e.target.value)}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Description Color */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="custom_description_color_enabled"
                      checked={formData.custom_description_color_enabled}
                      onChange={(e) => handleInputChange('custom_description_color_enabled', e.target.checked)}
                    />
                    <Label htmlFor="custom_description_color_enabled">Use Custom Description Color</Label>
                  </div>
                  
                  {formData.custom_description_color_enabled && (
                    <div className="space-y-2">
                      <Label htmlFor="custom_description_color">Description Color</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          id="custom_description_color"
                          value={formData.custom_description_color || '#000000'}
                          onChange={(e) => handleInputChange('custom_description_color', e.target.value)}
                          className="w-12 h-8 border rounded"
                        />
                        <Input
                          value={formData.custom_description_color || '#000000'}
                          onChange={(e) => handleInputChange('custom_description_color', e.target.value)}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Fill/Gradient Section - Hidden when mini is enabled, unless mini background is enabled */}
            {(!formData.mini || formData.mini_background_enabled) && (
              <Collapsible className="space-y-4">
                <CollapsibleTrigger>
                  <div className="flex items-center">
                    <div className="w-5 h-5 mr-2 rounded bg-gradient-to-r from-blue-500 to-purple-500" />
                    <span className="font-semibold">Fill & Gradient</span>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gradient_type">Fill Type</Label>
                    <select
                      value={selectedGradientType}
                      onChange={(e) => {
                        setSelectedGradientType(e.target.value);
                        handleInputChange('gradient_type', e.target.value);
                      }}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="solid">Solid Fill</option>
                      <option value="linear">Linear Gradient</option>
                      <option value="radial">Radial Gradient</option>
                    </select>
                    <div className="text-xs text-muted-foreground">
                      {selectedGradientType === 'solid' && 'Single color fill'}
                      {selectedGradientType === 'linear' && 'Gradient that flows in a straight line'}
                      {selectedGradientType === 'radial' && 'Gradient that radiates from center outward'}
                    </div>
                  </div>

                  {selectedGradientType !== 'solid' && selectedGradientType !== 'radial' && (
                    <div className="space-y-2">
                      <Label htmlFor="gradient_angle">Gradient Direction</Label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="range"
                            min="0"
                            max="360"
                            step="1"
                            value={formData.gradient_angle || 0}
                            onChange={(e) => handleInputChange('gradient_angle', parseFloat(e.target.value) || 0)}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb 25%, #3b82f6 25%, #3b82f6 100%)`
                            }}
                          />
                          <span className="text-sm font-mono w-12 text-center bg-gray-100 px-2 py-1 rounded">
                            {formData.gradient_angle || 0}°
                          </span>
                        </div>
                        
                        {/* Direction Visual */}
                        <div className="flex justify-center">
                          <div className="w-16 h-16 border-2 border-gray-300 rounded-lg flex items-center justify-center relative">
                            <div 
                              className="w-1 h-8 bg-blue-500 rounded-full transform transition-transform duration-200"
                              style={{
                                transform: `rotate(${formData.gradient_angle || 0}deg)`
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground text-center">
                          Drag to adjust gradient direction
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gradient Preview */}
                {selectedGradientType !== 'solid' && colorStops.length > 0 && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div 
                      className="w-full h-12 rounded-md border-2 border-dashed border-gray-300"
                      style={{
                        background: selectedGradientType === 'linear' 
                          ? `linear-gradient(${formData.gradient_angle || 0}deg, ${colorStops
                              .sort((a, b) => a.position - b.position)
                              .map(stop => `${stop.color} ${stop.position}%`)
                              .join(', ')})`
                          : `radial-gradient(circle, ${colorStops
                              .sort((a, b) => a.position - b.position)
                              .map(stop => `${stop.color} ${stop.position}%`)
                              .join(', ')})`
                      }}
                    />
                  </div>
                )}

                {/* Color Management */}
                <div className="space-y-4">
                  {selectedGradientType === 'solid' ? (
                    <div className="space-y-2">
                      <Label>Fill Color</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={colorStops.length > 0 ? colorStops[0].color : '#F5F1E8'}
                          onChange={(e) => {
                            if (colorStops.length > 0) {
                              const newStops = [...colorStops];
                              newStops[0].color = e.target.value;
                              setColorStops(newStops);
                            } else {
                              setColorStops([{ color: e.target.value, position: 0 }]);
                            }
                          }}
                          className="w-12 h-8 border rounded"
                        />
                        <span className="text-sm text-muted-foreground">
                          {colorStops.length > 0 ? colorStops[0].color : '#F5F1E8'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <Label>Gradient Colors</Label>
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newStops = [...colorStops, { color: '#000000', position: colorStops.length * 50 }];
                              setColorStops(newStops);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Color
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setColorStops([
                                { color: '#ff0000', position: 0 },
                                { color: '#00ff00', position: 100 }
                              ]);
                              handleInputChange('gradient_angle', 90);
                            }}
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {colorStops.length === 0 ? (
                          <div className="text-sm text-muted-foreground p-3 border rounded-md bg-gray-50">
                            <div className="font-medium mb-1">No colors added yet</div>
                            <div>Click &quot;Add Color&quot; to start building your gradient, or try a preset below.</div>
                          </div>
                        ) : (
                          colorStops.map((stop, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 border rounded-md bg-gray-50">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="color"
                                  value={stop.color}
                                  onChange={(e) => {
                                    const newStops = [...colorStops];
                                    newStops[index].color = e.target.value;
                                    setColorStops(newStops);
                                  }}
                                  className="w-10 h-8 border rounded cursor-pointer"
                                />
                                <div className="text-sm">
                                  <div className="font-medium">{stop.color}</div>
                                  <div className="text-muted-foreground">Position {stop.position}%</div>
                                </div>
                              </div>
                              
                              <div className="flex-1">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={stop.position}
                                  onChange={(e) => {
                                    const newStops = [...colorStops];
                                    newStops[index].position = parseInt(e.target.value);
                                    setColorStops(newStops);
                                  }}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                              
                              {colorStops.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newStops = colorStops.filter((_, i) => i !== index);
                                    setColorStops(newStops);
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                      
                      {/* Preset Gradients */}
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Quick Presets</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setColorStops([
                                { color: '#ff6b6b', position: 0 },
                                { color: '#4ecdc4', position: 100 }
                              ]);
                              handleInputChange('gradient_angle', 45);
                            }}
                            className="h-8 text-xs"
                          >
                            Sunset
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setColorStops([
                                { color: '#667eea', position: 0 },
                                { color: '#764ba2', position: 100 }
                              ]);
                              handleInputChange('gradient_angle', 135);
                            }}
                            className="h-8 text-xs"
                          >
                            Purple
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setColorStops([
                                { color: '#f093fb', position: 0 },
                                { color: '#f5576c', position: 100 }
                              ]);
                              handleInputChange('gradient_angle', 90);
                            }}
                            className="h-8 text-xs"
                          >
                            Pink
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setColorStops([
                                { color: '#4facfe', position: 0 },
                                { color: '#00f2fe', position: 100 }
                              ]);
                              handleInputChange('gradient_angle', 180);
                            }}
                            className="h-8 text-xs"
                          >
                            Ocean
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
            )}

            <div className="flex space-x-2">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-cottage-green hover:bg-cottage-green/90 text-cottage-cream"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {isEditing ? 'Save Changes' : 'Add Link'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Icon Picker Modal */}
      <Dialog open={showIconPicker} onOpenChange={setShowIconPicker}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Choose an Icon</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search icons..."
                value={iconSearchTerm}
                onChange={(e) => setIconSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Icons Grid */}
            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-96 overflow-y-auto">
              {getIconList()
                .filter(iconId => 
                  iconId.toLowerCase().includes(iconSearchTerm.toLowerCase())
                )
                .map(iconId => (
                  <button
                    key={iconId}
                    onClick={() => {
                      handleInputChange('icon', iconId);
                      setShowIconPicker(false);
                      setIconSearchTerm('');
                    }}
                    className="p-3 border rounded-lg hover:bg-accent hover:border-primary transition-colors flex flex-col items-center space-y-1"
                  >
                    {React.createElement(getIcon(iconId), { className: "h-6 w-6" })}
                    <span className="text-xs text-muted-foreground truncate w-full text-center">
                      {iconId}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 