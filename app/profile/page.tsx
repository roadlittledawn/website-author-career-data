import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import type { Profile } from '@/lib/types';
import { ProfileView } from '@/components/ProfileView';

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

export default async function ProfilePage() {
  try {
    const { profile } = await graphqlClient.request<{ profile: Profile | null }>(PROFILE_QUERY);
    return <ProfileView profile={profile} />;
  } catch (error) {
    console.error('Profile fetch error:', error);
    return <ProfileView profile={null} />;
  }
}
