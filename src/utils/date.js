// 到期计算的唯一口径：本地日历日。
// 存储中的证件日期是不带时区的 YYYY-MM-DD（即“本地墙上的日期”），
// “今天”也必须取本地墙上的日期，二者按日历日序数求差：
//  - 不经过 toISOString()（那是 UTC 日期，临近午夜会与本地差一天）；
//  - 不做本地午夜时间戳之差（夏令时切换日为 23/25 小时，会产生 ±1 误差）；
//  - 序数在 UTC 轴上构造，只是把本地日历分量映射成连续整数，与运行时时区无关。
// 这些函数只读取并解析日期字符串，不会修改任何已保存的数据。

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

// 解析并严格校验 YYYY-MM-DD（拒绝 2026-02-31 这类不存在的日期）
function parseParts(date) {
  if (typeof date !== 'string') return null
  const match = DATE_RE.exec(date)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const probe = new Date(Date.UTC(year, month - 1, day))
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    return null
  }
  return { year, month, day }
}

// 本地日历日 -> 连续序数（整数天）。Date.UTC 轴没有夏令时，差值恒为整数天。
function dayIndex(year, month, day) {
  return Date.UTC(year, month - 1, day) / 86400000
}

// 本地时区的今天，格式 YYYY-MM-DD；每次调用实时获取，跨午夜自动正确
export function todayLocal(now = new Date()) {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 剩余天数：今天到期返回 0；未来为正、过期为负；日期缺失或非法返回 null。
// 剩余天数、已过期判断、临期排序全部共用这一个纯函数，任意时刻口径一致。
export function daysUntil(date, now = new Date()) {
  const target = parseParts(date)
  if (!target) return null
  return dayIndex(target.year, target.month, target.day) - dayIndex(now.getFullYear(), now.getMonth() + 1, now.getDate())
}
