// Internet Archive API integration for free public domain movies
const ARCHIVE_API_BASE = 'https://archive.org/advancedsearch.php';

// Known full movie identifiers from Internet Archive (public domain)
const KNOWN_FULL_MOVIES = [
  'nosferatu',
  'metropolis',
  'His_Girl_Friday',
  'The_39_Steps',
  'Charade',
  'Detour',
  'The_Cabinet_of_Dr_Caligari',
  'The_Killer_Shook_Me',
  'D.O.A',
  'Scarlet_Street',
  'The_Stranger',
  'He_Walked_by_Night',
  'Angel_On_My_Shoulder'
];

// Search for movies from Internet Archive
export const searchArchiveMovies = async (query = '', limit = 20) => {
  const searchQuery = query 
    ? `(${query} AND mediatype:movies AND subject:"feature films" AND year:*) AND (format:"MPEG4" OR format:"mp4")`
    : `(mediatype:movies AND (subject:"feature films" OR subject:"Feature Films" OR subject:"full length") AND year:*) AND (format:"MPEG4" OR format:"mp4")`;
  
  const params = new URLSearchParams({
    q: searchQuery,
    fl: 'identifier,title,description,year,creator,format',
    sort: 'downloads desc',
    rows: limit * 2, // Get more results to filter
    output: 'json'
  });

  try {
    const response = await fetch(`${ARCHIVE_API_BASE}?${params}`);
    const data = await response.json();
    
    if (data.response && data.response.docs) {
      // Filter for movies that are likely full-length (have year and reasonable title)
      const filteredDocs = data.response.docs.filter(doc => {
        const title = (doc.title || '').toLowerCase();
        const hasYear = doc.year && doc.year.length > 0;
        // Exclude trailers, clips, short films
        const isNotTrailer = !title.includes('trailer') && !title.includes('clip') && !title.includes('short');
        return hasYear && isNotTrailer;
      });
      
      return filteredDocs.slice(0, limit).map(doc => ({
        id: doc.identifier,
        title: doc.title || 'Unknown Title',
        description: doc.description || '',
        year: doc.year || '',
        creator: doc.creator || [],
        identifier: doc.identifier,
        isArchive: true,
        poster_path: null, // Will be fetched separately
        backdrop_path: null
      }));
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch archive movies:', error);
    return [];
  }
};

// Get movie details and video URL from Internet Archive
export const getArchiveMovieDetails = async (identifier) => {
  try {
    const metadataUrl = `https://archive.org/metadata/${identifier}`;
    const response = await fetch(metadataUrl);
    const data = await response.json();
    
    // Find the best video file (MP4)
    const videoFile = data.files?.find(file => 
      file.format === 'MPEG4' || 
      file.format === 'mp4' || 
      file.name.endsWith('.mp4')
    );
    
    // Find poster image
    const posterFile = data.files?.find(file => 
      file.format === 'JPEG' || 
      file.format === 'PNG' || 
      file.name.match(/\.(jpg|jpeg|png)$/i)
    ) || data.files?.find(file => file.name.includes('poster'));
    
    return {
      id: identifier,
      title: data.metadata?.title || 'Unknown Title',
      description: data.metadata?.description || '',
      year: data.metadata?.year || '',
      creator: data.metadata?.creator || [],
      videoUrl: videoFile ? `https://archive.org/download/${identifier}/${videoFile.name}` : null,
      posterUrl: posterFile ? `https://archive.org/download/${identifier}/${posterFile.name}` : null,
      isArchive: true
    };
  } catch (error) {
    console.error('Failed to fetch archive movie details:', error);
    return null;
  }
};

// Get popular/featured movies from Internet Archive
export const getFeaturedArchiveMovies = async (limit = 20) => {
  // First try to get known full movies
  try {
    const moviePromises = KNOWN_FULL_MOVIES.slice(0, limit).map(identifier => 
      getArchiveMovieDetails(identifier)
    );
    
    const results = await Promise.allSettled(moviePromises);
    const movies = results
      .filter(r => r.status === 'fulfilled' && r.value && r.value.videoUrl)
      .map(r => ({
        id: r.value.id,
        title: r.value.title,
        description: r.value.description,
        year: r.value.year,
        creator: r.value.creator,
        identifier: r.value.identifier,
        isArchive: true,
        poster_path: r.value.posterUrl,
        backdrop_path: r.value.posterUrl
      }));
    
    if (movies.length > 0) {
      return movies;
    }
  } catch (error) {
    console.error('Failed to fetch known movies:', error);
  }
  
  // Fallback to search
  return searchArchiveMovies('', limit);
};

// Search movies by query
export const searchArchiveByQuery = async (query, limit = 20) => {
  return searchArchiveMovies(query, limit);
};
