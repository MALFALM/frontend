export const financialEntities = [
  {
    id: 'bcp',
    name: 'Banco de Crédito del Perú (BCP)',
    products: [
      {
        id: 'bcp-vehicular',
        name: 'Crédito Vehicular BCP',
        rateType: 'TEA',
        rateValue: 12.99,
        capitalization: 12,
        hasDesgravamen: true,
        desgravamenRate: 0.056,
        hasVehicularInsurance: true,
        vehicularInsurancePercentage: 0.1, // 0.1% del valor del auto mensual
        hasPortes: true,
        portesValue: 10.00
      }
    ]
  },
  {
    id: 'interbank',
    name: 'Interbank',
    products: [
      {
        id: 'interbank-vehicular-tna',
        name: 'Auto Fácil (Campaña TNA)',
        rateType: 'TNA',
        rateValue: 11.50,
        capitalization: 12, // Mensual
        hasDesgravamen: true,
        desgravamenRate: 0.050,
        hasVehicularInsurance: true,
        vehicularInsurancePercentage: 0.12,
        hasPortes: true,
        portesValue: 8.50
      },
      {
        id: 'interbank-vehicular-tea',
        name: 'Auto Fácil (Tasa Fija TEA)',
        rateType: 'TEA',
        rateValue: 14.50,
        capitalization: 12,
        hasDesgravamen: true,
        desgravamenRate: 0.050,
        hasVehicularInsurance: true,
        vehicularInsurancePercentage: 0.12,
        hasPortes: false,
        portesValue: 0
      }
    ]
  },
  {
    id: 'bbva',
    name: 'BBVA',
    products: [
      {
        id: 'bbva-vehicular',
        name: 'Crédito Vehicular BBVA',
        rateType: 'TEA',
        rateValue: 13.99,
        capitalization: 12,
        hasDesgravamen: true,
        desgravamenRate: 0.045, // Más barato
        hasVehicularInsurance: true,
        vehicularInsurancePercentage: 0.15, // Más caro
        hasPortes: true,
        portesValue: 12.00
      }
    ]
  }
];
