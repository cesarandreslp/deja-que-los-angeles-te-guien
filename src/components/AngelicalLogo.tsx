import React from 'react';
import { AngelIcon, DoveIcon, StarIcon, LightIcon } from './icons/AngelIcons';

interface AngelicalLogoProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackType?: 'angel' | 'dove' | 'star' | 'light';
  className?: string;
  onError?: () => void;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const AngelicalLogo: React.FC<AngelicalLogoProps> = ({
  src,
  alt = 'Oráculo Angelical',
  size = 'md',
  fallbackType = 'angel',
  className = '',
  onError
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState(src);

  React.useEffect(() => {
    setImageSrc(src);
    setImageError(false);
  }, [src]);

  const handleImageError = () => {
    setImageError(true);
    if (onError) {
      onError();
    }
  };

  const getFallbackIcon = () => {
    const iconProps = {
      className: `${sizeClasses[size]} text-white drop-shadow-lg`,
      color: 'currentColor'
    };

    switch (fallbackType) {
      case 'dove':
        return <DoveIcon {...iconProps} />;
      case 'star':
        return <StarIcon {...iconProps} />;
      case 'light':
        return <LightIcon {...iconProps} />;
      default:
        return <AngelIcon {...iconProps} />;
    }
  };

  if (!imageSrc || imageError) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {getFallbackIcon()}
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full object-cover shadow-lg ${className}`}
      onError={handleImageError}
    />
  );
};

export default AngelicalLogo;