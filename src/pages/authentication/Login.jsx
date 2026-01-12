import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, setUser, setToken } from "../../features/authentication/authenticationSlice";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Alert, Typography } from "@mui/material";
import nag from "../../assets/authentication/nag.svg";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { status } = useSelector((state) => state.auth);
  const [localError, setLocalError] = useState(null);

  const onSubmit = async ({ email, password }) => {
    setLocalError(null);

    const action = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(action)) {
      const res = action.payload;

      if (res?.status === true && res?.token) {
        dispatch(setToken(res.token));
        dispatch(setUser({ email }));
        navigate("/dashboard", { replace: true });
        return;
      }
    }

    if (loginUser.rejected.match(action)) {
      setLocalError(action.payload?.message || "Invalid email or password");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        
        {/* LEFT — Wallpaper (60%) */}
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

        {/* RIGHT — Login (40%) */}
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
              Welcome Back
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                label="Email"
                fullWidth
                margin="dense"
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Enter a valid email",
                  },
                })}
              />

              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="dense"
                sx={{ mb: 0.5 }}
                error={!!errors.password}
                helperText={errors.password?.message}
                {...register("password", {
                  required: "Password is required",
                })}
              />

              <Button
                variant="text"
                size="small"
                sx={{ alignSelf: "flex-end", mt: 0.5 }}
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </Button>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={status === "loading"}
                sx={{ mt: 2 }}
              >
                {status === "loading" ? "Logging in…" : "Login"}
              </Button>

              <Button
                variant="text"
                fullWidth
                sx={{ mt: 1 }}
                onClick={() => navigate("/signup")}
              >
                Don’t have an account? Signup
              </Button>

              {localError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {localError}
                </Alert>
              )}
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
