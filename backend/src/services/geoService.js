import geoip from 'geoip-lite';

export const getLocationFromIP = (ip) => {
  // Handle localhost and local IPs
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return {
      country: 'Local',
      region: 'Local',
      city: 'Local'
    };
  }

  const geo = geoip.lookup(ip);
  if (geo) {
    return {
      country: geo.country,
      region: geo.region,
      city: geo.city,
      timezone: geo.timezone
    };
  }

  return {
    country: 'Unknown',
    region: 'Unknown',
    city: 'Unknown'
  };
};