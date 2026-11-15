'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, CheckCircle2, AlertCircle, ImageOff } from 'lucide-react';
import type { StoreProfileSettings, SocialLinks } from '../../types/settings.types';
import {
  useStoreProfileQuery,
  useUpdateSettingsMutation,
  useUploadLogoMutation,
  useUploadFaviconMutation,
} from '../../hooks/use-settings-queries';
import { useDirtyFormGuard } from '@/lib/crud/use-dirty-form-guard';
import { usePermissions } from '@/hooks/use-permissions';

export function StoreProfileForm() {
  const { data: profile, isLoading } = useStoreProfileQuery();
  const updateMutation = useUpdateSettingsMutation<StoreProfileSettings>('store_profile');
  const uploadLogoMutation = useUploadLogoMutation();
  const uploadFaviconMutation = useUploadFaviconMutation();

  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission('settings:update');

  const [storeName, setStoreName] = useState('');
  const [tagline, setTagline] = useState('');
  const [logo, setLogo] = useState('');
  const [favicon, setFavicon] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [businessRegistration, setBusinessRegistration] = useState('');
  const [bin, setBin] = useState('');
  const [vat, setVat] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook: '',
    instagram: '',
    youtube: '',
    twitter: '',
    tiktok: '',
  });

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setStoreName(profile.storeName || '');
      setTagline(profile.tagline || '');
      setLogo(profile.logo || '');
      setFavicon(profile.favicon || '');
      setPhone(profile.phone || '');
      setEmail(profile.email || '');
      setAddress(profile.address || '');
      setBusinessRegistration(profile.businessRegistration || '');
      setBin(profile.bin || '');
      setVat(profile.vat || '');
      setSocialLinks(profile.socialLinks || {});
    }
  }, [profile]);

  const isDirty = Boolean(
    profile &&
      (storeName !== (profile.storeName || '') ||
        tagline !== (profile.tagline || '') ||
        phone !== (profile.phone || '') ||
        email !== (profile.email || '') ||
        address !== (profile.address || '') ||
        businessRegistration !== (profile.businessRegistration || '') ||
        bin !== (profile.bin || '') ||
        vat !== (profile.vat || ''))
  );
  useDirtyFormGuard(isDirty && !updateMutation.isPending);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatusMsg(null);
    try {
      const url = await uploadLogoMutation.mutateAsync(file);
      setLogo(url);
      setStatusMsg({ type: 'success', text: 'Store logo uploaded successfully.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Logo upload failed';
      setStatusMsg({ type: 'error', text: msg });
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatusMsg(null);
    try {
      const url = await uploadFaviconMutation.mutateAsync(file);
      setFavicon(url);
      setStatusMsg({ type: 'success', text: 'Favicon uploaded successfully.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Favicon upload failed';
      setStatusMsg({ type: 'error', text: msg });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (storeName.trim().length < 2) {
      setStatusMsg({ type: 'error', text: 'Store name must be at least 2 characters.' });
      return;
    }
    if (!email.includes('@')) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid store email address.' });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        storeName: storeName.trim(),
        tagline: tagline.trim() || undefined,
        logo: logo || undefined,
        favicon: favicon || undefined,
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        businessRegistration: businessRegistration.trim() || undefined,
        bin: bin.trim() || undefined,
        vat: vat.trim() || undefined,
        socialLinks,
      });
      setStatusMsg({ type: 'success', text: 'Store profile settings saved successfully.' });
    } catch (err: unknown) {
      let msg = 'Failed to save store profile';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setStatusMsg({ type: 'error', text: msg });
    }
  };

  if (isLoading) {
    return <div className="h-64 rounded-2xl border border-border bg-card p-6 animate-pulse" />;
  }

  const isCloudinaryLogo = logo && logo.startsWith('https://res.cloudinary.com/');
  const isCloudinaryFavicon = favicon && favicon.startsWith('https://res.cloudinary.com/');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {statusMsg && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-3 text-xs ${
            statusMsg.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
              : 'border-destructive/20 bg-destructive/10 text-destructive'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Visual Identity / Logo & Favicon Uploads */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Brand Assets (Logo & Favicon)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Card */}
          <div className="rounded-xl border border-border/80 bg-background/50 p-4 space-y-3">
            <Label className="text-xs font-semibold">Storefront Main Logo</Label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-24 relative rounded-lg border border-border bg-muted/40 flex items-center justify-center overflow-hidden shrink-0">
                {isCloudinaryLogo ? (
                  <Image src={logo} alt="Store logo" fill className="object-contain p-1" />
                ) : (
                  <ImageOff className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-[11px] text-muted-foreground">Recommended: Transparent PNG or WebP, 300x80px.</p>
                {canUpdate && (
                  <label className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium hover:bg-muted cursor-pointer transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{uploadLogoMutation.isPending ? 'Uploading...' : 'Upload New Logo'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleLogoUpload}
                      disabled={uploadLogoMutation.isPending}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Favicon Card */}
          <div className="rounded-xl border border-border/80 bg-background/50 p-4 space-y-3">
            <Label className="text-xs font-semibold">Browser Favicon</Label>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 relative rounded-lg border border-border bg-muted/40 flex items-center justify-center overflow-hidden shrink-0">
                {isCloudinaryFavicon ? (
                  <Image src={favicon} alt="Favicon" fill className="object-contain p-1" />
                ) : (
                  <ImageOff className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-[11px] text-muted-foreground">Browser tab icon (ICO, PNG, 32x32px or 64x64px).</p>
                {canUpdate && (
                  <label className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium hover:bg-muted cursor-pointer transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{uploadFaviconMutation.isPending ? 'Uploading...' : 'Upload Favicon'}</span>
                    <input
                      type="file"
                      accept="image/x-icon,image/png,image/webp"
                      onChange={handleFaviconUpload}
                      disabled={uploadFaviconMutation.isPending}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* General Store Information */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          General Store Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="storeName" className="text-xs">Store Name *</Label>
            <Input
              id="storeName"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              disabled={!canUpdate}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tagline" className="text-xs">Tagline / Motto</Label>
            <Input
              id="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              disabled={!canUpdate}
              placeholder="e.g. Elegance in Every Thread"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs">Official Contact Phone *</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!canUpdate}
              placeholder="+880 1700 000000"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">Official Support Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!canUpdate}
              placeholder="support@diano.com"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="address" className="text-xs">Physical Showroom / Headquarters Address *</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!canUpdate}
              placeholder="Banani, Road 11, Dhaka 1213, Bangladesh"
              className="h-9 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Statutory / Tax Registration in Bangladesh */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tax & Legal Registration (Bangladesh)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="businessRegistration" className="text-xs">Trade License / Reg No.</Label>
            <Input
              id="businessRegistration"
              value={businessRegistration}
              onChange={(e) => setBusinessRegistration(e.target.value)}
              disabled={!canUpdate}
              placeholder="TRAD/DNCC/123456/2026"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bin" className="text-xs">Business Identification Number (BIN)</Label>
            <Input
              id="bin"
              value={bin}
              onChange={(e) => setBin(e.target.value)}
              disabled={!canUpdate}
              placeholder="001234567-0101"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vat" className="text-xs">VAT / Tax Identification</Label>
            <Input
              id="vat"
              value={vat}
              onChange={(e) => setVat(e.target.value)}
              disabled={!canUpdate}
              placeholder="VAT-REG-987654"
              className="h-9 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Social Media Channels
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="social-fb" className="text-xs">Facebook Page URL</Label>
            <Input
              id="social-fb"
              value={socialLinks.facebook || ''}
              onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
              disabled={!canUpdate}
              placeholder="https://facebook.com/dianobd"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="social-insta" className="text-xs">Instagram Profile URL</Label>
            <Input
              id="social-insta"
              value={socialLinks.instagram || ''}
              onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
              disabled={!canUpdate}
              placeholder="https://instagram.com/dianobd"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="social-yt" className="text-xs">YouTube Channel URL</Label>
            <Input
              id="social-yt"
              value={socialLinks.youtube || ''}
              onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
              disabled={!canUpdate}
              placeholder="https://youtube.com/@dianobd"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="social-tiktok" className="text-xs">TikTok Profile URL</Label>
            <Input
              id="social-tiktok"
              value={socialLinks.tiktok || ''}
              onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
              disabled={!canUpdate}
              placeholder="https://tiktok.com/@dianobd"
              className="h-9 text-xs"
            />
          </div>
        </div>
      </div>

      {canUpdate && (
        <div className="flex items-center justify-end">
          <Button type="submit" size="sm" disabled={updateMutation.isPending} className="cursor-pointer">
            {updateMutation.isPending ? 'Saving Settings...' : 'Save Profile Settings'}
          </Button>
        </div>
      )}
    </form>
  );
}
