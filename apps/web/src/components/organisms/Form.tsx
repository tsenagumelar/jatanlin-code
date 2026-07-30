import React from 'react';
import { Button, Input } from '../atoms';
import { FormField } from '../molecules';

export interface FormProps {
  onSubmit?: (data: Record<string, string>) => void;
  onCancel?: () => void;
}

export const Form: React.FC<FormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <form style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px',
    }} onSubmit={handleSubmit}>
      <FormField label="Nama" required>
        <Input
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="Masukkan nama Anda"
          required
        />
      </FormField>

      <FormField label="Alamat Email" required>
        <Input
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          placeholder="Masukkan email Anda"
          required
        />
      </FormField>

      <FormField label="Pesan">
        <Input
          value={formData.message}
          onChange={handleChange('message')}
          placeholder="Masukkan pesan Anda"
        />
      </FormField>

      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '16px',
      }}>
        <Button variant="primary" type="submit">
          Kirim
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </form>
  );
};

export default Form;
