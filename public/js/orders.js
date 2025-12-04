document.addEventListener('DOMContentLoaded', function() {
    const cancelModal = document.getElementById('cancelModal');
    const returnModal = document.getElementById('returnModal');
    const closeButtons = document.querySelectorAll('.close');
    
    
    const cancelReason = document.getElementById('cancelReason');
    const closeCancelBtn = document.getElementById('closeCancel');
    const confirmCancelBtn = document.getElementById('confirmCancel');
    
    const returnReason = document.getElementById('returnReason');
    const closeReturnBtn = document.getElementById('closeReturn');
    const confirmReturnBtn = document.getElementById('confirmReturn');
    
    let currentOrderId = null;
    let currentProductIndex = null;
    let currentActionType = null; 
    let currentAction = null; 

    function openCancelModal(orderId, productIndex = null, type = 'order') {
        currentOrderId = orderId;
        currentProductIndex = productIndex;
        currentActionType = type;
        currentAction = 'cancel';
        
        cancelModal.style.display = 'block';
        cancelReason.value = '';
        cancelReason.focus();
    }
    
    function openReturnModal(orderId, productIndex = null, type = 'order') {
        currentOrderId = orderId;
        currentProductIndex = productIndex;
        currentActionType = type;
        currentAction = 'return';
        
        returnModal.style.display = 'block';
        returnReason.value = '';
        returnReason.focus();
    }

    function closeCancelModal() {
        cancelModal.style.display = 'none';
        resetState();
    }
    
    function closeReturnModal() {
        returnModal.style.display = 'none';
        resetState();
    }
    
    function resetState() {
        currentOrderId = null;
        currentProductIndex = null;
        currentActionType = null;
        currentAction = null;
    }

    document.querySelectorAll('.cancel-order-btn').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.dataset.orderDbId;
            openCancelModal(orderId, null, 'order');
        });
    });
    
    document.querySelectorAll('.cancel-item-btn').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            const productIndex = this.dataset.productIndex;
            openCancelModal(orderId, productIndex, 'item');
        });
    });

    document.querySelectorAll('.return-order-btn').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.dataset.orderDbId;
            openReturnModal(orderId, null, 'order');
        });
    });
    
    document.querySelectorAll('.return-btn').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            const productIndex = this.dataset.productIndex;
            openReturnModal(orderId, productIndex, 'item');
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (currentAction === 'cancel') closeCancelModal();
            if (currentAction === 'return') closeReturnModal();
        });
    });
    
    closeCancelBtn.addEventListener('click', closeCancelModal);
    closeReturnBtn.addEventListener('click', closeReturnModal);

    window.addEventListener('click', function(event) {
        if (event.target === cancelModal) closeCancelModal();
        if (event.target === returnModal) closeReturnModal();
    });

    confirmCancelBtn.addEventListener('click', function() {
        const reason = cancelReason.value.trim();
        
        let endpoint, data;
        
        if (currentActionType === 'order') {
            endpoint = '/user/orders/cancel';
            data = { orderId: currentOrderId, reason: reason };
        } else {
            endpoint = '/user/orders/cancel-item';
            data = { 
                orderId: currentOrderId, 
                productIndex: currentProductIndex, 
                reason: reason 
            };
        }
        
        axios.post(endpoint, data)
            .then(response => {
                Toastify({
                    text: response.data.message,
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    backgroundColor: "#28a745",
                }).showToast();
                
                setTimeout(() => {
                    location.reload();
                }, 1500);
            })
            .catch(error => {
                Toastify({
                    text: error.response?.data?.message || 'Something went wrong',
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    backgroundColor: "#dc3545",
                }).showToast();
            })
            .finally(() => {
                closeCancelModal();
            });
    });

    confirmReturnBtn.addEventListener('click', function() {
        const reason = returnReason.value.trim();
        
        if (!reason) {
            Toastify({
                text: "Please provide a return reason",
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: "#dc3545",
            }).showToast();
            returnReason.focus();
            return;
        }
        
        let endpoint, data;
        
        if (currentActionType === 'order') {
            endpoint = '/user/orders/return';
            data = { orderId: currentOrderId, reason: reason };
        } else {
            endpoint = '/user/orders/return-item';
            data = { 
                orderId: currentOrderId, 
                productIndex: currentProductIndex, 
                reason: reason 
            };
        }
        
        axios.post(endpoint, data)
            .then(response => {
                Toastify({
                    text: response.data.message,
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    backgroundColor: "#28a745",
                }).showToast();
                
                setTimeout(() => {
                    location.reload();
                }, 1500);
            })
            .catch(error => {
                Toastify({
                    text: error.response?.data?.message || 'Something went wrong',
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    backgroundColor: "#dc3545",
                }).showToast();
            })
            .finally(() => {
                closeReturnModal();
            });
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            if (currentAction === 'cancel') closeCancelModal();
            if (currentAction === 'return') closeReturnModal();
        }
        
        if (event.key === 'Enter' && event.ctrlKey) {
            if (currentAction === 'cancel' && cancelModal.style.display === 'block') {
                confirmCancelBtn.click();
            }
            if (currentAction === 'return' && returnModal.style.display === 'block') {
                confirmReturnBtn.click();
            }
        }
    });
});