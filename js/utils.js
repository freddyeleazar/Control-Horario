// Utility functions
class Utils {
    // Format date to DD/MM/YYYY
    static formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Get today's date in YYYY-MM-DD format
    static getTodayString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Parse duration from H:MM format
    static parseDuration(durationString) {
        const parts = durationString.split(':');
        if (parts.length !== 2) return { hours: 0, minutes: 0 };
        
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        
        return { hours, minutes };
    }

    // Format duration to H:MM
    static formatDuration(hours, minutes) {
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }

    // Convert duration to total minutes
    static durationToMinutes(hours, minutes) {
        return (hours * 60) + minutes;
    }

    // Convert minutes to duration object
    static minutesToDuration(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return { hours, minutes };
    }

    // Calculate time difference from 1 hour (60 minutes)
    static calculateTimeDifference(hours, minutes) {
        const totalMinutes = this.durationToMinutes(hours, minutes);
        const targetMinutes = 60; // 1 hour
        const difference = totalMinutes - targetMinutes;
        
        if (difference === 0) {
            return { type: 'exact', hours: 0, minutes: 0, text: 'En hora' };
        } else if (difference > 0) {
            const { hours: diffHours, minutes: diffMinutes } = this.minutesToDuration(Math.abs(difference));
            return { 
                type: 'surplus', 
                hours: diffHours, 
                minutes: diffMinutes, 
                text: `SOBRAN ${this.formatDuration(diffHours, diffMinutes)}` 
            };
        } else {
            const { hours: diffHours, minutes: diffMinutes } = this.minutesToDuration(Math.abs(difference));
            return { 
                type: 'deficit', 
                hours: diffHours, 
                minutes: diffMinutes, 
                text: `FALTAN ${this.formatDuration(diffHours, diffMinutes)}` 
            };
        }
    }

    // Truncate text with ellipsis
    static truncateText(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    // Escape HTML
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Generate unique ID
    static generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    // Validate duration input
    static validateDuration(hours, minutes) {
        const errors = [];
        
        if (isNaN(hours) || hours < 0 || hours > 23) {
            errors.push('Las horas deben ser un número entre 0 y 23');
        }
        
        if (isNaN(minutes) || minutes < 0 || minutes > 59) {
            errors.push('Los minutos deben ser un número entre 0 y 59');
        }
        
        if (hours === 0 && minutes === 0) {
            errors.push('La duración debe ser mayor a 0');
        }
        
        return errors;
    }

    // Validate date input
    static validateDate(dateString) {
        const errors = [];
        
        if (!dateString) {
            errors.push('La fecha es requerida');
            return errors;
        }
        
        const date = new Date(dateString);
        const today = new Date();
        
        if (isNaN(date.getTime())) {
            errors.push('Fecha inválida');
        }
        
        // Optional: Check if date is not too far in the future
        const maxFutureDate = new Date();
        maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);
        
        if (date > maxFutureDate) {
            errors.push('La fecha no puede ser más de un año en el futuro');
        }
        
        return errors;
    }

    // Show loading state
    static showLoading(element) {
        element.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
            </div>
        `;
    }

    // Show empty state
    static showEmptyState(element, message = 'No hay registros disponibles') {
        element.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-music"></i>
                <h3>No hay clases registradas</h3>
                <p>${message}</p>
            </div>
        `;
    }

    // Show error state
    static showErrorState(element, message = 'Error al cargar los datos') {
        element.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Get the start of the week (Monday) for a given date (ISO week)
    static getWeekStart(date) {
        const d = new Date(date);
        // Convert to Monday=0..Sunday=6
        const day = (d.getDay() + 6) % 7;
        d.setDate(d.getDate() - day);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    // Get the end of the week (Sunday) for a given date
    static getWeekEnd(date) {
        const start = this.getWeekStart(date);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return end;
    }

    // Check if two dates are in the same week
    static areDatesInSameWeek(date1, date2) {
        const week1Start = this.getWeekStart(date1);
        const week2Start = this.getWeekStart(date2);
        return week1Start.getTime() === week2Start.getTime();
    }

    // Get ISO week identifier string (YYYY-WW, Monday-based weeks)
    static getWeekIdentifier(date) {
        const src = new Date(date);
        // Use UTC to avoid TZ/DST issues for week computations
        const d = new Date(Date.UTC(src.getFullYear(), src.getMonth(), src.getDate()));
        // Get day number with Monday=1..Sunday=7
        let dayNum = d.getUTCDay();
        if (dayNum === 0) dayNum = 7;
        // Move to Thursday of the current ISO week
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        // Week-year is the year of that Thursday
        const weekYear = d.getUTCFullYear();
        // Get first day of week-year (Jan 1) and compute week number
        const yearStart = new Date(Date.UTC(weekYear, 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return `${weekYear}-W${String(weekNo).padStart(2, '0')}`;
    }

    // Group records by week
    static groupRecordsByWeek(records) {
        const weekGroups = {};
        
        records.forEach(record => {
            const weekId = this.getWeekIdentifier(record.date);
            if (!weekGroups[weekId]) {
                weekGroups[weekId] = [];
            }
            weekGroups[weekId].push(record);
        });
        
        return weekGroups;
    }

    // Get current week's records
    static getCurrentWeekRecords(records) {
        const today = new Date();
        const currentWeekId = this.getWeekIdentifier(today);
        const weekGroups = this.groupRecordsByWeek(records);
        return weekGroups[currentWeekId] || [];
    }

    // Get cumulative carry (surplus/deficit) before a given ISO week
    // carry is the sum over past weeks of (minutesInWeek - 60)
    static getCarryBeforeWeek(records, targetWeekId) {
        if (!Array.isArray(records) || records.length === 0) return 0;
        const sorted = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));
        const WEEK_TARGET = 60;
        let carry = 0;
        let currentWeekId = null;
        let minutesThisWeek = 0;

        for (const r of sorted) {
            const wId = this.getWeekIdentifier(r.date);
            if (currentWeekId && wId !== currentWeekId) {
                // finalize previous week
                carry += (minutesThisWeek - WEEK_TARGET);
                minutesThisWeek = 0;
                if (currentWeekId === targetWeekId) {
                    // If the completed week equals target, stop before accumulating it
                    break;
                }
            }
            if (currentWeekId !== wId) currentWeekId = wId;
            if (wId === targetWeekId) {
                // don't include current week minutes in carry-before
                continue;
            }
            const { hours, minutes } = this.parseDuration(r.duration || '0:00');
            minutesThisWeek += this.durationToMinutes(hours, minutes);
        }
        // finalize last week if it's strictly before target
        if (currentWeekId && currentWeekId !== targetWeekId) {
            carry += (minutesThisWeek - WEEK_TARGET);
        }
        return carry;
    }

    // Compute running weekly balance up to each record (by date asc, per week)
    // Returns a map: { [id]: { diffMinutes, type: 'balanced'|'surplus'|'deficit', text } }
    static computeWeeklyRunningBalance(records) {
        const result = {};
        if (!Array.isArray(records) || records.length === 0) return result;

        // Sort ascending by date (and by id for stable order when same date)
        const sorted = [...records].sort((a, b) => {
            const da = new Date(a.date).getTime();
            const db = new Date(b.date).getTime();
            if (da !== db) return da - db;
            // numeric id tiebreaker if possible
            const ida = typeof a.id === 'number' ? a.id : parseInt(a.id);
            const idb = typeof b.id === 'number' ? b.id : parseInt(b.id);
            if (!isNaN(ida) && !isNaN(idb)) return ida - idb;
            return 0;
        });

        const WEEK_TARGET = 60; // minutes per week
        let carryFromPreviousWeeks = 0; // can be negative (deficit) or positive (surplus)
        let currentWeekId = null;
        let minutesThisWeek = 0;

        for (const r of sorted) {
            const weekId = this.getWeekIdentifier(r.date);
            // New week encountered: finalize previous week and update carry
            if (currentWeekId !== null && weekId !== currentWeekId) {
                carryFromPreviousWeeks += (minutesThisWeek - WEEK_TARGET);
                minutesThisWeek = 0;
            }
            if (currentWeekId !== weekId) {
                currentWeekId = weekId;
            }

            const { hours, minutes } = this.parseDuration(r.duration || '0:00');
            minutesThisWeek += this.durationToMinutes(hours, minutes);

            // Balance up to this record, applying carryover firstly
            const diff = carryFromPreviousWeeks + (minutesThisWeek - WEEK_TARGET);
            const { hours: dh, minutes: dm } = this.minutesToDuration(Math.abs(diff));

            let type = 'balanced';
            let text = 'OK';
            if (diff > 0) {
                type = 'surplus';
                text = `SOBRAN ${this.formatDuration(dh, dm)}`;
            } else if (diff < 0) {
                type = 'deficit';
                text = `FALTAN ${this.formatDuration(dh, dm)}`;
            }

            result[r.id] = { diffMinutes: diff, type, text };
        }

        return result;
    }

    // Get available years for filter
    static getAvailableYears(records) {
        const years = new Set();
        const currentYear = new Date().getFullYear();
        
        // Add current year and previous years
        for (let i = currentYear; i >= currentYear - 5; i--) {
            years.add(i);
        }
        
        // Add years from existing records
        records.forEach(record => {
            const year = new Date(record.date).getFullYear();
            years.add(year);
        });
        
        return Array.from(years).sort((a, b) => b - a);
    }

    // Deep clone object
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // Check if element is in viewport
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Smooth scroll to element
    static scrollToElement(element, offset = 0) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }

    // Format file size
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Get browser info
    static getBrowserInfo() {
        const userAgent = navigator.userAgent;
        const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
        const isFirefox = /Firefox/.test(userAgent);
        const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor);
        const isEdge = /Edg/.test(userAgent);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        
        return {
            isChrome,
            isFirefox,
            isSafari,
            isEdge,
            isMobile,
            userAgent
        };
    }

    // Local storage helpers
    static setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    static getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    static removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
