const user = document.getElementById('user');
// const links = document.querySelectorAll('.nav-link');

window.addEventListener('load', async function () {
  const { data } = await axios.get('/api/v1/user/current-user');
  console.log(data);
  user.textContent = `${data.user.name}`;

  const currentUrl = window.location.pathname;
  const topic = currentUrl?.split('/')[1];
  const navTopic = document.getElementById(`nav-${topic}`);
  navTopic?.classList.add('active');
});
