import { describe,expect,it } from "vitest"
import { validateRows } from "./validator.js"

function createRow(overrides = {}) {
    return {
        rowNumber: 2,
        month: '2026-01',
        department: '销售部',
        region: '华东区',
        businessType: '产品销售',
        revenue: 100000,
        cost: 60000,
        budget: 90000,
        ...overrides,
    }
}

describe('validateRows',() => {
    it('合法数据应通过校验', () => {
        const[result] = validateRows([createRow()])

        expect(result.valid).toBe(true)
        expect(result.errors).toEqual([])
    })

    it('相同经营记录应识别为重复', () => {
        const results = validateRows([
            createRow(),
            createRow({ rowNumber: 3 }),
        ])

        expect(results[0].valid).toBe(true)
        expect(results[1].valid).toBe(false)
        expect(results[1].errors).toContain('存在重复经营记录')
    })

    it('字段中包含短横线时不应误判重复', () => {
        const results = validateRows([
            createRow({
                department: 'A-B',
                region: 'C区',
                businessType: 'D业务',
            }),
            createRow({
                rowNumber: 3,
                department: 'A部',
                region: 'B-C',
                businessType: 'D业务',
            }),
        ])

        expect(results.every((row) => row.valid)).toBe(true)
    })
    it('纯数字分类字段应校验失败', () => {
        const [result] = validateRows([
            createRow({
                department: '0',
                region: '2',
                businessType: '3',
            }),
        ])

        expect(result.valid).toBe(false)
        expect(result.errors).toContain(
            '部门不能为空且必须包含中文或英文字母',
        )
        expect(result.errors).toContain(
            '区域不能为空且必须包含中文或英文字母',
        )
        expect(result.errors).toContain(
            '业务类型不能为空且必须包含中文或英文字母',
        )
    })

    it('负数和零预算应校验失败', () => {
        const [result] = validateRows([
            createRow({
                revenue: -1,
                cost: -1,
                budget: 0,
            }),
        ])

        expect(result.valid).toBe(false)
        expect(result.errors).toContain('营业收入必须是非负数字')
        expect(result.errors).toContain('营业成本必须是非负数字')
        expect(result.errors).toContain('预算收入必须是大于0的数字')
    })
})