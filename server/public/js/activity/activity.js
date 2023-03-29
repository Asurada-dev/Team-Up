const activity = document.getElementById('activity');

window.onload = pageLoad;

async function pageLoad() {
  const { data } = await axios.get('/api/v1/activity');

  data.forEach((element) => {
    activity.insertAdjacentHTML(
      'beforeend',
      `<div class="card col-10 bg-dark mb-2">  
        <div class="row g-0">
          <div class="col-2">
            <img
              style="max-width: 11rem"
              src="${element.image}"
              class="img-fluid rounded mx-2 my-3"
              alt="..."
            />
          </div>
          <div class="col-9 ms-5 my-1">
            <div class="card-body">
              <div class="row g-0">
                <h4 class="col-10 card-title" id="title">
                  ${element.title}
                </h4>
              </div>
              <p class="card-text fs-5 mb-2" id="movie-title">片名：${element.movie_title}</p>
              <p class="card-text fs-5 mb-2" id="runtime">片長：${element.runtime}</p>
              <div class="row g-0">
                <div class="col-4">
                  <p class="card-text fs-5 mb-2" id="movie-date">
                    日期：${element.date}
                  </p>
                </div>
                <div class="col-6">
                  <p class="card-text fs-5 mb-2" id="movie-time">
                    時間：${element.time}
                  </p>
                </div>
              </div>
              <div class="row g-0">
                <div class="col-12">
                  <p class="card-text fs-5" id="movie-theater">
                    地點：${element.city} - ${element.theater_name}
                  </p>
                  <p class="card-text fs-6 text-truncate" id="description">
                    ${element.description}
                  </p>
                </div>
              </div>
              <div class="card-text fs-5 text-end">
                <a small class="text-muted" href="activity/activity-info/${element.id}">read more...</small>
              </div>
            </div>
          </div>
          </div>
        </div>`
    );
  });
}
