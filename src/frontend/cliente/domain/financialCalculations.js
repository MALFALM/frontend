/**
 * Calcula la cuota mensual utilizando el método francés, considerando valor residual y periodos de gracia.
 * @param {number} p Monto principal (préstamo) a amortizar en el periodo de cuotas normales
 * @param {number} i Tasa de interés efectiva del periodo (ej. mensual, expresada en decimal)
 * @param {number} n Número de periodos (cuotas normales a pagar)
 * @param {number} residualValue Valor residual (balón) a pagar al final
 * @returns {number} Valor de la cuota constante
 */
export function calculateFrenchQuota(p, i, n, residualValue = 0) {
    if (i === 0) return (p - residualValue) / n;
    
    // Si hay valor residual, el valor presente de las cuotas es P - (Residual / (1+i)^n)
    const presentValueToAmortize = p - (residualValue / Math.pow(1 + i, n));
    return presentValueToAmortize * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
}

/**
 * Convierte una tasa nominal a efectiva anual.
 */
export function nominalToEffective(nominalRate, capitalizationPeriods) {
    return Math.pow(1 + (nominalRate / capitalizationPeriods), capitalizationPeriods) - 1;
}

/**
 * Convierte una TEA a tasa del periodo (ej. mensual).
 */
export function effectiveAnnualToPeriod(tea, periodsInYear = 12) {
    return Math.pow(1 + tea, 1 / periodsInYear) - 1;
}

/**
 * Calcula el cronograma de pagos avanzado.
 * @param {Object} params Parámetros de simulación
 */
export function generateSchedule({
    loanAmount,
    monthlyRate,
    periods,
    monthlyInsuranceFixed = 0,
    desgravamenRate = 0, // Porcentaje mensual sobre saldo deudor
    residualValue = 0,
    gracePeriodsTotal = 0,
    gracePeriodsPartial = 0
}) {
    const schedule = [];
    let balance = loanAmount;
    
    const totalGracePeriods = gracePeriodsTotal + gracePeriodsPartial;
    const normalPeriods = periods - totalGracePeriods;

    if (normalPeriods <= 0) {
        throw new Error("El plazo debe ser mayor a la suma de los periodos de gracia.");
    }

    for (let month = 1; month <= periods; month++) {
        // Seguros
        const desgravamenAmount = balance * desgravamenRate;
        const totalInsurance = monthlyInsuranceFixed + desgravamenAmount;
        
        let interest = balance * monthlyRate;
        let amortization = 0;
        let quota = 0;
        let initialBalanceForLog = balance;

        if (month <= gracePeriodsTotal) {
            // Gracia Total: No paga interés ni capital. El interés se capitaliza.
            amortization = 0; 
            quota = 0;
            // El interés se suma al saldo
            balance += interest;
        } else if (month <= totalGracePeriods) {
            // Gracia Parcial: Paga interés, no amortiza
            amortization = 0;
            quota = interest;
            // Saldo se mantiene igual
        } else {
            // Periodo normal
            const remainingPeriods = periods - month + 1;
            const adjustedRate = monthlyRate + desgravamenRate;
            const pmt = calculateFrenchQuota(balance, adjustedRate, remainingPeriods, residualValue);
            
            if (month === periods) {
                // Última cuota: ajustamos por posibles errores de redondeo
                // Al final debe pagarse todo el saldo pendiente. 
                // La amortización de la cuota limpia el saldo. El cliente paga el saldo total.
                amortization = balance; 
                quota = amortization + interest;
            } else {
                // Desglosar la cuota PMT que incluye el desgravamen
                amortization = pmt - interest - desgravamenAmount;
                quota = pmt - desgravamenAmount;
            }
            balance -= amortization;
        }

        const totalQuota = quota + totalInsurance;

        schedule.push({
            month,
            initialBalance: initialBalanceForLog,
            amortization,
            interest,
            insurance: totalInsurance,
            quota: quota,
            totalQuota,
            type: month <= gracePeriodsTotal ? 'Gracia Total' : (month <= totalGracePeriods ? 'Gracia Parcial' : 'Cuota Normal')
        });
    }

    return schedule;
}

/**
 * Calcula el Valor Actual Neto (VAN)
 */
export function calculateNPV(initialInvestment, cashFlows, discountRate) {
    let npv = -initialInvestment;
    for (let t = 0; t < cashFlows.length; t++) {
        npv += cashFlows[t] / Math.pow(1 + discountRate, t + 1);
    }
    return npv;
}

/**
 * Calcula la Tasa Interna de Retorno (TIR)
 */
export function calculateIRR(initialInvestment, cashFlows) {
    const maxIterations = 1000;
    const precision = 1e-7;
    let rate = 0.1;

    for (let i = 0; i < maxIterations; i++) {
        let npv = -initialInvestment;
        let derivativeNpv = 0;

        for (let t = 0; t < cashFlows.length; t++) {
            const time = t + 1;
            const factor = Math.pow(1 + rate, time);
            npv += cashFlows[t] / factor;
            derivativeNpv -= (time * cashFlows[t]) / (factor * (1 + rate));
        }

        const newRate = rate - npv / derivativeNpv;
        if (Math.abs(newRate - rate) < precision) {
            return newRate;
        }
        rate = newRate;
    }
    return rate;
}

export function calculateTCEA(monthlyIRR) {
    return Math.pow(1 + monthlyIRR, 12) - 1;
}
