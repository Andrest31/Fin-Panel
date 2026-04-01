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
import { buildExplainabilityItems } from '@/entities/operation/lib/decisioning';
import {
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
  const explainabilityItems = buildExplainabilityItems(data.riskFactors, data);
  const topReasons = explainabilityItems.slice(0, 3);

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
                <Chip label={`score ${data.riskScore}/100`} variant="outlined" />
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

          <Stack spacing={2.5}>
            <div>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Composite score</Typography>
                <Chip label={`${data.riskScore}/100`} color={getRiskColor(data.riskLevel)} />
              </Stack>

              <LinearProgress
                variant="determinate"
                value={data.riskScore}
                color={
                  data.riskLevel === 'high'
                    ? 'error'
                    : data.riskLevel === 'medium'
                      ? 'warning'
                      : 'success'
                }
                sx={{ height: 10, borderRadius: 999 }}
              />
            </div>

            <div>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Why this score is high
              </Typography>

              <Stack spacing={1}>
                {topReasons.map((reason) => (
                  <Stack
                    key={`${reason.code}_${reason.title}`}
                    direction="row"
                    justifyContent="space-between"
                    spacing={2}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      px: 1.5,
                      py: 1,
                    }}
                  >
                    <div>
                      <Typography variant="subtitle2">{reason.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {reason.description}
                      </Typography>
                    </div>

                    <Chip
                      size="small"
                      color={reason.contribution >= 20 ? 'error' : 'warning'}
                      label={`+${reason.contribution}`}
                    />
                  </Stack>
                ))}
              </Stack>
            </div>

            <Divider />

            <div>
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
            </div>
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
                    px: 0,
                    transition: 'background-color 300ms ease',
                    bgcolor: isHighlighted ? 'rgba(255, 193, 7, 0.08)' : 'transparent',
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
                        {event.reason ? <Chip size="small" label={event.reason} /> : null}
                      </Stack>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {new Date(event.timestamp).toLocaleString()} — {event.comment}
                        </Typography>

                        {event.changes?.length ? (
                          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
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
                      </>
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