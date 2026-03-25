import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { RiskLevelChip } from '@/entities/operation/ui/RiskLevelChip';
import { StatusChip } from '@/entities/operation/ui/StatusChip';
import type { LatestOperation } from '../model/types';

type Props = {
  operations: LatestOperation[];
};

export function LatestOperationsCard({ operations }: Props) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Latest operations
        </Typography>

        <List>
          {operations.map((operation, index) => (
            <Box key={operation.id}>
              <ListItem
                component={RouterLink}
                to={`/operations/${operation.id}`}
                sx={{
                  color: 'inherit',
                  textDecoration: 'none',
                  alignItems: 'flex-start',
                }}
              >
                <ListItemText
                  primary={
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={1}
                      alignItems={{ xs: 'flex-start', md: 'center' }}
                    >
                      <Typography variant="subtitle1">{operation.merchant}</Typography>
                      <StatusChip status={operation.status} />
                      <RiskLevelChip riskLevel={operation.riskLevel} />
                      <Chip size="small" label={`score ${operation.riskScore}`} />
                    </Stack>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {operation.amount} {operation.currency} • {operation.country} / {operation.city}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Updated: {new Date(operation.updatedAt).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>

              {index < operations.length - 1 ? <Divider /> : null}
            </Box>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
