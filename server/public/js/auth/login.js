const loginForm = document.getElementById('login-form');
const messageBox = document.getElementById('message');
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  let formData = new FormData(loginForm);
  const registerInput = new URLSearchParams(formData);

  const jsonData = Object.fromEntries(registerInput.entries());
  let bodyData = {
    email: jsonData['email'],
    password: jsonData['password'],
  };

  try {
    const { data } = await axios.post('/api/v1/auth/login', bodyData);
    if (data.success) window.location.href = '/movie';
  } catch (error) {
    const { msg } = error.response.data;
    messageBox.classList.remove('invisible');
    messageBox.innerHTML = msg;
  }
});
