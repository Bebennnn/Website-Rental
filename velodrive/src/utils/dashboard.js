export function calculateTotalRevenue(transactions) {
  if (!Array.isArray(transactions)) return 0;

  return transactions.reduce((total, transaction) => {
    const amount = transaction?.totalBayar;
    return total + (typeof amount === 'number' && Number.isFinite(amount) ? amount : 0);
  }, 0);
}
