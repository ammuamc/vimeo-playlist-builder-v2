/**
 * Responsive Layout Enhancement
 * Uses ResizeObserver to dynamically adjust layout based on viewport changes
 */

document.addEventListener('DOMContentLoaded', function() {
  // Elements we need to adjust
  const videoRow = document.querySelector('.video-row');
  const thumbnailsRow = document.querySelector('.thumbnails-row');
  const videoContentContainer = document.querySelector('.video-content-container');
  const headerContainer = document.querySelector('.header-container');
  const footerRow = document.querySelector('.footer-row');
  const videoCount = document.getElementById('videoCount');
  
  // Function to calculate optimal heights for masonry-like tight packing
  function adjustLayout() {
    // Get viewport dimensions
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Get header height
    const headerHeight = headerContainer.offsetHeight;
    
    // Footer height includes padding
    const footerHeight = footerRow.offsetHeight || 60;
    
    // Calculate thumbnail section height based on viewport size
    let thumbnailHeight;
    if (viewportWidth <= 320) {
      thumbnailHeight = 120; // Extra small screens
    } else if (viewportWidth <= 480) {
      thumbnailHeight = 140; // Mobile phones
    } else if (viewportWidth <= 768) {
      thumbnailHeight = 170; // Tablets
    } else {
      thumbnailHeight = 180; // Larger screens
    }
    
    // Calculate available content height
    const contentHeight = viewportHeight - headerHeight - footerHeight;
    
    // Calculate optimal player height (content height minus thumbnail height)
    const playerHeight = contentHeight - thumbnailHeight;
    
    // Apply calculated heights with no gaps
    videoContentContainer.style.height = `${contentHeight}px`;
    videoRow.style.height = `${playerHeight}px`;
    thumbnailsRow.style.height = `${thumbnailHeight}px`;
    
    // Force layout recalculation to ensure tight packing
    document.body.offsetHeight;
    
    // Ensure exactly 5 thumbnails are always visible by adjusting container width if needed
    const thumbnailsGallery = document.querySelector('.video-gallery');
    if (thumbnailsGallery) {
      const thumbnails = document.querySelectorAll('.thumbnail');
      
      if (thumbnails.length > 0) {
        // Get current gap size based on viewport
        let gapSize;
        if (viewportWidth <= 320) {
          gapSize = 6;
        } else if (viewportWidth <= 480) {
          gapSize = 8;
        } else {
          gapSize = 12;
        }
        
        // Force layout recalculation to ensure CSS calc() values are applied correctly
        thumbnailsGallery.style.display = 'none';
        thumbnailsGallery.offsetHeight; // Force reflow
        thumbnailsGallery.style.display = 'flex';
        
        // The CSS calc() handles the width calculation automatically
        // Just ensure proper flex behavior for exactly 5 thumbnails
        thumbnails.forEach((thumb, index) => {
          thumb.style.flex = '0 0 auto';
          // Remove any manual width overrides to let CSS calc() work
          thumb.style.removeProperty('width');
        });
      }
    }
  }
  
  // Initial adjustment
  adjustLayout();
  
  // Update video count in footer
  if (videoCount) {
    const updateVideoCount = () => {
      const totalVideos = document.querySelectorAll('.thumbnail').length;
      const activeIndex = document.querySelector('.thumbnail.active') ? 
        Array.from(document.querySelectorAll('.thumbnail')).findIndex(el => el.classList.contains('active')) + 1 : 0;
      
      if (totalVideos > 0) {
        videoCount.textContent = `${activeIndex} / ${totalVideos}`;
      } else {
        videoCount.textContent = '';
      }
    };
    
    // Set up a MutationObserver to watch for changes to the gallery
    const galleryObserver = new MutationObserver(updateVideoCount);
    const gallery = document.getElementById('gallery');
    
    if (gallery) {
      galleryObserver.observe(gallery, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }
    
    // Initial count
    updateVideoCount();
  }
  
  // Set up ResizeObserver to adjust layout on viewport changes
  const resizeObserver = new ResizeObserver(entries => {
    // Debounce the resize events to avoid excessive calculations
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(adjustLayout, 100);
  });
  
  // Observe the video content container for size changes
  if (videoContentContainer) {
    resizeObserver.observe(videoContentContainer);
  }
  
  // Also observe the window for size changes
  resizeObserver.observe(document.body);
  
  // Also listen for orientation changes on mobile
  window.addEventListener('orientationchange', adjustLayout);
});
