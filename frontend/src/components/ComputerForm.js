// ComputerForm.js
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';


const INSTITUTES = [
  { value: 'NOTCHOICED', label: 'Не выбрано' },
  { value: 'NIIPZ', label: 'НИИ ПЗ' },
  { value: 'NIIPHIRM', label: 'НИИ ФиРМ' },
  { value: 'NIIGENETICS', label: 'НИИ Генетики' },
];

const computerSchema = Yup.object().shape({
  computer_name: Yup.string()
    .required('Обязательное поле')
    .matches(
    /^[a-zA-Zа-яА-Я0-9_-]+$/,
    'Только буквы (русские/латинские), цифры, дефисы и подчеркивания'
  ),
  ip_address: Yup.string()
    .required('Обязательное поле')
    .matches(
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      'Неверный формат IP-адреса'
    ),
  mac_address: Yup.string()
    .matches(
      /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
      {
        message: 'Введите MAC-адрес в формате XX:XX:XX:XX:XX:XX или XX-XX-XX-XX-XX-XX',
        excludeEmptyString: true,
      }
    ),
  institute_name: Yup.string()
    .required('Выберите институт')
    .oneOf(
      ['NOTCHOICED', 'NIIPZ', 'NIIPHIRM', 'NIIGENETICS'],
      'Недопустимое значение'
    ),
  location_address: Yup.string().required('Обязательное поле'),
  floor: Yup.number()
    .required('Обязательное поле')
    .min(0, 'Минимум 0 этаж')
    .max(10, 'Максимум 10 этажей'),
  office: Yup.string().required('Обязательное поле'),
  domain: Yup.string().required('Обязательное поле'),
  operating_system: Yup.string().required('Выберите ОС'),
  pc_owner: Yup.string(),
  pc_owner_position_at_work: Yup.string(),
  comment: Yup.string(),
});

export default function ComputerForm({ open, onClose, computer, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      computer_name: computer?.computer_name || '',
      ip_address: computer?.ip_address || '',
      mac_address: computer?.mac_address || '',
      institute_name: computer?.institute_name || 'NOTCHOICED',
      location_address: computer?.location_address || '',
      floor: computer?.floor || 0,
      office: computer?.office || '',
      domain: computer?.domain || '',
      pc_owner: computer?.pc_owner || '',
      pc_owner_position_at_work: computer?.pc_owner_position_at_work || '',
      has_kaspersky: computer?.has_kaspersky || false,
      operating_system: computer?.operating_system || '',
      comment: computer?.comment || '',
    },
    validationSchema: computerSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        if (onSubmit) {
          await onSubmit(values);
          onClose();
          formik.resetForm();
          setIsSubmitting(false);
          return;
        }
      } catch (error) {
        console.error('Ошибка при сохранении компьютера:', error);
        setIsSubmitting(false);
      }
    },
  });

  const { setValues, resetForm } = formik;

  useEffect(() => {
    if (computer) {
      formik.setValues({
        computer_name: computer.computer_name,
        ip_address: computer.ip_address,
        mac_address: computer.mac_address || '',
        institute_name: computer.institute_name || 'NOTCHOICED',
        location_address: computer.location_address,
        floor: computer.floor,
        office: computer.office,
        domain: computer.domain,
        pc_owner: computer.pc_owner || '',
        pc_owner_position_at_work: computer.pc_owner_position_at_work || '',
        has_kaspersky: computer.has_kaspersky,
        operating_system: computer.operating_system,
        comment: computer.comment,
      });
    } else if (!open) {
      formik.resetForm();
    }
  }, [computer, open, setValues, resetForm]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {computer ? 'Редактирование компьютера' : 'Добавление нового компьютера'}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                id="computer_name"
                name="computer_name"
                label="Имя компьютера"
                value={formik.values.computer_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.computer_name && Boolean(formik.errors.computer_name)}
                helperText={formik.touched.computer_name && formik.errors.computer_name}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                id="ip_address"
                name="ip_address"
                label="IP-адрес"
                value={formik.values.ip_address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.ip_address && Boolean(formik.errors.ip_address)}
                helperText={formik.touched.ip_address && formik.errors.ip_address}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                id="mac_address"
                name="mac_address"
                label="MAC-адрес"
                placeholder="AA:BB:CC:DD:EE:FF"
                value={formik.values.mac_address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.mac_address && Boolean(formik.errors.mac_address)}
                helperText={formik.touched.mac_address && formik.errors.mac_address}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl
                fullWidth
                margin="normal"
                error={formik.touched.institute_name && Boolean(formik.errors.institute_name)}
              >
                <InputLabel id="institute_name-label">Институт</InputLabel>
                <Select
                  labelId="institute_name-label"
                  id="institute_name"
                  name="institute_name"
                  value={formik.values.institute_name}
                  label="Институт"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  {INSTITUTES.map((inst) => (
                    <MenuItem key={inst.value} value={inst.value}>
                      {inst.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.institute_name && formik.errors.institute_name && (
                  <FormHelperText>{formik.errors.institute_name}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                id="location_address"
                name="location_address"
                label="Адрес размещения"
                value={formik.values.location_address}
                onChange={formik.handleChange}
                error={formik.touched.location_address && Boolean(formik.errors.location_address)}
                helperText={formik.touched.location_address && formik.errors.location_address}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin="normal"
                id="floor"
                name="floor"
                label="Этаж"
                type="number"
                value={formik.values.floor}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.floor && Boolean(formik.errors.floor)}
                helperText={formik.touched.floor && formik.errors.floor}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin="normal"
                id="office"
                name="office"
                label="Кабинет"
                value={formik.values.office}
                onChange={formik.handleChange}
                error={formik.touched.office && Boolean(formik.errors.office)}
                helperText={formik.touched.office && formik.errors.office}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                id="domain"
                name="domain"
                label="Домен"
                value={formik.values.domain}
                onChange={formik.handleChange}
                error={formik.touched.domain && Boolean(formik.errors.domain)}
                helperText={formik.touched.domain && formik.errors.domain}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                id="operating_system"
                name="operating_system"
                label="Операционная система"
                value={formik.values.operating_system}
                onChange={formik.handleChange}
                error={formik.touched.operating_system && Boolean(formik.errors.operating_system)}
                helperText={formik.touched.operating_system && formik.errors.operating_system}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                id="pc_owner"
                name="pc_owner"
                label="Пользователь компьютера"
                value={formik.values.pc_owner}
                onChange={formik.handleChange}
                error={formik.touched.pc_owner && Boolean(formik.errors.pc_owner)}
                helperText={formik.touched.pc_owner && formik.errors.pc_owner}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                id="pc_owner_position_at_work"
                name="pc_owner_position_at_work"
                label="Должность пользователя"
                value={formik.values.pc_owner_position_at_work}
                onChange={formik.handleChange}
                error={formik.touched.pc_owner_position_at_work && Boolean(formik.errors.pc_owner_position_at_work)}
                helperText={formik.touched.pc_owner_position_at_work && formik.errors.pc_owner_position_at_work}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.has_kaspersky}
                    onChange={formik.handleChange}
                    name="has_kaspersky"
                    color="primary"
                  />
                }
                label="Установлен Касперский"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                id="comment"
                name="comment"
                label="Комментарий"
                multiline
                rows={3}
                value={formik.values.comment}
                onChange={formik.handleChange}
                error={formik.touched.comment && Boolean(formik.errors.comment)}
                helperText={formik.touched.comment && formik.errors.comment}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Отмена
          </Button>
          <Button type="submit" color="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}