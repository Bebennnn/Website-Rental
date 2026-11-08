import {
  RENTAL_PACKAGES,
  SERVICE_TYPES,
  DELIVERY_MODES,
  INDONESIAN_CAR_CATEGORIES,
} from '../constants/rentalData';

export const calculateRentalPrice = (hourlyRate, durationHours, serviceFee = 0) => {
  const values = [hourlyRate, durationHours, serviceFee];
  if (
    values.some(
      (value) => typeof value !== 'number' || !Number.isFinite(value) || value < 0
    )
  ) {
    return 0;
  }
  return hourlyRate * durationHours + serviceFee;
};

export const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0);

export const formatDateTime = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const computeEndDateTime = (startIso, durationHours) => {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return '';
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`;
};

export const calculateRentalQuote = ({ vehicle, packageId, multiplier, serviceId, deliveryId }) => {
  if (!vehicle) return null;
  const pkg = RENTAL_PACKAGES[packageId] || RENTAL_PACKAGES.PKG_24H;
  const service = SERVICE_TYPES[serviceId] || SERVICE_TYPES.SELF_DRIVE;
  const delivery = DELIVERY_MODES[deliveryId] || DELIVERY_MODES.PICKUP_GARAGE;
  const safeMultiplier = Math.max(1, Number(multiplier) || 1);

  const unitRate = vehicle.rates[pkg.id] || 0;
  const baseCost = unitRate * safeMultiplier;
  const totalHours = pkg.hours * safeMultiplier;
  const driverCost = service.driverFeePerUnit * safeMultiplier;
  const deliveryCost = delivery.fee;
  const depositCost = service.refundableDeposit;
  const grandTotal = baseCost + driverCost + deliveryCost + depositCost;

  return {
    unitRate,
    baseCost,
    totalHours,
    driverCost,
    deliveryCost,
    depositCost,
    grandTotal,
    packageLabel: pkg.label,
    serviceLabel: service.label,
  };
};

export const getCategoryLabel = (catId) => {
  const found = INDONESIAN_CAR_CATEGORIES.find((c) => c.id === catId);
  return found ? found.name : catId;
};