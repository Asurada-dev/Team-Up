const acitivtyImg = document.getElementById('activity-img');
const activityInfo = document.getElementById('activity-info');
const activityDescription = document.getElementById('activity-description');
const activityControl = document.getElementById('activity-control');

const leaveSubmitButton = document.getElementById('button-leave-submit');
const deleteSubmitButton = document.getElementById('button-delete-submit');

const activityForm = document.getElementById('activity-form');

const formTitle = document.getElementById('form-title');
const maxMembers = document.getElementById('form-maxMembers');
const formDate = document.getElementById('form-date');
const formTime = document.getElementById('form-time');
const formCity = document.getElementById('form-city');
const formTheater = document.getElementById('form-theater');
const formDescription = document.getElementById('form-description');
const previewImg = document.getElementById('preview-img');
const uploadImg = document.getElementById('upload-img');

const msgModal = new bootstrap.Modal(document.getElementById('modal-msg'), {});

const chatActivityTitle = document.getElementById('chatroom-activity-title');
const chatMovieTitle = document.getElementById('chatroom-movie-title');

const activityId = window.location.href.split('/').reverse()[0];

window.onload = pageLoad;
async function pageLoad() {
  const { data } = await axios.get(`/api/v1/activity/${activityId}`);
  const members = await axios.get(`/api/v1/activity/members/${activityId}`);
  document.title = `Activity: ${data.title} - TeamUp`;
  chatActivityTitle.textContent = data.title;
  chatMovieTitle.textContent = data.movie_title;

  activityDescription.innerHTML = data.description;
  activityInfo.insertAdjacentHTML(
    'beforeend',
    `<h4 class="card-title" id="activity-title">${data.title}</h4>
    <h4 class="card-title" id="movie-title">${data.movie_title}</h4>
    <h6 class="card-title" id="movie-title-en">${data.title_en}</h6>
    <p class="card-text fs-5" id="runtime">片長：${data.runtime}</p>
    <p class="card-text fs-5" id="activity-date">${data.date}</p>
    <p class="card-text fs-5" id="activity-time">時間：${data.time}</p>
    <p class="card-text fs-5" id="activity-location">${data.city} - ${
      data.theater_name
    }</p>
    <p class="card-text fs-5" id="member">人數 (${members.data.length}/${
      data.max_member
    })</p>
    <div class="card-text mt-auto text-end">
        <small class="text-muted" id="post-time"
            >活動建立時間:${new Date(data.create_time).toLocaleString(
              'en-GB'
            )}</small
        >
    </div>`
  );

  acitivtyImg.insertAdjacentHTML(
    'beforeend',
    ` <img
    style="max-width: 14rem"
    src="${data.img}"
    class="img-fluid rounded mx-2 my-3"
    alt="..."
  />`
  );

  const {
    data: { role },
  } = await axios.get(`/api/v1/activity/role/${activityId}`);

  const controlbutton =
    role === 'leader'
      ? `
            <button class="btn" data-bs-toggle="modal" data-bs-target="#modal-edit">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                  <path
                    d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                  <path
                    fill-rule="evenodd"
                    d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                </svg>
            </button>
            <button class="btn" data-bs-toggle="modal" data-bs-target="#modal-delete">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                <path
                  d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                <path
                  fill-rule="evenodd"
                  d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
              </svg>
            </button>
`
      : `<button class="btn" data-bs-toggle="modal" data-bs-target="#modal-leave">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-box-arrow-right"        viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
            </svg>
         </button>`;
  activityControl.insertAdjacentHTML('beforeend', controlbutton);

  leaveSubmitButton.addEventListener('click', async () => {
    const {
      data: { msg },
    } = await axios.delete(`/api/v1/activity/leave/${activityId}`);

    msgModal.show();
    document.getElementById('modal-msg-body').innerHTML = msg;
  });

  deleteSubmitButton.addEventListener('click', async () => {
    await axios.delete(`/api/v1/activity/${activityId}`);
    window.location.href = '../';
  });

  previewImg.setAttribute('src', data.img);
  uploadImg.value = '';

  formTitle.value = data.title;
  formTitle.classList.remove('is-valid', 'is-invalid');
  formDescription.value = data.description;
  formDescription.classList.remove('is-valid', 'is-invalid');
  formCity.setAttribute('value', data.city);
  formDate.setAttribute('value', data.date);
  formTime.setAttribute('value', data.time);
  formTheater.setAttribute('value', data.theater_name);

  uploadImg.addEventListener('change', function readURL(event) {
    if (event.target.files[0]) {
      const imageTagID = event.target.getAttribute('targetID');

      const reader = new FileReader();

      reader.onload = function (element) {
        const img = document.getElementById(imageTagID);

        img.setAttribute('src', element.target.result);
      };

      reader.readAsDataURL(event.target.files[0]);
    }
  });

  activityForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    checkInput();

    let formData = new FormData(activityForm);
    formData.append('image', uploadImg.files[0]);

    let src = '';

    if (uploadImg.files[0]) {
      const data = await axios.post('/api/v1/activity/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      src = data.data.src;
    } else {
      src = data.img;
    }

    const jsonData = Object.fromEntries(formData.entries());

    for (const [key, value] of Object.entries(jsonData)) {
      if (!value) return;
    }

    let bodyData = {
      title: jsonData['form-title'],
      image: src,
      maxMembers: jsonData['form-maxMembers'],
      description: jsonData['form-description'],
    };

    const {
      data: { msg },
    } = await axios.patch(`/api/v1/activity/${activityId}`, bodyData);

    msgModal.show();
    document.getElementById('modal-msg-body').innerHTML = msg;
  });
}

formTitle.addEventListener('keyup', checkInput);
formDescription.addEventListener('keyup', checkInput);

function checkInput() {
  formTitle.value.length < 2 ? inValid(formTitle) : valid(formTitle);
  formDescription.value.length < 2
    ? inValid(formDescription)
    : valid(formDescription);
}

function inValid(node) {
  node.classList.remove('is-valid');
  node.classList.add('is-invalid');
}

function valid(node) {
  node.classList.remove('is-invalid');
  node.classList.add('is-valid');
}

msgModal._element.addEventListener('hidden.bs.modal', () => {
  location.reload();
});
