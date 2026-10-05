// 到期计算统一使用“本地日历日期”口径：今天取设备本地日期，
// 证件日期（YYYY-MM-DD）按同一口径拆解；两者都折算到 UTC 午夜求天数差，
// 不受本地时区偏移与夏令时影响，跨年、闰年同样是整数天。
// 只在计算时读取日期，不修改任何已保存数据的原始日期值。
const pad2 = (n) => String(n).padStart(2, '0')
const toDateString = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
// 每次调用实时取本地日期，避免模块加载后跨天长期不刷新
export const localToday = () => toDateString(new Date())
const dayStart = (date) => {
  const [y, m, d] = date.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}
// 剩余天数：到期日相对今天（本地日历日）的整数天差；0 = 今天到期，负数 = 已过期；未填日期返回 null
const days = (date, from = localToday()) => {
  if (!date) return null
  return Math.round((dayStart(date) - dayStart(from)) / 86400000)
}
export const config = {
  storageKey: 'family-document-keeper-v1',
  brand: '家档管家', subtitle: 'Family Archive', icon: 'FolderLock', entityLabel: '证件档案', secondaryLabel: '家庭保险', historyLabel: '使用记录', heroTitle: '让重要文件，始终井然有序。', heroCopy: '证件、保单和家庭文件，都有清晰的去处与提醒。', createLabel: '新建档案',
  nav: [{ id: 'overview', label: '总览' }, { id: 'documents', label: '证件档案' }, { id: 'history', label: '使用记录' }, { id: 'insurance', label: '家庭保险' }, { id: 'achievements', label: '成就与榜单' }],
  metrics: [
    { label: '证件总数', collection: 'documents', tone: 'green' },
    { label: '90天内到期', tone: 'peach', value: (s) => s.documents.filter((x) => x.expires && days(x.expires) >= 0 && days(x.expires) <= 90).length },
    { label: '已过期', tone: 'red', value: (s) => s.documents.filter((x) => x.expires && days(x.expires) < 0).length },
    { label: '外借未还', tone: 'blue', value: (s) => s.usages.filter((x) => x.status === '借用中').length },
  ],
  form: { title: '新建证件档案', collection: 'documents', fields: [
    ['name', '证件名称', '身份证'], ['category', '类别', '身份类'], ['holder', '持有人', '林小满'], ['number', '证件号码', '110***********'], ['issued', '签发日期', '2023-01-01', 'date'], ['expires', '有效期至', '2033-01-01', 'date'], ['issuer', '发证机关', 'XX市公安局'], ['location', '存放位置', '保险柜'], ['copyLocation', '复印件位置', '云盘 / 家庭共享'], ['notes', '备注', ''],
  ]},
  categories: ['身份类', '资产类', '合同类', '医疗类', '教育类', '其他'],
  achievements: ['首次建档', '证件齐全', '零过期遗忘', '续办及时', '家庭档案大师', '收纳有序', '安全存档', '保险规划师', '使用有迹', '家庭守护者', '资料无忧', '档案领航员']
}
export const seed = {
  documents: [
    { id: 'doc-1', name: '林小满身份证', category: '身份类', holder: '林小满', number: '110***********', issued: '2023-01-18', expires: '2033-01-18', issuer: '杭州市公安局', location: '保险柜 · A-02', copyLocation: '家庭云盘 / 身份证', notes: '正反面已扫描' },
    { id: 'doc-2', name: '家庭医疗保险合同', category: '医疗类', holder: '林家', number: 'POL-2026-019', issued: '2026-01-01', expires: '2026-11-20', issuer: '安和保险', location: '书房文件盒', copyLocation: '云盘 / 保单', notes: '续保前确认受益人' },
    { id: 'doc-3', name: '周末房产合同', category: '资产类', holder: '林小满', number: 'PROP-0081', issued: '2024-06-12', expires: '2026-08-10', issuer: '杭城置业', location: '主卧抽屉', copyLocation: '云盘 / 房产', notes: '已过期的合同提醒仅供归档' },
  ],
  usages: [{ id: 'use-1', documentId: 'doc-1', date: '2026-09-16', purpose: '办理银行业务', borrower: '林小满', status: '借用中', note: '周五归还' }, { id: 'use-2', documentId: 'doc-2', date: '2026-08-11', purpose: '理赔资料', borrower: '林小满', status: '已归还', note: '' }],
  policies: [{ id: 'pol-1', company: '安和保险', type: '家庭医疗险', number: 'AH-33001', insured: '林家', expires: '2026-11-20', premium: 2890, payment: '年缴' }],
}
export { days }
