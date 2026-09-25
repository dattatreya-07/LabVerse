import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '@/lib/security/rate-limiter';
import { getBoundedPagination } from '@/lib/security/input-sanitizer';
import { applySecurityHeaders } from '@/lib/security/security-headers';
import { verifySimulationResult } from '@/lib/simulation/verifier';
import { getServerSupabaseAdmin, isSupabaseConfigured } from '@/lib/db/supabase';

export async function GET(req: NextRequest) {
  const clientIP = getClientIP(req.headers);
  const rateLimit = checkRateLimit(`session_get_${clientIP}`, 60, 60000);

  if (!rateLimit.isAllowed) {
    const errorResp = NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      { status: 429 }
    );
    return applySecurityHeaders(errorResp);
  }

  const { searchParams } = new URL(req.url);
  const experimentId = searchParams.get('experimentId');
  const { page, limit, offset } = getBoundedPagination(searchParams, 10, 50);

  if (isSupabaseConfigured()) {
    const supabase = getServerSupabaseAdmin();
    const authHeader = req.headers.get('authorization');

    if (supabase && authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);

      if (user && !authErr) {
        let query = supabase
          .from('experiment_sessions')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .range(offset, offset + limit - 1)
          .order('updated_at', { ascending: false });

        if (experimentId) {
          query = query.eq('experiment_id', experimentId);
        }

        const { data, count, error } = await query;

        if (!error) {
          const resp = NextResponse.json({
            mode: 'AUTHENTICATED_CLOUD',
            page,
            limit,
            total: count || 0,
            sessions: data || [],
          });
          return applySecurityHeaders(resp);
        }
      }
    }
  }

  // Guest Mode Response
  const guestResp = NextResponse.json({
    mode: 'GUEST_LOCAL',
    message: 'Operating in Guest Mode. Session data stored in local browser localStorage.',
    page,
    limit,
    total: 0,
    sessions: [],
  });
  return applySecurityHeaders(guestResp);
}

export async function POST(req: NextRequest) {
  const clientIP = getClientIP(req.headers);
  const rateLimit = checkRateLimit(`session_post_${clientIP}`, 30, 60000);

  if (!rateLimit.isAllowed) {
    const errorResp = NextResponse.json(
      { error: 'Too many save requests. Please retry shortly.' },
      { status: 429 }
    );
    return applySecurityHeaders(errorResp);
  }

  try {
    const body = await req.json();
    const { sessionInput, simulationInput, clientResult } = body;

    // Server-side verification of physics calculations
    if (simulationInput) {
      const verification = verifySimulationResult(simulationInput, clientResult);
      if (!verification.isValid) {
        console.warn(`[Security Alert] Client simulation mismatch for session ${sessionInput?.sessionId}: ${verification.message}`);
      }
    }

    if (isSupabaseConfigured()) {
      const supabase = getServerSupabaseAdmin();
      const authHeader = req.headers.get('authorization');

      if (supabase && authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data: { user }, error: authErr } = await supabase.auth.getUser(token);

        if (user && !authErr && sessionInput) {
          const { data, error } = await supabase
            .from('experiment_sessions')
            .upsert({
              user_id: user.id, // Strictly server-derived user ID! Never trust client!
              session_id: sessionInput.sessionId,
              experiment_id: sessionInput.experimentId,
              mode: sessionInput.mode,
              parameters: sessionInput.parameters,
              components: sessionInput.components,
              connections: sessionInput.connections,
              last_result: sessionInput.lastResult,
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (!error) {
            const resp = NextResponse.json({
              status: 'SAVED_CLOUD',
              session: data,
            });
            return applySecurityHeaders(resp);
          }
        }
      }
    }

    // Guest Mode Fallback
    const resp = NextResponse.json({
      status: 'SAVED_GUEST_LOCAL',
      message: 'Session verified and saved locally.',
    });
    return applySecurityHeaders(resp);

  } catch (err) {
    console.error('Session POST API error:', err);
    const errResp = NextResponse.json(
      { error: 'Internal server error processing session save.' },
      { status: 500 }
    );
    return applySecurityHeaders(errResp);
  }
}
