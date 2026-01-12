import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, clearError } from "../../features/authentication/authenticationSlice";
import { Box, Button, TextField, Alert, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import nag from "../../assets/authentication/nag.svg";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { status, error } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async ({ email }) => {
    const action = await dispatch(forgotPassword({ email }));
    if (forgotPassword.fulfilled.match(action)) {
      navigate("/reset-password", { state: { email } });
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        
        {/* LEFT — Wallpaper */}
        <Box
          sx={{
            flex: 3,
            display: { xs: "none", md: "block" },
            backgroundImage: `url(${nag})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* RIGHT — Forgot Password */}
        <Box
          sx={{
            flex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: { xs: 2, sm: 4 },
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 420 }}>
            <Typography variant="h5" mb={2} fontWeight={600}>
              Forgot Password
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register("email", { required: "Email is required" })}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={status === "loading"}
                sx={{ mt: 2 }}
              >
                {status === "loading" ? "Sending OTP..." : "Send OTP"}
              </Button>

              <Button
                variant="text"
                fullWidth
                sx={{ mt: 1 }}
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
