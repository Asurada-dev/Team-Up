const registerForm = document.getElementById('register-form');
const messageBox = document.getElementById('message');
registerForm.addEventListener('submit', async (event) => {
  console.log('pass');
  event.preventDefault();
  let formData = new FormData(registerForm);
  const registerInput = new URLSearchParams(formData);

  const jsonData = Object.fromEntries(registerInput.entries());

  let bodyData = {
    name: jsonData['name'],
    email: jsonData['email'],
    password: jsonData['password'],
  };

  try {
    const { data } = await axios.post('/api/v1/auth/register', bodyData);
    // if (data.success) window.location.href = '/check-email';
    if (messageBox.classList.contains('alert-danger')) {
      messageContent(data.msg);
    }
    messageBox.classList.remove('invisible');
    messageBox.innerHTML = data.msg;
  } catch (error) {
    const { msg } = error.response.data;

    if (messageBox.classList.contains('alert-success')) {
      messageContent(msg);
    }
    messageBox.classList.remove('invisible');
    messageBox.innerHTML = msg;
  }
});

function messageContent(msg) {
  messageBox.classList.toggle('alert-success');
  messageBox.classList.toggle('alert-danger');
  messageBox.classList.remove('invisible');
  messageBox.innerHTML = msg;
}
