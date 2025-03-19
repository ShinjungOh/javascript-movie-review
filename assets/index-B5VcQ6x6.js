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
const Header = ({ navigationBar }) => {
  const header = document.createElement("header");
  header.innerHTML = `
  <div class="background-container">
    <div class="overlay" aria-hidden="true"></div>
    <div class="top-rated-container">
      
      <div class="top-rated-movie">
        <div class="rate">
          <img src="images/star_empty.png" class="star" />
          <span class="rate-value">9.5</span>
        </div>
        <div class="title">인사이드 아웃2</div>
        <button class="primary detail">자세히 보기</button>
      </div>
    </div>
  </div>
`;
  const topRatedContainer = header.querySelector(".top-rated-container");
  if (topRatedContainer) {
    topRatedContainer.prepend(navigationBar);
  }
  return header;
};
const NavigationBar = ({ input }) => {
  const navigationContainer = document.createElement("div");
  navigationContainer.classList.add("navigation-container");
  navigationContainer.innerHTML = `
        <h1 class="logo">
          <img src="images/logo.png" alt="MovieList" />
        </h1>
      `;
  navigationContainer.appendChild(input);
  return navigationContainer;
};
const MovieList = ({ title, movieItems }) => {
  const movieContainer = document.createElement("section");
  movieContainer.classList.add("movie-container");
  movieContainer.innerHTML = `
            <h2>${title}</h2>
            <ul class="thumbnail-list">
            ${""}
            </ul>
        `;
  return movieContainer;
};
const MovieItem = ({ rate, title, imgSrc }) => {
  const movieItem = document.createElement("li");
  const mappedImage = imgSrc ? `https://image.tmdb.org/t/p/w500${imgSrc}` : "images/nullImage.png";
  movieItem.innerHTML = `
                <div class="item">
                <img
                class="thumbnail"
                src="${mappedImage}"
                    alt="${title}"$
                  />
                  <div class="item-desc">
                    <p class="rate">
                      <img src="images/star_empty.png" class="star" /><span
                        >${rate}</span
                      >
                    </p>
                    <strong>${title}</strong>
                  </div>
                </div>
              `;
  return movieItem;
};
const Input = ({ type, placeholder, onClick }) => {
  const searchWrapper = document.createElement("div");
  searchWrapper.classList.add("search-wrapper");
  searchWrapper.innerHTML = `
      <input type="${type}" class="search-input" placeholder="${placeholder}" />
      <img src="/images/Search.png" class="search-icon" alt="검색" />
    `;
  const searchIcon = searchWrapper.querySelector(".search-icon");
  if (searchIcon) {
    searchIcon.addEventListener("click", onClick);
  }
  return searchWrapper;
};
const Button = ({ text, onClick }) => {
  const detailButton = document.createElement("button");
  detailButton.classList.add("detail-button", "primary");
  detailButton.textContent = text;
  detailButton.addEventListener("click", onClick);
  return detailButton;
};
const popularApiUrl = "https://api.themoviedb.org/3/movie/popular?language=ko-KR&region=ko-KR";
const moviesState = {
  list: [],
  currentPage: 1
};
const fetchMovies = async (page = 1) => {
  try {
    const response = await fetch(`${popularApiUrl}&page=${page}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNGU1NGJlODQwY2FhYzExNzgyZGUxNGJkMDQwNzRmMiIsIm5iZiI6MTc0MjM0ODk5NC4yOTQwMDAxLCJzdWIiOiI2N2RhMjJjMjU5NGNhYzFlZTc2YzljYmYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.zw0K-a5QDd-934P_PzqgLdb-GT3pErrWixR39vsXZqs"}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    moviesState.list = data.results;
    moviesState.currentPage = page;
    return data;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
};
document.addEventListener("DOMContentLoaded", async () => {
  const input = Input({
    type: "text",
    placeholder: "검색어를 입력하세요",
    onClick: () => {
      console.log("검색 아이콘 클릭");
    }
  });
  const navigationBar = NavigationBar({ input });
  const header = Header({ navigationBar });
  const wrap = document.querySelector("#wrap");
  wrap == null ? void 0 : wrap.prepend(header);
  const renderMovies = () => {
    const movieContainer = document.querySelector(".movie-container");
    if (!movieContainer) return;
    movieContainer.innerHTML = "";
    const movieListComponent = MovieList({
      title: "지금 인기 있는 영화",
      movieItems: null
    });
    const thumbnailList = movieListComponent.querySelector(".thumbnail-list");
    if (!thumbnailList) return;
    moviesState.list.forEach((movie) => {
      const movieItemElement = MovieItem({
        rate: movie.vote_average,
        title: movie.title,
        imgSrc: movie.poster_path
      });
      thumbnailList.appendChild(movieItemElement);
    });
    movieContainer.appendChild(movieListComponent);
  };
  try {
    await fetchMovies();
    renderMovies();
    console.log("moviesState:", moviesState);
  } catch (error) {
    console.error("Error in main.ts:", error);
  }
  const button = Button({
    text: "더 보기",
    onClick: async () => {
      console.log("버튼 클릭");
      await fetchMovies(moviesState.currentPage + 1);
      renderMovies();
    }
  });
  const section = document.querySelector("section");
  section == null ? void 0 : section.appendChild(button);
});
