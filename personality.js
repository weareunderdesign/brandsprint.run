const Personality = {
    axes: [
        { left: 'elite', right: 'mass appeal', leftBrand: 'chanel', rightBrand: 'h&m' },
        { left: 'serious', right: 'playful', leftBrand: 'palantir', rightBrand: 'google' },
        { left: 'conventional', right: 'rebel', leftBrand: 'honda', rightBrand: 'tesla' },
        { left: 'friend', right: 'authority', leftBrand: 'disney', rightBrand: 'ny times' },
        { left: 'mature & classic', right: 'young & innovative', leftBrand: 'booking.com', rightBrand: 'airbnb' }
    ],

    intensityLevels: ['hyper', 'very', 'quite', 'somewhat', 'slightly', '', 'slightly', 'somewhat', 'quite', 'very', 'hyper'],

    traitSuggestions: {
        elite: { tone: '✨ sophisticated, exclusive', look: '🎯 minimalist, luxurious' },
        'mass appeal': { tone: '🤗 relatable, accessible', look: '🌈 bright, simple' },
        serious: { tone: '🎯 professional, formal', look: '🔘 muted colors, clean lines' },
        playful: { tone: '🎭 fun, casual', look: '🎨 vibrant colors, dynamic elements' },
        conventional: { tone: '🏛️ traditional, reliable', look: '📋 traditional layout, familiar icons' },
        rebel: { tone: '⚡ innovative, bold', look: '🎯 unconventional layout, bold typography' },
        friend: { tone: '😊 friendly, approachable', look: '🟡 rounded shapes, warm colors' },
        authority: { tone: '👔 authoritative, expert', look: '📊 structured layout, professional imagery' },
        mature: { tone: '🏺 timeless, refined', look: '📜 serif fonts, classic color palette' },
        classic: { tone: '🏺 timeless, refined', look: '📜 serif fonts, classic color palette' },
        young: { tone: '⚡ fresh, cutting-edge', look: '🎨 modern fonts, gradient colors' },
        innovative: { tone: '⚡ fresh, cutting-edge', look: '🎨 modern fonts, gradient colors' }
    },

    conflictRules: [
        { axes: [0, 1], threshold: 60, message: "Balancing 'elite' with 'playful' may be challenging." },
        { axes: [2, 3], threshold: 60, message: "Being both 'rebel' and 'authority' might create tension." },
        { condition: (values) => values[0] < 30 && values[4] > 70, message: "Combining 'elite' with 'young & innovative' could be tricky." },
        { condition: (values) => values[1] > 70 && values[3] > 70, message: "Being very 'playful' while maintaining strong 'authority' may be difficult." }
    ],


    calculateTraits: (sliderValues) => {
        return sliderValues.map((value, index) => {
            const axis = Personality.axes[index];
            const levelIndex = Math.round(value / 10);
            
            if (levelIndex === 5) return '';
            
            const intensity = Personality.intensityLevels[levelIndex < 5 ? levelIndex : 10 - levelIndex];
            const trait = levelIndex < 5 ? axis.left : axis.right;
            
            return intensity ? `${intensity} ${trait}` : trait;
        }).filter(Boolean);
    },

    generateSuggestions: (traits) => {
        const toneElements = [];
        const lookElements = [];

        traits.forEach(trait => {
            const baseTrait = trait.split(' ').pop();
            const suggestion = Personality.traitSuggestions[baseTrait];
            if (suggestion) {
                toneElements.push(suggestion.tone);
                lookElements.push(suggestion.look);
            }
        });

        return {
            toneOfVoice: toneElements.join(', ') || 'neutral and adaptable',
            lookAndFeel: lookElements.join(', ') || 'clean and versatile design'
        };
    },

    detectConflicts: (sliderValues) => {
        const conflicts = [];

        Personality.conflictRules.forEach(rule => {
            if (rule.condition) {
                if (rule.condition(sliderValues)) {
                    conflicts.push(rule.message);
                }
            } else if (rule.axes && rule.threshold) {
                const [axis1, axis2] = rule.axes;
                if (Math.abs(sliderValues[axis1] - sliderValues[axis2]) > rule.threshold) {
                    conflicts.push(rule.message);
                }
            }
        });

        return conflicts.length ? conflicts : ['none detected'];
    },

    createSlider: (axis, index, app) => {
        const container = Utils.create('div', { className: 'column gap-s' });

        const sliderRow = Utils.create('div', { 
            className: 'row gap-m align-center',
            style: { width: '100%' }
        });

        const leftContainer = Utils.create('div', { 
            className: 'align-center text-s',
            style: { 
                height: '30px', 
                minWidth: '120px'
            } 
        });
        const sliderContainer = Utils.create('div', { 
            className: 'column gap-xs box',
            style: { flex: '1' }
        });

        const labels = Utils.create('div', { 
            className: 'row justify-stretch'
        });
        labels.appendChild(Utils.create('h5', { textContent: axis.left }));
        labels.appendChild(Utils.create('h5', { textContent: axis.right }));
        sliderContainer.appendChild(labels);

        const sliderTrack = Utils.create('div', {
            className: 'transition',
            style: {
                position: 'relative',
                borderTop: '1px dashed #ccc',
                width: '100%'
            }
        });

        const handle = Utils.create('div', {
            className: 'transition',
            style: {
                position: 'absolute',
                top: '-10px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'black',
                left: 'calc(50% - 10px)'
            }
        });

        sliderTrack.appendChild(handle);
        sliderContainer.appendChild(sliderTrack);
        const rightContainer = Utils.create('div', { 
            className: 'align-center text-s',
            style: { 
                height: '30px', 
                minWidth: '120px'
            } 
        });
        leftContainer.textContent = axis.leftBrand;
        rightContainer.textContent = axis.rightBrand;
        
        sliderRow.appendChild(leftContainer);
        sliderRow.appendChild(sliderContainer);
        sliderRow.appendChild(rightContainer);
        container.appendChild(sliderRow);
        Personality.addSliderEvents(sliderTrack, handle, index, app);

        return container;
    },

    addSliderEvents: (track, handle, index, app) => {
        let isDragging = false;

        const updateSlider = (clientX) => {
            const rect = track.getBoundingClientRect();
            const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const snappedPosition = Math.round(position * 10) / 10;
            
            app.sliderValues[index] = snappedPosition * 100;
            handle.style.left = `calc(${snappedPosition * 100}% - 10px)`;
            
            const hue = snappedPosition === 0.5 ? 0 : snappedPosition * 240;
            handle.style.background = snappedPosition === 0.5 ? 'black' : `hsl(${hue}, 100%, 50%)`;
            
            app.activeProfile = null;
            app.updateResults();
            app.updateAIPromptDisplay();
        };

        Utils.addEvents(track, {
            mousedown: (e) => { isDragging = true; updateSlider(e.clientX); },
            touchstart: (e) => { isDragging = true; updateSlider(e.touches[0].clientX); }
        });

        Utils.addEvents(document, {
            mousemove: (e) => isDragging && updateSlider(e.clientX),
            touchmove: (e) => isDragging && updateSlider(e.touches[0].clientX),
            mouseup: () => isDragging = false,
            touchend: () => isDragging = false
        });
    },

    updateSliderPositions: (sliderValues) => {
        const sliders = Utils.$$('#sliders > div');
        sliders.forEach((slider, index) => {
            const handle = slider.querySelector('div[style*="position: absolute"]');
            const value = sliderValues[index];
            const position = value / 100;
            
            handle.style.left = `calc(${value}% - 10px)`;
            const hue = position === 0.5 ? 0 : position * 240;
            handle.style.background = position === 0.5 ? 'black' : `hsl(${hue}, 100%, 50%)`;
        });
    }
};