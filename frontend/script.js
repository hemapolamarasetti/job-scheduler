const API_BASE = "http://localhost:4000";

// Load jobs with filters
async function loadJobs() {
  const status = document.getElementById("filterStatus").value;
  const priority = document.getElementById("filterPriority").value;

  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (priority) params.append("priority", priority);

  const res = await fetch(`${API_BASE}/jobs?${params.toString()}`);
  const jobs = await res.json();

  const tbody = document.querySelector("#jobsTable tbody");
  tbody.innerHTML = "";
  jobs.forEach(job => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${job.id}</td>
      <td>${job.taskName}</td>
      <td>${job.priority}</td>
      <td>${job.status}</td>
      <td>${new Date(job.createdAt).toLocaleString()}</td>
      <td>
        <button onclick='alert(JSON.stringify(${JSON.stringify(job.payload)}, null, 2))'>View</button>
        <button onclick="runJob(${job.id})" ${job.status !== "pending" ? "disabled" : ""}>Run</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Create job
document.getElementById("jobForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const taskName = document.getElementById("taskName").value;
  const priority = document.getElementById("priority").value;
  let payload;
  try {
    payload = JSON.parse(document.getElementById("payload").value);
  } catch {
    alert("Payload must be valid JSON");
    return;
  }

  await fetch(`${API_BASE}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskName, priority, payload })
  });

  loadJobs();
});

// Run job
async function runJob(id) {
  await fetch(`${API_BASE}/run-job/${id}`, { method: "POST" });
  loadJobs();
}

// Initial load
loadJobs();