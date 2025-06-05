// Record Manager: Handles CRUD operations and CSV storage
const API_BASE_URL = 'api/records.php';
const BACKUP_API_URL = 'api/backup.php';

const RecordManager = (() => {
    let records = [];

    // API helper function
    async function makeRequest(method, data = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(API_BASE_URL, options);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Error en la operación');
            }
            
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Load records from server
    async function loadRecords() {
        try {
            const result = await makeRequest('GET');
            records = result.data || [];
            return records;
        } catch (error) {
            console.error('Error loading records:', error);
            // Fallback to localStorage if server fails
            records = Utils.getLocalStorage('violin_records', []);
            return records;
        }
    }

    // Add new record
    async function addRecord(record) {
        try {
            const result = await makeRequest('POST', record);
            const newRecord = result.data;
            
            // Update local cache
            records.unshift(newRecord);
            Utils.setLocalStorage('violin_records', records);
            
            return newRecord;
        } catch (error) {
            console.error('Error adding record:', error);
            throw error;
        }
    }

    // Update record by id
    async function updateRecord(id, updated) {
        try {
            const updateData = { id, ...updated };
            const result = await makeRequest('PUT', updateData);
            const updatedRecord = result.data;
            
            // Update local cache
            const idx = records.findIndex(r => r.id === id);
            if (idx !== -1) {
                records[idx] = updatedRecord;
                Utils.setLocalStorage('violin_records', records);
            }
            
            return updatedRecord;
        } catch (error) {
            console.error('Error updating record:', error);
            throw error;
        }
    }

    // Delete record by id
    async function deleteRecord(id) {
        try {
            await makeRequest('DELETE', { id });
            
            // Update local cache
            records = records.filter(r => r.id !== id);
            Utils.setLocalStorage('violin_records', records);
            
            return true;
        } catch (error) {
            console.error('Error deleting record:', error);
            throw error;
        }
    }

    // Get all records (from local cache, sorted by date desc)
    function getRecords() {
        return [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Get record by id
    function getRecordById(id) {
        return records.find(r => r.id === id);
    }

    // Export records as CSV file
    async function exportCSV() {
        try {
            const response = await fetch(`${BACKUP_API_URL}?action=export`);
            
            if (!response.ok) {
                throw new Error('Error al exportar los datos');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `violin_records_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Error exporting CSV:', error);
            throw error;
        }
    }

    // Import records from CSV file
    async function importCSV(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch(`${BACKUP_API_URL}?action=import`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Error al importar los datos');
            }
            
            // Reload records after import
            await loadRecords();
            
            return result.data;
        } catch (error) {
            console.error('Error importing CSV:', error);
            throw error;
        }
    }    return {
        loadRecords,
        addRecord,
        updateRecord,
        deleteRecord,
        getRecords,
        getRecordById,
        exportCSV,
        importCSV
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecordManager;
}
