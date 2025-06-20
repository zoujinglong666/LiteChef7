<route lang="json">
{
"style": { "navigationBarTitleText": "食记" },
"name": "node"
}
</route>
<template>
  <wd-form ref="form" :model="model">
    <wd-cell-group border>
      <wd-textarea
        label="菜名"
        label-width="100px"
        prop="name"
        clearable
        auto-height
        v-model="model.name"
        placeholder="请输入菜名"
        :rules="[{ required: true, message: '请输入菜名' }]"
      />

      <wd-select-picker label="评分"
                        label-width="100px"
                        prop="score"
                        v-model="model.score"
                        :columns="scoreList"
                        placeholder="请选择评分" type="radio"></wd-select-picker>
      <wd-picker
        label="是否推荐"
        placeholder="请选择"
        label-width="100px"
        prop="recommendation"
        v-model="model.recommendation"
        :columns="recommendationList"
      />

      <wd-textarea
        label="备注"
        label-width="100px"
        prop="remark"
        clearable
        show-word-limit
        v-model="model.remark"
        placeholder="请输入备注"
      />
    </wd-cell-group>
    <view class="footer">
      <wd-button style="width: 100%;" type="primary" size="large" @click="handleSubmit" block>提交</wd-button>
    </view>
  </wd-form>
</template>
<script setup lang="ts">
const model = reactive<{
  name: string
  score: string
  recommendation: string
  remark: string
}>({
  name: '',
  score: "",
  recommendation: "",
  remark: ''
})
const scoreList = ref(
  Array.from({length: 10}, (_, i) => ({
    value: (i + 1).toString(),
    label: `${i + 1} 分`
  })).sort((a, b) => {
    return parseInt(b.value) - parseInt(a.value);
  })
)
const recommendationList = ref<any[]>([
  {
    value: '1',
    label: '推荐'
  },
  {
    value: '0',
    label: '不推荐'
  }
])
const form = ref()

function handleSubmit() {
  form.value
    .validate()
    .then(({valid}) => {
      if (valid) {
        const record = {
          ...model,
          createTime: new Date().toLocaleString()
        }
        const records = uni.getStorageSync('food_records') || []
        records.unshift(record) // 最新在最前
        uni.setStorageSync('food_records', records)
        uni.showToast({title: '记录成功', icon: 'success'})
        nextTick(() => {
          model.name = ''
          model.score = ''
          model.recommendation = ''
          model.remark = ''
          uni.navigateBack()
        })

      }
    })
    .catch((error) => {
      console.log(error, 'validate error')
    })
}


</script>


<style scoped>
.footer {
  width: 100%;
  position: fixed;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  box-sizing: border-box;
  border-top: 1px solid #eee;
  padding: 10px;
}
</style>
