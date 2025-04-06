/**
 * Exchange page JavaScript for HufflePay
 * Handles the multi-step exchange form and Lightning-FX transaction process
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the exchange form
    initExchangeForm();
    
    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('amount') && urlParams.has('from') && urlParams.has('to')) {
        // Set form values from URL parameters
        document.getElementById('exchange-amount').value = urlParams.get('amount');
        // We'll set these in later steps
        window.fromCurrency = urlParams.get('from');
        window.toCurrency = urlParams.get('to');
    }
});

/**
 * Initialize the multi-step exchange form
 */
function initExchangeForm() {
    // Current step tracker
    window.currentStep = 1;
    window.maxSteps = 6;
    
    // Transaction data object
    window.transactionData = {
        amount: 0,
        fromCurrency: 'USDT',
        toCurrency: 'EURC',
        receiver: 'Bob'
    };
    
    // Add event listeners for step 1
    document.getElementById('step-1-next').addEventListener('click', function() {
        // Validate amount
        const amountInput = document.getElementById('exchange-amount');
        const amount = parseFloat(amountInput.value);
        
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount greater than zero.');
            return;
        }
        
        // Store amount in transaction data
        window.transactionData.amount = amount;
        
        // Move to next step
        showStep(2);
    });
    
    // Add event listeners for step 2
    document.getElementById('step-2-next').addEventListener('click', function() {
        // Get selected currencies
        const sourceCurrencySelect = document.getElementById('source-currency');
        const targetCurrencySelect = document.getElementById('target-currency');
        const sourceCurrency = sourceCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        
        // Validate currencies
        if (sourceCurrency === targetCurrency) {
            alert('Source and target currencies must be different.');
            return;
        }
        
        // Store currencies in transaction data
        window.transactionData.fromCurrency = sourceCurrency;
        window.transactionData.toCurrency = targetCurrency;
        
        // Update exchange rate display
        updateExchangeRateDisplay(sourceCurrency, targetCurrency);
        
        // Move to next step
        showStep(3);
    });
    
    document.getElementById('step-2-back').addEventListener('click', function() {
        showStep(1);
    });
    
    // Add event listeners for step 3
    document.getElementById('step-3-next').addEventListener('click', function() {
        // Validate username
        const usernameInput = document.getElementById('receiver-username');
        const username = usernameInput.value.trim();
        
        if (username.length < 3 || username.length > 16) {
            alert('Username must be 3-16 characters long.');
            return;
        }
        
        // Store username in transaction data
        window.transactionData.receiver = username;
        
        // Set confirmation username field
        document.getElementById('confirm-username').value = username;
        
        // Move to next step
        showStep(4);
    });
    
    document.getElementById('step-3-back').addEventListener('click', function() {
        showStep(2);
    });
    
    // Add event listeners for step 4
    document.getElementById('step-4-next').addEventListener('click', function() {
        // Move to next step
        showStep(5);
        
        // Update summary
        updateTransactionSummary();
    });
    
    document.getElementById('step-4-back').addEventListener('click', function() {
        showStep(3);
    });
    
    // Add event listeners for step 5
    document.getElementById('step-5-next').addEventListener('click', function() {
        // Move to next step
        showStep(6);
        
        // Update final summary
        updateFinalSummary();
    });
    
    document.getElementById('step-5-back').addEventListener('click', function() {
        showStep(4);
    });
    
    // Add event listeners for step 6
    document.getElementById('step-6-submit').addEventListener('click', function() {
        // Disable buttons to prevent double submission
        document.getElementById('step-6-back').disabled = true;
        document.getElementById('step-6-submit').disabled = true;
        
        // Show processing message
        document.getElementById('processing-message').style.display = 'block';
        document.getElementById('final-actions').style.display = 'none';
        
        // Simulate transaction processing
        setTimeout(function() {
            processLightningFXTransaction();
        }, 2000);
    });
    
    document.getElementById('step-6-back').addEventListener('click', function() {
        showStep(5);
    });
    
    // If fromCurrency and toCurrency were provided in URL params, select them
    if (window.fromCurrency) {
        const sourceCurrencySelect = document.getElementById('source-currency');
        if (sourceCurrencySelect.querySelector(`option[value="${window.fromCurrency}"]`)) {
            sourceCurrencySelect.value = window.fromCurrency;
        }
    }
    
    if (window.toCurrency) {
        const targetCurrencySelect = document.getElementById('target-currency');
        if (targetCurrencySelect.querySelector(`option[value="${window.toCurrency}"]`)) {
            targetCurrencySelect.value = window.toCurrency;
        }
    }
}

/**
 * Show a specific step in the exchange form
 * @param {number} stepNumber - The step number to show
 */
function showStep(stepNumber) {
    // Validate step number
    if (stepNumber < 1 || stepNumber > window.maxSteps) return;
    
    // Update current step
    window.currentStep = stepNumber;
    
    // Hide all steps
    const steps = document.querySelectorAll('.exchange-step');
    steps.forEach(step => {
        step.style.display = 'none';
    });
    
    // Show current step
    const currentStepElement = document.getElementById(`exchange-step-${stepNumber}`);
    if (currentStepElement) {
        currentStepElement.style.display = 'block';
    }
    
    // Update progress bar
    updateProgress(stepNumber);
    
    // Update step indicators
    updateStepIndicators(stepNumber);
}

/**
 * Update the progress bar
 * @param {number} stepNumber - The current step number
 */
function updateProgress(stepNumber) {
    const progressFill = document.getElementById('progress-fill');
    if (!progressFill) return;
    
    // Calculate progress percentage
    const progressPercentage = ((stepNumber - 1) / (window.maxSteps - 1)) * 100;
    progressFill.style.width = `${progressPercentage}%`;
}

/**
 * Update step indicators
 * @param {number} stepNumber - The current step number
 */
function updateStepIndicators(stepNumber) {
    // Update step item classes
    for (let i = 1; i <= window.maxSteps; i++) {
        const stepItem = document.getElementById(`step-item-${i}`);
        if (stepItem) {
            stepItem.classList.remove('active', 'completed');
            
            if (i === stepNumber) {
                stepItem.classList.add('active');
            } else if (i < stepNumber) {
                stepItem.classList.add('completed');
            }
        }
    }
}

/**
 * Update exchange rate display
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 */
async function updateExchangeRateDisplay(fromCurrency, toCurrency) {
    try {
        // Get exchange rates
        const rates = await api.getExchangeRates();
        const rateKey = `${fromCurrency}-${toCurrency}`;
        let rate = rates[rateKey];
        
        // If direct rate not found, try to calculate via USD
        if (!rate && fromCurrency !== 'USDT' && toCurrency !== 'USDT') {
            const fromToUSD = rates[`${fromCurrency}-USDT`];
            const usdToTarget = rates[`USDT-${toCurrency}`];
            if (fromToUSD && usdToTarget) {
                rate = fromToUSD * usdToTarget;
            }
        }
        
        // Default fallback
        rate = rate || 1;
        
        // Update rate displays
        const rateElements = document.querySelectorAll('#summary-rate, #final-rate');
        rateElements.forEach(element => {
            element.textContent = `1 ${fromCurrency} = ${rate.toFixed(2)} ${toCurrency}`;
        });
        
        // Store the rate for later use
        window.exchangeRate = rate;
    } catch (error) {
        console.error('Error updating exchange rate:', error);
    }
}

/**
 * Calculate converted amount based on exchange rate
 * @param {number} amount - Original amount
 * @param {number} rate - Exchange rate
 * @param {number} feePercentage - Fee percentage
 * @returns {Object} - Conversion details
 */
function calculateConversion(amount, rate, feePercentage = 0.5) {
    const convertedAmount = amount * rate;
    const feeAmount = convertedAmount * (feePercentage / 100);
    const finalAmount = convertedAmount - feeAmount;
    
    return {
        original: amount,
        converted: convertedAmount,
        fee: feeAmount,
        final: finalAmount,
        rate: rate,
        feePercentage: feePercentage
    };
}

/**
 * Update transaction summary in step 5
 */
function updateTransactionSummary() {
    const amount = window.transactionData.amount;
    const fromCurrency = window.transactionData.fromCurrency;
    const toCurrency = window.transactionData.toCurrency;
    const receiver = window.transactionData.receiver;
    const rate = window.exchangeRate || 0.91; // Default to 0.91 if not set
    
    // Calculate converted amount
    const conversionDetails = calculateConversion(amount, rate);
    
    // Update summary elements
    document.getElementById('summary-amount').textContent = `${amount} ${fromCurrency}`;
    document.getElementById('summary-receiver').textContent = receiver;
    document.getElementById('summary-converted').textContent = `${conversionDetails.final.toFixed(2)} ${toCurrency}`;
    
    // Store conversion details for later use
    window.conversionDetails = conversionDetails;
}

/**
 * Update final summary in step 6
 */
function updateFinalSummary() {
    const amount = window.transactionData.amount;
    const fromCurrency = window.transactionData.fromCurrency;
    const toCurrency = window.transactionData.toCurrency;
    const receiver = window.transactionData.receiver;
    const conversionDetails = window.conversionDetails;
    
    // Update final summary elements
    document.getElementById('final-amount').textContent = `${amount} ${fromCurrency}`;
    document.getElementById('final-receiver').textContent = receiver;
    document.getElementById('final-converted').textContent = `${conversionDetails.final.toFixed(2)} ${toCurrency}`;
    document.getElementById('final-total').textContent = `${amount} ${fromCurrency}`;
}

/**
 * Process the Lightning-FX transaction
 */
async function processLightningFXTransaction() {
    try {
        // Execute the Lightning-FX swap using the API
        const result = await api.executeFullSwap(
            window.transactionData.amount,
            window.transactionData.fromCurrency,
            window.transactionData.toCurrency,
            window.transactionData.receiver
        );
        
        // Show completion screen
        const completeStep = document.getElementById('exchange-step-complete');
        if (completeStep) {
            // Update transaction details
            document.getElementById('transaction-id').textContent = result.transactionId || 'HP-C3XH84JSC';
            document.getElementById('complete-sender-amount').textContent = `${result.amount} ${result.fromCurrency}`;
            document.getElementById('complete-recipient').textContent = result.receiver;
            document.getElementById('complete-receiver-amount').textContent = `${window.conversionDetails.final.toFixed(2)} ${result.toCurrency}`;
            document.getElementById('transaction-date').textContent = result.date || new Date().toLocaleDateString();
            
            // Hide all steps
            const steps = document.querySelectorAll('.exchange-step');
            steps.forEach(step => {
                step.style.display = 'none';
            });
            
            // Show completion step
            completeStep.style.display = 'block';
            
            // Update progress to 100%
            updateProgress(window.maxSteps);
            updateStepIndicators(window.maxSteps);
        }
    } catch (error) {
        console.error('Error processing Lightning-FX transaction:', error);
        alert('Transaction failed: ' + (error.message || 'Please try again later.'));
        
        // Re-enable buttons
        document.getElementById('step-6-back').disabled = false;
        document.getElementById('step-6-submit').disabled = false;
        
        // Hide processing message
        document.getElementById('processing-message').style.display = 'none';
        document.getElementById('final-actions').style.display = 'flex';
    }
}