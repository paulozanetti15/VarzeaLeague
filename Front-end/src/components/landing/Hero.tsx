import { MatchesWidgetFixed } from './MatchesWidgetFixed';

interface HeroProps {
  onGetStarted: () => void;
  onViewMatches: () => void;
}

export function Hero({ onGetStarted, onViewMatches }: HeroProps) {
  // Componente moderno e profissional com cores do sistema
  return <MatchesWidgetFixed />;
} 