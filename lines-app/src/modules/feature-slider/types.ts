export type FeatureAction = {
  label: string;
  onClick: () => void;
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link";
};

export type FeatureCard = {
  id: string;
  title: string;
  description: string;
  icon?: string; // Emoji or icon name
  image?: string; // Image URL
  gradient?: string; // Gradient colors
  actions?: FeatureAction[];
  badge?: string;
  highlight?: boolean;
};

export type FeatureSliderConfig = {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  slidesToShow?: number;
  infinite?: boolean;
};

