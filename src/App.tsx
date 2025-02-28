import React, { useState, useEffect, useRef } from 'react';
import { Loader } from 'lucide-react';

function App() {
  const [currentAdNetwork, setCurrentAdNetwork] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const adScriptsRef = useRef<HTMLScriptElement[]>([]);

  // Clear ad container safely
  const clearAdContainer = () => {
    // Use the ref to safely access the container
    if (adContainerRef.current) {
      // Create a new div to replace the current content
      const newDiv = document.createElement('div');
      newDiv.id = 'adContent';
      newDiv.style.width = '100%';
      newDiv.style.height = '100%';
      
      // Clear the container by replacing its content with the new div
      while (adContainerRef.current.firstChild) {
        adContainerRef.current.removeChild(adContainerRef.current.firstChild);
      }
      adContainerRef.current.appendChild(newDiv);
    }

    // Safely remove previously injected ad scripts
    adScriptsRef.current.forEach(script => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    });
    adScriptsRef.current = [];
  };

  // MonEtag - Popup Ad
  const showAdNetwork1 = () => {
    if (currentAdNetwork === 'network1') return;
    
    setCurrentAdNetwork('network1');
    setLoading(true);
    clearAdContainer();

    try {
      // Create a script element for MonEtag
      const script = document.createElement('script');
      script.setAttribute('data-ad', 'monetag');
      script.type = 'text/javascript';
      
      // Use a safer approach to inject the script content
      script.textContent = `
        (function(d,z,s){
          s.src='https://'+d+'/401/'+z;
          try{
            (document.body||document.documentElement).appendChild(s);
          }catch(e){
            console.error('MonEtag script error:', e);
          }
        })('groleegni.net',9013611,document.createElement('script'));
      `;
      
      // Keep track of the script element
      adScriptsRef.current.push(script);
      
      // Append the script to the document body
      document.body.appendChild(script);
      
      // Set a timeout to hide the loader after 5 seconds
      setTimeout(() => setLoading(false), 5000);
    } catch (error) {
      console.error('Error setting up MonEtag:', error);
      setLoading(false);
    }
  };

  // AdsTerra - Banner Ad
  const showAdNetwork2 = () => {
    if (currentAdNetwork === 'network2') return;
    
    setCurrentAdNetwork('network2');
    setLoading(true);
    clearAdContainer();

    try {
      // Get the ad content div
      const adContent = adContainerRef.current?.querySelector('#adContent');
      if (adContent) {
        // Create banner target div
        const adDiv = document.createElement('div');
        adDiv.id = 'container-f7ff1fd652ef7b42474e417e75f6f193';
        adDiv.style.width = '100%';
        adDiv.style.height = '100%';
        adContent.appendChild(adDiv);
      }

      // Load AdsTerra script
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.setAttribute('data-ad', 'adsterra');
      script.src = 'https://pl25986483.effectiveratecpm.com/f7ff1fd652ef7b42474e417e75f6f193/invoke.js';
      
      // Keep track of the script element
      adScriptsRef.current.push(script);
      
      // Add event listeners for load and error events
      script.addEventListener('load', () => {
        console.log('AdsTerra script loaded successfully');
        setTimeout(() => setLoading(false), 1000);
      });
      
      script.addEventListener('error', (e) => {
        console.error('AdsTerra script failed to load:', e);
        setLoading(false);
      });
      
      document.body.appendChild(script);
      
      // Fallback timeout to hide loader if script doesn't trigger events
      setTimeout(() => setLoading(false), 5000);
    } catch (error) {
      console.error('Error setting up AdsTerra:', error);
      setLoading(false);
    }
  };

  // Initialize the ad container
  useEffect(() => {
    if (adContainerRef.current) {
      clearAdContainer();
    }
  }, []);

  // Clean up any ad scripts when component unmounts
  useEffect(() => {
    return () => {
      adScriptsRef.current.forEach(script => {
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, []);

  // Add global error handler for script errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.log('Caught global error:', event);
      // Don't let script errors affect the UI
      if (loading) {
        setLoading(false);
      }
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [loading]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Choose Ad Network</h2>
        
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <button 
            onClick={showAdNetwork1}
            className={`px-4 py-2 rounded-md transition-colors ${
              currentAdNetwork === 'network1' 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            Show Ad Network 1 (MonEtag - Popup)
          </button>
          
          <button 
            onClick={showAdNetwork2}
            className={`px-4 py-2 rounded-md transition-colors ${
              currentAdNetwork === 'network2' 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            Show Ad Network 2 (AdsTerra - Banner)
          </button>
        </div>
        
        <div 
          ref={adContainerRef}
          id="adContainer" 
          className="w-full h-[300px] border border-gray-300 rounded-md flex justify-center items-center relative"
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
              <Loader className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}
          
          {!loading && !currentAdNetwork && (
            <div className="text-gray-500">
              Select an ad network to display ads
            </div>
          )}
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Note: If ads don't appear, please check your browser's popup blocker and ad blocker settings.</p>
        </div>
      </div>
    </div>
  );
}

export default App;