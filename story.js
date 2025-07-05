const Story = {
    fields: [
        { id: 'trend', label: 'when', placeholder: 'What cultural, technological, or market trend creates the perfect timing for your brand? Examples: "the rise of remote work", "increasing health consciousness", "demand for sustainable products", etc.', color: '#8159FB', textColor: 'white' },
        { id: 'geography', label: 'where', placeholder: 'Where does your brand operate? Think about geographic markets, cultural contexts, or digital spaces. Examples: "north america", "global tech markets", "european luxury segment", etc.', color: '#02903B', textColor: 'white' },
        { id: 'category', label: 'what', placeholder: 'A phrase or sentence describing your primary business for the next five years. Examples: "Make toothpaste", "fix cars", etc.', color: '#FFBFE1', textColor: 'black' },
        { id: 'differentiation', label: 'how', placeholder: 'What\'s your secret sauce? What technology or approach sets you apart from the competition? Examples: "Made with all-natural ingredients", "best-in-class friendly service", etc.', color: '#FF4B00', textColor: 'white' },
        { id: 'customer', label: 'for whom', placeholder: 'Who is your ideal customer? Be specific about demographics, psychographics, or needs. Examples: "busy professionals", "health-conscious millennials", "small business owners", etc.', color: '#014ADD', textColor: 'white' },
        { id: 'needState', label: 'why', placeholder: 'You can think of the *why* as the reason you get out of bed in the morning and go to work. The *why* should reflect the core reason your company exists, and it won\'t change much over time.', color: '#FDC800', textColor: 'black' }
    ],

    generateBrandStory: (brandData) => {
        const defaults = {
            trend: 'this trend',
            geography: 'this market',
            companyName: 'your brand',
            category: 'a company',
            differentiation: 'does something unique',
            customer: 'your customers',
            needState: 'who need this'
        };

        const data = { ...defaults, ...brandData };
        
        return `During ${data.trend}, in ${data.geography}, ${data.companyName} is ${data.category} that ${data.differentiation} for ${data.customer} ${data.needState}.`;
    },

    generateAIPrompt: (brandData, traits, suggestions, conflicts) => {
        const storyText = Story.generateBrandStory(brandData);
        const personalityTraits = traits.join(', ') || 'balanced across all dimensions';

        return `brand story: ${storyText}

personality profile: ${personalityTraits}

tone of voice: ${suggestions.toneOfVoice}

look and feel: ${suggestions.lookAndFeel}

potential conflicts: ${conflicts.join(' ')}

please help me develop this brand further by:
1. refining the brand story and messaging
2. suggesting specific tone of voice guidelines
3. recommending visual identity directions
4. identifying potential brand touchpoints and applications
5. highlighting any areas that need clarification or development

focus on making the brand authentic, memorable, and aligned with the personality profile.`;
    },

    setupBidirectionalSync: (app) => {
        const fieldMappings = [
            { outputId: 'outputTrend', inputId: 'trend' },
            { outputId: 'outputGeography', inputId: 'geography' },
            { outputId: 'outputCategory', inputId: 'category' },
            { outputId: 'outputDifferentiation', inputId: 'differentiation' },
            { outputId: 'outputCustomer', inputId: 'customer' },
            { outputId: 'outputNeedState', inputId: 'needState' }
        ];

        fieldMappings.forEach(({ outputId, inputId }) => {
            const outputElement = Utils.byId(outputId);
            const inputElement = Utils.byId(inputId);

            if (outputElement && inputElement) {
                Utils.addEvents(outputElement, {
                    input: () => {
                        const content = outputElement.textContent.trim();
                        inputElement.value = content;
                        app.activeProfile = null;
                        app.updateAIPromptDisplay();
                    },
                    blur: () => {
                        const content = outputElement.textContent.trim();
                        inputElement.value = content;
                        if (inputElement.dispatchEvent) {
                            inputElement.dispatchEvent(new Event('input'));
                        }
                    }
                });
            }
        });
    },

    setupStickyNoteHover: (app) => {
        const stickyNotes = Utils.$$('.sticky-note');
        
        stickyNotes.forEach(note => {
            Story.setupStickyNoteColorHighlight(note, app);
        });
    },

    setupStickyNoteColorHighlight: (note, app) => {
        const noteType = note.dataset.note;
        const field = Story.getFieldConfig('label', noteType);
        
        if (!field) return;
        
        const outputId = `output${field.id.charAt(0).toUpperCase() + field.id.slice(1)}`;
        const output = Utils.byId(outputId);
        
        if (!output) return;

        const highlightElement = (element) => {
            Story.applyFieldStyling(element, field, 'hover');
        };

        const clearHighlight = (element) => {
            // Return to completely clean state - no styling
            Story.clearFieldStyling(element);
        };

        Utils.addEvents(note, {
            mouseenter: () => highlightElement(output),
            mouseleave: () => clearHighlight(output)
        });
    },

    updateBrandStoryDisplay: (app) => {
        const currentState = app.getCurrentState();
        const brandData = currentState.brandStory;

        let companyName = 'your brand';
        if (app.activeProfile) {
            const savedProfiles = Utils.storage.get('savedBrandProfiles', {});
            const profile = app.exampleProfiles[app.activeProfile] || savedProfiles[app.activeProfile];
            if (profile && profile.brandStory && profile.brandStory.companyName) {
                companyName = profile.brandStory.companyName;
            }
        }

        const storyPlaceholders = {
            trend: 'this trend',
            geography: 'this market', 
            category: 'a company',
            differentiation: 'does something unique',
            customer: 'your customers',
            needState: 'who need this'
        };

        const fieldMappings = [
            ...Story.fields.map(field => ({
                outputId: `output${field.id.charAt(0).toUpperCase() + field.id.slice(1)}`,
                value: brandData[field.id],
                placeholder: storyPlaceholders[field.id] || field.label,
                isEmpty: !brandData[field.id],
                field
            })),
            {
                outputId: 'outputCompanyName',
                value: companyName,
                placeholder: 'your brand',
                isEmpty: companyName === 'your brand',
                field: null
            }
        ];

        fieldMappings.forEach(mapping => Story.updateOutputField(mapping));
        app.updateAIPromptDisplay();
    },

    updateAIPromptDisplay: (app) => {
        const currentState = app.getCurrentState();
        const brandData = { ...currentState.brandStory };

        if (app.activeProfile) {
            const savedProfiles = Utils.storage.get('savedBrandProfiles', {});
            const profile = app.exampleProfiles[app.activeProfile] || savedProfiles[app.activeProfile];
            if (profile && profile.brandStory && profile.brandStory.companyName) {
                brandData.companyName = profile.brandStory.companyName;
            }
        }

        const traits = Personality.calculateTraits(app.sliderValues);
        const suggestions = Personality.generateSuggestions(traits);
        const conflicts = Personality.detectConflicts(app.sliderValues);
        const aiPrompt = Story.generateAIPrompt(brandData, traits, suggestions, conflicts);

        const displayElement = Utils.byId('aiPromptDisplay');
        if (displayElement) {
            displayElement.textContent = aiPrompt;
        }
    },

    copyAIPrompt: () => {
        const displayElement = Utils.byId('aiPromptDisplay');
        if (!displayElement || !displayElement.textContent.trim()) {
            alert('no ai prompt content to copy. please make sure all fields are filled.');
            return;
        }

        const aiPrompt = displayElement.textContent;

        Story.copyToClipboard(aiPrompt);
    },

    copyToClipboard: (text) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text)
                .then(() => alert('ai prompt copied to clipboard!'))
                .catch(() => Story.fallbackCopyToClipboard(text));
        } else {
            Story.fallbackCopyToClipboard(text);
        }
    },

    fallbackCopyToClipboard: (text) => {
        const textarea = Utils.create('textarea', { value: text });
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('ai prompt copied to clipboard!');
    },

    getFieldConfig: (type, value) => {
        if (type === 'label') {
            return Story.fields.find(f => f.label === value);
        }
        return null;
    },

    applyFieldStyling: (element, field, mode = 'default') => {
        if (!field || mode !== 'hover') return;

        const styles = {
            backgroundColor: field.color + '40',
            borderRadius: '3px',
            padding: '2px 6px'
        };

        Utils.setStyles(element, styles);
    },

    clearFieldStyling: (element) => {
        Utils.setStyles(element, {
            backgroundColor: '',
            borderRadius: '',
            padding: '',
            opacity: '',
            color: ''
        });
    },

    updateOutputField: ({ outputId, value, placeholder, isEmpty, field }) => {
        const element = Utils.byId(outputId);
        if (!element) return;

        const displayValue = value || placeholder;
        element.textContent = displayValue;
        element.title = isEmpty ? `Empty field: ${placeholder}` : '';
        
        const isPlaceholder = value === placeholder || isEmpty;
        
        if (field) {
            Story.clearFieldStyling(element);
        } else {
            if (isPlaceholder) {
                Utils.setStyles(element, {
                    opacity: '0.5',
                    background: 'rgba(255, 182, 193, 0.2)',
                    padding: '2px 4px',
                    borderRadius: '3px'
                });
            } else {
                Story.clearFieldStyling(element);
            }
        }
    }
};