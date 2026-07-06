/**
 * Calcula la cuota mensual utilizando el metodo frances, considerando valor residual y periodos de gracia.
 * @param {number} p Monto principal del prestamo a amortizar en el periodo de cuotas normales
 * @param {number} i Tasa de interes efectiva del periodo, expresada en decimal
 * @param {number} n Numero de periodos de cuotas normales a pagar
 * @param {number} residualValue Valor residual a pagar al final
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
 * @param {Object} params Parametros de simulacion
 */
export function generateSchedule({
    loanAmount,
    monthlyRate,
    periods,
    monthlyInsuranceFixed = 0,
    desgravamenRate = 0,
    residualValue = 0,
    gracePeriodsTotal = 0,
    gracePeriodsPartial = 0
}) {
    const schedule = [];
    const paymentRate = monthlyRate + desgravamenRate;
    let balance = residualValue > 0
        ? loanAmount - (residualValue / Math.pow(1 + paymentRate, periods + 1))
        : loanAmount;
    let residualBalance = residualValue > 0
        ? residualValue / Math.pow(1 + paymentRate, periods + 1)
        : 0;

    const totalGracePeriods = gracePeriodsTotal + gracePeriodsPartial;
    const normalPeriods = periods - totalGracePeriods;

    if (normalPeriods <= 0) {
        throw new Error("El plazo debe ser mayor a la suma de los periodos de gracia.");
    }

    for (let month = 1; month <= periods; month++) {
        const initialBalanceForLog = balance;
        const interest = initialBalanceForLog * monthlyRate;
        const desgravamenAmount = initialBalanceForLog * desgravamenRate;
        const totalInsurance = monthlyInsuranceFixed + desgravamenAmount;
        const residualInterest = residualBalance * monthlyRate;
        const residualDesgravamen = residualBalance * desgravamenRate;

        let amortization = 0;
        let quota = 0;

        if (month <= gracePeriodsTotal) {
            amortization = 0;
            quota = 0;
            balance += interest;
        } else if (month <= totalGracePeriods) {
            amortization = 0;
            quota = interest;
        } else {
            const remainingPeriods = periods - month + 1;
            const pmt = calculateFrenchQuota(initialBalanceForLog, paymentRate, remainingPeriods, 0);
            amortization = pmt - interest - desgravamenAmount;
            quota = pmt - desgravamenAmount;
            balance -= amortization;
        }

        residualBalance += residualInterest + residualDesgravamen;

        const cashFlow = quota + totalInsurance;

        schedule.push({
            month,
            initialBalance: initialBalanceForLog,
            amortization,
            interest,
            desgravamen: desgravamenAmount,
            fixedCharges: monthlyInsuranceFixed,
            insurance: totalInsurance,
            quota,
            residualPayment: 0,
            totalQuota: month <= gracePeriodsTotal ? 0 : cashFlow,
            cashFlow,
            type: month <= gracePeriodsTotal ? 'Gracia Total' : (month <= totalGracePeriods ? 'Gracia Parcial' : 'Cuota Normal')
        });
    }

    if (residualValue > 0) {
        const residualInterest = residualBalance * monthlyRate;
        const residualDesgravamen = residualBalance * desgravamenRate;
        const residualPayment = residualBalance + residualInterest + residualDesgravamen;

        schedule.push({
            month: periods + 1,
            initialBalance: 0,
            amortization: 0,
            interest: residualInterest,
            desgravamen: residualDesgravamen,
            fixedCharges: monthlyInsuranceFixed,
            insurance: monthlyInsuranceFixed + residualDesgravamen,
            quota: 0,
            residualPayment,
            totalQuota: residualPayment + monthlyInsuranceFixed,
            type: 'Cuota Final'
        });
    }

    return schedule;
}
/**
 * Calcula el Valor Actual Neto (VAN)
 */
export function calculateNPV(initialInvestment, cashFlows, discountRate) {
    let npv = initialInvestment;
    for (let t = 0; t < cashFlows.length; t++) {
        npv -= cashFlows[t] / Math.pow(1 + discountRate, t + 1);
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
