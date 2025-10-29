import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const { handleLogin } = useContext(AuthContext); 
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Это обязательное поле'),
      password: Yup.string().required('Это обязательное поле'),
    }),
    onSubmit: async (values) => {
      try {
        const { token } = await login(values);
        const loginSuccess = await handleLogin(token);
        
        if (loginSuccess) {
          navigate('/');
        }
      } catch (err) {
        setError('Неверный логин или пароль');
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>Вход</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Логин"
            name="username"
            value={formik.values.username}
            onChange={formik.handleChange}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Пароль"
            name="password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
          >
            Войти
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
