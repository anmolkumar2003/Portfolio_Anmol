import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getServerEnv } from '../_lib/env';
import { resolveGeoIntel } from '../_lib/geo';
import { beginPublicPost, clientIp } from '../_lib/request';
import { readStringField } from '../_lib/rows';
import { getServiceClient } from '../_lib/supabase';
import { parseJsonBody, sessionPayloadSchema } from '../_lib/validate';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (!beginPublicPost(req, res, 'session')) {
    return;
  }

  const parsed = sessionPayloadSchema.safeParse(parseJsonBody(req.body));
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload' });
    return;
  }

  const payload = parsed.data;
  const ip = clientIp(req);
  const geo = await resolveGeoIntel(req, ip);
  const { inactiveMs } = getServerEnv();
  const supabase = getServiceClient();

  await supabase.rpc('mark_stale_sessions_inactive', {
    p_threshold_ms: inactiveMs,
  });

  const now = new Date().toISOString();

  const { data: existingVisitor } = await supabase
    .from('visitors')
    .select('id')
    .eq('visitor_key', payload.visitorKey)
    .maybeSingle();

  let visitorId: string;

  if (existingVisitor) {
    const existingId = readStringField(existingVisitor, 'id');
    if (!existingId) {
      res.status(500).json({ error: 'Invalid visitor record' });
      return;
    }

    const { error: visitorUpdateError } = await supabase
      .from('visitors')
      .update({ last_seen_at: now })
      .eq('id', existingId);

    if (visitorUpdateError) {
      res.status(500).json({ error: 'Failed to update visitor' });
      return;
    }

    visitorId = existingId;
  } else {
    const { data: createdVisitor, error: visitorInsertError } = await supabase
      .from('visitors')
      .insert({
        visitor_key: payload.visitorKey,
        first_seen_at: now,
        last_seen_at: now,
      })
      .select('id')
      .single();

    const createdId = readStringField(createdVisitor, 'id');

    if (visitorInsertError || !createdId) {
      // Concurrent create: fetch the winner.
      const { data: racedVisitor } = await supabase
        .from('visitors')
        .select('id')
        .eq('visitor_key', payload.visitorKey)
        .maybeSingle();

      const racedId = readStringField(racedVisitor, 'id');
      if (!racedId) {
        res.status(500).json({ error: 'Failed to create visitor' });
        return;
      }

      visitorId = racedId;
    } else {
      visitorId = createdId;
    }
  }

  const { data: existingSession } = await supabase
    .from('sessions')
    .select('id, session_key, is_active')
    .eq('session_key', payload.sessionKey)
    .maybeSingle();

  if (existingSession) {
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        is_active: true,
        last_active_at: now,
        ended_at: null,
        browser_name: payload.browserName ?? null,
        browser_engine: payload.browserEngine ?? null,
        device_category: payload.deviceCategory ?? null,
        os_name: payload.osName ?? null,
        screen_width: payload.screenWidth ?? null,
        screen_height: payload.screenHeight ?? null,
        timezone: payload.timezone ?? null,
        user_agent: payload.userAgent?.slice(0, 512) ?? null,
      })
      .eq('id', existingSession.id);

    if (updateError) {
      res.status(500).json({ error: 'Failed to refresh session' });
      return;
    }

    res.status(200).json({
      ok: true,
      sessionKey: payload.sessionKey,
      reused: true,
    });
    return;
  }

  const { error: insertError } = await supabase.from('sessions').insert({
    session_key: payload.sessionKey,
    visitor_id: visitorId,
    is_active: true,
    started_at: now,
    last_active_at: now,
    browser_name: payload.browserName ?? null,
    browser_engine: payload.browserEngine ?? null,
    device_category: payload.deviceCategory ?? null,
    os_name: payload.osName ?? null,
    screen_width: payload.screenWidth ?? null,
    screen_height: payload.screenHeight ?? null,
    timezone: payload.timezone ?? null,
    user_agent: payload.userAgent?.slice(0, 512) ?? null,
    ip_address: ip === 'unknown' ? null : ip,
    geo_country: geo.geoCountry,
    geo_region: geo.geoRegion,
    geo_city: geo.geoCity,
    geo_postal_code: geo.geoPostalCode,
    isp_name: geo.ispName,
    network_org: geo.networkOrg,
  });

  if (insertError) {
    // Concurrent StrictMode double-post: treat unique violation as success.
    if (insertError.code === '23505') {
      res.status(200).json({
        ok: true,
        sessionKey: payload.sessionKey,
        reused: true,
      });
      return;
    }

    res.status(500).json({ error: 'Failed to create session' });
    return;
  }

  res.status(201).json({
    ok: true,
    sessionKey: payload.sessionKey,
    reused: false,
  });
}
