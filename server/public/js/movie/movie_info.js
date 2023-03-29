const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const dateDropdown = document.getElementById('date');
const cityDropdown = document.getElementById('city');

const createActivityModal = new bootstrap.Modal(
  document.getElementById('modal'),
  {}
);
const activityForm = document.getElementById('activity-form');
const formScheduleId = document.getElementById('form-scheduleId');
const formTitle = document.getElementById('form-title');
const maxMembers = document.getElementById('form-maxMembers');
const formDate = document.getElementById('form-date');
const formTime = document.getElementById('form-time');
const formCity = document.getElementById('form-city');
const formTheater = document.getElementById('form-theater');
const formDescription = document.getElementById('form-description');
const modalBody = document.getElementById('modal-body');

const movieInfo = document.getElementById('movie-info');
const movieImg = document.getElementById('movie-img');
const movieReleaseDateSelection = document.getElementById(
  'release-date-selection'
);

const uploadImg = document.getElementById('upload-img');
const previewImg = document.getElementById('preview-img');
const movieSchedule = document.getElementById('movie-schedule');

let defaultImg = '';

window.onload = pageLoad;

// image preview
uploadImg.addEventListener('change', function readURL(event) {
  if (event.target.files[0]) {
    var imageTagID = event.target.getAttribute('targetID');

    var reader = new FileReader();

    reader.onload = function (element) {
      var img = document.getElementById(imageTagID);

      img.setAttribute('src', element.target.result);
    };

    reader.readAsDataURL(event.target.files[0]);
  }
});

async function pageLoad() {
  const id = window.location.href.split('/').reverse()[0];

  const { data } = await axios.get(`/api/v1/movie/${id}`);
  const releaseDate = await axios.get(`/api/v1/movie/movie-release-date/${id}`);
  defaultImg = data.img;

  movieInfo.insertAdjacentHTML(
    'beforeend',
    ` <h2 class="card-title" id="title">${data.title}</h2>
      <h6 class="card-title" id="title-en">${data.title_en}</h6>
      <p></p>
      <p class="card-text fs-5" id="release-date">release-date: ${data.release_date}</p>
      <p class="card-text fs-5" id="runtime">片長: ${data.runtime}</p>
      <p class="card-text fs-5" id="distributor">distributor: ${data.distributor}</p>
      <p class="card-text fs-5" id="imdb">imdb: ${data.imdb}</p>`
  );

  movieImg.insertAdjacentHTML(
    'beforeend',
    `<img id="" src="${data.img}" class="img-fluid rounded mx-2 my-3" alt="..."/>`
  );

  previewImg.setAttribute('src', data.img);
  let releaseDateArray = [];
  releaseDate.data.forEach((element) => releaseDateArray.push(element.date));
  releaseDateArray.forEach((element) => {
    movieReleaseDateSelection.insertAdjacentHTML(
      'beforeend',
      `<button type="button" class="btn btn-secondary" value="${element}">${element}</button>`
    );
  });
}

movieReleaseDateSelection.addEventListener('click', async function (element) {
  const id = window.location.href.split('/').reverse()[0];
  const schedule = await axios.get(
    `/api/v1/movie/movie-schedule/${id}?date=${element.target.value}`
  );

  const citySet = new Set();
  const theaterSet = new Set();
  schedule.data.forEach((element) => {
    citySet.add(element.city);
    theaterSet.add(element.theater);
  });

  movieSchedule.innerHTML = '';
  citySet.forEach((city) => {
    movieSchedule.insertAdjacentHTML(
      'beforeend',
      `<div class="col-12 mb-5" id="${city}">
        <h4>${city}</h4>
      </div>`
    );
    let cityId = document.getElementById(city);

    theaterSet.forEach((theater) => {
      const arrayList = schedule.data.filter(
        (element) => element.city === city && element.theater === theater
      );
      if (arrayList.length) {
        cityId.insertAdjacentHTML(
          'beforeend',
          `   <div class="theater" id="${arrayList[0].theater}">
                <h6>${arrayList[0].theater}</h6>                
              </div>`
        );
        let theater = document.getElementById(`${arrayList[0].theater}`);
        arrayList.forEach((element) => {
          theater.insertAdjacentHTML(
            'beforeend',
            `<button class="btn btn-outline-light btn-time-width px-4 mx-2 mb-2" value="${element.id}">${element.time}</button>`
          );
        });
      }
    });
  });
  const theater = document.getElementsByClassName('theater');

  Array.from(theater).forEach((button) => {
    const id = window.location.href.split('/').reverse()[0];
    button.addEventListener('click', async function (event) {
      if (event.target && event.target.nodeName === 'BUTTON') {
        createActivityModal.show();
        const { data } = await axios.get(`/api/v1/movie/${id}`);
        previewImg.setAttribute('src', data.img);
        formScheduleId.setAttribute('value', event.target.value);
        uploadImg.value = '';

        formTitle.value = '';
        formTitle.classList.remove('is-valid', 'is-invalid');
        formDescription.value = '';
        formDescription.classList.remove('is-valid', 'is-invalid');
        formCity.setAttribute(
          'value',
          event.target.parentElement.parentElement.id
        );
        formDate.setAttribute('value', element.target.value);
        formTime.setAttribute('value', event.target.outerText);
        formTheater.setAttribute('value', event.target.parentElement.id);
      }
    });
  });
});

activityForm.addEventListener('submit', async function submit(event) {
  event.preventDefault();
  checkInput();

  let formData = new FormData(activityForm);
  formData.append('image', uploadImg.files[0]);

  let src = '';

  if (uploadImg.files[0]) {
    const data = await axios.post('/api/v1/activity/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log(data);
    src = data.data.src;
  } else {
    src = defaultImg;
  }

  const jsonData = Object.fromEntries(formData.entries());

  for (const [key, value] of Object.entries(jsonData)) {
    console.log(key, value);
    if (!value) {
      return;
    }
  }

  let bodyData = {
    scheduleId: jsonData['form-scheduleId'],
    title: jsonData['form-title'],
    image: src,
    maxMembers: jsonData['form-maxMembers'],
    description: jsonData['form-description'],
  };
  console.log(bodyData);

  const {
    data: { msg },
  } = await axios.post('/api/v1/activity', bodyData);

  let msgModal = new bootstrap.Modal(document.getElementById('modal-msg'), {});
  msgModal.show();
  document.getElementById('modal-msg-body').innerHTML = msg;
});

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
