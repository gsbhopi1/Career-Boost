// ===== Toggle Login/Signup Forms =====
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const formContainer = document.getElementById('formContainer');

const loginFormHTML = `
  <div id="loginForm">
    <input type="text" id="loginEmail" placeholder="Email">
    <input type="password" id="loginPassword" placeholder="Password">
    <button id="loginBtn">Login</button>
  </div>
`;

const signupFormHTML = `
  <div id="signupForm" style="display:none;">
    <input type="text" id="signupName" placeholder="Full Name">
    <input type="text" id="signupEmail" placeholder="Email">
    <input type="password" id="signupPassword" placeholder="Password">
    <button id="signupBtn">Signup</button>
  </div>
`;

// Inject login form by default
if (formContainer) {
  formContainer.innerHTML = loginFormHTML + signupFormHTML;
}

// Tab switching
if (loginTab && signupTab) {
  loginTab.addEventListener('click', () => {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
  });

  signupTab.addEventListener('click', () => {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
  });
}

// ===== Placeholder Login/Signup Actions =====
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'loginBtn') {
    // Redirect to dashboard after login
    window.location.href = "home.html";
  }
  if (e.target && e.target.id === 'signupBtn') {
    // Redirect to dashboard after signup
    window.location.href = "home.html";
  }
});

// ===== Interactive Mentor Chat =====
let chatStep = 0;

const chatData = {
  0: {
    bot: "Hi! I'm here to guide you. How can I help you today?",
    options: ["Hello Mentor!", "Can you help me with confidence?", "I want career guidance."]
  },
  1: {
    bot: "Thanks for sharing. What area would you like to focus on first?",
    options: ["I struggle with stage fear.", "I want to improve daily interactions.", "Time management tips."]
  },
  2: {
    bot: "Great choice! Let's work on building your confidence step by step.",
    options: ["Any exercises for confidence?", "How to face stage fear?"]
  },
  3: {
    bot: "Practice regularly and start small. Gradually increase challenges to boost confidence.",
    options: ["Thank you, Mentor!", "Can you suggest books or resources?"]
  },
  4: {
    bot: "For daily interactions, start by greeting people and engaging in small talks. Confidence builds over time.",
    options: ["Got it, thanks!", "What about public speaking?"]
  },
  5: {
    bot: "For stage fear, rehearse in front of a mirror, record yourself, and gradually present in front of small groups.",
    options: ["Thanks! I will try.", "Any tips for body language?"]
  },
  6: {
    bot: "You're welcome! Keep practicing and you will improve. Consistency is key!",
    options: []
  },
  7: {
    bot: "Recommended books: 'The Confidence Code', 'How to Win Friends & Influence People', 'Speak With No Fear'.",
    options: ["Thanks for the resources!", "Any online courses?"]
  },
  8: {
    bot: "Platforms like Coursera, Udemy, and LinkedIn Learning have excellent courses on communication and confidence.",
    options: ["Awesome, thank you!", "Can I have a daily practice routine?"]
  },
  9: {
    bot: "Daily practice: 5-10 min meditation, 10 min reading, 15 min speaking practice in front of mirror, small social interactions.",
    options: ["Perfect! Thanks Mentor!", "How to track my progress?"]
  },
  10: {
    bot: "Track progress by journaling daily and noting improvements in confidence, interactions, and presentations.",
    options: ["Will do! Thank you!", "End chat"]
  },
  11: {
    bot: "Chat ended. You can start a personal call for deeper guidance.",
    options: []
  }
};

function openChat(button) {
  const mentorCard = button.closest('.mentor');
  if (!mentorCard) return;
  const mentorName = mentorCard.querySelector('p strong')?.innerText || "Mentor";
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;

  chatStep = 0;
  chatBox.style.display = "flex";
  document.getElementById("chatMentorName").innerText = mentorName;
  document.getElementById("chatMessages").innerHTML = `<p><em>${mentorName} joined the chat.</em></p>`;
  // Show first bot message immediately
  document.getElementById("chatMessages").innerHTML += `<p><strong>Mentor:</strong> ${chatData[0].bot}</p>`;
  loadOptions();
}

function loadOptions() {
  const chatOptions = document.getElementById("chatOptions");
  if (!chatOptions) return;
  chatOptions.innerHTML = "";

  if (chatData[chatStep] && chatData[chatStep].options.length > 0) {
    chatData[chatStep].options.forEach(opt => {
      const btn = document.createElement('button');
      btn.innerText = opt;
      btn.addEventListener('click', () => sendMessage(opt));
      chatOptions.appendChild(btn);
    });
  }
}

function sendMessage(msg) {
  const chatMessages = document.getElementById("chatMessages");
  if (!chatMessages) return;

  chatMessages.innerHTML += `<p><strong>You:</strong> ${msg}</p>`;
  chatMessages.scrollTop = chatMessages.scrollHeight;

  setTimeout(() => {
    let botResponse = chatData[chatStep]?.bot || "Let's continue.";
    chatMessages.innerHTML += `<p><strong>Mentor:</strong> ${botResponse}</p>`;
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Branching logic based on user selection
    switch(chatStep) {
      case 0: 
        if(msg.includes("Hello")) chatStep = 1;
        else if(msg.includes("confidence")) chatStep = 2;
        else chatStep = 1;
        break;
      case 1:
        if(msg.includes("stage fear")) chatStep = 5;
        else if(msg.includes("daily interactions")) chatStep = 4;
        else chatStep = 2;
        break;
      case 2: chatStep = 3; break;
      case 3:
        if(msg.includes("resources")) chatStep = 7;
        else chatStep = 6;
        break;
      case 4: chatStep = 6; break;
      case 5: chatStep = 6; break;
      case 7: chatStep = 8; break;
      case 8: chatStep = 9; break;
      case 9: chatStep = 10; break;
      case 10: chatStep = 11; break;
      default: chatStep = 11; break;
    }
    loadOptions();
  }, 600);
}

function closeChat() {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;
  chatBox.style.display = "none";
}

// ===== Personal Call =====
let callInterval;
let seconds = 0;

function startCall(button) {
  const mentorCard = button.closest('.mentor');
  if (!mentorCard) return;
  const mentorName = mentorCard.querySelector('p strong')?.innerText || "Mentor";

  const modal = document.getElementById("callModal");
  if (!modal) return;

  document.getElementById("callTitle").innerText = "Personal Call Session";
  document.getElementById("callMessage").innerText = `Starting a personal call session with ${mentorName}...`;
  modal.style.display = "flex";

  seconds = 0;
  updateTimer();

  callInterval = setInterval(() => {
    seconds++;
    updateTimer();
  }, 1000);
}

function updateTimer() {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const timer = document.getElementById("callTimer");
  if (timer) timer.innerText = `Duration: ${mins}:${secs}`;
}

function closeCall() {
  const modal = document.getElementById("callModal");
  if (!modal) return;

  modal.style.display = "none";
  clearInterval(callInterval);
}