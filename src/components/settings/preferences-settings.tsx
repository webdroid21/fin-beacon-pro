'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updateUserProfile } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Settings2, Bell, FileText } from 'lucide-react';

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2025)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2025)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2025-12-31)' },
];

const PAYMENT_METHODS = [
  { value: 'bank transfer', label: 'Bank Transfer' },
  { value: 'mobile money', label: 'Mobile Money' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'check', label: 'Check' },
];

export function PreferencesSettings() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    theme: userProfile?.settings?.theme || 'system',
    dateFormat: userProfile?.settings?.dateFormat || 'DD/MM/YYYY',
    defaultPaymentMethod: userProfile?.settings?.defaultPaymentMethod || 'bank transfer',
    defaultInvoicePrefix: userProfile?.settings?.defaultInvoicePrefix || 'INV-',
    autoGenerateInvoiceNumbers: userProfile?.settings?.autoGenerateInvoiceNumbers ?? true,
    emailNotifications: userProfile?.settings?.notifications?.email ?? false,
    smsNotifications: userProfile?.settings?.notifications?.sms ?? false,
    inAppNotifications: userProfile?.settings?.notifications?.inApp ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await updateUserProfile(user.uid, {
        'settings.theme': formData.theme,
        'settings.dateFormat': formData.dateFormat,
        'settings.defaultPaymentMethod': formData.defaultPaymentMethod,
        'settings.defaultInvoicePrefix': formData.defaultInvoicePrefix,
        'settings.autoGenerateInvoiceNumbers': formData.autoGenerateInvoiceNumbers,
        'settings.notifications': {
          email: formData.emailNotifications,
          sms: formData.smsNotifications,
          inApp: formData.inAppNotifications,
        },
        updatedAt: new Date().toISOString(),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Appearance</h2>
              <p className="text-sm text-muted-foreground">
                Customize how the app looks and feels
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={formData.theme} onValueChange={(value) => setFormData({ ...formData, theme: value as "light" | "dark" | "system" })}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose your preferred color scheme
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFormat">Date Format</Label>
            <Select value={formData.dateFormat} onValueChange={(value) => setFormData({ ...formData, dateFormat: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How dates will be displayed throughout the app
            </p>
          </div>
        </form>
      </div>

      {/* Invoice Settings */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Invoice Defaults</h2>
              <p className="text-sm text-muted-foreground">
                Set default values for new invoices
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
            <Input
              id="invoicePrefix"
              value={formData.defaultInvoicePrefix}
              onChange={(e) => setFormData({ ...formData, defaultInvoicePrefix: e.target.value })}
              placeholder="INV-"
            />
            <p className="text-xs text-muted-foreground">
              Prefix for invoice numbers (e.g., INV-001, INV-002)
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="autoGenerate">Auto-generate Invoice Numbers</Label>
              <p className="text-sm text-muted-foreground">
                Automatically generate sequential invoice numbers
              </p>
            </div>
            <Switch
              id="autoGenerate"
              checked={formData.autoGenerateInvoiceNumbers}
              onCheckedChange={(checked) => setFormData({ ...formData, autoGenerateInvoiceNumbers: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Default Payment Method</Label>
            <Select 
              value={formData.defaultPaymentMethod} 
              onValueChange={(value) => setFormData({ ...formData, defaultPaymentMethod: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Default payment method for new invoices
            </p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Notifications</h2>
              <p className="text-sm text-muted-foreground">
                Manage how you receive notifications
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotif">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates via email
              </p>
            </div>
            <Switch
              id="emailNotif"
              checked={formData.emailNotifications}
              onCheckedChange={(checked) => setFormData({ ...formData, emailNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="smsNotif">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates via SMS
              </p>
            </div>
            <Switch
              id="smsNotif"
              checked={formData.smsNotifications}
              onCheckedChange={(checked) => setFormData({ ...formData, smsNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="inAppNotif">In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">
                See notifications in the dashboard
              </p>
            </div>
            <Switch
              id="inAppNotif"
              checked={formData.inAppNotifications}
              onCheckedChange={(checked) => setFormData({ ...formData, inAppNotifications: checked })}
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
          Preferences updated successfully!
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-6">
        <Button type="button" variant="ghost">
          Reset to Defaults
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save All Changes
        </Button>
      </div>
    </div>
  );
}
