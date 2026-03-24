import Chip from '@mui/material/Chip';

type RiskLevel = 'low' | 'medium' | 'high';

type RiskLevelChipProps = {
  riskLevel: RiskLevel;
};

function getRiskColor(riskLevel: RiskLevel): 'success' | 'warning' | 'error' {
  switch (riskLevel) {
    case 'low':
      return 'success';
    case 'medium':
      return 'warning';
    case 'high':
      return 'error';
    default:
      return 'warning';
  }
}

export function RiskLevelChip({ riskLevel }: RiskLevelChipProps) {
  return <Chip label={riskLevel} color={getRiskColor(riskLevel)} size="small" variant="outlined" />;
}