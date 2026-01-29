"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Skill } from "@/lib/types";
import styles from "./SkillsForm.module.css";

interface SkillsFormProps {
  initialData?: Skill;
  onSubmit: (data: Partial<Skill>) => Promise<void>;
  onCancel: () => void;
}

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

const ROLE_RELEVANCE_OPTIONS = [
  { value: "engineering", label: "Engineering" },
  { value: "technical_writing", label: "Technical Writing" },
  { value: "management", label: "Management" },
  { value: "design", label: "Design" },
];

export default function SkillsForm({
  initialData,
  onSubmit,
  onCancel,
}: SkillsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [keywords, setKeywords] = useState<string[]>(initialData?.keywords || []);
  const [newKeyword, setNewKeyword] = useState("");
  const [roleRelevance, setRoleRelevance] = useState<string[]>(initialData?.roleRelevance || []);
  const [featured, setFeatured] = useState<boolean>(initialData?.featured || false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name || "",
      level: initialData?.level || "",
      rating: initialData?.rating || 3,
      yearsOfExperience: initialData?.yearsOfExperience || 0,
      iconName: initialData?.iconName || "",
    },
  });

  const onFormSubmit = async (data: any) => {
    setError("");
    setIsSubmitting(true);

    try {
      const skillData: Partial<Skill> = {
        name: data.name,
        roleRelevance: roleRelevance,
        level: data.level,
        rating: parseInt(data.rating),
        yearsOfExperience: parseInt(data.yearsOfExperience) || 0,
        tags: tags,
        iconName: data.iconName || undefined,
        keywords: keywords,
        featured: featured,
      };

      await onSubmit(skillData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save skill"
      );
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const toggleRole = (roleValue: string) => {
    setRoleRelevance(prev =>
      prev.includes(roleValue)
        ? prev.filter(r => r !== roleValue)
        : [...prev, roleValue]
    );
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      {/* Basic Information Section */}
      <section className={styles.section}>
        <h2>Basic Information</h2>

        <div className={styles.field}>
          <label htmlFor="name">
            Skill Name <span className={styles.required}>*</span>
          </label>
          <input
            id="name"
            type="text"
            {...register("name", { required: "Skill name is required" })}
            placeholder="e.g., React.js, Python, Technical Writing"
          />
          {errors.name && (
            <span className={styles.fieldError}>{errors.name.message}</span>
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="level">
              Proficiency Level <span className={styles.required}>*</span>
            </label>
            <select
              id="level"
              {...register("level", { required: "Level is required" })}
            >
              <option value="">Select level...</option>
              {SKILL_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            {errors.level && (
              <span className={styles.fieldError}>{errors.level.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="rating">
              Rating (1-5) <span className={styles.required}>*</span>
            </label>
            <input
              id="rating"
              type="number"
              min="1"
              max="5"
              step="1"
              {...register("rating", {
                required: "Rating is required",
                min: { value: 1, message: "Rating must be at least 1" },
                max: { value: 5, message: "Rating cannot exceed 5" },
              })}
            />
            {errors.rating && (
              <span className={styles.fieldError}>{errors.rating.message}</span>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="yearsOfExperience">
            Years of Experience <span className={styles.required}>*</span>
          </label>
          <input
            id="yearsOfExperience"
            type="number"
            min="0"
            step="0.5"
            {...register("yearsOfExperience", {
              required: "Years of experience is required",
              min: { value: 0, message: "Cannot be negative" },
            })}
            placeholder="e.g., 3.5"
          />
          {errors.yearsOfExperience && (
            <span className={styles.fieldError}>
              {errors.yearsOfExperience.message}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="iconName">Icon Name</label>
          <input
            id="iconName"
            type="text"
            {...register("iconName")}
            placeholder="e.g., React, Python (optional)"
          />
          <small>Icon identifier for display purposes</small>
        </div>
      </section>

      {/* Role Relevance Section */}
      <section className={styles.section}>
        <h2>Role Relevance</h2>
        <p className={styles.sectionDesc}>
          Select which roles this skill is relevant for (select multiple)
        </p>

        <div className={styles.checkboxGroup}>
          {ROLE_RELEVANCE_OPTIONS.map((role) => (
            <label key={role.value} className={styles.checkbox}>
              <input
                type="checkbox"
                checked={roleRelevance.includes(role.value)}
                onChange={() => toggleRole(role.value)}
              />
              {role.label}
            </label>
          ))}
        </div>
      </section>

      {/* Featured Section */}
      <section className={styles.section}>
        <h2>Featured Skill</h2>
        <p className={styles.sectionDesc}>
          Featured skills appear on role-specific home pages (Technical Writing, Engineering) and represent your strongest or most relevant skills today.
        </p>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Mark as featured skill
        </label>
      </section>

      {/* Tags Section */}
      <section className={styles.section}>
        <h2>Tags</h2>
        <p className={styles.sectionDesc}>
          Add tags to categorize this skill (e.g., frontend, backend, library)
        </p>

        <div className={styles.tagsInput}>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add a tag..."
          />
          <button type="button" onClick={addTag}>
            Add
          </button>
        </div>

        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
                <button type="button" onClick={() => removeTag(index)}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Keywords Section */}
      <section className={styles.section}>
        <h2>Keywords</h2>
        <p className={styles.sectionDesc}>
          Add keywords for search and filtering
        </p>

        <div className={styles.tagsInput}>
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addKeyword();
              }
            }}
            placeholder="Add a keyword..."
          />
          <button type="button" onClick={addKeyword}>
            Add
          </button>
        </div>

        {keywords.length > 0 && (
          <div className={styles.tags}>
            {keywords.map((keyword, index) => (
              <span key={index} className={styles.tag}>
                {keyword}
                <button type="button" onClick={() => removeKeyword(index)}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
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
          {isSubmitting ? "Saving..." : "Save Skill"}
        </button>
      </div>
    </form>
  );
}
