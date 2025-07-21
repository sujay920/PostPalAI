import React, { useState, useEffect } from 'react';
import { Copy, Check, Sparkles, Zap, RefreshCw, Image, Edit3, BarChart3, Sun, Moon } from 'lucide-react';

// Main App Component
export default function App() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [post, setPost] = useState('');
  const [elaborateInstructions, setElaborateInstructions] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [emojis, setEmojis] = useState('');
  const [critique, setCritique] = useState('');
  const [postThread, setPostThread] = useState([]);
  const [loading, setLoading] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [copied, setCopied] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [generatedImagePrompt, setGeneratedImagePrompt] = useState('');
  const [currentSection, setCurrentSection] = useState('input');
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  // Theme persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem('postpal-theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('postpal-theme', newTheme ? 'dark' : 'light');
  };

  const tones = [
    { value: 'Professional', emoji: '💼', preview: 'Formal, authoritative, business-focused', color: 'from-sky-500 to-blue-600' },
    { value: 'Casual', emoji: '😊', preview: 'Relaxed, conversational, approachable', color: 'from-emerald-500 to-teal-600' },
    { value: 'Inspirational', emoji: '✨', preview: 'Motivating, uplifting, encouraging', color: 'from-purple-500 to-violet-600' },
    { value: 'Story-telling', emoji: '📖', preview: 'Narrative-driven, engaging, personal', color: 'from-amber-500 to-orange-600' },
    { value: 'Witty', emoji: '😎', preview: 'Clever, humorous, entertaining', color: 'from-pink-500 to-rose-600' },
    { value: 'Thought-provoking', emoji: '🤔', preview: 'Deep, analytical, discussion-starting', color: 'from-indigo-500 to-purple-600' },
    { value: 'Technical', emoji: '⚙️', preview: 'Detailed, precise, expert-level', color: 'from-slate-500 to-gray-600' },
    { value: 'Bold', emoji: '🔥', preview: 'Confident, assertive, attention-grabbing', color: 'from-red-500 to-pink-600' },
    { value: 'Friendly', emoji: '🤗', preview: 'Warm, welcoming, personable', color: 'from-yellow-500 to-amber-600' },
    { value: 'Authoritative', emoji: '👑', preview: 'Expert, commanding, influential', color: 'from-violet-500 to-purple-600' }
  ];

  const callGeminiAPI = async (prompt, loadingState) => {
    setLoading(loadingState);
    const apiKey = "AIzaSyDSU9YUQVoFPftARc4TpEI4uUilvPcMOcc";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    const maxRetries = 3;
    const baseDelay = 1000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.status === 503) {
          if (attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt);
            console.log(`Gemini API overloaded, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            setLoading(null);
            return "The AI service is currently overloaded. Please try again in a few moments.";
          }
        }

        if (!response.ok) {
          const errorBody = await response.text();
          console.error("API Error Response:", errorBody);
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content) {
          setLoading(null);
          return result.candidates[0].content.parts[0].text.trim();
        } else {
          console.error("Unexpected API response structure:", result);
          throw new Error('Could not extract content from API response.');
        }
      } catch (error) {
        if (attempt === maxRetries) {
          console.error("Error calling Gemini API:", error);
          setLoading(null);
          return `Error: ${error.message}. Please check the console for details.`;
        }
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`Network error, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  };

  const clearOutputs = () => {
    setHashtags('');
    setEmojis('');
    setCritique('');
    setPostThread([]);
    setCopied(null);
  };

  const typewriterEffect = async (text, setter) => {
    setIsTyping(true);
    setter('');
    const words = text.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setter(words.slice(0, i + 1).join(' '));
    }
    setIsTyping(false);
  };

  const generatePost = async () => {
    if (!topic) return;
    setPost('');
    clearOutputs();
    setCurrentSection('output');
    const prompt = `You are an expert LinkedIn content creator. Your response should be only the post content itself, with no introductory text like "Here is the post". You write in a ${tone} tone. The post should be well-structured, easy to read, and encourage interaction. Do not include hashtags. The topic is: "${topic}"`;
    const generatedPost = await callGeminiAPI(prompt, 'post');
    
    if (generatedPost && !generatedPost.startsWith('Error:')) {
      await typewriterEffect(generatedPost, setPost);
    } else {
      setPost(generatedPost);
    }
  };

  const generateHashtags = async () => {
    if (!post) return;
    const prompt = `You are a hashtag generator. Return only 5-7 relevant hashtags separated by spaces, like #tagone #tagtwo. Generate hashtags for this post:\n\n${post}`;
    const generatedHashtags = await callGeminiAPI(prompt, 'hashtags');
    setHashtags(generatedHashtags);
  };

  const generateEmojis = async () => {
    if (!post) return;
    const prompt = `You are an emoji suggestion assistant. Return only a short string of 3-5 relevant emojis. Suggest emojis for this post:\n\n${post}`;
    const generatedEmojis = await callGeminiAPI(prompt, 'emojis');
    setEmojis(generatedEmojis);
  };

  const refinePost = async () => {
    if (!post) return;
    clearOutputs();
    const prompt = `You are an expert editor. Refine the following post to make it more impactful, maintaining a ${tone} tone. Return only the refined post, with no introductory text. Refine this post:\n\n${post}`;
    const refinedPost = await callGeminiAPI(prompt, 'refine');
    if (refinedPost && !refinedPost.startsWith('Error:')) {
      await typewriterEffect(refinedPost, setPost);
    } else {
      setPost(refinedPost);
    }
  };

  const generateImagePrompt = async () => {
    if (!post) return;
    const prompt = `You are an expert visual content strategist. Based on the following LinkedIn post content, generate a concise, professional image prompt that would create a relevant, high-quality visual to accompany this post. The image should be professional, engaging, and suitable for LinkedIn. Return only the image prompt description, no explanations.

Post content:
${post}`;
    const generatedPrompt = await callGeminiAPI(prompt, 'imagePrompt');
    setGeneratedImagePrompt(generatedPrompt);
  };

  const critiquePost = async () => {
    if (!post) return;
    const prompt = `You are a LinkedIn growth expert. Analyze the post and provide 2-3 specific, actionable bullet points for improvement. Return only the critique. Critique this post:\n\n${post}`;
    const generatedCritique = await callGeminiAPI(prompt, 'critique');
    setCritique(generatedCritique);
  };

  const elaboratePost = async () => {
    if (!post) return;
    clearOutputs();
    
    let prompt;
    if (elaborateInstructions.trim()) {
      prompt = `You are an expert content strategist and editor. Take the following LinkedIn post and modify it based on these specific instructions: "${elaborateInstructions}"

Guidelines for modification:
- Follow the user's instructions precisely
- Maintain a ${tone} tone unless instructed otherwise
- Ensure factual accuracy and relevance
- Keep the content engaging and LinkedIn-appropriate
- Preserve the core message while incorporating requested changes
- Return only the modified post content, no explanations

Original post:
${post}`;
    } else {
      prompt = `You are an expert content strategist. Take the following post and elaborate on it by adding more details, examples, insights, and depth while maintaining the same ${tone} tone. Make it more comprehensive and valuable to readers. Return only the elaborated post content:\n\n${post}`;
    }
    
    const elaboratedPost = await callGeminiAPI(prompt, 'elaborate');
    if (elaboratedPost && !elaboratedPost.startsWith('Error:')) {
      await typewriterEffect(elaboratedPost, setPost);
    } else {
      setPost(elaboratedPost);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2500);
    }).catch(() => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(type);
        setTimeout(() => setCopied(null), 2500);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
      document.body.removeChild(textArea);
    });
  };

  const regeneratePost = async () => {
    if (!topic) return;
    await generatePost();
  };

  useEffect(() => {
    if (post) {
      setWordCount(post.split(/\s+/).filter(Boolean).length);
    } else {
      setWordCount(0);
    }
  }, [post]);

  const PremiumButton = ({ onClick, disabled, loadingState, children, icon, className = '', variant = 'secondary' }) => {
    const baseClasses = "group relative flex items-center justify-center gap-3 w-full px-8 py-5 rounded-2xl font-medium text-base transition-all duration-300 ease-out border disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden transform hover:scale-[1.02] active:scale-[0.98]";
    
    const darkVariants = {
      primary: `${baseClasses} bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-black border-0 shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/40 hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-500`,
      secondary: `${baseClasses} bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:border-yellow-400/30 backdrop-blur-xl hover:bg-white/10 hover:shadow-lg hover:shadow-yellow-500/20`,
      accent: `${baseClasses} bg-gradient-to-r from-amber-500 to-yellow-600 text-black border-0 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40`
    };

    const lightVariants = {
      primary: `${baseClasses} bg-gradient-to-r from-amber-600 via-yellow-700 to-amber-700 text-white border-0 shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/40 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-600`,
      secondary: `${baseClasses} bg-stone-100/80 border border-stone-300/50 text-stone-700 hover:text-stone-900 hover:border-amber-400/50 backdrop-blur-xl hover:bg-stone-200/80 hover:shadow-lg hover:shadow-amber-500/20`,
      accent: `${baseClasses} bg-gradient-to-r from-yellow-600 to-amber-700 text-white border-0 shadow-lg shadow-yellow-600/25 hover:shadow-xl hover:shadow-yellow-600/40`
    };

    const variants = isDarkMode ? darkVariants : lightVariants;

    return (
      <button
        onClick={onClick}
        disabled={loading}
        className={`${variants[variant]} ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
        <div className="relative z-10 flex items-center gap-3">
          {loading === loadingState ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="transform group-hover:scale-110 transition-transform duration-300">
                {icon}
              </span>
              {children}
            </>
          )}
        </div>
      </button>
    );
  };

  const OutputCard = ({ title, children, loadingState, content }) => {
    if (loading !== loadingState && !content) return null;
    
    const cardClasses = isDarkMode 
      ? "group p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/8 hover:border-white/20"
      : "group p-8 bg-stone-50/80 backdrop-blur-xl border border-stone-200/50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-stone-100/80 hover:border-stone-300/50";
    
    const titleClasses = isDarkMode 
      ? "font-semibold text-slate-300 mb-6 text-sm tracking-wider uppercase flex items-center gap-2"
      : "font-semibold text-stone-600 mb-6 text-sm tracking-wider uppercase flex items-center gap-2";

    return (
      <div className={cardClasses}>
        <h3 className={titleClasses}>
          <Sparkles className={`w-4 h-4 ${isDarkMode ? 'text-yellow-400' : 'text-amber-600'}`} />
          {title}
        </h3>
        {loading === loadingState ? (
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 border-2 ${isDarkMode ? 'border-yellow-400' : 'border-amber-600'} border-t-transparent rounded-full animate-spin`}></div>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>Generating...</p>
          </div>
        ) : children}
      </div>
    );
  };

  const ProgressBar = () => {
    if (!loading) return null;
    
    const progressClasses = isDarkMode
      ? "w-full bg-white/10 rounded-full h-2 backdrop-blur-sm"
      : "w-full bg-stone-300/50 rounded-full h-2 backdrop-blur-sm";
    
    const barClasses = isDarkMode
      ? "bg-gradient-to-r from-yellow-400 to-amber-500 h-2 rounded-full animate-pulse"
      : "bg-gradient-to-r from-amber-600 to-yellow-700 h-2 rounded-full animate-pulse";
    
    return (
      <div className="w-full mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-stone-600'}`}>Processing</span>
          <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>AI Working...</span>
        </div>
        <div className={progressClasses}>
          <div className={barClasses} style={{width: '70%'}}></div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        /* Dark Mode Background */
        .dark-premium-bg {
          background: linear-gradient(135deg, 
            #000000 0%,     /* Pure Black */
            #1a1a1a 25%,    /* Charcoal */
            #2d1b69 50%,    /* Deep Purple */
            #1a1a1a 75%,    /* Charcoal */
            #000000 100%    /* Pure Black */
          );
          background-size: 400% 400%;
          animation: darkGradientFlow 12s ease-in-out infinite;
        }
        
        /* Light Mode Background */
        .light-premium-bg {
          background: linear-gradient(135deg, 
            #f5f5f4 0%,     /* Stone 100 */
            #e7e5e4 25%,    /* Stone 200 */
            #d6d3d1 50%,    /* Stone 300 */
            #e7e5e4 75%,    /* Stone 200 */
            #f5f5f4 100%    /* Stone 100 */
          );
          background-size: 400% 400%;
          animation: lightGradientFlow 12s ease-in-out infinite;
        }
        
        @keyframes darkGradientFlow {
          0%, 100% { background-position: 0% 50%; }
          25% { background-position: 100% 50%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
        }
        
        @keyframes lightGradientFlow {
          0%, 100% { background-position: 0% 50%; }
          25% { background-position: 100% 50%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
        }
        
        /* Dark Mode Particles */
        .dark-particles::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(1px 1px at 20px 30px, rgba(255, 215, 0, 0.1), transparent),
            radial-gradient(1px 1px at 40px 70px, rgba(255, 193, 7, 0.08), transparent),
            radial-gradient(2px 2px at 90px 40px, rgba(251, 191, 36, 0.06), transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(255, 215, 0, 0.08), transparent),
            radial-gradient(2px 2px at 160px 30px, rgba(255, 193, 7, 0.05), transparent);
          background-repeat: repeat;
          background-size: 200px 120px;
          animation: particleFloat 20s infinite linear;
          pointer-events: none;
          z-index: 1;
        }
        
        /* Light Mode Particles */
        .light-particles::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(1px 1px at 20px 30px, rgba(180, 83, 9, 0.08), transparent),
            radial-gradient(1px 1px at 40px 70px, rgba(146, 64, 14, 0.06), transparent),
            radial-gradient(2px 2px at 90px 40px, rgba(217, 119, 6, 0.05), transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(180, 83, 9, 0.06), transparent),
            radial-gradient(2px 2px at 160px 30px, rgba(146, 64, 14, 0.04), transparent);
          background-repeat: repeat;
          background-size: 200px 120px;
          animation: particleFloat 20s infinite linear;
          pointer-events: none;
          z-index: 1;
        }
        
        @keyframes particleFloat {
          0% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-15px) translateX(8px); }
          50% { transform: translateY(-8px) translateX(-6px); }
          75% { transform: translateY(-12px) translateX(10px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        
        /* Dark Mode Glass */
        .dark-glass {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.08) 0%, 
            rgba(255, 255, 255, 0.04) 50%,
            rgba(255, 255, 255, 0.08) 100%);
          backdrop-filter: blur(20px) saturate(1.5);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            inset 0 -1px 0 rgba(255, 255, 255, 0.08);
        }
        
        /* Light Mode Glass */
        .light-glass {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.7) 0%, 
            rgba(255, 255, 255, 0.5) 50%,
            rgba(255, 255, 255, 0.7) 100%);
          backdrop-filter: blur(20px) saturate(1.2);
          border: 1px solid rgba(120, 113, 108, 0.2);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8),
            inset 0 -1px 0 rgba(255, 255, 255, 0.6);
        }
        
        /* Dark Mode Tone Cards */
        .dark-tone-card {
          background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.06) 0%,
            rgba(255, 255, 255, 0.03) 50%,
            rgba(255, 255, 255, 0.06) 100%);
          backdrop-filter: blur(16px) saturate(1.3);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .dark-tone-card:hover {
          transform: translateY(-2px) scale(1.01);
          border-color: rgba(255, 215, 0, 0.3);
          box-shadow: 
            0 8px 24px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(255, 215, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          background: linear-gradient(135deg,
            rgba(255, 215, 0, 0.08) 0%,
            rgba(255, 193, 7, 0.04) 50%,
            rgba(255, 215, 0, 0.08) 100%);
        }
        
        .dark-tone-card.selected {
          background: linear-gradient(135deg,
            rgba(255, 215, 0, 0.12) 0%,
            rgba(255, 193, 7, 0.08) 50%,
            rgba(255, 215, 0, 0.12) 100%);
          border-color: rgba(255, 215, 0, 0.4);
          box-shadow: 
            0 8px 24px rgba(0, 0, 0, 0.4),
            0 0 25px rgba(255, 215, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }
        
        /* Light Mode Tone Cards */
        .light-tone-card {
          background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 255, 255, 0.8) 100%);
          backdrop-filter: blur(16px) saturate(1.2);
          border: 1px solid rgba(120, 113, 108, 0.15);
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .light-tone-card:hover {
          transform: translateY(-2px) scale(1.01);
          border-color: rgba(180, 83, 9, 0.3);
          box-shadow: 
            0 8px 24px rgba(0, 0, 0, 0.12),
            0 0 20px rgba(180, 83, 9, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
          background: linear-gradient(135deg,
            rgba(180, 83, 9, 0.08) 0%,
            rgba(146, 64, 14, 0.04) 50%,
            rgba(180, 83, 9, 0.08) 100%);
        }
        
        .light-tone-card.selected {
          background: linear-gradient(135deg,
            rgba(180, 83, 9, 0.12) 0%,
            rgba(146, 64, 14, 0.08) 50%,
            rgba(180, 83, 9, 0.12) 100%);
          border-color: rgba(180, 83, 9, 0.4);
          box-shadow: 
            0 8px 24px rgba(0, 0, 0, 0.15),
            0 0 25px rgba(180, 83, 9, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }
        
        /* Theme Toggle Button */
        .theme-toggle {
          position: fixed;
          top: 2rem;
          right: 2rem;
          z-index: 50;
          padding: 0.75rem;
          border-radius: 1rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(16px);
        }
        
        .theme-toggle:hover {
          transform: scale(1.05);
        }
        
        /* Scrollbar Styling */
        .luxury-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .dark-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
        }
        
        .dark-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, 
            rgba(255, 215, 0, 0.6) 0%, 
            rgba(255, 193, 7, 0.4) 100%);
          border-radius: 2px;
        }
        
        .light-scrollbar::-webkit-scrollbar-track {
          background: rgba(120, 113, 108, 0.1);
          border-radius: 2px;
        }
        
        .light-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, 
            rgba(180, 83, 9, 0.6) 0%, 
            rgba(146, 64, 14, 0.4) 100%);
          border-radius: 2px;
        }
        
        /* Animations */
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInCenter {
          0% { opacity: 0; transform: translateX(-30px) scale(0.98); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-slide-in-center {
          animation: slideInCenter 0.8s ease-out;
        }
        
        /* Section Transitions */
        .section-transition {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .section-hidden {
          opacity: 0;
          transform: translateX(20px);
          pointer-events: none;
        }
        
        .section-visible {
          opacity: 1;
          transform: translateX(0);
          pointer-events: auto;
        }
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>
      
      <div className={`min-h-screen w-full ${isDarkMode ? 'dark-premium-bg text-slate-100 dark-particles' : 'light-premium-bg text-stone-800 light-particles'} p-8 flex items-center justify-center overflow-hidden relative`}>
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`theme-toggle ${isDarkMode 
            ? 'bg-white/10 border border-white/20 text-yellow-400 hover:bg-white/15 hover:border-yellow-400/30' 
            : 'bg-white/80 border border-stone-300/50 text-amber-700 hover:bg-white/90 hover:border-amber-600/40'
          }`}
        >
          {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>

        {/* Main Content */}
        <main className="w-full max-w-4xl mx-auto z-10 relative">
          <div className={`${isDarkMode ? 'dark-glass' : 'light-glass'} rounded-3xl p-12 animate-slide-in-center`}>
            
            {/* Header */}
            <header className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className={`p-4 ${isDarkMode ? 'bg-gradient-to-br from-yellow-500/20 to-amber-600/20' : 'bg-gradient-to-br from-amber-600/20 to-yellow-700/20'} rounded-2xl backdrop-blur-sm border ${isDarkMode ? 'border-white/10' : 'border-stone-300/30'}`}>
                  <Zap className={`w-10 h-10 ${isDarkMode ? 'text-yellow-400' : 'text-amber-700'}`} />
                </div>
                <h1 className={`text-6xl font-bold ${isDarkMode ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500' : 'bg-gradient-to-r from-amber-700 via-yellow-800 to-amber-800'} bg-clip-text text-transparent tracking-tight`}>
                  PostPal AI
                </h1>
              </div>
              <p className={`${isDarkMode ? 'text-slate-300' : 'text-stone-600'} text-xl leading-relaxed font-medium max-w-2xl mx-auto`}>
                Craft Compelling LinkedIn Content, Instantly.
              </p>
            </header>

            {/* Progress Bar */}
            <ProgressBar />

            {/* Input Section */}
            <div className={`section-transition ${currentSection === 'input' ? 'section-visible' : 'section-hidden'}`}>
              <div className="space-y-8 mb-12">
                
                {/* Topic Input */}
                <div className="space-y-4">
                  <label htmlFor="topic" className={`block text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-stone-600'} tracking-wider uppercase flex items-center gap-2`}>
                    <Sparkles className={`w-4 h-4 ${isDarkMode ? 'text-yellow-400' : 'text-amber-600'}`} />
                    Content Topic
                  </label>
                  <input
                    id="topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Announcing a product launch, discussing industry trends, etc."
                    className={`w-full p-6 rounded-2xl ${isDarkMode 
                      ? 'bg-white/5 border border-white/10 focus:border-yellow-400/50 text-white placeholder-slate-400 hover:border-white/20 focus:shadow-yellow-500/20' 
                      : 'bg-white/70 border border-stone-300/50 focus:border-amber-500/50 text-stone-800 placeholder-stone-500 hover:border-stone-400/50 focus:shadow-amber-500/20'
                    } focus:outline-none transition-all duration-300 text-lg leading-relaxed backdrop-blur-xl shadow-lg focus:shadow-xl`}
                  />
                </div>

                {/* Tone Selection */}
                <div className="space-y-6">
                  <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-stone-600'} tracking-wider uppercase flex items-center gap-2`}>
                    <BarChart3 className={`w-4 h-4 ${isDarkMode ? 'text-amber-400' : 'text-yellow-700'}`} />
                    Tone Selection
                  </div>
                  <div className={`${isDarkMode ? 'dark-glass' : 'light-glass'} rounded-2xl p-8 border ${isDarkMode ? 'border-white/10' : 'border-stone-300/30'}`}>
                    <div className={`grid grid-cols-2 gap-4 max-h-80 overflow-y-auto luxury-scrollbar ${isDarkMode ? 'dark-scrollbar' : 'light-scrollbar'}`}>
                      {tones.map((toneOption) => (
                        <button
                          key={toneOption.value}
                          onClick={() => setTone(toneOption.value)}
                          className={`${isDarkMode ? 'dark-tone-card' : 'light-tone-card'} p-6 rounded-xl text-left group ${
                            tone === toneOption.value ? 'selected' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                              {toneOption.emoji}
                            </span>
                            <span className={`font-semibold text-base ${
                              tone === toneOption.value 
                                ? (isDarkMode ? 'text-yellow-200' : 'text-amber-800') 
                                : (isDarkMode ? 'text-slate-200' : 'text-stone-700')
                            }`}>
                              {toneOption.value}
                            </span>
                          </div>
                          <div className={`text-sm leading-relaxed ${
                            tone === toneOption.value 
                              ? (isDarkMode ? 'text-yellow-100/90' : 'text-amber-700/90') 
                              : (isDarkMode ? 'text-slate-400' : 'text-stone-500')
                          }`}>
                            {toneOption.preview}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <PremiumButton
                  onClick={generatePost}
                  disabled={!topic || loading}
                  loadingState="post"
                  icon={<Zap />}
                  variant="primary"
                  className="text-xl font-semibold py-6 mt-8"
                >
                  Generate Premium Content
                </PremiumButton>
              </div>
            </div>

            {/* Output Section */}
            <div className={`section-transition ${currentSection === 'output' && post ? 'section-visible' : 'section-hidden'}`}>
              {post && (
                <div className="space-y-8 animate-fade-in-up">
                  
                  {/* Generated Post */}
                  <div className="relative group">
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'bg-gradient-to-r from-yellow-400 to-amber-400' : 'bg-gradient-to-r from-amber-700 to-yellow-800'} bg-clip-text text-transparent tracking-tight mb-6 flex items-center gap-3`}>
                      <Sparkles className={`w-6 h-6 ${isDarkMode ? 'text-yellow-400' : 'text-amber-700'}`} />
                      Generated Content
                    </h2>
                    
                    <textarea
                      value={post}
                      onChange={(e) => setPost(e.target.value)}
                      rows={12}
                      className={`w-full p-8 rounded-2xl ${isDarkMode 
                        ? 'bg-white/5 border border-white/10 focus:border-yellow-400/50 text-slate-200 hover:bg-white/8' 
                        : 'bg-white/70 border border-stone-300/50 focus:border-amber-500/50 text-stone-800 hover:bg-white/80'
                      } focus:outline-none transition-all duration-300 resize-y text-lg leading-relaxed backdrop-blur-xl shadow-xl`}
                    />
                    
                    <div className={`absolute bottom-6 right-6 flex items-center gap-4 text-sm ${isDarkMode ? 'text-slate-300 bg-black/50' : 'text-stone-600 bg-white/80'} backdrop-blur-sm px-6 py-3 rounded-xl border ${isDarkMode ? 'border-white/10' : 'border-stone-300/30'}`}>
                      <span className="font-medium flex items-center gap-2">
                        <span className={`w-2 h-2 ${isDarkMode ? 'bg-yellow-400' : 'bg-amber-600'} rounded-full`}></span>
                        {wordCount} words
                      </span>
                      <button 
                        onClick={() => copyToClipboard(post, 'post')} 
                        className={`flex items-center gap-2 ${isDarkMode ? 'hover:text-white' : 'hover:text-stone-800'} transition-all duration-300 hover:scale-105 px-3 py-1 rounded-lg ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-stone-200/50'}`}
                      >
                        {copied === 'post' ? 
                          <Check className={`w-4 h-4 ${isDarkMode ? 'text-yellow-400' : 'text-amber-600'}`} /> : 
                          <Copy className="w-4 h-4" />
                        }
                        <span className="font-medium">
                          {copied === 'post' ? 'Copied!' : 'Copy'}
                        </span>
                      </button>
                      <button 
                        onClick={regeneratePost}
                        disabled={loading || !topic}
                        className={`flex items-center gap-2 ${isDarkMode ? 'hover:text-white' : 'hover:text-stone-800'} transition-all duration-300 hover:scale-105 px-3 py-1 rounded-lg ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-stone-200/50'} disabled:opacity-50`}
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span className="font-medium">Regenerate</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Image Prompt Section */}
                  <div className={`space-y-4 p-8 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-stone-50/80 border-stone-200/50'} border rounded-2xl backdrop-blur-xl transition-all duration-300 ${isDarkMode ? 'hover:bg-white/8 hover:border-amber-400/30' : 'hover:bg-stone-100/80 hover:border-amber-500/30'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <Image className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-yellow-700'}`} />
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-200' : 'text-stone-700'}`}>AI Visual Prompt</h3>
                    </div>
                    
                    <textarea
                      value={generatedImagePrompt}
                      onChange={(e) => setGeneratedImagePrompt(e.target.value)}
                      placeholder="AI will generate a professional image prompt based on your content..."
                      rows={3}
                      className={`w-full p-6 rounded-2xl ${isDarkMode 
                        ? 'bg-black/30 border border-white/10 focus:border-amber-400/50 text-white placeholder-slate-400 hover:border-amber-400/30' 
                        : 'bg-white/60 border border-stone-300/50 focus:border-yellow-600/50 text-stone-800 placeholder-stone-500 hover:border-yellow-600/30'
                      } focus:outline-none transition-all duration-300 text-lg leading-relaxed backdrop-blur-xl resize-none`}
                    />
                    
                    <PremiumButton
                      onClick={generateImagePrompt}
                      disabled={loading}
                      loadingState="imagePrompt"
                      icon={<Sparkles />}
                      variant="accent"
                    >
                      Generate Visual Prompt
                    </PremiumButton>
                  </div>

                  {/* Action Buttons Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <PremiumButton onClick={refinePost} loadingState="refine" icon={<Edit3 />}>
                      Refine Content
                    </PremiumButton>
                    <PremiumButton onClick={generateHashtags} loadingState="hashtags" icon={<Sparkles />}>
                      Generate Hashtags
                    </PremiumButton>
                    <PremiumButton onClick={generateEmojis} loadingState="emojis" icon={<Sparkles />}>
                      Suggest Emojis
                    </PremiumButton>
                    <PremiumButton onClick={critiquePost} loadingState="critique" icon={<BarChart3 />}>
                      AI Critique
                    </PremiumButton>
                  </div>

                  {/* Customize Content Section */}
                  <div className={`space-y-6 p-8 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-stone-50/80 border-stone-200/50'} border rounded-2xl backdrop-blur-xl transition-all duration-300 ${isDarkMode ? 'hover:bg-white/8 hover:border-amber-400/30' : 'hover:bg-stone-100/80 hover:border-amber-500/30'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <Edit3 className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-yellow-700'}`} />
                      <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-slate-200' : 'text-stone-700'}`}>Content Customization</h3>
                    </div>
                    
                    <textarea
                      value={elaborateInstructions}
                      onChange={(e) => setElaborateInstructions(e.target.value)}
                      placeholder="Describe how you'd like to modify your content (e.g., 'Make it more professional', 'Add statistics', 'Focus on benefits')..."
                      rows={4}
                      className={`w-full p-6 rounded-2xl ${isDarkMode 
                        ? 'bg-black/30 border border-white/10 focus:border-amber-400/50 text-slate-200 placeholder-slate-400' 
                        : 'bg-white/60 border border-stone-300/50 focus:border-yellow-600/50 text-stone-800 placeholder-stone-500'
                      } focus:outline-none transition-all duration-300 resize-none backdrop-blur-sm`}
                    />
                    
                    <PremiumButton 
                      onClick={elaboratePost} 
                      loadingState="elaborate" 
                      icon={<Sparkles />} 
                      variant="accent"
                      disabled={!post}
                    >
                      {elaborateInstructions.trim() ? 'Apply Customization' : 'Elaborate Content'}
                    </PremiumButton>
                  </div>

                  {/* Output Cards */}
                  <div className="space-y-6">
                    <OutputCard title="Suggested Hashtags" loadingState="hashtags" content={hashtags}>
                      <div className="relative group">
                        <p className={`${isDarkMode ? 'text-yellow-400 bg-black/30' : 'text-amber-700 bg-white/60'} font-mono text-base leading-relaxed pr-16 p-6 rounded-xl border ${isDarkMode ? 'border-white/10' : 'border-stone-300/30'}`}>{hashtags}</p>
                        <button 
                          onClick={() => copyToClipboard(hashtags, 'hashtags')} 
                          className={`absolute top-4 right-4 flex items-center gap-2 text-xs ${isDarkMode ? 'text-slate-400 hover:text-white bg-black/50' : 'text-stone-500 hover:text-stone-800 bg-white/70'} transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg`}
                        >
                          {copied === 'hashtags' ? <Check className={`w-4 h-4 ${isDarkMode ? 'text-yellow-400' : 'text-amber-600'}`} /> : <Copy className="w-4 h-4" />}
                          <span className="font-medium">Copy</span>
                        </button>
                      </div>
                    </OutputCard>
                    
                    <OutputCard title="Suggested Emojis" loadingState="emojis" content={emojis}>
                      <div className={`text-4xl ${isDarkMode ? 'bg-black/30' : 'bg-white/60'} p-8 rounded-xl text-center border ${isDarkMode ? 'border-white/10' : 'border-stone-300/30'}`}>{emojis}</div>
                    </OutputCard>

                    <OutputCard title="AI Content Analysis" loadingState="critique" content={critique}>
                      <div className={`${isDarkMode ? 'bg-black/30' : 'bg-white/60'} p-8 rounded-xl border ${isDarkMode ? 'border-white/10' : 'border-stone-300/30'}`}>
                        <p className={`${isDarkMode ? 'text-slate-300' : 'text-stone-700'} whitespace-pre-wrap text-base leading-relaxed`}>{critique}</p>
                      </div>
                    </OutputCard>
                  </div>

                  {/* Back to Input Button */}
                  <div className="text-center pt-8">
                    <PremiumButton
                      onClick={() => setCurrentSection('input')}
                      icon={<RefreshCw />}
                      variant="secondary"
                      className="max-w-md mx-auto"
                    >
                      Create New Content
                    </PremiumButton>
                  </div>
                </div>
              )}
            </div>

            {/* Loading State for Initial Generation */}
            {loading === 'post' && !post && (
              <div className="flex flex-col items-center justify-center h-96 animate-fade-in-up">
                <div className="relative mb-8">
                  <div className={`w-20 h-20 border-4 ${isDarkMode ? 'border-slate-600 border-t-yellow-500' : 'border-stone-300 border-t-amber-600'} rounded-full animate-spin`}></div>
                  <div className={`absolute inset-0 w-20 h-20 border-4 border-transparent ${isDarkMode ? 'border-t-amber-500' : 'border-t-yellow-700'} rounded-full animate-spin`} style={{ animationDelay: '0.15s', animationDuration: '1.5s' }}></div>
                </div>
                <p className={`${isDarkMode ? 'text-slate-300' : 'text-stone-600'} text-2xl font-medium mb-4`}>Crafting Premium Content</p>
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-stone-500'} text-lg`}>Our AI is analyzing your topic and tone...</p>
                <div className="mt-6 flex gap-2">
                  <div className={`w-3 h-3 ${isDarkMode ? 'bg-yellow-500' : 'bg-amber-600'} rounded-full animate-pulse`}></div>
                  <div className={`w-3 h-3 ${isDarkMode ? 'bg-amber-500' : 'bg-yellow-700'} rounded-full animate-pulse`} style={{ animationDelay: '0.2s' }}></div>
                  <div className={`w-3 h-3 ${isDarkMode ? 'bg-yellow-600' : 'bg-amber-800'} rounded-full animate-pulse`} style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!post && loading !== 'post' && currentSection === 'input' && (
              <div className="text-center py-16 animate-fade-in-up">
                <div className={`p-12 ${isDarkMode ? 'bg-white/5' : 'bg-stone-100/80'} rounded-3xl mb-8 inline-block backdrop-blur-sm border ${isDarkMode ? 'border-white/10' : 'border-stone-300/30'}`}>
                  <Zap className={`w-24 h-24 ${isDarkMode ? 'text-slate-500' : 'text-stone-400'} mx-auto`} />
                </div>
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-stone-600'} text-xl font-medium`}>Ready to create premium LinkedIn content</p>
                <p className={`${isDarkMode ? 'text-slate-500' : 'text-stone-500'} text-lg mt-2`}>Enter your topic and select a tone to begin</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}