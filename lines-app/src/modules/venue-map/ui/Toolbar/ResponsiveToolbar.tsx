/**
 * Responsive Toolbar Component
 * Adapts to device type (mobile/tablet/desktop)
 */

"use client";

import { useDevice } from "../../hooks";
import { MobileToolbar } from "./MobileToolbar";
import { DesktopToolbar } from "./DesktopToolbar";

interface ResponsiveToolbarProps {
  // Simple mode
  simpleMode: boolean;
  onToggleSimpleMode: () => void;
  
  // Actions
  onTemplateClick: () => void;
  onAddElementClick: () => void;
  onSaveClick: () => void;
  isSaving?: boolean;
  
  // Stats
  tablesCount?: number;
  totalCapacity?: number;
  validationWarningsCount?: number;
  
  // Advanced features (optional)
  onAutoFix?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  
  // Fullscreen
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function ResponsiveToolbar({
  simpleMode,
  onToggleSimpleMode,
  onTemplateClick,
  onAddElementClick,
  onSaveClick,
  isSaving = false,
  tablesCount = 0,
  totalCapacity = 0,
  validationWarningsCount = 0,
  onAutoFix,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  isFullscreen = false,
  onToggleFullscreen
}: ResponsiveToolbarProps) {
  const device = useDevice();

  // Mobile: Use bottom sheet toolbar
  if (device.isMobile) {
    return (
      <MobileToolbar
        simpleMode={simpleMode}
        onToggleSimpleMode={onToggleSimpleMode}
        onTemplateClick={onTemplateClick}
        onAddElementClick={onAddElementClick}
        onSaveClick={onSaveClick}
        isSaving={isSaving}
        tablesCount={tablesCount}
        totalCapacity={totalCapacity}
        validationWarningsCount={validationWarningsCount}
        onAutoFix={onAutoFix}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    );
  }

  // Desktop/Tablet: Use full toolbar
  return (
    <DesktopToolbar
      simpleMode={simpleMode}
      onToggleSimpleMode={onToggleSimpleMode}
      onTemplateClick={onTemplateClick}
      onAddElementClick={onAddElementClick}
      onSaveClick={onSaveClick}
      isSaving={isSaving}
      tablesCount={tablesCount}
      totalCapacity={totalCapacity}
      validationWarningsCount={validationWarningsCount}
      onAutoFix={onAutoFix}
      onUndo={onUndo}
      onRedo={onRedo}
      canUndo={canUndo}
      canRedo={canRedo}
      isFullscreen={isFullscreen}
      onToggleFullscreen={onToggleFullscreen}
      isTablet={device.isTablet}
    />
  );
}

