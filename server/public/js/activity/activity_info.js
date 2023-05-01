const acitivtyImg = document.getElementById('activity-img');
const activityInfo = document.getElementById('activity-info');
const activityDescription = document.getElementById('activity-description');
const joinActivityModal = new bootstrap.Modal(
  document.getElementById('modal'),
  {}
);
const msgModal = new bootstrap.Modal(document.getElementById('modal-msg'), {});
const joinButton = document.getElementById('button-join');

window.onload = pageLoad;

joinButton.addEventListener('click', async (event) => {
  const activityId = window.location.href.split('/').reverse()[0];
  const {
    data: { msg },
  } = await axios.post(`/api/v1/activity/${activityId}`);

  msgModal.show();
  document.getElementById('modal-msg-body').innerHTML = msg;
});

async function pageLoad() {
  const activityId = window.location.href.split('/').reverse()[0];

  const { data } = await axios.get(`/api/v1/activity/${activityId}`);
  const members = await axios.get(`/api/v1/activity/members/${activityId}`);

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
    src="${data.image}"
    class="img-fluid rounded mx-2 my-3"
    alt="..."
  />`
  );
}

msgModal._element.addEventListener('hidden.bs.modal', () => {
  location.reload();
});
