import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Modal from './Modal';
import type { UseMutationResult } from '@tanstack/react-query';
import type { RefundRequest } from '../api/types';
import './RefundModal.css';

interface RefundModalProps {
  open: boolean;
  onClose: () => void;
  refundMutation: UseMutationResult<any, Error, RefundRequest>;
}

const bankOptions = [
  'BCA',
  'Mandiri',
  'BRI',
  'BNI',
  'CIMB Niaga',
  'Danamon',
  'Permata',
  'OCBC NISP',
  'Maybank',
  'Panin',
  'BTN',
  'Mega',
  'Sinarmas',
  'Commonwealth',
  'Bukopin',
];

const RefundModal: React.FC<RefundModalProps> = ({ open, onClose, refundMutation }) => {
  const [formData, setFormData] = useState<RefundRequest>({
    acc_name: '',
    acc_no: '',
    bank: '',
  });
  const [confirmed, setConfirmed] = useState(false);
  const isSubmitting = refundMutation.status === 'pending';

  const isFormValid = useMemo(() => {
    return (
      formData.acc_name.trim().length > 0 &&
      formData.acc_no.trim().length > 0 &&
      formData.bank.trim().length > 0 &&
      confirmed
    );
  }, [formData, confirmed]);

  const handleChange = (field: keyof RefundRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isFormValid) {
      toast.warning('Mohon isi semua data dengan benar dan centang konfirmasi.', {
        position: 'bottom-right',
        autoClose: 2000,
        theme: 'dark',
      });
      return;
    }

    try {
      await refundMutation.mutateAsync(formData);
      toast.success('Refund success', {
        position: 'bottom-right',
        autoClose: 2000,
        theme: 'dark',
      });
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Gagal mengirim data refund.', {
        position: 'bottom-right',
        autoClose: 3000,
        theme: 'dark',
      });
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ acc_name: '', acc_no: '', bank: '' });
      setConfirmed(false);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose} maxWidth="420px">
      <div className="refund-modal">
        <h2>Refund</h2>
        <p className="refund-modal-note">
          Masukkan data rekening untuk pengembalian dana. Pastikan semua data sudah benar.
        </p>

        <form className="refund-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="acc_name">Nama Rekening</label>
            <input
              id="acc_name"
              type="text"
              value={formData.acc_name}
              onChange={(e) => handleChange('acc_name', e.target.value)}
              placeholder="John"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="acc_no">Nomor Rekening</label>
            <input
              id="acc_no"
              type="text"
              value={formData.acc_no}
              onChange={(e) => handleChange('acc_no', e.target.value)}
              placeholder="1234-1234"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bank">Nama Bank</label>
            <select
              id="bank"
              value={formData.bank}
              onChange={(e) => handleChange('bank', e.target.value)}
              required
            >
              <option value="">Pilih bank</option>
              {bankOptions.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group refund-checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              Saya telah mengisi data dengan sadar dan benar.
            </label>
          </div>

          <button type="submit" className="save-btn" disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? 'Mengirim...' : 'Kirim Refund'}
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default RefundModal;
