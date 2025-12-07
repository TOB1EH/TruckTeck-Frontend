// Mock conciliation service (JS)

const FINALIZED = [
  { number: 'ORD-2024-003', truck: 'CAM-103', label: 'ORD-2024-003 - CAM-103' },
  { number: 'ORD-2024-005', truck: 'CAM-110', label: 'ORD-2024-005 - CAM-110' }
];

function delay(ms = 200) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getFinalizedOrders() {
  await delay(120);
  return FINALIZED.map(x => ({ ...x }));
}

export async function getConciliation(number) {
  await delay(280);
  const entry = FINALIZED.find(f => f.number === number) ?? { number, truck: 'CAM-XXX' };
  const presetKg = number === 'ORD-2024-003' ? 28000 : 25000;
  const finalKg = number === 'ORD-2024-003' ? 36500 : presetKg + 200;
  const netKg = Math.max(0, (finalKg ?? presetKg) - 8500);
  const differenceKg = Math.round((Math.random() - 0.5) * 90 + 45);
  return {
    number: entry.number,
    truck: entry.truck,
    presetKg,
    finalKg,
    netKg,
    differenceKg,
    temperatureC: +(17 + Math.random() * 2.5).toFixed(1),
    density: +(0.82 + Math.random() * 0.015).toFixed(3),
    avgFlowKgPerHour: Math.round(10000 + Math.random() * 3000)
  };
}
