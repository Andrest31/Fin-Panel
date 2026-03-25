import { Box, Card, CardContent, Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import type { FlagReasonStat } from '../model/types';

type Props = {
  items: FlagReasonStat[];
};

export function TopFlagReasonsCard({ items }: Props) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Top flag reasons
        </Typography>

        <List>
          {items.map((item, index) => (
            <Box key={item.reason}>
              <ListItem disableGutters>
                <ListItemText primary={item.reason} secondary={`Count: ${item.count}`} />
              </ListItem>

              {index < items.length - 1 ? <Divider /> : null}
            </Box>
          ))}

          {items.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No flag reasons available
            </Typography>
          ) : null}
        </List>
      </CardContent>
    </Card>
  );
}
