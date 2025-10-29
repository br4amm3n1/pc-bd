import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../../context/AuthContext';

const Register = () => {
  const { handleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      password2: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Required').min(3),
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string().required('Required').min(8),
      password2: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Required'),
    }),
    onSubmit: async (values) => {
      try {
        const { password2, ...userData } = values;
        const data = await register(userData);
        handleLogin(data.token, { username: data.user.username, id: data.user.id });
        navigate('/');
      } catch (err) {
        setError(err.username || err.email || 'Registration failed');
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>Register</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            name="username"
            value={formik.values.username}
            onChange={formik.handleChange}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm Password"
            name="password2"
            type="password"
            value={formik.values.password2}
            onChange={formik.handleChange}
            error={formik.touched.password2 && Boolean(formik.errors.password2)}
            helperText={formik.touched.password2 && formik.errors.password2}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
          >
            Register
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Register;