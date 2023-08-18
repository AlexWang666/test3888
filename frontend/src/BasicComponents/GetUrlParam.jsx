const getUrlParam = (urlParam) => {
  return new URLSearchParams(window.location.search).get(urlParam);
};

export default getUrlParam;
