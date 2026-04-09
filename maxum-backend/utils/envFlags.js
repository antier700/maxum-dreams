/**
 * Whether mock deposit is allowed.
 * - MOCK_DEPOSIT_ENABLED=true|1|yes → on (any NODE_ENV)
 * - MOCK_DEPOSIT_ENABLED=false|0|no → off
 * - unset → on only when NODE_ENV === 'development' (local npm run dev)
 */
function isMockDepositEnabled() {
  const raw = process.env.MOCK_DEPOSIT_ENABLED;
  if (raw !== undefined && String(raw).trim() !== '') {
    const v = String(raw).trim().toLowerCase();
    if (['false', '0', 'no', 'off'].includes(v)) return false;
    if (['true', '1', 'yes', 'on'].includes(v)) return true;
    return false;
  }
  return process.env.NODE_ENV === 'development';
}

module.exports = { isMockDepositEnabled };
