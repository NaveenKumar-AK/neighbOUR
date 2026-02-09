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
    switch(role) {
      case 'seeker':
        window.location.href = 'loginpage.html';
        break;
      case 'provider':
        window.location.href = 'serviceproviderlogin.html';
        break;
      case 'admin':
        window.location.href = 'adminlogin.html';
        break;
      default:
        console.warn('Unknown role:', role);
    }
  }, 300);
}
