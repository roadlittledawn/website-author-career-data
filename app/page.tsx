export default function DashboardPage() {
  return (
    <main className="dashboard">
      <h1>Career Data Admin</h1>
      <p>Welcome to your career data management system with AI writing assistant.</p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Profile</h2>
          <p>Manage your professional profile and positioning</p>
        </div>

        <div className="dashboard-card">
          <h2>Experiences</h2>
          <p>Track your work history and achievements</p>
        </div>

        <div className="dashboard-card">
          <h2>Skills</h2>
          <p>Organize your skills by category</p>
        </div>

        <div className="dashboard-card">
          <h2>Projects</h2>
          <p>Showcase your portfolio projects</p>
        </div>

        <div className="dashboard-card">
          <h2>Education</h2>
          <p>Manage academic background</p>
        </div>

        <div className="dashboard-card">
          <h2>Keywords</h2>
          <p>ATS optimization keywords</p>
        </div>
      </div>
    </main>
  );
}
