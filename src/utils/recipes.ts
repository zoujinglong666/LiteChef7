export interface Recipe {
  id: string;
  name: string;
  image: string;
  tags: string[];
  cookTime: string;
  difficulty: number;
  description: string;
  ingredients: string[];
  steps: string[];
}

export const recipeDatabase: Recipe[] = [
  {
    id: '1',
    name: '蒸蛋羹',
    image: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['清淡', '快手', '营养'],
    cookTime: '12分钟',
    difficulty: 2,
    description: '口感嫩滑，营养丰富',
    ingredients: ['鸡蛋 2个', '温水 120ml', '盐 少许', '香油 几滴', '葱花 适量'],
    steps: ['鸡蛋打散过筛', '加温水搅匀', '蒸锅水开后蒸10分钟', '出锅淋香油撒葱花']
  },
  {
    id: '2',
    name: '红烧排骨',
    image: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['下饭', '荤菜', '经典'],
    cookTime: '45分钟',
    difficulty: 3,
    description: '色泽红亮，肉质软烂',
    ingredients: ['猪排骨 500g', '生抽 2勺', '老抽 1勺', '冰糖 适量', '姜片 3片', '料酒 1勺'],
    steps: ['排骨焯水去腥', '热锅放冰糖炒糖色', '下排骨炒至上色', '加调料和热水', '小火炖煮40分钟', '大火收汁即可']
  },
  {
    id: '3',
    name: '西红柿鸡蛋',
    image: 'https://images.pexels.com/photos/6419197/pexels-photo-6419197.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['快手', '经典', '营养'],
    cookTime: '15分钟',
    difficulty: 1,
    description: '酸甜开胃，营养均衡',
    ingredients: ['西红柿 2个', '鸡蛋 3个', '糖 1勺', '盐 适量', '葱花 适量'],
    steps: ['鸡蛋打散炒熟盛起', '西红柿切块炒出汁', '加入鸡蛋翻炒', '调味撒葱花即可']
  },
  {
    id: '4',
    name: '麻婆豆腐',
    image: 'https://images.pexels.com/photos/4193298/pexels-photo-4193298.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['川菜', '下饭', '麻辣'],
    cookTime: '20分钟',
    difficulty: 3,
    description: '麻辣鲜香，嫩滑爽口',
    ingredients: ['嫩豆腐 400g', '肉末 100g', '豆瓣酱 2勺', '花椒粉 适量', '葱花 适量'],
    steps: ['豆腐切块焯水', '炒香肉末和豆瓣酱', '加水烧开下豆腐', '调味勾芡', '撒花椒粉和葱花']
  },
  {
    id: '5',
    name: '糖醋里脊',
    image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['酸甜', '荤菜', '经典'],
    cookTime: '30分钟',
    difficulty: 4,
    description: '外酥内嫩，酸甜开胃',
    ingredients: ['里脊肉 300g', '番茄酱 3勺', '醋 2勺', '糖 2勺', '淀粉 适量'],
    steps: ['里脊肉切条腌制', '裹淀粉炸至金黄', '调糖醋汁', '下炸好的肉条', '快速翻炒裹汁即可']
  },
  {
    id: '6',
    name: '宫保鸡丁',
    image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['川菜', '下饭', '经典'],
    cookTime: '25分钟',
    difficulty: 3,
    description: '鸡肉嫩滑，花生香脆',
    ingredients: ['鸡胸肉 300g', '花生米 100g', '干辣椒 10个', '花椒 1勺', '葱白 2根'],
    steps: ['鸡肉切丁腌制', '花生米炸酥', '爆炒鸡丁至变色', '下配菜炒匀', '调味汁炒匀即可']
  },
  {
    id: '7',
    name: '清蒸鲈鱼',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['清淡', '营养', '蒸菜'],
    cookTime: '20分钟',
    difficulty: 2,
    description: '鱼肉鲜嫩，营养丰富',
    ingredients: ['鲈鱼 1条', '蒸鱼豉油 3勺', '料酒 1勺', '姜丝 适量', '葱丝 适量'],
    steps: ['鲈鱼处理干净', '鱼身划刀腌制', '蒸锅水开蒸8分钟', '倒掉蒸汁', '淋蒸鱼豉油撒葱丝']
  },
  {
    id: '8',
    name: '蒜蓉小白菜',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['快手', '下饭', '清淡'],
    cookTime: '10分钟',
    difficulty: 1,
    description: '清爽不腻，营养丰富',
    ingredients: ['小白菜 300g', '大蒜 4瓣', '生抽 1勺', '盐 适量', '油 适量'],
    steps: ['小白菜洗净切段', '大蒜拍碎切末', '热锅下油爆香蒜末', '下小白菜大火炒制', '调味即可出锅']
  }
];



export const getRandomRecipes = (count: number = 2): Recipe[] => {
  const shuffled = [...recipeDatabase].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getTodayRecipes = (): Recipe[] => {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  const random = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const indices = [];
  let currentSeed = seed;

  while (indices.length < 2) {
    const index = Math.floor(random(currentSeed) * recipeDatabase.length);
    if (!indices.includes(index)) {
      indices.push(index);
    }
    currentSeed++;
  }

  return indices.map(i => recipeDatabase[i]);
};
