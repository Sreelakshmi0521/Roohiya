
// Clear search functionality
document.addEventListener('DOMContentLoaded', function() {
    const clearSearchBtn = document.getElementById('clearSearch');
    const clearAllBtn = document.querySelector('.clear-all-btn');
    const searchInput = document.getElementById('searchInput');
    const searchForm = document.getElementById('searchForm');
    
    // Clear input field
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = '';
            searchInput.focus();
            // Hide the clear button after clearing
            this.style.display = 'none';
        });
    }
    
    // Show/hide clear button based on input
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const clearBtn = document.getElementById('clearSearch');
            if (this.value.trim() !== '' && clearBtn) {
                clearBtn.style.display = 'flex';
            } else if (clearBtn) {
                clearBtn.style.display = 'none';
            }
        });
        
        // Show clear button if there's existing text
        if (searchInput.value.trim() !== '') {
            const clearBtn = document.getElementById('clearSearch');
            if (clearBtn) {
                clearBtn.style.display = 'flex';
            }
        }
    }
    
    // Clear all search (redirect to orders page without search)
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/user/orders';
        });
    }

    // Enhanced search functionality - submit on Enter key
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchForm.submit();
            }
        });
    }
});