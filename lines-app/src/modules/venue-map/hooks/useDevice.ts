/**
 * Device Detection Hook
 * Detects device type and capabilities for adaptive UI
 */

import { useState, useEffect } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";
export type InputType = "touch" | "mouse" | "both";

export interface DeviceInfo {
  type: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  inputType: InputType;
  hasTouch: boolean;
  hasMouse: boolean;
  pixelRatio: number;
  orientation: "portrait" | "landscape";
}

const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: Infinity
} as const;

export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === "undefined") {
      return {
        type: "desktop",
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: 1920,
        height: 1080,
        inputType: "mouse",
        hasTouch: false,
        hasMouse: true,
        pixelRatio: 1,
        orientation: "landscape"
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const hasMouse = window.matchMedia("(pointer: fine)").matches;
    
    let type: DeviceType = "desktop";
    if (width < BREAKPOINTS.mobile) {
      type = "mobile";
    } else if (width < BREAKPOINTS.tablet) {
      type = "tablet";
    }

    const inputType: InputType = hasTouch && hasMouse ? "both" : hasTouch ? "touch" : "mouse";
    const orientation = width > height ? "landscape" : "portrait";
    const pixelRatio = window.devicePixelRatio || 1;

    return {
      type,
      isMobile: type === "mobile",
      isTablet: type === "tablet",
      isDesktop: type === "desktop",
      width,
      height,
      inputType,
      hasTouch,
      hasMouse,
      pixelRatio,
      orientation
    };
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const hasMouse = window.matchMedia("(pointer: fine)").matches;
      
      let type: DeviceType = "desktop";
      if (width < BREAKPOINTS.mobile) {
        type = "mobile";
      } else if (width < BREAKPOINTS.tablet) {
        type = "tablet";
      }

      const inputType: InputType = hasTouch && hasMouse ? "both" : hasTouch ? "touch" : "mouse";
      const orientation = width > height ? "landscape" : "portrait";
      const pixelRatio = window.devicePixelRatio || 1;

      setDeviceInfo({
        type,
        isMobile: type === "mobile",
        isTablet: type === "tablet",
        isDesktop: type === "desktop",
        width,
        height,
        inputType,
        hasTouch,
        hasMouse,
        pixelRatio,
        orientation
      });
    };

    updateDeviceInfo();
    window.addEventListener("resize", updateDeviceInfo);
    window.addEventListener("orientationchange", updateDeviceInfo);

    return () => {
      window.removeEventListener("resize", updateDeviceInfo);
      window.removeEventListener("orientationchange", updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

