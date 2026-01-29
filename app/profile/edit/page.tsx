import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import type { Profile } from '@/lib/types';
import { ProfileEditForm } from '@/components/ProfileEditForm';

const PROFILE_QUERY = gql`
  query GetProfile {
    profile {
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

export default async function EditProfilePage() {
  try {
    const { profile } = await graphqlClient.request<{ profile: Profile | null }>(PROFILE_QUERY);
    return <ProfileEditForm profile={profile} />;
  } catch {
    return <ProfileEditForm profile={null} />;
  }
}
