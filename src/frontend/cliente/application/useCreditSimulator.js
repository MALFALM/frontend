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
import { apiRequest } from '../../../services/api';

const STORAGE_KEY = 'altoque_simulation_state';
const HISTORY_KEY = 'altoque_saved_simulations';

const loadJson = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error(`Error loading ${key}`, error);
    return fallback;
  }
};

const savedState = loadJson(STORAGE_KEY, {});
const savedSimulationsList = ref(loadJson(HISTORY_KEY, []));
const saveError = ref('');
const isSaving = ref(false);

const selectedEntityId = ref(savedState.selectedEntityId || 'custom');
const selectedProductId = ref(savedState.selectedProductId || 'custom');
const selectedPromotionId = ref(savedState.selectedPromotionId || null);
const vehiclePrice = ref(savedState.vehiclePrice || 60000);
const currency = ref(savedState.currency || 'PEN');
const downPaymentPercentage = ref(savedState.downPaymentPercentage || 20);
const periods = ref(savedState.periods || 48);
const rateType = ref(savedState.rateType || 'TEA');
const rateValue = ref(savedState.rateValue || 15);
const capitalization = ref(savedState.capitalization || 12);
const hasVehicularInsurance = ref(savedState.hasVehicularInsurance !== undefined ? savedState.hasVehicularInsurance : true);
const vehicularInsurancePercentage = ref(savedState.vehicularInsurancePercentage || 0.1);
const hasDesgravamen = ref(savedState.hasDesgravamen !== undefined ? savedState.hasDesgravamen : true);
const desgravamenRate = ref(savedState.desgravamenRate || 0.05);
const hasPortes = ref(savedState.hasPortes !== undefined ? savedState.hasPortes : true);
const portesValue = ref(savedState.portesValue || 5.00);
const gracePeriodsTotal = ref(savedState.gracePeriodsTotal || 0);
const gracePeriodsPartial = ref(savedState.gracePeriodsPartial || 0);
const residualValue = ref(savedState.residualValue || 0);

watch([
  selectedEntityId, selectedProductId, selectedPromotionId, vehiclePrice, currency, downPaymentPercentage, periods,
  rateType, rateValue, capitalization, hasVehicularInsurance, vehicularInsurancePercentage,
  hasDesgravamen, desgravamenRate, hasPortes, portesValue, gracePeriodsTotal, gracePeriodsPartial, residualValue
], () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
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
  }));
}, { deep: true });

export function useCreditSimulator() {
  const entitiesStore = useEntitiesStore();
  const { entities: financialEntities, loadEntities } = entitiesStore;
  loadEntities();

  const isProductLocked = computed(() => selectedProductId.value !== 'custom');

  const availableProducts = computed(() => {
    if (selectedEntityId.value === 'custom') return [];
    const entity = financialEntities.value.find((item) => item.id === selectedEntityId.value);
    return entity ? entity.products : [];
  });

  watch(selectedEntityId, (newEntity) => {
    if (newEntity === 'custom') {
      selectedProductId.value = 'custom';
      return;
    }

    const products = availableProducts.value;
    const currentProductValid = products.find((product) => product.id === selectedProductId.value);
    if (products.length > 0 && !currentProductValid) {
      selectedProductId.value = products[0].id;
    }
  });

  watch([selectedProductId, availableProducts], ([newProductId, products]) => {
    if (newProductId === 'custom') return;
    const product = products.find((item) => item.id === newProductId);
    if (!product) return;

    rateType.value = product.rateType;
    rateValue.value = product.rateValue;
    capitalization.value = product.capitalization;
    hasDesgravamen.value = product.hasDesgravamen;
    desgravamenRate.value = product.desgravamenRate;
    hasVehicularInsurance.value = product.hasVehicularInsurance;
    vehicularInsurancePercentage.value = product.vehicularInsurancePercentage;
    hasPortes.value = product.hasPortes;
    portesValue.value = product.portesValue;

    if (selectedPromotionId.value) {
      const hasPromo = (product.promotions || []).find((promo) => promo.id === selectedPromotionId.value && promo.active);
      if (!hasPromo) selectedPromotionId.value = null;
    }
  }, { deep: true, immediate: true });

  const activePromotion = computed(() => {
    if (selectedProductId.value === 'custom' || !selectedPromotionId.value) return null;
    const product = availableProducts.value.find((item) => item.id === selectedProductId.value);
    return product?.promotions?.find((promo) => promo.id === selectedPromotionId.value && promo.active) || null;
  });

  const minDownPaymentPercentage = computed(() => {
    if (activePromotion.value?.type === 'zero_down_payment') return 0;
    return 20;
  });

  watch(minDownPaymentPercentage, (newMin) => {
    if (downPaymentPercentage.value < newMin) downPaymentPercentage.value = newMin;
  });

  const loanAmount = computed(() => {
    let amount = vehiclePrice.value - ((vehiclePrice.value * downPaymentPercentage.value) / 100);
    if (activePromotion.value?.type === 'capital_discount') amount -= activePromotion.value.value;
    return Math.max(0, amount);
  });

  const monthlyInsuranceFixed = computed(() => {
    let total = 0;
    if (hasVehicularInsurance.value && activePromotion.value?.type !== 'free_vehicular_insurance') {
      total += vehiclePrice.value * (vehicularInsurancePercentage.value / 100);
    }
    if (hasPortes.value && activePromotion.value?.type !== 'free_portes') {
      total += portesValue.value;
    }
    return total;
  });

  const monthlyRate = computed(() => {
    let baseRateValue = Number(rateValue.value || 0);
    if (activePromotion.value?.type === 'rate_discount') baseRateValue -= activePromotion.value.value;
    const rateDecimal = Math.max(0, baseRateValue) / 100;
    const tea = rateType.value === 'TNA' ? nominalToEffective(rateDecimal, capitalization.value) : rateDecimal;
    return effectiveAnnualToPeriod(tea, 12);
  });

  const schedule = computed(() => {
    try {
      let finalDesgravamenRate = hasDesgravamen.value ? (desgravamenRate.value / 100) : 0;
      if (activePromotion.value?.type === 'free_desgravamen') finalDesgravamenRate = 0;

      let finalGracePeriodsTotal = gracePeriodsTotal.value;
      if (activePromotion.value?.type === 'grace_months') finalGracePeriodsTotal += activePromotion.value.value;

      let finalGracePeriodsPartial = gracePeriodsPartial.value;
      if (activePromotion.value?.type === 'grace_months_partial') finalGracePeriodsPartial += activePromotion.value.value;

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
      console.error('Error al generar cronograma:', error.message);
      return [];
    }
  });

  const metrics = computed(() => {
    if (!schedule.value.length) return { van: 0, tir: 0, tirMonthly: 0, tirAnnual: 0, tcea: 0, monthlyPayment: 0 };
    const amount = loanAmount.value;
    const cashFlows = schedule.value.map((item) => item.cashFlow ?? item.totalQuota);
    const discountRate = effectiveAnnualToPeriod(0.1, 12);
    const van = calculateNPV(amount, cashFlows, discountRate);
    const monthlyIRR = calculateIRR(amount, cashFlows);
    const tcea = calculateTCEA(monthlyIRR);
    const normalQuotaItem = schedule.value.find((item) => item.type === 'Cuota Normal');
    const tirAnnual = (Math.pow(1 + monthlyIRR, 12) - 1) * 100;

    return {
      van,
      tir: tirAnnual,
      tirMonthly: monthlyIRR * 100,
      tirAnnual,
      tcea: tcea * 100,
      monthlyPayment: normalQuotaItem ? normalQuotaItem.totalQuota : schedule.value[0].totalQuota
    };
  });

  const persistHistory = () => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(savedSimulationsList.value));
  };

  const saveCurrentSimulation = async (customName) => {
    const sim = {
      id: Date.now().toString(),
      name: customName || `Simulacion ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      entity: selectedEntityId.value,
      product: selectedProductId.value,
      currency: currency.value,
      vehiclePrice: vehiclePrice.value,
      downPayment: (vehiclePrice.value * downPaymentPercentage.value) / 100,
      loanAmount: loanAmount.value,
      periods: periods.value,
      rateType: rateType.value,
      rateValue: rateValue.value,
      tcea: metrics.value.tcea,
      tir: metrics.value.tir,
      van: metrics.value.van,
      monthlyPayment: metrics.value.monthlyPayment,
      residualValue: residualValue.value,
      schedule: schedule.value
    };

    savedSimulationsList.value.unshift(sim);
    persistHistory();
    saveError.value = '';
    isSaving.value = true;

    try {
      const response = await apiRequest('/creditos/guardar', {
        method: 'POST',
        body: { simulation: sim }
      });
      sim.backendId = response.data?.idCredito;
      persistHistory();
    } catch (error) {
      saveError.value = error.message;
    } finally {
      isSaving.value = false;
    }

    return sim;
  };

  const deleteSimulation = (id) => {
    savedSimulationsList.value = savedSimulationsList.value.filter((simulation) => simulation.id !== id);
    persistHistory();
  };

  const loadSimulation = (sim) => {
    selectedEntityId.value = sim.entity;
    selectedProductId.value = sim.product;
    vehiclePrice.value = sim.vehiclePrice;
    downPaymentPercentage.value = sim.vehiclePrice ? Math.round((sim.downPayment / sim.vehiclePrice) * 10000) / 100 : 20;
    periods.value = sim.periods;
    rateType.value = sim.rateType || 'TEA';
    rateValue.value = sim.rateValue;
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
    portesValue,
    loanAmount,
    monthlyInsuranceFixed,
    schedule,
    metrics,
    savedSimulationsList,
    isSaving,
    saveError,
    saveCurrentSimulation,
    deleteSimulation,
    loadSimulation
  };
}
