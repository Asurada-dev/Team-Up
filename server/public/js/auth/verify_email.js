const urlParams = new URLSearchParams(window.location.search);
const messageBox = document.getElementById('message');
// console.log()
window.addEventListener('load', async (event) => {
  console.log('verify');
  const token = urlParams.get('token');
  const email = urlParams.get('email');
  console.log(token, email);
  try {
    const { data } = await axios.post('/api/v1/auth/verify-email', {
      token,
      email,
    });
    messageBox.classList.add('alert-success');
    messageBox.innerHTML = data.msg;
  } catch (error) {
    const { msg } = error.response.data;
    console.log(msg);
    messageBox.innerHTML = msg;
  }
});
