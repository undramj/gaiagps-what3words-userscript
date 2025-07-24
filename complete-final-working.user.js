// ==UserScript==
// @name         🎯 COMPLETE WORKING what3words for GaiaGPS
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Complete working version with all functionality
// @author       Complete Solution
// @match        *://www.gaiagps.com/*
// @match        *://gaiagps.com/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/undramj/gaiagps-what3words-userscript/main/complete-final-working.user.js
// @updateURL    https://raw.githubusercontent.com/undramj/gaiagps-what3words-userscript/main/complete-final-working.user.js
// ==/UserScript==

(function() {
    'use strict';

    console.log('🎯 COMPLETE WORKING VERSION STARTING...');

    let W3W_API_KEY = localStorage.getItem('w3w_api_key');
    const W3W_API_BASE = 'https://api.what3words.com/v3';

    function showNotification(message, type = 'info') {
        console.log('🎯 NOTIFICATION:', message);

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#dc2626' : type === 'success' ? '#059669' : '#0ea5e9'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 999999;
            font-family: system-ui, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            border: 2px solid white;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }

    function showApiKeySetup() {
        console.log('🎯 SHOWING API KEY SETUP');

        const existing = document.getElementById('w3w-api-setup');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'w3w-api-setup';
        overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: system-ui, sans-serif;
            ">
                <div style="
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                    max-width: 500px;
                    width: 90%;
                    overflow: hidden;
                    border: 3px solid #e11d48;
                ">
                    <div style="
                        background: #e11d48;
                        color: white;
                        padding: 20px;
                        text-align: center;
                    ">
                        <h2 style="margin: 0; font-size: 24px; font-weight: 600;">🎯 ///what3words</h2>
                        <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Complete Working Version</p>
                    </div>
                    <div style="padding: 24px;">
                        <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                            <p style="margin: 0; color: #0c4a6e; font-weight: 500; font-size: 14px;">
                                🎯 Map clicking and autosuggest ready!
                            </p>
                        </div>
                        <div style="margin-bottom: 16px;">
                            <p style="margin: 0 0 16px 0; color: #374151; line-height: 1.5;">
                                To use what3words integration, you need an API key from what3words.
                            </p>
                            <ol style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.4;">
                                <li>Visit <a href="https://what3words.com/select-plan" target="_blank" style="color: #e11d48;">what3words.com/select-plan</a></li>
                                <li>Create a free account</li>
                                <li>Copy your API key</li>
                                <li>Paste it below</li>
                            </ol>
                        </div>
                        <div style="margin-bottom: 16px;">
                            <input type="text" id="w3w-api-input" placeholder="Paste your what3words API key here..." style="
                                width: 100%;
                                padding: 12px;
                                border: 2px solid #d1d5db;
                                border-radius: 6px;
                                font-size: 14px;
                                font-family: monospace;
                                box-sizing: border-box;
                            ">
                            <div id="w3w-api-error" style="
                                color: #dc2626;
                                font-size: 12px;
                                margin-top: 8px;
                                display: none;
                            "></div>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button id="w3w-validate-btn" style="
                                flex: 1;
                                background: #e11d48;
                                color: white;
                                border: none;
                                padding: 12px 20px;
                                border-radius: 6px;
                                font-size: 14px;
                                font-weight: 500;
                                cursor: pointer;
                            ">Save & Continue</button>
                            <button id="w3w-cancel-btn" style="
                                background: #6b7280;
                                color: white;
                                border: none;
                                padding: 12px 20px;
                                border-radius: 6px;
                                font-size: 14px;
                                font-weight: 500;
                                cursor: pointer;
                            ">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const input = document.getElementById('w3w-api-input');
        const button = document.getElementById('w3w-validate-btn');
        const cancelButton = document.getElementById('w3w-cancel-btn');
        const errorDiv = document.getElementById('w3w-api-error');

        button.addEventListener('click', validateAndSaveApiKey);
        cancelButton.addEventListener('click', cancelSetup);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') validateAndSaveApiKey();
        });

        input.focus();

        function cancelSetup() {
            console.log('🎯 CANCEL SETUP - CLOSING POPUP');
            const overlay = document.getElementById('w3w-api-setup');
            if (overlay) overlay.remove();
            showNotification('Setup cancelled', 'info');
        }

        async function validateAndSaveApiKey() {
            const apiKey = input.value.trim();
            if (!apiKey) {
                showError('Please enter an API key');
                return;
            }

            button.disabled = true;
            button.textContent = 'Validating...';
            errorDiv.style.display = 'none';

            try {
                const response = await fetch(`${W3W_API_BASE}/convert-to-coordinates?words=index.home.raft&key=${apiKey}`);
                const data = await response.json();

                if (response.ok && data.coordinates) {
                    localStorage.setItem('w3w_api_key', apiKey);
                    W3W_API_KEY = apiKey;
                    closeApiKeySetup();
                    showNotification('API key saved successfully!', 'success');
                } else {
                    showError(data.error?.message || 'Invalid API key. Please check and try again.');
                }
            } catch (error) {
                showError('Could not validate API key. Check connection.');
            } finally {
                button.disabled = false;
                button.textContent = 'Save & Continue';
            }

            function showError(message) {
                errorDiv.innerHTML = message;
                errorDiv.style.display = 'block';
                input.style.borderColor = '#dc2626';
            }
        }
    }

    function closeApiKeySetup() {
        const overlay = document.getElementById('w3w-api-setup');
        if (overlay) overlay.remove();
        initializeApp();
    }

    function createWhat3WordsPanel() {
        console.log('🎯 CREATING COMPLETE PANEL');

        const existing = document.getElementById('w3w-panel');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.id = 'w3w-panel';
        panel.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                width: 320px;
                background: white;
                border: 2px solid #e11d48;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                z-index: 99999;
                font-family: system-ui, sans-serif;
            ">
                <div style="
                    background: #e11d48;
                    color: white;
                    padding: 12px 16px;
                    font-weight: 600;
                    font-size: 14px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <span>///what3words</span>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button id="change-api-btn" style="
                            background: rgba(255,255,255,0.2);
                            border: none;
                            color: white;
                            cursor: pointer;
                            font-size: 11px;
                            padding: 4px 8px;
                            border-radius: 3px;
                            font-weight: 500;
                        ">🔑 API</button>
                    </div>
                </div>
                <div id="w3w-content" style="padding: 16px;">
                    <div id="w3w-status" style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 4px; padding: 8px; margin-bottom: 12px; font-size: 12px; color: #0c4a6e;">
                        Map clicking and autosuggest working
                    </div>
                    <div style="margin-bottom: 12px; position: relative;">
                        <input type="text" id="w3w-search" placeholder="Search what3words address..." style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid #d1d5db;
                            border-radius: 4px;
                            font-size: 14px;
                            box-sizing: border-box;
                        ">
                        <div id="w3w-suggestions" style="
                            position: absolute;
                            background: white;
                            border: 1px solid #d1d5db;
                            border-top: none;
                            border-radius: 0 0 4px 4px;
                            max-height: 200px;
                            overflow-y: auto;
                            display: none;
                            z-index: 100000;
                            left: 0;
                            right: 0;
                            top: 100%;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                            width: 100%;
                            box-sizing: border-box;
                        "></div>
                    </div>
                    <div style="font-size: 11px; color: #6b7280; text-align: center; margin-bottom: 12px;">
                        Click anywhere on the map to get what3words address
                    </div>
                    <div id="w3w-result" style="
                        background: #f3f4f6;
                        padding: 12px;
                        border-radius: 4px;
                        font-size: 13px;
                        display: none;
                        text-align: center;
                    "></div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        const apiBtn = document.getElementById('change-api-btn');
        const searchInput = document.getElementById('w3w-search');

        apiBtn.addEventListener('click', () => {
            localStorage.removeItem('w3w_api_key');
            W3W_API_KEY = null;
            showApiKeySetup();
        });

        // Update status based on mode
        const statusDiv = document.getElementById('w3w-status');
        if (localStorage.getItem('w3w_test_mode') === 'true') {
            statusDiv.style.background = '#fef3c7';
            statusDiv.style.borderColor = '#f59e0b';
            statusDiv.style.color = '#92400e';
            statusDiv.textContent = '🧪 Test UI mode - mock data only';
        } else if (W3W_API_KEY) {
            statusDiv.textContent = 'Map clicking and autosuggest working';
        } else {
            statusDiv.style.background = '#fee2e2';
            statusDiv.style.borderColor = '#dc2626';
            statusDiv.style.color = '#991b1b';
            statusDiv.textContent = 'API key required for full functionality';
        }

        // Setup autosuggest
        setupAutosuggest();
        setupMapClickListener();
        console.log('🎯 COMPLETE PANEL CREATED WITH AUTOSUGGEST');
    }

    function setupAutosuggest() {
        console.log('🎯 SETTING UP AUTOSUGGEST');

        const searchInput = document.getElementById('w3w-search');
        const suggestionsDiv = document.getElementById('w3w-suggestions');

        if (!searchInput || !suggestionsDiv) {
            console.log('🎯 AUTOSUGGEST: Elements not found');
            return;
        }

        let debounceTimer;

        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.trim();

            clearTimeout(debounceTimer);

            if (query.length < 2) {
                suggestionsDiv.style.display = 'none';
                return;
            }

            debounceTimer = setTimeout(async () => {
                try {
                    console.log('🎯 FETCHING SUGGESTIONS FOR:', query);
                    const suggestions = await fetchSuggestions(query);
                    displaySuggestions(suggestions);
                } catch (error) {
                    console.log('🎯 AUTOSUGGEST ERROR:', error);
                }
            }, 300);
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
                suggestionsDiv.style.display = 'none';
            }
        });
    }

    async function fetchSuggestions(input) {
        if (!W3W_API_KEY) {
            console.log('🎯 NO API KEY FOR SUGGESTIONS');
            if (localStorage.getItem('w3w_test_mode') === 'true') {
                // Return mock suggestions for test mode
                return [
                    { words: 'index.home.raft', nearestPlace: 'Test Location 1' },
                    { words: 'filled.count.soap', nearestPlace: 'Test Location 2' },
                    { words: 'daring.lion.race', nearestPlace: 'Test Location 3' }
                ];
            }
            return [];
        }

        try {
            const response = await fetch(`${W3W_API_BASE}/autosuggest?input=${encodeURIComponent(input)}&key=${W3W_API_KEY}`);
            const data = await response.json();

            console.log('🎯 SUGGESTIONS RESPONSE:', data);

            if (response.ok && data.suggestions) {
                return data.suggestions;
            } else {
                console.log('🎯 SUGGESTIONS ERROR:', data.error?.message);
                return [];
            }
        } catch (error) {
            console.log('🎯 FETCH SUGGESTIONS ERROR:', error);
            return [];
        }
    }

    function displaySuggestions(suggestions) {
        const suggestionsDiv = document.getElementById('w3w-suggestions');

        if (!suggestions.length) {
            suggestionsDiv.style.display = 'none';
            return;
        }

        console.log('🎯 DISPLAYING SUGGESTIONS:', suggestions.length);

        suggestionsDiv.innerHTML = suggestions.map(suggestion => `
            <div class="w3w-suggestion" data-words="${suggestion.words}" style="
                padding: 8px 12px;
                cursor: pointer;
                border-bottom: 1px solid #f3f4f6;
                font-size: 13px;
                color: #374151;
            " onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='white'">
                <div style="font-weight: 500; color: #e11d48;">////${suggestion.words}</div>
                <div style="font-size: 11px; color: #6b7280;">${suggestion.nearestPlace || 'Unknown location'}</div>
            </div>
        `).join('');

        suggestionsDiv.style.display = 'block';

        // Add click handlers to suggestions
        suggestionsDiv.querySelectorAll('.w3w-suggestion').forEach(item => {
            item.addEventListener('click', async function() {
                const words = this.dataset.words;
                console.log('🎯 SUGGESTION CLICKED:', words);

                document.getElementById('w3w-search').value = `///${words}`;
                suggestionsDiv.style.display = 'none';

                // Convert to coordinates and navigate
                try {
                    const response = await fetch(`${W3W_API_BASE}/convert-to-coordinates?words=${words}&key=${W3W_API_KEY}`);
                    const data = await response.json();

                    if (response.ok && data.coordinates) {
                        const { lat, lng } = data.coordinates;
                        console.log('🎯 NAVIGATING TO:', lat, lng);
                        enhancedNavigation(lat, lng, words);
                        showEnhancedMarker(lat, lng);
                    }
                } catch (error) {
                    console.log('🎯 NAVIGATION ERROR:', error);
                }
            });
        });
    }

    function setupMapClickListener() {
        console.log('🎯 SETTING UP COMPLETE MAP CLICK LISTENER');

        let isProcessing = false;
        let lastProcessedUrl = '';

        // Single coordinate extraction with debouncing
        const processCoordinates = async () => {
            const currentUrl = window.location.href;

            console.log('🎯 PROCESS COORDINATES CALLED');
            console.log('🎯 CURRENT URL:', currentUrl);
            console.log('🎯 LAST PROCESSED URL:', lastProcessedUrl);
            console.log('🎯 IS PROCESSING:', isProcessing);

            // Prevent duplicate processing of same URL (but allow if coordinates in URL changed)
            const hasCoordinates = currentUrl.includes('lng=') && currentUrl.includes('lat=');
            const urlChanged = currentUrl !== lastProcessedUrl;

            if (isProcessing && !urlChanged) {
                console.log('🎯 SKIPPING - CURRENTLY PROCESSING SAME URL');
                return;
            }

            if (!hasCoordinates) {
                console.log('🎯 SKIPPING - NO COORDINATES IN URL');
                return;
            }

            console.log('🎯 PROCEEDING WITH COORDINATE EXTRACTION');
            isProcessing = true;
            lastProcessedUrl = currentUrl;

            // Show processing indicator
            showNotification('Processing map click...', 'info');

            try {
                await extractAndConvertCoordinates();
            } catch (error) {
                console.log('🎯 COORDINATE PROCESSING ERROR:', error);
            } finally {
                // Reset processing flag after a longer delay to prevent rapid repeated clicks
                setTimeout(() => {
                    isProcessing = false;
                    console.log('🎯 PROCESSING FLAG RESET');
                }, 5000);
            }
        };

        // Multiple strategies for map detection - but only attach ONE listener
        const strategies = [
            () => document.querySelector('.mapboxgl-canvas'),
            () => document.querySelector('.mapboxgl-map'),
            () => document.querySelector('#map'),
            () => document.querySelector('[class*="map"]'),
            () => document.querySelector('canvas')
        ];

        // Find the first available element and attach only ONE listener
        for (let i = 0; i < strategies.length; i++) {
            const element = strategies[i]();
            if (element) {
                console.log(`🎯 MAP LISTENER: Strategy ${i + 1} - Attaching to:`, element.className || element.tagName);

                element.addEventListener('click', async function(e) {
                    console.log(`🎯 MAP CLICKED: Strategy ${i + 1}`, e.target);
                    console.log('🎯 CLICK COORDINATES:', e.clientX, e.clientY);

                    // Clear existing results immediately on any click
                    const resultDiv = document.getElementById('w3w-result');
                    if (resultDiv) {
                        resultDiv.style.display = 'none';
                        resultDiv.innerHTML = '';
                    }
                    
                    // Remove existing markers immediately
                    const existingMarkers = document.querySelectorAll('[id^="w3w-marker"]');
                    existingMarkers.forEach(marker => marker.remove());

                    // Try multiple extraction approaches in sequence
                    setTimeout(async () => {
                        console.log('🎯 ATTEMPTING DIRECT COORDINATE CAPTURE');
                        
                        // Approach 1: Try to get coordinates from GaiaGPS UI elements
                        let coordinates = tryExtractFromUI();
                        
                        if (!coordinates) {
                            console.log('🎯 UI EXTRACTION FAILED, TRYING URL PARSING');
                            // Approach 2: Enhanced URL parsing with longer wait
                            setTimeout(async () => {
                                await forceUrlBasedExtraction();
                            }, 1000);
                        } else {
                            console.log('🎯 UI COORDINATES FOUND:', coordinates);
                            await convertAndDisplay(coordinates.lat, coordinates.lng);
                        }
                    }, 300);
                }, true);

                // Break after attaching to first available element
                break;
            }
        }

        // DISABLED automatic monitoring to prevent infinite loops
        // Only process coordinates on manual map clicks
        console.log('🎯 MAP CLICK LISTENER SETUP COMPLETE - Manual clicks only');
    }

    // Helper function to extract coordinates directly from GaiaGPS UI
    function tryExtractFromUI() {
        console.log('🎯 TRYING UI COORDINATE EXTRACTION');
        
        // First try to find the coordinates display in the left panel
        try {
            // Look for the specific coordinate display in GaiaGPS
            const coordElements = document.querySelectorAll('*');
            for (const element of coordElements) {
                const text = element.textContent || element.innerText || '';
                
                // Look for the exact pattern shown in the screenshot: "35.62913, -80.45310"
                const coordPattern = /(\d+\.\d+),\s*(-\d+\.\d+)/;
                const match = text.match(coordPattern);
                
                if (match && text.length < 50) { // Ensure we're not matching a long URL
                    const lat = parseFloat(match[1]);
                    const lng = parseFloat(match[2]);
                    
                    // Validate coordinates
                    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                        console.log('🎯 UI EXTRACTION SUCCESS:', { lat, lng, source: text.trim() });
                        return { lat, lng };
                    }
                }
            }
        } catch (error) {
            console.log('🎯 UI EXTRACTION ERROR:', error);
        }
        
        console.log('🎯 UI EXTRACTION FAILED - NO COORDINATES FOUND');
        return null;
    }

    // Helper function for enhanced URL-based extraction
    async function forceUrlBasedExtraction() {
        console.log('🎯 FORCING URL-BASED EXTRACTION');
        if (typeof isProcessing !== 'undefined') {
            isProcessing = false;
        }
        if (typeof lastProcessedUrl !== 'undefined') {
            lastProcessedUrl = '';
        }
        await extractAndConvertCoordinates();
    }

    // Helper function to convert coordinates and display results
    async function convertAndDisplay(lat, lng) {
        console.log('🎯 CONVERTING AND DISPLAYING:', lat, lng);
        
        // Show loading state
        const resultDiv = document.getElementById('w3w-result');
        if (resultDiv) {
            resultDiv.innerHTML = '<div style="text-align: center; color: #6b7280; font-size: 12px;">Converting coordinates...</div>';
            resultDiv.style.display = 'block';
        }
        
        const words = await convertCoordsToWords(lat, lng);
        if (words) {
            displayWhat3WordsResult(lat, lng, words);
            // No marker for map clicks - coordinates shown in panel
        } else {
            console.log('🎯 CONVERSION FAILED');
            if (resultDiv) {
                resultDiv.innerHTML = '<div style="text-align: center; color: #dc2626; font-size: 12px;">Conversion failed</div>';
            }
        }
    }

    async function extractAndConvertCoordinates() {
        try {
            const url = window.location.href;
            console.log('🎯 EXTRACTING COORDS FROM:', url);
            console.log('🎯 URL LENGTH:', url.length);
            console.log('🎯 URL CONTAINS COORDS:', url.includes('lng='), url.includes('lat='));

            // Enhanced coordinate extraction patterns - focus on GaiaGPS URL updates
            const patterns = [
                // GaiaGPS specific patterns (check first - most specific)
                /lng=([^&]+)&lat=([^&]+)&z=\d+&lng=([^&]+)&lat=([^&]+)/, // Dual coordinate pairs - use LAST pair
                /lng=([^&]+)&lat=([^&]+)/, // Single coordinate pair
                // Standard coordinate patterns
                /[?&]lng=([^&]+)[&]?.*[?&]lat=([^&]+)/,
                /[?&]lat=([^&]+)[&]?.*[?&]lng=([^&]+)/,
                /[?&]longitude=([^&]+)[&]?.*[?&]latitude=([^&]+)/,
                /[?&]latitude=([^&]+)[&]?.*[?&]longitude=([^&]+)/,
                /\/(-?\d+\.?\d*),(-?\d+\.?\d*)/,
                /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
                /center=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
                /coords=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
                // Other GaiaGPS patterns
                /\/waypoints\/(-?\d+\.?\d*)\/(-?\d+\.?\d*)/,
                /\/location\/(-?\d+\.?\d*)\/(-?\d+\.?\d*)/,
                /map\/[^/]*\/(-?\d+\.?\d*)\/(-?\d+\.?\d*)/
            ];

            let lat, lng;

            console.log('🎯 TESTING', patterns.length, 'COORDINATE PATTERNS');

            for (let i = 0; i < patterns.length; i++) {
                const pattern = patterns[i];
                console.log(`🎯 TESTING PATTERN ${i + 1}:`, pattern.source);
                const match = url.match(pattern);
                if (match) {
                    console.log('🎯 PATTERN MATCHED:', pattern.source, match);

                    // Handle dual coordinate pattern (4 values: lng1, lat1, lng2, lat2)
                    if (match.length === 5 && pattern.source.includes('lng=([^&]+)&lat=([^&]+)&z=\\d+&lng=([^&]+)&lat=([^&]+)')) {
                        // Use the SECOND pair of coordinates (more recent/current position)
                        lng = parseFloat(match[3]);
                        lat = parseFloat(match[4]);
                        console.log('🎯 USING SECOND COORDINATE PAIR:', { lng1: match[1], lat1: match[2], lng2: match[3], lat2: match[4] });
                    }
                    // Handle single coordinate patterns
                    else if (pattern.source.includes('lng=') && pattern.source.includes('lat=')) {
                        // Handle lng=...lat= or lat=...lng= patterns
                        if (pattern.source.indexOf('lng') < pattern.source.indexOf('lat')) {
                            lng = parseFloat(match[1]);
                            lat = parseFloat(match[2]);
                        } else {
                            lat = parseFloat(match[1]);
                            lng = parseFloat(match[2]);
                        }
                    } else if (pattern.source.includes('longitude=') && pattern.source.includes('latitude=')) {
                        // Handle longitude=...latitude= or latitude=...longitude= patterns
                        if (pattern.source.indexOf('longitude') < pattern.source.indexOf('latitude')) {
                            lng = parseFloat(match[1]);
                            lat = parseFloat(match[2]);
                        } else {
                            lat = parseFloat(match[1]);
                            lng = parseFloat(match[2]);
                        }
                    } else {
                        // For coordinate pair patterns like lat,lng or lng,lat
                        // Based on GaiaGPS URL structure, first value is typically longitude, second is latitude
                        lng = parseFloat(match[1]);
                        lat = parseFloat(match[2]);
                    }

                    console.log('🎯 PARSED COORDS (lng, lat):', lng, lat);
                    console.log('🎯 VALUES AFTER PARSING:', { 
                        rawValues: match, 
                        parsedLng: lng, 
                        parsedLat: lat,
                        isLngValid: !isNaN(lng),
                        isLatValid: !isNaN(lat)
                    });

                    // Only break if we got valid numbers
                    if (!isNaN(lng) && !isNaN(lat)) {
                        break;
                    }
                } else {
                    console.log(`🎯 PATTERN ${i + 1} NO MATCH`);
                }
            }

            // If no patterns matched, log this clearly
            if (lat === undefined && lng === undefined) {
                console.log('🎯 NO COORDINATE PATTERNS MATCHED THE URL');
                console.log('🎯 URL ANALYSIS:', {
                    hasLng: url.includes('lng='),
                    hasLat: url.includes('lat='),
                    hasQuestionMark: url.includes('?'),
                    hasAmpersand: url.includes('&'),
                    urlSample: url.substring(0, 100) + (url.length > 100 ? '...' : '')
                });
            }

            // Validate coordinates with detailed logging
            console.log('🎯 COORDINATE VALIDATION:', { 
                lat, lng, 
                latType: typeof lat,
                lngType: typeof lng,
                latIsNaN: isNaN(lat),
                lngIsNaN: isNaN(lng),
                latValid: !isNaN(lat) && lat >= -90 && lat <= 90, 
                lngValid: !isNaN(lng) && lng >= -180 && lng <= 180,
                latExists: lat !== undefined && lat !== null,
                lngExists: lng !== undefined && lng !== null
            });

            // Detailed validation check
            const validationChecks = {
                latNotNaN: !isNaN(lat),
                lngNotNaN: !isNaN(lng),
                latRange: lat >= -90 && lat <= 90,
                lngRange: lng >= -180 && lng <= 180,
                overallValid: !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
            };

            console.log('🎯 DETAILED VALIDATION CHECKS:', validationChecks);

            if (validationChecks.overallValid) {
                console.log('🎯 FINAL COORDINATES VALID:', { lat, lng });
                console.log('🎯 STARTING FRESH CONVERSION FOR:', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                
                // Clear any previous results first
                const resultDiv = document.getElementById('w3w-result');
                if (resultDiv) {
                    resultDiv.innerHTML = '<div style="text-align: center; color: #6b7280; font-size: 12px;">Converting coordinates...</div>';
                    resultDiv.style.display = 'block';
                }
                
                const words = await convertCoordsToWords(lat, lng);
                console.log('🎯 CONVERSION RESULT FOR', `${lat.toFixed(6)}, ${lng.toFixed(6)}`, ':', words);
                
                if (words) {
                    displayWhat3WordsResult(lat, lng, words);
                    // No marker for map clicks
                } else {
                    console.log('🎯 CONVERSION FAILED - no words returned');
                }
            } else {
                console.log('🎯 NO VALID COORDINATES FOUND - validation failed');
                console.log('🎯 FAILED VALIDATION DETAILS:', validationChecks);
            }
        } catch (error) {
            console.log('🎯 COORDINATE EXTRACTION ERROR:', error);
        }
    }

    async function convertCoordsToWords(lat, lng) {
        console.log('🎯 CONVERT COORDS TO WORDS CALLED:', lat, lng);

        if (!W3W_API_KEY) {
            console.log('🎯 NO API KEY FOR CONVERSION');
            if (localStorage.getItem('w3w_test_mode') === 'true') {
                // Generate truly unique location-specific mock words
                const coordHash = Math.floor((Math.abs(lat) * 1000000 + Math.abs(lng) * 1000000) % 100000);
                const timeStamp = Date.now().toString().slice(-3);
                const mockWord = `click.${coordHash}.${timeStamp}`;
                console.log('🎯 TEST MODE - UNIQUE MOCK FOR COORDS:', `${lat.toFixed(6)}, ${lng.toFixed(6)}`, '->', mockWord);
                return mockWord;
            }
            return null;
        }

        try {
            // Add timestamp to prevent caching
            const timestamp = Date.now();
            const url = `${W3W_API_BASE}/convert-to-3wa?coordinates=${lat},${lng}&key=${W3W_API_KEY}&_=${timestamp}`;
            console.log('🎯 CONVERTING COORDINATES TO WORDS:', lat, lng);
            console.log('🎯 API REQUEST URL (with cache buster):', url);

            const response = await fetch(url);
            console.log('🎯 API RESPONSE STATUS:', response.status, response.statusText);

            const data = await response.json();
            console.log('🎯 CONVERSION RESPONSE:', data);

            if (response.ok && data.words) {
                console.log('🎯 CONVERTED TO WORDS:', data.words);
                return data.words;
            } else {
                console.log('🎯 CONVERSION ERROR:', data.error?.message || 'Unknown error');
                console.log('🎯 FULL ERROR RESPONSE:', data);
                return null;
            }
        } catch (error) {
            console.log('🎯 FETCH CONVERSION ERROR:', error);
            console.log('🎯 ERROR DETAILS:', error.message);
            return null;
        }
    }

    function displayWhat3WordsResult(lat, lng, words) {
        console.log('🎯 DISPLAYING RESULT:', words);

        const resultDiv = document.getElementById('w3w-result');
        if (!resultDiv) return;

        resultDiv.innerHTML = `
            <div style="margin-bottom: 8px;">
                <div style="font-weight: 600; color: #e11d48; font-size: 16px;">
                    ///${words}
                </div>
                <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
                    ${lat.toFixed(6)}, ${lng.toFixed(6)}
                </div>
            </div>
            <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 8px;">
                <button onclick="window.enhancedNavigation(${lat}, ${lng}, '${words}')" style="
                    background: #059669;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                    font-weight: 600;
                ">🧭 Navigate Here</button>
            </div>
            <div style="display: flex; gap: 8px; justify-content: center;">
                <button onclick="navigator.clipboard.writeText('${lat.toFixed(6)}, ${lng.toFixed(6)}')" style="
                    background: #6b7280;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-size: 11px;
                    cursor: pointer;
                    font-weight: 500;
                ">Copy Coordinates</button>
                <button onclick="clearWhat3WordsResult()" style="
                    background: #dc2626;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-size: 11px;
                    cursor: pointer;
                    font-weight: 500;
                ">Clear</button>
            </div>
        `;

        resultDiv.style.display = 'block';
        const timestamp = new Date().toLocaleTimeString();
        showNotification(`Found: ///${words} (${timestamp})`, 'success');
    }

    // Make function globally accessible for clearing results
    window.clearWhat3WordsResult = function() {
        console.log('🎯 CLEARING WHAT3WORDS RESULT');
        
        // Clear result display
        const resultDiv = document.getElementById('w3w-result');
        if (resultDiv) {
            resultDiv.style.display = 'none';
            resultDiv.innerHTML = '';
        }
        
        // Remove any markers
        const existingMarkers = document.querySelectorAll('[id^="w3w-marker"]');
        existingMarkers.forEach(marker => {
            console.log('🎯 REMOVING MARKER:', marker.id);
            marker.remove();
        });
        
        // Clear any existing notifications
        const notifications = document.querySelectorAll('[id^="w3w-notification"]');
        notifications.forEach(notification => notification.remove());
        
        // Reset processing state to allow fresh clicks
        isProcessing = false;
        lastProcessedUrl = '';
        
        console.log('🎯 CLEAR COMPLETE - READY FOR NEW CLICKS');
        showNotification('Results cleared', 'info');
    };

    // Make function globally accessible
    window.enhancedNavigation = function(lat, lng, words) {
        console.log('🎯 ENHANCED NAVIGATION TO:', lat, lng, words);

        // Debug: Log available map objects
        console.log('🎯 DEBUG: Available map objects:', {
            windowMap: !!window.map,
            mapboxgl: !!window.mapboxgl,
            mapElements: document.querySelectorAll('.mapboxgl-map').length,
            leaflet: !!window.L,
            gaia: !!window.gaia
        });

        try {
            // GaiaGPS-specific navigation strategies
            const currentUrl = window.location.href;
            console.log('🎯 CURRENT URL:', currentUrl);

            // Strategy 1: Update existing coordinates in URL
            let newUrl = currentUrl;

            // Replace existing lng/lat parameters
            if (newUrl.includes('lng=') && newUrl.includes('lat=')) {
                newUrl = newUrl.replace(/lng=[^&]+/, `lng=${lng}`);
                newUrl = newUrl.replace(/lat=[^&]+/, `lat=${lat}`);
                console.log('🎯 NAVIGATION: Updated existing coordinates -', newUrl);
            } 
            // Add coordinates to existing URL
            else {
                const separator = newUrl.includes('?') ? '&' : '?';
                newUrl = `${newUrl}${separator}lng=${lng}&lat=${lat}`;
                console.log('🎯 NAVIGATION: Added coordinates to URL -', newUrl);
            }

            // Try direct navigation without URL update first
            let navigationSuccess = false;

            // Strategy 1: Try to find and use map API directly
            if (window.map && typeof window.map.setCenter === 'function') {
                console.log('🎯 NAVIGATION: Using window.map.setCenter');
                window.map.setCenter([lng, lat]);
                if (typeof window.map.setZoom === 'function') {
                    window.map.setZoom(14);
                }
                navigationSuccess = true;
            }

            // Strategy 2: Look for mapbox instances
            if (!navigationSuccess && window.mapboxgl) {
                const mapElements = document.querySelectorAll('.mapboxgl-map');
                mapElements.forEach(mapEl => {
                    if (mapEl._map && typeof mapEl._map.setCenter === 'function') {
                        console.log('🎯 NAVIGATION: Using mapbox instance');
                        mapEl._map.setCenter([lng, lat]);
                        mapEl._map.setZoom(14);
                        navigationSuccess = true;
                    }
                });
            }

            // Strategy 3: Look for other map objects
            if (!navigationSuccess) {
                // Try common map object patterns
                const mapObjects = [window.mapInstance, window.gaia, window.leaflet];
                mapObjects.forEach(mapObj => {
                    if (mapObj && typeof mapObj.setView === 'function') {
                        console.log('🎯 NAVIGATION: Using setView method');
                        mapObj.setView([lat, lng], 14);
                        navigationSuccess = true;
                    } else if (mapObj && typeof mapObj.panTo === 'function') {
                        console.log('🎯 NAVIGATION: Using panTo method');
                        mapObj.panTo([lat, lng]);
                        navigationSuccess = true;
                    }
                });
            }

            // Strategy 4: Only use URL navigation if direct methods failed
            if (!navigationSuccess) {
                console.log('🎯 NAVIGATION: Using URL strategy as fallback');

                // Update URL without immediate reload
                window.history.replaceState({ lat, lng, words }, '', newUrl);

                // Try triggering popstate event
                setTimeout(() => {
                    window.dispatchEvent(new PopStateEvent('popstate', { state: { lat, lng, words } }));
                }, 100);

                // Very gentle reload as last resort - only if user isn't interacting
                setTimeout(() => {
                    if (!document.hasFocus() || !navigationSuccess) {
                        console.log('🎯 NAVIGATION: Gentle reload fallback');
                        window.location.replace(newUrl);
                    }
                }, 3000);
            } else {
                // Update URL to reflect the change without reload
                window.history.replaceState({ lat, lng, words }, '', newUrl);
            }

            showNotification(`Navigating to ///${words}`, 'success');

        } catch (error) {
            console.log('🎯 NAVIGATION ERROR:', error);
            showNotification('Navigation failed - coordinates copied to clipboard', 'error');
            navigator.clipboard.writeText(`${lat}, ${lng}`);
        }
    };

    function showEnhancedMarker(lat, lng) {
        console.log('🎯 SHOWING ENHANCED MARKER:', lat, lng);

        // Remove existing markers
        document.querySelectorAll('.w3w-enhanced-marker').forEach(marker => marker.remove());

        // For GaiaGPS, show a simple center-screen confirmation marker 
        // since we can't determine exact pixel coordinates from lat/lng without map API access
        const marker = document.createElement('div');
        marker.className = 'w3w-enhanced-marker';
        marker.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 999999;
                pointer-events: auto;
                animation: w3wPulse 3s infinite;
                cursor: pointer;
            " onclick="this.parentElement.remove()">
                <div style="
                    width: 20px;
                    height: 20px;
                    background: #059669;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
                "></div>
                <div style="
                    position: absolute;
                    top: -35px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #059669;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    white-space: nowrap;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                ">Location Found</div>
            </div>
        `;

        // Add CSS animation if not exists
        if (!document.getElementById('w3w-marker-styles')) {
            const style = document.createElement('style');
            style.id = 'w3w-marker-styles';
            style.textContent = `
                @keyframes w3wPulse {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.7; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(marker);

        // Remove marker after 5 seconds or on click
        setTimeout(() => {
            if (marker.parentNode) {
                marker.remove();
            }
        }, 5000);

        console.log('🎯 ENHANCED MARKER PLACED - CLICK TO DISMISS');
    }

    function initializeApp() {
        console.log('🎯 INITIALIZING COMPLETE VERSION');
        createWhat3WordsPanel();
        console.log('🎯 COMPLETE INITIALIZATION COMPLETE');
        showNotification('what3words complete version ready!', 'success');
    }

    function init() {
        console.log('🎯 COMPLETE INIT CALLED');

        if (!document.body) {
            setTimeout(init, 100);
            return;
        }

        if (!W3W_API_KEY) {
            console.log('🎯 NO API KEY, SHOWING SETUP');
            setTimeout(showApiKeySetup, 1500);
        } else {
            console.log('🎯 API KEY FOUND, INITIALIZING');
            initializeApp();
        }
    }

    // Enhanced initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Multiple backup triggers
    setTimeout(() => {
        if (!document.getElementById('w3w-panel') && !document.getElementById('w3w-api-setup')) {
            console.log('🎯 BACKUP TRIGGER 1 - FORCING INIT');
            init();
        }
    }, 2000);

    setTimeout(() => {
        if (!document.getElementById('w3w-panel') && !document.getElementById('w3w-api-setup')) {
            console.log('🎯 BACKUP TRIGGER 2 - FINAL ATTEMPT');
            showNotification('what3words complete version loaded', 'info');
        }
    }, 5000);

    console.log('🎯 COMPLETE WORKING VERSION LOADED COMPLETELY');

})();
