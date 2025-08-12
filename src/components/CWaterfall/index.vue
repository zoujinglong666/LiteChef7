<template>
  <scroll-view
    scroll-y
    class="waterfall"
    @scrolltolower="handleLoadMore"
    enable-back-to-top
  >
    <view
      class="columns"
      :style="{ gap: gap + 'px', padding: gap + 'px' }"
    >
      <view
        v-for="(col, colIndex) in columns"
        :key="colIndex"
        class="column"
      >
        <view
          v-for="(item, itemIndex) in col"
          :key="item[itemKey]"
          class="item"

          :style="{ marginBottom: itemIndex < col.length - 1 ? gap + 'px' : '0px' }"
        >
          <slot name="item" :item="item" />
        </view>
      </view>
    </view>

    <view v-if="loading" class="loading">加载中...</view>
    <view v-if="finished" class="finished">没有更多了</view>
  </scroll-view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  request: (page: number, pageSize: number) => Promise<any[]>  // 分页数据请求函数
  itemKey: string                             // 列表项唯一键
  cols?: number                               // 列数，默认 2
  gap?: number                                // 列间距/内边距，默认 10
  pageSize?: number                                // 列间距/内边距，默认 10
  imageField?: string                                // 列间距/内边距，默认 10
}>(), {
  cols: 2,
  gap: 10,
  pageSize: 10,
})

/** 每列存放的 item 列表 */
const columns = ref<any[][]>([])
/** 每列当前累计高度，用来找“最矮列” */
const heights = ref<number[]>([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = ref(10)
const gap = props.gap

/** 初始化列结构，支持热更新 cols */
function initColumns() {
  columns.value = Array.from({length: props.cols}, () => [])
  heights.value = Array(props.cols).fill(0)
}

initColumns()

watch(() => props.cols, initColumns)

/** 把 item 分配到当前最矮的那列 */
function distribute(items: any[]) {
  items.forEach(item => {
    console.log(item)
    const minIndex = heights.value.indexOf(Math.min(...heights.value))
    columns.value[minIndex].push(item)
    heights.value[minIndex] += item._height || 0
  })
}

/** 加载更多数据（分页）*/
async function handleLoadMore() {
  if (loading.value || finished.value) return
  loading.value = true

  const data = await props.request(page.value, pageSize.value)
  if (!data?.length) {
    finished.value = true
    loading.value = false
    return
  }

  // 预先获取每张图的高宽比
  await Promise.all(
    data.map(item =>
      getImageRatio(item[props.imageField || 'url']).then(r => (item._height = r))
    )
  )

  distribute(data)
  page.value++
  loading.value = false
}

/** 获取图片高宽比（高 / 宽），失败兜底 1 */
function getImageRatio(url: string): Promise<number> {
  return new Promise(resolve => {
    uni.getImageInfo({
      src: url,
      success: res => resolve(res.height / res.width),
      fail: () => resolve(1),
    })
  })
}

onMounted(handleLoadMore)
</script>

<style scoped>
.waterfall {
  height: 100vh;
  width: 100%;
  overflow-x: hidden;
  background-color: #f5f5f5;
}

/* Flex + gap 自动均分列宽，无需手算百分比 */
.columns {
  display: flex;
  align-items: flex-start; /* 防止 baseline 对齐导致错位 */
}

.column {
  flex: 1 1 0;
  min-width: 0; /* 防止超宽换行 */
}

.loading,
.finished {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin: 10px 0;
}
</style>
