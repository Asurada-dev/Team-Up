const newMovie = document.getElementById('new-movie');
const newActivity = document.getElementById('new-activity');

window.onload = pageLoad;

async function pageLoad() {
  const movie = await axios.get('/api/v1/movie');
  const today = new Date();

  const inTheaterMovie = movie.data.filter(
    (element) =>
      today.setHours(0, 0, 0, 0) ===
      new Date(element.update_time).setHours(0, 0, 0, 0)
  );

  inTheaterMovie.forEach((element) => {
    newMovie.insertAdjacentHTML(
      'beforeend',
      `<div class="card card-block mx-2 mb-5 bg-dark" style="width: 12rem; max-height: 32rem;">
            <div class="m-2">
              <a href=movie/movie-info/${element.movie_id} class="stretched-link">
                  <img src=${element.img} class="card-img-top img-fluid" alt=${element.title}" style="width: 100%; height: 16rem; object-fit: cover; "/>
              </a>
            </div>
            <div class="card-body d-flex flex-column" style="max-height: 12rem;" >
                <h5 class="movie-card-title text-truncate">${element.title}</h5>
                <p class="movie-card-text text-truncate">${element.title_en}</p>
                <span class="movie-card-date mt-auto"> 上映日期: ${element.release_date} </span>
            </div>
         </div>`
    );
  });

  const activity = await axios.get('/api/v1/activity');

  const openActivity = [];
  const currentTime = new Date();
  activity.data.forEach((element) => {
    const scheduleDate = new Date(`${element.date}T${element.time}`);
    if (scheduleDate >= currentTime) {
      openActivity.push(element);
    }
  });

  for (let i = 0; i < Math.min(5, openActivity.length); i++) {
    newActivity.insertAdjacentHTML(
      'beforeend',
      ` <div class="card col-10 bg-dark mb-2">  
              <div class="row g-0">
                  <div class="col-2">
                      <img
                      style="max-width: 11rem"
                      src="${openActivity[i].img}"
                      class="img-fluid rounded mx-2 my-3"
                      alt="..."
                      />
                  </div>
              <div class="col-9 ms-5 my-1">
          <div class="card-body">
              <div class="row g-0">
                  <h4 class="col-10 card-title" id="title">
                  ${openActivity[i].title}
                  </h4>
              </div>
              <p class="card-text fs-5 mb-2" id="movie-title">片名：${openActivity[i].movie_title}</p>
              <p class="card-text fs-5 mb-2" id="runtime">片長：${openActivity[i].runtime}</p>
              <div class="row g-0">
                  <div class="col-4">
                      <p class="card-text fs-5 mb-2" id="movie-date">日期：${openActivity[i].date}</p>
                  </div>
                  <div class="col-6">
                    <p class="card-text fs-5 mb-2" id="movie-time">
                      時間：${openActivity[i].time}
                    </p>
                  </div>
              </div>
              <div class="row g-0">
                  <div class="col-12">
                    <p class="card-text fs-5" id="movie-theater">
                      地點：${openActivity[i].city} - ${openActivity[i].theater_name}
                    </p>
                    <p class="card-text fs-6 text-truncate" id="description">
                      ${openActivity[i].description}
                    </p>
                  </div>
              </div>
                <div class="card-text fs-5 text-end">
                  <a small class="text-muted stretched-link" href="/activity/activity-info/${openActivity[i].id}">read more...</small>
                </div>
              </div>
            </div>
            </div>
          </div>`
    );
  }
}
