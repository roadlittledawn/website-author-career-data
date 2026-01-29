'use client';

import { useRouter } from 'next/navigation';
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import ProfileForm from '@/components/ProfileForm';
import type { Profile } from '@/lib/types';
import styles from '@/app/profile/edit/edit.module.css';

const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: ProfileInput!) {
    updateProfile(input: $input) {
      id
      personalInfo {
        name
        email
        phone
        location
        links {
          portfolio
          github
          linkedin
          writingSamples
        }
      }
      positioning {
        current
        byRole {
          technical_writer
          technical_writing_manager
          software_engineer
          engineering_manager
        }
      }
      valuePropositions
      professionalMission
      uniqueSellingPoints
    }
  }
`;

interface ProfileEditFormProps {
  profile: Profile | null;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();

  const handleSubmit = async (data: Partial<Profile>) => {
    await graphqlClient.request(UPDATE_PROFILE_MUTATION, { input: data });
    router.refresh();
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
