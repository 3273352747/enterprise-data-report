import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'

import {
    clearCurrentImport,
    loadCurrentImport,
    saveCurrentImport,
} from './storage.js'

const CURRENT_IMPORT_KEY = 'enterprise-data-report:current-import'

function createLocalStorageMock() {
    const values = new Map()

    return {
        getItem: vi.fn((key) => {
            return values.has(key) ? values.get(key) : null
        }),

        setItem: vi.fn((key, value) => {
            values.set(key, String(value))
        }),

        removeItem: vi.fn((key) => {
            values.delete(key)
        }),
    }
}

function createImportData() {
    return {
        fileName: '经营数据模板.xlsx',
        savedAt: '2026-07-30T10:00:00.000Z',
        rows: [
            {
                rowNumber: 2,
                month: '2026-01',
                department: '销售部',
                region: '华东区',
                businessType: '产品销售',
                revenue: 100000,
                cost: 60000,
                budget: 90000,
            },
        ],
    }
}

describe('current import storage', () => {
    beforeEach(() => {
        vi.stubGlobal(
            'localStorage',
            createLocalStorageMock(),
        )
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('应保存并恢复带版本号的导入数据', () => {
        const importData = createImportData()

        expect(saveCurrentImport(importData)).toBe(true)
        expect(loadCurrentImport()).toEqual(importData)

        const savedText = localStorage.setItem.mock.calls[0][1]
        const savedData = JSON.parse(savedText)

        expect(savedData.version).toBe(1)
        expect(savedData.data).toEqual(importData)
    })

    it('版本号不一致时应拒绝恢复缓存', () => {
        localStorage.setItem(
            CURRENT_IMPORT_KEY,
            JSON.stringify({
                version: 999,
                data: createImportData(),
            }),
        )

        expect(loadCurrentImport()).toBeNull()
        expect(localStorage.removeItem).toHaveBeenCalledWith(
            CURRENT_IMPORT_KEY,
        )
    })

    it('缓存数据结构错误时应拒绝恢复', () => {
        localStorage.setItem(
            CURRENT_IMPORT_KEY,
            JSON.stringify({
                version: 1,
                data: {
                    fileName: '错误缓存.xlsx',
                    rows: '不是数组',
                },
            }),
        )

        expect(loadCurrentImport()).toBeNull()
    })

    it('清除缓存异常时应返回 false', () => {
        localStorage.removeItem.mockImplementation(() => {
            throw new Error('storage unavailable')
        })

        expect(clearCurrentImport()).toBe(false)
    })
})