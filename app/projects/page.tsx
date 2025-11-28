"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { projectsApi } from "@/lib/api";
import type { Project } from "@/lib/types";
import styles from "./projects.module.css";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({
    type: "",
    roleType: "",
    featured: "",
    search: "",
  });
  const router = useRouter();

  useEffect(() => {
    loadProjects();
  }, [filter]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (filter.type) params.type = filter.type;
      if (filter.roleType) params.roleType = filter.roleType;
      if (filter.featured) params.featured = filter.featured === "true";
      if (filter.search) params.search = filter.search;

      const data = await projectsApi.list(params);
      setProjects(data.projects || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      await projectsApi.delete(id);
      setProjects(projects.filter((p) => p._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete project");
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Projects</h1>
          <p>Manage your portfolio projects</p>
        </div>
        <button
          className={styles.createBtn}
          onClick={() => router.push("/projects/new")}
        >
          + New Project
        </button>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search projects..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className={styles.searchInput}
        />

        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className={styles.filterSelect}
        >
          <option value="">All Types</option>
          <option value="technical_writing">Technical Writing</option>
          <option value="software_engineering">Software Engineering</option>
          <option value="leadership">Leadership</option>
          <option value="hybrid">Hybrid</option>
        </select>

        <select
          value={filter.roleType}
          onChange={(e) => setFilter({ ...filter, roleType: e.target.value })}
          className={styles.filterSelect}
        >
          <option value="">All Role Types</option>
          <option value="technical_writer">Technical Writer</option>
          <option value="technical_writing_manager">
            Tech Writing Manager
          </option>
          <option value="software_engineer">Software Engineer</option>
          <option value="engineering_manager">Engineering Manager</option>
        </select>

        <select
          value={filter.featured}
          onChange={(e) => setFilter({ ...filter, featured: e.target.value })}
          className={styles.filterSelect}
        >
          <option value="">All Projects</option>
          <option value="true">Featured Only</option>
        </select>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {isLoading ? (
        <div className={styles.loading}>Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className={styles.empty}>
          <p>No projects found</p>
          <button onClick={() => router.push("/projects/new")}>
            Create your first project
          </button>
        </div>
      ) : (
        <div className={styles.projectGrid}>
          {projects.map((project) => (
            <div key={project._id} className={styles.projectCard}>
              <div className={styles.cardHeader}>
                <h3>{project.name}</h3>
                {project.featured && (
                  <div
                    title="Featured project"
                    className={styles.featuredBadge}
                  >
                    ⭐
                  </div>
                )}
              </div>
              <div className={styles.projectType}>
                <span>{project.type.replace("_", " ")}</span>
              </div>

              <p className={styles.overview}>{project.overview}</p>

              <div className={styles.metadata}>
                <div className={styles.metaItem}>
                  <strong>Date:</strong> {formatDate(project.date)}
                </div>
                <div className={styles.metaItem}>
                  <strong>Technologies:</strong>{" "}
                  {project.technologies.slice(0, 3).join(", ")}
                  {project.technologies.length > 3 &&
                    ` +${project.technologies.length - 3}`}
                </div>
              </div>

              <div className={styles.cardActions}>
                <Link
                  href={`/projects/${project._id}`}
                  className={styles.viewBtn}
                >
                  View
                </Link>
                <Link
                  href={`/projects/${project._id}/edit`}
                  className={styles.editBtn}
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(project._id!)}
                  className={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
