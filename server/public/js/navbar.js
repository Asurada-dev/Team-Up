const user = document.getElementById('user');
const userDropdown = document.getElementById('user-dropdown');

window.addEventListener('load', async function () {
  const currentUrl = window.location.pathname;
  const topic = currentUrl?.split('/')[1];
  const navTopic = document.getElementById(`nav-${topic}`);
  navTopic?.classList.add('active');

  const { data } = await axios.get('/api/v1/user/current-user');
  if (!data.user?.name) {
    user.textContent = 'Login';
    userDropdown.removeAttribute('data-bs-toggle');
    userDropdown.href = '/auth/login';
    return;
  }

  user.textContent = data.user.name || 'Login';
});
