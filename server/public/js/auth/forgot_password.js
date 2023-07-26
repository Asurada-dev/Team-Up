const forgotForm = document.getElementById('forgot-form');
const messageBox = document.getElementById('message');
forgotForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  let formData = new FormData(forgotForm);
  const forgotInput = new URLSearchParams(formData);

  const jsonData = Object.fromEntries(forgotInput.entries());

  let bodyData = {
    email: jsonData['email'],
  };
  try {
    const { data } = await axios.post('/api/v1/auth/forgot-password', bodyData);

    messageBox.classList.remove('invisible');
    messageBox.innerHTML = data.msg;
  } catch (error) {
    const { msg } = error.response.data;
    messageBox.classList.remove('invisible');
    messageBox.innerHTML = msg;
  }
});
