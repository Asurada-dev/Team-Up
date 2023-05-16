const newMovie = document.getElementById('new-movie');

window.onload = pageLoad;

async function pageLoad() {
  const { data } = await axios.get('/api/v1/movie');
  const today = new Date().setHours(0, 0, 0, 0);
  const inTheaterMovie = data.filter(
    (element) => today === new Date(element.update_time).setHours(0, 0, 0, 0)
  );

  inTheaterMovie.forEach((element) => {
    newMovie.insertAdjacentHTML(
      'beforeend',
      `<div class="card card-block mx-2 mb-5 bg-dark" style="max-width: 14rem; max-height: 32rem;">
            <div class="m-2">
              <a href=movie/movie-info/${element.movie_id} class="stretched-link">
                  <img src=${element.img} class="card-img-top img-fluid" alt=${element.title}" style="width: 100%; height: 20rem; object-fit: cover; "/>
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
}
