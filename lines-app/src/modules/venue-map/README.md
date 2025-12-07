# Venue Map Module

Manages venue floor plan maps with zones, tables, and special areas.

This module provides a comprehensive floor plan editor for creating and managing venue layouts.

## Features

- **Simple Mode (Default)**: Simplified interface perfect for beginners - easy to use for anyone, regardless of technical background
- **Advanced Mode**: Full-featured editor with all professional tools
- Interactive floor plan editor with drag-and-drop
- Zones, tables, and special areas (entrance, exit, kitchen, restroom, etc.)
- Custom templates support
- Export to PNG/JPEG/PDF
- Infinite canvas with pan and zoom
- Pan/Select mode toggle
- **BETA Status**: Currently in beta - interface is being continuously improved

## Simple Mode

The Simple Mode is the default interface, designed to be intuitive and easy to use:

- Only essential buttons: Templates, Add Element
- Clean, uncluttered toolbar
- Easy switching to Advanced Mode when needed
- Perfect for users of all ages and technical levels

## Structure

- `ui/` - React components (FloorPlanEditorV2, VenueMapPage, FreeTransform)
- `actions/` - Server actions (floorPlanActions, templateActions)
- `utils/` - Utility functions (history, clipboard, alignment, etc.)
- `config/` - Design tokens and configuration
- `schemas/` - Zod schemas for validation
