'use client';

import { useRouter } from 'next/navigation';
import ProfileForm from '@/components/ProfileForm';
import type { Profile } from '@/lib/types';
import styles from '@/app/profile/edit/edit.module.css';
import { updateProfile } from '@/app/profile/actions';

interface ProfileEditFormProps {
  profile: Profile | null;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();

  const handleSubmit = async (data: Partial<Profile>) => {
    await updateProfile(data);
    router.push('/profile');
  };

  const handleCancel = () => {
    router.push('/profile');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Edit Profile</h1>
        <p>Update your professional information and positioning</p>
      </div>

      <ProfileForm
        initialData={profile || undefined}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
