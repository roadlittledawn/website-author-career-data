"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SkillCategory, RoleType, ProficiencyLevel, Skill } from "@/lib/types";
import styles from "./SkillsForm.module.css";

interface SkillsFormProps {
  initialData?: SkillCategory;
  onSubmit: (data: Partial<SkillCategory>) => Promise<void>;
  onCancel: () => void;
}

const ROLE_TYPES: { value: RoleType; label: string }[] = [
  { value: "technical_writer", label: "Technical Writer" },
  { value: "technical_writing_manager", label: "Technical Writing Manager" },
  { value: "software_engineer", label: "Software Engineer" },
  { value: "engineering_manager", label: "Engineering Manager" },
];

const PROFICIENCY_LEVELS: ProficiencyLevel[] = [
  "expert",
  "advanced",
  "intermediate",
  "beginner",
];

export default function SkillsForm({
  initialData,
  onSubmit,
  onCancel,
}: SkillsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [skills, setSkills] = useState<Skill[]>(initialData?.skills || []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: initialData?.category || "",
      roleRelevance: initialData?.roleRelevance || [],
      displayOrder: initialData?.displayOrder || 0,
    },
  });

  const roleRelevance = watch("roleRelevance");

  const onFormSubmit = async (data: any) => {
    setError("");

    // Validate that at least one skill is added
    if (skills.length === 0) {
      setError("Please add at least one skill");
      return;
    }

    setIsSubmitting(true);

    try {
      const skillCategoryData: Partial<SkillCategory> = {
        category: data.category,
        roleRelevance: data.roleRelevance,
        skills: skills,
        displayOrder: data.displayOrder || 0,
      };

      await onSubmit(skillCategoryData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save skill category"
      );
      setIsSubmitting(false);
    }
  };

  const addSkill = () => {
    setSkills([
      ...skills,
      {
        name: "",
        proficiency: undefined,
        yearsUsed: undefined,
        lastUsed: undefined,
        keywords: [],
        featured: false,
      },
    ]);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, field: keyof Skill, value: any) => {
    const updatedSkills = [...skills];
    updatedSkills[index] = {
      ...updatedSkills[index],
      [field]: value,
    };
    setSkills(updatedSkills);
  };

  const addKeyword = (skillIndex: number, keyword: string) => {
    if (!keyword.trim()) return;

    const updatedSkills = [...skills];
    const currentKeywords = updatedSkills[skillIndex].keywords || [];

    if (!currentKeywords.includes(keyword.trim())) {
      updatedSkills[skillIndex] = {
        ...updatedSkills[skillIndex],
        keywords: [...currentKeywords, keyword.trim()],
      };
      setSkills(updatedSkills);
    }
  };

  const removeKeyword = (skillIndex: number, keywordIndex: number) => {
    const updatedSkills = [...skills];
    const currentKeywords = updatedSkills[skillIndex].keywords || [];
    updatedSkills[skillIndex] = {
      ...updatedSkills[skillIndex],
      keywords: currentKeywords.filter((_, i) => i !== keywordIndex),
    };
    setSkills(updatedSkills);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      {/* Category Information Section */}
      <section className={styles.section}>
        <h2>Category Information</h2>

        <div className={styles.field}>
          <label htmlFor="category">
            Category Name <span className={styles.required}>*</span>
          </label>
          <input
            id="category"
            type="text"
            {...register("category", { required: "Category name is required" })}
            placeholder="e.g., Programming Languages, Documentation Tools"
          />
          {errors.category && (
            <span className={styles.fieldError}>{errors.category.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="displayOrder">Display Order</label>
          <input
            id="displayOrder"
            type="number"
            {...register("displayOrder")}
            placeholder="0"
          />
          <small>Lower numbers appear first</small>
        </div>

        <div className={styles.field}>
          <label>
            Role Relevance <span className={styles.required}>*</span>
          </label>
          <div className={styles.checkboxGroup}>
            {ROLE_TYPES.map((role) => (
              <label key={role.value}>
                <input
                  type="checkbox"
                  value={role.value}
                  {...register("roleRelevance", {
                    required: "Select at least one role",
                  })}
                />
                {role.label}
              </label>
            ))}
          </div>
          {errors.roleRelevance && (
            <span className={styles.fieldError}>
              {errors.roleRelevance.message}
            </span>
          )}
        </div>
      </section>

      {/* Skills Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Skills</h2>
          <button type="button" onClick={addSkill} className={styles.addButton}>
            + Add Skill
          </button>
        </div>

        {skills.length === 0 ? (
          <p className={styles.emptyMessage}>
            No skills added yet. Click "Add Skill" to get started.
          </p>
        ) : (
          <div className={styles.skillsList}>
            {skills.map((skill, index) => (
              <div key={index} className={styles.skillItem}>
                <div className={styles.skillHeader}>
                  <h4>Skill #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>
                      Skill Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) =>
                        updateSkill(index, "name", e.target.value)
                      }
                      placeholder="e.g., JavaScript, Markdown, Git"
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Proficiency Level</label>
                    <select
                      value={skill.proficiency || ""}
                      onChange={(e) =>
                        updateSkill(
                          index,
                          "proficiency",
                          e.target.value || undefined
                        )
                      }
                    >
                      <option value="">Select level...</option>
                      {PROFICIENCY_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={skill.yearsUsed || ""}
                      onChange={(e) =>
                        updateSkill(
                          index,
                          "yearsUsed",
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                      placeholder="e.g., 3.5"
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Last Used</label>
                    <input
                      type="date"
                      value={
                        skill.lastUsed
                          ? new Date(skill.lastUsed).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        updateSkill(
                          index,
                          "lastUsed",
                          e.target.value ? new Date(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.checkboxField}>
                    <input
                      type="checkbox"
                      checked={skill.featured || false}
                      onChange={(e) =>
                        updateSkill(index, "featured", e.target.checked)
                      }
                    />
                    Featured Skill
                  </label>
                </div>

                <div className={styles.field}>
                  <label>Keywords</label>
                  <div className={styles.tagsInput}>
                    <input
                      type="text"
                      placeholder="Add keyword..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addKeyword(index, e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addKeyword(index, input.value);
                        input.value = "";
                      }}
                    >
                      Add
                    </button>
                  </div>
                  {skill.keywords && skill.keywords.length > 0 && (
                    <div className={styles.tags}>
                      {skill.keywords.map((keyword, kwIndex) => (
                        <span key={kwIndex} className={styles.tag}>
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(index, kwIndex)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
          {isSubmitting ? "Saving..." : "Save Skill Category"}
        </button>
      </div>
    </form>
  );
}
