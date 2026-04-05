/**
 * wot-design-uni 图标映射表
 * 
 * 使用方式：
 * 1. wd-icon 组件：<wd-icon name="add-circle" size="20px" color="#FF6B35" />
 * 2. UnoCSS class：<text class="sn-icon-park-outline:add-four"></text>
 * 
 * wd-icon 内置图标列表（295个）：
 * add, add-circle, arrow-left, arrow-right, arrow-up, arrow-down,
 * check, check-circle, close, close-circle, delete, edit, refresh,
 * search, share, copy, heart, heart-filled, star, star-filled,
 * home, user, setting, clock-circle, calendar, fire, etc.
 * 
 * 完整列表见: node_modules/wot-design-uni/components/wd-icon/index.scss
 * 
 * UnoCSS + Iconify 使用方式（10w+ 图标）：
 * <text class="sn-icon sn-icon-park-outline:图标名"></text>
 * 图标搜索: https://icones.js.org/collection/icon-park-outline
 */

// 常用图标名（直接用于 wd-icon name 属性）
export const icons = {
  // 箭头
  back: 'chevron-left',
  forward: 'chevron-right',
  up: 'chevron-up',
  down: 'chevron-down',
  arrowLeft: 'arrow-left',
  arrowRight: 'arrow-right',
  
  // 操作
  add: 'add',
  addCircle: 'add-circle',
  close: 'close',
  closeCircle: 'close-circle',
  check: 'check',
  checkCircle: 'check-circle',
  delete: 'delete',
  edit: 'edit',
  refresh: 'refresh',
  search: 'search',
  share: 'share',
  copy: 'copy',
  more: 'more',
  
  // 状态
  success: 'check-circle',
  error: 'close-circle',
  warning: 'info-circle',
  info: 'info-circle',
  
  // 用户
  user: 'user',
  setting: 'setting',
  notification: 'notification',
  
  // 收藏
  heart: 'heart',
  heartFilled: 'heart-filled',
  star: 'star',
  starFilled: 'star-filled',
  
  // 时间
  clock: 'clock-circle',
  timer: 'clock-circle',
  calendar: 'calendar',
  
  // 文件
  folder: 'folder',
  file: 'file',
  image: 'image',
  camera: 'camera',
  
  // 导航
  home: 'home',
  menu: 'menu',
  list: 'list',
  
  // 厨房工具
  stopwatch: 'clock-circle',
  scale: 'chart-bar',
  balance: 'chart-pie',
  fire: 'fire',
  snowflake: 'snowflake',
  
  // 其他
  location: 'location',
  phone: 'phone',
  email: 'mail',
  link: 'link',
  lock: 'lock',
  eye: 'browse',
  filter: 'filter',
  download: 'download',
  upload: 'upload',
  shop: 'shop',
  cart: 'cart',
  goods: 'goods',
  tag: 'label',
  crown: 'crown',
  vip: 'vip',
}

// 导出类型
export type IconName = typeof icons[keyof typeof icons]
