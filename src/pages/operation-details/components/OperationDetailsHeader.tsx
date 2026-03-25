import { Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function OperationDetailsHeader() {
  return (
    <Stack spacing={1} sx={{ mb: 3 }}>
      <Button
        component={RouterLink}
        to="/operations"
        variant="text"
        sx={{ alignSelf: "flex-start", px: 0 }}
      >
        ← Back to queue
      </Button>

      <Typography variant="h4">Case Review</Typography>
      <Typography variant="body2" color="text.secondary">
        Экран расследования операции: explainable risk scoring, collaboration
        workflow, audit trail и live-обновления карточки.
      </Typography>
    </Stack>
  );
}
