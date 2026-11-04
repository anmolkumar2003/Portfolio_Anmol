import type { VercelRequest } from '@vercel/node';
import { getServerEnv } from './env';
import { readHeader } from './headers';

export interface GeoIntel {
  geoCountry: string | null;
  geoRegion: string | null;
  geoCity: string | null;
  geoPostalCode: string | null;
  ispName: string | null;
  networkOrg: string | null;
}

function fromVercelHeaders(req: VercelRequest): GeoIntel {
  return {
    geoCountry: readHeader(req.headers['x-vercel-ip-country']) ?? null,
    geoRegion: readHeader(req.headers['x-vercel-ip-country-region']) ?? null,
    geoCity: readHeader(req.headers['x-vercel-ip-city'])
      ? decodeURIComponent(readHeader(req.headers['x-vercel-ip-city'])!)
      : null,
    geoPostalCode: readHeader(req.headers['x-vercel-ip-postal-code']) ?? null,
    ispName: null,
    networkOrg: null,
  };
}

async function fromIpApi(ip: string, apiKey: string): Promise<Partial<GeoIntel>> {
  const url = apiKey
    ? `https://ipapi.co/${encodeURIComponent(ip)}/json/?key=${encodeURIComponent(apiKey)}`
    : `https://ipapi.co/${encodeURIComponent(ip)}/json/`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    return {};
  }

  const data = (await response.json()) as Record<string, unknown>;
  if (data.error) {
    return {};
  }

  return {
    geoCountry: typeof data.country_name === 'string' ? data.country_name : null,
    geoRegion: typeof data.region === 'string' ? data.region : null,
    geoCity: typeof data.city === 'string' ? data.city : null,
    geoPostalCode: typeof data.postal === 'string' ? data.postal : null,
    ispName: typeof data.org === 'string' ? data.org : null,
    networkOrg: typeof data.org === 'string' ? data.org : null,
  };
}

async function fromIpInfo(ip: string, apiKey: string): Promise<Partial<GeoIntel>> {
  if (!apiKey) {
    return {};
  }

  const response = await fetch(
    `https://ipinfo.io/${encodeURIComponent(ip)}?token=${encodeURIComponent(apiKey)}`,
    { headers: { Accept: 'application/json' } },
  );

  if (!response.ok) {
    return {};
  }

  const data = (await response.json()) as Record<string, unknown>;
  const regionCity =
    typeof data.region === 'string' ? data.region : null;

  return {
    geoCountry: typeof data.country === 'string' ? data.country : null,
    geoRegion: regionCity,
    geoCity: typeof data.city === 'string' ? data.city : null,
    geoPostalCode: typeof data.postal === 'string' ? data.postal : null,
    ispName: typeof data.org === 'string' ? data.org : null,
    networkOrg: typeof data.org === 'string' ? data.org : null,
  };
}

export async function resolveGeoIntel(
  req: VercelRequest,
  ip: string,
): Promise<GeoIntel> {
  const base = fromVercelHeaders(req);
  const { ipIntelProvider, ipIntelApiKey } = getServerEnv();

  if (
    !ip ||
    ip === 'unknown' ||
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ipIntelProvider === 'none'
  ) {
    return base;
  }

  try {
    const extra =
      ipIntelProvider === 'ipinfo'
        ? await fromIpInfo(ip, ipIntelApiKey)
        : ipIntelProvider === 'ipapi'
          ? await fromIpApi(ip, ipIntelApiKey)
          : {};

    return {
      geoCountry: extra.geoCountry ?? base.geoCountry,
      geoRegion: extra.geoRegion ?? base.geoRegion,
      geoCity: extra.geoCity ?? base.geoCity,
      geoPostalCode: extra.geoPostalCode ?? base.geoPostalCode,
      ispName: extra.ispName ?? base.ispName,
      networkOrg: extra.networkOrg ?? base.networkOrg,
    };
  } catch {
    return base;
  }
}
