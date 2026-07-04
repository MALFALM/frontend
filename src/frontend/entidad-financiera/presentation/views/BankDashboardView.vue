<script setup>
import { computed } from 'vue';
import { useEntitiesStore } from '../../application/useEntitiesStore';
import { useAuthStore } from '../../../login/application/useAuthStore';

const { getProductsByEntityId } = useEntitiesStore();
const authStore = useAuthStore();

const BANK_ID = computed(() => authStore.user.value?.bankId || 'bcp');

const stats = computed(() => {
  const products = getProductsByEntityId(BANK_ID.value);
  const activeProducts = products.length;
  let activePromosCount = 0;

  let avgRate = 0;
  
  if (activeProducts > 0) {
    avgRate = products.reduce((acc, p) => acc + p.rateValue, 0) / activeProducts;
    
    // Contar promociones activas
    products.forEach(p => {
      if (p.promotions) {
        activePromosCount += p.promotions.filter(promo => promo.active).length;
      }
    });
  }

  return [
    { title: 'Simulaciones Hoy', value: '142', trend: '+12%' },
    { title: 'Productos Activos', value: activeProducts.toString(), trend: '0%' },
    { title: 'Promociones Activas', value: activePromosCount.toString(), trend: '+1' },
    { title: 'Tasa Promedio', value: avgRate.toFixed(2) + '%', trend: '-0.5%' }
  ];
});

const activePromosList = computed(() => {
  const promos = [];
  const products = getProductsByEntityId(BANK_ID.value);
  products.forEach(p => {
    if (p.promotions) {
      p.promotions.filter(promo => promo.active).forEach(promo => {
        promos.push({
          ...promo,
          productName: p.name
        });
      });
    }
  });
  return promos;
});
</script>

<template>
  <div class="dashboard-view">
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.title" class="stat-card">
        <h3 class="stat-title">{{ stat.title }}</h3>
        <div class="stat-body">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-trend" :class="stat.trend.startsWith('+') ? 'positive' : (stat.trend === '0%' ? 'neutral' : 'negative')">
            {{ stat.trend }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="welcome-box mt-4">
      <h2>¡Bienvenido al Inicio Administrativo!</h2>
      <p>Desde aquí podrás controlar las condiciones de tus productos financieros. Los cambios que realices en <strong>Mis Productos</strong> y <strong>Mis Promos</strong> se verán reflejados instantáneamente en los simuladores de todos los clientes.</p>
    </div>

    <div class="active-promos-section mt-4">
      <h2 style="color: #ffffff; margin-bottom: 16px; font-size: 1.2rem;">Mis Bonos / Promos Activas</h2>
      <div v-if="activePromosList.length > 0" class="promos-list">
        <div v-for="promo in activePromosList" :key="promo.id" class="promo-card-mini">
          <div class="promo-info">
            <strong>{{ promo.name }}</strong>
            <span class="text-muted">Aplica a: {{ promo.productName }}</span>
          </div>
          <div class="promo-badge">
            <span v-if="promo.type === 'rate_discount'">-{{ promo.value }}% Tasa</span>
            <span v-else-if="promo.type === 'capital_discount'">-S/ {{ promo.value }}</span>
            <span v-else-if="promo.type === 'grace_months'">+{{ promo.value }} Meses de Gracia</span>
            <span v-else-if="promo.type === 'free_desgravamen'">Sin Desgravamen</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-promos">
        <p>No tienes bonos ni promociones activas en este momento.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 20px;
}

.stat-title {
  color: #8b949e;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.stat-body {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
}

.stat-trend {
  font-size: 0.875rem;
  font-weight: 600;
}

.positive { color: #4ade80; }
.negative { color: #ef4444; }
.neutral { color: #8b949e; }

.welcome-box {
  background-color: rgba(255, 90, 0, 0.05);
  border: 1px solid rgba(255, 90, 0, 0.2);
  border-radius: 8px;
  padding: 24px;
  margin-top: 32px;
}

.welcome-box h2 {
  color: #ff5a00;
  margin-bottom: 12px;
}

.welcome-box p {
  color: #c9d1d9;
  line-height: 1.6;
}

.active-promos-section {
  margin-top: 32px;
}

.promos-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.promo-card-mini {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.promo-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.promo-info strong {
  color: #ffffff;
  font-size: 1rem;
}

.text-muted {
  color: #8b949e;
  font-size: 0.8rem;
}

.promo-badge {
  background-color: rgba(255, 90, 0, 0.1);
  color: #ff5a00;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
}

.empty-promos {
  background-color: #161b22;
  border: 1px dashed #30363d;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  color: #8b949e;
}
</style>
