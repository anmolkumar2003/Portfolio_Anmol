import { useState, type FormEvent } from 'react';
import { Button } from '@views/components/Button';
import {
  useTelemetryAuth,
  useTelemetryDashboard,
} from '@viewmodels';
import type { VisitorSessionRecord } from '@models';
import styles from './TelemetryDashboardPage.module.scss';

function formatTimestamp(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date);
}

function locationLabel(session: VisitorSessionRecord): string {
  const parts = [
    session.geo_city,
    session.geo_region,
    session.geo_country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : '—';
}

function SessionDetails({ session }: { session: VisitorSessionRecord }) {
  return (
    <div className={styles.detailGrid}>
      <div className={styles.detailItem}>
        <span className={styles.detailLabel}>Status</span>
        <span className={styles.detailValue}>
          {session.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className={styles.detailItem}>
        <span className={styles.detailLabel}>Session start</span>
        <span className={styles.detailValue}>
          {formatTimestamp(session.started_at)}
        </span>
      </div>
      <div className={styles.detailItem}>
        <span className={styles.detailLabel}>Last active</span>
        <span className={styles.detailValue}>
          {formatTimestamp(session.last_active_at)}
        </span>
      </div>
      <div className={styles.detailItem}>
        <span className={styles.detailLabel}>IP address</span>
        <span className={styles.detailValue}>{session.ip_address ?? '—'}</span>
      </div>
      <div className={styles.detailItem}>
        <span className={styles.detailLabel}>Location</span>
        <span className={styles.detailValue}>{locationLabel(session)}</span>
      </div>
      <div className={styles.detailItem}>
        <span className={styles.detailLabel}>Postal code</span>
        <span className={styles.detailValue}>
          {session.geo_postal_code ?? '—'}
        </span>
      </div>
      <div className={styles.detailItem}>
        <span className={styles.detailLabel}>Browser</span>
        <span className={styles.detailValue}>
          {[session.browser_name, session.browser_engine]
            .filter(Boolean)
            .join(' / ') || '—'}
        </span>
      </div>
      <div className={styles.detailItem}>
        <span className={styles.detailLabel}>Device / OS</span>
        <span className={styles.detailValue}>
          {[session.device_category, session.os_name]
            .filter(Boolean)
            .join(' · ') || '—'}
        </span>
      </div>
      <div className={styles.detailItem}>
        <span className={styles.detailLabel}>Screen</span>
        <span className={styles.detailValue}>
          {session.screen_width && session.screen_height
            ? `${session.screen_width}×${session.screen_height}`
            : '—'}
        </span>
      </div>
      <div className={styles.detailItem}>
        <span className={styles.detailLabel}>Timezone</span>
        <span className={styles.detailValue}>{session.timezone ?? '—'}</span>
      </div>
      <div className={styles.detailItem}>
        <span className={styles.detailLabel}>Network / ISP</span>
        <span className={styles.detailValue}>
          {session.isp_name || session.network_org || '—'}
        </span>
      </div>
      <div className={styles.detailItem}>
        <span className={styles.detailLabel}>Visitor key (approx.)</span>
        <span className={styles.detailValue}>{session.visitor_id}</span>
      </div>
    </div>
  );
}

function LoginPanel({
  error,
  onSubmit,
}: {
  error: string | null;
  onSubmit: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(email.trim(), password);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.panel}>
      <h2 className={styles.sectionTitle}>Administrator sign-in</h2>
      <form
        className={styles.loginForm}
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <div className={styles.field}>
          <label htmlFor="telemetry-email">Email</label>
          <input
            id="telemetry-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="telemetry-password">Password</label>
          <input
            id="telemetry-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
        <Button type="submit">
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p className={styles.note}>
        Access is limited to allowlisted administrators. IP addresses are shown
        only in this authenticated view.
      </p>
    </div>
  );
}

export function TelemetryDashboardPage() {
  const auth = useTelemetryAuth();
  const dashboard = useTelemetryDashboard(
    auth.session?.access_token,
    Boolean(auth.session && auth.isAdmin),
  );

  const activeSessions = dashboard.sessions.filter((session) => session.is_active);
  const inactiveSessions = dashboard.sessions.filter(
    (session) => !session.is_active,
  );

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Private</p>
            <h1 className={styles.title}>Visitor telemetry</h1>
            <p className={styles.subtitle}>
              Real-time session monitoring for this portfolio. Counts reflect
              stored sessions only — never sample or fabricated data.
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button href={import.meta.env.BASE_URL} variant="ghost">
              Portfolio
            </Button>
            {auth.session ? (
              <>
                <span className={styles.userEmail}>{auth.user?.email}</span>
                <Button variant="secondary" onClick={() => void auth.signOut()}>
                  Sign out
                </Button>
              </>
            ) : null}
          </div>
        </header>

        {!auth.configured ? (
          <section className={styles.panel}>
            <h2 className={styles.sectionTitle}>Configuration required</h2>
            <p className={styles.empty}>
              Set <code>VITE_SUPABASE_URL</code> and{' '}
              <code>VITE_SUPABASE_ANON_KEY</code>, apply the SQL migration, and
              configure Vercel server secrets before monitoring visitors.
            </p>
          </section>
        ) : null}

        {auth.configured && auth.loading ? (
          <section className={styles.panel}>
            <p className={styles.empty}>Checking authentication…</p>
          </section>
        ) : null}

        {auth.configured && !auth.loading && !auth.session ? (
          <LoginPanel error={auth.error} onSubmit={auth.signIn} />
        ) : null}

        {auth.configured && auth.session && !auth.isAdmin ? (
          <section className={styles.panel}>
            <h2 className={styles.sectionTitle}>Not authorized</h2>
            <p className={styles.empty}>
              Your account is signed in but is not on the telemetry admin
              allowlist.
            </p>
          </section>
        ) : null}

        {auth.configured && auth.session && auth.isAdmin ? (
          <>
            <section className={`${styles.panel} ${styles.stats}`} aria-label="Telemetry status">
              <div className={styles.stat}>
                <span className={styles.statLabel}>Tracking active since</span>
                <span className={styles.statValue}>
                  {formatTimestamp(dashboard.stats.trackingStartedAt)}
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Active sessions</span>
                <span className={styles.statValue}>
                  {dashboard.stats.activeSessions}
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Total visits</span>
                <span className={styles.statValue}>
                  {dashboard.stats.totalVisits}
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Approx. unique visitors</span>
                <span className={styles.statValue}>
                  {dashboard.stats.approximateUniqueVisitors}
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Active watchers</span>
                <span className={styles.statValue}>
                  {dashboard.stats.activeWatchers}
                </span>
              </div>
            </section>

            <div className={styles.layout}>
              <section className={styles.panel}>
                <h2 className={styles.sectionTitle}>Active sessions</h2>
                {dashboard.loading ? (
                  <p className={styles.empty}>Loading sessions…</p>
                ) : activeSessions.length === 0 ? (
                  <p className={styles.empty}>No active sessions right now.</p>
                ) : (
                  <div className={styles.list}>
                    {activeSessions.map((session) => (
                      <button
                        key={session.id}
                        type="button"
                        className={`${styles.row} ${
                          dashboard.selectedSessionId === session.id
                            ? styles.rowActive
                            : ''
                        }`}
                        onClick={() => dashboard.selectSession(session.id)}
                      >
                        <div className={styles.rowTop}>
                          <strong>
                            {session.browser_name ?? 'Unknown browser'} ·{' '}
                            {session.os_name ?? 'Unknown OS'}
                          </strong>
                          <span
                            className={`${styles.status} ${styles.statusActive}`}
                          >
                            Live
                          </span>
                        </div>
                        <span className={styles.meta}>
                          {locationLabel(session)} · last active{' '}
                          {formatTimestamp(session.last_active_at)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <h2 className={styles.sectionTitle} style={{ marginTop: '1.5rem' }}>
                  Recorded sessions
                </h2>
                {inactiveSessions.length === 0 ? (
                  <p className={styles.empty}>No recorded inactive sessions yet.</p>
                ) : (
                  <div className={styles.list}>
                    {inactiveSessions.map((session) => (
                      <button
                        key={session.id}
                        type="button"
                        className={`${styles.row} ${
                          dashboard.selectedSessionId === session.id
                            ? styles.rowActive
                            : ''
                        }`}
                        onClick={() => dashboard.selectSession(session.id)}
                      >
                        <div className={styles.rowTop}>
                          <strong>
                            {session.browser_name ?? 'Unknown browser'} ·{' '}
                            {session.os_name ?? 'Unknown OS'}
                          </strong>
                          <span
                            className={`${styles.status} ${styles.statusInactive}`}
                          >
                            Inactive
                          </span>
                        </div>
                        <span className={styles.meta}>
                          {locationLabel(session)} · started{' '}
                          {formatTimestamp(session.started_at)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section className={styles.panel}>
                <h2 className={styles.sectionTitle}>Session detail</h2>
                {dashboard.selectedSession ? (
                  <SessionDetails session={dashboard.selectedSession} />
                ) : (
                  <p className={styles.empty}>
                    Select a session to inspect IP, location, device, and timing
                    details.
                  </p>
                )}
              </section>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
