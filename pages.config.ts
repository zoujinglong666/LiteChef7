import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages';
import { name } from './package.json';

/**
 * 全局配置
 */
export default defineUniPages({
  globalStyle: {
    navigationStyle: 'custom',
    navigationBarTitleText: name,
    navigationBarBackgroundColor: '#FF6B35',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FFFAF6',
  },
  easycom: {
    autoscan: true,
    custom: {
      '^wd-(.*)': 'wot-design-uni/components/wd-$1/wd-$1.vue',
      '^su-(.*)': '@/components/su-$1.vue'
    },
  },
  tabBar: {
    color: '#BBBBBB',
    selectedColor: '#FF6B35',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    height: '56px',
    fontSize: '11px',
    iconWidth: '26px',
    spacing: '2px',
    list: [
      {
        pagePath: 'pages/moodRecipe/index',
        text: '心情',
      },
      {
        pagePath: 'pages/my/index',
        text: '我的',
      },
    ],
  },
});
