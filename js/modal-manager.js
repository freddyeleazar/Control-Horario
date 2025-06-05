// Modal Manager: Handles opening and closing of modals
const ModalManager = (() => {
    function openModal({ id, title, body, footer, large = false, customClass = '' }) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.tabIndex = -1;
        modalOverlay.id = id + 'Overlay';

        const modal = document.createElement('div');
        modal.className = 'modal' + (large ? ' modal-large' : '') + (customClass ? ' ' + customClass : '');
        modal.id = id;
        modal.tabIndex = 0;

        // Header
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `<span class="modal-title">${title}</span><button class="modal-close" aria-label="Cerrar" tabindex="0"><i class="fas fa-times"></i></button>`;
        modal.appendChild(header);

        // Body
        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'modal-body';
        bodyDiv.innerHTML = body;
        modal.appendChild(bodyDiv);

        // Footer
        if (footer) {
            const footerDiv = document.createElement('div');
            footerDiv.className = 'modal-footer';
            footerDiv.innerHTML = footer;
            modal.appendChild(footerDiv);
        }

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
        setTimeout(() => modal.focus(), 10);

        // Close logic
        function closeModal() {
            modal.classList.add('closing');
            setTimeout(() => {
                if (modalOverlay.parentNode) modalOverlay.parentNode.removeChild(modalOverlay);
            }, 250);
        }
        header.querySelector('.modal-close').onclick = closeModal;
        modalOverlay.onclick = (e) => { if (e.target === modalOverlay) closeModal(); };
        document.onkeydown = (e) => { if (e.key === 'Escape') closeModal(); };
        return closeModal;
    }

    function closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
    }

    return { openModal, closeAllModals };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalManager;
}
