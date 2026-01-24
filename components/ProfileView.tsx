'use client';

import Link from 'next/link';
import type { Profile } from '@/lib/types';
import styles from '@/app/profile/profile.module.css';

interface ProfileViewProps {
  profile: Profile | null;
}

export function ProfileView({ profile }: ProfileViewProps) {
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to reset your profile? This action cannot be undone.')) {
      return;
    }
    alert('Profile reset not available. Please edit the profile instead.');
  };

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

        <div className={styles.infoItem}>
          <label>Current Positioning</label>
          <p style={{ whiteSpace: 'pre-wrap' }}>{profile.positioning?.current || '—'}</p>
        </div>

        {profile.positioning?.byRole && Object.keys(profile.positioning.byRole).length > 0 && (
          <div className={styles.infoItem}>
            <label>Role-Specific Positioning</label>
            <div className={styles.rolePositioning}>
              {Object.entries(profile.positioning.byRole).map(([roleType, positioning]) => (
                <div key={roleType} className={styles.roleItem}>
                  <strong>{roleType}:</strong>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{positioning}</p>
                </div>
              ))}
            </div>
          </div>
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
          Last updated: {new Date(profile.updatedAt).toLocaleDateString('en-US', {
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
