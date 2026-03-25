import { Box, Card, CardContent, Typography } from '@mui/material';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Operation } from '@/entities/operation/api/getOperations';
import type { ChartItem } from '../model/types';
import { STATUS_COLORS } from '../lib/metrics';

type Props = {
  data: ChartItem[];
};

export function StatusDistributionCard({ data }: Props) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Status distribution
        </Typography>

        <Box sx={{ width: '100%', minWidth: 0, height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name as Operation['status']]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
