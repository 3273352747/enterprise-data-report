import { read,utils } from 'xlsx'

const requiredHeaders = [
    '月份',
    '部门',
    '区域',
    '业务类型',
    '营业收入',
    '营业成本',
    '预算收入',
]

function convertNumber(value) {
    const text = String(value ?? '').replace(/,/g,'').trim()

    if(text ===  '') {
        return null
    }

    return Number(text)
}

export async function parseExcelFile(file) {
    if(!file){
        throw new Error('没有选择Excel文件')
    }

    if(!file.name.toLowerCase().endsWith('.xlsx')){
        throw new Error('只支持 .xlsx 文件')
    }

    if(file.size > 5*1024*1024){
        throw new Error('文件不能超过5MB')
    }

    const buffer = await file.arrayBuffer()
    const workbook = read(buffer,{ type: 'array'})
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    if(!worksheet){
        throw new Error('Excel中没有工作表')
    }

    const headerRow = utils.sheet_to_json(worksheet, {
        header: 1,
        range: 0,
    })[0] || []
    const headers = headerRow.map((header) => String(header).trim())
    const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header))

    if(missingHeaders.length > 0){
        throw new Error(`Excel缺少必填列：${missingHeaders.join('、')}。请使用下载的模板`)
    }

    const sourceRows = utils.sheet_to_json(worksheet, {
        defval: '',
        raw: false,
    })

    if(sourceRows.length === 0){
        throw new Error('Excel中没有经营数据')
    }

    return sourceRows.map((row,index) => ({
        rowNumber: index + 2,
        month: String(row['月份'] ?? '').trim().replace(/^['’]/,''),
        department: String(row['部门'] ?? '').trim(),
        region: String(row['区域'] ?? '').trim(),
        businessType: String(row['业务类型'] ?? '').trim(),
        revenue: convertNumber(row['营业收入']),
        cost: convertNumber(row['营业成本']),
        budget: convertNumber(row['预算收入']),
    }))
}
