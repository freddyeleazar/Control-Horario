// Table Manager: Handles rendering and interaction of the records table
const TableManager = (() => {
    const PAGE_SIZE = 10;
    let currentPage = 1;
    let filteredRecords = [];

    function renderTable(records) {
        filteredRecords = records;
        const tbody = document.getElementById('recordsTableBody');
        tbody.innerHTML = '';
        if (!records.length) {
            Utils.showEmptyState(tbody, 'No hay clases registradas para los filtros seleccionados.');
            updatePagination(0, 0);
            return;
        }
    // Precompute weekly running balance using ALL records (not just filtered)
    const allRecords = (typeof RecordManager !== 'undefined' && RecordManager.getRecords) ? RecordManager.getRecords() : records;
    const saldoById = Utils.computeWeeklyRunningBalance(allRecords);
        const start = (currentPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const pageRecords = records.slice(start, end);
        for (const record of pageRecords) {
            const saldo = saldoById[record.id] || { diffMinutes: 0, type: 'balanced', text: 'OK' };
            const saldoClass = saldo.type === 'surplus' ? 'saldo-surplus' : (saldo.type === 'deficit' ? 'saldo-deficit' : 'saldo-balanced');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="date-cell">${Utils.formatDate(record.date)}</td>
                <td class="duration-cell">${record.duration}</td>
                <td class="saldo-cell ${saldoClass}">${saldo.text}</td>
                <td class="notes-cell">
                    <span class="notes-preview" title="${Utils.escapeHtml(record.notes || '')}">${Utils.truncateText(record.notes || '', 60)}</span>
                </td>
                <td class="actions-cell">
                    <button class="btn btn-small btn-primary edit-btn" data-id="${record.id}" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-small btn-danger delete-btn" data-id="${record.id}" title="Borrar"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        }
        updatePagination(records.length, pageRecords.length);
    }

    function updatePagination(total, shown) {
        const info = document.getElementById('paginationInfo');
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        info.textContent = `Mostrando ${Math.min((currentPage-1)*PAGE_SIZE+1, total)}-${Math.min(currentPage*PAGE_SIZE, total)} de ${total} registros`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
    }

    function goToPage(page) {
        const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE) || 1;
        if (page < 1 || page > totalPages) return;
        currentPage = page;
        renderTable(filteredRecords);
    }

    function nextPage() { goToPage(currentPage + 1); }
    function prevPage() { goToPage(currentPage - 1); }
    function resetPage() { currentPage = 1; }
    function getCurrentPage() { return currentPage; }

    function getFilteredRecords() { return filteredRecords; }

    return {
        renderTable,
        goToPage,
        nextPage,
        prevPage,
        resetPage,
        getCurrentPage,
        getFilteredRecords
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TableManager;
}
