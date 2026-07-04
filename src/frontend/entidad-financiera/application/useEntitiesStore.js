import { ref, watch } from 'vue';

const STORAGE_KEY = 'altoque_financial_entities';

// Estado global para las entidades financieras (bancos) y sus productos
const entities = ref([]);

const initializeEntities = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      entities.value = JSON.parse(saved);
    } else {
      entities.value = [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entities.value));
    }
  } catch (e) {
    console.error("Error loading entities from localStorage", e);
    entities.value = [];
  }
};

initializeEntities();

// Persistir cambios automáticamente
watch(entities, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
}, { deep: true });

export function useEntitiesStore() {
  
  const getEntityById = (id) => {
    return entities.value.find(e => e.id === id);
  };
  
  const getProductsByEntityId = (id) => {
    const entity = getEntityById(id);
    return entity ? entity.products : [];
  };

  const updateEntity = (updatedEntity) => {
    const index = entities.value.findIndex(e => e.id === updatedEntity.id);
    if (index !== -1) {
      entities.value[index] = { ...updatedEntity };
    }
  };

  const addEntity = (newEntity) => {
    entities.value.push(newEntity);
  };

  const updateProduct = (entityId, updatedProduct) => {
    const entity = getEntityById(entityId);
    if (entity) {
      const index = entity.products.findIndex(p => p.id === updatedProduct.id);
      if (index !== -1) {
        entity.products[index] = { ...updatedProduct };
      }
    }
  };

  const addProduct = (entityId, newProduct) => {
    const entity = getEntityById(entityId);
    if (entity) {
      entity.products.push(newProduct);
    }
  };

  const getAllActivePromotions = () => {
    const promos = [];
    entities.value.forEach(entity => {
        entity.products.forEach(product => {
            if (product.promotions) {
                product.promotions.forEach(promo => {
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
            }
        });
    });
    return promos;
  };

  return {
    entities,
    getEntityById,
    getProductsByEntityId,
    updateEntity,
    addEntity,
    updateProduct,
    addProduct,
    getAllActivePromotions
  };
}
