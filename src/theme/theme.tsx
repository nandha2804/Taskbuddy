import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Primary
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  fonts: {
    heading: "'Plus Jakarta Sans', sans-serif",
    body: "'Plus Jakarta Sans', sans-serif",
  },
  styles: {
    global: {
      body: {
        minHeight: '100vh',
        bg: 'gray.50',
        color: 'gray.900',
      },
    },
  },
  shadows: {
    xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'xl',
      },
      defaultProps: {
        colorScheme: 'brand',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          boxShadow: 'sm',
          _hover: {
            bg: 'brand.600',
            transform: 'translateY(-1px)',
            boxShadow: 'md',
          },
          _active: {
            bg: 'brand.700',
            transform: 'translateY(0)',
            boxShadow: 'sm',
          },
        },
        outline: {
          borderColor: 'brand.500',
          color: 'brand.500',
          _hover: {
            bg: 'brand.50',
            borderColor: 'brand.600',
          },
        },
        ghost: {
          _hover: {
            bg: 'gray.50',
          },
          _active: {
            bg: 'gray.100',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          bg: 'white',
          overflow: 'hidden',
          boxShadow: 'sm',
          borderWidth: '1px',
          borderColor: 'gray.200',
          transition: 'all 0.2s',
          _hover: {
            boxShadow: 'md',
            borderColor: 'gray.300',
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: 'semibold',
        color: 'gray.900',
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'gray.50',
            borderRadius: 'xl',
            _hover: {
              bg: 'gray.100',
            },
            _focus: {
              bg: 'white',
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    Menu: {
      baseStyle: {
        list: {
          bg: 'white',
          borderRadius: 'xl',
          border: '1px solid',
          borderColor: 'gray.200',
          boxShadow: 'lg',
          py: 2,
        },
        item: {
          _hover: {
            bg: 'gray.50',
          },
          _focus: {
            bg: 'gray.50',
          },
        },
      },
    },
  },
});

export default theme;