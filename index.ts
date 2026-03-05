import { type LucideIcon } from 'lucide-react';

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'entrepreneur';

export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'published';

export type EditingMode = 'ai' | 'visual';

export type ScreenType = 'home' | 'detail' | 'list' | 'profile' | 'settings' | 'custom' | 'login' | 'signup' | 'onboarding';

export type ComponentType = 'text' | 'button' | 'input' | 'image' | 'container' | 'card' | 'header' | 'list' | 'icon' | 'divider';

export interface Profile {
  id: string;
  email: string;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  generations_count: number;
  last_generation_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  app_type: string;
  status: ProjectStatus;
  editing_mode: EditingMode;
  current_screen_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Screen {
  id: string;
  project_id: string;
  name: string;
  screen_type: ScreenType;
  background_color: string;
  order_index: number;
  is_home_screen: boolean;
  created_at: string;
  components?: Component[];
}

export interface Component {
  id: string;
  screen_id: string;
  component_type: ComponentType;
  props: ComponentProps;
  styles: ComponentStyles;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  layer_order: number;
  parent_component_id: string | null;
  created_at: string;
}

export interface ComponentProps {
  text?: string;
  placeholder?: string;
  source?: string;
  title?: string;
  subtitle?: string;
  icon?: string;
  itemCount?: number;
  itemHeight?: number;
  spacing?: number;
  itemBackgroundColor?: string;
  itemBorderRadius?: number;
  showBackButton?: boolean;
  fontSize?: number;
  color?: string;
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  borderRadius?: number;
  borderWidth?: number;
  padding?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface ComponentStyles {
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowRadius?: number;
  opacity?: number;
  [key: string]: string | number | undefined;
}

export interface ComponentDefinition {
  type: ComponentType;
  name: string;
  icon: LucideIcon;
  defaultProps: ComponentProps;
  defaultStyles: ComponentStyles;
  defaultWidth: number;
  defaultHeight: number;
}

export interface TemplateComponent {
  type: ComponentType;
  props: ComponentProps;
  styles?: ComponentStyles;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
}

export interface TemplateScreen {
  name: string;
  type: ScreenType;
  background_color?: string;
  components: TemplateComponent[];
}

export interface TemplateData {
  name: string;
  description: string;
  category: string;
  backgroundColor?: string;
  screens: TemplateScreen[];
}

export interface AppTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail_url: string | null;
  is_premium: boolean;
  required_tier: SubscriptionTier;
  template_data: TemplateData;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  project_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  project_id: string | null;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Deployment {
  id: string;
  project_id: string;
  version: string;
  status: 'pending' | 'building' | 'deployed' | 'failed';
  deployment_url: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}
