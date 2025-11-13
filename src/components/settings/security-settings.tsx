'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Key, 
  Smartphone, 
  LogOut, 
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Chrome,
  Monitor
} from 'lucide-react';

export function SecuritySettings() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const isEmailAuth = userProfile?.authProvider === 'email';
  const isSocialAuth = userProfile?.authProvider === 'google' || userProfile?.authProvider === 'github';

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isEmailAuth) return;

    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Re-authenticate user before password change
      if (user.email) {
        const credential = EmailAuthProvider.credential(
          user.email,
          passwordForm.currentPassword
        );
        await reauthenticateWithCredential(user, credential);
      }

      // Update password
      await updatePassword(user, passwordForm.newPassword);

      setSuccess('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        setError('Current password is incorrect');
      } else {
        setError(err.message || 'Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Change Section */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Change Password</h2>
              <p className="text-sm text-muted-foreground">
                {isEmailAuth 
                  ? 'Update your password to keep your account secure'
                  : 'Password management is handled by your authentication provider'}
              </p>
            </div>
          </div>
        </div>

        {isEmailAuth ? (
          <form onSubmit={handlePasswordChange} className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Enter new password"
                required
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 6 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                {success}
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Authentication via {userProfile?.authProvider}
                  </p>
                  <p className="mt-1 text-xs text-blue-800 dark:text-blue-200">
                    Your password is managed by your {userProfile?.authProvider} account. 
                    Visit your {userProfile?.authProvider} account settings to change your password.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Connected Accounts */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Connected Accounts</h2>
          <p className="text-sm text-muted-foreground">
            Manage your authentication providers
          </p>
        </div>

        <div className="divide-y p-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">Google</p>
                <p className="text-sm text-muted-foreground">
                  {userProfile?.authProvider === 'google' ? user?.email : 'Not connected'}
                </p>
              </div>
            </div>
            {userProfile?.authProvider === 'google' ? (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                Connected
              </div>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Connect
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">GitHub</p>
                <p className="text-sm text-muted-foreground">
                  {userProfile?.authProvider === 'github' ? user?.email : 'Not connected'}
                </p>
              </div>
            </div>
            {userProfile?.authProvider === 'github' ? (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                Connected
              </div>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Connect
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Email/Password</p>
                <p className="text-sm text-muted-foreground">
                  {userProfile?.authProvider === 'email' ? user?.email : 'Not connected'}
                </p>
              </div>
            </div>
            {userProfile?.authProvider === 'email' ? (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                Connected
              </div>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Connect
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Active Sessions</h2>
          <p className="text-sm text-muted-foreground">
            Manage devices where you're currently logged in
          </p>
        </div>

        <div className="divide-y p-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
                <Monitor className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Current Device</p>
                <p className="text-sm text-muted-foreground">
                  {typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac') ? 'macOS' : 'Unknown'} • 
                  Active now
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              Active
            </div>
          </div>
        </div>

        <div className="border-t p-6">
          <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
            <LogOut className="h-4 w-4" />
            Sign out of all other sessions
          </Button>
        </div>
      </div>

      {/* Two-Factor Authentication (Coming Soon) */}
      <div className="rounded-lg border bg-card opacity-60">
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <div className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
              Coming Soon
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            Two-factor authentication will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}
