'use client'

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { usePermissions } from '@/contexts/PermissionContext';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

// UI v2 Components
import { Page } from '@/components/ui-v2/layout/Page';
import { Card } from '@/components/ui-v2/layout/Card';
import { Section } from '@/components/ui-v2/layout/Section';
import { LinkButton } from '@/components/ui-v2/navigation/LinkButton';
import { Button } from '@/components/ui-v2/forms/Button';
import { Alert } from '@/components/ui-v2/feedback/Alert';
import { Spinner } from '@/components/ui-v2/feedback/Spinner';
import { Badge } from '@/components/ui-v2/display/Badge';
import { Stat } from '@/components/ui-v2/display/Stat';
import { EmptyState } from '@/components/ui-v2/display/EmptyState';
import { BackButton } from '@/components/ui-v2/navigation/BackButton';

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'error';
  timestamp: string;
  checks: {
    database: boolean;
    bookingCreation: boolean;
    paymentProcessing: boolean;
    smsDelivery: boolean;
    emailDelivery: boolean;
  };
  metrics: {
    todayBookings: number;
    pendingPayments: number;
    failedSms: number;
    avgResponseTime: number;
  };
  alerts: Array<{
    type: 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
  }>;
}

export default function TableBookingMonitoringPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [healthCheck, setHealthCheck] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentIssues, setRecentIssues] = useState<any[]>([]);

  const canManage = hasPermission('table_bookings', 'manage');

  useEffect(() => {
    if (canManage) {
      loadMonitoringData();
      // Refresh every 60 seconds
      const interval = setInterval(loadMonitoringData, 60000);
      return () => clearInterval(interval);
    }
  }, [canManage]);

  async function loadMonitoringData() {
    try {
      setError(null);
      
      // Fetch health check
      const response = await fetch('/api/monitoring/table-bookings/health');
      const data = await response.json();
      setHealthCheck(data);

      // Load recent issues from audit logs
      const { data: issues } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('entity_type', 'table_booking')
        .in('action', ['error', 'failed', 'cancelled'])
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentIssues(issues || []);
    } catch (err: any) {
      console.error('Error loading monitoring data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-8 w-8 text-green-500" />;
      case 'unhealthy':
        return <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-8 w-8 text-red-500" />;
      default:
        return null;
    }
  }

  function getCheckStatus(check: boolean) {
    return check ? (
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
    ) : (
      <XCircleIcon className="h-5 w-5 text-red-500" />
    );
  }

  if (!canManage) {
    return (
      <Page title="Table Booking System Monitoring">
        <Alert variant="error">
          You do not have permission to view monitoring.
        </Alert>
      </Page>
    );
  }

  if (loading) {
    return (
      <Page title="Table Booking System Monitoring">
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </Page>
    );
  }

  return (
    <Page 
      title="Table Booking System Monitoring"
      description="Real-time health monitoring and system metrics"
      actions={
        <Button variant="secondary"
          size="sm"
          onClick={loadMonitoringData}
          leftIcon={<ArrowPathIcon className="h-4 w-4" />}
        >
          Refresh
        </Button>
      }
    >
      <BackButton label="Back to Table Bookings" onBack={() => router.push('/table-bookings')} />

      {error && (
        <Alert variant="error" className="mt-4">
          {error}
        </Alert>
      )}

      {healthCheck && (
        <>
          {/* Overall Status */}
          <Card className="mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(healthCheck.status)}
                <div>
                  <h2 className="text-xl font-semibold capitalize">{healthCheck.status}</h2>
                  <p className="text-gray-600">
                    Last checked: {format(new Date(healthCheck.timestamp), 'HH:mm:ss')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-2xl font-bold">{healthCheck.metrics.avgResponseTime}ms</p>
              </div>
            </div>
          </Card>

          {/* System Checks */}
          <Section title="System Checks" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(healthCheck.checks).map(([check, status]) => (
                <Card key={check}>
                  <div className="flex items-center justify-between">
                    <span className="capitalize">{check.replace(/([A-Z])/g, ' $1').trim()}</span>
                    {getCheckStatus(status)}
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          {/* Metrics */}
          <Section title="Metrics" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat
                label="Today's Bookings"
                value={healthCheck.metrics.todayBookings}
              />
              <Stat
                label="Pending Payments"
                value={healthCheck.metrics.pendingPayments}
                color={healthCheck.metrics.pendingPayments > 5 ? 'warning' : 'default'}
              />
              <Stat
                label="Failed SMS (24h)"
                value={healthCheck.metrics.failedSms}
                color={healthCheck.metrics.failedSms > 0 ? 'error' : 'default'}
              />
              <Stat
                label="Active Alerts"
                value={healthCheck.alerts.length}
                color={healthCheck.alerts.length > 0 ? 'warning' : 'default'}
              />
            </div>
          </Section>

          {/* Active Alerts */}
          {healthCheck.alerts.length > 0 && (
            <Section title="Active Alerts" className="mt-8">
              <Card>
                <div className="divide-y">
                  {healthCheck.alerts.map((alert, index) => (
                    <div key={index} className="p-4">
                      <div className="flex items-start gap-3">
                        {alert.type === 'error' && <XCircleIcon className="h-5 w-5 text-red-500 mt-0.5" />}
                        {alert.type === 'warning' && <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />}
                        <div className="flex-1">
                          <h3 className="font-medium">{alert.title}</h3>
                          <p className="text-gray-600">{alert.message}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {format(new Date(alert.timestamp), 'HH:mm:ss')}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            alert.type === 'error' ? 'error' : 
                            alert.type === 'warning' ? 'warning' : 
                            'info'
                          }
                        >
                          {alert.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Section>
          )}

          {/* Recent Issues */}
          <Section title="Recent Issues" className="mt-8">
            <Card>
              {recentIssues.length === 0 ? (
                <EmptyState
                  title="No recent issues"
                  description="No errors, failures, or cancellations found in the last 24 hours"
                />
              ) : (
                <div className="divide-y">
                  {recentIssues.map((issue) => (
                    <div key={issue.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium capitalize">{issue.action}</p>
                          <p className="text-sm text-gray-600">
                            {issue.metadata?.error || issue.metadata?.reason || 'No details available'}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {format(new Date(issue.created_at), 'dd/MM HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Section>
        </>
      )}
    </Page>
  );
}