import {
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import type { OperationDetails } from '@/entities/operation/api/getOperations';
import {
  formatRiskFactorContribution,
  getRecommendedActionColor,
  getRiskColor,
  getStatusColor,
} from '../lib/presentation';

type Props = {
  data: OperationDetails;
  highImpactFactors: OperationDetails['riskFactors'];
  highlightedHistoryEventIdSet: Set<string>;
};

export function OperationDetailsMainColumn({
  data,
  highImpactFactors,
  highlightedHistoryEventIdSet,
}: Props) {
  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent="space-between"
            >
              <div>
                <Typography variant="h5">{data.merchant}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {data.id} • customer {data.customerId}
                </Typography>
              </div>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip label={`${data.amount} ${data.currency}`} />
                <Chip label={data.status} color={getStatusColor(data.status)} />
                <Chip label={data.riskLevel} color={getRiskColor(data.riskLevel)} />
              </Stack>
            </Stack>

            <Divider />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <div>
                <Typography variant="body2" color="text.secondary">
                  Payment method
                </Typography>
                <Typography variant="body1">{data.paymentMethod.toUpperCase()}</Typography>
              </div>

              <div>
                <Typography variant="body2" color="text.secondary">
                  Geography
                </Typography>
                <Typography variant="body1">
                  {data.country}, {data.city}
                </Typography>
              </div>

              <div>
                <Typography variant="body2" color="text.secondary">
                  Device / IP
                </Typography>
                <Typography variant="body1">
                  {data.deviceId} / {data.ipAddress}
                </Typography>
              </div>

              <div>
                <Typography variant="body2" color="text.secondary">
                  Reviewer
                </Typography>
                <Typography variant="body1">{data.reviewer ?? 'Not assigned yet'}</Typography>
              </div>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Explainable risk scoring
          </Typography>

          <Stack spacing={2}>
            {data.riskFactors.map((factor) => (
              <div key={factor.code}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 0.5 }}
                >
                  <Typography variant="subtitle2">{factor.label}</Typography>
                  <Chip
                    size="small"
                    label={formatRiskFactorContribution(factor)}
                    color={factor.contribution >= 20 ? 'error' : 'default'}
                  />
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {factor.value}
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, factor.contribution * 3)}
                  color={factor.contribution >= 20 ? 'error' : 'primary'}
                />
              </div>
            ))}
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            High impact signals
          </Typography>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {highImpactFactors.length > 0 ? (
              highImpactFactors.map((factor) => (
                <Chip
                  key={factor.code}
                  label={`${factor.label} (${factor.contribution})`}
                  color="error"
                  variant="outlined"
                />
              ))
            ) : (
              <Typography variant="body2">No high impact factors</Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Analyst summary
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            {data.analystSummary}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: getRecommendedActionColor(data.recommendedAction),
              fontWeight: 600,
            }}
          >
            Recommended action: {data.recommendedAction}
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Timeline / audit trail
          </Typography>

          <List>
            {data.history.map((event, index) => {
              const isHighlighted = highlightedHistoryEventIdSet.has(event.id);

              return (
                <ListItem
                  key={event.id}
                  disableGutters
                  divider={index < data.history.length - 1}
                  sx={{
                    alignItems: 'flex-start',
                    transition: 'background-color 0.3s ease',
                    bgcolor: isHighlighted ? 'warning.light' : 'transparent',
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1}
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                      >
                        <Typography variant="subtitle2">{event.type}</Typography>
                        <Chip size="small" label={event.actor} variant="outlined" />
                        {event.reason ? (
                          <Chip size="small" label={`Reason: ${event.reason}`} color="warning" />
                        ) : null}
                      </Stack>
                    }
                    secondary={
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          {new Date(event.timestamp).toLocaleString()} — {event.comment}
                        </Typography>

                        {event.changes.length > 0 ? (
                          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            {event.changes.map((change) => (
                              <Chip
                                key={`${event.id}_${change.field}`}
                                size="small"
                                variant="outlined"
                                label={`${change.field}: ${change.before ?? '—'} → ${change.after ?? '—'}`}
                              />
                            ))}
                          </Stack>
                        ) : null}
                      </Stack>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </CardContent>
      </Card>
    </Stack>
  );
}
