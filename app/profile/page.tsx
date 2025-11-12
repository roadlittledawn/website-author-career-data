'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Profile } from '@/lib/types';
import { profileApi } from '@/lib/api';
import styles from './profile.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await profileApi.get();
      setProfile(data.profile);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to reset your profile? This action cannot be undone.')) {
      return;
    }

    try {
      await profileApi.delete();
      router.refresh();
      fetchProfile();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete profile');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>No profile found</p>
          <Link href="/profile/edit">Create your profile</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Professional Profile</h1>
          <p>Your career data and professional positioning</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/profile/edit" className={styles.editBtn}>
            Edit Profile
          </Link>
          <button onClick={handleDelete} className={styles.deleteBtn}>
            Reset Profile
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <section className={styles.section}>
        <h2>Personal Information</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>Name</label>
            <p>{profile.personalInfo.name || '—'}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Email</label>
            <p>{profile.personalInfo.email || '—'}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Phone</label>
            <p>{profile.personalInfo.phone || '—'}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Location</label>
            <p>{profile.personalInfo.location || '—'}</p>
          </div>
        </div>

        {(profile.personalInfo.links?.portfolio ||
          profile.personalInfo.links?.github ||
          profile.personalInfo.links?.linkedin ||
          profile.personalInfo.links?.writingSamples) && (
          <>
            <h3>Links</h3>
            <div className={styles.links}>
              {profile.personalInfo.links.portfolio && (
                <a
                  href={profile.personalInfo.links.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  Portfolio
                </a>
              )}
              {profile.personalInfo.links.github && (
                <a
                  href={profile.personalInfo.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  GitHub
                </a>
              )}
              {profile.personalInfo.links.linkedin && (
                <a
                  href={profile.personalInfo.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  LinkedIn
                </a>
              )}
              {profile.personalInfo.links.writingSamples && (
                <a
                  href={profile.personalInfo.links.writingSamples}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  Writing Samples
                </a>
              )}
            </div>
          </>
        )}
      </section>

      {/* Positioning */}
      <section className={styles.section}>
        <h2>Professional Positioning</h2>

        {profile.positioning.current && (
          <div className={styles.positioningCurrent}>
            <label>Current Positioning</label>
            <p>{profile.positioning.current}</p>
          </div>
        )}

        {(profile.positioning.byRole?.technical_writer ||
          profile.positioning.byRole?.technical_writing_manager ||
          profile.positioning.byRole?.software_engineer ||
          profile.positioning.byRole?.engineering_manager) && (
          <>
            <h3>Role-Specific Positioning</h3>
            <div className={styles.rolePositioning}>
              {profile.positioning.byRole.technical_writer && (
                <div className={styles.roleItem}>
                  <label>Technical Writer</label>
                  <p>{profile.positioning.byRole.technical_writer}</p>
                </div>
              )}
              {profile.positioning.byRole.technical_writing_manager && (
                <div className={styles.roleItem}>
                  <label>Technical Writing Manager</label>
                  <p>{profile.positioning.byRole.technical_writing_manager}</p>
                </div>
              )}
              {profile.positioning.byRole.software_engineer && (
                <div className={styles.roleItem}>
                  <label>Software Engineer</label>
                  <p>{profile.positioning.byRole.software_engineer}</p>
                </div>
              )}
              {profile.positioning.byRole.engineering_manager && (
                <div className={styles.roleItem}>
                  <label>Engineering Manager</label>
                  <p>{profile.positioning.byRole.engineering_manager}</p>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Value Propositions */}
      {profile.valuePropositions && profile.valuePropositions.length > 0 && (
        <section className={styles.section}>
          <h2>Value Propositions</h2>
          <ul className={styles.list}>
            {profile.valuePropositions.map((vp, index) => (
              <li key={index}>{vp}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Professional Mission */}
      {profile.professionalMission && (
        <section className={styles.section}>
          <h2>Professional Mission</h2>
          <p className={styles.mission}>{profile.professionalMission}</p>
        </section>
      )}

      {/* Unique Selling Points */}
      {profile.uniqueSellingPoints && profile.uniqueSellingPoints.length > 0 && (
        <section className={styles.section}>
          <h2>Unique Selling Points</h2>
          <ul className={styles.list}>
            {profile.uniqueSellingPoints.map((usp, index) => (
              <li key={index}>{usp}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Metadata */}
      <div className={styles.metadata}>
        <p>
          Last updated: {new Date(profile.lastUpdated).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
}
