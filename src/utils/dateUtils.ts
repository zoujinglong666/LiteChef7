

import dayjs from 'dayjs'
import { DateEnum } from '@/enums/dateEnum'
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
export function getFormattedDateOffset(offset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

/**
 * 独立时间工具库（基于 dayjs）
 * 提供安全的日期解析和格式化能力，支持空值处理
 */

/**
 * 格式化为日期时间字符串
 * @param date 可解析的日期值（支持字符串/数字/Date对象/dayjs 实例）
 * @param format 输出格式，默认为 DATE_TIME_FORMAT
 * @returns 格式化后的字符串，无效日期返回空字符串
 */
export function formatToDateTime(
  date?: dayjs.ConfigType,
  format = DateEnum.DATE_TIME_FORMAT,
): string {
  const instance = dayjs(date)
  return instance.isValid() && date ? instance.format(format) : ''
}

/**
 * 格式化为日期字符串
 * @param date 可解析的日期值
 * @param format 输出格式，默认为 DATE_FORMAT
 * @returns 格式化后的字符串，无效日期返回空字符串
 */
export function formatToDate(
  date?: dayjs.ConfigType,
  format = DateEnum.DATE_FORMAT,
): string {
  const instance = dayjs(date)
  return instance.isValid() && date ? instance.format(format) : ''
}

/**
 * 计算两个日期之间的持续时间
 * @param start 开始时间（支持字符串/数字/Date对象/dayjs 实例）
 * @param end 结束时间（支持字符串/数字/Date对象/dayjs 实例）
 * @param unit 时间单位（默认天），可选值：day, hour, minute, second
 * @returns 持续时长（无效日期返回-1）
 */
export function calculateDuration(start: dayjs.ConfigType, end: dayjs.ConfigType, unit: dayjs.ManipulateType = 'day'): number {
  const startDay = dayjs(start)
  const endDay = dayjs(end)
  return startDay.isValid() && endDay.isValid()
    ? endDay.diff(startDay, unit)
    : -1
}
