// Filter Manager: Handles filtering logic for the table
const FilterManager = (() => {
    let filters = {
        date: '',
        month: '',
        year: '',
        text: ''
    };

    function applyFilters(records) {
        return records.filter(record => {
            // Date filter
            if (filters.date && record.date !== filters.date) return false;
            // Month filter
            if (filters.month && record.date.slice(5,7) !== filters.month) return false;
            // Year filter
            if (filters.year && record.date.slice(0,4) !== filters.year) return false;
            // Text filter (notes)
            if (filters.text && !(record.notes || '').toLowerCase().includes(filters.text.toLowerCase())) return false;
            return true;
        });
    }

    function setFilter(key, value) {
        filters[key] = value;
    }

    function getFilters() {
        return { ...filters };
    }

    function clearFilters() {
        filters = { date: '', month: '', year: '', text: '' };
    }

    return {
        applyFilters,
        setFilter,
        getFilters,
        clearFilters
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FilterManager;
}
