// 验证到期天数计算：跨时区、DST、跨年、闰年、空值
// 用法：TZ=Asia/Shanghai node scripts/verify-days.mjs <模拟时刻(本地解析)>
const fixedNow = new Date(process.argv[2])
class MockDate extends Date {
  constructor(...args) {
    if (args.length === 0) { super(fixedNow.getTime()) } else { super(...args) }
  }
  static now() { return fixedNow.getTime() }
}
globalThis.Date = MockDate

const { days, localToday } = await import('../src/data.js')

let pass = 0, fail = 0
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
const eq = (label, actual, expected) => {
  const ok = actual === expected
  console.log(`${ok ? 'PASS' : 'FAIL'}  tz=${tz} now=${process.argv[2]} localToday=${localToday()}  ${label}: got=${actual} want=${expected}`)
  ok ? pass++ : fail++
}

// 所有测试时刻设计为本地日历日 2026-09-16（含临近午夜的边缘时刻）
eq('localToday 必须是本地日期 2026-09-16（而非 UTC 日期）', localToday(), '2026-09-16')
eq('今天到期 = 0（绝不能算成 -1 已过期）', days('2026-09-16'), 0)
eq('明天到期 = 1', days('2026-09-17'), 1)
eq('昨天 = -1', days('2026-09-15'), -1)
// 跨年
eq('跨到下一年 (2027-01-05)', days('2027-01-05'), 111)
eq('上一年末 (2025-12-31)', days('2025-12-31'), -259)
// 闰年：2024 是闰年
eq('闰年 2/28 -> 3/1 = 2 天', days('2024-03-01', '2024-02-28'), 2)
eq('平年 2/28 -> 3/1 = 1 天', days('2023-03-01', '2023-02-28'), 1)
eq('闰日 2024-02-29 与前一天差 1', days('2024-02-29', '2024-02-28'), 1)
eq('整年 2024-02-29 -> 2025-02-28 = 365', days('2025-02-28', '2024-02-29'), 365)
// DST 春秋切换（北美 2026-03-08 春 / 2026-11-01 秋）
eq('跨春令时切换周仍按日历天 7 天', days('2026-03-14', '2026-03-07'), 7)
eq('跨秋令时切换周仍按日历天 7 天', days('2026-11-07', '2026-10-31'), 7)
// 空日期
eq('未填日期 -> null', days(''), null)
eq('null -> null', days(null), null)

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
