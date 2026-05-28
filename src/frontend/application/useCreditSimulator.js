import { ref, computed, watch } from 'vue';
import { 
    generateSchedule, 
    effectiveAnnualToPeriod, 
    nominalToEffective,
    calculateNPV, 
    calculateIRR, 
    calculateTCEA 
} from '../domain/financialCalculations.js';
import { financialEntities } from '../infrastructure/mocks/entities.js';
const API_URL = import.meta.env.VITE_API_URL;

const backendSimulation = ref(null);
const backendLoading = ref(false);
const backendError = ref(null);
// ---- GLOBAL STATE (Shared across all components) ----
// Intentamos cargar desde localStorage al inicio
const STORAGE_KEY = 'altoque_simulation_state';
const loadInitialState = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error("Error loading state", e);
    }
    return null;
};

const savedState = loadInitialState() || {};

// Historial de Simulaciones Guardadas
const HISTORY_KEY = 'altoque_saved_simulations';
const loadHistory = () => {
    try {
        const saved = localStorage.getItem(HISTORY_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
};
const savedSimulationsList = ref(loadHistory());

// Configuración Entidad / Producto
const selectedEntityId = ref(savedState.selectedEntityId || 'custom');
const selectedProductId = ref(savedState.selectedProductId || 'custom');

// Configuración Básica
const vehiclePrice = ref(savedState.vehiclePrice || 60000);
const currency = ref(savedState.currency || 'PEN');
const downPaymentPercentage = ref(savedState.downPaymentPercentage || 20);
const periods = ref(savedState.periods || 48);

// Configuración Tasas
const rateType = ref(savedState.rateType || 'TEA');
const rateValue = ref(savedState.rateValue || 15); 
const capitalization = ref(savedState.capitalization || 12); 

// Configuración Seguros
const hasVehicularInsurance = ref(savedState.hasVehicularInsurance !== undefined ? savedState.hasVehicularInsurance : true);
const vehicularInsurancePercentage = ref(savedState.vehicularInsurancePercentage || 0.1); 
const hasDesgravamen = ref(savedState.hasDesgravamen !== undefined ? savedState.hasDesgravamen : true);
const desgravamenRate = ref(savedState.desgravamenRate || 0.05);
const hasPortes = ref(savedState.hasPortes !== undefined ? savedState.hasPortes : true);
const portesValue = ref(savedState.portesValue || 5.00);

// Configuración Avanzada
const gracePeriodsTotal = ref(savedState.gracePeriodsTotal || 0);
const gracePeriodsPartial = ref(savedState.gracePeriodsPartial || 0);
const residualValue = ref(savedState.residualValue || 0);

// Auto-guardado en LocalStorage
watch([
    selectedEntityId, selectedProductId, vehiclePrice, currency, downPaymentPercentage, periods,
    rateType, rateValue, capitalization, hasVehicularInsurance, vehicularInsurancePercentage,
    hasDesgravamen, desgravamenRate, hasPortes, portesValue, gracePeriodsTotal, gracePeriodsPartial, residualValue
], () => {
    const stateToSave = {
        selectedEntityId: selectedEntityId.value,
        selectedProductId: selectedProductId.value,
        vehiclePrice: vehiclePrice.value,
        currency: currency.value,
        downPaymentPercentage: downPaymentPercentage.value,
        periods: periods.value,
        rateType: rateType.value,
        rateValue: rateValue.value,
        capitalization: capitalization.value,
        hasVehicularInsurance: hasVehicularInsurance.value,
        vehicularInsurancePercentage: vehicularInsurancePercentage.value,
        hasDesgravamen: hasDesgravamen.value,
        desgravamenRate: desgravamenRate.value,
        hasPortes: hasPortes.value,
        portesValue: portesValue.value,
        gracePeriodsTotal: gracePeriodsTotal.value,
        gracePeriodsPartial: gracePeriodsPartial.value,
        residualValue: residualValue.value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
}, { deep: true });

export function useCreditSimulator() {
    // Lógica de Bloqueo por Banco
    const isProductLocked = computed(() => selectedProductId.value !== 'custom');

    // Obtener los productos de la entidad seleccionada para el UI
    const availableProducts = computed(() => {
        if (selectedEntityId.value === 'custom') return [];
        const entity = financialEntities.find(e => e.id === selectedEntityId.value);
        return entity ? entity.products : [];
    });

    // Resetear el producto si cambia el banco
    watch(selectedEntityId, (newEntity) => {
        if (newEntity === 'custom') {
            selectedProductId.value = 'custom';
        } else {
            const products = availableProducts.value;
            if (products.length > 0) {
                // Solo auto-selecciona el primer producto si no estamos cargando uno previamente válido
                const currentProductValid = products.find(p => p.id === selectedProductId.value);
                if (!currentProductValid) {
                    selectedProductId.value = products[0].id;
                }
            }
        }
    });

    // Sobrescribir variables si se elige un producto real
    watch(selectedProductId, (newProductId) => {
        if (newProductId !== 'custom') {
            const products = availableProducts.value;
            const product = products.find(p => p.id === newProductId);
            
            if (product) {
                rateType.value = product.rateType;
                rateValue.value = product.rateValue;
                capitalization.value = product.capitalization;
                
                hasDesgravamen.value = product.hasDesgravamen;
                desgravamenRate.value = product.desgravamenRate;
                
                hasVehicularInsurance.value = product.hasVehicularInsurance;
                vehicularInsurancePercentage.value = product.vehicularInsurancePercentage;
                
                hasPortes.value = product.hasPortes;
                portesValue.value = product.portesValue;
            }
        }
    });

    // Cálculos
    const loanAmount = computed(() => {
        const dp = (vehiclePrice.value * downPaymentPercentage.value) / 100;
        return vehiclePrice.value - dp;
    });

    const monthlyInsuranceFixed = computed(() => {
        let total = 0;
        if (hasVehicularInsurance.value) {
            total += (vehiclePrice.value * (vehicularInsurancePercentage.value / 100));
        }
        if (hasPortes.value) total += portesValue.value;
        return total;
    });

    const monthlyRate = computed(() => {
        const rateDecimal = rateValue.value / 100;
        let tea = rateDecimal;
        
        if (rateType.value === 'TNA') {
            tea = nominalToEffective(rateDecimal, capitalization.value);
        }
        
        return effectiveAnnualToPeriod(tea, 12);
    });

    const schedule = computed(() => {
        try {
            return generateSchedule({
                loanAmount: loanAmount.value,
                monthlyRate: monthlyRate.value,
                periods: periods.value,
                monthlyInsuranceFixed: monthlyInsuranceFixed.value,
                desgravamenRate: hasDesgravamen.value ? (desgravamenRate.value / 100) : 0,
                residualValue: residualValue.value,
                gracePeriodsTotal: gracePeriodsTotal.value,
                gracePeriodsPartial: gracePeriodsPartial.value
            });
        } catch (error) {
            console.error("Error al generar cronograma:", error.message);
            return [];
        }
    });

    const metrics = computed(() => {
        if (!schedule.value || schedule.value.length === 0) return { van: 0, tir: 0, tcea: 0, monthlyPayment: 0 };
        
        const amount = loanAmount.value;
        const cashFlows = schedule.value.map(item => item.totalQuota);
        const discountRate = effectiveAnnualToPeriod(0.1, 12); // COK 10%
        
        const van = calculateNPV(amount, cashFlows, discountRate);
        const monthlyIRR = calculateIRR(amount, cashFlows);
        const tcea = calculateTCEA(monthlyIRR);

        // Encontrar la primera cuota normal
        const normalQuotaItem = schedule.value.find(s => s.type === 'Cuota Normal');
        
        return {
            van: van,
            tir: (Math.pow(1 + monthlyIRR, 12) - 1) * 100,
            tcea: tcea * 100,
            monthlyPayment: normalQuotaItem ? normalQuotaItem.totalQuota : schedule.value[0].totalQuota
        };
    });

    const saveCurrentSimulation = (customName) => {
        const sim = {
            id: Date.now().toString(),
            name: customName || `Simulación ${new Date().toLocaleDateString()}`,
            date: new Date().toISOString(),
            entity: selectedEntityId.value,
            product: selectedProductId.value,
            vehiclePrice: vehiclePrice.value,
            downPayment: (vehiclePrice.value * downPaymentPercentage.value) / 100,
            loanAmount: loanAmount.value,
            periods: periods.value,
            rateType: rateType.value,
            rateValue: rateValue.value,
            tcea: metrics.value.tcea,
            monthlyPayment: metrics.value.monthlyPayment
        };
        
        savedSimulationsList.value.unshift(sim); // Agregar al inicio
        localStorage.setItem(HISTORY_KEY, JSON.stringify(savedSimulationsList.value));
        return sim;
    };

    const deleteSimulation = (id) => {
        savedSimulationsList.value = savedSimulationsList.value.filter(s => s.id !== id);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(savedSimulationsList.value));
    };

    
    const simulateWithBackend = async () => {
        backendLoading.value = true;
        backendError.value = null;

        try {
            const payload = {
                precioVehiculo: Number(vehiclePrice.value),
                cuotaInicial: Number((vehiclePrice.value * downPaymentPercentage.value) / 100),
                tasaInteres: Number(rateValue.value),
                plazoMeses: Number(periods.value),
                valorResidual: Number(residualValue.value),
                tipoTasa: rateType.value === 'TEA' ? 'EFECTIVA' : 'NOMINAL'
            };

            const response = await fetch(`${API_URL}/creditos/simular`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al simular crédito en backend');
            }

            backendSimulation.value = data;
            return data;
        } catch (error) {
            backendError.value = error.message;
            console.error('Error conectando con backend:', error);
            return null;
        } finally {
            backendLoading.value = false;
        }
    };

    return {
        financialEntities,
        selectedEntityId,
        selectedProductId,
        availableProducts,
        isProductLocked,
        
        vehiclePrice,
        currency,
        downPaymentPercentage,
        periods,
        
        rateType,
        rateValue,
        capitalization,
        
        hasVehicularInsurance,
        vehicularInsurancePercentage,
        hasDesgravamen,
        desgravamenRate,
        
        gracePeriodsTotal,
        gracePeriodsPartial,
        residualValue,
        
        hasPortes,
        
        loanAmount,
        monthlyInsuranceFixed,
        schedule,
        metrics,

        savedSimulationsList,
        saveCurrentSimulation,
        deleteSimulation,

        backendSimulation,
        backendLoading,
        backendError,
        simulateWithBackend
    };
}
