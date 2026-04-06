// [file name]: AIContext.js
// [file content begin]
import React, { createContext, useState, useContext } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const AIContext = createContext();

export const AIProvider = ({ children }) => {
    const [apiKey, setApiKey] = useState(() => {
        // Try localStorage first
        const savedApiKey = localStorage.getItem('ai-builder-api-key');
        if (savedApiKey) {
            return savedApiKey;
        }

        // Try environment variable
        if (process.env.REACT_APP_GEMINI_API_KEY) {
            return process.env.REACT_APP_GEMINI_API_KEY;
        }

        return '';
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);

    // Update the setApiKey function
    const updateApiKey = (newKey) => {
        setApiKey(newKey);
        localStorage.setItem('ai-builder-api-key', newKey);
    };

    // Analyze user requirements and determine appropriate design approach
    const analyzeRequirements = (description, features) => {
        const desc = description.toLowerCase();
        const featureList = features ? Object.entries(features)
            .filter(([_, value]) => value)
            .map(([key]) => key.toLowerCase())
            .join(' ') : '';

        const combined = `${desc} ${featureList}`;

        // Determine website type
        let websiteType = 'general';
        if (combined.includes('portfolio') || combined.includes('resume')) websiteType = 'portfolio';
        else if (combined.includes('ecommerce') || combined.includes('shop') || combined.includes('store')) websiteType = 'ecommerce';
        else if (combined.includes('blog') || combined.includes('article')) websiteType = 'blog';
        else if (combined.includes('landing') || combined.includes('product')) websiteType = 'landing';
        else if (combined.includes('dashboard') || combined.includes('admin')) websiteType = 'dashboard';
        else if (combined.includes('corporate') || combined.includes('business')) websiteType = 'corporate';
        else if (combined.includes('creative') || combined.includes('agency')) websiteType = 'creative';
        else if (combined.includes('minimal') || combined.includes('simple')) websiteType = 'minimal';

        // Determine tone/style
        let tone = 'professional';
        if (combined.includes('playful') || combined.includes('fun') || combined.includes('kids')) tone = 'playful';
        else if (combined.includes('luxury') || combined.includes('premium') || combined.includes('elegant')) tone = 'luxury';
        else if (combined.includes('bold') || combined.includes('vibrant') || combined.includes('energetic')) tone = 'bold';
        else if (combined.includes('minimal') || combined.includes('clean') || combined.includes('simple')) tone = 'minimal';
        else if (combined.includes('tech') || combined.includes('modern') || combined.includes('futuristic')) tone = 'tech';
        else if (combined.includes('vintage') || combined.includes('retro') || combined.includes('classic')) tone = 'vintage';

        // Determine color preference
        let colorScheme = 'contextual';
        if (combined.includes('dark')) colorScheme = 'dark';
        else if (combined.includes('light')) colorScheme = 'light';
        else if (combined.includes('colorful') || combined.includes('vibrant')) colorScheme = 'vibrant';
        else if (combined.includes('monochrome') || combined.includes('black and white')) colorScheme = 'monochrome';
        else if (combined.includes('pastel')) colorScheme = 'pastel';
        else if (combined.includes('neon')) colorScheme = 'neon';

        return { websiteType, tone, colorScheme };
    };

    // AI Code Refactor Function
    const refactorCode = async (code, language, context = {}) => {
        if (!apiKey) {
            throw new Error("API Key is missing! Please add it in Settings.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                topK: 64,
            }
        });

        const languageName = language === 'html' ? 'HTML' : language === 'css' ? 'CSS' : 'JavaScript';

        const prompt = `You are an expert ${languageName} code refactorer. Refactor and improve the following code:

LANGUAGE: ${languageName}
CONTEXT: ${context.description || 'General website code'}

ORIGINAL CODE:
${code}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REFACTORING GUIDELINES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CODE QUALITY:
   - Fix any syntax errors or bad practices
   - Improve readability and maintainability
   - Add proper comments for complex logic
   - Remove redundant or unused code
   - Ensure consistent formatting

2. PERFORMANCE OPTIMIZATION:
   - Optimize for speed where possible
   - Reduce unnecessary DOM operations
   - Minimize CSS specificity
   - Use efficient selectors/algorithms

3. BEST PRACTICES:
   - Follow ${languageName} best practices
   - Ensure accessibility standards
   - Make responsive design improvements
   - Add proper error handling
   - Use semantic markup (for HTML)

4. SECURITY:
   - Fix any potential security issues
   - Sanitize inputs/outputs
   - Avoid inline event handlers (for JS)
   - Use secure coding patterns

5. BROWSER COMPATIBILITY:
   - Ensure cross-browser compatibility
   - Add vendor prefixes if needed
   - Use feature detection

IMPORTANT: Return ONLY the refactored code, no explanations, no markdown formatting, no additional text. Just the pure ${languageName} code.

REFACTORED CODE:`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const refactoredCode = response.text().trim();

            // Clean up the response
            return refactoredCode
                .replace(/```\w*/g, '')
                .replace(/^\s*[\w\s]*code:\s*/i, '')
                .trim();
        } catch (error) {
            console.error("AI Refactor Failed:", error);
            throw new Error(`Failed to refactor code: ${error.message}`);
        }
    };

    // AI Chat Function
    const chatWithAI = async (message, context = {}) => {
        if (!apiKey) {
            throw new Error('API key not configured. Please add your Gemini API key in Settings.');
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                topK: 64,
            }
        });

        const prompt = `You are a helpful AI assistant for a website builder tool called "AgenticAI". 

User Context:
- They are using a website builder with AI code generation capabilities
- Can create HTML, CSS, and JavaScript projects
- Has editing, preview, and download capabilities
- May be working on web development projects

User Question: "${message}"

Additional Context: ${context.description || 'General web development help'}

Your expertise areas:
1. Web Development (HTML, CSS, JavaScript, React)
2. UI/UX Design principles and best practices
3. Responsive design and mobile optimization
4. Website performance optimization
5. Accessibility (WCAG guidelines)
6. SEO best practices
7. Modern web frameworks and tools
8. Code debugging and troubleshooting
9. Design patterns and architecture
10. Browser compatibility issues

Response Guidelines:
- Be concise but thorough
- Use code blocks  for code examples
- Provide practical, actionable advice
- Suggest relevant tools or resources when appropriate
- Ask clarifying questions if the query is ambiguous
- Focus on solutions that work within a website builder context
- Keep responses under 500 words for readability
- If suggesting code changes, explain why they're improvements
- For design questions, consider both aesthetics and usability

Provide helpful, professional advice. If you're unsure about something, acknowledge it and suggest where to find reliable information.`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Chat AI Error:", error);
            throw new Error(`Failed to get AI response: ${error.message}`);
        }
    };

    // AI Agent - Modify Website with Prompt (like Lovable.ai)
    const modifyWebsiteWithPrompt = async (project, prompt) => {
        if (!apiKey) {
            throw new Error('API key not configured. Please add your Gemini API key in Settings.');
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.8,
                topP: 0.95,
                topK: 64,
            }
        });

        const currentCode = {
            html: project.html || '',
            css: project.css || '',
            js: project.js || ''
        };

        const projectContext = `
PROJECT NAME: "${project.name}"
PROJECT DESCRIPTION: "${project.description || 'No description'}"

CURRENT WEBSITE CODE:
[HTML]
${currentCode.html}

[CSS]
${currentCode.css}

[JS]
${currentCode.js}

USER REQUEST: "${prompt}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are an AI web developer agent. Modify the existing website code according to the user's request.

THINKING PROCESS:
1. Analyze the current website structure
2. Understand exactly what the user wants to change
3. Plan the modifications needed
4. Generate updated code that maintains consistency
5. Ensure the changes are minimal and targeted

GUIDELINES:
- Preserve the existing functionality unless explicitly asked to change it
- Maintain code quality and best practices
- Keep changes focused on the user's request
- Document what you changed in the [CHANGES] section
- Return COMPLETE updated files (HTML, CSS, JS)

CHANGE APPROACH:
${prompt.toLowerCase().includes('color') ? '- Focus on color scheme adjustments' : ''}
${prompt.toLowerCase().includes('layout') ? '- Modify layout and spacing' : ''}
${prompt.toLowerCase().includes('responsive') ? '- Improve responsiveness for mobile/tablet' : ''}
${prompt.toLowerCase().includes('animation') ? '- Add or modify animations' : ''}
${prompt.toLowerCase().includes('modern') ? '- Update to modern design trends' : ''}
${prompt.toLowerCase().includes('form') ? '- Add or modify form elements' : ''}

Return in this exact format:

[THOUGHT]
Brief explanation of what you're changing and why...

[CHANGES]
1. First change made
2. Second change made
3. etc.

[HTML]
<!DOCTYPE html>
...updated HTML code...

[CSS]
...updated CSS code...

[JS]
...updated JavaScript code...

Make the modifications now.`;

        try {
            const result = await model.generateContent(projectContext);
            const response = await result.response;
            const text = response.text();

            // Parse the response to extract sections
            const thoughtMatch = text.match(/\[THOUGHT\]([\s\S]*?)\[CHANGES\]/);
            const changesMatch = text.match(/\[CHANGES\]([\s\S]*?)\[HTML\]/);
            const htmlMatch = text.match(/\[HTML\]([\s\S]*?)(\[CSS\]|$)/);
            const cssMatch = text.match(/\[CSS\]([\s\S]*?)(\[JS\]|$)/);
            const jsMatch = text.match(/\[JS\]([\s\S]*?)$/);

            const changes = changesMatch
                ? changesMatch[1]
                    .trim()
                    .split('\n')
                    .filter(line => line.trim())
                    .map(line => line.replace(/^\d+\.\s*/, '').trim())
                : ['Updated website based on user request'];

            const cleanCodeStr = (code) => {
                return code.replace(/```html|```css|```javascript|```js|```/gi, '').trim();
            };

            const updatedHtml = htmlMatch ? cleanCodeStr(htmlMatch[1]) : currentCode.html;
            const updatedCss = cssMatch ? cleanCodeStr(cssMatch[1]) : currentCode.css;
            const updatedJs = jsMatch ? cleanCodeStr(jsMatch[1]) : currentCode.js;

            return {
                thought: thoughtMatch ? thoughtMatch[1].trim() : 'Made requested changes',
                changes: changes,
                html: updatedHtml,
                css: updatedCss,
                js: updatedJs,
                originalState: currentCode // Store original for potential revert
            };

        } catch (error) {
            console.error("AI Modification Failed:", error);
            throw new Error(`Failed to modify website: ${error.message}`);
        }
    };

    const generateWebsiteStream = async (project, updateProjectFn) => {
        if (!apiKey) {
            alert("API Key is missing! Please check your .env file.");
            return;
        }

        setIsGenerating(true);
        setGenerationProgress(0);
        updateProjectFn(project.id, { status: 'generating' });

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                generationConfig: {
                    temperature: 0.85,
                    topP: 0.95,
                    topK: 64,
                }
            });

            const activeFeatures = project.features
                ? Object.entries(project.features)
                    .filter(([_, value]) => value)
                    .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim())
                    .join(', ')
                : '';

            // Analyze requirements first
            const analysis = analyzeRequirements(project.description || '', project.features);

            const prompt = `You are an expert web designer creating a custom website. First, analyze the requirements, then design accordingly.

PROJECT DESCRIPTION: "${project.description || 'a modern website'}"
${activeFeatures ? `REQUIRED FEATURES: ${activeFeatures}` : ''}

ANALYSIS CONTEXT:
- Detected Type: ${analysis.websiteType}
- Tone: ${analysis.tone}
- Color Preference: ${analysis.colorScheme}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN APPROACH - THINK BEFORE YOU CODE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. UNDERSTAND THE PURPOSE:
   - What is this website for? (${analysis.websiteType})
   - Who is the target audience?
   - What emotional response should it evoke? (${analysis.tone})

2. CHOOSE APPROPRIATE DESIGN SYSTEM:
   
   Portfolio/Creative: Focus on visual storytelling, large images, unique layouts
   E-commerce: Clear product hierarchy, trust signals, easy navigation
   Corporate/Business: Professional, credible, organized, traditional layouts
   Blog: Readable typography, content-first, comfortable reading experience
   Landing Page: Single focus, strong CTA, persuasive design
   Dashboard: Functional, data-dense, minimal decoration
   Minimal: Lots of whitespace, simple typography, restrained color
   
3. SELECT COLOR PALETTE BASED ON PURPOSE:
   
   ${analysis.colorScheme === 'contextual' ? `
   - Financial/Legal: Blues, grays (trust, professionalism)
   - Creative/Agency: Bold colors, high contrast
   - Health/Wellness: Greens, soft blues (calm, natural)
   - Tech/Innovation: Blues, purples, blacks (modern, cutting-edge)
   - Food/Restaurant: Warm colors, appetizing tones
   - Kids/Education: Bright, playful colors
   - Luxury: Black, gold, deep jewel tones
   ` : `Use ${analysis.colorScheme} color scheme as requested`}
   
4. ANIMATION & INTERACTION LEVEL:
   
   High Energy: Gaming, entertainment, creative agencies → lots of animation
   Professional: Corporate, legal, finance → subtle, purposeful animation
   E-commerce: Product focus → moderate, functional animation
   Minimal: Portfolio, blogs → minimal, elegant animation
   
5. LAYOUT STRATEGY:
   
   Match layout to content type:
   - Portfolio: Asymmetric, creative grid layouts
   - E-commerce: Traditional grid, clear categories
   - Blog: Single column, wide reading area
   - Landing: Hero-focused, linear storytelling
   - Dashboard: Multi-column, card-based

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CODE STRUCTURE REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[HTML]
- Create semantic, accessible HTML5
- Include navigation, main content sections, footer
- Add appropriate sections based on website type
- Use meaningful class names that reflect the design system

[CSS]
- Define CSS variables for the chosen color palette
- Create responsive layouts with mobile-first approach
- Add animations that match the tone (subtle vs. bold)
- Use modern CSS (Grid, Flexbox, custom properties)
- Ensure excellent typography and readability
- Add hover states and transitions where appropriate

[JS]
- Implement smooth scrolling and navigation
- Add interactive features relevant to the website type
- Include scroll animations and reveals (adjust intensity to tone)
- Handle mobile menu toggle
- Add form validation if forms are present
- Keep it functional and bug-free

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL GUIDELINES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Design should MATCH the project description, not a template
✓ Color palette should be APPROPRIATE for the industry/purpose
✓ Animation intensity should match the tone
✓ Layout should serve the content type
✓ Typography should be READABLE and appropriate
✓ Make it fully responsive (mobile, tablet, desktop)
✓ Include smooth transitions and professional polish
✓ Avoid over-design if simplicity is requested
✓ Avoid under-design if bold/creative is requested

ADAPTATION EXAMPLES:

If it's a law firm: Conservative colors (navy, gray), traditional layout, minimal animation, trust-building elements
If it's a gaming site: Bold colors, lots of animation, creative layouts, high energy
If it's a restaurant: Appetizing colors, beautiful food imagery, easy menu navigation
If it's a blog: Excellent typography, comfortable reading, clean layout
If it's a SaaS landing: Clear value prop, feature highlights, strong CTAs, modern but professional

Create code in this exact format:

[HTML]
<!DOCTYPE html>
...your complete HTML code...

[CSS]
...your complete CSS code...

[JS]
...your complete JavaScript code...

Now create the website based on the analysis above. Make every design decision intentional and appropriate for: "${project.description}"`;

            const result = await model.generateContentStream(prompt);

            let accumulatedHtml = '';
            let accumulatedCss = '';
            let accumulatedJs = '';
            let currentSection = null;
            let buffer = '';

            const sectionMarkers = {
                html: /\[\s*HTML\s*\]|```html/i,
                css: /\[\s*CSS\s*\]|```css/i,
                js: /\[\s*JS\s*\]|\[\s*JavaScript\s*\]|```javascript|```js/i
            };

            let lastUpdate = Date.now();
            const updateInterval = 50;

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                buffer += chunkText;

                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmedLine = line.trim();

                    if (sectionMarkers.html.test(line)) {
                        currentSection = 'html';
                        continue;
                    } else if (sectionMarkers.css.test(line)) {
                        currentSection = 'css';
                        continue;
                    } else if (sectionMarkers.js.test(line)) {
                        currentSection = 'js';
                        continue;
                    }

                    if (!currentSection && (trimmedLine.includes('<!DOCTYPE html>') || trimmedLine.includes('<html'))) {
                        currentSection = 'html';
                    }

                    if (trimmedLine.startsWith('```') && !sectionMarkers.html.test(trimmedLine) &&
                        !sectionMarkers.css.test(trimmedLine) && !sectionMarkers.js.test(trimmedLine)) {
                        continue;
                    }

                    if (currentSection === 'html') {
                        accumulatedHtml += line + '\n';
                    } else if (currentSection === 'css') {
                        accumulatedCss += line + '\n';
                    } else if (currentSection === 'js') {
                        accumulatedJs += line + '\n';
                    }
                }

                if (Date.now() - lastUpdate > updateInterval) {
                    const total = accumulatedHtml.length + accumulatedCss.length + accumulatedJs.length;
                    const progress = Math.min(95, total / 100);
                    setGenerationProgress(progress);

                    updateProjectFn(project.id, {
                        html: accumulatedHtml,
                        css: accumulatedCss,
                        js: accumulatedJs,
                    });
                    lastUpdate = Date.now();
                }
            }

            // Process remaining buffer
            if (buffer.trim()) {
                const remainingLines = buffer.split('\n');
                for (const line of remainingLines) {
                    const trimmedLine = line.trim();

                    if (sectionMarkers.html.test(trimmedLine)) {
                        currentSection = 'html';
                        continue;
                    } else if (sectionMarkers.css.test(trimmedLine)) {
                        currentSection = 'css';
                        continue;
                    } else if (sectionMarkers.js.test(trimmedLine)) {
                        currentSection = 'js';
                        continue;
                    }

                    if (trimmedLine.startsWith('```')) continue;

                    if (currentSection === 'html') accumulatedHtml += line + '\n';
                    else if (currentSection === 'css') accumulatedCss += line + '\n';
                    else if (currentSection === 'js') accumulatedJs += line + '\n';
                }
            }

            accumulatedHtml = cleanCode(accumulatedHtml);
            accumulatedCss = cleanCode(accumulatedCss);
            accumulatedJs = cleanCode(accumulatedJs);

            updateProjectFn(project.id, {
                status: 'completed',
                html: accumulatedHtml,
                css: accumulatedCss,
                js: accumulatedJs,
            });

            setGenerationProgress(100);

        } catch (error) {
            console.error("Gemini Generation Failed:", error);
            updateProjectFn(project.id, { status: 'failed' });
            alert(`Error generating website: ${error.message}`);
        } finally {
            setIsGenerating(false);
            setTimeout(() => setGenerationProgress(0), 1000);
        }
    };

    const cleanCode = (code) => {
        return code
            .replace(/```html|```css|```javascript|```js|```/gi, '')
            .trim();
    };

    return (
        <AIContext.Provider value={{
            apiKey,
            setApiKey: updateApiKey,
            isGenerating,
            generationProgress,
            generateWebsiteStream,
            refactorCode,
            chatWithAI,
            modifyWebsiteWithPrompt, // New function for AI Agent
        }}>
            {children}
        </AIContext.Provider>
    );
};

export const useAI = () => {
    const context = useContext(AIContext);
    if (!context) {
        throw new Error('useAI must be used within an AIProvider');
    }
    return context;
};
// [file content end]