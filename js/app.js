// Main App Logic
window.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
});

async function initializeApp() {
    try {
        // Show loading state
        showGlobalLoading(true);
        
        // Load records and render table
        await RecordManager.loadRecords();
        renderAll();
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing app:', error);
        showErrorMessage('Error al cargar la aplicación. Por favor, recarga la página.');
    } finally {
        showGlobalLoading(false);
    }
}

function showGlobalLoading(show) {
    const tbody = document.getElementById('recordsTableBody');
    if (show) {
        Utils.showLoading(tbody);
    }
}

function showErrorMessage(message) {
    const tbody = document.getElementById('recordsTableBody');
    Utils.showErrorState(tbody, message);
}

async function renderAll() {
    const allRecords = RecordManager.getRecords();
    updateYearFilterOptions(allRecords);
    const filtered = FilterManager.applyFilters(allRecords);
    TableManager.resetPage();
    TableManager.renderTable(filtered);
    updateBalanceInfo(filtered);
}

function updateYearFilterOptions(records) {
    const yearFilter = document.getElementById('yearFilter');
    const years = Utils.getAvailableYears(records);
    yearFilter.innerHTML = '<option value="">Todos los años</option>' + years.map(y => `<option value="${y}">${y}</option>`).join('');
}

function updateBalanceInfo(records) {
    // Suma la duración de la última clase registrada (la más reciente)
    const balanceDiv = document.getElementById('balanceInfo');
    const balanceText = document.getElementById('balanceText');
    if (!records.length) {
        balanceDiv.className = 'balance-info';
        balanceText.textContent = 'Balance: En hora';
        return;
    }
    const last = records[0];
    const { hours, minutes } = Utils.parseDuration(last.duration);
    const diff = Utils.calculateTimeDifference(hours, minutes);
    balanceDiv.className = 'balance-info' + (diff.type === 'deficit' ? ' deficit' : diff.type === 'surplus' ? ' surplus' : '');
    balanceText.textContent = diff.type === 'exact' ? 'Balance: En hora' : diff.text;
}

function setupEventListeners() {
    // Add Record
    document.getElementById('addRecordBtn').onclick = () => openRecordModal();

    // Table actions (edit, delete, notes)
    document.getElementById('recordsTableBody').onclick = (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        const id = parseInt(target.dataset.id);
        if (target.classList.contains('edit-btn')) {
            openRecordModal(id);
        } else if (target.classList.contains('delete-btn')) {
            openDeleteModal(id);
        }
    };
    
    // Notes modal
    document.getElementById('recordsTableBody').addEventListener('click', (e) => {
        const cell = e.target.closest('.notes-cell');
        if (cell && cell.querySelector('.notes-preview')) {
            const row = cell.parentElement;
            const id = parseInt(row.querySelector('.edit-btn').dataset.id);
            openNotesModal(id);
        }
    });
    
    // Pagination
    document.getElementById('prevPageBtn').onclick = () => { TableManager.prevPage(); };
    document.getElementById('nextPageBtn').onclick = () => { TableManager.nextPage(); };
    
    // Filters
    document.getElementById('dateFilter').onchange = (e) => {
        FilterManager.setFilter('date', e.target.value);
        renderAll();
    };
    document.getElementById('monthFilter').onchange = (e) => {
        FilterManager.setFilter('month', e.target.value);
        renderAll();
    };
    document.getElementById('yearFilter').onchange = (e) => {
        FilterManager.setFilter('year', e.target.value);
        renderAll();
    };
    document.getElementById('textFilter').oninput = Utils.debounce((e) => {
        FilterManager.setFilter('text', e.target.value);
        renderAll();
    }, 300);
    document.getElementById('clearFilters').onclick = () => {
        FilterManager.clearFilters();
        document.getElementById('dateFilter').value = '';
        document.getElementById('monthFilter').value = '';
        document.getElementById('yearFilter').value = '';
        document.getElementById('textFilter').value = '';
        renderAll();
    };    // Add export/import functionality
    setupBackupEventListeners();
}

function setupBackupEventListeners() {
    // Export button
    document.getElementById('exportBtn').onclick = handleExport;
    
    // Import file input
    document.getElementById('importFile').onchange = handleFileSelect;
}

async function handleExport() {
    try {
        await RecordManager.exportCSV();
        showSuccessMessage('Archivo CSV exportado exitosamente');
    } catch (error) {
        showErrorMessage('Error al exportar los datos: ' + error.message);
    }
}

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        showGlobalLoading(true);
        const result = await RecordManager.importCSV(file);
        await renderAll();
        showSuccessMessage(`Se importaron ${result.imported_count} registros exitosamente`);
    } catch (error) {
        showErrorMessage('Error al importar los datos: ' + error.message);
    } finally {
        showGlobalLoading(false);
        event.target.value = ''; // Reset file input
    }
}

function showSuccessMessage(message) {
    // Create a temporary success notification
    const notification = document.createElement('div');
    notification.className = 'success-message';
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '400px';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 5000);
}

// Record Modal
function openRecordModal(id = null) {
    const isEdit = !!id;
    const record = isEdit ? RecordManager.getRecordById(id) : null;
    const today = Utils.getTodayString();
    const defaultDuration = '1:00';
    const modalBody = `
        <form class="record-form" id="recordForm">
            <div class="form-row">
                <div class="form-group">
                    <label for="dateInput">Fecha de la clase</label>
                    <input type="date" class="form-input" id="dateInput" name="date" value="${isEdit ? record.date : today}" required>
                </div>
                <div class="form-group">
                    <label for="durationInputH">Duración</label>
                    <div class="duration-input-container">
                        <input type="number" class="form-input" id="durationInputH" name="hours" min="0" max="23" value="${isEdit ? Utils.parseDuration(record.duration).hours : 1}" required> <span class="duration-separator">:</span>
                        <input type="number" class="form-input" id="durationInputM" name="minutes" min="0" max="59" value="${isEdit ? Utils.parseDuration(record.duration).minutes : 0}" required>
                    </div>
                    <div class="duration-label">(horas : minutos)</div>
                </div>
            </div>
            <div class="form-group">
                <label for="notesInput">Notas</label>
                <textarea class="form-input form-textarea" id="notesInput" name="notes" rows="5" maxlength="1000">${isEdit ? Utils.escapeHtml(record.notes || '') : ''}</textarea>
            </div>
            <div id="formError" class="error-message" style="display:none;"></div>
        </form>
    `;
    const modalFooter = `
        <button class="btn btn-primary" id="saveRecordBtn">Guardar</button>
        <button class="btn btn-secondary" id="cancelRecordBtn">Cancelar</button>
    `;
    const closeModal = ModalManager.openModal({
        id: 'recordModal',
        title: isEdit ? 'Editar clase' : 'Nueva clase',
        body: modalBody,
        footer: modalFooter
    });
    
    document.getElementById('cancelRecordBtn').onclick = (e) => { e.preventDefault(); closeModal(); };
    document.getElementById('saveRecordBtn').onclick = async (e) => {
        e.preventDefault();
        
        const saveBtn = e.target;
        const originalText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        
        try {
            const date = document.getElementById('dateInput').value;
            const hours = parseInt(document.getElementById('durationInputH').value);
            const minutes = parseInt(document.getElementById('durationInputM').value);
            const notes = document.getElementById('notesInput').value.trim();
            
            const dateErrors = Utils.validateDate(date);
            const durationErrors = Utils.validateDuration(hours, minutes);
            const errors = [...dateErrors, ...durationErrors];
            const errorDiv = document.getElementById('formError');
            
            if (errors.length) {
                errorDiv.innerHTML = `<i class='fas fa-exclamation-circle'></i> ` + errors.join('<br>');
                errorDiv.style.display = 'block';
                return;
            } else {
                errorDiv.style.display = 'none';
            }
            
            const duration = Utils.formatDuration(hours, minutes);
            
            if (isEdit) {
                await RecordManager.updateRecord(id, { date, duration, notes });
            } else {
                await RecordManager.addRecord({ date, duration, notes });
            }
            
            closeModal();
            await renderAll();
            showSuccessMessage(isEdit ? 'Clase actualizada exitosamente' : 'Clase registrada exitosamente');
            
        } catch (error) {
            const errorDiv = document.getElementById('formError');
            errorDiv.innerHTML = `<i class='fas fa-exclamation-circle'></i> Error: ${error.message}`;
            errorDiv.style.display = 'block';
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }
    };
}

// Notes Modal
function openNotesModal(id) {
    const record = RecordManager.getRecordById(id);
    ModalManager.openModal({
        id: 'notesModal',
        title: 'Notas de la clase',
        body: `<div class="notes-content">${Utils.escapeHtml(record.notes || '(Sin notas)')}</div>`,
        large: true
    });
}

// Delete Modal
function openDeleteModal(id) {
    const record = RecordManager.getRecordById(id);
    const closeModal = ModalManager.openModal({
        id: 'confirmModal',
        title: 'Confirmar borrado',
        body: `<div class="confirm-modal">
            <div class="confirm-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="confirm-message">¿Seguro que deseas borrar este registro?</div>
            <div class="confirm-details">${Utils.formatDate(record.date)} | ${record.duration}</div>
        </div>`,
        footer: `<div class="confirm-actions">
            <button class="btn btn-danger" id="confirmDeleteBtn">Borrar</button>
            <button class="btn btn-secondary" id="cancelDeleteBtn">Cancelar</button>
        </div>`
    });
    
    document.getElementById('cancelDeleteBtn').onclick = (e) => { e.preventDefault(); closeModal(); };
    document.getElementById('confirmDeleteBtn').onclick = async (e) => {
        e.preventDefault();
        
        const deleteBtn = e.target;
        const originalText = deleteBtn.textContent;
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Borrando...';
        
        try {
            await RecordManager.deleteRecord(id);
            closeModal();
            await renderAll();
            showSuccessMessage('Clase eliminada exitosamente');
        } catch (error) {
            showErrorMessage('Error al eliminar la clase: ' + error.message);
        } finally {
            deleteBtn.disabled = false;
            deleteBtn.textContent = originalText;
        }
    };
}
