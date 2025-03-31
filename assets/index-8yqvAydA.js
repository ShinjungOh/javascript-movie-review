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
  render: (el) => {
    const $skeletonUl = createElement("ul", {
      class: ["skeleton-list"],
      innerHTML: `
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>`
    });
    el.appendChild($skeletonUl);
    return $skeletonUl;
  },
  remove: ($skeleton) => {
    $skeleton.remove();
  }
};
const baseApiUrl = "https://api.themoviedb.org/3";
const popularApiUrl = `${baseApiUrl}/movie/popular`;
const searchApiUrl = `${baseApiUrl}/search/movie`;
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
const movieApi = {
  fetchPopularMovies,
  fetchSearchedMovies
};
const mapToMovie = (apiData) => ({
  id: apiData.id,
  title: apiData.title,
  rating: Number(apiData.vote_average.toFixed(1)),
  imageSrc: apiData.poster_path
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
const Title = ({ text }) => {
  const $title = createElement("h2", {
    class: ["main-title"],
    textContent: text
  });
  return $title;
};
const CardItem = ({ id, title, rating, imageSrc, onShowDetail }) => {
  const mappedImage = imageSrc ? `https://image.tmdb.org/t/p/w500${imageSrc}` : "images/nullImage.png";
  const $cardItem = createElement("li", {
    innerHTML: `
    <div class="item">
      <img class="thumbnail" src="${mappedImage}" alt="${title}" />
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
    onShowDetail(id);
  });
  return $cardItem;
};
const Modal = ({ item }) => {
  const { title, description } = item;
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
  $modalBackground.addEventListener("click", handleClickBackDrop);
  document.addEventListener("keydown", handleKeyDownESC);
  $modal.innerHTML = `
        <button class="close-modal" id="closeModal">
          <img src="images/modal_button_close.png" />
        </button>
        <div class="modal-container">
          <div class="modal-image">
            <img
              src="${item.imageSrc ? `https://image.tmdb.org/t/p/w500${item.imageSrc}` : "images/nullImage.png"}" alt="${title}"
            />
          </div>
          <div class="modal-description">
          <div class="modal-header">
          ${title ? `<h2>${title}</h2>` : "인사이드 아웃 2"}
            <p class="category">
              2024 · 모험, 애니메이션, 코미디, 드라마, 가족
            </p>
            <div class="rate-container">
              <span class="average">평균</span>
              <img src="images/star_filled.png" class="star" /><span>7.7</span>
            </div>
          </div>
          <hr />
            
            <div class="my-rate-container">
            <h3>내 별점</h3>
            <div class="my-rate-content">
            <div class="star-container">
              <img src="images/star_filled.png" class="star" />
              <img src="images/star_filled.png" class="star" />
              <img src="images/star_filled.png" class="star" />
              <img src="images/star_filled.png" class="star" />
              <img src="images/star_empty.png" class="star" />
            </div>
            <span>명작이에요(8/10)</span>
            </div>
            </div>
            <hr />
            
            <h3>줄거리</h3>
            ${description ? `<p class="detail">${description}</p>` : `<p class="detail">
              13살이 된 라일리의 행복을 위해 매일 바쁘게 머릿속 감정 컨트롤
              본부를 운영하는 ‘기쁨’, ‘슬픔’, ‘버럭’, ‘까칠’, ‘소심’. 그러던
              어느 날, 낯선 감정인 ‘불안’, ‘당황’, ‘따분’, ‘부럽’이가 본부에
              등장하고, 언제나 최악의 상황을 대비하며 제멋대로인 ‘불안’이와 기존
              감정들은 계속 충돌한다. 결국 새로운 감정들에 의해 본부에서
              쫓겨나게 된 기존 감정들은 다시 본부로 돌아가기 위해 위험천만한
              모험을 시작하는데…
            </p>`}
          </div>
        </div>
`;
  const closeButton = $modal.querySelector(".close-modal");
  closeButton == null ? void 0 : closeButton.addEventListener("click", handleClickClose);
  $modal.addEventListener("click", handleClickBackDrop);
  return $modal;
};
const CardList = ({ items = [], el }) => {
  const render = () => {
    const $movieContainer = createElement("section", {
      class: ["movie-container"]
    });
    const $ul = createElement("ul", {
      class: ["thumbnail-list"]
    });
    const $fragment = document.createDocumentFragment();
    if (items.length !== 0) {
      const cardItems = items.map(
        (item) => CardItem({
          id: item.id,
          title: item.title,
          rating: item.rating,
          imageSrc: item.imageSrc,
          description: item.description,
          onShowDetail: () => handleShowDetail(item.id)
        })
      );
      $fragment.append(...cardItems);
      $ul.appendChild($fragment);
      $movieContainer.appendChild($ul);
      el.appendChild($movieContainer);
    }
  };
  const handleShowDetail = (id) => {
    const targetItem = items.find(
      (item) => item.id === id
    );
    if (!targetItem) return;
    const $modal = Modal({ item: targetItem });
    document.body.appendChild($modal);
    if ($modal instanceof HTMLDialogElement) {
      $modal.showModal();
    }
  };
  render();
};
const $main = document.querySelector("main");
const $sentinel = document.getElementById("scroll-sentinel");
const observer = new IntersectionObserver(async (entries, observer2) => {
  if (!$main) return;
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const { currentPage, totalPages, query, isLoading } = getState();
      if (isLoading || currentPage === totalPages) {
        if (currentPage === totalPages) observer2.disconnect();
        return;
      }
      await fetchMovies(currentPage + 1, query);
      renderMovies($main);
    }
  }
}, { threshold: 0.1 });
if ($sentinel) {
  observer.observe($sentinel);
}
const renderTitle = ($container) => {
  const movieSectionTitle = Title({ text: "지금 인기 있는 영화" });
  $container.appendChild(movieSectionTitle);
};
const renderMovies = ($main2) => {
  const state2 = getState();
  $main2.innerHTML = "";
  if (state2.query) {
    const searchedMovieTitle = Title({
      text: `"${state2.query}" 검색 결과`
    });
    searchedMovieTitle.classList.add("search-result-title");
    $main2.appendChild(searchedMovieTitle);
  } else {
    renderTitle($main2);
  }
  if (state2.list.length === 0 && !state2.isLoading) {
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
  if (state2.isLoading) {
    Skeleton.render($main2);
  }
  const $sentinel2 = createElement("div", { id: "scroll-sentinel" });
  $main2.appendChild($sentinel2);
  observer.observe($sentinel2);
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
