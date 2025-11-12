import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDyslexiaMode } from "@/hooks/useDyslexiaMode";
import { Type, Contrast, ZoomIn } from "lucide-react";

interface AccessibilityControlsProps {
  onClose?: () => void;
}

const AccessibilityControls = ({ onClose }: AccessibilityControlsProps) => {
  const { isDyslexiaMode, toggleDyslexiaMode } = useDyslexiaMode();

  return (
    <Card 
      className="shadow-[var(--shadow-medium)]"
      style={{ 
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-card)'
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Contrast className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
          Accessibility Options
        </CardTitle>
        <CardDescription>
          Customize your reading experience for better comfort and clarity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dyslexia-Friendly Font */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center gap-3">
            <Type className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-0.5">
              <Label htmlFor="dyslexia-mode" className="text-sm font-medium">
                Dyslexia-friendly font
              </Label>
              <p className="text-xs text-muted-foreground">
                Use Atkinson Hyperlegible font designed for better readability
              </p>
            </div>
          </div>
          <Switch
            id="dyslexia-mode"
            checked={isDyslexiaMode}
            onCheckedChange={toggleDyslexiaMode}
          />
        </div>

        {/* Coming Soon Features */}
        <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs font-medium text-muted-foreground mb-3">COMING SOON</p>
          
          <div className="space-y-3 opacity-60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ZoomIn className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">Text size</Label>
                  <p className="text-xs text-muted-foreground">Adjust font size (A-, A, A+)</p>
                </div>
              </div>
              <Switch disabled />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Contrast className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">High contrast</Label>
                  <p className="text-xs text-muted-foreground">Increase color contrast for better visibility</p>
                </div>
              </div>
              <Switch disabled />
            </div>
          </div>
        </div>

        {onClose && (
          <Button onClick={onClose} className="w-full mt-4">
            Done
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AccessibilityControls;
