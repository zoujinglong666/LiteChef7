export const getDayOfWeek = (): string => {
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const today = new Date();
  return days[today.getDay()];
};

export const getFormattedDate = (): string => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  return `${month}月${date}日`;
};
