import { useState, type FormEvent, type ReactNode } from 'react';
import {
  CalendarClock,
  Clock,
  Globe,
  Laptop,
  Map as MapIcon,
  MapPin,
  MonitorSmartphone,
  Network,
  RadioTower,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@views/components/Button';
import {
  useTelemetryAuth,
  useTelemetryDashboard,
} from '@viewmodels';
import type { VisitorSessionRecord } from '@models';
import {
  telemetryRepository,
  type AdminIpVerification,
} from '@repositories';
import styles from './TelemetryDashboardPage.module.scss';

type FieldKind = 'ip' | 'location' | 'network' | 'default';

function formatTimestamp(value: string | null | undefined): string {
  if (!value) {
    return 'Unavailable';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unavailable';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date);
}

function displayField(
  value: string | null | undefined,
  kind: FieldKind,
  isActive: boolean,
): string {
  const trimmed = value?.trim();
  if (trimmed) {
    return trimmed;
  }

  if (isActive) {
    if (kind === 'ip' || kind === 'network') {
      return 'Pending...';
    }
    if (kind === 'location') {
      return 'Resolving...';
    }
  }

  return 'Unavailable';
}

function locationSummary(session: VisitorSessionRecord): string {
  const city = session.geo_city?.trim();
  const country = session.geo_country?.trim();
  if (city && country) {
    return `${city}, ${country}`;
  }
  if (city || country) {
    return city || country || 'Unavailable';
  }
  return displayField(null, 'location', session.is_active);
}

function deviceLabel(session: VisitorSessionRecord): string {
  const category = session.device_category?.trim();
  if (category && category !== 'unknown') {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
  return 'Unknown device';
}

function DetailRow({
  icon: Icon,
  label,
  value,
  pending = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  pending?: boolean;
}) {
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailLabel}>
        <Icon size={14} aria-hidden="true" className={styles.detailIcon} />
        {label}
      </span>
      <span
        className={`${styles.detailValue} ${pending ? styles.detailValuePending : ''}`}
      >
        {value}
      </span>
    </div>
  );
}

function SessionDetails({ session }: { session: VisitorSessionRecord }) {
  const isActive = session.is_active;
  const ip = displayField(session.ip_address, 'ip', isActive);
  const city = displayField(session.geo_city, 'location', isActive);
  const region = displayField(session.geo_region, 'location', isActive);
  const country = displayField(session.geo_country, 'location', isActive);
  const location = displayField(
    [session.geo_city, session.geo_region, session.geo_country]
      .filter(Boolean)
      .join(', ') || null,
    'location',
    isActive,
  );
  const network = displayField(
    session.isp_name || session.network_org,
    'network',
    isActive,
  );
  const browser = displayField(
    [session.browser_name, session.browser_engine].filter(Boolean).join(' / ') ||
      null,
    'default',
    isActive,
  );
  const device = displayField(
    session.device_category && session.device_category !== 'unknown'
      ? session.device_category
      : null,
    'default',
    isActive,
  );
  const os = displayField(session.os_name, 'default', isActive);
  const screen =
    session.screen_width && session.screen_height
      ? `${session.screen_width}×${session.screen_height}`
      : 'Unavailable';
  const timezone = displayField(session.timezone, 'default', isActive);
  const sessionTime = formatTimestamp(session.started_at);

  const isPending = (value: string) =>
    value === 'Pending...' || value === 'Resolving...';

  return (
    <div className={styles.detailGrid}>
      <DetailRow
        icon={Network}
        label="IP Address"
        value={ip}
        pending={isPending(ip)}
      />
      <DetailRow
        icon={MapPin}
        label="Location"
        value={location}
        pending={isPending(location)}
      />
      <DetailRow
        icon={MapIcon}
        label="City"
        value={city}
        pending={isPending(city)}
      />
      <DetailRow
        icon={MapIcon}
        label="State / Region"
        value={region}
        pending={isPending(region)}
      />
      <DetailRow
        icon={MapPin}
        label="Country"
        value={country}
        pending={isPending(country)}
      />
      <DetailRow
        icon={RadioTower}
        label="Network Provider / ISP"
        value={network}
        pending={isPending(network)}
      />
      <DetailRow icon={Globe} label="Browser" value={browser} />
      <DetailRow icon={MonitorSmartphone} label="Device" value={device} />
      <DetailRow icon={Laptop} label="Operating System" value={os} />
      <DetailRow icon={MonitorSmartphone} label="Screen Resolution" value={screen} />
      <DetailRow icon={Clock} label="Timezone" value={timezone} />
      <DetailRow
        icon={CalendarClock}
        label="Session Timestamp"
        value={sessionTime}
      />
    </div>
  );
}

function VisitorCard({
  session,
  visitorNumber,
  selected,
  onSelect,
}: {
  session: VisitorSessionRecord;
  visitorNumber: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.row} ${selected ? styles.rowActive : ''}`}
      onClick={onSelect}
    >
      <div className={styles.rowTop}>
        <strong className={styles.rowTitle}>
          <MapPin size={14} aria-hidden="true" className={styles.rowPin} />
          Visitor {visitorNumber}
        </strong>
        <span className={styles.deviceChip}>{deviceLabel(session)}</span>
      </div>
      <span className={styles.meta}>{locationSummary(session)}</span>
    </button>
  );
}

function IpVerificationPanel({ accessToken }: { accessToken: string }) {
  const [result, setResult] = useState<AdminIpVerification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await telemetryRepository.verifyAdminIp(accessToken);
      if (!next) {
        setResult(null);
        setError('Could not verify IP (auth or API failure).');
        return;
      }
      setResult(next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.panel} aria-label="IP verification">
      <h2 className={styles.sectionTitle}>IP verification</h2>
      <p className={styles.note}>
        Compares the server-detected request IP (Vercel headers) with your
        current public IP. Admin session only.
      </p>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          void runCheck();
        }}
      >
        {loading ? 'Checking…' : 'Verify my IP'}
      </Button>
      {error ? <p className={styles.error}>{error}</p> : null}
      {result ? (
        <div className={styles.detailGrid}>
          <DetailRow
            icon={Network}
            label="Server-detected IP"
            value={result.serverDetectedIp}
          />
          <DetailRow
            icon={Globe}
            label="Your public IP (this browser)"
            value={
              result.clientPublicIpFailed
                ? 'Unavailable'
                : (result.clientPublicIp ?? 'Unavailable')
            }
          />
          <DetailRow
            icon={MapPin}
            label="Match"
            value={
              result.matches === null
                ? 'inconclusive'
                : result.matches
                  ? 'yes'
                  : 'no'
            }
          />
          <DetailRow
            icon={MapIcon}
            label="Vercel geo"
            value={
              [result.vercelGeo.city, result.vercelGeo.region, result.vercelGeo.country]
                .filter(Boolean)
                .join(', ') || 'Unavailable'
            }
          />
        </div>
      ) : null}
    </section>
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
        Access is limited to allowlisted administrators. IP and network details
        appear only in this authenticated view.
      </p>
    </div>
  );
}

function PanelShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
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

  const visitorNumberById = new Map<string, number>();
  [...activeSessions, ...inactiveSessions].forEach((session, index) => {
    visitorNumberById.set(session.id, index + 1);
  });

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>
              <MapPin size={12} aria-hidden="true" />
              Private
            </p>
            <h1 className={styles.title}>Visitor telemetry</h1>
            <p className={styles.subtitle}>
              Location, IP, and network details for portfolio visitors. Values
              come from stored sessions only — never fabricated.
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
            <Button
              href={import.meta.env.BASE_URL}
              variant="ghost"
              ariaLabel="Close telemetry"
            >
              <X size={16} aria-hidden="true" />
            </Button>
          </div>
        </header>

        {!auth.configured ? (
          <PanelShell title="Configuration required">
            <p className={styles.empty}>
              Set <code>VITE_SUPABASE_URL</code> and{' '}
              <code>VITE_SUPABASE_ANON_KEY</code>, apply the SQL migration, and
              configure Vercel server secrets before viewing visitor details.
            </p>
          </PanelShell>
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
          <PanelShell title="Not authorized">
            <p className={styles.empty}>
              Your account is signed in but is not on the telemetry admin
              allowlist.
            </p>
          </PanelShell>
        ) : null}

        {auth.configured && auth.session && auth.isAdmin ? (
          <>
            {auth.session.access_token ? (
              <IpVerificationPanel accessToken={auth.session.access_token} />
            ) : null}
            <section
              className={`${styles.panel} ${styles.stats}`}
              aria-label="Telemetry status"
            >
              <div className={styles.stat}>
                <span className={styles.statLabel}>Tracking since</span>
                <span className={styles.statValue}>
                  {formatTimestamp(dashboard.stats.trackingStartedAt)}
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Visitor sessions</span>
                <span className={styles.statValue}>
                  {dashboard.stats.totalVisits}
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Unique devices</span>
                <span className={styles.statValue}>
                  {dashboard.stats.approximateUniqueVisitors}
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Current sessions</span>
                <span className={styles.statValue}>
                  {dashboard.stats.activeSessions}
                </span>
              </div>
            </section>

            <div className={styles.layout}>
              <section className={styles.panel}>
                <h2 className={styles.sectionTitle}>Current visitors</h2>
                {dashboard.loading ? (
                  <p className={styles.empty}>Loading sessions…</p>
                ) : activeSessions.length === 0 ? (
                  <p className={styles.empty}>No current visitor sessions.</p>
                ) : (
                  <div className={styles.list}>
                    {activeSessions.map((session) => (
                      <VisitorCard
                        key={session.id}
                        session={session}
                        visitorNumber={visitorNumberById.get(session.id) ?? 0}
                        selected={dashboard.selectedSessionId === session.id}
                        onSelect={() => dashboard.selectSession(session.id)}
                      />
                    ))}
                  </div>
                )}

                <h2
                  className={styles.sectionTitle}
                  style={{ marginTop: '1.5rem' }}
                >
                  Recent visitors
                </h2>
                {inactiveSessions.length === 0 ? (
                  <p className={styles.empty}>No recorded sessions yet.</p>
                ) : (
                  <div className={styles.list}>
                    {inactiveSessions.map((session) => (
                      <VisitorCard
                        key={session.id}
                        session={session}
                        visitorNumber={visitorNumberById.get(session.id) ?? 0}
                        selected={dashboard.selectedSessionId === session.id}
                        onSelect={() => dashboard.selectSession(session.id)}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className={styles.panel}>
                <h2 className={styles.sectionTitle}>
                  <MapPin size={16} aria-hidden="true" className={styles.titlePin} />
                  Visitor details
                </h2>
                {dashboard.selectedSession ? (
                  <SessionDetails session={dashboard.selectedSession} />
                ) : (
                  <p className={styles.empty}>
                    Select a visitor to inspect IP, location, network, and
                    device details.
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
