/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Premium Typography System
      fontFamily: {
        // Primary typeface - optimized for reading
        'primary': [
          '-apple-system',
          'BlinkMacSystemFont', 
          'Segoe UI',
          'Inter',
          'system-ui',
          'sans-serif'
        ],
        // Monospace for code/debug
        'mono': [
          'JetBrains Mono',
          'Fira Code', 
          'SF Mono',
          'Consolas',
          'monospace'
        ],
        // Display font for headlines
        'display': [
          'Inter Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif'
        ]
      },
      
      // Reading Rhythm Typography Scale
      fontSize: {
        // Optimized for mobile-first reading
        'narrative': ['1.125rem', { lineHeight: '1.75', letterSpacing: '0.01em' }],
        'narrative-lg': ['1.25rem', { lineHeight: '1.7', letterSpacing: '0.005em' }], 
        'narrative-xl': ['1.375rem', { lineHeight: '1.65', letterSpacing: '0' }],
        'choice': ['1rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        'choice-lg': ['1.125rem', { lineHeight: '1.5', letterSpacing: '0.015em' }],
        'ui-hint': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.025em' }],
        'debug': ['0.75rem', { lineHeight: '1.3', letterSpacing: '0.05em' }],
      },

      // Enhanced Color System  
      colors: {
        // NOVELI.SH Brand Colors
        'story': {
          'bg': '#0a0a0a',
          'surface': '#1a1a1a', 
          'border': '#2a2a2a',
          'text': '#f5f5f5',
          'text-muted': '#a3a3a3',
          'text-subtle': '#737373',
          'accent': '#3b82f6',
          'accent-hover': '#2563eb',
          'choice-yes': '#10b981',
          'choice-no': '#ef4444',
          'choice-disabled': '#404040',
        },
        // High contrast mode support
        'hc': {
          'bg': '#000000',
          'text': '#ffffff',
          'border': '#666666',
        }
      },

      // Spacing Scale for Reading Rhythm
      spacing: {
        'story-beat': 'clamp(2rem, 8vw, 4rem)',
        'choice-gap': 'clamp(4rem, 12vw, 8rem)',
        'section-gap': 'clamp(3rem, 10vw, 6rem)',
        'micro': '0.125rem',
        'breath': '0.5rem',
        'comfort': '1rem',
        'generous': '2rem',
      },

      // Animation System
      animation: {
        'narrative-reveal': 'narrativeReveal 0.8s ease-out',
        'choice-emphasis': 'choiceEmphasis 0.3s ease-in-out',
        'thinking-pulse': 'thinkingPulse 1.4s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'gentle-bounce': 'gentleBounce 2s ease-in-out infinite',
      },

      keyframes: {
        narrativeReveal: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        choiceEmphasis: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' }
        },
        thinkingPulse: {
          '0%, 80%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '40%': { opacity: '1', transform: 'scale(1)' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        gentleBounce: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-3px)' },
          '60%': { transform: 'translateY(-1px)' }
        }
      },

      // Mobile-First Breakpoints
      screens: {
        'xs': '375px',
        'sm': '640px', 
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Reading-specific breakpoints
        'reading-comfort': '60ch',
        'reading-wide': '80ch',
      },

      // Touch-Friendly Sizing
      minHeight: {
        'touch': '44px',
        'touch-lg': '60px',
        'touch-xl': '72px',
      },

      minWidth: {
        'touch': '44px',
        'touch-lg': '60px', 
        'touch-xl': '72px',
      },

      // Container Queries Support
      maxWidth: {
        'story': '42rem', // ~672px - optimal reading width
        'story-wide': '48rem', // ~768px - wider reading 
        'story-narrow': '36rem', // ~576px - narrow mobile
      },

      // Accessibility-First Focus Rings
      ringWidth: {
        'focus': '3px',
      },

      ringOffsetWidth: {
        'focus': '2px',
      }
    },
  },
  plugins: [
    // Custom plugin for story-specific utilities
    function({ addUtilities, addComponents, theme }) {
      // Story-specific component classes
      addComponents({
        '.narrative-text': {
          fontSize: theme('fontSize.narrative[0]'),
          lineHeight: theme('fontSize.narrative[1].lineHeight'),
          letterSpacing: theme('fontSize.narrative[1].letterSpacing'),
          color: theme('colors.story.text'),
          maxWidth: theme('maxWidth.story'),
          textWrap: 'pretty',
          '@media (min-width: 768px)': {
            fontSize: theme('fontSize.narrative-lg[0]'),
            lineHeight: theme('fontSize.narrative-lg[1].lineHeight'),
          },
          '@media (min-width: 1024px)': {
            fontSize: theme('fontSize.narrative-xl[0]'),
            lineHeight: theme('fontSize.narrative-xl[1].lineHeight'),
          }
        },
        
        '.choice-button': {
          minHeight: theme('minHeight.touch-lg'),
          minWidth: theme('minWidth.touch-lg'),
          fontSize: theme('fontSize.choice[0]'),
          lineHeight: theme('fontSize.choice[1].lineHeight'),
          letterSpacing: theme('fontSize.choice[1].letterSpacing'),
          '@media (min-width: 768px)': {
            minHeight: theme('minHeight.touch-xl'),
            fontSize: theme('fontSize.choice-lg[0]'),
          }
        },

        '.focus-ring': {
          '&:focus': {
            outline: 'none',
            ringWidth: theme('ringWidth.focus'),
            ringColor: theme('colors.story.accent'),
            ringOffsetWidth: theme('ringOffsetWidth.focus'),
            ringOffsetColor: theme('colors.story.bg'),
          }
        }
      });

      // Utility classes for accessibility
      addUtilities({
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        },
        '.not-sr-only': {
          position: 'static',
          width: 'auto',
          height: 'auto',
          padding: '0',
          margin: '0',
          overflow: 'visible',
          clip: 'auto',
          whiteSpace: 'normal',
        }
      });
    }
  ],
  // Dark mode strategy - class-based for manual control
  darkMode: 'class',
}