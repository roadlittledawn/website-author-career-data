export default function DashboardPage() {
  return (
    <main className="dashboard">
      <h1>Career Data Admin</h1>
      <p>
        Welcome to your career data management system with AI writing assistant.
      </p>

      <div className="dashboard-grid">
        <a href="/profile">
          <div className="dashboard-card">
            <h2>Profile</h2>
            <p>Manage your professional profile and positioning</p>
          </div>
        </a>

        <a href="/experiences">
          <div className="dashboard-card">
            <h2>Experience</h2>
            <p>Track your work history and achievements</p>
          </div>
        </a>

        <a href="/skills">
          <div className="dashboard-card">
            <h2>Skills</h2>
            <p>Organize your skills by category</p>
          </div>
        </a>
        <a href="/projects">
          <div className="dashboard-card">
            <h2>Projects</h2>
            <p>Showcase your portfolio projects</p>
          </div>
        </a>

        <a href="/education">
          <div className="dashboard-card">
            <h2>Education</h2>
            <p>Manage academic background</p>
          </div>
        </a>
        <a href="/job-agent">
          <div className="dashboard-card">
            <h2>Job Application Agent</h2>
            <p>Create tailored resumes and cover letters</p>
          </div>
        </a>
      </div>
    </main>
  );
}
