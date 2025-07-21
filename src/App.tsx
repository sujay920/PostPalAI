import React, { useState, useEffect } from 'react';
import { Copy, Check, Sparkles, Zap, RefreshCw, Image, Edit3, BarChart3 } from 'lucide-react';

// Main App Component
export default function App() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [post, setPost] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
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
  const [currentSection, setCurrentSection] = useState('input'); // 'input', 'output', 'customize'

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

  const createThread = async () => {
    if (!post) return;
    const prompt = `You are a content strategist. Break the following content into a 3-part LinkedIn thread. Each part should be a complete post starting with a number (e.g., "1/3"). Use "---" as a separator between parts. Return only the thread parts. Create a thread from this content:\n\n${post}`;
    const generatedThread = await callGeminiAPI(prompt, 'thread');
    setPostThread(generatedThread.split('---').map(p => p.trim()));
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
    const baseClasses = "group relative flex items-center justify-center gap-3 w-full px-8 py-5 rounded-2xl font-medium text-base transition-all duration-500 ease-out border disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden transform hover:scale-[1.02] active:scale-[0.98]";
    
    const variants = {
      primary: `${baseClasses} bg-gradient-to-r from-sky-500 via-blue-500 to-purple-600 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:from-sky-400 hover:via-blue-400 hover:to-purple-500`,
      secondary: `${baseClasses} bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:border-white/20 backdrop-blur-xl hover:bg-white/10`,
      accent: `${baseClasses} bg-gradient-to-r from-purple-500 to-violet-600 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40`
    };

    return (
      <button
        onClick={onClick}
        disabled={loading}
        className={`${variants[variant]} ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
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
    return (
      <div className="group p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:bg-white/8 hover:border-white/20">
        <h3 className="font-semibold text-slate-300 mb-6 text-sm tracking-wider uppercase flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          {title}
        </h3>
        {loading === loadingState ? (
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Generating...</p>
          </div>
        ) : children}
      </div>
    );
  };

  const ProgressBar = () => {
    if (!loading) return null;
    
    return (
      <div className="w-full mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-300">Processing</span>
          <span className="text-sm text-slate-400">AI Working...</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-sky-400 to-purple-500 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        /* Ultra-Premium Deep Gradient Background */
        .ultra-premium-bg {
          background: linear-gradient(135deg, 
            #1a1a1a 0%,     /* Charcoal Black */
            #1e1b4b 25%,    /* Deep Indigo */
            #4c1d95 50%,    /* Soft Violet */
            #1e1b4b 75%,    /* Deep Indigo */
            #1a1a1a 100%    /* Charcoal Black */
          );
          background-size: 400% 400%;
          animation: luxuryGradientFlow 15s ease-in-out infinite;
        }
        
        @keyframes luxuryGradientFlow {
          0%, 100% { background-position: 0% 50%; }
          25% { background-position: 100% 50%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
        }
        
        /* Sophisticated Light Streaks */
        .luxury-particles::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(1px 1px at 20px 30px, rgba(14, 165, 233, 0.15), transparent),
            radial-gradient(1px 1px at 40px 70px, rgba(168, 85, 247, 0.12), transparent),
            radial-gradient(2px 2px at 90px 40px, rgba(251, 191, 36, 0.08), transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(14, 165, 233, 0.1), transparent),
            radial-gradient(2px 2px at 160px 30px, rgba(168, 85, 247, 0.06), transparent);
          background-repeat: repeat;
          background-size: 200px 120px;
          animation: luxuryParticleFloat 25s infinite linear;
          pointer-events: none;
          z-index: 1;
        }
        
        @keyframes luxuryParticleFloat {
          0% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-8px); }
          75% { transform: translateY(-15px) translateX(12px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        
        /* Premium Glass Morphism */
        .luxury-glass {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.1) 0%, 
            rgba(255, 255, 255, 0.05) 50%,
            rgba(255, 255, 255, 0.1) 100%);
          backdrop-filter: blur(24px) saturate(1.8);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(255, 255, 255, 0.1);
        }
        
        /* Ultra-Premium Tone Cards */
        .luxury-tone-card {
          background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.08) 0%,
            rgba(255, 255, 255, 0.04) 50%,
            rgba(255, 255, 255, 0.08) 100%);
          backdrop-filter: blur(20px) saturate(1.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .luxury-tone-card:hover {
          transform: translateY(-3px) scale(1.02);
          border-color: rgba(14, 165, 233, 0.4);
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.3),
            0 0 30px rgba(14, 165, 233, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
          background: linear-gradient(135deg,
            rgba(14, 165, 233, 0.1) 0%,
            rgba(168, 85, 247, 0.05) 50%,
            rgba(14, 165, 233, 0.1) 100%);
        }
        
        .luxury-tone-card.selected {
          background: linear-gradient(135deg,
            rgba(14, 165, 233, 0.15) 0%,
            rgba(168, 85, 247, 0.1) 50%,
            rgba(14, 165, 233, 0.15) 100%);
          border-color: rgba(14, 165, 233, 0.6);
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.4),
            0 0 40px rgba(14, 165, 233, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }
        
        /* Luxury Scrollbar */
        .luxury-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .luxury-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
        }
        
        .luxury-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, 
            rgba(14, 165, 233, 0.8) 0%, 
            rgba(168, 85, 247, 0.6) 100%);
          border-radius: 2px;
        }
        
        .luxury-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, 
            rgba(14, 165, 233, 1) 0%, 
            rgba(168, 85, 247, 0.8) 100%);
        }
        
        /* Smooth Animations */
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInCenter {
          0% { opacity: 0; transform: translateX(-50px) scale(0.95); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        
        @keyframes luxuryGlow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(14, 165, 233, 0.3), 0 0 40px rgba(168, 85, 247, 0.2);
          }
          50% { 
            box-shadow: 0 0 40px rgba(14, 165, 233, 0.5), 0 0 80px rgba(168, 85, 247, 0.3);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .animate-slide-in-center {
          animation: slideInCenter 1s ease-out;
        }
        
        .luxury-glow-hover:hover {
          animation: luxuryGlow 2s infinite;
        }
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        /* Section Transition Effects */
        .section-transition {
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .section-hidden {
          opacity: 0;
          transform: translateX(30px);
          pointer-events: none;
        }
        
        .section-visible {
          opacity: 1;
          transform: translateX(0);
          pointer-events: auto;
        }
      `}</style>
      
      <div className="min-h-screen w-full ultra-premium-bg text-slate-100 p-8 flex items-center justify-center overflow-hidden relative luxury-particles">
        
        {/* Single Centered Glass Card */}
        <main className="w-full max-w-4xl mx-auto z-10 relative">
          <div className="luxury-glass rounded-3xl p-12 animate-slide-in-center">
            
            {/* Header */}
            <header className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-sky-500/20 to-purple-600/20 rounded-2xl backdrop-blur-sm border border-white/10">
                  <Zap className="w-10 h-10 text-sky-400" />
                </div>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-sky-400 via-purple-400 to-violet-400 bg-clip-text text-transparent tracking-tight">
                  PostPal AI
                </h1>
              </div>
              <p className="text-slate-300 text-xl leading-relaxed font-medium max-w-2xl mx-auto">
                Enterprise-Grade LinkedIn Content Generation Platform
              </p>
            </header>

            {/* Progress Bar */}
            <ProgressBar />

            {/* Input Section */}
            <div className={`section-transition ${currentSection === 'input' ? 'section-visible' : 'section-hidden'}`}>
              <div className="space-y-8 mb-12">
                
                {/* Topic Input */}
                <div className="space-y-4">
                  <label htmlFor="topic" className="block text-sm font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    Content Topic
                  </label>
                  <input
                    id="topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Describe your LinkedIn post topic or key message..."
                    className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 focus:border-sky-400/50 focus:outline-none transition-all duration-500 text-lg leading-relaxed backdrop-blur-xl placeholder-slate-400 hover:border-white/20 shadow-lg focus:shadow-xl focus:shadow-sky-500/20"
                  />
                </div>

                {/* Tone Selection */}
                <div className="space-y-6">
                  <div className="text-sm font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    Content Tone
                  </div>
                  <div className="luxury-glass rounded-2xl p-8 border border-white/10">
                    <div className="grid grid-cols-2 gap-4 max-h-80 overflow-y-auto luxury-scrollbar">
                      {tones.map((toneOption) => (
                        <button
                          key={toneOption.value}
                          onClick={() => setTone(toneOption.value)}
                          className={`luxury-tone-card p-6 rounded-xl text-left group ${
                            tone === toneOption.value ? 'selected' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                              {toneOption.emoji}
                            </span>
                            <span className={`font-semibold text-base ${
                              tone === toneOption.value ? 'text-sky-200' : 'text-slate-200'
                            }`}>
                              {toneOption.value}
                            </span>
                          </div>
                          <div className={`text-sm leading-relaxed ${
                            tone === toneOption.value ? 'text-sky-100/90' : 'text-slate-400'
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
                  className="luxury-glow-hover text-xl font-semibold py-6 mt-8"
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
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-purple-400 bg-clip-text text-transparent tracking-tight mb-6 flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-sky-400" />
                      Generated Content
                    </h2>
                    
                    <textarea
                      value={post}
                      onChange={(e) => setPost(e.target.value)}
                      rows={12}
                      className="w-full p-8 rounded-2xl bg-white/5 border border-white/10 focus:border-sky-400/50 focus:outline-none transition-all duration-500 resize-y text-lg text-slate-200 leading-relaxed backdrop-blur-xl shadow-xl hover:bg-white/8"
                    />
                    
                    <div className="absolute bottom-6 right-6 flex items-center gap-4 text-sm text-slate-300 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/10">
                      <span className="font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-sky-400 rounded-full"></span>
                        {wordCount} words
                      </span>
                      <button 
                        onClick={() => copyToClipboard(post, 'post')} 
                        className="flex items-center gap-2 hover:text-white transition-all duration-300 hover:scale-105 px-3 py-1 rounded-lg hover:bg-white/10"
                      >
                        {copied === 'post' ? 
                          <Check className="w-4 h-4 text-sky-400" /> : 
                          <Copy className="w-4 h-4" />
                        }
                        <span className="font-medium">
                          {copied === 'post' ? 'Copied!' : 'Copy'}
                        </span>
                      </button>
                      <button 
                        onClick={regeneratePost}
                        disabled={loading || !topic}
                        className="flex items-center gap-2 hover:text-white transition-all duration-300 hover:scale-105 px-3 py-1 rounded-lg hover:bg-white/10 disabled:opacity-50"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span className="font-medium">Regenerate</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Image Prompt Section */}
                  <div className="space-y-4 p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl transition-all duration-500 hover:bg-white/8 hover:border-purple-400/30">
                    <div className="flex items-center gap-3 mb-4">
                      <Image className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-slate-200">AI Visual Prompt</h3>
                    </div>
                    
                    <textarea
                      value={generatedImagePrompt || imagePrompt}
                      onChange={(e) => {
                        if (generatedImagePrompt) {
                          setGeneratedImagePrompt(e.target.value);
                        } else {
                          setImagePrompt(e.target.value);
                        }
                      }}
                      placeholder="AI will generate a professional image prompt based on your content..."
                      rows={3}
                      className="w-full p-6 rounded-2xl bg-black/30 border border-white/10 focus:border-purple-400/50 focus:outline-none transition-all duration-500 text-lg leading-relaxed backdrop-blur-xl placeholder-slate-400 hover:border-purple-400/30 resize-none"
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
                  <div className="space-y-6 p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl transition-all duration-500 hover:bg-white/8 hover:border-purple-400/30">
                    <div className="flex items-center gap-3 mb-4">
                      <Edit3 className="w-5 h-5 text-purple-400" />
                      <h3 className="text-xl font-semibold text-slate-200">Content Customization</h3>
                    </div>
                    
                    <textarea
                      value={elaborateInstructions}
                      onChange={(e) => setElaborateInstructions(e.target.value)}
                      placeholder="Describe how you'd like to modify your content (e.g., 'Make it more professional', 'Add statistics', 'Focus on benefits')..."
                      rows={4}
                      className="w-full p-6 rounded-2xl bg-black/30 border border-white/10 focus:border-purple-400/50 focus:outline-none transition-all duration-500 text-slate-200 placeholder-slate-400 resize-none backdrop-blur-sm"
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
                        <p className="text-sky-400 font-mono text-base leading-relaxed pr-16 bg-black/30 p-6 rounded-xl border border-white/10">{hashtags}</p>
                        <button 
                          onClick={() => copyToClipboard(hashtags, 'hashtags')} 
                          className="absolute top-4 right-4 flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-all duration-300 hover:scale-105 bg-black/50 px-3 py-2 rounded-lg"
                        >
                          {copied === 'hashtags' ? <Check className="w-4 h-4 text-sky-400" /> : <Copy className="w-4 h-4" />}
                          <span className="font-medium">Copy</span>
                        </button>
                      </div>
                    </OutputCard>
                    
                    <OutputCard title="Suggested Emojis" loadingState="emojis" content={emojis}>
                      <div className="text-4xl bg-black/30 p-8 rounded-xl text-center border border-white/10">{emojis}</div>
                    </OutputCard>

                    <OutputCard title="AI Content Analysis" loadingState="critique" content={critique}>
                      <div className="bg-black/30 p-8 rounded-xl border border-white/10">
                        <p className="text-slate-300 whitespace-pre-wrap text-base leading-relaxed">{critique}</p>
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
                  <div className="w-20 h-20 border-4 border-slate-600 border-t-sky-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDelay: '0.15s', animationDuration: '1.5s' }}></div>
                </div>
                <p className="text-slate-300 text-2xl font-medium mb-4">Crafting Premium Content</p>
                <p className="text-slate-400 text-lg">Our AI is analyzing your topic and tone...</p>
                <div className="mt-6 flex gap-2">
                  <div className="w-3 h-3 bg-sky-500 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!post && loading !== 'post' && currentSection === 'input' && (
              <div className="text-center py-16 animate-fade-in-up">
                <div className="p-12 bg-white/5 rounded-3xl mb-8 inline-block backdrop-blur-sm border border-white/10">
                  <Zap className="w-24 h-24 text-slate-500 mx-auto" />
                </div>
                <p className="text-slate-400 text-xl font-medium">Ready to create premium LinkedIn content</p>
                <p className="text-slate-500 text-lg mt-2">Enter your topic and select a tone to begin</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}