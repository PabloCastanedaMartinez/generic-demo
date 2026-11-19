export function formatGTQ(amount) {
  const num = Number(amount) || 0;
  return `Q${num.toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function generateOrderFolio() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `BRM-${num}`;
}
