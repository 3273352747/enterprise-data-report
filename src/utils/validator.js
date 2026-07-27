const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/

export function validateRows(rows) {
    const seenKeys = new Set()

    return rows.map((row) => {
        const errors = []

        if(!row.month)
            errors.push('月份不能为空')
        else if(!monthPattern.test(row.month)){
            errors.push('月份格式应为YYYY-MM')
        }

        if(!row.department)
            errors.push('部门不能为空')
        if(!row.region)
            errors.push('区域不能为空')
        if(!row.businessType)
            errors.push('业务类型不能为空')

        if(!Number.isFinite(row.revenue) || row.revenue < 0){
            errors.push('营业收入必须是非负数字')
        }

        if(!Number.isFinite(row.cost) || row.cost < 0){
            errors.push('营业成本必须是非负数字')
        }

        if(!Number.isFinite(row.budget) || row.budget <= 0){
            errors.push('预算收入必须是大于0的数字')
        }

        const keyParts = [
            row.month,
            row.department,
            row.region,
            row.businessType,
        ]

        if(keyParts.every(Boolean)){
            const duplicateKey = keyParts.join('-')

            if(seenKeys.has(duplicateKey)){
                errors.push('存在重复经营记录')
            } else {
                seenKeys.add(duplicateKey)
            }
        }

        return {
            ...row,
            valid: errors.length === 0,
            errors,
            errorMessage: errors.join(': '),
        }
    })
}