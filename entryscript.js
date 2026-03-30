// Entry page splash and navigation logic

document.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash');
  const mainContent = document.getElementById('mainContent');
  
  // Show main content after splash animation (3s delay + 0.8s animation)
  setTimeout(() => {
    if (mainContent) {
      mainContent.style.display = 'block';
    }
  }, 3800);
});

// Navigation function for role cards
function navigateTo(role) {
  // Smooth fade out
  const container = document.querySelector('.container');
  container.style.opacity = '0';
  container.style.transition = 'opacity 0.3s ease-out';
  
  // Navigate after fade
  setTimeout(() => {
    // Map role identifiers to actual files in the neighbOUR folder
    if (role === 'index' || role === 'seeker') {
      // Open the site index located inside the neighbOUR subfolder
      window.location.href = './neighbOUR/index.html';
      return;
    }
    if (role === 'serviceproviderlogin' || role === 'provider') {
      window.location.href = './serviceproviderlogin.html';
      return;
    }
    if (role === 'admin') {
      window.location.href = './adminlogin.html';
      return;
    }
    console.warn('Unknown role:', role);
  }, 300);
}
