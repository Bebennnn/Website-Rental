export function filterVehiclesByCategory(vehicles, kategori) {
  if (!Array.isArray(vehicles) || !kategori) return [];

  return vehicles.filter((vehicle) => vehicle?.category === kategori);
}
