import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ChartData {
  date: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
}

interface AttendanceChartProps {
  data: ChartData[];
  type?: 'line' | 'bar' | 'pie';
  title?: string;
}

const COLORS = {
  hadir: 'hsl(142, 76%, 36%)',
  izin: 'hsl(234, 89%, 63%)',
  sakit: 'hsl(38, 92%, 50%)',
  alpha: 'hsl(0, 84%, 60%)',
};

export const AttendanceChart = ({ data, type = 'line', title = 'Grafik Kehadiran' }: AttendanceChartProps) => {
  if (type === 'pie') {
    const totals = data.reduce(
      (acc, curr) => ({
        hadir: acc.hadir + curr.hadir,
        izin: acc.izin + curr.izin,
        sakit: acc.sakit + curr.sakit,
        alpha: acc.alpha + curr.alpha,
      }),
      { hadir: 0, izin: 0, sakit: 0, alpha: 0 }
    );

    const pieData = [
      { name: 'Hadir', value: totals.hadir, color: COLORS.hadir },
      { name: 'Izin', value: totals.izin, color: COLORS.izin },
      { name: 'Sakit', value: totals.sakit, color: COLORS.sakit },
      { name: 'Alpha', value: totals.alpha, color: COLORS.alpha },
    ].filter(d => d.value > 0);

    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'bar') {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs" 
                  tickFormatter={(v) => v.split('-').slice(1).join('/')}
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }} 
                />
                <Legend />
                <Bar dataKey="hadir" name="Hadir" fill={COLORS.hadir} radius={[4, 4, 0, 0]} />
                <Bar dataKey="izin" name="Izin" fill={COLORS.izin} radius={[4, 4, 0, 0]} />
                <Bar dataKey="sakit" name="Sakit" fill={COLORS.sakit} radius={[4, 4, 0, 0]} />
                <Bar dataKey="alpha" name="Alpha" fill={COLORS.alpha} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tickFormatter={(v) => v.split('-').slice(1).join('/')}
              />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="hadir" 
                name="Hadir"
                stroke={COLORS.hadir} 
                strokeWidth={2}
                dot={{ fill: COLORS.hadir }}
              />
              <Line 
                type="monotone" 
                dataKey="izin" 
                name="Izin"
                stroke={COLORS.izin} 
                strokeWidth={2}
                dot={{ fill: COLORS.izin }}
              />
              <Line 
                type="monotone" 
                dataKey="sakit" 
                name="Sakit"
                stroke={COLORS.sakit} 
                strokeWidth={2}
                dot={{ fill: COLORS.sakit }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
