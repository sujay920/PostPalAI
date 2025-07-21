import React, { useState, useEffect } from 'react';
import { Copy, Check, Sparkles, Zap, RefreshCw, Image, Edit3 } from 'lucide-react';

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

  const tones = [
    { value: 'Professional', emoji: '💼', preview: 'Formal, authoritative, business-focused', color: 'from-blue-500 to-blue-600' },
    { value: 'Casual', emoji: '😊', preview: 'Relaxed, conversational, approachable', color: 'from-green-500 to-green-600' },
    { value: 'Inspirational', emoji: '✨', preview: 'Motivating, uplifting, encouraging', color: 'from-purple-500 to-purple-600' },
    { value: 'Story-telling', emoji: '📖', preview: 'Narrative-driven, engaging, personal', color: 'from-amber-500 to-amber-600' },
    { value: 'Witty', emoji: '😎', preview: 'Clever, humorous, entertaining', color: 'from-pink-500 to-pink-600' },
    { value: 'Thought-provoking', emoji: '🤔', preview: 'Deep, analytical, discussion-starting', color: 'from-indigo-500 to-indigo-600' },
    { value: 'Technical', emoji: '⚙️', preview: 'Detailed, precise, expert-level', color: 'from-gray-500 to-gray-600' },
    { value: 'Bold', emoji: '🔥', preview: 'Confident, assertive, attention-grabbing', color: 'from-red-500 to-red-600' },
    { value: 'Friendly', emoji: '🤗', preview: 'Warm, welcoming, personable', color: 'from-yellow-500 to-yellow-600' },
    { value: 'Authoritative', emoji: '👑', preview: 'Expert, commanding, influential', color: 'from-violet-500 to-violet-600' }
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
    const prompt = `You are an expert LinkedIn content creator. Your response should be only the post content itself, with no introductory text like "Here is the post". You write in a ${tone} tone. The post should be well-structured, easy to read, and encourage interaction. Do not include hashtags. The topic is: "${topic}"`;
    const generatedPost = await callGeminiAPI(prompt, 'post');
    
    if (generatedPost && !generatedPost.startsWith('Error:')) {
      await typewriterEffect(generatedPost, setPost);
      
      // Add to recent posts
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
      // Fallback for older browsers
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


  const ActionButton = ({ onClick, disabled, loadingState, children, icon, className = '', variant = 'secondary' }) => {
    const baseClasses = "group relative flex items-center justify-center gap-3 w-full px-6 py-4 rounded-2xl font-semibold text-base transition-all duration-300 ease-out border disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden transform hover:scale-[1.02] active:scale-[0.98]";
    
    const variants = {
      primary: `${baseClasses} bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-400 text-white border-0 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40`,
      secondary: `${baseClasses} bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-600/40 text-gray-300 hover:text-white hover:border-gray-500/60 backdrop-blur-xl`
    };

    return (
      <button
        onClick={onClick}
        disabled={loading}
        className={`${variants[variant]} ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
        <div className="relative z-10 flex items-center gap-3">
          {loading === loadingState ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="transform group-hover:scale-110 transition-transform duration-200">
                {icon}
              </span>
              {children}
            </>
          )}
        </div>
        {variant === 'primary' && (
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-yellow-600 opacity-0 group-active:opacity-20 transition-opacity duration-150 rounded-2xl"></div>
        )}
      </button>
    );
  };

  const OutputCard = ({ title, children, loadingState, content }) => {
    if (loading !== loadingState && !content) return null;
    return (
      <div className="group p-6 bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-xl border border-gray-700/40 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-fade-in">
        <h3 className="font-semibold text-gray-400 mb-4 text-sm tracking-wider uppercase flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {title}
        </h3>
        {loading === loadingState ? (
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm">Generating...</p>
          </div>
        ) : children}
      </div>
    );
  };

  const ScrollableToneSelector = () => {

    return (
      <div className="space-y-4">
        <div className="text-sm font-semibold text-yellow-300 tracking-wider uppercase flex items-center gap-2">
          <span className="text-lg">🎭</span>
          Tone Selection
        </div>
        <div className="premium-glass rounded-2xl p-6 border border-yellow-500/20">
          <div className="grid grid-cols-2 gap-4 max-h-72 overflow-y-auto premium-scrollbar">
            {tones.map((toneOption) => (
              <button
                key={toneOption.value}
                onClick={() => setTone(toneOption.value)}
                className={`premium-tone-card p-4 rounded-xl text-left group ${
                  tone === toneOption.value
                    ? 'selected'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                    {toneOption.emoji}
                  </span>
                  <span className={`font-semibold text-sm ${
                    tone === toneOption.value ? 'text-yellow-200' : 'text-gray-200'
                  }`}>
                    {toneOption.value}
                  </span>
                </div>
                <div className={`text-xs leading-relaxed ${
                  tone === toneOption.value ? 'text-yellow-100/90' : 'text-gray-400'
                }`}>
                  {toneOption.preview}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
        
        /* Premium Gold-Black Gradient Background */
        .premium-gradient-bg {
          background: linear-gradient(135deg, 
            #FFD700 0%,     /* Pure Gold */
            #FFC107 15%,    /* Amber Gold */
            #FF8F00 35%,    /* Deep Gold */
            #B8860B 55%,    /* Dark Goldenrod */
            #2C2C2C 75%,    /* Charcoal */
            #1A1A1A 90%,    /* Dark Gray */
            #000000 100%    /* Pure Black */
          );
          background-size: 200% 200%;
          animation: subtleGradientShift 12s ease-in-out infinite;
        }
        
        @keyframes subtleGradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        /* Minimal Elegant Particles */
        .elegant-particles::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(2px 2px at 25px 35px, rgba(255, 215, 0, 0.15), transparent),
            radial-gradient(1px 1px at 45px 75px, rgba(255, 193, 7, 0.12), transparent),
            radial-gradient(1px 1px at 95px 45px, rgba(255, 215, 0, 0.1), transparent),
            radial-gradient(2px 2px at 135px 85px, rgba(184, 134, 11, 0.08), transparent);
          background-repeat: repeat;
          background-size: 180px 100px;
          animation: elegantParticleFloat 30s infinite linear;
          pointer-events: none;
          z-index: 1;
        }
        
        @keyframes elegantParticleFloat {
          0% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-15px) translateX(8px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(-12px) translateX(10px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-left {
          0% { opacity: 0; transform: translateX(-50px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-right {
          0% { opacity: 0; transform: translateX(50px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(255, 165, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2);
            transform: translateY(0px);
          }
          50% { 
            box-shadow: 0 0 40px rgba(255, 165, 0, 0.7), 0 0 80px rgba(255, 215, 0, 0.4);
            transform: translateY(-2px);
          }
        }
        
        @keyframes button-press {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        
        @keyframes input-focus-glow {
          0% { box-shadow: 0 0 0 rgba(255, 165, 0, 0); }
          100% { box-shadow: 0 0 20px rgba(255, 165, 0, 0.3), 0 0 40px rgba(255, 215, 0, 0.1); }
        }
        
        @keyframes purple-glow-pulse {
          0%, 100% { 
            box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
            transform: translateY(0px);
          }
          50% { 
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.6), 0 0 50px rgba(139, 92, 246, 0.2);
            transform: translateY(-1px);
          }
        }
        
        /* Premium Glass Morphism */
        .premium-glass {
          background: linear-gradient(135deg, 
            rgba(0, 0, 0, 0.85) 0%, 
            rgba(20, 20, 20, 0.75) 30%,
            rgba(40, 40, 40, 0.65) 70%,
            rgba(0, 0, 0, 0.85) 100%);
          backdrop-filter: blur(24px) saturate(1.2);
          border: 1px solid rgba(255, 215, 0, 0.15);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 215, 0, 0.1);
        }
        
        /* Premium Tone Selection */
        .premium-tone-card {
          background: linear-gradient(135deg,
            rgba(0, 0, 0, 0.8) 0%,
            rgba(30, 30, 30, 0.7) 50%,
            rgba(0, 0, 0, 0.8) 100%);
          backdrop-filter: blur(16px);
          border: 1.5px solid rgba(255, 215, 0, 0.2);
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 215, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .premium-tone-card:hover {
          transform: translateY(-2px) scale(1.02);
          border-color: rgba(255, 215, 0, 0.4);
          box-shadow: 
            0 8px 24px rgba(0, 0, 0, 0.4),
            0 0 20px rgba(255, 215, 0, 0.15),
            inset 0 1px 0 rgba(255, 215, 0, 0.2);
        }
        
        .premium-tone-card.selected {
          background: linear-gradient(135deg,
            rgba(255, 215, 0, 0.15) 0%,
            rgba(255, 193, 7, 0.1) 50%,
            rgba(255, 215, 0, 0.15) 100%);
          border-color: rgba(255, 215, 0, 0.6);
          box-shadow: 
            0 8px 24px rgba(0, 0, 0, 0.4),
            0 0 30px rgba(255, 215, 0, 0.25),
            inset 0 1px 0 rgba(255, 215, 0, 0.3);
        }
        
        /* Premium Scrollbar */
        .premium-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .premium-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        
        .premium-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, 
            rgba(255, 215, 0, 0.6) 0%, 
            rgba(255, 193, 7, 0.4) 100%);
          border-radius: 3px;
        }
        
        .premium-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, 
            rgba(255, 215, 0, 0.8) 0%, 
            rgba(255, 193, 7, 0.6) 100%);
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 1s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 1s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out;
        }
        
        .floating-icon {
          animation: float 6s infinite ease-in-out;
        }
        
        .glow-on-hover:hover {
          animation: glow-pulse 2s infinite;
        }
        
        .enhanced-button-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .enhanced-button-hover:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 30px rgba(255, 165, 0, 0.4), 0 0 50px rgba(255, 215, 0, 0.2);
        }
        
        .enhanced-button-hover:active {
          animation: button-press 0.2s ease-out;
        }
        
        .enhanced-input-focus:focus {
          animation: input-focus-glow 0.3s ease-out forwards;
        }
        
        .purple-glow-hover:hover {
          animation: purple-glow-pulse 2s infinite;
          border-color: rgba(139, 92, 246, 0.6);
          transform: translateY(-2px) scale(1.01);
        }
        
        .typing-cursor::after {
          content: '|';
          animation: blink 1s infinite;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        h1, h2, h3 {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .ripple {
          position: relative;
          overflow: hidden;
        }
        
        .ripple::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        .ripple:active::before {
          width: 300px;
          height: 300px;
        }
      `}</style>
      
      <div className="min-h-screen w-full premium-gradient-bg text-gray-100 p-6 sm:p-8 lg:p-10 flex items-center justify-center overflow-hidden relative elegant-particles">
          
        <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 z-10 relative">
          {/* Left Panel: Controls */}
          <div className="space-y-8 p-10 sm:p-12 premium-glass rounded-3xl relative group animate-slide-in-left">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/3 via-amber-500/3 to-yellow-500/3 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <header className="relative z-10">
              <div className="flex items-center gap-5 mb-6">
                <div className="p-4 bg-gradient-to-br from-yellow-500/25 to-amber-600/25 rounded-2xl floating-icon animate-bounce-in border border-yellow-500/20">
                  <Zap className="w-8 h-8 text-yellow-400" />
                </div>
                <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent tracking-tight cursor-default">
                  PostPal AI
                </h1>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed font-medium animate-fade-in" style={{ animationDelay: '0.3s' }}>
                Craft Compelling LinkedIn Content, <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent font-semibold">Instantly</span>.
              </p>
            </header>

            <div className="space-y-8 relative z-10">
              <div className="space-y-4">
                <label htmlFor="topic" className="block text-sm font-semibold text-gray-300 tracking-wider uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Topic
                </label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Announcing a product launch, discussing industry trends, sharing career insights"
                  className="w-full p-5 rounded-2xl bg-gradient-to-br from-black/90 to-gray-900/80 border border-yellow-500/30 focus:border-yellow-500/60 focus:outline-none transition-all duration-400 text-lg leading-relaxed backdrop-blur-xl placeholder-gray-500 hover:border-yellow-500/40 shadow-lg"
                />
              </div>


              <ScrollableToneSelector />

            </div>
            
            <ActionButton
              onClick={generatePost}
              disabled={!topic || loading}
              loadingState="post"
              icon={<Zap />}
              variant="primary"
              className="ripple glow-on-hover enhanced-button-hover text-lg font-bold py-6"
            >
              Generate Post
            </ActionButton>
          </div>

          {/* Right Panel: Output */}
          <div className="space-y-8 p-10 sm:p-12 premium-glass rounded-3xl relative group animate-slide-in-right">
            <div className="absolute inset-0 bg-gradient-to-l from-amber-500/3 via-yellow-500/3 to-amber-500/3 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent tracking-tight relative z-10 flex items-center gap-3 animate-bounce-in">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              Generated Content
            </h2>
            
            {loading === 'post' && (
              <div className="flex flex-col items-center justify-center h-80 bg-gradient-to-br from-gray-900/40 to-gray-800/40 rounded-3xl border border-dashed border-gray-600/50 backdrop-blur-sm relative z-10 animate-fade-in">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-600 border-t-orange-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-yellow-500 rounded-full animate-spin" style={{ animationDelay: '0.15s', animationDuration: '1.5s' }}></div>
                </div>
                <p className="mt-8 text-gray-400 text-xl font-medium">Generating your post...</p>
                <div className="mt-4 flex gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 bg-orange-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}

            {!post && loading !== 'post' && (
               <div className="flex flex-col items-center justify-center h-80 bg-gradient-to-br from-gray-900/30 to-gray-800/30 rounded-3xl border border-dashed border-gray-600/50 backdrop-blur-sm relative z-10 group animate-fade-in">
                <div className="p-8 bg-gradient-to-br from-gray-700/20 to-gray-800/20 rounded-3xl mb-6 floating-icon">
                  <Zap className="w-20 h-20 text-gray-600 group-hover:text-gray-500 transition-colors duration-300"/>
                </div>
                <p className="text-gray-500 text-xl font-medium">Your generated post will appear here.</p>
              </div>
            )}

            {post && (
              <div className="space-y-8 relative z-10 animate-bounce-in">
                <div className="relative group">
                  <textarea
                    value={post}
                    onChange={(e) => setPost(e.target.value)}
                    rows={14}
                    className={`w-full p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-600/40 focus:border-orange-500/50 focus:outline-none transition-all duration-300 resize-y text-lg text-gray-200 leading-relaxed backdrop-blur-xl shadow-xl ${isTyping ? 'typing-cursor' : ''}`}
                    style={{ 
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                  />
                   <div className="absolute bottom-6 right-6 flex items-center gap-4 text-sm text-gray-400 bg-gray-800/95 backdrop-blur-sm px-6 py-3 rounded-xl border border-gray-600/40">
                      <span className="font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                        {wordCount} words
                      </span>
                      <button 
                        onClick={() => copyToClipboard(post, 'post')} 
                        className="flex items-center gap-2 hover:text-gray-200 transition-all duration-200 hover:scale-105 px-3 py-1 rounded-lg hover:bg-gray-700/50 enhanced-button-hover"
                      >
                        {copied === 'post' ? 
                          <Check className="w-4 h-4 text-orange-400" /> : 
                          <Copy className="w-4 h-4" />
                        }
                        <span className="font-medium">
                          {copied === 'post' ? 'Copied!' : 'Copy'}
                        </span>
                      </button>
                      <button 
                        onClick={regeneratePost}
                        disabled={loading || !topic}
                        className="flex items-center gap-2 hover:text-gray-200 transition-all duration-200 hover:scale-105 px-3 py-1 rounded-lg hover:bg-gray-700/50 disabled:opacity-50 enhanced-button-hover"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span className="font-medium">Regenerate</span>
                      </button>
                  </div>
                </div>

                {/* Generate Image Prompt Section - Below generated post */}
                <div className="space-y-4 p-6 bg-gradient-to-br from-black/95 to-gray-900/95 border border-gray-600/40 rounded-2xl backdrop-blur-xl purple-glow-hover transition-all duration-300 animate-fade-in">
                  <div className="flex items-center gap-3 mb-4">
                    <Image className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-gray-200">AI Image Prompt</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <textarea
                      value={generatedImagePrompt || imagePrompt}
                      onChange={(e) => {
                        if (generatedImagePrompt) {
                          setGeneratedImagePrompt(e.target.value);
                        } else {
                          setImagePrompt(e.target.value);
                        }
                      }}
                      placeholder="AI will generate an image prompt based on your post content, or you can write your own..."
                      rows={3}
                      className="w-full p-5 rounded-2xl bg-gradient-to-br from-black/90 to-gray-900/90 border border-gray-600/40 focus:border-purple-500/50 focus:outline-none transition-all duration-300 text-lg leading-relaxed backdrop-blur-xl placeholder-gray-400 hover:border-purple-400/60 purple-glow-hover resize-none enhanced-input-focus"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(17, 17, 17, 0.9) 50%, rgba(0, 0, 0, 0.95) 100%)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      }}
                    />
                  </div>
                  
                  <ActionButton
                    onClick={generateImagePrompt}
                    disabled={loading}
                    loadingState="imagePrompt"
                    icon={<Sparkles />}
                    className="purple-glow-hover enhanced-button-hover"
                  >
                    Generate AI Image Prompt
                  </ActionButton>
                </div>

                {/* Post Modification Section - Appears Below Generated Post */}
                <div className="space-y-4 p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-600/40 rounded-2xl backdrop-blur-xl purple-glow-hover transition-all duration-300 animate-fade-in enhanced-button-hover">
                  <div className="flex items-center gap-3 mb-4">
                    <Edit3 className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-gray-200">Customize Your Content</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Tell me how you'd like to modify your post:
                    </label>
                    <textarea
                      value={elaborateInstructions}
                      onChange={(e) => setElaborateInstructions(e.target.value)}
                      placeholder="e.g., 'Make this more professional and add statistics', 'Remove technical jargon and focus on benefits', 'Make it shorter and more engaging', 'Add a personal story', etc."
                      rows={3}
                      className="w-full p-4 rounded-xl bg-gray-900/60 border border-gray-600/40 focus:border-purple-500/50 focus:outline-none transition-all duration-300 text-gray-200 placeholder-gray-500 resize-none backdrop-blur-sm purple-glow-hover enhanced-input-focus"
                    />
                  </div>
                  
                  <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/40">
                    <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <span className="text-lg">💡</span>
                      Example Instructions:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
                      <div className="space-y-1">
                        <p>• "Make this more professional"</p>
                        <p>• "Add relevant statistics"</p>
                        <p>• "Include a call-to-action"</p>
                      </div>
                      <div className="space-y-1">
                        <p>• "Make it more conversational"</p>
                        <p>• "Focus on small businesses"</p>
                        <p>• "Add a personal anecdote"</p>
                      </div>
                    </div>
                  </div>
                  
                  <ActionButton 
                    onClick={elaboratePost} 
                    loadingState="elaborate" 
                    icon={<Sparkles />} 
                    variant="primary"
                    className="w-full ripple purple-glow-hover enhanced-button-hover"
                    disabled={!post}
                  >
                    {elaborateInstructions.trim() ? 'Apply Changes' : 'Elaborate Post'}
                  </ActionButton>
                </div>
                <div className="space-y-6">
                    <OutputCard title="Suggested Hashtags" loadingState="hashtags" content={hashtags}>
                       <div className="relative group">
                          <p className="text-orange-400 font-mono text-base leading-relaxed pr-16 bg-gray-900/70 p-5 rounded-xl border border-gray-700/40">{hashtags}</p>
                          <button 
                            onClick={() => copyToClipboard(hashtags, 'hashtags')} 
                            className="absolute top-4 right-4 flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-all duration-200 hover:scale-105 bg-gray-800/90 px-3 py-2 rounded-lg enhanced-button-hover"
                          >
                              {copied === 'hashtags' ? <Check className="w-4 h-4 text-orange-400" /> : <Copy className="w-4 h-4" />}
                              <span className="font-medium">Copy</span>
                          </button>
                      </div>
                    </OutputCard>
                    
                    <OutputCard title="Suggested Emojis" loadingState="emojis" content={emojis}>
                      <div className="text-4xl bg-gray-900/70 p-6 rounded-xl text-center border border-gray-700/40">{emojis}</div>
                    </OutputCard>

                    <OutputCard title="AI Critique" loadingState="critique" content={critique}>
                      <div className="bg-gray-900/70 p-6 rounded-xl border border-gray-700/40">
                        <p className="text-gray-300 whitespace-pre-wrap text-base leading-relaxed">{critique}</p>
                      </div>
                    </OutputCard>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}