(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const $ = (selector) => document.querySelector(selector);
const createElement = (tagName, attributes = {}) => {
  var _a;
  const $el = document.createElement(tagName);
  ((_a = attributes.class) == null ? void 0 : _a.length) && $el.classList.add(...attributes.class);
  delete attributes.class;
  attributes.textContent && ($el.textContent = attributes.textContent);
  delete attributes.textContent;
  attributes.innerHTML && ($el.innerHTML = String(attributes.innerHTML));
  delete attributes.innerHTML;
  Object.entries(attributes).forEach(([key, value]) => {
    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase();
      $el.addEventListener(eventName, value);
      return;
    }
    if (value != null) {
      $el.setAttribute(key, String(value));
    }
  });
  return $el;
};
const Header = ({ movie }) => {
  const $header = createElement("header", {
    id: "app-header"
  });
  const backgroundImageUrl = movie && movie.imageSrc ? `https://image.tmdb.org/t/p/original${movie.imageSrc}` : "images/default-background.jpg";
  $header.innerHTML = `
  <div class="background-container" style="background-image: url('${backgroundImageUrl}');">
    <div class="overlay" aria-hidden="true"></div>
    <div class="top-rated-container">
      
      ${movie ? `<div class="top-rated-movie">
        <div class="rate">
          <img src="images/star_empty.png" class="star" />
          <span class="rate-value">${movie == null ? void 0 : movie.rating}</span>
        </div>
        <div class="title">${movie == null ? void 0 : movie.title}</div>
        <button class="primary detail">자세히 보기</button>
      </div>` : ""}
    </div>
  </div>
`;
  return $header;
};
const NavigationBar = ({ input, onClick }) => {
  const $navigationContainer = createElement("div", {
    class: ["navigation-container"],
    innerHTML: `
        <h1 class="logo" id="app-logo">
          <img src="images/logo.png" alt="MovieList" />
        </h1>
      `
  });
  if (input) {
    $navigationContainer.appendChild(input);
  }
  if (onClick) {
    const appLogo = $navigationContainer.querySelector("#app-logo");
    appLogo == null ? void 0 : appLogo.addEventListener("click", onClick);
  }
  return $navigationContainer;
};
const SearchInput = ({ type, placeholder, onSubmit }) => {
  const searchWrapper = createElement("div", {
    class: ["search-wrapper"],
    innerHTML: `
      <input type="${type}" class="search-input" placeholder="${placeholder}" />
      <img src="images/Search.png" class="search-icon" alt="검색" />
    `
  });
  const searchInput = searchWrapper.querySelector(
    ".search-input"
  );
  const searchIcon = searchWrapper.querySelector(".search-icon");
  const search = () => {
    const query = searchInput.value.trim();
    if (query !== "") {
      onSubmit(query);
    }
  };
  searchIcon == null ? void 0 : searchIcon.addEventListener("click", search);
  searchInput == null ? void 0 : searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      search();
    }
  });
  return searchWrapper;
};
const Skeleton = {
  render: (el, count = 8) => {
    const $skeletonUl = createElement("ul", {
      class: ["skeleton-list"]
    });
    const $skeletonItems = Array.from(
      { length: count },
      () => createElement("li", {})
    );
    $skeletonUl.append(...$skeletonItems);
    el.appendChild($skeletonUl);
  },
  remove: () => {
    const $skeletonUl = $(".skeleton-list");
    if ($skeletonUl) {
      $skeletonUl.remove();
    }
  }
};
const bearerToken = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNGU1NGJlODQwY2FhYzExNzgyZGUxNGJkMDQwNzRmMiIsIm5iZiI6MTc0MjM0ODk5NC4yOTQwMDAxLCJzdWIiOiI2N2RhMjJjMjU5NGNhYzFlZTc2YzljYmYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.zw0K-a5QDd-934P_PzqgLdb-GT3pErrWixR39vsXZqs";
const defaultOptions = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${bearerToken}`
  }
};
const http = {
  request: (apiUrl, options) => {
    return fetch(apiUrl, options).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    }).catch((error) => {
      console.error("Error fetching movies:", error);
      throw error;
    });
  },
  get: (url) => {
    return http.request(url, defaultOptions);
  }
};
const baseApiUrl = "https://api.themoviedb.org/3";
const movieDetailApiUrl = `${baseApiUrl}/movie`;
const popularApiUrl = `${movieDetailApiUrl}/popular`;
const searchApiUrl = `${baseApiUrl}/search/movie`;
const fetchPopularMovies = (page = 1) => {
  return http.get(`${popularApiUrl}?language=ko-KR&region=ko-KR&page=${page}`);
};
const fetchSearchedMovies = (searchQuery, page = 1) => {
  const queryString = `query=${encodeURIComponent(
    searchQuery
  )}&page=${page}&language=ko-KR&region=ko-KR&include_adult=false`;
  const url = `${searchApiUrl}?${queryString}`;
  return http.get(url);
};
const fetchMovieDetail$1 = (movieId) => {
  return http.get(`${movieDetailApiUrl}/${movieId}?language=ko-KR`);
};
const movieApi = {
  fetchPopularMovies,
  fetchSearchedMovies,
  fetchMovieDetail: fetchMovieDetail$1
};
const mapToMovie = (apiData) => ({
  id: apiData.id,
  title: apiData.title,
  rating: Number(apiData.vote_average.toFixed(1)),
  imageSrc: apiData.poster_path,
  description: apiData.overview,
  releaseDate: apiData.release_date,
  genres: apiData.genres || []
});
const state = {
  list: [],
  currentPage: 1,
  totalPages: 0,
  isLoading: false,
  query: ""
};
const getState = () => state;
const updateState = (updates) => {
  Object.assign(state, updates);
};
const fetchMovies = async (page, query, isFirstLoad = false) => {
  try {
    updateState({ isLoading: true });
    if (isFirstLoad) {
      updateState({ list: [] });
    }
    const response = !query ? await movieApi.fetchPopularMovies(page) : await movieApi.fetchSearchedMovies(query, page);
    const movies = response.results.map(mapToMovie);
    const { list } = getState();
    updateState({
      list: page === 1 ? movies : [...list, ...movies],
      currentPage: page,
      totalPages: response.total_pages,
      query: query || "",
      isLoading: false
    });
    return response;
  } catch (error) {
    console.error("영화 로딩 중 오류 발생:", error);
    updateState({ isLoading: false });
    throw error;
  }
};
const fetchMovieDetail = async (movieId) => {
  return await movieApi.fetchMovieDetail(movieId).then(mapToMovie);
};
const Title = ({ text }) => {
  const $title = createElement("h2", {
    class: ["main-title"],
    textContent: text
  });
  return $title;
};
const mappedImage = (imageSrc) => {
  const mappedImage2 = imageSrc ? `https://image.tmdb.org/t/p/w500${imageSrc}` : "images/nullImage.png";
  return mappedImage2;
};
const CardItem = ({ id, title, rating, imageSrc, onClick }) => {
  const mappedImg = imageSrc ? mappedImage(imageSrc) : "";
  const $cardItem = createElement("li", {
    innerHTML: `
    <div class="item">
      <img class="thumbnail" src="${mappedImg}" alt="${title}" />
      <div class="item-desc">
        <p class="rate">
          <img src="images/star_empty.png" class="star" /><span>${rating}</span>
        </p>
        <strong>${title}</strong>
      </div>
    </div>
  `
  });
  $cardItem.addEventListener("click", () => {
    onClick(id);
  });
  return $cardItem;
};
const createStorage = (key, storage = typeof window !== "undefined" ? window.localStorage : void 0) => {
  if (!storage) {
    throw new Error("storage를 사용할 수 없습니다.");
  }
  const get = () => {
    const item = storage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error parsing localStorage item for key "${key}":`, error);
      return null;
    }
  };
  const set = (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      storage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error setting localStorage item for key "${key}":`, error);
    }
  };
  const remove = () => {
    storage.removeItem(key);
  };
  return { get, set, remove };
};
createStorage("movies");
const RATING_MESSAGES = {
  0: "별점을 남겨 주세요",
  2: "별로였어요",
  4: "아쉬운 작품이에요",
  6: "그럭저럭 볼만했어요",
  8: "재밌게 봤어요",
  10: "명작이에요"
};
const movieRatingsStorage = createStorage("movieRatings");
const Modal = ({ item }) => {
  const { id } = item;
  const modalState = {
    userRating: 0
  };
  const $body = $("body");
  const $modalBackground = createElement("div", {
    class: ["modal-background", "active"],
    id: "modalBackground"
  });
  const $modal = createElement("dialog", {
    class: ["modal"]
  });
  $body == null ? void 0 : $body.appendChild($modalBackground);
  $body == null ? void 0 : $body.appendChild($modal);
  const closeModal = () => {
    $modal.close();
    $modal.remove();
    $modalBackground.remove();
  };
  const handleClickClose = () => {
    closeModal();
  };
  const handleKeyDownESC = (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  };
  const handleClickBackDrop = (event) => {
    if (event.target === $modal) {
      closeModal();
    }
  };
  const getUserRating = (movieId) => {
    const ratings = movieRatingsStorage.get();
    if (!ratings || !Array.isArray(ratings)) {
      return 0;
    }
    const userRating = ratings.find(
      (rating) => rating.movieId === movieId
    );
    return userRating ? userRating.rating : 0;
  };
  const saveUserRating = (movieId, rating) => {
    const ratings = movieRatingsStorage.get() || [];
    const existingRatingIndex = ratings.findIndex(
      (rating2) => rating2.movieId === movieId
    );
    if (existingRatingIndex !== -1) {
      ratings[existingRatingIndex].rating = rating;
    } else {
      ratings.push({ movieId, rating });
    }
    movieRatingsStorage.set(ratings);
    return rating;
  };
  const handleStarClick = (event) => {
    const target = event.target;
    if (!target.classList.contains("star-item")) return;
    const rating = parseInt(target.dataset.value || "0", 10);
    modalState.userRating = saveUserRating(id, rating);
    renderStars(modalState.userRating);
    updateRatingMessage(modalState.userRating);
  };
  const renderStars = (rating) => {
    const starContainer2 = $modal.querySelector(".star-container");
    if (!starContainer2) return;
    starContainer2.innerHTML = "";
    for (const i of [2, 4, 6, 8, 10]) {
      const starClass = i <= rating ? "star_filled.png" : "star_empty.png";
      const star = createElement("img");
      star.src = `images/${starClass}`;
      star.classList.add("star");
      star.classList.add("star-item");
      star.dataset.value = i.toString();
      starContainer2.appendChild(star);
    }
  };
  const updateRatingMessage = (rating) => {
    const ratingMessage = $modal.querySelector(".rating-message");
    if (!ratingMessage) return;
    const message = RATING_MESSAGES[rating] || RATING_MESSAGES[0];
    ratingMessage.textContent = rating > 0 ? `${message}(${rating}/10)` : message;
  };
  const extractYear = (date) => {
    return date.slice(0, 4);
  };
  const formatGenres = (genres) => {
    return genres.map((genre) => genre.name).join(", ");
  };
  $modalBackground.addEventListener("click", handleClickBackDrop);
  document.addEventListener("keydown", handleKeyDownESC);
  $modal.innerHTML = `
        <button class="close-modal" id="closeModal">
          <img src="images/modal_button_close.png" />
        </button>
        <div class="modal-container">
          <div class="modal-image">
            <img
              src="${item.imageSrc ? mappedImage(item.imageSrc) : ""}" alt="${item.title}"
            />
          </div>
          <div class="modal-description">
          <div class="modal-header">
          ${item.title ? `<h2>${item.title}</h2>` : "영화 제목 없음"}
          
            <p class="category">
              <span>${extractYear(item.releaseDate)}</span> · 로딩중...
            </p>
            <div class="rate-container">
              <span class="average">평균</span>
              <img src="images/star_filled.png" class="star" /><span>${item.rating}</span>
            </div>
          </div>
          <hr />
            
            <div class="my-rate-container">
            <h3>내 별점</h3>
            <div class="my-rate-content">
            <div class="star-container">
              <!-- 별점 동적으로 추가 -->
            </div>
            <span class="rating-message">${RATING_MESSAGES[0]}</span>
            </div>
            </div>
            <hr />
            
            <h3>줄거리</h3>
            ${item.description ? `<p class="detail">${item.description}</p>` : `<p class="detail">줄거리 요약이 없습니다.</p>`}
          </div>
        </div>
`;
  const closeButton = $modal.querySelector(".close-modal");
  closeButton == null ? void 0 : closeButton.addEventListener("click", handleClickClose);
  $modal.addEventListener("click", handleClickBackDrop);
  const starContainer = $modal.querySelector(".star-container");
  starContainer == null ? void 0 : starContainer.addEventListener("click", handleStarClick);
  modalState.userRating = getUserRating(id);
  renderStars(modalState.userRating);
  updateRatingMessage(modalState.userRating);
  const loadMovieDetail = async () => {
    try {
      const movieDetail = await fetchMovieDetail(item.id);
      const genresText = movieDetail.genres && movieDetail.genres.length > 0 ? formatGenres(movieDetail.genres) : "장르 정보 없음";
      const $category = $modal.querySelector(".category");
      if ($category) {
        $category.innerHTML = `<span>${extractYear(
          item.releaseDate
        )}</span> · ${genresText}`;
      }
    } catch (error) {
      console.error("영화 상세 정보를 불러오는데 실패했습니다.", error);
    }
  };
  loadMovieDetail();
  return $modal;
};
const CardList = ({ items = [], el, isAppend = false }) => {
  const render = () => {
    if (items.length === 0) return;
    const $fragment = document.createDocumentFragment();
    const cardItems = items.map(
      (item) => CardItem({
        id: item.id,
        title: item.title,
        rating: item.rating,
        imageSrc: item.imageSrc,
        description: item.description,
        onClick: () => handleShowDetail(item.id)
      })
    );
    $fragment.append(...cardItems);
    if (isAppend) {
      const $existingList = el.querySelector(".thumbnail-list");
      if ($existingList) {
        $existingList.appendChild($fragment);
        return;
      }
    }
    const $movieContainer = createElement("section", {
      class: ["movie-container"]
    });
    const $ul = createElement("ul", {
      class: ["thumbnail-list"]
    });
    $ul.appendChild($fragment);
    $movieContainer.appendChild($ul);
    el.appendChild($movieContainer);
  };
  const handleShowDetail = (id) => {
    const targetItem = items.find((item) => item.id === id);
    if (!targetItem) return;
    const $modal = Modal({ item: targetItem });
    document.body.appendChild($modal);
    if ($modal instanceof HTMLDialogElement) {
      $modal.showModal();
    }
  };
  render();
};
const $main = $("main");
const $loadTrigger = $("load-trigger");
const scrollObserver = new IntersectionObserver(
  async (entries, observer) => {
    if (!$main) return;
    if (!entries.some((entry) => entry.isIntersecting)) {
      return;
    }
    const { currentPage, totalPages, query, isLoading } = getState();
    if (isLoading || currentPage === totalPages) {
      if (currentPage === totalPages) observer.disconnect();
      return;
    }
    updateState({ isLoading: true });
    showLoadingIndicator($main);
    await fetchMovies(currentPage + 1, query);
    appendNewMovies($main);
  },
  { threshold: 0.1 }
);
if ($loadTrigger) {
  scrollObserver.observe($loadTrigger);
}
const renderTitle = ($container) => {
  const movieSectionTitle = Title({ text: "지금 인기 있는 영화" });
  $container.appendChild(movieSectionTitle);
};
const renderMovies = ($main2) => {
  const state2 = getState();
  $main2.innerHTML = "";
  if (state2.isLoading) {
    Skeleton.render($main2);
    return;
  }
  if (state2.query) {
    const searchedMovieTitle = Title({
      text: `"${state2.query}" 검색 결과`
    });
    searchedMovieTitle.classList.add("search-result-title");
    $main2.appendChild(searchedMovieTitle);
  } else {
    renderTitle($main2);
  }
  if (state2.list.length === 0) {
    const emptySection = createElement("section", {
      class: ["empty-container"],
      innerHTML: `<img src="images/empty_logo.png" alt="우아한테크코스 로고" />
                  <h2 class="empty-content">검색 결과가 없습니다.</h2>`
    });
    $main2.appendChild(emptySection);
    return;
  }
  CardList({
    items: state2.list,
    el: $main2
  });
  const $loadTrigger2 = createElement("div", { id: "load-trigger" });
  $main2.appendChild($loadTrigger2);
  scrollObserver.observe($loadTrigger2);
};
const showLoadingIndicator = ($main2) => {
  const $existingLoadTrigger = $("#load-trigger");
  if ($existingLoadTrigger) {
    $existingLoadTrigger.remove();
  }
  const $loadingMore = createElement("div", { id: "loading-more" });
  $main2.appendChild($loadingMore);
  Skeleton.render($loadingMore);
};
const appendNewMovies = ($main2) => {
  var _a;
  (_a = $("#loading-more")) == null ? void 0 : _a.remove();
  const state2 = getState();
  if (state2.currentPage <= 1) {
    renderMovies($main2);
    return;
  }
  const totalItems = state2.list.length;
  const itemsPerPage = Math.ceil(totalItems / state2.currentPage);
  const startIndex = Math.max(0, totalItems - itemsPerPage);
  const newItems = state2.list.slice(startIndex);
  CardList({
    items: newItems,
    el: $main2,
    isAppend: true
  });
  const $loadTrigger2 = createElement("div", { id: "load-trigger" });
  $main2.appendChild($loadTrigger2);
  scrollObserver.observe($loadTrigger2);
};
document.addEventListener("DOMContentLoaded", async () => {
  const $main2 = $("main");
  const $wrap = $("#wrap");
  if (!$main2 || !$wrap) return;
  const header = Header({ movie: null });
  $wrap.prepend(header);
  const searchInput = SearchInput({
    type: "text",
    placeholder: "검색어를 입력하세요",
    onSubmit: async (query) => {
      if (!query.trim()) {
        alert("검색어를 입력하세요.");
        return;
      }
      await fetchMovies(1, query.trim(), true);
      renderMovies($main2);
      const { list } = getState();
      if (list.length > 0) {
        const updatedHeader = Header({ movie: list[0] });
        header.replaceWith(updatedHeader);
      }
      const $header = $("#app-header");
      const $navigation = $(".navigation-container");
      if ($header) $header.style.display = "none";
      if ($navigation) $navigation.style.position = "unset";
    }
  });
  const handleClickLogo = () => {
    location.reload();
  };
  const navigationBar = NavigationBar({
    input: searchInput,
    onClick: handleClickLogo
  });
  $wrap.prepend(navigationBar);
  const container = $(".container");
  if (!container) return;
  const loadInitialMovies = async () => {
    Skeleton.render($main2);
    await fetchMovies(1, "", true);
    renderMovies($main2);
    const { list } = getState();
    if (list.length > 0) {
      const updatedHeader = Header({ movie: list[0] });
      header.replaceWith(updatedHeader);
    }
  };
  loadInitialMovies();
});
