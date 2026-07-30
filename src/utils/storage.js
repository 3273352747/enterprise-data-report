const CURRENT_IMPORT_KEY = 'enterprise-data-report:current-import'
const IMPORT_HISTORY_KEY = 'enterprise-data-report:import-history'
const MAX_HISTORY_COUNT = 8
const STORAGE_VERSION = 1

function isValidCurrentImport(data) {
    return (
        data && 
        typeof data === 'object' &&
        typeof data.fileName === 'string' &&
        Array.isArray(data.rows) &&
        data.rows.every((row) => {
            return row && typeof row === 'object'
        })
    )
}

export function saveCurrentImport(data) {
    try{
        const storageData = {
            version: STORAGE_VERSION,
            data,
        }

        localStorage.setItem(CURRENT_IMPORT_KEY,JSON.stringify(storageData))
        return true
    } catch {
        return false
    }
}

export function loadCurrentImport() {
    try{
        const value = localStorage.getItem(CURRENT_IMPORT_KEY)

        if(!value){
            return null
        }

        const storageData = JSON.parse(value)

        if(storageData.version !== STORAGE_VERSION ||
            !isValidCurrentImport(storageData.data)
        ){
            localStorage.removeItem(CURRENT_IMPORT_KEY)
            return null
        }

        return storageData.data
    } catch {
        return null
    }
}

export function clearCurrentImport() {
    try{
    localStorage.removeItem(CURRENT_IMPORT_KEY)
    return true
    } catch {
        return false
    }
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
