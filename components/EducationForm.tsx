"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Education } from "@/lib/types";
import styles from "./EducationForm.module.css";

interface EducationFormProps {
  initialData?: Education;
  onSubmit: (data: Partial<Education>) => Promise<void>;
  onCancel: () => void;
}

export default function EducationForm({
  initialData,
  onSubmit,
  onCancel,
}: EducationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [coursework, setCoursework] = useState<string[]>(
    initialData?.relevantCoursework || []
  );
  const [newCourse, setNewCourse] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      institution: initialData?.institution || "",
      degree: initialData?.degree || "",
      field: initialData?.field || "",
      graduationYear: initialData?.graduationYear || new Date().getFullYear(),
      displayOrder: initialData?.displayOrder || 0,
    },
  });

  const onFormSubmit = async (data: any) => {
    setError("");
    setIsSubmitting(true);

    try {
      const educationData: Partial<Education> = {
        institution: data.institution,
        degree: data.degree,
        field: data.field,
        graduationYear: parseInt(data.graduationYear),
        relevantCoursework: coursework,
        displayOrder: parseInt(data.displayOrder),
      };

      await onSubmit(educationData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save education"
      );
      setIsSubmitting(false);
    }
  };

  const addCourse = () => {
    if (newCourse.trim() && !coursework.includes(newCourse.trim())) {
      setCoursework([...coursework, newCourse.trim()]);
      setNewCourse("");
    }
  };

  const removeCourse = (index: number) => {
    setCoursework(coursework.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      {/* Basic Information Section */}
      <section className={styles.section}>
        <h2>Basic Information</h2>

        <div className={styles.field}>
          <label htmlFor="institution">
            Institution <span className={styles.required}>*</span>
          </label>
          <input
            id="institution"
            type="text"
            {...register("institution", {
              required: "Institution is required",
            })}
            placeholder="e.g., University of California, Berkeley"
          />
          {errors.institution && (
            <span className={styles.fieldError}>
              {errors.institution.message}
            </span>
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="degree">
              Degree <span className={styles.required}>*</span>
            </label>
            <input
              id="degree"
              type="text"
              {...register("degree", { required: "Degree is required" })}
              placeholder="e.g., Bachelor of Science"
            />
            {errors.degree && (
              <span className={styles.fieldError}>{errors.degree.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="field">
              Field of Study <span className={styles.required}>*</span>
            </label>
            <input
              id="field"
              type="text"
              {...register("field", { required: "Field is required" })}
              placeholder="e.g., Computer Science"
            />
            {errors.field && (
              <span className={styles.fieldError}>{errors.field.message}</span>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="graduationYear">
              Graduation Year <span className={styles.required}>*</span>
            </label>
            <input
              id="graduationYear"
              type="number"
              min="1950"
              max="2050"
              step="1"
              {...register("graduationYear", {
                required: "Graduation year is required",
                min: { value: 1950, message: "Year must be 1950 or later" },
                max: { value: 2050, message: "Year cannot exceed 2050" },
              })}
            />
            {errors.graduationYear && (
              <span className={styles.fieldError}>
                {errors.graduationYear.message}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="displayOrder">Display Order</label>
            <input
              id="displayOrder"
              type="number"
              min="0"
              step="1"
              {...register("displayOrder")}
              placeholder="0"
            />
            <small>Lower numbers appear first</small>
          </div>
        </div>
      </section>

      {/* Relevant Coursework Section */}
      <section className={styles.section}>
        <h2>Relevant Coursework</h2>
        <p className={styles.sectionDesc}>
          Add courses that are relevant to your career (optional)
        </p>

        <div className={styles.tagsInput}>
          <input
            type="text"
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCourse();
              }
            }}
            placeholder="Add a course..."
          />
          <button type="button" onClick={addCourse}>
            Add
          </button>
        </div>

        {coursework.length > 0 && (
          <div className={styles.tags}>
            {coursework.map((course, index) => (
              <span key={index} className={styles.tag}>
                {course}
                <button type="button" onClick={() => removeCourse(index)}>
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
          {isSubmitting ? "Saving..." : "Save Education"}
        </button>
      </div>
    </form>
  );
}
