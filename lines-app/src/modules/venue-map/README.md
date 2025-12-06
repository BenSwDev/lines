# Venue Map Module

Manages venue floor plan maps with zones, tables, and special areas.

This module provides a comprehensive floor plan editor for creating and managing venue layouts.

## Features

- Interactive floor plan editor with drag-and-drop
- Zones, tables, and special areas (entrance, exit, kitchen, restroom, etc.)
- Custom templates support
- Export to PNG/JPEG/PDF
- Infinite canvas with pan and zoom
- Pan/Select mode toggle

## Structure

- `ui/` - React components (FloorPlanEditorV2, VenueMapPage, FreeTransform)
- `actions/` - Server actions (floorPlanActions, templateActions)
- `utils/` - Utility functions (history, clipboard, alignment, etc.)
- `config/` - Design tokens and configuration
- `schemas/` - Zod schemas for validation

