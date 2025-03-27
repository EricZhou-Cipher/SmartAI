/**
 * 主题配置文件
 * 提供给ChakraProvider使用的基础主题配置
 */
import { extendTheme } from '@chakra-ui/react';

// 使用extendTheme创建主题
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f6ff',
      100: '#b3e0ff',
      500: '#0088cc',
      700: '#005580',
      900: '#003355',
    },
  },
  fonts: {
    heading: 'system-ui, sans-serif',
    body: 'system-ui, sans-serif',
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default theme;
