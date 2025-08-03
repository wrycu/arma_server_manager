import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IconUsers, IconActivity } from '@tabler/icons-react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { ServerMetrics } from '../types';

interface ServerChartsProps {
  playerHistory: ServerMetrics[];
  resourceHistory: ServerMetrics[];
}

// Chart configurations
const playerChartConfig = {
  players: {
    label: 'Players',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

const resourceChartConfig = {
  cpu: {
    label: 'CPU',
    color: 'var(--chart-2)',
  },
  memory: {
    label: 'Memory',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

function PlayerChart({ data }: { data: ServerMetrics[] }) {
  const chartData = data.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    players: item.players,
    timestamp: item.timestamp,
  }));

  return (
    <ChartContainer config={playerChartConfig} className="h-[180px] w-full">
      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          domain={[0, 'dataMax + 5']}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value, payload) => {
                if (payload && payload[0]) {
                  return new Date(payload[0].payload.timestamp).toLocaleString();
                }
                return value;
              }}
              formatter={(value) => [`${value}`, 'Players']}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="players"
          stroke="var(--color-players)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, className: 'fill-primary' }}
        />
      </LineChart>
    </ChartContainer>
  );
}

function ResourceChart({ data }: { data: ServerMetrics[] }) {
  const chartData = data.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    cpu: Math.round(item.cpu),
    memory: Math.round(item.memory),
    timestamp: item.timestamp,
  }));

  return (
    <ChartContainer config={resourceChartConfig} className="h-[180px] w-full">
      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value, payload) => {
                if (payload && payload[0]) {
                  return new Date(payload[0].payload.timestamp).toLocaleString();
                }
                return value;
              }}
              formatter={(value, name) => [
                `${value}%`,
                name === 'cpu' ? 'CPU' : 'Memory',
              ]}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="cpu"
          stroke="var(--color-cpu)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="memory"
          stroke="var(--color-memory)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  );
}

export function ServerCharts({ playerHistory, resourceHistory }: ServerChartsProps) {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Player Count Over Time */}
      <Card className="flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <IconUsers className="size-4" />
            Player Activity
          </CardTitle>
          <CardDescription className="text-xs">Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <PlayerChart data={playerHistory} />
        </CardContent>
      </Card>

      {/* Resource Usage Over Time */}
      <Card className="flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <IconActivity className="size-4" />
            Resource Usage
          </CardTitle>
          <CardDescription className="text-xs">Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ResourceChart data={resourceHistory} />
        </CardContent>
      </Card>
    </div>
  );
}
