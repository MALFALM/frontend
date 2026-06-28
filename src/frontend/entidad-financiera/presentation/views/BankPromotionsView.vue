<script setup>
import { ref, computed } from 'vue';
import { useEntitiesStore } from '../../application/useEntitiesStore';
import { useAuthStore } from '../../../../login/application/useAuthStore';
import PromoEditorModal from './PromoEditorModal.vue';

const { getProductsByEntityId } = useEntitiesStore();
const authStore = useAuthStore();

const BANK_ID = computed(() => authStore.user.value?.bankId || 'bcp');

const myPromotions = computed(() => {
  const promos = [];
  const products = getProductsByEntityId(BANK_ID.value);
  products.forEach(product => {
    if (product.promotions) {
      product.promotions.forEach(promo => {
        promos.push({
          ...promo,
          productName: product.name,
          productId: product.id
        });
      });
    }
  });
  return promos;
});

const showEditor = ref(false);
const editingPromo = ref(null);

const handleCreate = () => {
  editingPromo.value = null;
  showEditor.value = true;
};

const handleEdit = (promo) => {
  editingPromo.value = { ...promo };
  showEditor.value = true;
};

const handleEditorClose = () => {
  showEditor.value = false;
  editingPromo.value = null;
};
</script>

<template>
  <div class="promos-view">
    <div class="header-actions">
      <div>
        <h2>Mis Promos</h2>
        <p class="subtitle">Gestiona las campañas y ofertas especiales para tus clientes.</p>
      </div>
      <button class="btn btn-primary" @click="handleCreate">+ Crear Promo</button>
    </div>
    
    <div class="promos-grid mt-4">
      <div v-for="promo in myPromotions" :key="promo.id" class="promo-card">
        <div class="promo-header">
          <h3>{{ promo.name }}</h3>
          <span class="status-badge" :class="promo.active ? 'active' : 'inactive'">
            {{ promo.active ? 'Activa' : 'Inactiva' }}
          </span>
        </div>
        <div class="promo-body">
          <p class="promo-product"><strong>Aplica a:</strong> {{ promo.productName }}</p>
          <p class="promo-benefit"><strong>Beneficio:</strong> 
            <span v-if="promo.type === 'rate_discount'">Descuento de {{ promo.value }}% en tasa</span>
            <span v-else-if="promo.type === 'capital_discount'">Bono S/ {{ promo.value }}</span>
            <span v-else-if="promo.type === 'grace_months'">{{ promo.value }} meses de gracia (Total)</span>
            <span v-else-if="promo.type === 'grace_months_partial'">{{ promo.value }} meses de gracia (Parcial)</span>
            <span v-else-if="promo.type === 'free_desgravamen'">Desgravamen 0%</span>
            <span v-else-if="promo.type === 'free_vehicular_insurance'">Seguro Vehicular Gratis</span>
            <span v-else-if="promo.type === 'free_portes'">Exoneración de Portes</span>
            <span v-else-if="promo.type === 'zero_down_payment'">Cuota Inicial Flex (0%)</span>
          </p>
        </div>
        <div class="promo-footer">
          <button class="btn btn-outline-small" @click="handleEdit(promo)">Editar / Ver detalle</button>
        </div>
      </div>
      
      <div v-if="myPromotions.length === 0" class="empty-state">
        <p>No tienes promociones activas. ¡Crea una para atraer más clientes!</p>
      </div>
    </div>

    <PromoEditorModal 
      v-if="showEditor" 
      :promo="editingPromo" 
      :bank-id="BANK_ID"
      @close="handleEditorClose" 
    />
  </div>
</template>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions h2 {
  margin: 0;
  color: #ffffff;
}

.subtitle {
  color: #8b949e;
  font-size: 0.9rem;
  margin: 0;
  margin-top: 4px;
}

.btn {
  padding: 8px 16px;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #ff5a00;
  color: white;
}

.btn-primary:hover {
  background-color: #e65100;
}

.btn-outline-small {
  padding: 6px 12px;
  background-color: transparent;
  border: 1px solid #30363d;
  color: #c9d1d9;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-outline-small:hover {
  border-color: #ff5a00;
  color: #ff5a00;
}

.promos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.promo-card {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.promo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  border-color: rgba(255, 90, 0, 0.3);
}

.promo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.promo-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #ffffff;
  flex: 1;
}

.status-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
  margin-left: 12px;
}

.status-badge.active {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.inactive {
  background-color: rgba(139, 148, 158, 0.1);
  color: #8b949e;
}

.promo-body p {
  margin: 4px 0;
  font-size: 0.9rem;
  color: #c9d1d9;
}

.promo-body strong {
  color: #8b949e;
  font-weight: 600;
}

.promo-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #30363d;
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 64px 20px;
  background-color: #161b22;
  border: 1px dashed #30363d;
  border-radius: 12px;
  color: #8b949e;
}

.mt-4 {
  margin-top: 1.5rem;
}
</style>
