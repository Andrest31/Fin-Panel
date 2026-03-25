import { Box, Card, CardContent, Typography } from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Operation } from '@/entities/operation/api/getOperations';
import { RISK_COLORS } from '../lib/metrics';
import type { ChartItem } from '../model/types';

type Props = {
  data: ChartItem[];
};

export function RiskDistributionCard({ data }: Props) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Risk distribution
        </Typography>

        <Box sx={{ width: '100%', minWidth: 0, height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Operations">
                {data.map((entry) => (
                  <Cell key={entry.name} fill={RISK_COLORS[entry.name as Operation['riskLevel']]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
