import { ref, computed, watch } from 'vue';
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
const simulationResult = ref(null);
const simulationError = ref('');
const isSimulating = ref(false);
let simulationTimer = null;
let simulationRequestId = 0;

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

  const simulationPayload = computed(() => {
    let baseRateValue = Number(rateValue.value || 0);
    if (activePromotion.value?.type === 'rate_discount') baseRateValue -= activePromotion.value.value;

    return {
      vehiclePrice: Number(vehiclePrice.value || 0),
      currency: currency.value,
      downPaymentPercentage: activePromotion.value?.type === 'zero_down_payment'
        ? 0
        : Number(downPaymentPercentage.value || 0),
      periods: Number(periods.value || 0),
      rateType: rateType.value,
      rateValue: Math.max(0, baseRateValue),
      capitalization: Number(capitalization.value || 12),
      hasVehicularInsurance: activePromotion.value?.type === 'free_vehicular_insurance'
        ? false
        : Boolean(hasVehicularInsurance.value),
      vehicularInsurancePercentage: Number(vehicularInsurancePercentage.value || 0),
      hasDesgravamen: activePromotion.value?.type === 'free_desgravamen'
        ? false
        : Boolean(hasDesgravamen.value),
      desgravamenRate: Number(desgravamenRate.value || 0),
      hasPortes: activePromotion.value?.type === 'free_portes'
        ? false
        : Boolean(hasPortes.value),
      portesValue: Number(portesValue.value || 0),
      gracePeriodsTotal: Number(gracePeriodsTotal.value || 0) +
        (activePromotion.value?.type === 'grace_months' ? Number(activePromotion.value.value || 0) : 0),
      gracePeriodsPartial: Number(gracePeriodsPartial.value || 0) +
        (activePromotion.value?.type === 'grace_months_partial' ? Number(activePromotion.value.value || 0) : 0),
      residualValue: Number(residualValue.value || 0)
    };
  });

  const runSimulation = async () => {
    const requestId = ++simulationRequestId;
    isSimulating.value = true;
    simulationError.value = '';

    try {
      const result = await apiRequest('/creditos/simular', {
        method: 'POST',
        body: simulationPayload.value
      });

      if (requestId === simulationRequestId) {
        simulationResult.value = result;
      }
    } catch (error) {
      if (requestId === simulationRequestId) {
        simulationResult.value = null;
        simulationError.value = error.message;
      }
    } finally {
      if (requestId === simulationRequestId) {
        isSimulating.value = false;
      }
    }
  };

  watch(simulationPayload, () => {
    window.clearTimeout(simulationTimer);
    simulationTimer = window.setTimeout(runSimulation, 250);
  }, { deep: true, immediate: true });

  const loanAmount = computed(() => simulationResult.value?.summary?.loanAmount || 0);
  const monthlyInsuranceFixed = computed(() => simulationResult.value?.summary?.totalFixedCharges || 0);
  const schedule = computed(() => simulationResult.value?.schedule || []);
  const metrics = computed(() => {
    const summary = simulationResult.value?.summary || {};
    return {
      van: Number(summary.van || 0),
      tir: Number(summary.tirAnnual || 0),
      tirMonthly: Number(summary.tirMonthly || 0),
      tirAnnual: Number(summary.tirAnnual || 0),
      tcea: Number(summary.tcea || 0),
      monthlyPayment: Number(summary.monthlyPayment || 0)
    };
  });

  const persistHistory = () => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(savedSimulationsList.value));
  };

  const saveCurrentSimulation = async (customName) => {
    if (!simulationResult.value || !schedule.value.length) {
      saveError.value = simulationError.value || 'No hay una simulacion calculada por el backend';
      return null;
    }

    const input = simulationResult.value.input || {};
    const summary = simulationResult.value.summary || {};
    const sim = {
      id: Date.now().toString(),
      name: customName || `Simulacion ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      entity: selectedEntityId.value,
      product: selectedProductId.value,
      currency: input.currency || currency.value,
      vehiclePrice: input.vehiclePrice ?? vehiclePrice.value,
      downPayment: input.downPayment ?? ((vehiclePrice.value * downPaymentPercentage.value) / 100),
      loanAmount: summary.loanAmount ?? loanAmount.value,
      periods: input.periods ?? periods.value,
      rateType: input.rateType || rateType.value,
      rateValue: input.rateValue ?? rateValue.value,
      tcea: summary.tcea ?? metrics.value.tcea,
      tir: summary.tirAnnual ?? metrics.value.tir,
      van: summary.van ?? metrics.value.van,
      monthlyPayment: summary.monthlyPayment ?? metrics.value.monthlyPayment,
      residualValue: input.residualValue ?? residualValue.value,
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
    isSimulating,
    simulationError,
    savedSimulationsList,
    isSaving,
    saveError,
    saveCurrentSimulation,
    deleteSimulation,
    loadSimulation
  };
}
