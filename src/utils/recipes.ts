// 导入mock数据
import allRecipesData from '@/mockData/all_recipes.json'

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

// 将mock数据转换为Recipe格式
export const convertMockDataToRecipe = (mockData: any): Recipe => {
  // 从食材字符串中提取标签
  const ingredientsArray = mockData.ingredients.split('、');
  const tags = [
    // 根据食材数量确定标签
    ingredientsArray.length <= 5 ? '简单' : '丰富',
    // 根据名称确定菜系
    mockData.name.includes('炒') ? '快手' :
      mockData.name.includes('汤') ? '营养' :
        mockData.name.includes('烧') ? '下饭' : '家常',
    // 随机添加一个标签
    ['营养', '美味', '经典', '下饭', '快手'][Math.floor(Math.random() * 5)]
  ];

  // 随机生成难度
  const difficulty = Math.floor(Math.random() * 5) + 1;

  // 随机生成烹饪时间
  const cookTimes = ['10分钟', '15分钟', '20分钟', '30分钟', '45分钟', '60分钟'];
  const cookTime = cookTimes[Math.floor(Math.random() * cookTimes.length)];

  // 生成描述
  const descriptions = [
    '色香味俱全，回味无穷',
    '口感鲜美，营养丰富',
    '制作简单，美味可口',
    '家常美味，老少皆宜',
    '色泽诱人，香气四溢'
  ];
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];

  // 生成步骤
  const steps = ['准备食材', '清洗处理', '烹饪', '装盘'];

  return {
    id: mockData.url.split('/').filter(Boolean).pop() || String(Math.random()),
    name: mockData.name,
    image: mockData.cover_image,
    tags: tags,
    cookTime: cookTime,
    difficulty: difficulty,
    description: description,
    ingredients: ingredientsArray,
    steps: steps
  };
};

export const getRandomRecipes = (count: number = 2): Recipe[] => {
  // 随机选择mock数据
  const shuffled = [...allRecipesData].sort(() => 0.5 - Math.random());
  const selectedMockData = shuffled.slice(0, count);

  // 转换为Recipe格式
  return selectedMockData.map(item => convertMockDataToRecipe(item));
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
    const index = Math.floor(random(currentSeed) * allRecipesData.length);
    if (!indices.includes(index)) {
      indices.push(index);
    }
    currentSeed++;
  }

  // 转换为Recipe格式
  return indices.map(i => convertMockDataToRecipe(allRecipesData[i]));
};
