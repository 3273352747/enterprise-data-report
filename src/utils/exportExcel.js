function createTimestamp() {
    const now = new Date()
    const pad = (value) => String(value).padStart(2,'0')

    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`
}

export async function exportInvalidRows(rows) {
    if(!rows.length)
        return false

    const { utils, writeFile } = await import('xlsx')

    const exportData = rows.map((row) => ({
    Excel行号: row.rowNumber,
    月份: row.month,
    部门: row.department,
    区域: row.region,
    业务类型: row.businessType,
    营业收入: row.revenue,
    营业成本: row.cost,
    预算收入: row.budget,
    错误原因: row.errorMessage,
    }))

    const worksheet = utils.json_to_sheet(exportData)

    worksheet['!cols'] = [
        { wch: 10 },
        { wch: 12 },
        { wch: 14 },
        { wch: 14 },
        { wch: 16 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 40 },
    ]

    const workbook = utils.book_new()
    utils.book_append_sheet(workbook,worksheet,'错误数据')

    writeFile(workbook,`经营数据错误清单_${createTimestamp()}.xlsx`)
    return true
}

export async function exportAnalysisReport(rows,metrics,filters) {
    if(!rows.length)
        return false

    const { utils, writeFile } = await import('xlsx')

  const summaryData = [
    { 项目: '筛选月份', 结果: filters.month },
    { 项目: '筛选部门', 结果: filters.department },
    { 项目: '筛选区域', 结果: filters.region },
    { 项目: '数据条数', 结果: rows.length },
    { 项目: '营业收入', 结果: metrics.revenue },
    { 项目: '营业成本', 结果: metrics.cost },
    { 项目: '利润', 结果: metrics.profit },
    {
      项目: '预算完成率',
      结果: `${metrics.completionRate.toFixed(1)}%`,
    },
]

  const detailData = rows.map((row) => ({
    Excel行号: row.rowNumber,
    月份: row.month,
    部门: row.department,
    区域: row.region,
    业务类型: row.businessType,
    营业收入: row.revenue,
    营业成本: row.cost,
    利润: row.revenue - row.cost,
    预算收入: row.budget,
    预算完成率:
      row.budget > 0
        ? `${((row.revenue / row.budget) * 100).toFixed(1)}%`
        : '0%',
  }))

  const summarySheet = utils.json_to_sheet(summaryData)
  const detailSheet = utils.json_to_sheet(detailData)

  summarySheet['!cols'] = [{ wch: 18 }, { wch: 22 }]
  detailSheet['!cols'] = Array(10).fill({ wch: 16 })

  const workbook = utils.book_new()
    utils.book_append_sheet(workbook, summarySheet, '分析汇总')
    utils.book_append_sheet(workbook, detailSheet, '经营明细')

    writeFile(workbook, `经营分析报表_${createTimestamp()}.xlsx`)
    return true
}