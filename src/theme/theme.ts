import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#E6F6FF',
    100: '#BAE3FF',
    200: '#7CC4FA',
    300: '#47A3F3',
    400: '#2186EB',
    500: '#0967D2',
    600: '#0552B5',
    700: '#03449E',
    800: '#01337D',
    900: '#002159',
  },
};

const components = {
  Button: {
    defaultProps: {
      colorScheme: 'brand',
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'lg',
      },
    },
  },
};

const config = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

const fonts = {
  heading: '"Inter", sans-serif',
  body: '"Inter", sans-serif',
};

export default extendTheme({
  colors,
  components,
  config,
  fonts,
});