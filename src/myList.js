// src/myList.js
const getProfileKey = () => {
  const profile = JSON.parse(localStorage.getItem("netflix_profile") || "{}");
  return `myList_${profile.ageGroup || 'default'}_${profile.name || 'user'}`;
};

export const getMyList = () => {
  const key = getProfileKey();
  return JSON.parse(localStorage.getItem(key) || "[]");
};

export const addToMyList = (movie) => {
  const key = getProfileKey();
  const list = getMyList();
  if (!list.some(m => m.id === movie.id)) {
    list.push(movie);
    localStorage.setItem(key, JSON.stringify(list));
    showListNotification(movie, 'added to'); // ADD THIS LINE
  }
};

export const removeFromMyList = (id) => {
  const key = getProfileKey();
  const list = getMyList();
  const movie = list.find(m => m.id === id);
  const newList = list.filter(m => m.id !== id);
  localStorage.setItem(key, JSON.stringify(newList));
  if (movie) {
    showListNotification(movie, 'removed from'); // ADD THIS LINE
  }
};

export const isInMyList = (id) => {
  return getMyList().some(m => m.id === id);
};
export const showListNotification = (movie, action) => {

  const event = new CustomEvent('showToast', {
    detail: { 
      message: `${movie.title} ${action} My List`, 
      type: 'success' 
    }
  });
  window.dispatchEvent(event);
};
// Add to myList.js
export const saveWatchProgress = (movieId, progress) => {
  const key = `progress_${movieId}`;
  localStorage.setItem(key, JSON.stringify({
    progress,
    timestamp: Date.now()
  }));
};

export const getWatchProgress = (movieId) => {
  const key = `progress_${movieId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data).progress : 0;
};

export const clearWatchProgress = (movieId) => {
  const key = `progress_${movieId}`;
  localStorage.removeItem(key);
};
// In myList.js, add:
export const markAsDownloaded = (movieId) => {
  const key = `downloaded_${movieId}`;
  localStorage.setItem(key, 'true');
};

export const isDownloaded = (movieId) => {
  const key = `downloaded_${movieId}`;
  return localStorage.getItem(key) === 'true';
};

export const removeDownload = (movieId) => {
  const key = `downloaded_${movieId}`;
  localStorage.removeItem(key);
};