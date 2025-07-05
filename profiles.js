const Profiles = {
    calculateSimilarity: (profileValues, currentValues) => {
        const difference = currentValues.reduce((sum, value, index) => 
            sum + Math.abs(value - (profileValues[index] || 50)), 0);
        return 1 - (difference / (100 * currentValues.length));
    },

    examples: {
        'chanel': {
            sliderValues: [5, 20, 30, 60, 10],
            brandStory: {
                trend: 'fast fashion dominance',
                geography: 'global luxury markets',
                companyName: 'chanel',
                category: 'luxury fashion house',
                differentiation: 'maintains timeless elegance and exclusivity',
                customer: 'sophisticated women',
                needState: 'who value heritage and craftsmanship'
            },
            isExample: true
        },
        'h&m': {
            sliderValues: [95, 70, 50, 40, 60],
            brandStory: {
                trend: 'rising sustainability concerns',
                geography: 'global fast fashion markets',
                companyName: 'h&m',
                category: 'fashion retailer',
                differentiation: 'makes trendy fashion accessible to everyone',
                customer: 'style-conscious consumers',
                needState: 'who want affordable, on-trend clothing'
            },
            isExample: true
        },
        'google': {
            sliderValues: [50, 95, 80, 30, 95],
            brandStory: {
                trend: 'information overload',
                geography: 'the global internet',
                companyName: 'google',
                category: 'search engine',
                differentiation: 'organizes the world\'s information universally',
                customer: 'curious minds everywhere',
                needState: 'who seek instant, accurate answers'
            },
            isExample: true
        },
        'tesla': {
            sliderValues: [30, 60, 95, 70, 95],
            brandStory: {
                trend: 'climate change awareness',
                geography: 'global automotive markets',
                companyName: 'tesla',
                category: 'electric vehicle company',
                differentiation: 'accelerates sustainable transport adoption',
                customer: 'forward-thinking drivers',
                needState: 'who want performance without compromise'
            },
            isExample: true
        },
        'apple': {
            sliderValues: [10, 60, 90, 50, 95],
            brandStory: {
                trend: 'technology complexity',
                geography: 'global consumer electronics',
                companyName: 'apple',
                category: 'technology company',
                differentiation: 'makes advanced technology intuitive and beautiful',
                customer: 'creative professionals and everyday users',
                needState: 'who value simplicity and design excellence'
            },
            isExample: true
        },
        'nike': {
            sliderValues: [40, 90, 95, 30, 85],
            brandStory: {
                trend: 'sedentary lifestyles',
                geography: 'global sports markets',
                companyName: 'nike',
                category: 'athletic brand',
                differentiation: 'inspires athletic achievement for everyone',
                customer: 'athletes and fitness enthusiasts',
                needState: 'who push their limits and strive for greatness'
            },
            isExample: true
        },
        'palantir': {
            sliderValues: [10, 5, 30, 90, 40],
            brandStory: {
                trend: 'data complexity and security threats',
                geography: 'global enterprise markets',
                companyName: 'palantir',
                category: 'data analytics platform',
                differentiation: 'transforms complex data into actionable intelligence',
                customer: 'government agencies and large enterprises',
                needState: 'who need to make critical decisions from vast datasets'
            },
            isExample: true
        },
        'honda': {
            sliderValues: [50, 30, 10, 50, 30],
            brandStory: {
                trend: 'automotive disruption',
                geography: 'global automotive markets',
                companyName: 'honda',
                category: 'automotive manufacturer',
                differentiation: 'delivers reliable, practical mobility solutions',
                customer: 'everyday drivers and families',
                needState: 'who value dependability and value'
            },
            isExample: true
        },
        'disney': {
            sliderValues: [40, 95, 60, 5, 50],
            brandStory: {
                trend: 'digital entertainment proliferation',
                geography: 'global family entertainment',
                companyName: 'disney',
                category: 'entertainment company',
                differentiation: 'creates magical experiences for all ages',
                customer: 'families and dreamers',
                needState: 'who seek wonder, joy, and shared memories'
            },
            isExample: true
        },
        'ny times': {
            sliderValues: [30, 10, 40, 95, 60],
            brandStory: {
                trend: 'misinformation and media fragmentation',
                geography: 'global news landscape',
                companyName: 'the new york times',
                category: 'news organization',
                differentiation: 'delivers authoritative, in-depth journalism',
                customer: 'informed citizens and decision makers',
                needState: 'who demand credible, comprehensive news coverage'
            },
            isExample: true
        },
        'booking.com': {
            sliderValues: [60, 30, 20, 70, 10],
            brandStory: {
                trend: 'travel complexity and choice overload',
                geography: 'global travel markets',
                companyName: 'booking.com',
                category: 'travel booking platform',
                differentiation: 'simplifies travel planning with comprehensive options',
                customer: 'travelers and vacation planners',
                needState: 'who want convenience and comprehensive choice'
            },
            isExample: true
        },
        'airbnb': {
            sliderValues: [70, 80, 90, 20, 95],
            brandStory: {
                trend: 'standardized hotel experiences',
                geography: 'global accommodation markets',
                companyName: 'airbnb',
                category: 'accommodation platform',
                differentiation: 'enables authentic, local travel experiences',
                customer: 'adventurous travelers and hosts',
                needState: 'who crave unique, personal connections'
            },
            isExample: true
        }
    },

    updateProfileButtons: (app) => {
        const container = Utils.byId('allProfileButtons');
        if (container) {
            Profiles.populateProfileContainer(container, app);
        }
    },

    populateProfileContainer: (container, app) => {
        container.innerHTML = '';

        const saveProfileBtn = Components.button('+ add profile', {
            className: 'background-primary radius-s transition',
            title: 'Save current settings as a new profile',
            onclick: () => Profiles.saveCurrentProfile(app)
        });
        container.appendChild(saveProfileBtn);

        const savedProfiles = Utils.storage.get('savedBrandProfiles', {});
        const allProfiles = { ...Profiles.examples, ...savedProfiles };

        const profileData = Object.entries(allProfiles)
            .map(([name, profile]) => ({
                name,
                profile,
                similarity: Profiles.calculateSimilarity(profile.sliderValues || profile, app.sliderValues)
            }))
            .sort((a, b) => b.similarity - a.similarity);

        profileData.forEach(({ name, profile, similarity }) => {
            const buttonComponent = Profiles.createProfileButtonComponent(name, profile, similarity, app.activeProfile, app);
            container.appendChild(buttonComponent);
        });
    },

    createProfileButtonComponent: (name, profile, similarity, activeProfile, app) => {
        const container = Utils.create('div', { className: 'row gap-xs' });

        const button = Components.button(name, {
            className: 'radius-s transition',
            style: { 
                opacity: Math.max(0.3, similarity),
                textDecoration: activeProfile === name ? 'underline' : 'none'
            },
            onclick: () => Profiles.loadProfile(name, app)
        });

        container.appendChild(button);

        if (!profile.isExample) {
            const deleteBtn = Components.button('×', {
                className: 'background-negative',
                title: `Delete ${name}`,
                onclick: () => Profiles.deleteProfile(name, app)
            });
            container.appendChild(deleteBtn);
        }

        return container;
    },

    loadProfile: (name, app) => {
        const savedProfiles = Utils.storage.get('savedBrandProfiles', {});
        const profile = Profiles.examples[name] || savedProfiles[name];
        
        if (!profile) return;

        app.activeProfile = name;
        app.sliderValues = [...profile.sliderValues];
        Personality.updateSliderPositions(app.sliderValues);

        if (profile.brandStory) {
            Object.entries(profile.brandStory).forEach(([key, value]) => {
                if (key !== 'companyName') {
                    const element = Utils.byId(key);
                    if (element) element.value = value || '';
                }
            });
        }

        app.updateResults();
        Story.updateAIPromptDisplay(app);
    },

    deleteProfile: (name, app) => {
        if (!confirm(`delete profile "${name}"?`)) return;

        const savedProfiles = Utils.storage.get('savedBrandProfiles', {});
        delete savedProfiles[name];
        
        if (app.activeProfile === name) {
            app.activeProfile = null;
        }
        if (app.lastSavedProfile === name) {
            app.lastSavedProfile = null;
        }
        
        if (Utils.storage.set('savedBrandProfiles', savedProfiles)) {
            Profiles.updateProfileButtons(app);
        } else {
            alert('failed to delete profile due to storage error.');
        }
    },

    saveCurrentProfile: (app) => {
        const profileName = prompt('Enter a name for this profile:');
        if (!profileName || !profileName.trim()) {
            return;
        }

        const trimmedName = profileName.trim();
        
        const savedProfiles = Utils.storage.get('savedBrandProfiles', {});
        if (savedProfiles[trimmedName] || Profiles.examples[trimmedName]) {
            alert(`Profile "${trimmedName}" already exists. Please choose a different name.`);
            return;
        }

        const currentState = app.getCurrentState();
        
        const profileData = {
            sliderValues: [...app.sliderValues],
            brandStory: { ...currentState.brandStory },
            isExample: false,
            savedAt: new Date().toISOString()
        };

        if (!profileData.brandStory.companyName || profileData.brandStory.companyName === 'your brand') {
            profileData.brandStory.companyName = trimmedName;
        }

        savedProfiles[trimmedName] = profileData;
        
        if (Utils.storage.set('savedBrandProfiles', savedProfiles)) {
            app.activeProfile = trimmedName;
            app.lastSavedProfile = trimmedName;
            
            Profiles.updateProfileButtons(app);
            Story.updateBrandStoryDisplay(app);
            
            alert(`Profile "${trimmedName}" saved successfully!`);
        } else {
            alert('Failed to save profile due to storage error.');
        }
    },

    startFresh: (app) => {
        if (app.lastSavedProfile) {
            const savedProfiles = Utils.storage.get('savedBrandProfiles', {});
            if (savedProfiles[app.lastSavedProfile]) {
                delete savedProfiles[app.lastSavedProfile];
                Utils.storage.set('savedBrandProfiles', savedProfiles);
            }
        }

        if (app.activeProfile && app.activeProfile !== app.lastSavedProfile) {
            const savedProfiles = Utils.storage.get('savedBrandProfiles', {});
            if (savedProfiles[app.activeProfile] && !savedProfiles[app.activeProfile].isExample) {
                delete savedProfiles[app.activeProfile];
                Utils.storage.set('savedBrandProfiles', savedProfiles);
            }
        }

        app.clearAllFields();
        
        Profiles.updateProfileButtons(app);
    }
};