import React from "react";
import { Link } from "@inertiajs/react";
import ProtectedLayout from "@/Layouts/ProtectedLayout";
import { Button } from "@/Components/ui/button";
import { DollarSign, TrendingUp, Clock, Calendar } from "lucide-react";

interface Props {
  summary: {
    totalRevenue: number;
    pendingAmount: number;
    todayRevenue: number;
    monthRevenue: number;
  };
  pendingPayments: any[];
  recentTransactions: any[];
  revenueByMethod: any[];
  dailyRevenue: any[];
  monthlyRevenue: any[];
  statusBreakdown: any[];
  topPayingClients: any[];
}

const FinanceDashboard = ({
  summary,
  pendingPayments,
  recentTransactions,
  revenueByMethod,
  dailyRevenue,
  monthlyRevenue,
  statusBreakdown,
  topPayingClients
}: Props) => {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Finance Dashboard</h1>
        <p className="text-muted-foreground">Monitor payments and revenue</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">KSh {summary.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Pending Amount</p>
              <p className="text-2xl font-bold">KSh {summary.pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Today's Revenue</p>
              <p className="text-2xl font-bold">KSh {summary.todayRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">KSh {summary.monthRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Payments Alert */}
      {pendingPayments.length > 0 && (
        <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-6">
          <div className="flex items-start gap-3">
            <Clock className="h-6 w-6 text-orange-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900">Pending Payments</h3>
              <p className="text-sm text-orange-700 mt-1">
                {pendingPayments.length} payment(s) awaiting confirmation
              </p>
              <div className="mt-3 space-y-2">
                {pendingPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between bg-white rounded px-3 py-2">
                    <div>
                      <p className="font-medium text-sm">{payment.booking?.client?.user?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.booking?.service?.name} - {payment.payment_method}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-orange-700">
                        KSh {payment.amount.toLocaleString()}
                      </p>
                      <Link href={`/payments/${payment.id}/edit`}>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Update Status
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout for Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue by Payment Method */}
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Revenue by Payment Method (Last 30 Days)</h2>
          </div>
          <div className="p-4">
            {revenueByMethod.length > 0 ? (
              <div className="space-y-4">
                {revenueByMethod.map((method) => (
                  <div key={method.payment_method} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{method.payment_method}</span>
                      <span className="text-sm font-semibold">
                        KSh {parseFloat(method.total).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          method.payment_method === 'mpesa' ? 'bg-green-500' :
                          method.payment_method === 'cash' ? 'bg-blue-500' :
                          'bg-purple-500'
                        }`}
                        style={{
                          width: `${(parseFloat(method.total) / Math.max(...revenueByMethod.map(m => parseFloat(m.total)))) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No revenue data</p>
            )}
          </div>
        </div>

        {/* Payment Status Breakdown */}
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Payment Status Breakdown</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {statusBreakdown.map((status) => (
                <div key={status.status} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium capitalize">{status.status}</p>
                    <p className="text-sm text-muted-foreground">{status.count} payment(s)</p>
                  </div>
                  <p className="text-lg font-bold">
                    KSh {parseFloat(status.total).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <Link href="/payments">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Service</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Method</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Transaction Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentTransactions.map((payment) => (
                <tr key={payment.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm">
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">{payment.booking?.client?.user?.name}</td>
                  <td className="px-4 py-3 text-sm">{payment.booking?.service?.name}</td>
                  <td className="px-4 py-3 text-sm capitalize">{payment.payment_method}</td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    KSh {payment.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {payment.transaction_reference || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Revenue Trend */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">Daily Revenue (Last 30 Days)</h2>
        </div>
        <div className="p-4">
          <div className="h-64 flex items-end justify-between gap-1">
            {dailyRevenue.map((day) => {
              const maxRevenue = Math.max(...dailyRevenue.map(d => parseFloat(d.total)));
              const height = (parseFloat(day.total) / maxRevenue) * 100;
              
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full">
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                      style={{ height: `${height * 2}px` }}
                      title={`${day.date}: KSh ${parseFloat(day.total).toLocaleString()}`}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 transform rotate-45 origin-left">
                    {new Date(day.date).getDate()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Paying Clients */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">Top Paying Clients (Last 30 Days)</h2>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {topPayingClients.map((client, index) => (
              <div key={client.client_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600 font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{client.client_name}</p>
                    <p className="text-sm text-muted-foreground">{client.payment_count} payment(s)</p>
                  </div>
                </div>
                <p className="text-lg font-bold">KSh {parseFloat(client.total_paid).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Revenue Trend */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">Monthly Revenue (Last 12 Months)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Month</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Revenue</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {monthlyRevenue.map((month, index) => {
                const prevMonth = monthlyRevenue[index - 1];
                const trend = prevMonth
                  ? ((parseFloat(month.total) - parseFloat(prevMonth.total)) / parseFloat(prevMonth.total)) * 100
                  : 0;

                return (
                  <tr key={month.month} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">{month.month}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">
                      KSh {parseFloat(month.total).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {prevMonth && (
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                          trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend).toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

FinanceDashboard.layout = (page: React.ReactNode) => <ProtectedLayout>{page}</ProtectedLayout>;

export default FinanceDashboard;
