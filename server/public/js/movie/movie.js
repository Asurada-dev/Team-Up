const newMovie = document.getElementById('new-movie');

window.onload = pageLoad;

async function pageLoad() {
  const { data } = await axios.get('/api/v1/movie');
  data.forEach((element) => {
    newMovie.insertAdjacentHTML(
      'beforeend',
      `<div class="card card-block mx-2 mb-2 bg-dark" style="min-width: 14rem">
            <a href=movie/movie-info/${element.movie_id}>
                <img src=${element.img} class="card-img-top" alt=${element.title}/>
            </a>
            <div class="card-body" style="max-height: 12rem">
                <h5 class="movie-card-title">${element.title}</h5>
                <p class="movie-card-text text">${element.title_en}</p>
                <span class="movie-card-date"> 上映日期: ${element.release_date} </span>
            </div>
         </div>`
    );
  });
}
