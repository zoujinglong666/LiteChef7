const navigateToInterceptor = {
  invoke({url}: { url: string }) {
    // 判断是否登录
    return !!url;
  },
};

export const routeInterceptor = {
  install() {
    uni.addInterceptor('navigateTo', navigateToInterceptor);
    uni.addInterceptor('reLaunch', navigateToInterceptor);
    uni.addInterceptor('redirectTo', navigateToInterceptor);
  },
};
