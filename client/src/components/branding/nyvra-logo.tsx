interface NyvraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  animated?: boolean;
  className?: string;
}

export function NyvraLogo({ 
  size = 'md', 
  variant = 'full', 
  animated = true,
  className = '' 
}: NyvraLogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24'
  };

  const iconSize = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96
  };

  const currentSize = iconSize[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* NYVRA Icon - Neural Network Pattern */}
      <div className="relative">
        <svg
          width={currentSize}
          height={currentSize}
          viewBox="0 0 100 100"
          className={animated ? 'animate-pulse' : ''}
        >
          {/* Background Circle */}
          <defs>
            <linearGradient id="nyvra-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="nyvra-traction" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
            </linearGradient>
          </defs>
          
          {/* Main Circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="url(#nyvra-gradient)" 
            opacity="0.9"
          />
          
          {/* Neural Network Pattern */}
          <circle cx="30" cy="30" r="3" fill="#ffffff" opacity="0.9" />
          <circle cx="70" cy="30" r="3" fill="#ffffff" opacity="0.9" />
          <circle cx="50" cy="50" r="4" fill="#fbbf24" opacity="1" />
          <circle cx="30" cy="70" r="3" fill="#ffffff" opacity="0.9" />
          <circle cx="70" cy="70" r="3" fill="#ffffff" opacity="0.9" />
          
          {/* Connections */}
          <line x1="30" y1="30" x2="50" y2="50" stroke="#ffffff" strokeWidth="1.5" opacity="0.5" />
          <line x1="70" y1="30" x2="50" y2="50" stroke="#ffffff" strokeWidth="1.5" opacity="0.5" />
          <line x1="30" y1="70" x2="50" y2="50" stroke="#ffffff" strokeWidth="1.5" opacity="0.5" />
          <line x1="70" y1="70" x2="50" y2="50" stroke="#ffffff" strokeWidth="1.5" opacity="0.5" />
          
          {/* Traction Arrows */}
          <path 
            d="M 20 50 L 40 50 L 35 45 M 40 50 L 35 55" 
            stroke="url(#nyvra-traction)" 
            strokeWidth="2" 
            fill="none"
            className={animated ? 'animate-pulse' : ''}
          />
          <path 
            d="M 80 50 L 60 50 L 65 45 M 60 50 L 65 55" 
            stroke="url(#nyvra-traction)" 
            strokeWidth="2" 
            fill="none"
            className={animated ? 'animate-pulse' : ''}
          />
        </svg>
      </div>
      
      {/* NYVRA Text */}
      {variant === 'full' && (
        <div className="flex flex-col">
          <span 
            className="font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent"
            style={{ fontSize: size === 'sm' ? '1.25rem' : size === 'md' ? '1.75rem' : size === 'lg' ? '2.25rem' : '3rem' }}
          >
            NYVRA
          </span>
          {size !== 'sm' && (
            <span className="text-xs text-muted-foreground tracking-wide -mt-1">
              Neural Yield Verification
            </span>
          )}
        </div>
      )}
    </div>
  );
}
