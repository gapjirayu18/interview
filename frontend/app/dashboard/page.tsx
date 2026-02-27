'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { appointmentApi, Appointment, AppointmentCreate } from '@/lib/api';
import { removeToken, isAuthenticated } from '@/lib/auth';
import { se } from 'date-fns/locale';

export default function DashboardPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AppointmentCreate>({
    startime: '',
    endtime: '',
    purpose: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/signin');
      return;
    }
    fetchAppointments();
  }, [router]);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentApi.getAll();
      setAppointments(data);
      setError('');
    } catch (err: any) {
      if (err.response?.status === 401) {
        removeToken();
        router.push('/signin');
      } else {
        setError('Failed to load appointments');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        await appointmentApi.update(editingId, formData);
      } else {
        await appointmentApi.create(formData);
      }
      setFormData({ startime: '', endtime: '', purpose: '' });
      setShowForm(false);
      setEditingId(null);
      fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save appointment');
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingId(appointment.id);
    setFormData({
      startime: appointment.startime.slice(0, 16),
      endtime: appointment.endtime.slice(0, 16),
      purpose: appointment.purpose,
    });
    setShowForm(true);
  };

  const handleLogout = () => {
    removeToken();
    router.push('/signin');
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <button onClick={handleLogout} className="bg-gray-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 mb-4">{error}</div>}

      <button onClick={() => setShowForm(!showForm)} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
        {showForm ? 'Cancel' : 'New Appointment'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-300 rounded">
          <h2 className="font-bold mb-2">{editingId ? 'Edit' : 'Create'} Appointment</h2>
          <div className="space-y-2">
            <div>
              <label className="block">Start Time</label>
              <input
                type="datetime-local"
                required
                value={formData.startime}
                onChange={(e) => setFormData({ ...formData, startime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block">End Time</label>
              <input
                type="datetime-local"
                required
                value={formData.endtime}
                onChange={(e) => setFormData({ ...formData, endtime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block">Purpose</label>
              <input
                type="text"
                required
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      )}

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-600">
            <th className="px-4 py-2">Purpose</th>
            <th className="px-4 py-2">Username</th>
            <th className="px-4 py-2">Start</th>
            <th className="px-4 py-2">End</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt) => (
            <tr key={apt.id}>
              <td className="border border-gray-300 px-4 py-2">{apt.purpose}</td>
              <td className="border border-gray-300 px-4 py-2">{apt.username}</td>
              <td className="border border-gray-300 px-4 py-2">{new Date(apt.startime).toLocaleString('en-GB', {hour12: false, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</td>
              <td className="border border-gray-300 px-4 py-2">{new Date(apt.endtime).toLocaleString('en-GB', {hour12: false, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button onClick={() => handleEdit(apt)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
