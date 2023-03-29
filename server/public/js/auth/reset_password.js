const resetForm = document.getElementById('reset-form');
const messageBox = document.getElementById('message');
const newPassword = document.getElementById('new-password');
const confirmPassword = document.getElementById('confirm-password');
const urlParams = new URLSearchParams(window.location.search);

resetForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (newPassword.value != confirmPassword.value) {
    const notMatchedmsg = `Password doesn't match`;
    if (messageBox.classList.contains('alert-success')) {
      messageContent(notMatchedmsg);
    }
    messageBox.classList.remove('invisible');
    messageBox.innerHTML = notMatchedmsg;
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  let formData = new FormData(resetForm);
  const resetInput = new URLSearchParams(formData);

  const jsonData = Object.fromEntries(resetInput.entries());
  const token = urlParams.get('token');
  const email = urlParams.get('email');
  console.log(jsonData);
  let bodyData = {
    token: token,
    email: email,
    newPassword: jsonData['new-password'],
  };
  console.log(bodyData);
  try {
    const { data } = await axios.post('/api/v1/auth/reset-password', bodyData);
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
