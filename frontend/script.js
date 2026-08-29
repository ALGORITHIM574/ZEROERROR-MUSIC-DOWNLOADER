// ==========================================================================
// StreamFetch SaaS Client Matrix Controller Runtime
// ==========================================================================

// 1. Environmental Credentials
const SUPABASE_URL = "https://wxfheyzckntitlvssoso.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZmhleXpja250aXRsdnNzb3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NTU2ODksImV4cCI6MjEwMzMzMTY4OX0.e-AAhF6cI29jkb2Ee1DA2m_pZiaa0VnEr4l5yD1mimw";

// Mock account target variable for testing baseline RLS data rules
const CURRENT_USER_ID = "5fe4b4e3-9d3d-4475-8107-81d57c13f255";

// 2. Fetch DOM Interface elements safely
const downloadForm = document.getElementById("downloadForm");
const urlInput = document.getElementById("videoUrl");
const submitBtn = document.getElementById("submitBtn");
const btnText = submitBtn.querySelector(".btn-text");
const spinner = submitBtn.querySelector(".spinner");
const statusBox = document.getElementById("statusMessage");
const statusText = statusBox.querySelector(".status-text");

const storageDisplay = document.getElementById("storageDisplay");
const storageProgressBar = document.getElementById("storageProgressBar");
const storageAlertMessage = document.getElementById("storageAlertMessage");
const videoHistoryFeed = document.getElementById("videoHistoryFeed");
const emptyFeedText = document.getElementById("emptyFeedText");

// Global state controller mapping values
let currentStorageUsageBytes = 0;
const STORAGE_LIMIT_BYTES = 1000 * 1024 * 1024; // 1000 MB (1 GB Free Tier Gate)

// 3. Initialize Dashboard Session Routines
window.addEventListener("DOMContentLoaded", () => {
  initializeDashboardData();
  establishRealtimeSync();
});

// 4. Fetch Core Cloud Metrics from PostgreSQL Tables & Views
async function initializeDashboardData() {
  try {
    // A. Fetch current user total storage metrics from our SQL View
    const usageResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/user_storage_usage?user_id=eq.${CURRENT_USER_ID}`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    );
    const usageData = await usageResponse.json();

    // FIXED: Appended missing array positioning identifier [0] to safely map return columns
    if (usageData && usageData.length > 0) {
      currentStorageUsageBytes = parseInt(usageData[0].total_bytes_used) || 0;
    } else {
      currentStorageUsageBytes = 0;
    }
    updateStorageUI();

    // B. Fetch historical available cloud downloads for this session user account
    const historyResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/downloads?user_id=eq.${CURRENT_USER_ID}&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    );
    const historyData = await historyResponse.json();

    if (historyData && historyData.length > 0) {
      if (document.getElementById("emptyFeedText")) {
        document.getElementById("emptyFeedText").remove();
      }
      // Clear feed before rendering history to prevent UI doubling up
      videoHistoryFeed.innerHTML = "";
      historyData.forEach((job) => renderVideoItemRow(job));
    }
  } catch (err) {
    console.error("Dashboard population engine lockup:", err);
  }
}

// 5. Render Dynamic Live Progress Meters & Paywall Check
function updateStorageUI() {
  const totalMbUsed = (currentStorageUsageBytes / (1024 * 1024)).toFixed(2);
  storageDisplay.textContent = `${totalMbUsed} MB / 1000 MB`;

  // Calculate precise percentage width
  const percentage = Math.min(
    (currentStorageUsageBytes / STORAGE_LIMIT_BYTES) * 100,
    100,
  );
  storageProgressBar.style.width = `${percentage}%`;

  // Trigger explicit monetization banner UI variations if capacity limit is reached
  if (percentage >= 100) {
    storageAlertMessage.innerHTML = `<b style="color:var(--error);">🚨 Storage Limit Reached!</b> Upgrade to premium to expand beyond your 1GB free tier limit.`;
    submitBtn.disabled = true;
    btnText.textContent = "Allocation Exceeded 🔒";
  } else {
    storageAlertMessage.textContent =
      "Using Free Tier space. Reach 100% capacity to trigger plan options.";
  }
}

// 6. Handle Form Submission & Push Job to Cloud Queue
downloadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const targetUrl = urlInput.value.trim();

  if (!targetUrl) {
    setNotification("Please enter a target destination video URL.", "error");
    return;
  }

  // Bulletproof Gate: Block instantly if user has hit or bypassed their 1GB cap limit
  if (currentStorageUsageBytes >= STORAGE_LIMIT_BYTES) {
    setNotification(
      "Download blocked. Your storage quota footprint is completely full.",
      "error",
    );
    return;
  }

  // Set UI to loading state
  urlInput.disabled = true;
  submitBtn.disabled = true;
  btnText.textContent = "Queueing Task...";
  spinner.classList.remove("hidden");
  setNotification(
    "Passing payload parameters safely to Supabase SQL schema...",
    "loading",
  );

  try {
    // Write a new tracking row directly to our secure public.downloads database table
    const response = await fetch(`${SUPABASE_URL}/rest/v1/downloads`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_id: CURRENT_USER_ID,
        video_url: targetUrl,
        status: "queued",
      }),
    });

    if (response.ok) {
      setNotification(
        "Task injected into cloud database successfully! Handing over to laptop worker engine...",
        "loading",
      );
      urlInput.value = "";
    } else {
      throw new Error("Database server verification parameter rejection.");
    }
  } catch (err) {
    setNotification(
      "Failed to push download payload package to cloud database layers.",
      "error",
    );
    urlInput.disabled = false;
    submitBtn.disabled = false;
    btnText.textContent = "Initialize Download";
    spinner.classList.add("hidden");
  }
});

// 7. Inject Live Row Element Cards into Dashboard History Layout Feed
function renderVideoItemRow(job) {
  let existingElement = document.getElementById(`job-${job.id}`);

  if (existingElement) {
    if (job.status === "completed" || job.status === "failed") {
      const freshItem = createRowUiMarkup(job);
      existingElement.replaceWith(freshItem);
    }
    return;
  }

  const newItem = createRowUiMarkup(job);
  if (document.getElementById("emptyFeedText")) {
    document.getElementById("emptyFeedText").remove();
  }
  videoHistoryFeed.insertBefore(newItem, videoHistoryFeed.firstChild);
}

// FIXED: Reconstructed the broken/cut-off layout builder loop here cleanly
function createRowUiMarkup(job) {
  const wrapper = document.createElement("div");
  wrapper.className = "video-item";
  wrapper.id = `job-${job.id}`;

  const sizeMb = (parseInt(job.file_size_bytes || 0) / (1024 * 1024)).toFixed(
    2,
  );
  const itemTitle = job.title || job.video_url;

  let actionButtonMarkup = ``;

  if (job.status === "queued") {
    actionButtonMarkup = `<span class="video-meta-text">⏳ Queued</span>`;
  } else if (job.status === "processing") {
    actionButtonMarkup = `<span class="video-meta-text" style="color:var(--accent-primary)">⚙️ Processing...</span>`;
  } else if (job.status === "failed") {
    actionButtonMarkup = `<span class="video-meta-text" style="color:var(--error)">❌ System Error</span>`;
  } else if (job.status === "completed") {
    const downloadUrl = job.bucket_path; // Points directly to your clean, signed cloud download address!
    actionButtonMarkup = `<a href="${downloadUrl}" target="_blank" class="cloud-download-btn">Download Link</a>`;
  }

  wrapper.innerHTML = `
        <div class="video-info">
            <span class="video-title-text" title="${itemTitle}">${itemTitle}</span>
            <span class="video-meta-text">${job.status === "completed" ? `${sizeMb} MB` : "Media Data Pending"}</span>
        </div>
        ${actionButtonMarkup}
    `;

  return wrapper;
}

// 8. Open WebSocket Connections using Supabase Realtime Serverless Systems
function establishRealtimeSync() {
  const realtimeUrl = `${SUPABASE_URL.replace("http", "ws")}/realtime/v1/websocket?apikey=${SUPABASE_ANON_KEY}`;
  const ws = new WebSocket(realtimeUrl);

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        topic: "realtime:public:downloads",
        event: "phx_join",
        payload: {},
        ref: "1",
      }),
    );
  };

  ws.onmessage = (e) => {
    const message = JSON.parse(e.data);

    if (message.event === "postgres_changes") {
      const dataPayload = message.payload.data;
      const newRecord = dataPayload.record || dataPayload.new;

      if (newRecord && newRecord.user_id === CURRENT_USER_ID) {
        renderVideoItemRow(newRecord);

        if (newRecord.status === "completed") {
          initializeDashboardData();
          urlInput.disabled = false;
          submitBtn.disabled = false;
          btnText.textContent = "Initialize Download";
          spinner.classList.add("hidden");
          setNotification(
            "Cloud sync execution completed successfully!",
            "success",
          );
        } else if (newRecord.status === "failed") {
          urlInput.disabled = false;
          submitBtn.disabled = false;
          btnText.textContent = "Initialize Download";
          spinner.classList.add("hidden");
          setNotification(
            "The background worker pipeline failed to process that streaming item.",
            "error",
          );
        }
      }
    }
  };
}

// FIXED: Defined the notification logic cleanly to clear the reference error crash
function setNotification(msg, type) {
  statusBox.className = `status-box ${type}`;
  statusText.textContent = msg;
  statusBox.classList.remove("hidden");
}
