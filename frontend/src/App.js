import React, { useState } from "react";
import Dashboard from "./components/Dashboard";
import FeedbackForm from "./components/FeedbackForm";
import FeedbackList from "./components/FeedbackList";
import "./App.css";

const App = () => {
  // Control which tab is active
  const [activeTab, setActiveTab] = useState("dashboard");

  // Used to refresh data when form submits or delete happens
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <div className="App">
      {/* ===== Header ===== */}
      <header className="app-header">
        <div className="header-logo">🎓</div>
        <div className="header-text">
          <h1>Student Feedback System</h1>
          <p>Faculty of Information & Communication Technology</p>
          <p className="university-name">
            Limkokwing University of Creative Technology
          </p>
        </div>
      </header>

      {/* ===== Tabs ===== */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === "form" ? "active" : ""}`}
          onClick={() => setActiveTab("form")}
        >
          Submit Feedback
        </button>
        <button
          className={`tab-btn ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          Feedback List
        </button>
      </div>

      {/* ===== Tab Content ===== */}
      <main className="app-main">
        <section
          className={`section ${activeTab === "dashboard" ? "active" : ""}`}
        >
          <Dashboard refresh={refreshKey} />
        </section>

        <section className={`section ${activeTab === "form" ? "active" : ""}`}>
          <FeedbackForm onFeedbackAdded={handleRefresh} />
        </section>

        <section className={`section ${activeTab === "list" ? "active" : ""}`}>
          <FeedbackList
            refresh={refreshKey}
            onFeedbackDeleted={handleRefresh}
          />
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="app-footer">
        <p>© 2025 Student Feedback System | Developed for LUCT</p>
      </footer>
    </div>
  );
};

export default App;
