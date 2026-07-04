import { ref, watch } from 'vue';
import { financialEntities as initialMockEntities } from '../../cliente/infrastructure/mocks/entities';
import { apiRequest } from '../../../services/api';

const STORAGE_KEY = 'altoque_financial_entities';
const entities = ref([]);
const isLoading = ref(false);
const lastError = ref('');
let initialized = false;

const clone = (value) => JSON.parse(JSON.stringify(value));

const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (error) {
    console.error('Error loading entities from localStorage', error);
  }
  return clone(initialMockEntities);
};

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entities.value));
};

entities.value = loadFromLocalStorage();

watch(entities, persist, { deep: true });

const replaceEntity = (entity) => {
  const index = entities.value.findIndex((item) => item.id === entity.id);
  if (index === -1) entities.value.push(entity);
  else entities.value[index] = entity;
};

export function useEntitiesStore() {
  const loadEntities = async ({ force = false } = {}) => {
    if (initialized && !force) return entities.value;
    initialized = true;
    isLoading.value = true;
    lastError.value = '';

    try {
      const response = await apiRequest('/entities');
      entities.value = response.data || [];
    } catch (error) {
      lastError.value = error.message;
    } finally {
      isLoading.value = false;
    }

    return entities.value;
  };

  const getEntityById = (id) => entities.value.find((entity) => entity.id === id);
  const getProductsByEntityId = (id) => getEntityById(id)?.products || [];

  const updateEntity = async (updatedEntity) => {
    replaceEntity({ ...updatedEntity });

    try {
      const response = await apiRequest(`/entities/${updatedEntity.id}`, {
        method: 'PATCH',
        body: {
          name: updatedEntity.name,
          themeColor: updatedEntity.themeColor,
          isSuspended: updatedEntity.isSuspended
        }
      });
      if (response.data) replaceEntity(response.data);
    } catch (error) {
      lastError.value = error.message;
    }
  };

  const addEntity = async (newEntity, bankUser = null) => {
    const entity = { products: [], isSuspended: false, ...newEntity };
    replaceEntity(entity);

    try {
      const response = await apiRequest('/entities', {
        method: 'POST',
        body: { ...entity, bankUser }
      });
      if (response.data) replaceEntity(response.data);
      return response.data || entity;
    } catch (error) {
      lastError.value = error.message;
      return entity;
    }
  };

  const toggleSuspendEntity = async (id) => {
    const entity = getEntityById(id);
    if (!entity) return;
    entity.isSuspended = !entity.isSuspended;
    await updateEntity(entity);
  };

  const updateProduct = async (entityId, updatedProduct) => {
    const entity = getEntityById(entityId);
    if (!entity) return;

    const index = entity.products.findIndex((product) => product.id === updatedProduct.id);
    if (index !== -1) entity.products[index] = { ...updatedProduct };

    try {
      const response = await apiRequest(`/entities/${entityId}/products/${updatedProduct.id}`, {
        method: 'PATCH',
        body: updatedProduct
      });
      if (response.data) replaceEntity(response.data);
    } catch (error) {
      lastError.value = error.message;
    }
  };

  const addProduct = async (entityId, newProduct) => {
    const entity = getEntityById(entityId);
    if (!entity) return;

    const product = { promotions: [], active: true, ...newProduct };
    entity.products.push(product);

    try {
      const response = await apiRequest(`/entities/${entityId}/products`, {
        method: 'POST',
        body: product
      });
      if (response.data) replaceEntity(response.data);
    } catch (error) {
      lastError.value = error.message;
    }
  };

  const getAllActivePromotions = () => {
    const promos = [];
    entities.value
      .filter((entity) => !entity.isSuspended)
      .forEach((entity) => {
        (entity.products || []).forEach((product) => {
          (product.promotions || []).forEach((promo) => {
            if (promo.active) {
              promos.push({
                ...promo,
                bankName: entity.name,
                bankId: entity.id,
                productName: product.name,
                productId: product.id
              });
            }
          });
        });
      });
    return promos;
  };

  loadEntities();

  return {
    entities,
    isLoading,
    lastError,
    loadEntities,
    getEntityById,
    getProductsByEntityId,
    updateEntity,
    addEntity,
    toggleSuspendEntity,
    updateProduct,
    addProduct,
    getAllActivePromotions
  };
}
