// Common organizations and teams in software companies
// Used for multi-select dropdowns in forms

export interface SelectOption {
  value: string;
  label: string;
  category?: string;
}

// Organization/Team options grouped by category
export const ORGANIZATION_OPTIONS: SelectOption[] = [
  // Engineering/Technical
  { value: "engineering", label: "Engineering", category: "Engineering" },
  { value: "platform-engineering", label: "Platform Engineering", category: "Engineering" },
  { value: "infrastructure", label: "Infrastructure", category: "Engineering" },
  { value: "sre", label: "Site Reliability Engineering (SRE)", category: "Engineering" },
  { value: "devops", label: "DevOps", category: "Engineering" },
  { value: "qa", label: "QA/Quality Assurance", category: "Engineering" },
  { value: "security", label: "Security/InfoSec", category: "Engineering" },
  { value: "data-engineering", label: "Data Engineering", category: "Engineering" },
  { value: "ml-ai", label: "Machine Learning/AI", category: "Engineering" },
  { value: "mobile-engineering", label: "Mobile Engineering", category: "Engineering" },
  { value: "frontend-engineering", label: "Frontend Engineering", category: "Engineering" },
  { value: "backend-engineering", label: "Backend Engineering", category: "Engineering" },
  { value: "cloud-engineering", label: "Cloud Engineering", category: "Engineering" },
  { value: "release-engineering", label: "Release Engineering", category: "Engineering" },

  // Product & Design
  { value: "product-management", label: "Product Management", category: "Product & Design" },
  { value: "product-design", label: "Product Design", category: "Product & Design" },
  { value: "ux-design", label: "UX Design", category: "Product & Design" },
  { value: "ux-research", label: "UX Research", category: "Product & Design" },
  { value: "design-systems", label: "Design Systems", category: "Product & Design" },
  { value: "creative-services", label: "Creative Services", category: "Product & Design" },

  // Documentation & Content
  { value: "technical-writing", label: "Technical Writing", category: "Documentation & Content" },
  { value: "developer-relations", label: "Developer Relations (DevRel)", category: "Documentation & Content" },
  { value: "developer-experience", label: "Developer Experience", category: "Documentation & Content" },
  { value: "content-strategy", label: "Content Strategy", category: "Documentation & Content" },
  { value: "knowledge-management", label: "Knowledge Management", category: "Documentation & Content" },
  { value: "learning-development", label: "Learning & Development", category: "Documentation & Content" },

  // Business/Operations
  { value: "marketing", label: "Marketing", category: "Business & Operations" },
  { value: "sales", label: "Sales", category: "Business & Operations" },
  { value: "sales-engineering", label: "Sales Engineering", category: "Business & Operations" },
  { value: "customer-success", label: "Customer Success", category: "Business & Operations" },
  { value: "customer-support", label: "Customer Support", category: "Business & Operations" },
  { value: "business-development", label: "Business Development", category: "Business & Operations" },
  { value: "partnerships", label: "Partnerships", category: "Business & Operations" },
  { value: "legal", label: "Legal", category: "Business & Operations" },
  { value: "finance", label: "Finance", category: "Business & Operations" },
  { value: "hr-people-ops", label: "HR/People Operations", category: "Business & Operations" },
  { value: "recruiting", label: "Recruiting/Talent Acquisition", category: "Business & Operations" },
  { value: "operations", label: "Operations", category: "Business & Operations" },
  { value: "it-internal-tools", label: "IT/Internal Tools", category: "Business & Operations" },

  // Management
  { value: "executive-leadership", label: "Executive Leadership", category: "Management" },
  { value: "program-management", label: "Program Management", category: "Management" },
  { value: "project-management", label: "Project Management", category: "Management" },
  { value: "agile-scrum", label: "Agile/Scrum", category: "Management" },
];

// Group options by category for react-select
export const GROUPED_ORGANIZATION_OPTIONS = [
  {
    label: "Engineering",
    options: ORGANIZATION_OPTIONS.filter((o) => o.category === "Engineering"),
  },
  {
    label: "Product & Design",
    options: ORGANIZATION_OPTIONS.filter((o) => o.category === "Product & Design"),
  },
  {
    label: "Documentation & Content",
    options: ORGANIZATION_OPTIONS.filter((o) => o.category === "Documentation & Content"),
  },
  {
    label: "Business & Operations",
    options: ORGANIZATION_OPTIONS.filter((o) => o.category === "Business & Operations"),
  },
  {
    label: "Management",
    options: ORGANIZATION_OPTIONS.filter((o) => o.category === "Management"),
  },
];

// Helper to convert string array to SelectOption array
export function stringsToOptions(values: string[]): SelectOption[] {
  return values.map((value) => {
    // Try to find existing option
    const existing = ORGANIZATION_OPTIONS.find(
      (o) => o.value === value || o.label === value
    );
    if (existing) return existing;
    // Create new option for custom values
    return { value, label: value };
  });
}

// Helper to convert SelectOption array to string array (using labels for display)
export function optionsToStrings(options: SelectOption[]): string[] {
  return options.map((o) => o.label);
}
