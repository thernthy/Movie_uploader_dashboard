import * as React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { green } from "@mui/material/colors";
import Button from "@mui/material/Button";
import Fab from "@mui/material/Fab";
import CheckIcon from "@mui/icons-material/Check";
import SaveIcon from "@mui/icons-material/Save";

// Define props type
interface CircularIntegrationProps {
  loading: boolean;
  successMessage: string | null;
  errorMessage: string | null;
}

const CircularIntegration: React.FC<CircularIntegrationProps> = ({
  loading,
  successMessage,
  errorMessage,
}) => {
  const [showSuccess, setShowSuccess] = React.useState<boolean>(false);
  const [showError, setShowError] = React.useState<boolean>(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>();

  // Style configuration for buttons
  const buttonSx = {
    ...(showSuccess && {
      bgcolor: green[500],
      "&:hover": {
        bgcolor: green[700],
      },
    }),
  };

  // Cleanup timer on component unmount
  React.useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  // Handle success message timeout
  React.useEffect(() => {
    if (successMessage) {
      setShowSuccess(true);
      timer.current = setTimeout(() => {
        setShowSuccess(false);
      }, 5000); // 5 seconds timeout
    }
  }, [successMessage]);

  // Handle error message timeout
  React.useEffect(() => {
    if (errorMessage) {
      setShowError(true);
      timer.current = setTimeout(() => {
        setShowError(false);
      }, 5000); // 5 seconds timeout
    }
  }, [errorMessage]);

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {/* Floating Action Button */}
      <Box sx={{ m: 1, position: "relative" }}>
        <Fab aria-label="save" color="info" sx={buttonSx}>
          {showSuccess ? <CheckIcon /> : <SaveIcon />}
        </Fab>
        {loading && (
          <CircularProgress
            size={68}
            sx={{
              color: green[500],
              position: "absolute",
              top: -6,
              left: -6,
              zIndex: 1,
            }}
          />
        )}
      </Box>

      {/* Standard Button */}
      <Box sx={{ m: 1, position: "relative" }}>
        <Button variant="contained" sx={buttonSx} disabled={loading}>
          Allow Access
        </Button>
        {loading && (
          <CircularProgress
            size={24}
            sx={{
              color: green[500],
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: "-12px",
              marginLeft: "-12px",
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default CircularIntegration;
