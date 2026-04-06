/**
 * 云函数调用工具（自动降级）
 */
export async function cloudFn(name: string, data: any = {}): Promise<any> {
  try {
    const res = await uni.cloud.callFunction({
      name,
      data
    })
    return res
  } catch (err) {
    console.warn(`⚠️ ${name} 暂不可用`)
    return null
  }
}
