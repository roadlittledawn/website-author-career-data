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
  const [targetRoles, setTargetRoles] = useState<string[]>(
    initialData?.positioning?.targetRoles || []
  );
  const [newRole, setNewRole] = useState("");
  const [targetIndustries, setTargetIndustries] = useState<string[]>(
    initialData?.positioning?.targetIndustries || []
  );
  const [newIndustry, setNewIndustry] = useState("");

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
        headline: initialData?.positioning?.headline || "",
        summary: initialData?.positioning?.summary || "",
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
        positioning: {
          headline: data.positioning.headline,
          summary: data.positioning.summary,
          targetRoles,
          targetIndustries,
        },
        valuePropositions,
        professionalMission: data.professionalMission || "",
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

  const addTargetRole = () => {
    if (newRole.trim()) {
      setTargetRoles([...targetRoles, newRole.trim()]);
      setNewRole("");
    }
  };

  const removeTargetRole = (index: number) => {
    setTargetRoles(targetRoles.filter((_, i) => i !== index));
  };

  const addTargetIndustry = () => {
    if (newIndustry.trim()) {
      setTargetIndustries([...targetIndustries, newIndustry.trim()]);
      setNewIndustry("");
    }
  };

  const removeTargetIndustry = (index: number) => {
    setTargetIndustries(targetIndustries.filter((_, i) => i !== index));
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
          <label htmlFor="positioning-headline">Headline *</label>
          <input
            id="positioning-headline"
            type="text"
            {...register("positioning.headline", { required: "Headline is required" })}
            placeholder="e.g., Senior Technical Writer & Software Engineer"
            className={errors.positioning?.headline ? styles.inputError : ""}
          />
          {errors.positioning?.headline && (
            <span className={styles.errorText}>
              {errors.positioning.headline.message}
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="positioning-summary">Summary *</label>
          <textarea
            id="positioning-summary"
            {...register("positioning.summary", { required: "Summary is required" })}
            rows={4}
            placeholder="Your professional summary..."
            className={errors.positioning?.summary ? styles.inputError : ""}
          />
          {errors.positioning?.summary && (
            <span className={styles.errorText}>
              {errors.positioning.summary.message}
            </span>
          )}
        </div>

        <h3>Target Roles</h3>
        <div className={styles.arrayInput}>
          <input
            type="text"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTargetRole();
              }
            }}
            placeholder="Add a target role..."
          />
          <button type="button" onClick={addTargetRole} className={styles.addBtn}>
            Add
          </button>
        </div>

        <div className={styles.listItems}>
          {targetRoles.map((role, index) => (
            <div key={index} className={styles.listItem}>
              <span>{role}</span>
              <button
                type="button"
                onClick={() => removeTargetRole(index)}
                className={styles.removeBtn}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <h3>Target Industries</h3>
        <div className={styles.arrayInput}>
          <input
            type="text"
            value={newIndustry}
            onChange={(e) => setNewIndustry(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTargetIndustry();
              }
            }}
            placeholder="Add a target industry..."
          />
          <button type="button" onClick={addTargetIndustry} className={styles.addBtn}>
            Add
          </button>
        </div>

        <div className={styles.listItems}>
          {targetIndustries.map((industry, index) => (
            <div key={index} className={styles.listItem}>
              <span>{industry}</span>
              <button
                type="button"
                onClick={() => removeTargetIndustry(index)}
                className={styles.removeBtn}
              >
                Remove
              </button>
            </div>
          ))}
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
