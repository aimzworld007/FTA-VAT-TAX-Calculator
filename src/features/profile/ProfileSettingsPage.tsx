import React from 'react';
import { Alert, Box, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useAuth } from '../../modules/auth/AuthContext';

export function ProfileSettingsPage() {
  const { user, refreshUser, updateProfile, changePassword, loading } = useAuth();
  const [profile, setProfile] = React.useState({ fullName: '', phone: '', address: '' });
  const [password, setPassword] = React.useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notice, setNotice] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  React.useEffect(() => {
    setProfile({ fullName: user?.fullName || '', phone: user?.phone || '', address: user?.address || '' });
  }, [user?.fullName, user?.phone, user?.address]);

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateProfile(profile);
    if (result.ok) setNotice({ type: 'success', text: 'Profile updated successfully.' });
    else setNotice({ type: 'error', text: result.error || 'Failed to update profile.' });
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      setNotice({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    const result = await changePassword(password.currentPassword, password.newPassword);
    if (result.ok) {
      setNotice({ type: 'success', text: 'Password changed successfully.' });
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else setNotice({ type: 'error', text: result.error || 'Failed to change password.' });
  };

  return <DashboardLayout><Stack spacing={2.5}>
    <Box>
      <Typography variant='h4' sx={{ fontWeight: 700 }}>Profile & Settings</Typography>
      <Typography color='text.secondary'>Manage your account profile and password security.</Typography>
    </Box>
    {notice && <Alert severity={notice.type}>{notice.text}</Alert>}
    <Grid container spacing={2.2}>
      <Grid item xs={12} md={4}>
        <Card variant='outlined'><CardContent><Stack spacing={1}><Typography variant='h6'>Account Info</Typography><Typography><b>Email:</b> {user?.email || '-'}</Typography><Typography><b>Role:</b> {user?.role || '-'}</Typography><Typography><b>Status:</b> {user?.isActive ? 'Active' : 'Disabled'}</Typography></Stack></CardContent></Card>
      </Grid>
      <Grid item xs={12} md={8}>
        <Card variant='outlined'><CardContent><Stack component='form' onSubmit={onSaveProfile} spacing={1.4}><Typography variant='h6'>Profile Details</Typography><TextField label='Full Name' required value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} /><TextField label='Phone' value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /><TextField label='Address' multiline minRows={3} value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} /><Button type='submit' variant='contained' disabled={loading}>Save Profile</Button></Stack></CardContent></Card>
      </Grid>
      <Grid item xs={12}>
        <Card variant='outlined'><CardContent><Stack component='form' onSubmit={onChangePassword} spacing={1.4}><Typography variant='h6'>Security: Change Password</Typography><TextField label='Current Password' type='password' required value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} /><TextField label='New Password' type='password' required helperText='Minimum 8 characters' value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} /><TextField label='Confirm New Password' type='password' required value={password.confirmPassword} onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })} /><Button type='submit' variant='contained' disabled={loading}>Change Password</Button></Stack></CardContent></Card>
      </Grid>
    </Grid>
  </Stack></DashboardLayout>;
}
