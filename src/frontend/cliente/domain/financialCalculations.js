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

        if (month <= gracePeriodsTotal) {
            // Gracia Total: No paga nada, el interés se capitaliza
            amortization = -interest; 
            quota = 0;
            // El seguro en gracia total igual se cobra o se difiere? Normalmente se paga seguro.
            // Asumiremos que la cuota es solo el seguro.
        } else if (month <= totalGracePeriods) {
            // Gracia Parcial: Paga interés, no amortiza
            amortization = 0;
            quota = interest;
        } else {
            // Periodo normal
            // Recalcular cuota asumiendo el saldo actual y los periodos restantes normales
            const remainingPeriods = periods - month + 1;
            quota = calculateFrenchQuota(balance, monthlyRate, remainingPeriods, residualValue);
            
            // Ajuste por valor residual en la última cuota
            if (month === periods) {
                amortization = balance; // Amortiza todo el saldo restante (que incluye el VR)
                interest = balance * monthlyRate; // El interés se basa en el saldo antes de la amortización
                // Pero la cuota en el último mes será la cuota normal + valor residual
                quota = amortization + interest;
            } else {
                interest = balance * monthlyRate;
                amortization = quota - interest;
            }
        }

        const totalQuota = quota + totalInsurance;

        schedule.push({
            month,
            initialBalance: balance,
            amortization,
            interest,
            insurance: totalInsurance,
            quota,
            totalQuota,
            type: month <= gracePeriodsTotal ? 'Gracia Total' : (month <= totalGracePeriods ? 'Gracia Parcial' : 'Cuota Normal')
        });

        balance -= amortization;
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
