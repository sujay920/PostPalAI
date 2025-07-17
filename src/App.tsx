import React, { useState, useEffect } from 'react';

// Helper component for icons
const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d={path} />
  </svg>
);

// Icon components
const WandIcon = () => <Icon path="M9.5 2c-1.82 0-3.53.5-5 1.35 2.97 1.73 5 4.85 5 8.65s-2.03 6.92-5 8.65c1.47.85 3.18 1.35 5 1.35 5.52 0 10-4.48 10-10S15.02 2 9.5 2zm0 16c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm10.5-8c0 1.3-.29 2.52-.79 3.65l1.48 1.48c.39.39.39 1.02 0 1.41-.39.39-1.02.39-1.41 0l-1.48-1.48C16.52 17.71 15.3 18 14 18c-1.82 0-3.53-.5-5-1.35 2.97-1.73 5-4.85 5-8.65s-2.03-6.92-5-8.65C10.47 2.5 12.18 2 14 2c5.52 0 10 4.48 10 10z" />;
const CopyIcon = () => <Icon path="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />;
const CheckIcon = () => <Icon path="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />;
const HashIcon = () => <Icon path="M10 9h4V7h-4v2zm-2 2h4V9h-4v2zm2 2h4v-2h-4v2zm-5 2h2v-2H5v2zm2-12h2V3H7v2zm8 0h2V3h-2v2zM7 17h2v-2H7v2zm8 0h2v-2h-2v2zm-2-2h4v-2h-4v2z" />;
const EmojiIcon = () => <Icon path="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />;
const RefineIcon = () => <Icon path="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />;
const LightbulbIcon = () => <Icon path="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />;
const ThreadIcon = () => <Icon path="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />;
const ChevronDownIcon = () => <Icon path="M7 10l5 5 5-5z" className="w-5 h-5" />;
const ElaborateIcon = () => <Icon path="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.11 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-5.5-6L9 18l-1.5-2L9 14l3.5 2zm1.5-2h4v-1h-4v1zm0 2h4v-1h-4v1zm0 2h2v-1h-2v1z" />;

// Custom AI Generation Icon
const AIGenerateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12 6c-3.31 0-6 2.69-6 6 0 1.66.67 3.16 1.76 4.24l1.42-1.42C8.45 14.09 8 13.1 8 12c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.1-.45 2.09-1.18 2.82l1.42 1.42C17.33 15.16 18 13.66 18 12c0-3.31-2.69-6-6-6z"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

// Main App Component
export default function App() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [post, setPost] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [emojis, setEmojis] = useState('');
  const [critique, setCritique] = useState('');
  const [postThread, setPostThread] = useState([]);
  const [loading, setLoading] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [copied, setCopied] = useState(null);

  const tones = ['Professional', 'Casual', 'Inspirational', 'Story-telling', 'Witty', 'Thought-provoking', 'Technical'];

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
    const baseDelay = 1000; // 1 second

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
            const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
            console.log(`Gemini API overloaded, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
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
          return result.candidates[0].content.parts[0].text.trim();
        } else {
          console.error("Unexpected API response structure:", result);
          throw new Error('Could not extract content from API response.');
        }
      } catch (error) {
        if (attempt === maxRetries) {
          console.error("Error calling Gemini API:", error);
          return `Error: ${error.message}. Please check the console for details.`;
        }
        // If it's not the last attempt and it's a network error, retry
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`Network error, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    setLoading(null);
  };

  const clearOutputs = () => {
      setHashtags('');
      setEmojis('');
      setCritique('');
      setPostThread([]);
      setCopied(null);
  }

  const generatePost = async () => {
    if (!topic) return;
    setPost('');
    clearOutputs();
    const prompt = `You are an expert LinkedIn content creator. Your response should be only the post content itself, with no introductory text like "Here is the post". You write in a ${tone} tone. The post should be well-structured, easy to read, and encourage interaction. Do not include hashtags. The topic is: "${topic}"`;
    const generatedPost = await callGeminiAPI(prompt, 'post');
    setPost(generatedPost);
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
    setPost(refinedPost);
  };

  const critiquePost = async () => {
    if (!post) return;
    const prompt = `You are a LinkedIn growth expert. Analyze the post and provide 2-3 specific, actionable bullet points for improvement. Return only the critique. Critique this post:\n\n${post}`;
    const generatedCritique = await callGeminiAPI(prompt, 'critique');
    setCritique(generatedCritique);
  }

  const elaboratePost = async () => {
    if (!post) return;
    clearOutputs();
    const prompt = `You are an expert content strategist. Take the following post and elaborate on it by adding more details, examples, insights, and depth while maintaining the same ${tone} tone. Make it more comprehensive and valuable to readers. Return only the elaborated post content:\n\n${post}`;
    const elaboratedPost = await callGeminiAPI(prompt, 'elaborate');
    setPost(elaboratedPost);
  }

  const createThread = async () => {
    if (!post) return;
    const prompt = `You are a content strategist. Break the following content into a 3-part LinkedIn thread. Each part should be a complete post starting with a number (e.g., "1/3"). Use "---" as a separator between parts. Return only the thread parts. Create a thread from this content:\n\n${post}`;
    const generatedThread = await callGeminiAPI(prompt, 'thread');
    setPostThread(generatedThread.split('---').map(p => p.trim()));
  }

  const copyToClipboard = (text, type) => {
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
  };

  useEffect(() => {
    if (post) {
      setWordCount(post.split(/\s+/).filter(Boolean).length);
    } else {
      setWordCount(0);
    }
  }, [post]);

  const ActionButton = ({ onClick, disabled, loadingState, children, icon, className = '' }) => (
    <button
      onClick={onClick}
      disabled={loading}
      className={`group relative flex items-center justify-center gap-3 w-full px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 ease-out border disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden transform hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
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
    </button>
  );

  const OutputCard = ({ title, children, loadingState, content }) => {
      if (loading !== loadingState && !content) return null;
      return (
        <div className="group p-6 bg-gray-900/60 backdrop-blur-xl border border-gray-800/40 rounded-2xl shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1 animate-fade-in">
            <h3 className="font-semibold text-gray-400 mb-4 text-sm tracking-wider uppercase">{title}</h3>
            {loading === loadingState ? (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm">Generating...</p>
              </div>
            ) : children}
        </div>
      )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
        
        @keyframes gold-glow {
          0% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.4;
          }
          50% { 
            transform: translate(-40px, -40px) scale(1.3);
            opacity: 0.6;
          }
          100% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.4;
          }
        }
        
        @keyframes purple-glow {
          0% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          50% { 
            transform: translate(50px, -60px) scale(1.4);
            opacity: 0.5;
          }
          100% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes logo-hover {
          0% { text-shadow: 0 0 10px rgba(255, 215, 0, 0.3); }
          100% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.3); }
        }
        
        .glow-bg::before {
          content: '';
          position: fixed;
          left: -300px;
          top: -300px;
          width: 900px;
          height: 900px;
          background: radial-gradient(circle at center, 
            rgba(255, 215, 0, 0.5) 0%, 
            rgba(255, 193, 7, 0.4) 25%, 
            rgba(255, 152, 0, 0.3) 50%, 
            transparent 70%);
          filter: blur(140px);
          animation: gold-glow 20s infinite ease-in-out;
          z-index: 0;
          pointer-events: none;
        }
        
        .glow-bg::after {
          content: '';
          position: fixed;
          left: -250px;
          top: -450px;
          width: 700px;
          height: 700px;
          background: radial-gradient(circle at center, 
            rgba(147, 51, 234, 0.4) 0%, 
            rgba(126, 34, 206, 0.35) 25%, 
            rgba(107, 33, 168, 0.3) 50%, 
            transparent 70%);
          filter: blur(120px);
          animation: purple-glow 25s infinite ease-in-out;
          z-index: 0;
          pointer-events: none;
        }
        
        .glass-card {
          background: linear-gradient(135deg, 
            rgba(0, 0, 0, 0.95) 0%, 
            rgba(17, 17, 17, 0.9) 50%, 
            rgba(0, 0, 0, 0.95) 100%);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(64, 64, 64, 0.3);
          box-shadow: 
            0 25px 70px rgba(0, 0, 0, 0.7),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        .primary-button {
          background: linear-gradient(135deg, #B45309 0%, #D97706 25%, #F59E0B 75%, #FCD34D 100%);
          box-shadow: 
            0 10px 40px rgba(245, 158, 11, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        
        .primary-button:hover {
          background: linear-gradient(135deg, #92400E 0%, #B45309 25%, #D97706 75%, #F59E0B 100%);
          box-shadow: 
            0 15px 50px rgba(245, 158, 11, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }
        
        .secondary-button {
          background: linear-gradient(135deg, 
            rgba(0, 0, 0, 0.8) 0%, 
            rgba(31, 31, 31, 0.7) 100%);
          border: 1px solid rgba(147, 51, 234, 0.4);
          box-shadow: 
            0 8px 25px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        .secondary-button:hover {
          background: linear-gradient(135deg, 
            rgba(31, 31, 31, 0.9) 0%, 
            rgba(64, 64, 64, 0.8) 100%);
          box-shadow: 
            0 10px 30px rgba(147, 51, 234, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }
        
        .input-field {
          background: linear-gradient(135deg, 
            rgba(0, 0, 0, 0.9) 0%, 
            rgba(17, 17, 17, 0.8) 100%);
          border: 1px solid rgba(64, 64, 64, 0.4);
          backdrop-filter: blur(20px);
          box-shadow: 
            0 6px 20px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
        
        .input-field:focus {
          border-color: rgba(255, 215, 0, 0.6);
          box-shadow: 
            0 0 0 3px rgba(255, 215, 0, 0.2),
            0 10px 35px rgba(255, 215, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          background: linear-gradient(135deg, 
            rgba(0, 0, 0, 0.95) 0%, 
            rgba(17, 17, 17, 0.9) 100%);
        }
        
        .floating-icon {
          animation: float 6s infinite ease-in-out;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .accent-gradient {
          background: linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .logo-hover:hover {
          animation: logo-hover 0.3s ease-out forwards;
        }
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        h1, h2, h3 {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>
      
      <div className="min-h-screen w-full bg-black text-gray-100 p-6 sm:p-8 lg:p-10 flex items-center justify-center overflow-hidden relative glow-bg">
          <div className="fixed inset-0 bg-[radial-gradient(rgba(64,64,64,0.15)_1px,transparent_1px)] [background-size:50px_50px] [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)] z-0"></div>
          
          <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 z-10">
            {/* Left Panel: Controls */}
            <div className="space-y-8 p-10 sm:p-12 glass-card rounded-3xl relative group animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-purple-500/5 to-yellow-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <header className="relative z-10">
                <div className="flex items-center gap-5 mb-6">
                  <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-purple-500/20 rounded-2xl floating-icon">
                    <WandIcon className="w-8 h-8" />
                  </div>
                  <h1 className="text-5xl sm:text-6xl font-bold text-gradient tracking-tight logo-hover cursor-default">
                    PostPal AI
                  </h1>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed font-medium">
                  Craft Compelling LinkedIn Content, <span className="accent-gradient font-semibold">Instantly</span>.
                </p>
              </header>

              <div className="space-y-8 relative z-10">
                <div className="space-y-4">
                  <label htmlFor="topic" className="block text-sm font-semibold text-gray-300 tracking-wider uppercase">
                    Topic
                  </label>
                  <input
                    id="topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Announcing a product launch, discussing industry trends, sharing career insights"
                    className="w-full p-5 rounded-2xl input-field text-gray-100 placeholder-gray-500 focus:outline-none transition-all duration-300 text-lg leading-relaxed"
                  />
                </div>

                <div className="space-y-4">
                  <label htmlFor="tone" className="block text-sm font-semibold text-gray-300 tracking-wider uppercase">
                    Tone
                  </label>
                  <div className="relative">
                    <select
                      id="tone"
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full p-5 rounded-2xl input-field focus:outline-none transition-all duration-300 appearance-none cursor-pointer text-lg text-gray-100 pr-12"
                    >
                      {tones.map((t) => (
                        <option key={t} value={t} className="bg-gray-900 text-gray-100 py-3">{t}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                      <ChevronDownIcon className="text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
              
              <ActionButton
                onClick={generatePost}
                disabled={!topic || loading}
                loadingState="post"
                icon={<AIGenerateIcon />}
                className="primary-button text-white text-lg font-bold py-5 border-0"
              >
                Generate Post
              </ActionButton>
            </div>

            {/* Right Panel: Output */}
            <div className="space-y-8 p-10 sm:p-12 glass-card rounded-3xl relative group animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-l from-purple-500/5 via-yellow-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <h2 className="text-3xl font-bold text-gradient tracking-tight relative z-10">Generated Content</h2>
              
              {loading === 'post' && (
                <div className="flex flex-col items-center justify-center h-80 bg-gradient-to-br from-gray-900/40 to-gray-800/40 rounded-3xl border border-dashed border-gray-600/50 backdrop-blur-sm relative z-10">
                  <div className="relative">
                    <div className="w-14 h-14 border-4 border-gray-600 border-t-yellow-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-14 h-14 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDelay: '0.15s', animationDuration: '1.5s' }}></div>
                  </div>
                  <p className="mt-8 text-gray-400 text-xl font-medium">Generating your post...</p>
                  <div className="mt-4 flex gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}

              {!post && loading !== 'post' && (
                 <div className="flex flex-col items-center justify-center h-80 bg-gradient-to-br from-gray-900/30 to-gray-800/30 rounded-3xl border border-dashed border-gray-600/50 backdrop-blur-sm relative z-10 group">
                  <div className="p-8 bg-gradient-to-br from-gray-700/20 to-gray-800/20 rounded-3xl mb-6 floating-icon">
                    <AIGenerateIcon className="w-20 h-20 text-gray-600 group-hover:text-gray-500 transition-colors duration-300"/>
                  </div>
                  <p className="text-gray-500 text-xl font-medium">Your generated post will appear here.</p>
                </div>
              )}

              {post && (
                <div className="space-y-8 relative z-10 animate-fade-in">
                  <div className="relative group">
                    <textarea
                      value={post}
                      onChange={(e) => setPost(e.target.value)}
                      rows={14}
                      className="w-full p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-600/40 focus:border-yellow-500/50 focus:outline-none transition-all duration-300 resize-y text-lg text-gray-200 leading-relaxed backdrop-blur-xl shadow-xl"
                      style={{ 
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      }}
                    />
                     <div className="absolute bottom-6 right-6 flex items-center gap-8 text-sm text-gray-400 bg-gray-800/95 backdrop-blur-sm px-6 py-3 rounded-xl border border-gray-600/40">
                        <span className="font-medium">{wordCount} words</span>
                        <button 
                          onClick={() => copyToClipboard(post, 'post')} 
                          className="flex items-center gap-2 hover:text-gray-200 transition-all duration-200 hover:scale-105"
                        >
                          {copied === 'post' ? 
                            <CheckIcon className="w-4 h-4 text-yellow-400" /> : 
                            <CopyIcon className="w-4 h-4" />
                          }
                          <span className="font-medium">
                            {copied === 'post' ? 'Copied!' : 'Copy'}
                          </span>
                        </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <ActionButton onClick={refinePost} loadingState="refine" icon={<RefineIcon />} className="secondary-button text-gray-300 hover:text-white">Refine</ActionButton>
                      <ActionButton onClick={elaboratePost} loadingState="elaborate" icon={<ElaborateIcon />} className="secondary-button text-gray-300 hover:text-white">Elaborate</ActionButton>
                      <ActionButton onClick={generateHashtags} loadingState="hashtags" icon={<HashIcon />} className="secondary-button text-gray-300 hover:text-white">Hashtags</ActionButton>
                      <ActionButton onClick={generateEmojis} loadingState="emojis" icon={<EmojiIcon />} className="secondary-button text-gray-300 hover:text-white">Emojis</ActionButton>
                      <ActionButton onClick={critiquePost} loadingState="critique" icon={<LightbulbIcon />} className="secondary-button text-gray-300 hover:text-white">Critique</ActionButton>
                      <ActionButton onClick={createThread} loadingState="thread" icon={<ThreadIcon />} className="secondary-button text-gray-300 hover:text-white">Thread</ActionButton>
                  </div>

                  <div className="space-y-6">
                      <OutputCard title="Suggested Hashtags" loadingState="hashtags" content={hashtags}>
                         <div className="relative group">
                            <p className="text-yellow-400 font-mono text-base leading-relaxed pr-16 bg-gray-900/70 p-5 rounded-xl border border-gray-700/40">{hashtags}</p>
                            <button 
                              onClick={() => copyToClipboard(hashtags, 'hashtags')} 
                              className="absolute top-4 right-4 flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-all duration-200 hover:scale-105 bg-gray-800/90 px-3 py-2 rounded-lg"
                            >
                                {copied === 'hashtags' ? <CheckIcon className="w-4 h-4 text-yellow-400" /> : <CopyIcon className="w-4 h-4" />}
                                <span className="font-medium">Copy</span>
                            </button>
                        </div>
                      </OutputCard>
                      
                      <OutputCard title="Suggested Emojis" loadingState="emojis" content={emojis}>
                        <div className="text-4xl bg-gray-900/70 p-6 rounded-xl text-center">{emojis}</div>
                      </OutputCard>

                      <OutputCard title="AI Critique" loadingState="critique" content={critique}>
                        <div className="bg-gray-900/70 p-6 rounded-xl border border-gray-700/40">
                          <p className="text-gray-300 whitespace-pre-wrap text-base leading-relaxed">{critique}</p>
                        </div>
                      </OutputCard>

                      <OutputCard title="LinkedIn Thread" loadingState="thread" content={postThread.length > 0}>
                        <div className="space-y-5">
                            {postThread.map((threadPart, index) => (
                                <div key={index} className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700/40 p-6 rounded-2xl group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                    <div className="flex items-center gap-4 mb-4">
                                      <span className="bg-gradient-to-r from-yellow-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                                        {index + 1}/{postThread.length}
                                      </span>
                                    </div>
                                    <p className="text-gray-300 whitespace-pre-wrap text-base leading-relaxed pr-16">{threadPart}</p>
                                    <button 
                                      onClick={() => copyToClipboard(threadPart, `thread-${index}`)} 
                                      className="absolute top-5 right-5 flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-all duration-200 hover:scale-105 bg-gray-800/90 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100"
                                    >
                                        {copied === `thread-${index}` ? <CheckIcon className="w-4 h-4 text-yellow-400" /> : <CopyIcon className="w-4 h-4" />}
                                        <span className="font-medium">Copy</span>
                                    </button>
                                </div>
                            ))}
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