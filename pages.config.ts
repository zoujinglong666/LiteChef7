import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages';

export default defineUniPages({
  globalStyle: {
    navigationStyle: 'custom',
    navigationBarTitleText: 'LiteChef',
    navigationBarBackgroundColor: '#FF6B35',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FFFAF6',
  },
  easycom: {
    autoscan: true,
    custom: {
      '^wd-(.*)': 'wot-design-uni/components/wd-$1/wd-$1.vue',
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
        iconPath: 'static/tabbar/home_default.png',
        selectedIconPath: 'static/tabbar/home_active.png',
      },
      {
        pagePath: 'pages/recipeSquare/index',
        text: '广场',
        iconPath: 'static/tabbar/square.png',
        selectedIconPath: 'static/tabbar/square-active.png',
      },
      {
        pagePath: 'pages/my/index',
        text: '我的',
        iconPath: 'static/tabbar/my_default.png',
        selectedIconPath: 'static/tabbar/my_active.png',
      },
    ],
  },
});
