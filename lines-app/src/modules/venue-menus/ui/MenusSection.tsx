"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, FileText, Download, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FeatureSlider, menusFeatures } from "@/modules/feature-slider";
import { PageHero, getPageConfig } from "@/modules/demo-system";

type Menu = {
  id: string;
  name: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
};

type MenusSectionProps = {
  venueId: string;
  menus: Menu[];
  onRefresh: () => void;
};

export function MenusSection({ menus, onRefresh }: MenusSectionProps) {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeatureSlider, setShowFeatureSlider] = useState(menus.length === 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !file) {
      toast({
        title: "שגיאה",
        description: "נא למלא את כל השדות",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // TODO: Implement actual upload
    setTimeout(() => {
      toast({
        title: "הצלחה",
        description: `התפריט "${name}" הועלה בהצלחה`
      });
      setIsCreateOpen(false);
      setName("");
      setFile(null);
      setIsSubmitting(false);
      onRefresh();
    }, 1000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const pageConfig = getPageConfig("menus");

  return (
    <div className="space-y-4">
      {/* Page Hero */}
      {pageConfig && (
        <PageHero hero={pageConfig.hero} cta={pageConfig.cta} className="mb-8" />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">תפריטים</h2>
          <p className="text-sm text-muted-foreground">העלה וניהול תפריטים ומסמכים</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} data-tour="menus-upload">
          <Plus className="ml-2 h-4 w-4" />
          העלה תפריט
        </Button>
      </div>

      {/* Feature Slider */}
      {showFeatureSlider && (
        <div className="mb-8">
          <FeatureSlider
            features={menusFeatures.map((f) => ({
              ...f,
              actions: f.actions?.map((a) => ({
                ...a,
                onClick: () => {
                  if (a.label === "העלה תפריט") {
                    setIsCreateOpen(true);
                    setShowFeatureSlider(false);
                  }
                }
              }))
            }))}
            config={{
              autoPlay: true,
              autoPlayInterval: 4000,
              showDots: true,
              showArrows: true,
              slidesToShow: 1,
              infinite: true
            }}
            onAction={(featureId, actionLabel) => {
              if (actionLabel === "העלה תפריט") {
                setIsCreateOpen(true);
                setShowFeatureSlider(false);
              }
            }}
            onClose={() => setShowFeatureSlider(false)}
            className="mb-6"
          />
        </div>
      )}

      {menus.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold">אין תפריטים</h3>
            <p className="text-sm text-muted-foreground">העלה את התפריט הראשון שלך</p>
            <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
              <Upload className="ml-2 h-4 w-4" />
              העלה עכשיו
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-tour="menus-list">
          {menus.map((menu, index) => (
            <Card key={menu.id} data-tour={index === 0 ? "menus-list" : undefined}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="text-base">{menu.name}</span>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">סוג:</span>
                  <Badge variant="secondary">{menu.fileType}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">גודל:</span>
                  <span>{formatFileSize(menu.fileSize)}</span>
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="ml-1 h-3 w-3" />
                  הורד
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>העלאת תפריט</DialogTitle>
            <DialogDescription>העלה תפריט PDF או תמונה</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="menuName">שם התפריט *</Label>
                <Input
                  id="menuName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="תפריט ראשי"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="menuFile">קובץ *</Label>
                <Input
                  id="menuFile"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={isSubmitting}
              >
                ביטול
              </Button>
              <Button type="submit" disabled={isSubmitting || !name || !file}>
                {isSubmitting ? "מעלה..." : "העלה"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
