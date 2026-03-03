// Quick test to see if CSS file exists and can be loaded
const cssPath = 'src/styles/universal-theme.css';

fetch(cssPath)
  .then(response => {
    if (response.ok) {
      console.log('CSS file found:', cssPath);
      return response.text();
    } else {
      console.error('CSS file not found:', response.status);
    }
  })
  .then(text => {
    console.log('CSS loaded, first 100 chars:', text.substring(0, 100));
  })
  .catch(error => {
    console.error('Error loading CSS:', error);
  });
