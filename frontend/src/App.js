import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ComputersPage from './pages/Computers/ComputersPage';
import ChangesPage from './pages/Changes/ChangesPage';
// import UsersPage from './pages/UsersPage';
// import SettingsPage from './pages/SettingsPage';
// import { ThemeProvider, createTheme } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// const darkTheme = createTheme({
//   palette: {
//     mode: 'dark',
//     primary: {
//       main: '#90caf9',
//     },
//     secondary: {
//       main: '#f48fb1',
//     },
//   },
// });

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path='/' element={<Layout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="computers" element={<PrivateRoute><ComputersPage /></PrivateRoute>} />
            <Route path="changes" element={<PrivateRoute><ChangesPage /></PrivateRoute>} />
            {/* <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} /> */}
          </Route>
        </Routes>
    </BrowserRouter>
  );
}

export default App;