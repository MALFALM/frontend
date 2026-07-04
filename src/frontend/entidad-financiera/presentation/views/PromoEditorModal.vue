<script setup>
import { ref, computed } from 'vue';
import { useEntitiesStore } from '../../application/useEntitiesStore';

const props = defineProps({ promo: Object, bankId: String });
const emit = defineEmits(['close']);

const { getProductsByEntityId, updateProduct } = useEntitiesStore();
const myProducts = computed(() => getProductsByEntityId(props.bankId));
const isNew = !props.promo;

const formData = ref(props.promo ? { ...props.promo } : {
  id: `promo-${Date.now()}`,
  name: '',
  productId: myProducts.value.length > 0 ? myProducts.value[0].id : '',
  type: 'rate_discount',
  value: 0,
  active: true
});

const save = async () => {
  const product = myProducts.value.find((item) => item.id === formData.value.productId);
  if (!product) return;
  if (!product.promotions) product.promotions = [];

  if (isNew) {
    product.promotions.push({ ...formData.value });
  } else if (props.promo.productId === formData.value.productId) {
    const idx = product.promotions.findIndex((item) => item.id === formData.value.id);
    if (idx !== -1) product.promotions[idx] = { ...formData.value };
  } else {
    const oldProduct = myProducts.value.find((item) => item.id === props.promo.productId);
    if (oldProduct && oldProduct.promotions) {
      oldProduct.promotions = oldProduct.promotions.filter((item) => item.id !== formData.value.id);
      await updateProduct(props.bankId, oldProduct);
    }
    product.promotions.push({ ...formData.value });
  }

  await updateProduct(props.bankId, product);
  emit('close');
};

const remove = async () => {
  if (isNew) return;
  const product = myProducts.value.find((item) => item.id === props.promo.productId);
  if (product && product.promotions) {
    product.promotions = product.promotions.filter((item) => item.id !== formData.value.id);
    await updateProduct(props.bankId, product);
  }
  emit('close');
};
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isNew ? 'Crear PromociÃ³n' : 'Editar PromociÃ³n' }}</h2>
        <button class="close-btn" @click="$emit('close')">Ã—</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Nombre de la PromociÃ³n</label>
          <input type="text" v-model="formData.name" class="input-field" placeholder="Ej. CampaÃ±a NavideÃ±a" />
        </div>

        <div class="form-group mt-3">
          <label>Aplica al Producto</label>
          <select v-model="formData.productId" class="input-field">
            <option v-for="product in myProducts" :key="product.id" :value="product.id">
              {{ product.name }}
            </option>
          </select>
        </div>

        <div class="form-row mt-3">
          <div class="form-group">
            <label>Tipo de Beneficio</label>
            <select v-model="formData.type" class="input-field">
              <option value="rate_discount">Descuento en Tasa (%)</option>
              <option value="capital_discount">Bono Descuento Capital (S/)</option>
              <option value="grace_months">Meses de Gracia Gratis (Total)</option>
              <option value="grace_months_partial">Meses de Gracia Parcial (Solo intereses)</option>
              <option value="free_desgravamen">Desgravamen Gratis (0%)</option>
              <option value="free_vehicular_insurance">Seguro Vehicular Gratis</option>
              <option value="free_portes">ExoneraciÃ³n de Portes (S/ 0)</option>
              <option value="zero_down_payment">Cuota Inicial Flex (Desde 0%)</option>
            </select>
          </div>
          <div class="form-group" v-if="!['free_desgravamen', 'free_vehicular_insurance', 'free_portes', 'zero_down_payment'].includes(formData.type)">
            <label>Valor ({{ formData.type === 'capital_discount' ? 'S/' : (formData.type.includes('grace_months') ? 'Meses' : '%') }})</label>
            <input type="number" step="0.01" v-model="formData.value" class="input-field" />
          </div>
        </div>
        
        <div class="form-group checkbox-group mt-3">
          <label>
            <input type="checkbox" v-model="formData.active" />
            PromociÃ³n Activa
          </label>
          <p class="help-text">Si estÃ¡ activa, se mostrarÃ¡ pÃºblicamente a los clientes.</p>
        </div>
      </div>

      <div class="modal-footer" :class="{ 'between': !isNew }">
        <button v-if="!isNew" class="btn btn-danger" @click="remove">Eliminar PromociÃ³n</button>
        <div class="action-buttons">
          <button class="btn btn-outline" @click="$emit('close')">Cancelar</button>
          <button class="btn btn-primary" @click="save">{{ isNew ? 'Crear PromociÃ³n' : 'Guardar Cambios' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #30363d;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.25rem;
  margin: 0;
  color: #ffffff;
}

.close-btn {
  background: none;
  border: none;
  color: #8b949e;
  font-size: 1.5rem;
  cursor: pointer;
}

.close-btn:hover {
  color: #ffffff;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #c9d1d9;
}

.input-field {
  background-color: #0d1117;
  border: 1px solid #30363d;
  color: #c9d1d9;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 0.95rem;
}

.input-field:focus {
  outline: none;
  border-color: #ff5a00;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #ffffff;
}

.help-text {
  font-size: 0.8rem;
  color: #8b949e;
  margin: 0;
  margin-top: 4px;
  margin-left: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #30363d;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.modal-footer.between {
  justify-content: space-between;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: #ff5a00;
  color: white;
}

.btn-primary:hover {
  background-color: #e65100;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #30363d;
  color: #c9d1d9;
}

.btn-outline:hover {
  background-color: #30363d;
}

.btn-danger {
  background-color: transparent;
  color: #f85149;
  border: 1px solid rgba(248, 81, 73, 0.4);
}

.btn-danger:hover {
  background-color: rgba(248, 81, 73, 0.1);
  border-color: #f85149;
}

.mt-3 {
  margin-top: 1rem;
}
</style>
