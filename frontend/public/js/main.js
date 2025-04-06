/**
 * Main JavaScript file for HufflePay
 * Handles functionality for the home page and shared components
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize trending stablecoins
    initTrendingStablecoins();
    
    // Initialize quick exchange form
    initQuickExchange();
});

/**
 * Initialize trending stablecoins section
 */
async function initTrendingStablecoins() {
    try {
        const currenciesContainer = document.getElementById('trending-currencies');
        if (!currenciesContainer) return;
        
        // Fetch trending stablecoin data
        const trendingStablecoins = await api.getTrendingStablecoins();
        
        // Clear existing content
        currenciesContainer.innerHTML = '';
        
        // Add currency items
        trendingStablecoins.forEach(currency => {
            const isPositive = currency.change.startsWith('+');
            const changeClass = isPositive ? 'positive-change' : 'negative-change';
            
            const currencyItem = document.createElement('div');
            currencyItem.className = 'currency-item';
            currencyItem.innerHTML = `
                <div class="currency-name">${currency.name} (${currency.code})</div>
                <div class="currency-change ${changeClass}">${currency.change}</div>
            `;
            
            currenciesContainer.appendChild(currencyItem);
        });
    } catch (error) {
        console.error('Error initializing trending stablecoins:', error);
    }
}

/**
 * Initialize quick exchange form
 */
function initQuickExchange() {
    const amountInput = document.getElementById('quick-amount');
    const fromCurrencySelect = document.getElementById('from-currency');
    const toCurrencySelect = document.getElementById('to-currency');
    
    if (!amountInput || !fromCurrencySelect || !toCurrencySelect) return;
    
    // Set default values
    amountInput.value = 100;
    fromCurrencySelect.value = 'USDT';
    toCurrencySelect.value = 'EURC';
    
    // Add event listeners for real-time conversion
    amountInput.addEventListener('input', updateConversion);
    fromCurrencySelect.addEventListener('change', updateConversion);
    toCurrencySelect.addEventListener('change', updateConversion);
    
    // Initial conversion calculation
    updateConversion();
}

/**
 * Update conversion based on form values
 */
async function updateConversion() {
    const amountInput = document.getElementById('quick-amount');
    const fromCurrencySelect = document.getElementById('from-currency');
    const toCurrencySelect = document.getElementById('to-currency');
    
    if (!amountInput || !fromCurrencySelect || !toCurrencySelect) return;
    
    try {
        const amount = parseFloat(amountInput.value) || 0;
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        
        // Get exchange rates
        const rates = await api.getExchangeRates();
        const rateKey = `${fromCurrency}-${toCurrency}`;
        let rate = rates[rateKey];
        
        // If direct rate not found, try to calculate via USDT
        if (!rate && fromCurrency !== 'USDT' && toCurrency !== 'USDT') {
            const fromToUSD = rates[`${fromCurrency}-USDT`];
            const usdToTarget = rates[`USDT-${toCurrency}`];
            if (fromToUSD && usdToTarget) {
                rate = fromToUSD * usdToTarget;
            }
        }
        
        // Default fallback
        rate = rate || 1;
        
        // Calculate converted amount
        const convertedAmount = amount * rate;
        
        // Apply fee (0.5%)
        const feePercentage = 0.5;
        const feeAmount = convertedAmount * (feePercentage / 100);
        const finalAmount = convertedAmount - feeAmount;
        
        // Display result
        const resultElement = document.createElement('div');
        resultElement.innerHTML = `
            <div class="conversion-result">
                <strong>${amount} ${fromCurrency} ≈ ${finalAmount.toFixed(2)} ${toCurrency}</strong>
            </div>
            <div class="conversion-rate">
                Rate: 1 ${fromCurrency} = ${rate.toFixed(2)} ${toCurrency}
            </div>
            <div class="conversion-fees">
                Fee: ${feePercentage}% (${feeAmount.toFixed(2)} ${toCurrency})
            </div>
        `;
        
        // Update the 'Start Exchange' button to include parameters
        const exchangeBtn = document.querySelector('a[href="/exchange"]');
        if (exchangeBtn) {
            exchangeBtn.href = `/exchange?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`;
        }
    } catch (error) {
        console.error('Error updating conversion:', error);
    }
}

/**
 * Format currency amount with symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} - Formatted amount with currency symbol
 */
function formatCurrency(amount, currency) {
    if (currency === 'USDT' || currency === 'USD') {
        return `$${amount.toFixed(2)}`;
    } else if (currency === 'EURC' || currency === 'EUR') {
        return `€${amount.toFixed(2)}`;
    } else if (currency === 'GBPT' || currency === 'GBP') {
        return `£${amount.toFixed(2)}`;
    } else if (currency === 'JPYT' || currency === 'JPY') {
        return `¥${amount.toFixed(0)}`;
    } else if (currency === 'BTC') {
        return `₿${amount.toFixed(8)}`;
    } else {
        return `${amount.toFixed(2)} ${currency}`;
    }
}