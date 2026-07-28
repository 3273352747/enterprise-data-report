const CURRENT_IMPORT_KEY = 'enterprise-data-report:current-import'

export function saveCurrentImport(data) {
    try{
        localStorage.setItem(CURRENT_IMPORT_KEY,JSON.stringify(data))
        return true
    } catch {
        return false
    }
}

export function loadCurrentImport() {
    try{
        const value = localStorage.getItem(CURRENT_IMPORT_KEY)
        return value ? JSON.parse(value) : null
    } catch {
        return null
    }
}

export function clearCurrentImport() {
    localStorage.removeItem(CURRENT_IMPORT_KEY)
}