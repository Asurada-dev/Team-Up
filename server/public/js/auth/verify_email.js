const urlParams = new URLSearchParams(window.location.search);
const messageBox = document.getElementById('message');

window.addEventListener('load', async (event) => {
  const token = urlParams.get('token');
  const email = urlParams.get('email');

  try {
    const { data } = await axios.post('/api/v1/auth/verify-email', {
      token,
      email,
    });
    messageBox.classList.add('alert-success');
    messageBox.innerHTML = data.msg;
  } catch (error) {
    const { msg } = error.response.data;
    messageBox.innerHTML = msg;
  }
});
