"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Profile } from "@/lib/types";
import styles from "./ProfileForm.module.css";

interface ProfileFormProps {
  initialData?: Profile;
  onSubmit: (data: Partial<Profile>) => Promise<void>;
  onCancel: () => void;
}

export default function ProfileForm({
  initialData,
  onSubmit,
  onCancel,
}: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [valuePropositions, setValuePropositions] = useState<string[]>(
    initialData?.valuePropositions || []
  );
  const [newValueProp, setNewValueProp] = useState("");
  const [uniqueSellingPoints, setUniqueSellingPoints] = useState<string[]>(
    initialData?.uniqueSellingPoints || []
  );
  const [newUSP, setNewUSP] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      personalInfo: {
        name: initialData?.personalInfo?.name || "",
        email: initialData?.personalInfo?.email || "",
        phone: initialData?.personalInfo?.phone || "",
        location: initialData?.personalInfo?.location || "",
        links: {
          portfolio: initialData?.personalInfo?.links?.portfolio || "",
          github: initialData?.personalInfo?.links?.github || "",
          linkedin: initialData?.personalInfo?.links?.linkedin || "",
          writingSamples: initialData?.personalInfo?.links?.writingSamples || "",
        },
      },
      positioning: {
        current: initialData?.positioning?.current || "",
        byRole: {
          technical_writer: initialData?.positioning?.byRole?.technical_writer || "",
          technical_writing_manager: initialData?.positioning?.byRole?.technical_writing_manager || "",
          software_engineer: initialData?.positioning?.byRole?.software_engineer || "",
          engineering_manager: initialData?.positioning?.byRole?.engineering_manager || "",
        },
      },
      professionalMission: initialData?.professionalMission || "",
    },
  });

  const onFormSubmit = async (data: any) => {
    setError("");
    setIsSubmitting(true);

    try {
      const profileData: Partial<Profile> = {
        personalInfo: data.personalInfo,
        positioning: data.positioning,
        valuePropositions,
        professionalMission: data.professionalMission || undefined,
        uniqueSellingPoints,
      };

      await onSubmit(profileData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save profile"
      );
      setIsSubmitting(false);
    }
  };

  const addValueProposition = () => {
    if (newValueProp.trim()) {
      setValuePropositions([...valuePropositions, newValueProp.trim()]);
      setNewValueProp("");
    }
  };

  const removeValueProposition = (index: number) => {
    setValuePropositions(valuePropositions.filter((_, i) => i !== index));
  };

  const addUniqueSellingPoint = () => {
    if (newUSP.trim()) {
      setUniqueSellingPoints([...uniqueSellingPoints, newUSP.trim()]);
      setNewUSP("");
    }
  };

  const removeUniqueSellingPoint = (index: number) => {
    setUniqueSellingPoints(uniqueSellingPoints.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      {/* Personal Information Section */}
      <section className={styles.section}>
        <h2>Personal Information</h2>

        <div className={styles.formGroup}>
          <label htmlFor="name">Full Name *</label>
          <input
            id="name"
            type="text"
            {...register("personalInfo.name", { required: "Name is required" })}
            className={errors.personalInfo?.name ? styles.inputError : ""}
          />
          {errors.personalInfo?.name && (
            <span className={styles.errorText}>
              {errors.personalInfo.name.message}
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            {...register("personalInfo.email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            className={errors.personalInfo?.email ? styles.inputError : ""}
          />
          {errors.personalInfo?.email && (
            <span className={styles.errorText}>
              {errors.personalInfo.email.message}
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            {...register("personalInfo.phone")}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            {...register("personalInfo.location")}
            placeholder="e.g., San Francisco, CA"
          />
        </div>

        <h3>Links</h3>

        <div className={styles.formGroup}>
          <label htmlFor="portfolio">Portfolio URL</label>
          <input
            id="portfolio"
            type="url"
            {...register("personalInfo.links.portfolio")}
            placeholder="https://"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="github">GitHub URL</label>
          <input
            id="github"
            type="url"
            {...register("personalInfo.links.github")}
            placeholder="https://github.com/"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="linkedin">LinkedIn URL</label>
          <input
            id="linkedin"
            type="url"
            {...register("personalInfo.links.linkedin")}
            placeholder="https://linkedin.com/in/"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="writingSamples">Writing Samples URL</label>
          <input
            id="writingSamples"
            type="url"
            {...register("personalInfo.links.writingSamples")}
            placeholder="https://"
          />
        </div>
      </section>

      {/* Positioning Section */}
      <section className={styles.section}>
        <h2>Professional Positioning</h2>

        <div className={styles.formGroup}>
          <label htmlFor="positioning-current">Current Positioning Statement</label>
          <textarea
            id="positioning-current"
            {...register("positioning.current")}
            rows={3}
            placeholder="Your current professional positioning..."
          />
        </div>

        <h3>Role-Specific Positioning</h3>

        <div className={styles.formGroup}>
          <label htmlFor="positioning-tw">Technical Writer</label>
          <textarea
            id="positioning-tw"
            {...register("positioning.byRole.technical_writer")}
            rows={2}
            placeholder="Your positioning as a technical writer..."
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="positioning-twm">Technical Writing Manager</label>
          <textarea
            id="positioning-twm"
            {...register("positioning.byRole.technical_writing_manager")}
            rows={2}
            placeholder="Your positioning as a technical writing manager..."
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="positioning-se">Software Engineer</label>
          <textarea
            id="positioning-se"
            {...register("positioning.byRole.software_engineer")}
            rows={2}
            placeholder="Your positioning as a software engineer..."
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="positioning-em">Engineering Manager</label>
          <textarea
            id="positioning-em"
            {...register("positioning.byRole.engineering_manager")}
            rows={2}
            placeholder="Your positioning as an engineering manager..."
          />
        </div>
      </section>

      {/* Value Propositions Section */}
      <section className={styles.section}>
        <h2>Value Propositions</h2>

        <div className={styles.arrayInput}>
          <input
            type="text"
            value={newValueProp}
            onChange={(e) => setNewValueProp(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addValueProposition();
              }
            }}
            placeholder="Add a value proposition..."
          />
          <button type="button" onClick={addValueProposition} className={styles.addBtn}>
            Add
          </button>
        </div>

        <div className={styles.listItems}>
          {valuePropositions.map((vp, index) => (
            <div key={index} className={styles.listItem}>
              <span>{vp}</span>
              <button
                type="button"
                onClick={() => removeValueProposition(index)}
                className={styles.removeBtn}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Professional Mission Section */}
      <section className={styles.section}>
        <h2>Professional Mission</h2>

        <div className={styles.formGroup}>
          <label htmlFor="professionalMission">Mission Statement</label>
          <textarea
            id="professionalMission"
            {...register("professionalMission")}
            rows={4}
            placeholder="Your professional mission statement..."
          />
        </div>
      </section>

      {/* Unique Selling Points Section */}
      <section className={styles.section}>
        <h2>Unique Selling Points</h2>

        <div className={styles.arrayInput}>
          <input
            type="text"
            value={newUSP}
            onChange={(e) => setNewUSP(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUniqueSellingPoint();
              }
            }}
            placeholder="Add a unique selling point..."
          />
          <button type="button" onClick={addUniqueSellingPoint} className={styles.addBtn}>
            Add
          </button>
        </div>

        <div className={styles.listItems}>
          {uniqueSellingPoints.map((usp, index) => (
            <div key={index} className={styles.listItem}>
              <span>{usp}</span>
              <button
                type="button"
                onClick={() => removeUniqueSellingPoint(index)}
                className={styles.removeBtn}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Form Actions */}
      <div className={styles.actions}>
        <button type="button" onClick={onCancel} className={styles.cancelBtn}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitBtn}
        >
          {isSubmitting ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}
