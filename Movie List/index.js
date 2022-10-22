const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIE_PER_PAGE = 12

const movies = []
let filteredMovies = []
let currentPage = 1
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const changeMode = document.querySelector('#change-mode')

function renderMovieList(data) {
  let rawHTML = ''
  if (dataPanel.dataset.mode === 'card-mode') {
    data.forEach((item) => {
      rawHTML += `<div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id='${item.id}'>More</button>
              <button class="btn btn-info btn-add-favorite" data-id='${item.id}'>+</button>
            </div>
        </div>
      </div>
    </div>
    `}) 
  } else if (dataPanel.dataset.mode === 'list-mode') {
    data.forEach((item) => {
    rawHTML += `<hr>
      <div class="col-sm-8">
        <h5>${item.title}</h5>
      </div>
      <div class="col-sm-4 mb-3">
        <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
        data-id='${item.id}'>More</button>
        <button class="btn btn-info btn-add-favorite" data-id='${item.id}'>+</button>
      </div>
    `
  })
    }
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIE_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page='${page}'>${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}


function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIE_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIE_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id)
  .then((response) => {
    const data = response.data.results  
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })

}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已在收藏清單中！')
  } else {
    list.push(movie)
  }

  localStorage.setItem('favoriteMovies', JSON.stringify(list))
  
}

function displayMode(mode) {
  if (dataPanel.dataset.mode === mode) return
  dataPanel.dataset.mode = mode
}

// 新增監聽器在改變模式上
changeMode.addEventListener('click', function onModeClicked(event) {
  if (event.target.matches('#card-mode')) {
    displayMode('card-mode')
    renderMovieList(getMoviesByPage(currentPage))
  } else if (event.target.matches('#list-mode')) {
    displayMode('list-mode')
    renderMovieList(getMoviesByPage(currentPage))
  }
})



dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event){
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

searchForm.addEventListener('submit', function onSeachFormSumitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  searchInput.value = ''

  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0 ) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(currentPage))
})


axios.get(INDEX_URL)
.then((response) => {
movies.push(...response.data.results)
renderPaginator(movies.length)
renderMovieList(getMoviesByPage(currentPage))
})

