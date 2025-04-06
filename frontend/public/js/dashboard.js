/**
 * Dashboard page JavaScript for HufflePay
 * Handles dashboard widgets and data visualization
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize currency converter
    initCurrencyConverter();
    
    // Initialize transaction overview
    initTransactionOverview();
    
    // Load recent transactions
    loadRecentTransactions();
});

/**
 * Initialize currency converter widget
 */
async function initCurrencyConverter() {
    const amountInput = document.getElementById('dashboard-amount');
    const fromSelect = document.getElementById('dashboard-from');
    const toSelect = document.getElementById('dashboard-to');
    const resultElement = document.getElementById('conversion-result');
    
    if (!amountInput || !fromSelect || !toSelect || !resultElement) return;
    
    // Add event listeners for real-time conversion
    amountInput.addEventListener('input', updateConversion);
    fromSelect.addEventListener('change', updateConversion);
    toSelect.addEventListener('change', updateConversion);
    
    // Initial conversion
    updateConversion();
    
    /**
     * Update conversion based on form inputs
     */
    async function updateConversion() {
        try {
            const amount = parseFloat(amountInput.value) || 0;
            const fromCurrency = fromSelect.value;
            const toCurrency = toSelect.value;
            
            // Get exchange rates
            const rates = await api.getExchangeRates();
            const rateKey = `${fromCurrency}-${toCurrency}`;
            let rate = rates[rateKey];
            
            // If direct rate not found, try to calculate via USD
            if (!rate && fromCurrency !== 'USD' && toCurrency !== 'USD') {
                const fromToUSD = rates[`${fromCurrency}-USD`];
                const usdToTarget = rates[`USD-${toCurrency}`];
                if (fromToUSD && usdToTarget) {
                    rate = fromToUSD * usdToTarget;
                }
            }
            
            // Default fallback
            rate = rate || 1;
            
            // Calculate converted amount
            const convertedAmount = (amount * rate).toFixed(2);
            
            // Update result display
            resultElement.textContent = `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`;
            
            // Update Exchange button href
            const exchangeBtn = document.querySelector('.dashboard-converter .btn-primary');
            if (exchangeBtn) {
                exchangeBtn.href = `/exchange?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`;
            }
        } catch (error) {
            console.error('Error updating conversion:', error);
            resultElement.textContent = 'Conversion error. Please try again.';
        }
    }
}

/**
 * Initialize transaction overview widget
 */
async function initTransactionOverview() {
    try {
        // Tab switching functionality
        const monthTab = document.getElementById('this-month-tab');
        const yearTab = document.getElementById('this-year-tab');
        
        if (monthTab && yearTab) {
            monthTab.addEventListener('click', function() {
                monthTab.classList.add('active');
                yearTab.classList.remove('active');
                loadTransactionData('month');
            });
            
            yearTab.addEventListener('click', function() {
                yearTab.classList.add('active');
                monthTab.classList.remove('active');
                loadTransactionData('year');
            });
        }
        
        // Initial load (month view)
        loadTransactionData('month');
    } catch (error) {
        console.error('Error initializing transaction overview:', error);
    }
}

/**
 * Load transaction data for the selected period
 * @param {string} period - 'month' or 'year'
 */
async function loadTransactionData(period) {
    try {
        // Get transaction data
        const transactions = await api.getRecentTransactions();
        
        // Filter transactions based on period
        const now = new Date();
        const filteredTransactions = transactions.filter(transaction => {
            const txDate = new Date(transaction.date);
            if (period === 'month') {
                return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
            } else {
                return txDate.getFullYear() === now.getFullYear();
            }
        });
        
        // Calculate total amount
        const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        
        // Update count and total
        document.getElementById('transaction-count').textContent = filteredTransactions.length;
        document.getElementById('transaction-total').textContent = `$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        // Update chart
        updateTransactionChart(filteredTransactions);
    } catch (error) {
        console.error('Error loading transaction data:', error);
    }
}

/**
 * Update transaction chart visualization
 * @param {Array} transactions - Array of transaction objects
 */
function updateTransactionChart(transactions) {
    const chartContainer = document.getElementById('transaction-chart');
    if (!chartContainer) return;
    
    // Clear current chart
    chartContainer.innerHTML = '';
    
    // If no transactions, show empty state
    if (transactions.length === 0) {
        chartContainer.innerHTML = '<p class="text-center">No transactions in this period</p>';
        return;
    }
    
    // Group transactions by date
    const grouped = {};
    transactions.forEach(tx => {
        const date = new Date(tx.date);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        if (!grouped[dateKey]) {
            grouped[dateKey] = 0;
        }
        grouped[dateKey] += tx.amount;
    });
    
    // Convert to array of {date, amount} objects
    const chartData = Object.keys(grouped).map(date => ({
        date,
        amount: grouped[date]
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    // Find max amount for scaling
    const maxAmount = Math.max(...chartData.map(d => d.amount));
    
    // Create chart bars
    chartData.forEach(data => {
        const heightPercentage = (data.amount / maxAmount) * 100;
        const formattedAmount = `$${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = `${heightPercentage}%`;
        bar.setAttribute('data-value', formattedAmount);
        bar.setAttribute('title', `${new Date(data.date).toLocaleDateString()}: ${formattedAmount}`);
        
        chartContainer.appendChild(bar);
    });
}

/**
 * Load recent transactions
 */
async function loadRecentTransactions() {
    try {
        // Get transaction list container
        const transactionList = document.querySelector('.transaction-list');
        if (!transactionList) return;
        
        // Keep the header row
        const headerRow = transactionList.querySelector('.transaction-header');
        transactionList.innerHTML = '';
        if (headerRow) {
            transactionList.appendChild(headerRow);
        }
        
        // Get recent transactions
        const transactions = await api.getRecentTransactions();
        
        // Add transaction items
        transactions.forEach(tx => {
            const txDate = new Date(tx.date);
            const formattedDate = txDate.toLocaleDateString();
            
            // Create transaction item
            const txItem = document.createElement('div');
            txItem.className = 'transaction-item';
            txItem.innerHTML = `
                <div data-label="Date:" class="transaction-date">${formattedDate}</div>
                <div data-label="Transaction ID:" class="transaction-id">${tx.id}</div>
                <div data-label="Amount:" class="transaction-amount">$${tx.amount.toFixed(2)}</div>
                <div data-label="Status:" class="transaction-status status-completed">Completed</div>
                <div data-label="Action:" class="transaction-action">
                    <button class="btn-action"><i class="fas fa-eye"></i></button>
                </div>
            `;
            
            // Add click event to view details
            const viewBtn = txItem.querySelector('.btn-action');
            if (viewBtn) {
                viewBtn.addEventListener('click', function() {
                    showTransactionDetails(tx);
                });
            }
            
            transactionList.appendChild(txItem);
        });
    } catch (error) {
        console.error('Error loading recent transactions:', error);
    }
}

/**
 * Show transaction details in a modal
 * @param {Object} transaction - Transaction object
 */
function showTransactionDetails(transaction) {
    // In a real implementation, this would show a modal with transaction details
    alert(`Transaction Details:\nID: ${transaction.id}\nDate: ${new Date(transaction.date).toLocaleDateString()}\nAmount: $${transaction.amount.toFixed(2)}\nFrom: ${transaction.fromCurrency}\nTo: ${transaction.toCurrency}`);
}