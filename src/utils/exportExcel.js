import { utils,writeFile } from "xlsx"

function createTimestamp() {
    const now = new Date()
    const pad = (value) => String(value).padStart(2,'0')

    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`
}

export function exportInvalidRows(rows) {
    if(!rows.length)
        return false

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