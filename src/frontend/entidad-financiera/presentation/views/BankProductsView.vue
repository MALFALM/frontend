<script setup>
import { ref, computed } from 'vue';
import { useEntitiesStore } from '../../application/useEntitiesStore';
import { useAuthStore } from '../../../../login/application/useAuthStore';

const { getProductsByEntityId, updateProduct, addProduct } = useEntitiesStore();
const authStore = useAuthStore();

const BANK_ID = computed(() => authStore.user.value?.bankId || 'bcp');
const myProducts = computed(() => getProductsByEntityId(BANK_ID.value));

const editingCell = ref({ productId: null, field: null });

const vFocus = {
  mounted: (el) => el.focus()
};

const startEditing = (productId, field) => {
  editingCell.value = { productId, field };
};

const stopEditing = () => {
  editingCell.value = { productId: null, field: null };
};

const saveField = (product) => {
  // Lógica inteligente: si ponen 0, apagamos el flag "has..."
  product.hasDesgravamen = product.desgravamenRate > 0;
  product.hasVehicularInsurance = product.vehicularInsurancePercentage > 0;
  product.hasPortes = product.portesValue > 0;
  
  updateProduct(BANK_ID.value, product);
  stopEditing();
};

const handleAddProduct = () => {
  const newProduct = {
    id: `custom_${Date.now()}`,
    name: 'Nuevo Producto',
    rateType: 'TEA',
    rateValue: 15,
    capitalization: 1,
    hasDesgravamen: true,
    desgravamenRate: 0.05,
    hasVehicularInsurance: true,
    vehicularInsurancePercentage: 0.1,
    hasPortes: true,
    portesValue: 5.0,
    promotions: []
  };
  addProduct(BANK_ID.value, newProduct);
};
</script>

<template>
  <div class="products-view">
    <div class="header-actions">
      <h2>Mis Productos Financieros</h2>
      <p class="subtitle">Haz clic en cualquier valor de la tabla para editarlo rápidamente.</p>
    </div>

    <div class="table-container mt-4">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre del Producto</th>
            <th>Tasa (Valor)</th>
            <th>Tipo Tasa</th>
            <th>Desgravamen Mensual (%)</th>
            <th>Seguro Vehicular (%)</th>
            <th>Portes Fijo (S/)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in myProducts" :key="product.id">
            
            <!-- Nombre -->
            <td class="editable-cell" @click="startEditing(product.id, 'name')">
              <input 
                v-if="editingCell.productId === product.id && editingCell.field === 'name'"
                type="text"
                v-model="product.name" 
                @blur="saveField(product)"
                @keyup.enter="saveField(product)"
                class="inline-input"
                v-focus
              />
              <span v-else>{{ product.name }} <i class="edit-icon">✎</i></span>
            </td>

            <!-- Tasa Valor -->
            <td class="editable-cell" @click="startEditing(product.id, 'rateValue')">
              <input 
                v-if="editingCell.productId === product.id && editingCell.field === 'rateValue'"
                type="number" step="0.01"
                v-model.number="product.rateValue" 
                @blur="saveField(product)"
                @keyup.enter="saveField(product)"
                class="inline-input"
                v-focus
              />
              <span v-else class="badge">{{ product.rateValue }}% <i class="edit-icon">✎</i></span>
            </td>

            <!-- Tipo Tasa -->
            <td class="editable-cell" @click="startEditing(product.id, 'rateType')">
              <select 
                v-if="editingCell.productId === product.id && editingCell.field === 'rateType'"
                v-model="product.rateType"
                @blur="saveField(product)"
                @change="saveField(product)"
                class="inline-input"
                v-focus
              >
                <option value="TEA">TEA</option>
                <option value="TNA">TNA</option>
              </select>
              <span v-else>{{ product.rateType }} <i class="edit-icon">✎</i></span>
            </td>

            <!-- Desgravamen -->
            <td class="editable-cell" @click="startEditing(product.id, 'desgravamenRate')">
              <input 
                v-if="editingCell.productId === product.id && editingCell.field === 'desgravamenRate'"
                type="number" step="0.001"
                v-model.number="product.desgravamenRate" 
                @blur="saveField(product)"
                @keyup.enter="saveField(product)"
                class="inline-input"
                v-focus
              />
              <span v-else>{{ product.hasDesgravamen ? (product.desgravamenRate * 100).toFixed(2) + '%' : '0%' }} <i class="edit-icon">✎</i></span>
            </td>

            <!-- Seguro Vehicular -->
            <td class="editable-cell" @click="startEditing(product.id, 'vehicularInsurancePercentage')">
              <input 
                v-if="editingCell.productId === product.id && editingCell.field === 'vehicularInsurancePercentage'"
                type="number" step="0.01"
                v-model.number="product.vehicularInsurancePercentage" 
                @blur="saveField(product)"
                @keyup.enter="saveField(product)"
                class="inline-input"
                v-focus
              />
              <span v-else>{{ product.hasVehicularInsurance ? product.vehicularInsurancePercentage.toFixed(2) + '%' : '0%' }} <i class="edit-icon">✎</i></span>
            </td>

            <!-- Portes -->
            <td class="editable-cell" @click="startEditing(product.id, 'portesValue')">
              <input 
                v-if="editingCell.productId === product.id && editingCell.field === 'portesValue'"
                type="number" step="0.5"
                v-model.number="product.portesValue" 
                @blur="saveField(product)"
                @keyup.enter="saveField(product)"
                class="inline-input"
                v-focus
              />
              <span v-else>{{ product.hasPortes ? 'S/ ' + product.portesValue.toFixed(2) : 'S/ 0.00' }} <i class="edit-icon">✎</i></span>
            </td>

          </tr>
          <tr v-if="myProducts.length === 0">
            <td colspan="6" class="text-center" style="padding: 32px; color: #8b949e;">
              <p style="margin-bottom: 16px;">No tienes productos configurados.</p>
              <button class="btn btn-primary" @click="handleAddProduct">+ Agregar Producto Financiero</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.header-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-actions h2 {
  margin: 0;
  color: #ffffff;
}

.subtitle {
  color: #8b949e;
  font-size: 0.9rem;
  margin: 0;
}

.table-container {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  overflow: visible; /* To let selects overflow if needed */
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #30363d;
  position: relative;
}

.data-table th {
  background-color: rgba(255, 255, 255, 0.02);
  color: #8b949e;
  font-weight: 600;
  font-size: 0.875rem;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.badge {
  background-color: rgba(255, 90, 0, 0.1);
  color: #ff5a00;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Inline Editing Styles */
.editable-cell {
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 120px;
}

.editable-cell:hover {
  background-color: rgba(255, 90, 0, 0.05);
}

.editable-cell .edit-icon {
  opacity: 0;
  font-style: normal;
  color: #ff5a00;
  margin-left: 8px;
  font-size: 0.8rem;
  transition: opacity 0.2s;
}

.editable-cell:hover .edit-icon {
  opacity: 1;
}

.inline-input {
  width: 100%;
  background-color: #0d1117;
  border: 1px solid #ff5a00;
  color: #ffffff;
  padding: 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 90, 0, 0.2);
}

.mt-4 {
  margin-top: 1.5rem;
}

.text-center {
  text-align: center;
}
</style>
