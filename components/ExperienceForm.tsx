"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import type { Experience, RoleType } from "@/lib/types";
import {
  GROUPED_ORGANIZATION_OPTIONS,
  SelectOption,
  stringsToOptions,
  optionsToStrings,
} from "@/lib/constants";
import AIChatPanel from "./AIChatPanel";
import Button from "./Button";
import styles from "./ExperienceForm.module.css";

interface ExperienceFormProps {
  initialData?: Experience;
  onSubmit: (data: Partial<Experience>) => Promise<void>;
  onCancel: () => void;
}

export default function ExperienceForm({
  initialData,
  onSubmit,
  onCancel,
}: ExperienceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [technologies, setTechnologies] = useState<string[]>(
    initialData?.technologies || []
  );
  const [newTech, setNewTech] = useState("");
  const [selectedOrganizations, setSelectedOrganizations] = useState<SelectOption[]>(
    stringsToOptions(initialData?.organizations || [])
  );
  const [responsibilities, setResponsibilities] = useState<string[]>(
    initialData?.responsibilities || []
  );
  const [newResp, setNewResp] = useState("");
  const [editingRespIndex, setEditingRespIndex] = useState<number | null>(null);
  const [editingRespText, setEditingRespText] = useState("");
  const [achievements, setAchievements] = useState(
    initialData?.achievements || []
  );
  const [selectedCrossFunctional, setSelectedCrossFunctional] = useState<SelectOption[]>(
    stringsToOptions(initialData?.crossFunctional || [])
  );
  const [showAIPanel, setShowAIPanel] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      company: initialData?.company || "",
      location: initialData?.location || "",
      title: initialData?.title || "",
      industry: initialData?.industry || "",
      startDate: initialData?.startDate
        ? new Date(initialData.startDate).toISOString().split("T")[0]
        : "",
      endDate: initialData?.endDate
        ? new Date(initialData.endDate).toISOString().split("T")[0]
        : "",
      featured: initialData?.featured || false,
      roleTypes: initialData?.roleTypes || [],
    },
  });

  const onFormSubmit = async (data: any) => {
    setError("");
    setIsSubmitting(true);

    const organizations = optionsToStrings(selectedOrganizations);
    const crossFunctional = optionsToStrings(selectedCrossFunctional);

    try {
      const experienceData: Partial<Experience> = {
        company: data.company,
        location: data.location,
        title: data.title,
        industry: data.industry || undefined,
        startDate: data.startDate,
        endDate: data.endDate || undefined,
        organizations: organizations.length > 0 ? organizations : undefined,
        roleTypes: data.roleTypes,
        responsibilities,
        achievements: achievements.length > 0 ? achievements : undefined,
        technologies,
        crossFunctional:
          crossFunctional.length > 0 ? crossFunctional : undefined,
        featured: data.featured,
      };

      await onSubmit(experienceData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save experience"
      );
      setIsSubmitting(false);
    }
  };

  const addTechnology = () => {
    if (newTech.trim() && !technologies.includes(newTech.trim())) {
      setTechnologies([...technologies, newTech.trim()]);
      setNewTech("");
    }
  };

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech));
  };


  const addResponsibility = () => {
    if (newResp.trim()) {
      setResponsibilities([...responsibilities, newResp.trim()]);
      setNewResp("");
    }
  };

  const removeResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const startEditingResponsibility = (index: number) => {
    setEditingRespIndex(index);
    setEditingRespText(responsibilities[index]);
  };

  const saveResponsibility = (index: number) => {
    if (editingRespText.trim()) {
      const updated = [...responsibilities];
      updated[index] = editingRespText.trim();
      setResponsibilities(updated);
    }
    setEditingRespIndex(null);
    setEditingRespText("");
  };

  const cancelEditingResponsibility = () => {
    setEditingRespIndex(null);
    setEditingRespText("");
  };

  const addAchievement = () => {
    setAchievements([
      ...achievements,
      { description: "", impact: "" },
    ]);
  };

  const updateAchievement = (
    index: number,
    field: string,
    value: string | string[]
  ) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: value };
    setAchievements(updated);
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };


  const getCurrentExperienceData = () => {
    const formData = watch();
    return {
      ...formData,
      technologies,
      organizations: optionsToStrings(selectedOrganizations),
      responsibilities,
      achievements,
      crossFunctional: optionsToStrings(selectedCrossFunctional),
    };
  };

  // Custom styles for react-select to match form theme
  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderWidth: "2px",
      borderColor: state.isFocused ? "#667eea" : "#e2e8f0",
      borderRadius: "0.5rem",
      padding: "0.25rem",
      boxShadow: "none",
      "&:hover": {
        borderColor: state.isFocused ? "#667eea" : "#cbd5e1",
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "#e0e7ff",
      borderRadius: "0.375rem",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: "#4f46e5",
      fontWeight: 600,
      fontSize: "0.875rem",
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: "#4f46e5",
      "&:hover": {
        backgroundColor: "#c7d2fe",
        color: "#3730a3",
      },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#667eea"
        : state.isFocused
        ? "#e0e7ff"
        : "white",
      color: state.isSelected ? "white" : "#1e293b",
      "&:active": {
        backgroundColor: "#667eea",
      },
    }),
    groupHeading: (base: any) => ({
      ...base,
      color: "#64748b",
      fontWeight: 700,
      fontSize: "0.75rem",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#94a3b8",
    }),
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      {/* Basic Info */}
      <div className={styles.section}>
        <h2>Basic Information</h2>

        <div className={styles.field}>
          <label htmlFor="company">
            Company <span className={styles.required}>*</span>
          </label>
          <input
            id="company"
            {...register("company", { required: "Company is required" })}
            placeholder="Company name"
            disabled={isSubmitting}
          />
          {errors.company && (
            <span className={styles.fieldError}>{errors.company.message}</span>
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="title">
              Job Title <span className={styles.required}>*</span>
            </label>
            <input
              id="title"
              {...register("title", { required: "Job title is required" })}
              placeholder="Job title"
              disabled={isSubmitting}
            />
            {errors.title && (
              <span className={styles.fieldError}>{errors.title.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="location">
              Location <span className={styles.required}>*</span>
            </label>
            <input
              id="location"
              {...register("location", { required: "Location is required" })}
              placeholder="City, State or Remote"
              disabled={isSubmitting}
            />
            {errors.location && (
              <span className={styles.fieldError}>
                {errors.location.message}
              </span>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="industry">Industry</label>
          <input
            id="industry"
            {...register("industry")}
            placeholder="e.g., Software, Financial Services, Healthcare"
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="startDate">
              Start Date <span className={styles.required}>*</span>
            </label>
            <input
              id="startDate"
              type="date"
              {...register("startDate", { required: "Start date is required" })}
              disabled={isSubmitting}
            />
            {errors.startDate && (
              <span className={styles.fieldError}>
                {errors.startDate.message}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              type="date"
              {...register("endDate")}
              disabled={isSubmitting}
            />
            <small>Leave empty for current position</small>
          </div>
        </div>

        <div className={styles.checkboxField}>
          <input
            id="featured"
            type="checkbox"
            {...register("featured")}
            disabled={isSubmitting}
          />
          <label htmlFor="featured">Feature this experience</label>
        </div>
      </div>

      {/* Role Types */}
      <div className={styles.section}>
        <h2>
          Relevant Role Types <span className={styles.required}>*</span>
        </h2>

        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              value="technical_writer"
              {...register("roleTypes", {
                required: "Select at least one role type",
              })}
              disabled={isSubmitting}
            />
            Technical Writer
          </label>
          <label>
            <input
              type="checkbox"
              value="technical_writing_manager"
              {...register("roleTypes", {
                required: "Select at least one role type",
              })}
              disabled={isSubmitting}
            />
            Technical Writing Manager
          </label>
          <label>
            <input
              type="checkbox"
              value="software_engineer"
              {...register("roleTypes", {
                required: "Select at least one role type",
              })}
              disabled={isSubmitting}
            />
            Software Engineer
          </label>
          <label>
            <input
              type="checkbox"
              value="engineering_manager"
              {...register("roleTypes", {
                required: "Select at least one role type",
              })}
              disabled={isSubmitting}
            />
            Engineering Manager
          </label>
        </div>
        {errors.roleTypes && (
          <span className={styles.fieldError}>{errors.roleTypes.message}</span>
        )}
      </div>

      {/* Organizations/Teams */}
      <div className={styles.section}>
        <h2>Organizations/Teams (Optional)</h2>
        <p className={styles.sectionDesc}>
          Teams or departments you were a part of.
        </p>

        <CreatableSelect
          isMulti
          options={GROUPED_ORGANIZATION_OPTIONS}
          value={selectedOrganizations}
          onChange={(newValue) =>
            setSelectedOrganizations(newValue as SelectOption[])
          }
          placeholder="Search or type to add teams..."
          styles={selectStyles}
          isDisabled={isSubmitting}
          isClearable
          formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
          noOptionsMessage={() => "Type to add a custom team"}
        />
      </div>

      {/* Responsibilities */}
      <div className={styles.section}>
        <h2>
          Key Responsibilities <span className={styles.required}>*</span>
        </h2>
        <p className={styles.sectionDesc}>Main duties and areas of ownership</p>

        <div className={styles.listInput}>
          <textarea
            value={newResp}
            onChange={(e) => setNewResp(e.target.value)}
            placeholder="Add a responsibility"
            rows={2}
            disabled={isSubmitting}
          />
          <Button
            type="button"
            onClick={addResponsibility}
            disabled={isSubmitting}
            variant="primary"
            size="small"
          >
            Add Responsibility
          </Button>
        </div>

        <div className={styles.list}>
          {responsibilities.map((resp, idx) => (
            <div key={idx} className={styles.listItem}>
              {editingRespIndex === idx ? (
                <>
                  <textarea
                    value={editingRespText}
                    onChange={(e) => setEditingRespText(e.target.value)}
                    rows={2}
                    disabled={isSubmitting}
                    className={styles.editTextarea}
                  />
                  <div className={styles.buttonGroup}>
                    <Button
                      type="button"
                      onClick={() => saveResponsibility(idx)}
                      disabled={isSubmitting}
                      variant="primary"
                      size="small"
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      onClick={cancelEditingResponsibility}
                      disabled={isSubmitting}
                      variant="ghost"
                      size="small"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className={styles.listText}>{resp}</p>
                  <div className={styles.buttonGroup}>
                    <Button
                      type="button"
                      onClick={() => startEditingResponsibility(idx)}
                      disabled={isSubmitting}
                      variant="ghost"
                      size="small"
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      onClick={() => removeResponsibility(idx)}
                      disabled={isSubmitting}
                      variant="danger"
                      size="small"
                    >
                      Remove
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        {responsibilities.length === 0 && (
          <span className={styles.fieldError}>
            At least one responsibility is required
          </span>
        )}
      </div>

      {/* Technologies */}
      <div className={styles.section}>
        <h2>
          Technologies <span className={styles.required}>*</span>
        </h2>

        <div className={styles.tagsInput}>
          <input
            type="text"
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTechnology())
            }
            placeholder="Add technology (press Enter)"
            disabled={isSubmitting}
          />
          <button type="button" onClick={addTechnology} disabled={isSubmitting}>
            Add
          </button>
        </div>

        <div className={styles.tags}>
          {technologies.map((tech, idx) => (
            <span key={idx} className={styles.tag}>
              {tech}
              <button
                type="button"
                onClick={() => removeTechnology(tech)}
                disabled={isSubmitting}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {technologies.length === 0 && (
          <span className={styles.fieldError}>
            At least one technology is required
          </span>
        )}
      </div>

      {/* Achievements */}
      <div className={styles.section}>
        <h2>Key Achievements (Optional)</h2>
        <p className={styles.sectionDesc}>
          Notable accomplishments with measurable impact
        </p>

        <button
          type="button"
          onClick={addAchievement}
          className={styles.addButton}
          disabled={isSubmitting}
        >
          + Add Achievement
        </button>

        {achievements.map((achievement, idx) => (
          <div key={idx} className={styles.achievementGroup}>
            <div className={styles.field}>
              <label>Description</label>
              <textarea
                value={achievement.description}
                onChange={(e) =>
                  updateAchievement(idx, "description", e.target.value)
                }
                placeholder="Describe the achievement"
                rows={2}
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.field}>
              <label>Impact (Optional)</label>
              <textarea
                value={achievement.impact || ""}
                onChange={(e) =>
                  updateAchievement(idx, "impact", e.target.value)
                }
                placeholder="Quantify the impact (e.g., '30% increase in efficiency')"
                rows={2}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="button"
              onClick={() => removeAchievement(idx)}
              className={styles.removeButton}
              disabled={isSubmitting}
            >
              Remove Achievement
            </button>
          </div>
        ))}
      </div>

      {/* Cross-Functional Collaboration */}
      <div className={styles.section}>
        <h2>Cross-Functional Collaboration (Optional)</h2>
        <p className={styles.sectionDesc}>
          Teams or departments you collaborated with
        </p>

        <CreatableSelect
          isMulti
          options={GROUPED_ORGANIZATION_OPTIONS}
          value={selectedCrossFunctional}
          onChange={(newValue) =>
            setSelectedCrossFunctional(newValue as SelectOption[])
          }
          placeholder="Search or type to add collaborating teams..."
          styles={selectStyles}
          isDisabled={isSubmitting}
          isClearable
          formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
          noOptionsMessage={() => "Type to add a custom team"}
        />
      </div>

      {/* Form Actions */}
      <div className={styles.actions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelBtn}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={
            isSubmitting ||
            technologies.length === 0 ||
            responsibilities.length === 0
          }
        >
          {isSubmitting
            ? "Saving..."
            : initialData
            ? "Update Experience"
            : "Create Experience"}
        </button>
      </div>

      {/* Floating AI Assistant Button */}
      <button
        type="button"
        onClick={() => setShowAIPanel(true)}
        className={styles.aiFloatingBtn}
        disabled={isSubmitting}
        title="Open AI Writing Assistant"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Ask AI
      </button>

      {/* AI Chat Panel */}
      <AIChatPanel
        isOpen={showAIPanel}
        onClose={() => setShowAIPanel(false)}
        contextData={getCurrentExperienceData()}
        contextLabel="Experience Form Data"
        collection="experiences"
        roleType={watch("roleTypes")?.[0]}
      />
    </form>
  );
}
