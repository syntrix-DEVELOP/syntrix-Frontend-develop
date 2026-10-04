// =========================================================================
// SYNTRIX CORE PLATFORM APPLICATION LOGIC ENGINE
// =========================================================================

// INJECT PREMIUM AI ANIMATION CSS DYNAMICALLY
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes aiSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes slideUpFade { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
.status-text-pulse { animation: textPulse 1.5s infinite; }
@keyframes textPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes splashFadeOut { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1.05); filter: blur(10px); } }
@keyframes appFadeIn { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
.splash-exit { animation: splashFadeOut 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.app-enter { animation: appFadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
`;
document.head.appendChild(styleSheet);

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000' 
  : 'https://syntrix-airdrop.onrender.com';

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;
const DEFAULT_TIMEOUT_MS = 90000; 

// QUALITY GATE: Start time tracker
let surveyStartTime = 0;
const QUALITY_THRESHOLD_MS = 120000; 

let userEmailAddress = "";
let currentSection = 0;
const answers = {};
let currentLanguage = "en";
let isOtpSent = false;
let userConnectedWalletAddress = "";

let legalConsentTimestamp = "";
let clientUserAgent = "";

window.getSectionTitle = function(section) { return section.title || "Consumer Research Matrix"; };

// Splash Screen & App Shell Element Selectors
const splashLandingGate = document.getElementById("splashLandingGate");
const mainApplicationLayout = document.getElementById("mainApplicationLayout");
const viewSplashHome = document.getElementById("viewSplashHome");
const viewSplashRewards = document.getElementById("viewSplashRewards");
const viewSplashAbout = document.getElementById("viewSplashAbout");
const linkHomeTab = document.getElementById("linkHomeTab");
const linkRewardsTab = document.getElementById("linkRewardsTab");
const linkAboutTab = document.getElementById("linkAboutTab");
const navLogoHomeTrigger = document.getElementById("navLogoHomeTrigger");
const navGetStartedAction = document.getElementById("navGetStartedAction");
const initializePlatformBtn = document.getElementById("initializePlatformBtn");

// FIX: Define playSmoothStart globally with error safety
window.playSmoothStart = function() {
  try {
    var initBtn = document.getElementById("initializePlatformBtn");
    if (initBtn) {
      initBtn.click();
    } else {
      // Fallback: manually perform the transition if button element is missing
      if(splashLandingGate) splashLandingGate.style.display = "none";
      if(mainApplicationLayout) {
        mainApplicationLayout.classList.remove("hidden");
        mainApplicationLayout.style.display = "block";
      }
    }
  } catch(err) {
    console.error("[Syntrix] playSmoothStart error:", err);
    // Emergency fallback
    var splash = document.getElementById("splashLandingGate");
    var main = document.getElementById("mainApplicationLayout");
    if(splash) splash.style.display = "none";
    if(main) { main.classList.remove("hidden"); main.style.display = "block"; }
  }
};

const emailGateSection = document.getElementById("emailGateSection");
const emailGateForm = document.getElementById("emailGateForm");
const gateEmailInput = document.getElementById("gateEmail");
const startSurveyBtn = document.getElementById("startSurveyBtn");
const preVerifyBtn = document.getElementById('preVerifyBtn');
const referredByCodeInput = document.getElementById("referredByCode"); 
const menuToggleBtn = document.getElementById("menuToggleBtn");
const optionsPopover = document.getElementById("optionsPopover");
const menuRecoverBtn = document.getElementById("menuRecoverBtn");
const menuRestartBtn = document.getElementById("menuRestartBtn"); 
const retrieveModal = document.getElementById("retrieveModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const confirmRetrieveBtn = document.getElementById("confirmRetrieveBtn");
const modalEmailInput = document.getElementById("modalEmailInput");
const modalStatus = document.getElementById("modalStatus");
const topProgressBox = document.getElementById("topProgressBox");
const claimForm = document.getElementById("claimForm");
const surveyContainer = document.getElementById("surveyContainer");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const submitClaimBtn = document.getElementById("submitClaimBtn");

// Gateway & Document Selectors
const gatewayScreenSection = document.getElementById("gatewayScreenSection");
const documentModeSection = document.getElementById("documentModeSection");
const selfieModeSection = document.getElementById("selfieModeSection");

// Dashboard Selectors
const rewardDashboardScreen = document.getElementById("rewardDashboardScreen");
const tabScreenHub = document.getElementById("rewardDashboardScreen"); 
const tabScreenBadge = document.getElementById("tabScreenBadge");
const tabScreenReferrals = document.getElementById("tabScreenReferrals");
const tabScreenMoreSurveys = document.getElementById("tabScreenMoreSurveys");
const claimScreenSection = document.getElementById("claimScreenSection");

const dashboardWalletInput = document.getElementById("dashboardWalletInput");
const executeClaimBtn = document.getElementById("executeClaimBtn");
const connectWalletBtn = document.getElementById("connectWalletBtn");
const claimConnectWalletBtn = document.getElementById("claimConnectWalletBtn");
const claimWalletConnectedBlock = document.getElementById("claimWalletConnectedBlock");
const claimWalletAddressDisplay = document.getElementById("claimWalletAddressDisplay");
const submitClaimRewardBtn = document.getElementById("submitClaimRewardBtn");
const statTotalReferrals = document.getElementById("statTotalReferrals");
const statPendingRewards = document.getElementById("statPendingRewards");
const statClaimedRewards = document.getElementById("statClaimedRewards");
const statTotalEarned = document.getElementById("statTotalEarned");
const referralCodeDisplay = document.getElementById("referralCodeDisplay");
const copyReferralBtn = document.getElementById("copyReferralBtn");

// QR Code Element Selectors
const generateQrBtn = document.getElementById("generateQrBtn");
const qrCodeWrapper = document.getElementById("qrCodeWrapper");
const qrCodeCanvas = document.getElementById("qrCodeCanvas");
const downloadQrBtn = document.getElementById("downloadQrBtn");

const statusDiv = document.getElementById("status");
const progressFill = document.querySelector(".progressFill");
const progressText = document.querySelector(".progressText");

const dashboardTabLinks = document.getElementById("dashboardTabLinks");
const sidebarLogoutBtn = document.getElementById("sidebarLogoutBtn");

const confirmRestartModal = document.getElementById("confirmRestartModal");
const cancelRestartBtn = document.getElementById("cancelRestartBtn");
const confirmRestartBtn = document.getElementById("confirmRestartBtn");

function showToast(message, icon) {
  if (icon === undefined) icon = "!";
  var toast = document.getElementById("customToast");
  var toastMsg = document.getElementById("toastMessage");
  var toastIcon = document.querySelector(".toast-icon");
  
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "customToast";
    toast.className = "custom-toast";
    toast.innerHTML = '<span class="toast-icon">' + icon + '</span><span id="toastMessage">' + message + '</span>';
    document.body.appendChild(toast);
    toastMsg = document.getElementById("toastMessage");
    toastIcon = document.querySelector(".toast-icon");
  }

  toastMsg.innerText = message;
  if(toastIcon) toastIcon.innerText = icon;
  
  void toast.offsetWidth;
  
  toast.style.display = "flex";
  toast.classList.add("show");
  setTimeout(function() { 
    toast.classList.remove("show"); 
    setTimeout(function() { toast.style.display = "none"; }, 500);
  }, 3500);
}

function openLegalModal() { 
  var legalModal = document.getElementById("legalModal");
  if(legalModal) {
    legalModal.classList.remove("hidden");
    legalModal.style.display = "flex";
  }
}
function closeLegalModal() { 
  var legalModal = document.getElementById("legalModal");
  if(legalModal) {
    legalModal.classList.add("hidden");
    legalModal.style.display = "none";
  }
}
var dismissModal = function() { 
  if (retrieveModal) {
    retrieveModal.classList.add("hidden"); 
    retrieveModal.style.display = "none";
  }
};

// ================= FIX: GLOBAL toggleSettingsMenu =================
function toggleSettingsMenu() {
  var popover = document.getElementById("optionsPopover");
  if (!popover) return;
  if (popover.style.display === "none" || popover.style.display === "" || popover.classList.contains("hidden")) {
    popover.classList.remove("hidden");
    popover.style.display = "block";
  } else {
    popover.classList.add("hidden");
    popover.style.display = "none";
  }
}

// ================= FIX: GLOBAL handleLogout =================
window.handleLogout = function() {
  resetApplicationFlowState();
};

// ================= REAL GOOGLE CREDENTIAL CALLBACK =================
window.handleGoogleCredentialResponse = function(response) {
  try {
    // Decode the JWT credential to extract the email
    var base64Url = response.credential.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    var payload = JSON.parse(jsonPayload);
    var email = payload.email;

    if (email) {
      // Auto-fill the email input and trigger OTP flow
      var emailInput = document.getElementById("gateEmail");
      if (emailInput) {
        emailInput.value = email;
        emailInput.readOnly = false;
      }
      
      // Programmatically trigger the Send Verification Code button
      var sendBtn = document.getElementById("preVerifyBtn");
      if (sendBtn && !sendBtn.disabled) {
        sendBtn.click();
      } else {
        showToast("Email filled. Please click 'Send Verification Code' to continue.", "!");
      }
    } else {
      showToast("Could not extract email from Google account. Please try manual entry.", "X");
    }
  } catch(err) {
    console.error("Error decoding Google credential:", err);
    showToast("Google sign-in failed. Please use email login instead.", "X");
  }
};

// ================= FIX: GLOBAL copyMyReferral =================
window.copyMyReferral = function(e) {
  if (e) e.preventDefault();
  var refDisplay = document.getElementById("referralCodeDisplay");
  if (!refDisplay) return;
  
  var refLink = refDisplay.value;
  if (refLink) {
    try {
      navigator.clipboard.writeText(refLink);
      var btn = document.getElementById("btnCopyReferralLink");
      if (btn) {
        var origHTML = btn.innerHTML;
        btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
        setTimeout(function() { btn.innerHTML = origHTML; }, 2000);
      }
    } catch(err) {
      showToast("Failed to copy. Please copy manually.", "!");
    }
  }
};

// ================= FIX: GLOBAL generateMyQR =================
window.generateMyQR = function(e) {
  if (e) e.preventDefault();
  var refDisplay = document.getElementById("referralCodeDisplay");
  var qrWrapper = document.getElementById("qrCodeWrapper");
  var qrCanvas = document.getElementById("qrCodeCanvas");
  
  if (!refDisplay || !qrWrapper || !qrCanvas) return;
  
  var refLink = refDisplay.value;
  if (!refLink || refLink === "https://syntrix-frontend-servey-8ea88a") {
    showToast("Referral link not available yet.", "!");
    return;
  }
  
  qrWrapper.style.display = "flex";
  qrCanvas.innerHTML = "";
  
  if (typeof QRCode !== "undefined") {
    new QRCode(qrCanvas, {
      text: refLink,
      width: 256,
      height: 256,
      colorDark: "#111827",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }
  
  qrWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  showToast("QR Code generated!", "OK");
};

// ================= FIX: GLOBAL downloadMyQR =================
window.downloadMyQR = function(e) {
  if (e) e.preventDefault();
  var qrCanvas = document.getElementById("qrCodeCanvas");
  if (!qrCanvas) return;
  
  var originalCanvas = qrCanvas.querySelector("canvas");
  if (!originalCanvas) {
    showToast("Please generate the QR code first.", "!");
    return;
  }

  var padding = 24; 
  var paddedCanvas = document.createElement("canvas");
  paddedCanvas.width = originalCanvas.width + (padding * 2);
  paddedCanvas.height = originalCanvas.height + (padding * 2);
  
  var ctx = paddedCanvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
  ctx.drawImage(originalCanvas, padding, padding);

  var downloadUrl = paddedCanvas.toDataURL("image/png");
  
  var tempLink = document.createElement("a");
  tempLink.href = downloadUrl;
  tempLink.download = "Syntrix_Dealer_QR.png";
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  
  showToast("QR Code saved to gallery!", "OK");
};


// ================= SPLASH PAGE ISOLATED ROUTING =================
var viewSplashDatasets = document.getElementById("viewSplashDatasets");
var linkDatasetsTab = document.getElementById("linkDatasetsTab");

function routeSplashNavViews(targetView) {
  if (viewSplashHome) viewSplashHome.style.display = "none";
  if (viewSplashRewards) viewSplashRewards.style.display = "none";
  if (viewSplashAbout) viewSplashAbout.style.display = "none";
  if (viewSplashDatasets) viewSplashDatasets.style.display = "none";
  
  document.querySelectorAll(".nav-splash-tab").forEach(function(link) { link.classList.remove("active"); });
  
  if (targetView === "home" && viewSplashHome) { viewSplashHome.style.display = "block"; if(linkHomeTab) linkHomeTab.classList.add("active"); }
  if (targetView === "rewards" && viewSplashRewards) { viewSplashRewards.style.display = "block"; if(linkRewardsTab) linkRewardsTab.classList.add("active"); }
  if (targetView === "about" && viewSplashAbout) { viewSplashAbout.style.display = "block"; if(linkAboutTab) linkAboutTab.classList.add("active"); }
  if (targetView === "datasets" && viewSplashDatasets) { viewSplashDatasets.style.display = "block"; if(linkDatasetsTab) linkDatasetsTab.classList.add("active"); }
}

if (linkHomeTab) linkHomeTab.addEventListener("click", function(e) { e.preventDefault(); routeSplashNavViews("home"); });
if (linkRewardsTab) linkRewardsTab.addEventListener("click", function(e) { e.preventDefault(); routeSplashNavViews("rewards"); });
if (linkAboutTab) linkAboutTab.addEventListener("click", function(e) { e.preventDefault(); routeSplashNavViews("about"); });
if (linkDatasetsTab) linkDatasetsTab.addEventListener("click", function(e) { e.preventDefault(); routeSplashNavViews("datasets"); });
if (navLogoHomeTrigger) navLogoHomeTrigger.addEventListener("click", function() { routeSplashNavViews("home"); });
document.querySelectorAll(".back-to-home-btn").forEach(function(btn) { btn.addEventListener("click", function() { routeSplashNavViews("home"); }); });

if (navGetStartedAction) {
  navGetStartedAction.addEventListener("click", function() {
    if (initializePlatformBtn) initializePlatformBtn.click();
  });
}

// ---- AUTO-LOGIN ON REFRESH: Skip splash if session exists ----
var autoLoginEmail = localStorage.getItem("syntrix_user_email");
if (autoLoginEmail) {
  userEmailAddress = autoLoginEmail;
  if (splashLandingGate) { splashLandingGate.style.display = "none"; }
  if (mainApplicationLayout) {
    mainApplicationLayout.classList.remove("hidden");
    mainApplicationLayout.classList.add("app-enter");
    mainApplicationLayout.style.display = "block";
  }
  if (emailGateSection) {
    emailGateSection.style.display = "none";
    emailGateSection.classList.add("hidden");
  }
  
  runProfileLedgerVerification(userEmailAddress, false);
  
  setTimeout(function() {
      var savedTab = localStorage.getItem("syntrix_current_tab") || "badge";
      if (typeof window.openModeEnhanced === 'function') {
          window.openModeEnhanced(savedTab);
      }
  }, 300);
}

if (initializePlatformBtn) {
  initializePlatformBtn.addEventListener("click", function() {
    if (splashLandingGate) splashLandingGate.classList.add("splash-exit");
    
    setTimeout(function() {
      if(splashLandingGate) splashLandingGate.style.display = "none"; 
      if(mainApplicationLayout) {
          mainApplicationLayout.classList.remove("hidden");
          mainApplicationLayout.classList.add("app-enter");
          mainApplicationLayout.style.display = "block"; 
      }
      
      var savedEmail = localStorage.getItem("syntrix_user_email");
      if (savedEmail) {
        userEmailAddress = savedEmail;
        if (emailGateSection) {
            emailGateSection.style.display = "none";
            emailGateSection.classList.add("hidden");
        }
        runProfileLedgerVerification(userEmailAddress, false);
      } else {
        var dashboardCards = ["rewardDashboardScreen", "tabScreenBadge", "tabScreenReferrals", "tabScreenMoreSurveys", "claimScreenSection", "gatewayScreenSection", "documentModeSection", "selfieModeSection", "tabScreenXP"];
        dashboardCards.forEach(function(id) {
          var el = document.getElementById(id);
          if (el) { el.style.display = "none"; el.classList.add("hidden"); }
        });
        if(emailGateSection) {
            emailGateSection.style.display = "block";
            emailGateSection.classList.remove("hidden");
        }
      }
    }, 450);
  });
}

// ================= GATEWAY LOGIC =================
window.openMode = function(mode) {
  if (mode === 'survey' && window.hasCompletedSurvey) {
      showToast("Survey already completed. Redirecting to Survey Matrix...", "OK");
      routeDashboardTabs('more-surveys');
      return; 
  }

  var gateway = document.getElementById("gatewayScreenSection");
  var survey = document.getElementById("claimForm");
  var topProgress = document.getElementById("topProgressBox");
  var docMode = document.getElementById("documentModeSection");
  var mainSubtitle = document.getElementById("mainSubtitle"); 

  [gateway, survey, topProgress, docMode].forEach(function(el) {
      if (el) { el.classList.add("hidden"); el.style.display = "none"; }
  });

  if (mode === 'gateway') {
      if(gateway) { gateway.classList.remove("hidden"); gateway.style.display = "flex"; }
      if(mainSubtitle) mainSubtitle.style.display = "block";
  } else if (mode === 'survey') {
      currentSection = 0;
      if(mainSubtitle) mainSubtitle.style.display = "block";
      renderSection(); 
  } else if (mode === 'document') {
      if(docMode) { docMode.classList.remove("hidden"); docMode.style.display = "block"; }
      if(mainSubtitle) mainSubtitle.style.display = "none"; 
  }
};

// ================= FIX: GLOBAL openModeEnhanced =================
window.openModeEnhanced = function(mode) {
  localStorage.setItem("syntrix_current_tab", mode);

  var popover = document.getElementById("optionsPopover");
  if (popover) {
    popover.classList.add("hidden");
    popover.style.display = "none";
  }

  var authEls = document.querySelectorAll(".auth-protected-ui");
  authEls.forEach(function(el) { el.style.display = "flex"; });
  
  var tabLinksContainer = document.getElementById("dashboardTabLinks");
  if (tabLinksContainer) { tabLinksContainer.classList.remove("hidden"); tabLinksContainer.style.display = "flex"; }

  if (mode === 'survey' && window.hasCompletedSurvey) {
    showToast("Survey already completed. Redirecting to Survey Matrix...", "OK");
    routeDashboardTabs('more-surveys');
    return;
  }
  
  if (mode === 'survey') {
    currentSection = 0;
    routeDashboardTabs('survey');
    renderSection();
  } else if (mode === 'history') {
    var historyEl = document.getElementById("tabScreenHistory");
    if (historyEl) {
      historyEl.classList.remove("hidden");
      historyEl.style.display = "block";
    }
    document.querySelectorAll(".tab-btn").forEach(function(btn) { btn.classList.remove("active"); });
    var clickedBtn = document.querySelector('[data-tab="history"]');
    if (clickedBtn) clickedBtn.classList.add("active");
    var mainSubtitle = document.getElementById("mainSubtitle"); 
    if(mainSubtitle) mainSubtitle.style.display = "none";

    // CRITICAL NEW ADDITION: Trigger history fetch when opening the tab
    if (userEmailAddress && typeof window.fetchAndRenderHistory === 'function') {
        window.fetchAndRenderHistory(userEmailAddress);
    }
  } else {
    routeDashboardTabs(mode);
  }
  
  if (mode === 'xp' && typeof XPAnimator !== 'undefined' && XPAnimator.replayAnimations) {
    setTimeout(function() { XPAnimator.replayAnimations(); }, 100);
  }
};


var BADGE_PROFILES = {
  Analyzer: { 
    title: "ANALYZER", sub: "The Mindful Shopper",
    desc: "You shop with brilliant clarity! For you, real value and true quality matter most. By thoughtfully comparing details and trusting genuine reviews, you always make incredibly smart and satisfying choices.", 
    iconHTML: '<img src="BADGES%20PNG/badge%201%20analyzer%20.jpeg" alt="Analyzer" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display=\'none\';">', 
    menuIcon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
    color: "#2563eb", textColor: "#0f172a"
  },
  Stylist: { 
    title: "STYLIST", sub: "The Tasteful Explorer",
    desc: "You have a beautiful eye for design! For you, shopping is about joy, artistry, and wonderful experiences. You naturally gravitate towards things that tell a great story and bring an extra touch of elegance into your everyday life.", 
    iconHTML: '<img src="BADGES%20PNG/badge%202.jpeg" alt="Stylist" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display=\'none\';">', 
    menuIcon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z"></path></svg>',
    color: "#8b5cf6", textColor: "#0f172a"
  },
  Hedger: { 
    title: "HEDGER", sub: "The Thoughtful Planner",
    desc: "You value peace of mind and total reliability! You love knowing your purchases are safe and backed by great guarantees. By choosing trusted paths, you ensure every shopping experience is completely smooth, secure, and worry-free.", 
    iconHTML: '<img src="BADGES%20PNG/badge%203%20.jpeg" alt="Hedger" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display=\'none\';">', 
    menuIcon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
    color: "#ea580c", textColor: "#0f172a"
  },
  Native: { 
    title: "NATIVE", sub: "The Connected Heart",
    desc: "You deeply value genuine connections! Your best shopping moments come from trusted recommendations and shared stories. By listening to friends and family, you always bring home products that carry real warmth and authenticity.", 
    iconHTML: '<img src="BADGES%20PNG/badge%204%20.jpeg" alt="Native" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display=\'none\';">', 
    menuIcon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
    color: "#eab308", textColor: "#0f172a"
  }
};

function displayConsumerBadgesUI(badgeKey) {
  var profile = BADGE_PROFILES[badgeKey] || BADGE_PROFILES.Analyzer;
  var badgeCard = document.getElementById("dashboardPsychologyBadgeCard");

  if (badgeCard) {
    badgeCard.style.display = "flex";
    badgeCard.style.flexDirection = "column";
    badgeCard.style.background = "linear-gradient(180deg, rgba(20,20,25,1) 0%, rgba(9,9,11,1) 100%)";
    badgeCard.style.border = "1px solid " + profile.color + "50";
    badgeCard.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 25px " + profile.color + "20";
    badgeCard.style.borderRadius = "24px";
    badgeCard.style.padding = "35px 25px";
    badgeCard.style.marginBottom = "35px";
    badgeCard.style.alignItems = "center";
    badgeCard.style.textAlign = "center";
    badgeCard.style.color = "#ffffff";

    badgeCard.innerHTML = 
      '<div class="persona-header-top" style="color: ' + profile.color + '; letter-spacing: 2px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">CONSUMER PERSONA UNLOCKED</div>' +
      '<h2 class="persona-title-main" style="font-size: 36px; font-weight: 900; color: #ffffff; letter-spacing: -1px; margin: 0 0 4px 0;">' + profile.title + '</h2>' +
      '<h4 class="persona-subtitle" style="font-size: 17px; font-weight: 600; color: #d1d5db; margin-bottom: 25px;">' + profile.sub + '</h4>' +
      '<div class="persona-icon-wrapper" style="width: 120px; height: 120px; border-radius: 50%; border: 2px solid ' + profile.color + '60; display: flex; align-items: center; justify-content: center; margin-bottom: 25px; background: radial-gradient(circle, ' + profile.color + '20 0%, transparent 70%); box-shadow: inset 0 0 20px ' + profile.color + '20, 0 0 20px ' + profile.color + '20; overflow: hidden;">' +
         profile.iconHTML +
      '</div>' +
      '<p class="persona-description" style="font-size: 15px; line-height: 1.7; color: #a1a1aa; margin: 0 0 30px 0; max-width: 650px;">' + profile.desc + '</p>' +
      '<div class="persona-verified-badge" style="display: flex; align-items: center; justify-content: center; gap: 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 14px 20px; width: 100%; max-width: 450px; text-align: left;">' +
        '<div class="pv-icon" style="color: ' + profile.color + '; display: flex; align-items: center; justify-content: center;">' +
          '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' +
        '</div>' +
        '<div class="pv-text" style="display: flex; flex-direction: column;">' +
          '<strong style="font-size: 12px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">VERIFIED BY SYNTRIX AI</strong>' +
          '<span style="font-size: 11px; color: #a1a1aa; font-weight: 500;">100% Authentic Analysis</span>' +
        '</div>' +
      '</div>';
  }

  var dropdownBadgeWrapper = document.getElementById("menuPsychologyBadgeWrapper");
  var dropdownBadgeText = document.getElementById("menuPsychologyBadgeText");
  var dropdownBadgeIcon = document.getElementById("menuBadgeIcon");
  if (dropdownBadgeWrapper && dropdownBadgeText && dropdownBadgeIcon) {
    dropdownBadgeWrapper.style.display = "flex";
    dropdownBadgeIcon.innerHTML = profile.menuIcon;
    dropdownBadgeText.innerText = profile.title;
    dropdownBadgeText.style.color = profile.color;
  }
}

function normalizeReferralCode(code) {
  if (!code) return "";
  var clean = code.trim().toUpperCase();
  clean = clean.replace(/\s+/g, "");
  if (!clean.startsWith("SYN-")) {
    if (clean.startsWith("SYN")) clean = "SYN-" + clean.substring(3);
    else clean = "SYN-" + clean;
  }
  return clean;
}

async function fetchWithTimeout(resource, options) {
  if (!options) options = {};
  var timeout = options.timeout || DEFAULT_TIMEOUT_MS;
  var controller = new AbortController();
  var id = setTimeout(function() { controller.abort(); }, timeout);
  try {
    var response = await fetch(resource, Object.assign({}, options, { signal: controller.signal }));
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

function getUIText(key) {
  var fallbacks = {
    validationRequired: "Please answer all questions before continuing.",
    submitting: "Storing survey data metrics across secure registers...",
    claiming: "Appending whitelist configuration parameters...",
    checkingLedger: "Setting up your exclusive premium experience..."
  };
  if (typeof translations !== "undefined" && translations[currentLanguage] && translations[currentLanguage][key]) {
    return translations[currentLanguage][key];
  }
  return fallbacks[key] || key;
}

// ================= DASHBOARD APP TABS ROUTER =================
function routeDashboardTabs(targetTab) {
  var cards = [
    document.getElementById("rewardDashboardScreen"),
    document.getElementById("tabScreenBadge"),
    document.getElementById("tabScreenReferrals"),
    document.getElementById("tabScreenMoreSurveys"),
    document.getElementById("claimScreenSection"),
    document.getElementById("documentModeSection"),
    document.getElementById("selfieModeSection"),
    document.getElementById("gatewayScreenSection"),
    document.getElementById("claimForm"),
    document.getElementById("topProgressBox"),
    document.getElementById("tabScreenXP"),
    document.getElementById("tabScreenHistory"),
    document.getElementById("tabScreenVault")
  ];
  
  cards.forEach(function(card) {
    if (card) {
      card.classList.add("hidden");
      card.style.display = "none";
    }
  });
  
  document.querySelectorAll(".tab-btn").forEach(function(btn) { btn.classList.remove("active"); });
  var clickedBtn = document.querySelector('[data-tab="' + targetTab + '"]');
  if (clickedBtn) clickedBtn.classList.add("active");

  var mainSubtitle = document.getElementById("mainSubtitle"); 
  if(mainSubtitle) mainSubtitle.style.display = "block";

  if (targetTab === "hub") {
    var el = document.getElementById("rewardDashboardScreen");
    if(el) { el.classList.remove("hidden"); el.style.display = "block"; }
  }
  else if (targetTab === "badge") {
    var el = document.getElementById("tabScreenBadge");
    if(el) { el.classList.remove("hidden"); el.style.display = "block"; }
  }
  else if (targetTab === "referrals") {
    var el = document.getElementById("tabScreenReferrals");
    if(el) { el.classList.remove("hidden"); el.style.display = "block"; }
  }
  else if (targetTab === "more-surveys" || targetTab === "more") {
    var el = document.getElementById("tabScreenMoreSurveys");
    if(el) { el.classList.remove("hidden"); el.style.display = "block"; }
  }
  else if (targetTab === "document") {
    var el = document.getElementById("documentModeSection");
    if(el) { el.classList.remove("hidden"); el.style.display = "block"; }
    if(mainSubtitle) mainSubtitle.style.display = "none"; 
  }
  else if (targetTab === "selfie") {
    var el = document.getElementById("selfieModeSection");
    if(el) { el.classList.remove("hidden"); el.style.display = "block"; }
    if(mainSubtitle) mainSubtitle.style.display = "none";    // ---- AI Photo Task WEEKLY Rotator ----
    var selfieTaskPrompts = [
      "Turn head 30\u00B0 to the left",
      "Turn head 30\u00B0 to the right",
      "Look slightly upward with a neutral expression",
      "Slight smile, facing directly forward",
      "Tilt chin down 15\u00B0 with eyes looking at camera",
      "Turn head 45\u00B0 left, look over your shoulder",
      "Close your eyes naturally for 2 seconds, then open",
      "Natural resting face under bright front lighting",
      "Side profile \u2014 full 90\u00B0 left turn",
      "Side profile \u2014 full 90\u00B0 right turn"
    ];
    
    // Calculate total days since epoch to strictly rotate 1 task per day
    var daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    var taskIndex = daysSinceEpoch % selfieTaskPrompts.length;
    var dailyTask = selfieTaskPrompts[taskIndex];
    
    var taskTextEl = document.getElementById("currentSelfieTaskText");
    if (taskTextEl) taskTextEl.innerText = dailyTask;
    window.currentSelfieTask = dailyTask;
    
    // Dynamically update the UI badge to reflect daily scarcity
    var badgeTitleEl = document.querySelector("#selfieTaskBadge span");
    if (badgeTitleEl) {
        badgeTitleEl.innerText = "DAILY AI MISSION";
        badgeTitleEl.style.color = "#10b981";
    }
    var badgeBoxEl = document.getElementById("selfieTaskBadge");
    if (badgeBoxEl) {
        badgeBoxEl.style.borderColor = "#10b981";
        badgeBoxEl.style.background = "rgba(16, 185, 129, 0.1)";
    }
  }
  else if (targetTab === "gateway") {
    var el = document.getElementById("gatewayScreenSection");
    if(el) { el.classList.remove("hidden"); el.style.display = "flex"; }
  }
  else if (targetTab === "survey") {
    var form = document.getElementById("claimForm");
    var progress = document.getElementById("topProgressBox");
    if(form) { form.classList.remove("hidden"); form.style.display = "block"; }
    if(progress) { progress.classList.remove("hidden"); progress.style.display = "block"; }
  }
  else if (targetTab === "xp") {
    var el = document.getElementById("tabScreenXP");
    if(el) { el.classList.remove("hidden"); el.style.display = "block"; }
    if(mainSubtitle) mainSubtitle.style.display = "none";
  }
  else if (targetTab === "history") {
    var el = document.getElementById("tabScreenHistory");
    if(el) { el.classList.remove("hidden"); el.style.display = "block"; }
    if(mainSubtitle) mainSubtitle.style.display = "none";
  }
  else if (targetTab === "vault") {
    var el = document.getElementById("tabScreenVault");
    if(el) { el.classList.remove("hidden"); el.style.display = "block"; }
    if(mainSubtitle) mainSubtitle.style.display = "none"; 
  }
}

function handleNextSection() {
  var sections = getSurveyData();
  if (!validateCurrentSectionAnswers()) {
    showToast(getUIText("validationRequired"), "!");
    return;
  }
  if (currentSection < sections.length - 1) {
    currentSection++;
    renderSection();
    updateExcitementBanner(currentSection);
  }
}

function handlePrevSection() {
  if (currentSection > 0) {
    currentSection--;
    renderSection();
    updateExcitementBanner(currentSection);
  }
}

function getQuestionText(q) {
  if (typeof questionTranslations !== "undefined" && questionTranslations[currentLanguage]) {
    return questionTranslations[currentLanguage][q.id] || q.question || q.id;
  }
  return q.question || q.id;
}

function getOptionText(opt) {
  if (typeof optionTranslations !== "undefined" && optionTranslations[currentLanguage]) {
    return optionTranslations[currentLanguage][opt] || opt;
  }
  return opt;
}

function interceptClaimGateActions(e) {
  if (e) e.preventDefault();
  showToast("Coming Soon! Stay tuned to claim your precious tokens!", "!");
}

function validateCurrentSectionAnswers() {
  var sections = getSurveyData();
  var currentData = sections[currentSection];
  if (!currentData) return false;
  
  for (var i = 0; i < currentData.questions.length; i++) { 
    var q = currentData.questions[i];
    if (q.type === "textarea") {
      if (!answers[q.id] || answers[q.id].trim() === "") return false;
    } else {
      if (!answers[q.id]) return false; 
    }
  }
  return true;
}

function renderSection() {
  var progTxt = document.getElementById('progressIndicatorText'); if(progTxt) { var totalSec = window.getSurveyData().length; progTxt.innerText = (currentSection + 1) + '/' + totalSec; }
  var sections = getSurveyData();
  if (!sections || sections.length === 0 || !surveyContainer) return;
  var currentData = sections[currentSection];
  
  try {
    if (currentSection === 0) {
       surveyStartTime = Date.now(); 
    }

    if (topProgressBox) {
      topProgressBox.classList.remove("hidden");
      topProgressBox.style.display = "block";
    }
    if (claimForm) {
      claimForm.classList.remove("hidden");
      claimForm.style.display = "block";
    }
    if (emailGateSection) {
      emailGateSection.classList.add("hidden");
      emailGateSection.style.display = "none";
    }

    var progressPercent = ((currentSection + 1) / sections.length) * 100;
    if (progressFill) progressFill.style.width = progressPercent + "%";
    if (progressText) progressText.innerText = "Progress " + (currentSection + 1) + "/" + sections.length;

    var htmlStr = '<div class="survey-section-card animate-fade-in">' +
      '<h2 class="surveySectionTitle" style="font-size: 26px; font-weight: 800; color: #ffffff; margin-bottom: 5px;">' + window.getSectionTitle(currentData) + '</h2>';

    if (currentData && currentData.questions) {
        currentData.questions.forEach(function(q) {
          var savedAnswer = answers[q.id] || "";
          htmlStr += '<div class="question-block" style="margin-top:30px; text-align:left;">' +
            '<p class="questionText" style="font-weight:800; margin-bottom:16px; font-size:17px; color:#d1d5db;">' + getQuestionText(q) + '</p>' +
            '<div class="options">'; 

          if (q.type === "textarea") {
               htmlStr += '<textarea id="' + q.id + '" placeholder="Type your answer here..." onchange="recordSelection(\'' + q.id + '\', this.value)" style="width:100%; border:1px solid #3f3f46; border-radius:14px; padding:16px; font-size:15px; font-family:inherit; background: #18181b; color: #ffffff;">' + savedAnswer + '</textarea>';
          } 
          else if (q.options && Array.isArray(q.options)) {
              q.options.forEach(function(opt) {
                var isChecked = savedAnswer === opt ? "checked" : "";
                var isSelectedClass = savedAnswer === opt ? "selected" : ""; 
                htmlStr += '<label class="option ' + isSelectedClass + '" style="display:inline-block; user-select:none; font-weight: 600; cursor: pointer !important; position: relative; z-index: 10;">' +
                    '<input type="radio" name="' + q.id + '" value="' + opt + '" ' + isChecked + ' style="position: absolute; opacity: 0; pointer-events: none; margin: 0;" onchange="recordSelection(\'' + q.id + '\', this.value)">' +
                    '<span class="optionText">' + getOptionText(opt) + '</span>' +
                  '</label>';
              });
          }
          htmlStr += '</div></div>';
        });
    }

    htmlStr += '</div>';
    surveyContainer.innerHTML = htmlStr;

    if (prevBtn) {
      if(currentSection === 0) {
        prevBtn.style.visibility = "hidden";
        prevBtn.style.display = "none";
      } else {
        prevBtn.style.visibility = "visible";
        prevBtn.style.display = "block";
      }
    }
    
    if (currentSection === sections.length - 1) {
      if (nextBtn) { nextBtn.classList.add("hidden"); nextBtn.style.display = "none"; }
      if (submitClaimBtn) { submitClaimBtn.classList.remove("hidden"); submitClaimBtn.style.display = "block"; }
    } else {
      if (nextBtn) { nextBtn.classList.remove("hidden"); nextBtn.style.display = "block"; }
      if (submitClaimBtn) { submitClaimBtn.classList.add("hidden"); submitClaimBtn.style.display = "none"; }
    }
  } catch (err) {
    surveyContainer.innerHTML = '<div style="background:#fee2e2; border: 2px solid #ef4444; color:#991b1b; padding: 20px; border-radius: 12px; font-weight:bold; margin-top:20px;">System Error: ' + err.message + '</div>';
    console.error(err);
  }
}

window.recordSelection = function(questionId, selectedValue) {
  answers[questionId] = selectedValue;
  
  var radios = document.querySelectorAll('input[name="' + questionId + '"]');
  radios.forEach(function(radio) {
    var label = radio.closest('.option');
    if (label) {
      if (radio.value === selectedValue) {
        label.classList.add('selected');
        radio.checked = true;
      } else {
        label.classList.remove('selected');
        radio.checked = false;
      }
    }
  });
};

function updateExcitementBanner(sectionIndex) {
  var banner = document.getElementById("excitementBanner");
  if (!banner) return;
  if (sectionIndex === 0) { banner.style.display = "none"; return; }

  banner.style.display = "flex";
  banner.style.animation = 'none'; banner.offsetHeight; banner.style.animation = 'slideDown 0.5s ease-out';

  var langText = {
    title: "Module 1 Complete!",
    subtitle: "Complete this final module & hit Submit to calculate your dynamic SYNX reward.",
    pill: "FINAL STAGE"
  };

  if (currentLanguage === "hi") {
    langText.title = "Module 1 Pura Hua!";
    langText.subtitle = "Apna dynamic SYNX reward calculate karne ke liye ye aakhiri module submit karein.";
  } else if (currentLanguage === "hinglish") {
    langText.title = "Module 1 Complete!";
    langText.subtitle = "Apna dynamic SYNX reward calculate karne ke liye final module submit karein.";
  }

  banner.innerHTML = '<div style="display: flex; align-items: center; gap: 16px;"><div style="font-size: 38px; filter: drop-shadow(0 0 12px rgba(16, 185, 129, 0.6)); animation: floatBox 2s ease-in-out infinite;">*</div><div><div style="color: #f3f4f6; font-size: 15px; font-weight: 500;">' + langText.title + ' <span style="color: #10b981; font-weight: 900; font-size: 18px;">Dynamic SYNX</span> unlocked!</div><div style="color: #9ca3af; font-size: 13px; margin-top: 4px;">' + langText.subtitle + '</div></div></div><div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;"><div style="color: #10b981; font-weight: 900; font-size: 20px; letter-spacing: 2px;">[ ' + langText.pill + ' ]</div><div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); padding: 5px 12px; border-radius: 6px; color: #10b981; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">Ready to Claim</div></div>';
}

async function runProfileLedgerVerification(email, isFromModal, isBackgroundSync) {
  if (isFromModal === undefined) isFromModal = false;
  if (isBackgroundSync === undefined) isBackgroundSync = false;
  var outputTarget = isFromModal ? modalStatus : statusDiv;
  if (!outputTarget) return;

  if (!isBackgroundSync) {
    outputTarget.innerHTML = getUIText("checkingLedger");
    outputTarget.style.color = "#57d6c2";
  }

  try {
    var response = await fetchWithTimeout(API_BASE_URL + "/api/user-status?email=" + encodeURIComponent(email));
    var statusResult = await response.json();

    if (isFromModal) dismissModal();

    if (statusResult.success) {
      userEmailAddress = email;
      localStorage.setItem("syntrix_user_email", email);
      
      // Show authenticated UI elements
      var authEls = document.querySelectorAll(".auth-protected-ui");
      authEls.forEach(function(el) { el.style.display = "flex"; });
      
      if (statTotalReferrals) statTotalReferrals.innerText = statusResult.referralsCount || "0";
      if (statPendingRewards) statPendingRewards.innerText = (statusResult.pendingRewards || 0) + " SYNX";
      if (statClaimedRewards) statClaimedRewards.innerText = (statusResult.claimedRewards || 0) + " SYNX";
      if (statTotalEarned) statTotalEarned.innerText = ((statusResult.pendingRewards || 0) + (statusResult.claimedRewards || 0)) + " SYNX";
      
      const PRODUCTION_DOMAIN = "https://syntrixhub.vercel.app";
      if (referralCodeDisplay) referralCodeDisplay.value = `${PRODUCTION_DOMAIN}?ref=${statusResult.referralCode || ""}`;
      
      var menuReferralInput = document.getElementById("menuReferralInputDisplay");
      if (menuReferralInput) menuReferralInput.value = `${PRODUCTION_DOMAIN}?ref=${statusResult.referralCode || ""}`;
      
      var menuReferralWrapper = document.getElementById("menuReferralWrapper");
      if (menuReferralWrapper) menuReferralWrapper.style.display = "flex";

      if (statusResult.exists === true) {
        window.hasCompletedSurvey = true; 
        displayConsumerBadgesUI(statusResult.badge || "Analyzer");

        // ---- CRITICAL FIX: OFFLINE ANIMATION & VAULT POPULATION ----
        var totalBal = (statusResult.pendingRewards || 0) + (statusResult.claimedRewards || 0);
        var vaultTotalEl = document.getElementById("vaultTotalBalance");
        var vaultPendEl = document.getElementById("vaultPendingTransfer");
        var vaultClaimEl = document.getElementById("vaultClaimed");
        if(vaultTotalEl) vaultTotalEl.innerText = totalBal;
        if(vaultPendEl) vaultPendEl.innerText = (statusResult.pendingRewards || 0) + " SYNX";
        if(vaultClaimEl) vaultClaimEl.innerText = (statusResult.claimedRewards || 0) + " SYNX";

        // Trigger Offline Animation
        if (!isBackgroundSync) {
            var savedLastSeen = localStorage.getItem('syntrix_last_seen_rewards');
            var currentPending = statusResult.pendingRewards || 0;
            
            if (savedLastSeen === null) {
                localStorage.setItem('syntrix_last_seen_rewards', currentPending);
            } else {
                var lastSeen = parseInt(savedLastSeen);
                if (currentPending > lastSeen && currentPending > 0) {
                    var newlyEarned = currentPending - lastSeen;
                    
                    var overlay = document.createElement('div');
                    overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(3, 3, 8, 0.95); z-index: 999999; display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(15px); opacity: 0; transition: opacity 0.5s;";
                    overlay.innerHTML = '<div style="font-size: 80px; margin-bottom: 20px; animation: slideUpFade 0.8s ease-out;">💎</div>' +
                        '<div style="font-size: 14px; font-weight: 700; color: #a1a1aa; letter-spacing: 2px; margin-bottom: 10px; animation: slideUpFade 0.9s ease-out;">OFFLINE EARNINGS SECURED</div>' +
                        '<h1 style="font-size: 56px; font-weight: 900; color: #10b981; margin: 0; text-align: center; animation: slideUpFade 1s ease-out;">+' + newlyEarned + ' SYNX</h1>' +
                        '<p style="color: #d1d5db; font-size: 16px; margin-top: 15px; animation: slideUpFade 1.2s ease-out; text-align: center; max-width: 400px; line-height: 1.5;">Your files were successfully verified by our AI while you were offline!</p>' +
                        '<button onclick="this.parentElement.style.opacity=\'0\'; setTimeout(() => this.parentElement.remove(), 500); window.openModeEnhanced(\'vault\');" style="margin-top: 35px; background: #ffffff; color: #000000; padding: 16px 36px; border-radius: 12px; font-weight: 800; font-size: 16px; border: none; cursor: pointer; animation: slideUpFade 1.4s ease-out; box-shadow: 0 10px 30px rgba(255,255,255,0.2);">Go to Vault &rarr;</button>';
                    
                    document.body.appendChild(overlay);
                    setTimeout(function() { overlay.style.opacity = '1'; }, 100);
                }
                localStorage.setItem('syntrix_last_seen_rewards', currentPending);
            }
        }

        if (!isBackgroundSync) {
            if (emailGateSection) { emailGateSection.classList.add("hidden"); emailGateSection.style.display = "none"; }
            if (claimForm) { claimForm.classList.add("hidden"); claimForm.style.display = "none"; }
            if (topProgressBox) { topProgressBox.classList.add("hidden"); topProgressBox.style.display = "none"; }
            if (gatewayScreenSection) { gatewayScreenSection.classList.add("hidden"); gatewayScreenSection.style.display = "none"; }
            if (documentModeSection) { documentModeSection.classList.add("hidden"); documentModeSection.style.display = "none"; }
            if (selfieModeSection) { selfieModeSection.classList.add("hidden"); selfieModeSection.style.display = "none"; }
            
            var tabLinksContainer = document.getElementById("dashboardTabLinks");
            if (tabLinksContainer) { tabLinksContainer.classList.remove("hidden"); tabLinksContainer.style.display = "flex"; }
            
            routeDashboardTabs("badge");
        }
        if (!isBackgroundSync) outputTarget.innerHTML = "";
      } else {
        window.hasCompletedSurvey = false; 
        var menuPsychologyBadgeWrapper = document.getElementById("menuPsychologyBadgeWrapper");
        if (menuPsychologyBadgeWrapper) menuPsychologyBadgeWrapper.style.display = "none";

        if (!isBackgroundSync) {
            if (emailGateSection) { emailGateSection.classList.add("hidden"); emailGateSection.style.display = "none"; }
            
            var cards = ["rewardDashboardScreen", "tabScreenBadge", "tabScreenReferrals", "tabScreenMoreSurveys", "claimScreenSection", "claimForm", "topProgressBox", "documentModeSection", "selfieModeSection", "tabScreenXP"];
            cards.forEach(function(id) {
              var el = document.getElementById(id);
              if (el) { el.classList.add("hidden"); el.style.display = "none"; }
            });
            
            var tabLinksContainer = document.getElementById("dashboardTabLinks");
            if (tabLinksContainer) { tabLinksContainer.classList.remove("hidden"); tabLinksContainer.style.display = "flex"; }

            routeDashboardTabs("gateway");
            outputTarget.innerHTML = "";
        }
      }
    } else {
      if (!isFromModal) {
        if (!isBackgroundSync) {
            if (emailGateSection) { emailGateSection.classList.add("hidden"); emailGateSection.style.display = "none"; }
            var dashboardCards = ["rewardDashboardScreen", "tabScreenBadge", "tabScreenReferrals", "tabScreenMoreSurveys", "claimScreenSection", "claimForm", "topProgressBox", "documentModeSection", "selfieModeSection", "tabScreenXP"];
            dashboardCards.forEach(function(id) {
              var el = document.getElementById(id);
              if (el) { el.style.display = "none"; el.classList.add("hidden"); }
            });
            var tabLinksContainer = document.getElementById("dashboardTabLinks");
            if (tabLinksContainer) { tabLinksContainer.classList.remove("hidden"); tabLinksContainer.style.display = "flex"; }
            
            routeDashboardTabs("gateway");
            outputTarget.innerHTML = "";
        }
      } else {
        if (!isBackgroundSync) outputTarget.innerHTML = ""; 
        showToast("Profile ledger entry not found.", "X");
      }
    }
  } catch (err) {
    if (!isBackgroundSync) outputTarget.innerHTML = ""; 
    showToast("Server waking up or offline. Please try again.", "X");
  }
}

function determinePersonaBadge(answersObj) {
  var scores = { Analyzer: 0, Stylist: 0, Hedger: 0, Native: 0 };
  var mapping = {
    "q_ecom_search": {
      "Technical benchmark tests, spec sheets, and deep-dive Reddit threads.": "Analyzer",
      "Aesthetic Instagram lookbooks, curated Pinterest boards, or design edits.": "Stylist",
      "Amazon/Flipkart top-rated lists with verified brand warranties.": "Hedger",
      "Creator reviews on YouTube, tech unboxings, or friend recommendations.": "Native"
    },
    "q_ecom_sale_trigger": {
      "Stacking credit card offers (10% instant bank discounts) to hit lowest price.": "Analyzer",
      "Limited-edition design capsules or aesthetic drops that rarely discount.": "Stylist",
      "Bundled protection plans, extended warranties, or no-cost EMI terms.": "Hedger",
      "Viral flash deals trending in community channels or Telegram groups.": "Native"
    },
    "q_ecom_delivery": {
      "Standard tracked shipping\u2014I refuse to pay convenience fees for fast dispatch.": "Analyzer",
      "Pristine, tamper-proof packaging ensuring the product arrives in mint condition.": "Stylist",
      "Open-Box Delivery or doorstep inspection before confirming receipt.": "Hedger",
      "Ultra-fast fulfillment via 10-to-30 minute quick commerce (Blinkit/Zepto).": "Native"
    },
    "q_ecom_reviews": {
      "Filtering by critical 2-star & 3-star reviews and searching Reddit for faults.": "Analyzer",
      "Scanning user-uploaded photos to inspect real-world colors and build finish.": "Stylist",
      "Checking verified buyer badges, seller return track records, and return windows.": "Hedger",
      "Reading top comments on video reviews to see unedited community consensus.": "Native"
    },
    "q_ecom_abandon": {
      "Unexpected platform handling fees or delivery charges that skew the value.": "Analyzer",
      "A cluttered, outdated checkout interface that feels untrustworthy.": "Stylist",
      "Lack of secure buyer protection, missing return policy, or disabled COD.": "Hedger",
      "A quick chat with friends or community groups warning against the brand.": "Native"
    },
    "q_ecom_payment": {
      "Co-branded cashback credit cards to maximize points and dispute protection.": "Analyzer",
      "Sleek 1-click biometric payments (Apple Pay / Google Pay / saved tokenized cards).": "Stylist",
      "Cash on Delivery (COD) or Pay-on-Delivery UPI after inspecting the box.": "Hedger",
      "Instant direct UPI QR scan\u2014frictionless, quick, and verified on my phone.": "Native"
    },
    "q_ecom_loyalty": {
      "Rock-solid durability and specifications that outlast the price paid.": "Analyzer",
      "Distinctive aesthetic identity, premium unboxing, and design detail.": "Stylist",
      "Frictionless replacement policies and prompt customer service via WhatsApp.": "Hedger",
      "An authentic founder story, transparent mission, and active community.": "Native"
    },
    "q_ecom_impulse": {
      "An undeniable pricing glitch or verified historical low on a price tracker.": "Analyzer",
      "A visually striking item that elevates your workspace, wardrobe, or setup.": "Stylist",
      "A risk-free trial offer with guaranteed free doorstep returns.": "Hedger",
      "A product going viral on your feed that everyone is currently talking about.": "Native"
    }
  };
  for (var qId in answersObj) {
    if (answersObj.hasOwnProperty(qId) && mapping[qId] && mapping[qId][answersObj[qId]]) {
      var persona = mapping[qId][answersObj[qId]];
      scores[persona]++;
    }
  }
  var topBadge = "Analyzer";
  var maxScore = -1;
  for (var badge in scores) {
    if (scores.hasOwnProperty(badge) && scores[badge] > maxScore) {
      maxScore = scores[badge];
      topBadge = badge;
    }
  }
  return topBadge;
}

async function handleSurveySubmission(e) {
  if (e) e.preventDefault();

  if ((Date.now() - surveyStartTime) < QUALITY_THRESHOLD_MS) {
    showToast("Please take more time to read the questions carefully.", "!");
    return;
  }

  if (!validateCurrentSectionAnswers()) {
    showToast(getUIText("validationRequired"), "!");
    return;
  }

  if (claimForm) { claimForm.classList.add("hidden"); claimForm.style.display = "none"; }
  
  var excitementBanner = document.getElementById("excitementBanner");
  if(excitementBanner) excitementBanner.style.display = "none";

  var animOverlay = document.getElementById("rewardAnimationOverlay");
  if (animOverlay) animOverlay.style.display = "flex";

  var referralCodeUsed = localStorage.getItem("referralCode") || "";
  var durationSeconds = Math.floor((Date.now() - surveyStartTime) / 1000);

  var finalPayload = {
    email: userEmailAddress,
    survey_data: answers,
    referredBy: referralCodeUsed,
    legal_consent: true,
    consent_timestamp: legalConsentTimestamp || new Date().toISOString(),
    user_agent: clientUserAgent || navigator.userAgent,
    startTime: surveyStartTime, 
    submissionTime: Date.now(),
    duration_seconds: durationSeconds,
    persona_badge: determinePersonaBadge(answers)
  };

  try {
    var response = await fetchWithTimeout(API_BASE_URL + "/api/submit-survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalPayload)
    });

    var result = await response.json();
    
    setTimeout(async function() {
      if (animOverlay) animOverlay.style.display = "none";
      if (result.success) {
        if (statusDiv) statusDiv.innerHTML = "";
        window.hasCompletedSurvey = true;

        // Dynamic Reward Toast from backend
        var rewardAmount = result.rewarded || 0;
        var toast = document.getElementById('xpFloatingToast');
        if (toast && rewardAmount > 0) {
          var toastAmountEl = document.getElementById('xpToastAmount');
          var toastReasonEl = document.getElementById('xpToastReason');
          if (toastAmountEl) { toastAmountEl.innerText = "+" + rewardAmount + " SYNX"; toastAmountEl.style.color = "#10b981"; }
          if (toastReasonEl) toastReasonEl.innerText = "AI Matrix Completed!";
          toast.style.display = 'flex';
          setTimeout(function() { toast.classList.add('show'); }, 10);
          setTimeout(function() { toast.classList.remove('show'); setTimeout(function() { toast.style.display = 'none'; }, 600); }, 4000);
        } else if (toast && rewardAmount === 0) {
          var toastAmountEl = document.getElementById('xpToastAmount');
          var toastReasonEl = document.getElementById('xpToastReason');
          if (toastAmountEl) { toastAmountEl.innerText = "+0 SYNX"; toastAmountEl.style.color = "#ef4444"; }
          if (toastReasonEl) toastReasonEl.innerText = result.warning || "Flagged for manual review.";
          toast.style.display = 'flex';
          setTimeout(function() { toast.classList.add('show'); }, 10);
          setTimeout(function() { toast.classList.remove('show'); setTimeout(function() { toast.style.display = 'none'; }, 600); }, 4000);
        }

        await runProfileLedgerVerification(userEmailAddress, false);
      } else {
        if (claimForm) { claimForm.classList.remove("hidden"); claimForm.style.display = "block"; }
        showToast((result.error || "Submission rejected by registry backend."), "X");
      }
    }, 3500);
  } catch (err) {
    if (animOverlay) animOverlay.style.display = "none";
    if (claimForm) { claimForm.classList.remove("hidden"); claimForm.style.display = "block"; }
    showToast("Network transaction failed.", "X");
  }
}

function translatePage() {
  if (typeof translations === "undefined" || !translations[currentLanguage]) return;
  var dict = translations[currentLanguage];

  var mainTitleEl = document.getElementById("mainTitle");
  var mainSubtitleEl = document.getElementById("mainSubtitle");
  if (mainTitleEl && dict.mainTitle) mainTitleEl.innerHTML = dict.mainTitle;
  if (mainSubtitleEl && dict.mainSubtitle) mainSubtitleEl.innerHTML = dict.mainSubtitle;

  /* FIX: Override stale translation strings for mainTitle & mainSubtitle */
  if (mainTitleEl && mainTitleEl.innerHTML.indexOf("Consumer Analytics Hub") !== -1) {
    mainTitleEl.innerHTML = mainTitleEl.innerHTML; /* keep title as-is */
  }
  if (mainSubtitleEl) {
    var sub = mainSubtitleEl.innerHTML;
    if (sub.indexOf("Complete all 6") !== -1 || sub.indexOf("consumer research modules") !== -1 || sub.indexOf("token allocation") !== -1) {
      mainSubtitleEl.innerHTML = sub
        .replace(/Complete all 6 consumer research modules to secure your/gi, "Process your complete digital footprint across the Syntrix intelligence matrix\u2014including identity and research protocols\u2014to secure your")
        .replace(/token allocation/gi, "allocation");
    }
  }

  var emailSectionTitleEl = document.querySelector("#emailGateSection .sectionTitle");
  if (emailSectionTitleEl && dict.emailSectionTitle) emailSectionTitleEl.innerText = dict.emailSectionTitle;
  
  var startSurveyBtnEl = document.getElementById("startSurveyBtn");
  if (startSurveyBtnEl && dict.btnStart) startSurveyBtnEl.innerHTML = dict.btnStart;

  var prevBtnEl = document.getElementById("prevBtn");
  var nextBtnEl = document.getElementById("nextBtn");
  var submitClaimBtnEl = document.getElementById("submitClaimBtn");
  if (prevBtnEl && dict.previous) prevBtnEl.innerHTML = "&lt; " + dict.previous;
  if (nextBtnEl && dict.next) nextBtnEl.innerHTML = dict.next + " &gt;";
  if (submitClaimBtnEl && dict.submit) submitClaimBtnEl.innerHTML = dict.submit;

  var rewardTitleEl = document.getElementById("claimTitle");
  var rewardSubtitleEl = document.getElementById("rewardSubtitleDesc");
  if (rewardTitleEl && dict.claimTitle) rewardTitleEl.innerHTML = dict.claimTitle;
  if (rewardSubtitleEl && dict.rewardSubtitle) rewardSubtitleEl.innerHTML = dict.rewardSubtitle;

  var connectWalletBtnEl = document.querySelector("#connectWalletBtn span");
  if (connectWalletBtnEl && dict.metaMaskLabel) connectWalletBtnEl.innerText = dict.metaMaskLabel;
  
  var manualLabelEl = document.querySelector(".manualWalletWrapper .dividerLine span");
  if (manualLabelEl && dict.manualLabel) manualLabelEl.innerText = dict.manualLabel;
  
  var executeClaimBtnEl = document.getElementById("executeClaimBtn");
  if (executeClaimBtnEl && dict.btnExecute) executeClaimBtnEl.innerText = dict.btnExecute;
  
  var referralTitleEl = document.querySelector(".referralContainer .dividerLine span");
  if (referralTitleEl && dict.referralTitle) referralTitleEl.innerText = dict.referralTitle;

  var referralDescriptionEl = document.getElementById("referralSubText");
  if (referralDescriptionEl && dict.referralSub) referralDescriptionEl.innerHTML = dict.referralSub;
  
  var copyReferralBtnEl = document.getElementById("copyReferralBtn");
  if (copyReferralBtnEl && dict.btnCopy) copyReferralBtnEl.innerText = dict.btnCopy;

  var modalTitleEl = document.querySelector("#retrieveModal .modal-header h2");
  if (modalTitleEl && dict.modalTitle) modalTitleEl.innerText = dict.modalTitle;
  
  var modalSubEl = document.querySelector("#retrieveModal .modal-subtitle");
  if (modalSubEl && dict.modalSub) modalSubEl.innerText = dict.modalSub;
  
  var modalDetailsTitleEl = document.querySelector("#retrieveModal .extra-details-box h4");
  if (modalDetailsTitleEl && dict.modalDetailsTitle) modalDetailsTitleEl.innerText = dict.modalDetailsTitle;
  
  var cancelModalBtnEl = document.getElementById("cancelModalBtn");
  if (cancelModalBtnEl && dict.btnCancel) cancelModalBtnEl.innerText = dict.btnCancel;
  
  var confirmRetrieveBtnEl = document.getElementById("confirmRetrieveBtn");
  if (confirmRetrieveBtnEl && dict.btnSearch) confirmRetrieveBtnEl.innerText = dict.btnSearch;
}

function resetApplicationFlowState() {
  if (emailGateForm) emailGateForm.reset();
  localStorage.removeItem("syntrix_user_email");
  localStorage.removeItem("referralCode");
  
  if (statusDiv) statusDiv.innerHTML = "";
  
  userEmailAddress = "";
  currentSection = 0;
  isOtpSent = false;
  legalConsentTimestamp = "";
  clientUserAgent = ""; 
  window.hasCompletedSurvey = false;
  
  var otpSection = document.getElementById("otpSection");
  if (otpSection) {
      otpSection.classList.add("hidden");
      otpSection.style.display = "none";
  }
  
  if (preVerifyBtn) {
    preVerifyBtn.classList.remove("hidden");
    preVerifyBtn.style.display = "block";
    preVerifyBtn.disabled = false;
    preVerifyBtn.innerText = "Send Verification Code \u2192";
  }
  
  if (startSurveyBtn) {
    startSurveyBtn.classList.add("hidden");
    startSurveyBtn.style.display = "none";
    startSurveyBtn.disabled = false;
    startSurveyBtn.innerHTML = "Verify & Enter &rarr;";
  }
  
  if (gateEmailInput) gateEmailInput.readOnly = false;
  
  for (var prop in answers) {
      if (Object.prototype.hasOwnProperty.call(answers, prop)) {
          delete answers[prop];
      }
  }
  
  if (emailGateSection) {
      emailGateSection.classList.remove("hidden");
      emailGateSection.style.display = "flex";
  }
  
  var dashboardCards = ["rewardDashboardScreen", "tabScreenBadge", "tabScreenReferrals", "tabScreenMoreSurveys", "claimScreenSection", "gatewayScreenSection", "documentModeSection", "selfieModeSection", "tabScreenXP"];
  dashboardCards.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.add("hidden"); el.style.display = "none"; }
  });

  if (claimForm) {
      claimForm.classList.add("hidden");
      claimForm.style.display = "none";
  }
  if (topProgressBox) {
      topProgressBox.classList.add("hidden");
      topProgressBox.style.display = "none";
  }
  
  var tabLinksContainer = document.getElementById("dashboardTabLinks");
  if (tabLinksContainer) {
      tabLinksContainer.classList.add("hidden");
      tabLinksContainer.style.display = "none";
  }
  
  // Hide auth-protected UI
  var authEls = document.querySelectorAll(".auth-protected-ui");
  authEls.forEach(function(el) { el.style.display = "none"; });
  
  var menuReferralWrapper = document.getElementById("menuReferralWrapper");
  if (menuReferralWrapper) menuReferralWrapper.style.display = "none";
  
  if (mainApplicationLayout) {
      mainApplicationLayout.classList.remove("app-enter");
      mainApplicationLayout.classList.add("hidden");
      mainApplicationLayout.style.display = "none";
  }
  if (splashLandingGate) {
      splashLandingGate.classList.remove("splash-exit");
      splashLandingGate.style.display = "flex";
  }
  routeSplashNavViews("home");
  showToast("Account profiles successfully signed out.", "OK");
}

// ================= LIFE CYCLE REGISTRATION RUNNERS & EVENT ROUTERS =================
document.addEventListener("DOMContentLoaded", async function() {
  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    google.accounts.id.initialize({
      client_id: "163483233818-hd35sh66a6bu5polfuorbr7h1j81iusp.apps.googleusercontent.com",
      callback: window.handleGoogleCredentialResponse,
      use_fedcm_for_prompt: true,
      auto_select: false
    });
  }

  var urlParams = new URLSearchParams(window.location.search);
  var claimToken = urlParams.get("token");
  var refParam = urlParams.get("ref");
  
  if (refParam) {
    localStorage.setItem("referralCode", normalizeReferralCode(refParam));
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  var savedRefCode = localStorage.getItem("referralCode");
  if (savedRefCode && referredByCodeInput) referredByCodeInput.value = savedRefCode;

  document.querySelectorAll(".tab-btn").forEach(function(btn) {
    btn.addEventListener("click", function(e) {
      var target = e.currentTarget.dataset.tab;
      if (target) {
        if (target === 'survey' && window.hasCompletedSurvey) {
            showToast("Survey already completed. Redirecting to Survey Matrix...", "OK");
            routeDashboardTabs('more-surveys');
        } else {
            routeDashboardTabs(target);
        }
        if(optionsPopover) {
          optionsPopover.classList.add("hidden");
          optionsPopover.style.display = "none";
        }
        // Trigger XP animation when XP tab clicked
        if (target === 'xp' && typeof XPAnimator !== 'undefined') {
          setTimeout(function() { XPAnimator.replayAnimations(); }, 100);
        }
      }
    });
  });

  if (claimToken) {
    if (emailGateSection) { emailGateSection.classList.add("hidden"); emailGateSection.style.display = "none"; }
    if (claimForm) { claimForm.classList.add("hidden"); claimForm.style.display = "none"; }
    if (topProgressBox) { topProgressBox.classList.add("hidden"); topProgressBox.style.display = "none"; }
    if (gatewayScreenSection) { gatewayScreenSection.classList.add("hidden"); gatewayScreenSection.style.display = "none"; }
    if (documentModeSection) { documentModeSection.classList.add("hidden"); documentModeSection.style.display = "none"; }
    if (selfieModeSection) { selfieModeSection.classList.add("hidden"); selfieModeSection.style.display = "none"; }
    
    var dashboardCards = ["rewardDashboardScreen", "tabScreenBadge", "tabScreenReferrals", "tabScreenMoreSurveys", "tabScreenXP"];
    dashboardCards.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) { el.classList.add("hidden"); el.style.display = "none"; }
    });
  } else {
    if (splashLandingGate) {
        splashLandingGate.style.display = "flex";
    }
    if (mainApplicationLayout) {
        mainApplicationLayout.style.display = "none";
        mainApplicationLayout.classList.add("hidden");
    }
    routeSplashNavViews("home");
  }

  // OTP SEND & VERIFY LOGIC
  if (preVerifyBtn) {
    preVerifyBtn.addEventListener("click", async function(e) {
      e.preventDefault();
      var emailVal = gateEmailInput.value.trim().toLowerCase();
      if (!emailVal || !EMAIL_REGEX.test(emailVal)) {
        showToast("Please enter a valid email address.", "!");
        return;
      }

      preVerifyBtn.disabled = true;
      preVerifyBtn.innerText = "Sending Code...";

      try {
        var response = await fetch(API_BASE_URL + "/api/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailVal })
        });
        
        var data = await response.json();
        
        if (data.success) {
          showToast("Verification code sent to your email!", "OK");
          isOtpSent = true;
          userEmailAddress = emailVal;
          gateEmailInput.readOnly = true;
          
          preVerifyBtn.classList.add("hidden");
          preVerifyBtn.style.display = "none";
          
          if (startSurveyBtn) {
            startSurveyBtn.classList.remove("hidden");
            startSurveyBtn.style.display = "flex";
          }
          
          var otpSection = document.getElementById("otpSection");
          if (otpSection) {
            otpSection.classList.remove("hidden");
            otpSection.style.setProperty("display", "flex", "important");
            void otpSection.offsetWidth;
            otpSection.style.opacity = "1";
            otpSection.style.pointerEvents = "auto";
          }
        } else {
          showToast(data.error || "Failed to send code. Try again.", "X");
          preVerifyBtn.disabled = false;
          preVerifyBtn.innerText = "Send Verification Code \u2192";
          var otpFail = document.getElementById("otpSection");
          if (otpFail) { otpFail.style.setProperty("display", "none", "important"); otpFail.style.opacity = "0"; otpFail.style.pointerEvents = "none"; otpFail.classList.add("hidden"); }
        }
      } catch (err) {
        showToast("Network error. Please try again.", "X");
        preVerifyBtn.disabled = false;
        preVerifyBtn.innerText = "Send Verification Code \u2192";
        var otpFail = document.getElementById("otpSection");
        if (otpFail) { otpFail.style.setProperty("display", "none", "important"); otpFail.style.opacity = "0"; otpFail.style.pointerEvents = "none"; otpFail.classList.add("hidden"); }
      }
    });
  }

  if (startSurveyBtn) {
    startSurveyBtn.addEventListener("click", async function(e) {
      e.preventDefault();
      if (!isOtpSent) return;

      var otpVal = document.getElementById("gateOtp").value.trim();
      if (!otpVal || otpVal.length < 6) {
        showToast("Please enter the 6-digit code.", "!");
        return;
      }

      startSurveyBtn.disabled = true;
      startSurveyBtn.innerText = "Verifying...";

      var referralCodeVal = document.getElementById("referredByCode") ? document.getElementById("referredByCode").value.trim() : "";

      try {
        var response = await fetch(API_BASE_URL + "/api/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmailAddress, otp: otpVal, referral_code: referralCodeVal })
        });

        var data = await response.json();

        if (data.success) {
          if(referralCodeVal) localStorage.setItem("referralCode", normalizeReferralCode(referralCodeVal));

          if(splashLandingGate) splashLandingGate.style.display = "none"; 
          if(mainApplicationLayout) {
              mainApplicationLayout.classList.remove("hidden");
              mainApplicationLayout.style.display = "block"; 
          }
          
          await runProfileLedgerVerification(userEmailAddress, false);
        } else {
          showToast(data.error || "Invalid OTP code.", "X");
          startSurveyBtn.disabled = false;
          startSurveyBtn.innerHTML = "Verify & Enter &rarr;";
        }
      } catch (err) {
        showToast("Network error. Please try again.", "X");
        startSurveyBtn.disabled = false;
        startSurveyBtn.innerHTML = "Verify & Enter &rarr;";
      }
    });
  }

  if (nextBtn) nextBtn.onclick = function() { handleNextSection(); };
  if (prevBtn) prevBtn.onclick = function() { handlePrevSection(); };
  if (claimForm) {
    claimForm.addEventListener("submit", function(e) {
      e.preventDefault();
      handleSurveySubmission(e);
    });
  }
  
  if (connectWalletBtn) connectWalletBtn.addEventListener("click", interceptClaimGateActions);
  if (claimConnectWalletBtn) claimConnectWalletBtn.addEventListener("click", interceptClaimGateActions);
  if (executeClaimBtn) executeClaimBtn.addEventListener("click", interceptClaimGateActions);
  if (submitClaimRewardBtn) submitClaimRewardBtn.addEventListener("click", interceptClaimGateActions);
  
  if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener("click", function() { resetApplicationFlowState(); });
  
  if (copyReferralBtn) {
      copyReferralBtn.onclick = function() {
        if (!referralCodeDisplay) return;
        referralCodeDisplay.select(); 
        referralCodeDisplay.setSelectionRange(0, 99999);
        try {
          navigator.clipboard.writeText(referralCodeDisplay.value);
          var originalText = copyReferralBtn.innerText; 
          copyReferralBtn.innerText = "Copied!";
          setTimeout(function() { copyReferralBtn.innerText = originalText; }, 2000);
        } catch (err) { showToast("Failed to access system registers.", "X"); }
      };
  }

  if (generateQrBtn) {
    generateQrBtn.addEventListener("click", function() {
      var shopRefCode = localStorage.getItem("referralCode");
      if (!shopRefCode) {
        showToast("Referral link not found. Please log in to your shop account.", "X");
        return;
      }
      
      qrCodeWrapper.style.display = "flex";
      qrCodeCanvas.innerHTML = "";
      
      var dynamicQrLink = API_BASE_URL + "/r/" + shopRefCode;
      
      new QRCode(qrCodeCanvas, {
        text: dynamicQrLink,
        width: 256,
        height: 256,
        colorDark: "#111827",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });

      qrCodeWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      showToast("Shop QR Code generated!", "OK");
    });
  }

  if (downloadQrBtn) {
    downloadQrBtn.addEventListener("click", function() {
      var originalCanvas = qrCodeCanvas.querySelector("canvas");

      if (!originalCanvas) {
        showToast("Please generate the QR code first.", "X");
        return;
      }

      var padding = 24; 
      var paddedCanvas = document.createElement("canvas");
      paddedCanvas.width = originalCanvas.width + (padding * 2);
      paddedCanvas.height = originalCanvas.height + (padding * 2);
      
      var ctx = paddedCanvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
      ctx.drawImage(originalCanvas, padding, padding);

      var downloadUrl = paddedCanvas.toDataURL("image/png");
      
      var tempLink = document.createElement("a");
      tempLink.href = downloadUrl;
      tempLink.download = "Syntrix_Dealer_QR.png";
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      
      showToast("QR Code saved to gallery!", "OK");
    });
  }

  var menuCopyReferralBtn = document.getElementById("menuCopyReferralBtn");
  var menuReferralInputDisplay = document.getElementById("menuReferralInputDisplay");
  if (menuCopyReferralBtn && menuReferralInputDisplay) {
    menuCopyReferralBtn.onclick = function(e) {
      e.stopPropagation();
      var refLink = menuReferralInputDisplay.value;
      if (refLink) {
        navigator.clipboard.writeText(refLink);
        menuCopyReferralBtn.innerText = "Copied!";
        menuCopyReferralBtn.style.background = "#10b981";
        setTimeout(function() { 
            menuCopyReferralBtn.innerText = "Copy"; 
            menuCopyReferralBtn.style.background = "#111827";
        }, 2000);
      }
    };
  }

  if (menuToggleBtn && optionsPopover) {
    menuToggleBtn.onclick = function(e) { 
        e.stopPropagation(); 
        toggleSettingsMenu();
    };
    document.addEventListener("click", function(e) {
        if(optionsPopover && !optionsPopover.contains(e.target) && e.target !== menuToggleBtn) {
          optionsPopover.classList.add("hidden");
          optionsPopover.style.display = "none";
        }
    });
  }

  if (menuRestartBtn) {
    menuRestartBtn.onclick = function() { 
      if(optionsPopover) {
          optionsPopover.classList.add("hidden"); 
          optionsPopover.style.display = "none";
      }
      if(confirmRestartModal) {
          confirmRestartModal.classList.remove("hidden"); 
          confirmRestartModal.style.display = "flex";
      }
    };
  }
  if (cancelRestartBtn) {
    cancelRestartBtn.onclick = function() {
      if(confirmRestartModal) {
          confirmRestartModal.classList.add("hidden");
          confirmRestartModal.style.display = "none";
      }
    };
  }
  if (confirmRestartBtn) {
    confirmRestartBtn.onclick = function() {
      if(confirmRestartModal) {
          confirmRestartModal.classList.add("hidden");
          confirmRestartModal.style.display = "none";
      }
      resetApplicationFlowState();
    };
  }

  if (menuRecoverBtn && retrieveModal) {
    menuRecoverBtn.onclick = function() {
      if(optionsPopover) {
          optionsPopover.classList.add("hidden"); 
          optionsPopover.style.display = "none";
      }
      retrieveModal.classList.remove("hidden");
      retrieveModal.style.display = "flex";
      if (modalEmailInput) modalEmailInput.value = ""; 
      if (modalStatus) modalStatus.innerHTML = "";
      
      if (confirmRetrieveBtn) {
        confirmRetrieveBtn.onclick = async function() {
          var searchEmail = modalEmailInput ? modalEmailInput.value.trim().toLowerCase() : "";
          if (!searchEmail || !EMAIL_REGEX.test(searchEmail)) {
            showToast("Please provide a valid email structure.", "X");
            return;
          }
          if (splashLandingGate) splashLandingGate.style.display = "none";
          if (mainApplicationLayout) {
              mainApplicationLayout.classList.remove("hidden");
              mainApplicationLayout.style.display = "block";
          }
          
          var originalText = confirmRetrieveBtn.innerText;
          confirmRetrieveBtn.innerText = "Searching...";
          confirmRetrieveBtn.disabled = true;
          
          await runProfileLedgerVerification(searchEmail, true);
          
          confirmRetrieveBtn.innerText = originalText;
          confirmRetrieveBtn.disabled = false;
        };
      }
    };
  }

  if (closeModalBtn) closeModalBtn.onclick = function() { dismissModal(); };
  if (cancelModalBtn) cancelModalBtn.onclick = function() { dismissModal(); };

  var langButtons = document.querySelectorAll(".langBtn");
  langButtons.forEach(function(btn) {
    btn.addEventListener("click", function(e) {
      langButtons.forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active"); currentLanguage = btn.dataset.lang;
      if (typeof translatePage === "function") translatePage();
      updateExcitementBanner(currentSection); 
      if (claimForm && claimForm.style.display !== "none") renderSection();
    });
  });
});

// ================= DOCUMENT MODE API LOGIC =================
var taskTypeSelect = document.getElementById('taskType');
var fileInputCamera = document.getElementById('fileInputCamera');
var fileInputGallery = document.getElementById('fileInputGallery');
var fileInputSelfie = document.getElementById('fileInputSelfie'); 
var previewContainer = document.getElementById('previewContainer');
var imagePreview = document.getElementById('imagePreview');

var submitDocBtn = document.getElementById('submitDocBtn');
var submitSelfieBtn = document.getElementById('submitSelfieBtn'); 

var statusMessage = document.getElementById('statusMessage');
var detailedReasonBox = document.getElementById('detailedReasonBox');
var retryUploadBtn = document.getElementById('retryUploadBtn');

var statusMessageSelfie = document.getElementById('statusMessageSelfie');
var detailedReasonBoxSelfie = document.getElementById('detailedReasonBoxSelfie');
var retryUploadBtnSelfie = document.getElementById('retryUploadBtnSelfie');

var selectedFile = null;
var selectedFiles = []; // Multi-image batch support
var currentPollInterval = null;
var isUploadingSelfie = false;

window.resetUploadState = function(keepInputs) {
    if (keepInputs === undefined) keepInputs = false;
    if (!keepInputs) {
      selectedFile = null;
      selectedFiles = [];
      if (fileInputCamera) fileInputCamera.value = '';
      if (fileInputGallery) fileInputGallery.value = '';
      if (fileInputSelfie) fileInputSelfie.value = '';
      
      // Remove multi-preview grid if it exists
      var multiPreview = document.getElementById('multiPreviewGrid');
      if (multiPreview) multiPreview.remove();
      
      if (previewContainer) {
          previewContainer.style.display = 'none';
          previewContainer.classList.add('hidden'); 
      }
      if (imagePreview) {
          imagePreview.src = '';
          imagePreview.classList.add('hidden'); 
          imagePreview.style.setProperty('display', 'none', 'important');
      }
      
      var selfieImg = document.getElementById('selfieResultImg');
      if (selfieImg) {
          selfieImg.src = '';
          selfieImg.classList.add('hidden');
          selfieImg.style.display = 'none';
      }

      var scannerOuter = document.querySelector('.scanner-circle-outer');
      var scannerInner = document.querySelector('.scanner-circle-inner');
      if (scannerOuter) scannerOuter.style.display = 'flex';
      if (scannerInner) scannerInner.style.display = 'flex';

      var btnSelfieTextContent = document.getElementById('btnSelfieTextContent');
      if (btnSelfieTextContent) {
          btnSelfieTextContent.innerText = "Take a Photo";
      }

      var clearSelfieBtn = document.getElementById('clearSelfieBtn');
      if (clearSelfieBtn) clearSelfieBtn.style.display = 'none';
    }
    
    if (submitDocBtn) {
        submitDocBtn.disabled = true;
        submitDocBtn.innerText = 'Approve & Submit to Waiting Room';
        submitDocBtn.classList.remove('hidden');
        submitDocBtn.style.display = 'flex'; 
    }

    if (submitSelfieBtn) {
        submitSelfieBtn.disabled = true;
        submitSelfieBtn.innerText = 'Verify & Submit to Waiting Room';
        submitSelfieBtn.classList.remove('hidden');
        submitSelfieBtn.style.display = 'flex'; 
    }
    
    if (statusMessage) {
        statusMessage.innerHTML = '';
        statusMessage.className = 'status-message'; 
    }
    if (statusMessageSelfie) {
        statusMessageSelfie.innerHTML = '';
        statusMessageSelfie.className = 'status-message'; 
    }
    
    if (detailedReasonBox) {
        detailedReasonBox.style.display = 'none';
        detailedReasonBox.classList.add('hidden');
        detailedReasonBox.innerText = '';
        detailedReasonBox.className = 'dynamic-reason-box';
    }
    if (detailedReasonBoxSelfie) {
        detailedReasonBoxSelfie.style.display = 'none';
        detailedReasonBoxSelfie.classList.add('hidden');
        detailedReasonBoxSelfie.innerText = '';
        detailedReasonBoxSelfie.className = 'dynamic-reason-box';
    }
    
    if (retryUploadBtn) {
        retryUploadBtn.style.display = 'none';
        retryUploadBtn.classList.add('hidden');
    }
    if (retryUploadBtnSelfie) {
        retryUploadBtnSelfie.style.display = 'none';
        retryUploadBtnSelfie.classList.add('hidden');
    }
    
    if (currentPollInterval) clearInterval(currentPollInterval);
};

if (retryUploadBtn) {
    retryUploadBtn.addEventListener('click', function() { resetUploadState(false); });
}
if (retryUploadBtnSelfie) {
    retryUploadBtnSelfie.addEventListener('click', function() { resetUploadState(false); });
}

function handleFileSelection(e) {
  if (e.target.files && e.target.files.length > 0) {
    var isSelfieUpload = e.target.id === 'fileInputSelfie';
    isUploadingSelfie = isSelfieUpload;
    resetUploadState(true); 

    if (isSelfieUpload) {
      // ---- SELFIE: Single file only (original behavior) ----
      selectedFile = e.target.files[0];
      selectedFiles = [selectedFile];

      if (submitSelfieBtn) {
          submitSelfieBtn.disabled = false;
          submitSelfieBtn.classList.remove('hidden');
      }
      var btnSelfieTextContent = document.getElementById('btnSelfieTextContent');
      if (btnSelfieTextContent) {
          btnSelfieTextContent.innerText = "Retake Photo";
      }      try {
        var url = URL.createObjectURL(selectedFile);
        var scannerOuter = document.getElementById('scannerCircleOuter');
        var scannerInner = document.getElementById('scannerCircleInner');
        var videoEl = document.getElementById('selfieCameraVideo');
        var defaultIcon = document.getElementById('scannerDefaultIcon');
        
        // Hide camera elements
        if (videoEl) videoEl.style.display = 'none';
        if (defaultIcon) defaultIcon.style.display = 'none';
        if (scannerOuter) {
            scannerOuter.classList.remove("streaming", "angle-locked");
            scannerOuter.style.display = "flex"; 
        }
        if (scannerInner) scannerInner.style.display = "flex";
        
        // Ensure the image exists and force it inside the scanner circle
        var selfieImg = document.getElementById('selfieResultImg');
        if (!selfieImg) {
            selfieImg = document.createElement('img');
            selfieImg.id = 'selfieResultImg';
        }
        if (scannerInner && selfieImg.parentNode !== scannerInner) {
            scannerInner.appendChild(selfieImg);
        }
        
        // Style and reveal the image
        if (selfieImg) {
            selfieImg.style.cssText = "width: 100%; height: 100%; object-fit: cover; border-radius: 50%; position: relative; z-index: 10;";
            selfieImg.src = url;
            selfieImg.classList.remove('hidden'); // CRITICAL: Kills the CSS kill-switch
            selfieImg.style.display = 'block';
        }
        
        var clearSelfieBtn = document.getElementById('clearSelfieBtn');
        if (clearSelfieBtn) clearSelfieBtn.style.display = 'flex';
      } catch(err) {
        console.error("Preview generation failed:", err);
      }

    } else {
      // ---- DOCUMENT: Multi-file support (up to 5) ----
      var fileList = Array.from(e.target.files);
      if (fileList.length > 5) {
        fileList = fileList.slice(0, 5);
        showToast("Maximum 5 images per batch. First 5 selected.", "!");
      }
      selectedFile = fileList[0]; // backward compat
      selectedFiles = fileList;

      if (submitDocBtn) {
          submitDocBtn.disabled = false;
          submitDocBtn.classList.remove('hidden'); 
          submitDocBtn.style.display = 'flex';
          if (fileList.length > 1) {
            submitDocBtn.innerText = 'Approve & Submit ' + fileList.length + ' Files';
          }
      }

      try {
        if (fileList.length === 1) {
          // Single file â€” original preview behavior
          var url = URL.createObjectURL(fileList[0]);
          if (imagePreview) {
              imagePreview.src = url;
              imagePreview.classList.remove('hidden'); 
              imagePreview.style.display = 'block';
          }
          if (previewContainer) {
              previewContainer.classList.remove('hidden'); 
              previewContainer.style.display = 'flex';
          }
        } else {
          // Multi-file â€” render thumbnail grid
          if (imagePreview) {
              imagePreview.src = '';
              imagePreview.style.setProperty('display', 'none', 'important');
          }
          if (previewContainer) {
              previewContainer.classList.remove('hidden');
              previewContainer.style.display = 'flex';
          }

          var oldGrid = document.getElementById('multiPreviewGrid');
          if (oldGrid) oldGrid.remove();

          var grid = document.createElement('div');
          grid.id = 'multiPreviewGrid';
          grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px; width: 100%; padding: 10px 0;';

          fileList.forEach(function(file, idx) {
            var thumb = document.createElement('div');
            thumb.style.cssText = 'position: relative; border-radius: 10px; overflow: hidden; border: 1px solid #27272a; aspect-ratio: 1; background: #18181b;';
            var img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
            var badge = document.createElement('div');
            badge.style.cssText = 'position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.7); color: #a1a1aa; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px;';
            badge.innerText = (idx + 1) + '/' + fileList.length;
            thumb.appendChild(img);
            thumb.appendChild(badge);
            grid.appendChild(thumb);
          });

          if (previewContainer) {
            previewContainer.appendChild(grid);
          }
        }
      } catch(err) {
        console.error("Preview generation failed:", err);
      }
    }
  }
}

if (fileInputCamera) fileInputCamera.addEventListener('change', handleFileSelection);
if (fileInputGallery) fileInputGallery.addEventListener('change', handleFileSelection);
if (fileInputSelfie) fileInputSelfie.addEventListener('change', handleFileSelection);

async function compressImageForBackend(file, maxWidth, quality) {
  // ---- NEW: Use browser-image-compression if available ----
  if (typeof imageCompression === 'function') {
    try {
      var compressedBlob = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg'
      });
      return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.readAsDataURL(compressedBlob);
        reader.onload = function() { resolve(reader.result); };
        reader.onerror = function(err) { reject(err); };
      });
    } catch (compErr) {
      console.warn('[COMPRESS] browser-image-compression failed, using canvas fallback:', compErr.message);
    }
  }

  // ---- FALLBACK: Original canvas compression ----
  if (maxWidth === undefined) maxWidth = 500;
  if (quality === undefined) quality = 0.4;
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(event) {
      var img = new Image();
      img.src = event.target.result;
      img.onload = function() {
        var canvas = document.createElement('canvas');
        var width = img.width;
        var height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = function(err) { reject(err); };
    };
    reader.onerror = function(err) { reject(err); };
  });
}

function updateProgressUI(stepText, percent, targetMsgBox) {
    if (!targetMsgBox) return;
    targetMsgBox.innerHTML = 
      '<div style="background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 20px; text-align: center; margin-top: 10px;">' +
          '<div style="display: flex; justify-content: center; margin-bottom: 15px;">' +
              '<div style="width: 40px; height: 40px; border: 3px solid rgba(99, 102, 241, 0.2); border-top-color: #6366f1; border-radius: 50%; animation: aiSpin 1s linear infinite;"></div>' +
          '</div>' +
          '<div style="font-size:12px; color:#a1a1aa; font-weight:700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">AI Processing Pipeline</div>' +
          '<div style="background:#09090b; height:6px; border-radius:4px; overflow:hidden; margin-bottom:15px; border: 1px solid #27272a;">' +
             '<div style="width: ' + percent + '%; background: linear-gradient(90deg, #6366f1, #a855f7); height:100%; transition: width 0.4s ease; box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);"></div>' +
          '</div>' +
          '<div style="font-weight:800; color:#f4f4f5; font-size:15px;" class="status-text-pulse">' + stepText + '</div>' +
      '</div>';
}

async function executeUploadLogic(e) {
    var isSelfieSubmit = (e && e.target && e.target.id === 'submitSelfieBtn') || (this && this.id === 'submitSelfieBtn');
    var activeStatusMsg = isSelfieSubmit ? statusMessageSelfie : statusMessage;
    var activeReasonBox = isSelfieSubmit ? detailedReasonBoxSelfie : detailedReasonBox;
    var activeRetryBtn = isSelfieSubmit ? retryUploadBtnSelfie : retryUploadBtn;

    var filesToUpload = isSelfieSubmit ? [selectedFile] : selectedFiles;

    if (!filesToUpload || filesToUpload.length === 0 || !filesToUpload[0] || !userEmailAddress) { 
      if (activeStatusMsg) activeStatusMsg.innerHTML = '<span style="color:#ef4444;">Please select a file and ensure you are logged in.</span>';
      return;
    }

    var taskType = isSelfieSubmit ? 'selfie' : (taskTypeSelect ? taskTypeSelect.value : 'notes');
    var contentTags = [];
    
    if (taskType === 'notes') {
      var consentSensitive = document.getElementById('consentSensitive');
      var consentCommercial = document.getElementById('consentCommercial');
      if ((consentSensitive && !consentSensitive.checked) || (consentCommercial && !consentCommercial.checked)) { 
          if (activeStatusMsg) activeStatusMsg.innerHTML = '<span style="color:#ef4444;">You must agree to the Legal Consents before uploading.</span>';
          return; 
      }
      var docLanguageInput = document.getElementById('docLanguageInput');
      if (docLanguageInput && docLanguageInput.value.trim() === "") { 
          if (activeStatusMsg) activeStatusMsg.innerHTML = '<span style="color:#ef4444;">Please specify the language used in the notes.</span>';
          return; 
      }
      var tagCheckboxes = document.querySelectorAll('.doc-tag:checked');
      tagCheckboxes.forEach(function(cb) { contentTags.push(cb.value); });
      if (contentTags.length === 0) { 
          if (activeStatusMsg) activeStatusMsg.innerHTML = '<span style="color:#ef4444;">Please select at least one content tag.</span>';
          return; 
      }
    } else if (taskType === 'selfie') {
      var consentAgeSelfie = document.getElementById('consentAgeSelfie');
      var consentSensitiveSelfie = document.getElementById('consentSensitiveSelfie');
      var consentCommercialSelfie = document.getElementById('consentCommercialSelfie');
      
      if ((consentAgeSelfie && !consentAgeSelfie.checked) || 
          (consentSensitiveSelfie && !consentSensitiveSelfie.checked) || 
          (consentCommercialSelfie && !consentCommercialSelfie.checked)) {
          if (activeStatusMsg) activeStatusMsg.innerHTML = '<span style="color:#ef4444;">You must agree to the Legal Consents before uploading.</span>';
          return; 
      }
    }

    if (submitDocBtn) submitDocBtn.disabled = true;
    if (submitSelfieBtn) submitSelfieBtn.disabled = true;

    // ---- SELFIE: Use original single-file legacy endpoint ----
    if (isSelfieSubmit) {
      updateProgressUI('Compressing and securing payload...', 15, activeStatusMsg);
      try {
        var base64String = await compressImageForBackend(selectedFile, 500, 0.4);
        var payload = {
          email: userEmailAddress,
          userEmail: userEmailAddress, 
          taskType: taskType, 
          fileName: selectedFile.name || 'capture.jpg', 
          imageBase64: base64String,
          contentTags: contentTags.length > 0 ? contentTags : ['none'],
          assignedTask: (isSelfieSubmit && window.currentSelfieTask) ? window.currentSelfieTask : null
        };

        var response = await fetch(API_BASE_URL + "/api/upload-task", {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });

        if (!response.ok) {
          var errorMsg = 'Upload rejected by server.';
          try {
              var data = await response.json();
              errorMsg = data.error || data.message || 'Server blocked request (Status ' + response.status + ')';
          } catch(parseErr) {
              errorMsg = 'Backend Firewall Blocked Request (Status ' + response.status + '). Payload might be too large.';
          }
          if (activeStatusMsg) activeStatusMsg.innerHTML = '<span style="color:#ef4444;">X <strong>' + errorMsg + '</strong></span>';
          if (submitDocBtn) submitDocBtn.disabled = false;
          if (submitSelfieBtn) submitSelfieBtn.disabled = false;
          return;
        }

        // ---- CRITICAL: WAKE UP THE BACKGROUND WORKER ----
        fetch(API_BASE_URL + "/api/public-wake", { method: 'POST' }).catch(e => console.log("Wake signal sent."));

        var attempts = 0;
        var maxAttempts = 120; // Increased to 360 seconds (120 * 3s) for cold-starts
        updateProgressUI('AI is verifying parameters...', 35, activeStatusMsg);
        if (currentPollInterval) clearTimeout(currentPollInterval);

        var pollStatus = async function() {
            attempts++;
            if(attempts === 2) updateProgressUI('Analyzing vectors and embeddings...', 60, activeStatusMsg);
            if(attempts === 5) updateProgressUI('Security & anti-spoofing verification...', 85, activeStatusMsg);

            try {
                var res = await fetch(API_BASE_URL + "/api/check-submission?email=" + encodeURIComponent(userEmailAddress));
                var checkData = await res.json();
                
                if (checkData.success && checkData.submission) {
                    var status = checkData.submission.status;
                    var reason = checkData.submission.reason || "System processing error.";
                    
                    if (status === 'verified' || status === 'approved') {
                        await runProfileLedgerVerification(userEmailAddress, false, true); 
                        if (submitDocBtn) submitDocBtn.style.display = 'none';
                        if (submitSelfieBtn) submitSelfieBtn.style.display = 'none';
                        var cleanReason = reason.split('|')[0].trim();
                        if (activeStatusMsg) {
                            activeStatusMsg.innerHTML = 
                                '<div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 25px 20px; text-align: center; animation: slideUpFade 0.5s ease-out; margin-top: 15px;">' +
                                    '<div style="width: 56px; height: 56px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);">' +
                                        '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
                                    '</div>' +
                                    '<div style="font-weight: 900; color: #10b981; font-size: 20px; margin-bottom: 5px; letter-spacing: -0.5px;">VERIFICATION SUCCESSFUL</div>' +
                                    '<div style="color: #a1a1aa; font-size: 14px; margin-bottom: 20px;">' + cleanReason + '</div>' +
                                    '<div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 12px; display: inline-block;">' +
                                        '<span style="color: #fbbf24; font-weight: 900; font-size: 18px;">+' + (isSelfieSubmit ? '40' : 'Up to 100') + ' SYNX</span>' +
                                        '<span style="color: #71717a; font-size: 11px; display: block; margin-top: 3px; font-weight: 600; text-transform: uppercase;">Tokens Assigned to Ledger</span>' +
                                    '</div>' +
                                '</div>';
                        }
                        if(activeReasonBox) activeReasonBox.style.display = 'none'; 
                        if (activeRetryBtn) activeRetryBtn.style.display = 'block'; 
                        return;
                    } 
                    else if (status === 'rejected' || status === 'rejected_pii' || status === 'fraud' || status === 'duplicate' || status === 'FAILED' || status === 'failed') {
                        if (submitDocBtn) submitDocBtn.style.display = 'none';
                        if (submitSelfieBtn) submitSelfieBtn.style.display = 'none';
                        if (activeStatusMsg) {
                            activeStatusMsg.innerHTML = 
                                '<div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 16px; padding: 25px 20px; text-align: center; animation: slideUpFade 0.5s ease-out; margin-top: 15px;">' +
                                    '<div style="width: 56px; height: 56px; background: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);">' +
                                        '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
                                    '</div>' +
                                    '<div style="font-weight: 900; color: #ef4444; font-size: 20px; margin-bottom: 5px; letter-spacing: -0.5px;">VERIFICATION FAILED</div>' +
                                    '<div style="color: #fca5a5; font-size: 14px; background: rgba(239, 68, 68, 0.1); padding: 10px; border-radius: 8px; margin-top: 15px;">' + reason + '</div>' +
                                '</div>';
                        }
                        if(activeReasonBox) activeReasonBox.style.display = 'none';
                        if (activeRetryBtn) activeRetryBtn.style.display = 'block';
                        return;
                    }
                }
                
                if (attempts >= maxAttempts) {
                    if (activeStatusMsg) activeStatusMsg.innerHTML = '<span style="color:#ea580c; font-weight:700;">AI timed out. Please check network and try again.</span>';
                    if (submitDocBtn) { submitDocBtn.disabled = false; submitDocBtn.innerText = 'Approve & Submit to Waiting Room'; }
                    if (submitSelfieBtn) { submitSelfieBtn.disabled = false; submitSelfieBtn.innerText = 'Verify & Submit to Waiting Room'; }
                    if (activeRetryBtn) activeRetryBtn.style.display = 'block';
                    return;
                }
            } catch (pollErr) { console.error("Polling error", pollErr); }
            
            currentPollInterval = setTimeout(pollStatus, 3000);
        };
        
        currentPollInterval = setTimeout(pollStatus, 3000); 

      } catch (error) {
        if (activeStatusMsg) activeStatusMsg.innerHTML = '<span style="color:#ef4444;">Network error. Could not establish connection.</span>';
        if (submitDocBtn) submitDocBtn.disabled = false;
        if (submitSelfieBtn) submitSelfieBtn.disabled = false;
      }
      return; // Exit â€” selfie flow done
    }

    // ================================================================
    // DOCUMENT BATCH UPLOAD â€” Multi-file â†’ /api/uploads/batch
    // ================================================================
    updateProgressUI('Compressing ' + filesToUpload.length + ' file(s)...', 10, activeStatusMsg);

    try {
      // ---- 1. Compress all files in parallel ----
      var compressionPromises = filesToUpload.map(function(file) {
        return compressImageForBackend(file, 500, 0.4).then(function(base64) {
          return { fileName: file.name || 'capture.jpg', base64: base64 };
        });
      });
      var compressedFiles = await Promise.all(compressionPromises);

      updateProgressUI('Uploading batch to secure queue...', 30, activeStatusMsg);

      // ---- 2. Build batch payload ----
      var batchPayload = {
        userEmail: userEmailAddress,
        files: compressedFiles.map(function(cf) {
          return {
            taskType: taskType,
            fileName: cf.fileName,
            imageBase64: cf.base64,
            contentTags: contentTags.length > 0 ? contentTags : ['none'],
            assignedTask: (isSelfieSubmit && window.currentSelfieTask) ? window.currentSelfieTask : null
          };
        })
      };

      // ---- 3. Send to batch endpoint ----
      var batchResponse = await fetch(API_BASE_URL + "/api/uploads/batch", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchPayload)
      });

      if (!batchResponse.ok) {
        var errMsg = 'Batch upload rejected by server.';
        try {
          var errData = await batchResponse.json();
          errMsg = errData.error || errData.message || 'Server blocked batch (Status ' + batchResponse.status + ')';
        } catch(pe) {
          errMsg = 'Backend rejected batch (Status ' + batchResponse.status + ')';
        }
        if (activeStatusMsg) activeStatusMsg.innerHTML = '<span style="color:#ef4444;">X <strong>' + errMsg + '</strong></span>';
        if (submitDocBtn) submitDocBtn.disabled = false;
        return;
      }

      var batchResult = await batchResponse.json();
      if (!batchResult.success || !batchResult.batchId) {
        if (activeStatusMsg) activeStatusMsg.innerHTML = '<span style="color:#ef4444;">Batch creation failed. ' + (batchResult.message || '') + '</span>';
        if (submitDocBtn) submitDocBtn.disabled = false;
        return;
      }

      // ---- 4. Fire and Forget UX ----
      if (submitDocBtn) submitDocBtn.style.display = 'none';
      if (activeReasonBox) activeReasonBox.style.display = 'none';
      
      if (activeStatusMsg) {
        activeStatusMsg.innerHTML = 
          '<div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 25px 20px; text-align: center; animation: slideUpFade 0.5s ease-out; margin-top: 15px;">' +
              '<div style="width: 56px; height: 56px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);">' +
                  '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
              '</div>' +
              '<div style="font-weight: 900; color: #10b981; font-size: 20px; margin-bottom: 5px; letter-spacing: -0.5px;">UPLOAD SUCCESSFUL! ðŸŽ‰</div>' +
              '<div style="color: #a1a1aa; font-size: 14px; margin-bottom: 20px; line-height: 1.5;">Your files are in the AI queue. You can safely close this page. Check the \'History\' tab for your results and rewards.</div>' +
              '<button type="button" onclick="resetUploadState(false)" style="background: #ffffff; color: #000000; font-weight: 800; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-size: 14px; transition: opacity 0.2s;">Upload More</button>' +
          '</div>';
      }

    } catch (error) {
      console.error("Batch upload error:", error);
      if (activeStatusMsg) activeStatusMsg.innerHTML = '<span style="color:#ef4444;">Network error. Could not establish connection.</span>';
      if (submitDocBtn) submitDocBtn.disabled = false;
    }
}

if (submitDocBtn) submitDocBtn.addEventListener('click', executeUploadLogic);
if (submitSelfieBtn) submitSelfieBtn.addEventListener('click', executeUploadLogic);

function injectPermissionModal() {
    if (document.getElementById('sysPermissionModal')) return;
    var modalHtml = 
    '<div id="sysPermissionModal" class="hidden" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 99999; padding: 20px;">' +
        '<div style="background: #09090b; border: 1px solid #27272a; border-radius: 24px; padding: 30px; width: 100%; max-width: 400px; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.5);">' +
            '<div id="permIcon" style="font-size: 48px; margin-bottom: 15px;">Camera</div>' +
            '<h2 id="permTitle" style="font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 10px;">Camera Access Required</h2>' +
            '<p id="permDesc" style="font-size: 14px; color: #a1a1aa; line-height: 1.6; margin-bottom: 25px;">To securely verify your identity, we need temporary access to your camera for a real-time selfie capture.</p>' +
            '<div id="permErrorAlert" class="hidden" style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 12px; padding: 12px; color: #fca5a5; font-size: 13px; margin-bottom: 20px; display: none;">' +
                'Camera access was blocked by your browser. Please enable it in your browser settings to continue.' +
            '</div>' +
            '<div id="permActionButtons" style="display: flex; gap: 12px;">' +
                '<button type="button" id="permCancelBtn" style="flex: 1; padding: 14px; background: transparent; border: 1px solid #3f3f46; color: #ffffff; border-radius: 12px; font-weight: 600; cursor: pointer;">Cancel</button>' +
                '<label id="permAllowBtn" for="" style="flex: 1; padding: 14px; background: #ffffff; color: #000000; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; display: block; margin: 0; text-align: center;">Allow Access</label>' +
            '</div>' +
        '</div>' +
    '</div>';
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

var pendingTriggerAction = null;
var isApproving = false;
var permissionGranted = { camera: false, gallery: false, selfie: false };

function requestDevicePermissionUX(type) {
    injectPermissionModal();
    pendingTriggerAction = type;
    
    var modal = document.getElementById('sysPermissionModal');
    var title = document.getElementById('permTitle');
    var desc = document.getElementById('permDesc');
    var icon = document.getElementById('permIcon');
    var errorAlert = document.getElementById('permErrorAlert');
    var allowBtn = document.getElementById('permAllowBtn'); 
    
    if (errorAlert) {
        errorAlert.classList.add('hidden');
        errorAlert.style.display = 'none';
    }

    if (type === 'camera') {
        if(icon) icon.innerText = 'Camera';
        if(title) title.innerText = 'Camera Access Required';
        if(desc) desc.innerText = 'Syntrix requires secure camera access to capture a live verification photo.';
        if(allowBtn) allowBtn.setAttribute('for', 'fileInputCamera');
    } else if (type === 'selfie') {
        if(icon) icon.innerText = 'Camera';
        if(title) title.innerText = 'Camera Access Required';
        if(desc) desc.innerText = 'Syntrix requires secure camera access to capture a live verification photo.';
        if(allowBtn) allowBtn.setAttribute('for', 'fileInputSelfie');
    } else {
        if(icon) icon.innerText = 'File';
        if(title) title.innerText = 'File Access Required';
        if(desc) desc.innerText = 'Syntrix needs access to your gallery or files to securely upload your selected document.';
        if(allowBtn) allowBtn.setAttribute('for', 'fileInputGallery');
    }
    
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}

document.addEventListener('mousedown', function(e) {
    if (e.target.id === 'permAllowBtn') isApproving = true;
});
document.addEventListener('touchstart', function(e) {
    if (e.target.id === 'permAllowBtn') isApproving = true;
}, {passive: true});

document.addEventListener('click', function(e) {
    if (e.target.id === 'permCancelBtn') {
        var modal = document.getElementById('sysPermissionModal');
        if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; }
        isApproving = false;
    }
    
    if (e.target.id === 'permAllowBtn') {
        isApproving = true;
        if (pendingTriggerAction) {
            permissionGranted[pendingTriggerAction] = true;
        }
        var modal = document.getElementById('sysPermissionModal');
        setTimeout(function() {
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
            isApproving = false;
        }, 800);
    }
});

// =========================================================================
// PREMIUM XP PROGRESSION FRONTEND ENGINE
// =========================================================================

var XPAnimator = {
  currentLevel: null,
  lastProfile: null, 
  RANKS: [
    { level: 1, rank: 'Explorer', xpRequired: 0 },
    { level: 2, rank: 'Contributor', xpRequired: 200 },
    { level: 3, rank: 'Analyst', xpRequired: 500 },
    { level: 4, rank: 'Verifier', xpRequired: 900 },
    { level: 5, rank: 'Researcher', xpRequired: 1500 },
    { level: 6, rank: 'Specialist', xpRequired: 2300 },
    { level: 7, rank: 'Strategist', xpRequired: 3300 },
    { level: 8, rank: 'Expert', xpRequired: 4600 },
    { level: 9, rank: 'Innovator', xpRequired: 6200 },
    { level: 10, rank: 'AI Pioneer', xpRequired: 8000 }
  ],

  async fetchAndRenderXP(email) {
    if (!email) return;
    try {
      var response = await fetch(API_BASE_URL + "/api/xp-profile?email=" + encodeURIComponent(email));
      var result = await response.json();

      if (result.success && result.profile) {
        if (this.lastProfile && result.profile.totalXP > this.lastProfile.totalXP) {
            var diff = result.profile.totalXP - this.lastProfile.totalXP;
            var latestItem = result.profile.recentHistory[0];
            this.showXPToast(diff, latestItem ? latestItem.reason : "XP Earned!");
        } else if (!this.lastProfile && result.profile.recentHistory && result.profile.recentHistory.length > 0) {
            var latestItem = result.profile.recentHistory[0];
            var itemTime = new Date(latestItem.created_at).getTime();
            if (Date.now() - itemTime < 15000) {
                this.showXPToast(latestItem.amount, latestItem.reason);
            }
        }

        this.lastProfile = result.profile;
        this.updateUI(result.profile, false);
      }
    } catch (err) {
      console.error("[XP Engine] Failed to sync progression data:", err);
    }
  },

  updateUI(profile, forceAnimate) {
    if (forceAnimate === undefined) forceAnimate = true;
    if (this.currentLevel !== null && profile.currentLevel > this.currentLevel) {
      this.triggerLevelUpPopup(profile.currentLevel, profile.currentRank);
    }
    this.currentLevel = profile.currentLevel;

    var textMap = {
        "bentoCurrentLevel": profile.currentLevel,
        "bentoCurrentRank": profile.currentRank,
        "bentoTargetAmount": profile.xpRequiredNextLevel,
        "bentoRemainingAmount": profile.xpRemaining,
        "bentoNextLevelNum": profile.currentLevel + 1,
        "bentoTotalXp": profile.totalXP.toLocaleString(),
        "bentoHighestLevel": profile.highestLevel,
        "bentoContributions": (profile.surveyCount + profile.documentCount + profile.selfieCount).toLocaleString(),
        "bentoBadgeNumber": profile.currentLevel,
        "bentoBadgeRank": profile.currentRank,
        "bentoStreakDays": profile.dailyStreak,
        "bentoStatSurveys": profile.surveyCount,
        "bentoStatDocs": profile.documentCount,
        "bentoStatSelfies": profile.selfieCount,
        "bentoStatReferrals": profile.referralCount,
        "bentoStatTotalXp": profile.totalXP.toLocaleString()
    };

    for (var id in textMap) {
        if (textMap.hasOwnProperty(id)) {
            var el = document.getElementById(id);
            if (el) el.innerText = textMap[id];
        }
    }

    var tabScreenXPEl = document.getElementById("tabScreenXP");
    if (forceAnimate || (tabScreenXPEl && tabScreenXPEl.style.display === "block")) {
        var amt = document.getElementById("bentoCurrentAmount");
        var pct = document.getElementById("bentoProgressPercent");
        if(amt) amt.innerText = "0";
        if(pct) pct.innerText = "0";
        
        var bar = document.getElementById("bentoProgressBar");
        if (bar) {
            bar.style.transition = 'none';
            bar.style.width = '0%';
            void bar.offsetWidth; 
            bar.style.transition = 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
            setTimeout(function() { bar.style.width = profile.levelProgressPercentage + '%'; }, 50);
        }

        this.animateValue("bentoCurrentAmount", 0, profile.totalXP, 1500);
        this.animateValue("bentoProgressPercent", 0, profile.levelProgressPercentage, 1500);
    } else {
        var amt = document.getElementById("bentoCurrentAmount");
        var pct = document.getElementById("bentoProgressPercent");
        if(amt) amt.innerText = profile.totalXP;
        if(pct) pct.innerText = profile.levelProgressPercentage;
        var bar = document.getElementById("bentoProgressBar");
        if (bar) bar.style.width = profile.levelProgressPercentage + '%';
    }

    var historyList = document.getElementById("bentoHistoryList");
    if (historyList && profile.recentHistory) {
      historyList.innerHTML = profile.recentHistory.length > 0 ? profile.recentHistory.map(function(item) {
        var icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z"></path></svg>';
        var title = item.reason;
        var desc = "XP Earned";
        if(item.reason.indexOf("Survey") !== -1) { icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'; desc="You have completed a survey"; }
        if(item.reason.indexOf("Document") !== -1) { icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>'; desc="AI verified your document"; }
        if(item.reason.indexOf("Selfie") !== -1) { icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path></svg>'; desc="AI verified your selfie"; }
        if(item.reason.indexOf("Referral") !== -1) { icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>'; desc="Your referral completed the survey"; }
        if(item.reason.indexOf("Login") !== -1) { icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'; desc="You logged in today"; }
        
        return '<div class="xp-hist-item">' +
            '<div class="xp-hist-left">' +
                '<div class="xp-hist-icon">' + icon + '</div>' +
                '<div class="xp-hist-text"><h4>' + title + '</h4><p>' + desc + '</p></div>' +
            '</div>' +
            '<div class="xp-hist-right">' +
                '<div class="xp-hist-amount">+' + item.amount + ' XP</div>' +
                '<div class="xp-hist-time">Recently</div>' +
            '</div>' +
        '</div>';
      }).join('') : '<div style="font-size:13px; color:#71717a; text-align:left;">No recent activity yet. Complete a task to earn XP!</div>';
    }

    var roadmapEl = document.getElementById("bentoRoadmap");
    if(roadmapEl) {
        var roadmapHTML = '';
        var startLvl = Math.max(1, profile.currentLevel - 1);
        var endLvl = Math.min(10, profile.currentLevel + 3);
        
        for(var i = startLvl; i <= endLvl; i++) {
            var rankObj = this.RANKS[i-1] || { level: i, rank: 'AI Pioneer', xpRequired: 8000 + ((i-10)*2000) };
            var statusClass = 'locked';
            var statusText = rankObj.xpRequired + ' XP';
            
            if(i < profile.currentLevel) {
                statusClass = 'completed'; statusText = 'COMPLETED';
            } else if (i === profile.currentLevel) {
                statusClass = 'current'; statusText = profile.totalXP + ' / ' + profile.xpRequiredNextLevel + ' XP<br><span style="color:#a1a1aa; font-weight:600; font-size:11px;">Current Level</span>';
            }

            roadmapHTML += 
            '<div class="xp-road-item ' + statusClass + '">' +
                '<div class="xp-road-dot">' + (statusClass === 'completed' ? 'v' : (statusClass === 'current' ? '^' : '')) + '</div>' +
                '<div class="xp-road-left"><h4>Level ' + i + '</h4><p>' + rankObj.rank + '</p></div>' +
                '<div class="xp-road-right"><div class="xp-road-xp" style="' + (statusClass==='current' ? 'color:#a855f7;' : '') + '">' + statusText + '</div></div>' +
            '</div>';
        }
        roadmapEl.innerHTML = roadmapHTML;
    }

    var streakUI = document.getElementById("bentoStreakUI");
    if(streakUI) {
        var days = Array.from(streakUI.children);
        var count = profile.dailyStreak > 7 ? 7 : profile.dailyStreak;
        days.forEach(function(dayEl, idx) {
            if(idx < count) {
                dayEl.classList.add('active');
                if (profile.streakStatus === "warning" && idx === count - 1) {
                    dayEl.style.boxShadow = "0 0 15px rgba(251, 191, 36, 0.6)"; 
                    dayEl.style.borderColor = "#fbbf24";
                } else {
                    dayEl.style.boxShadow = "";
                    dayEl.style.borderColor = "";
                }
            } else {
                dayEl.classList.remove('active');
                dayEl.style.boxShadow = "";
                dayEl.style.borderColor = "";
            }
        });
        
        var streakNumEl = document.getElementById("bentoStreakDays");
        if (streakNumEl) {
            var headerContainer = streakNumEl.parentElement.previousElementSibling;
            var headerText = headerContainer ? headerContainer.querySelector("h3") : null;
            if (profile.streakStatus === "warning") {
                streakNumEl.style.color = "#fbbf24";
                if (headerText) headerText.innerHTML = 'DAILY STREAK <span style="background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px; animation: pulse 1.5s infinite;">AT RISK</span>';
            } else if (profile.streakStatus === "lost") {
                streakNumEl.style.color = "#71717a";
                if (headerText) headerText.innerHTML = 'DAILY STREAK <span style="background: rgba(113, 113, 122, 0.2); color: #a1a1aa; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px;">RESET</span>';
            } else {
                streakNumEl.style.color = "#ffffff";
                if (headerText) headerText.innerHTML = 'DAILY STREAK';
            }
        }
    }
  },

  replayAnimations() {
     if (this.lastProfile) this.updateUI(this.lastProfile, true);
  },

  showXPToast(amount, reason) {
    var toast = document.getElementById("xpFloatingToast");
    if (!toast) return;
    
    var amtEl = document.getElementById("xpToastAmount");
    amtEl.innerText = "+" + amount + " XP";
    amtEl.style.textShadow = "0 0 20px rgba(168, 85, 247, 0.8)";
    
    document.getElementById("xpToastReason").innerText = reason;
    
    // Add particle/bounce effect class if defined in CSS, otherwise just smooth transitions
    toast.style.transform = "translateY(20px) scale(0.9)";
    toast.style.transition = "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    
    toast.classList.remove("hidden");
    
    setTimeout(function() { 
        toast.classList.add("show"); 
        toast.style.transform = "translateY(0) scale(1)";
    }, 10);
    
    setTimeout(function() {
        toast.classList.remove("show");
        toast.style.transform = "translateY(-20px) scale(0.9)";
        setTimeout(function() { 
            toast.classList.add("hidden"); 
            toast.style.transform = "";
        }, 600); 
    }, 4500);
  },

  animateValue(id, start, end, duration) {
    if (start === end) return;
    var obj = document.getElementById(id);
    if(!obj) return;
    var startTimestamp = null;
    var step = function(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;
      var progress = Math.min((timestamp - startTimestamp) / duration, 1);
      var easeProgress = 1 - Math.pow(1 - progress, 3);
      obj.innerHTML = Math.floor(easeProgress * (end - start) + start).toLocaleString();
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.innerHTML = end.toLocaleString();
      }
    };
    window.requestAnimationFrame(step);
  },

  triggerLevelUpPopup(newLevel, newRank) {
    var overlay = document.getElementById("xpLevelUpOverlay");
    var rankText = document.getElementById("levelUpNewRank");
    var numText = document.getElementById("levelUpBadgeNumber");
    if (overlay && rankText && numText) {
      rankText.innerText = newRank;
      numText.innerText = newLevel;
      overlay.classList.add("active");
    }
  }
};

// Wire up XP fetching after profile verification
var originalLedgerVerificationXP = runProfileLedgerVerification;
runProfileLedgerVerification = async function(email, isFromModal, isBackgroundSync) {
  await originalLedgerVerificationXP(email, isFromModal, isBackgroundSync);
  XPAnimator.fetchAndRenderXP(email);
};

window.addEventListener('DOMContentLoaded', function() {
    var cameraUI = document.querySelector('.doc-btn-white') || (document.getElementById('btnCameraText') ? document.getElementById('btnCameraText').parentElement : null);
    var galleryUI = document.getElementById('btnGallery');
    var selfieUI = document.getElementById('btnSelfieCamera');

    if (cameraUI && cameraUI.id !== 'btnSelfieCamera') {
        cameraUI.addEventListener('click', function(e) {
            if (isApproving || permissionGranted.camera) return; 
            if (!document.getElementById('fileInputCamera').value) {
                e.preventDefault(); 
                e.stopPropagation();
                requestDevicePermissionUX('camera');
            }
        }, true);
    }
    
    if (galleryUI) {
        galleryUI.addEventListener('click', function(e) {
            if (isApproving || permissionGranted.gallery) return; 
            if (!document.getElementById('fileInputGallery').value) {
                e.preventDefault();
                e.stopPropagation();
                requestDevicePermissionUX('gallery');
            }
        }, true);
    }
});

window.fetchAndRenderHistory = async function(email) {
    var historyGrid = document.getElementById('historyGrid');
    if (!historyGrid) return;
    
    historyGrid.innerHTML = '<div style="text-align: center; color: #a1a1aa; padding: 40px;"><div class="spinner" style="margin: 0 auto 20px;"></div>Loading history...</div>';
    
    try {
        var response = await fetch(API_BASE_URL + '/api/history?email=' + encodeURIComponent(email));
        var data = await response.json();
        
        if (!data.success || !data.history || data.history.length === 0) {
            historyGrid.innerHTML = '<div style="text-align: center; color: #71717a; padding: 40px; background: #18181b; border-radius: 16px; border: 1px dashed #27272a;">No upload history found yet.</div>';
            return;
        }
        
        historyGrid.innerHTML = '';
        data.history.forEach(function(job) {
            var pillColor = '#3f3f46'; var pillText = '#a1a1aa';
            if (job.status === 'VERIFIED') { pillColor = 'rgba(16, 185, 129, 0.15)'; pillText = '#10b981'; }
            else if (job.status === 'REJECTED' || job.status === 'FAILED') { pillColor = 'rgba(239, 68, 68, 0.15)'; pillText = '#ef4444'; }
            else if (job.status === 'PROCESSING') { pillColor = 'rgba(99, 102, 241, 0.15)'; pillText = '#6366f1'; }
            else if (job.status === 'QUEUED' || job.status === 'RETRYING') { pillColor = 'rgba(251, 191, 36, 0.15)'; pillText = '#fbbf24'; }

            var dateStr = new Date(job.created_at).toLocaleString();
            var html = '<div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 20px;">';
            
            if (job.storage_url) {
                html += '<div style="width: 80px; height: 80px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: #09090b;"><img src="' + job.storage_url + '" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display=\'none\'" /></div>';
            } else {
                html += '<div style="width: 80px; height: 80px; border-radius: 8px; flex-shrink: 0; background: #27272a; display: flex; align-items: center; justify-content: center;"><svg width="24" height="24" stroke="#71717a" fill="none"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>';
            }
            
            html += '<div style="flex-grow: 1;">';
            html += '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">';
            html += '<div><div style="font-weight: 700; color: #fff; font-size: 15px;">' + (job.file_name || 'Unknown File') + '</div><div style="color: #71717a; font-size: 12px;">' + dateStr + '</div></div>';
            html += '<div style="background:' + pillColor + '; color:' + pillText + '; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700;">' + job.status + '</div>';
            html += '</div>';
            
            if (job.reason) {
                html += '<div style="background: #09090b; padding: 8px 12px; border-radius: 6px; font-size: 13px; color: #a1a1aa; margin-bottom: ' + (job.reward_amount ? '12px' : '0') + ';">' + job.reason + '</div>';
            }
            if (job.reward_amount && job.status === 'VERIFIED') {
                html += '<div style="display: inline-block; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.2); padding: 4px 12px; border-radius: 999px; color: #fbbf24; font-weight: 800; font-size: 13px;">+' + job.reward_amount + ' SYNX Earned</div>';
            }
            
            html += '</div></div>';
            historyGrid.insertAdjacentHTML('beforeend', html);
        });
    } catch (error) {
        historyGrid.innerHTML = '<div style="text-align: center; color: #ef4444; padding: 40px;">Error loading history.</div>';
    }
};





let selfieMediaStream = null;
let isCameraStreaming = false;

// 1. Live Camera Stream Controller
async function startSelfieCameraFeed() {
  const videoEl = document.getElementById("selfieCameraVideo");
  const defaultIcon = document.getElementById("scannerDefaultIcon");
  const scannerOuter = document.getElementById("scannerCircleOuter");
  const indicator = document.getElementById("selfieAngleIndicator");
  const badge = document.getElementById("angleDetectionBadge");
  const btnText = document.getElementById("btnSelfieTextContent");
  const selfieResultImg = document.getElementById("selfieResultImg");

  if (selfieResultImg) selfieResultImg.style.display = "none";

  try {
    selfieMediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });

    videoEl.srcObject = selfieMediaStream;
    videoEl.style.display = "block";
    if (defaultIcon) defaultIcon.style.display = "none";
    if (scannerOuter) {
      scannerOuter.classList.add("streaming");
      scannerOuter.classList.remove("angle-locked");
    }
    if (indicator) indicator.style.display = "block";
    if (badge) {
      badge.classList.remove("locked");
      badge.innerHTML = '<span class="pulse-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #6366f1;"></span> Aligning Head Angle...';
    }

    isCameraStreaming = true;
    if (btnText) btnText.innerText = "Aligning Angle...";

    // 2. Simulate AI Angle & Liveness Alignment -> Turn GREEN
    setTimeout(() => {
      if (!isCameraStreaming) return;
      if (scannerOuter) scannerOuter.classList.add("angle-locked");
      if (badge) {
        badge.classList.add("locked");
        badge.innerHTML = '<span class="pulse-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span> Target Angle Aligned (Locked)';
      }
      if (btnText) btnText.innerText = "Capture Photo";
      showToast("Angle Verified! Click Capture.", "OK");
    }, 1800);

    } catch (err) {
    console.warn("[Camera] WebRTC access failed or denied, falling back to file picker:", err);
    isCameraStreaming = false; // CRITICAL FIX: Stops the fake green alignment animation
    const fileInput = document.getElementById("fileInputSelfie");
    if (fileInput) fileInput.click();
  }
}

// 3. Snapshot Capture Function
function captureSelfieSnapshot() {
  const videoEl = document.getElementById("selfieCameraVideo");
  const canvasEl = document.getElementById("selfieCaptureCanvas");
  const scannerOuter = document.getElementById("scannerCircleOuter");
  const indicator = document.getElementById("selfieAngleIndicator");
  const btnText = document.getElementById("btnSelfieTextContent");
  const submitBtn = document.getElementById("submitSelfieBtn");

  if (!videoEl || !canvasEl) return;

  canvasEl.width = videoEl.videoWidth || 640;
  canvasEl.height = videoEl.videoHeight || 480;
  const ctx = canvasEl.getContext("2d");

  // Mirror image horizontally to match webcam display
  ctx.translate(canvasEl.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

  canvasEl.toBlob((blob) => {
    const capturedFile = new File([blob], `selfie_${Date.now()}.jpg`, { type: "image/jpeg" });

    // Store in global upload handler variables
    selectedFile = capturedFile;
    selectedFiles = [capturedFile];

    // Stop camera tracks
    if (selfieMediaStream) {
      selfieMediaStream.getTracks().forEach(track => track.stop());
      selfieMediaStream = null;
    }
    isCameraStreaming = false;

    // Update UI Preview
    videoEl.style.display = "none";
    if (indicator) indicator.style.display = "none";
    if (scannerOuter) scannerOuter.classList.remove("streaming", "angle-locked");

    let selfieImg = document.getElementById("selfieResultImg");
    if (!selfieImg) {
      selfieImg = document.createElement("img");
      selfieImg.id = "selfieResultImg";
      document.getElementById("scannerCircleInner").appendChild(selfieImg);
    }
    selfieImg.style.cssText = "width: 100%; height: 100%; object-fit: cover; border-radius: 50%; position: relative; z-index: 10;";
    selfieImg.src = URL.createObjectURL(capturedFile);
    selfieImg.style.display = "block";

    if (btnText) btnText.innerText = "Retake Photo";
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove("hidden");
      submitBtn.style.display = "flex";
    }

    showToast("Photo captured and task assigned!", "OK");
  }, "image/jpeg", 0.95);
}

// 4. Bind Button Click
const selfieTriggerBtn = document.getElementById("btnSelfieCamera") || document.querySelector("#selfieModeSection .doc-btn-white");
if (selfieTriggerBtn) {
  selfieTriggerBtn.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!isCameraStreaming) {
      startSelfieCameraFeed();
    } else {
      captureSelfieSnapshot();
    }
  };
}
















