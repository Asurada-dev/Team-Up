const logout = document.getElementById('logout');

logout.addEventListener('click', async (event) => {
  try {
    const { data } = await axios.delete('/api/v1/auth/logout');
    if (data.success) window.location.href = '/auth/login';
  } catch (error) {
    const { msg } = error.response.data;
    console.log(msg);
  }
});
