'use server';

import { revalidatePath } from 'next/cache';
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import type { Profile } from '@/lib/types';

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

export async function updateProfile(input: Partial<Profile>) {
  const result = await graphqlClient.request<{ updateProfile: Profile }>(
    UPDATE_PROFILE_MUTATION,
    { input }
  );

  revalidatePath('/profile');
  revalidatePath('/profile/edit');

  return result.updateProfile;
}
