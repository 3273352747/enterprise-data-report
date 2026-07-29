const CURRENT_IMPORT_KEY = 'enterprise-data-report:current-import'
const IMPORT_HISTORY_KEY = 'enterprise-data-report:import-history'
const MAX_HISTORY_COUNT = 8

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

export function loadImportHistory() {
  try {
    const value = localStorage.getItem(IMPORT_HISTORY_KEY)
    const history = value ? JSON.parse(value) : []
    return Array.isArray(history) ? history : []
  } catch {
    return []
  }
}

export function addImportHistory(record) {
    try {
        const nextHistory = [record,...loadImportHistory()]
        .slice(0,MAX_HISTORY_COUNT)

        localStorage.setItem(IMPORT_HISTORY_KEY,JSON.stringify(nextHistory))
        return nextHistory
    } catch {
        return null
    }
}

export function clearImportHistory() {
  try {
    localStorage.removeItem(IMPORT_HISTORY_KEY)
    return true
  } catch {
    return false
  }
}
