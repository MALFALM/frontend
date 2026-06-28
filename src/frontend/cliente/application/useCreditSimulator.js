import { ref, computed, watch } from 'vue';
import { 
    generateSchedule, 
    effectiveAnnualToPeriod, 
    nominalToEffective,
    calculateNPV, 
    calculateIRR, 
    calculateTCEA 
} from '../domain/financialCalculations.js';
import { useEntitiesStore } from '../../entidad-financiera/application/useEntitiesStore.js';

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
const selectedPromotionId = ref(savedState.selectedPromotionId || null);

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
    selectedEntityId, selectedProductId, selectedPromotionId, vehiclePrice, currency, downPaymentPercentage, periods,
    rateType, rateValue, capitalization, hasVehicularInsurance, vehicularInsurancePercentage,
    hasDesgravamen, desgravamenRate, hasPortes, portesValue, gracePeriodsTotal, gracePeriodsPartial, residualValue
], () => {
    const stateToSave = {
        selectedEntityId: selectedEntityId.value,
        selectedProductId: selectedProductId.value,
        selectedPromotionId: selectedPromotionId.value,
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
    const { entities: financialEntities } = useEntitiesStore();

    // Lógica de Bloqueo por Banco
    const isProductLocked = computed(() => selectedProductId.value !== 'custom');

    // Obtener los productos de la entidad seleccionada para el UI
    const availableProducts = computed(() => {
        if (selectedEntityId.value === 'custom') return [];
        const entity = financialEntities.value.find(e => e.id === selectedEntityId.value);
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

    // Sobrescribir variables si se elige un producto real o si el banco lo actualiza
    watch([selectedProductId, availableProducts], ([newProductId, products]) => {
        if (newProductId !== 'custom') {
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

                // Reset promotion if the new product doesn't have it active
                if (selectedPromotionId.value) {
                    const hasPromo = (product.promotions || []).find(pr => pr.id === selectedPromotionId.value && pr.active);
                    if (!hasPromo) {
                        selectedPromotionId.value = null;
                    }
                }
            }
        }
    }, { deep: true, immediate: true });

    const activePromotion = computed(() => {
        if (selectedProductId.value === 'custom' || !selectedPromotionId.value) return null;
        const product = availableProducts.value.find(p => p.id === selectedProductId.value);
        if (!product || !product.promotions) return null;
        return product.promotions.find(pr => pr.id === selectedPromotionId.value && pr.active) || null;
    });

    // Cuota Inicial Dinámica
    const minDownPaymentPercentage = computed(() => {
        if (activePromotion.value && activePromotion.value.type === 'zero_down_payment') {
            return 0;
        }
        return 20;
    });

    watch(minDownPaymentPercentage, (newMin) => {
        if (downPaymentPercentage.value < newMin) {
            downPaymentPercentage.value = newMin;
        }
    });

    // Cálculos
    const loanAmount = computed(() => {
        const dp = (vehiclePrice.value * downPaymentPercentage.value) / 100;
        let baseAmount = vehiclePrice.value - dp;
        
        // Aplicar bono descuento capital
        if (activePromotion.value && activePromotion.value.type === 'capital_discount') {
            baseAmount -= activePromotion.value.value;
        }
        
        return Math.max(0, baseAmount);
    });

    const monthlyInsuranceFixed = computed(() => {
        let total = 0;
        if (hasVehicularInsurance.value) {
            if (!(activePromotion.value && activePromotion.value.type === 'free_vehicular_insurance')) {
                total += (vehiclePrice.value * (vehicularInsurancePercentage.value / 100));
            }
        }
        if (hasPortes.value) {
            if (!(activePromotion.value && activePromotion.value.type === 'free_portes')) {
                total += portesValue.value;
            }
        }
        return total;
    });

    const monthlyRate = computed(() => {
        let baseRateValue = rateValue.value;
        if (activePromotion.value && activePromotion.value.type === 'rate_discount') {
            baseRateValue -= activePromotion.value.value;
        }

        const rateDecimal = Math.max(0, baseRateValue) / 100;
        let tea = rateDecimal;
        
        if (rateType.value === 'TNA') {
            tea = nominalToEffective(rateDecimal, capitalization.value);
        }
        
        return effectiveAnnualToPeriod(tea, 12);
    });

    const schedule = computed(() => {
        try {
            let finalDesgravamenRate = hasDesgravamen.value ? (desgravamenRate.value / 100) : 0;
            if (activePromotion.value && activePromotion.value.type === 'free_desgravamen') {
                finalDesgravamenRate = 0;
            }

            let finalGracePeriodsTotal = gracePeriodsTotal.value;
            if (activePromotion.value && activePromotion.value.type === 'grace_months') {
                finalGracePeriodsTotal += activePromotion.value.value;
            }

            let finalGracePeriodsPartial = gracePeriodsPartial.value;
            if (activePromotion.value && activePromotion.value.type === 'grace_months_partial') {
                finalGracePeriodsPartial += activePromotion.value.value;
            }

            return generateSchedule({
                loanAmount: loanAmount.value,
                monthlyRate: monthlyRate.value,
                periods: periods.value,
                monthlyInsuranceFixed: monthlyInsuranceFixed.value,
                desgravamenRate: finalDesgravamenRate,
                residualValue: residualValue.value,
                gracePeriodsTotal: finalGracePeriodsTotal,
                gracePeriodsPartial: finalGracePeriodsPartial
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

    const loadSimulation = (sim) => {
        selectedEntityId.value = sim.entity;
        selectedProductId.value = sim.product;
        vehiclePrice.value = sim.vehiclePrice;
        
        // Calcular el porcentaje de cuota inicial a partir de sim.downPayment
        const percentage = (sim.downPayment / sim.vehiclePrice) * 100;
        downPaymentPercentage.value = Math.round(percentage * 100) / 100; // Redondear a 2 decimales
        
        periods.value = sim.periods;
        rateType.value = sim.rateType || 'TEA';
        rateValue.value = sim.rateValue;
        
        // Deseleccionar promociones previas al cargar una antigua
        selectedPromotionId.value = null;
    };

    return {
        financialEntities,
        selectedEntityId,
        selectedProductId,
        selectedPromotionId,
        activePromotion,
        availableProducts,
        isProductLocked,
        
        vehiclePrice,
        currency,
        downPaymentPercentage,
        minDownPaymentPercentage,
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
        loadSimulation
    };
}
