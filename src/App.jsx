import React, { useState } from 'react';
import { Send, Mic, RotateCcw, Sparkles, MessageSquare, Moon, Sun, MicOff, Play, Pause, BarChart3, Download, TrendingUp, Award, Trash2 } from 'lucide-react';

export default function AIInterviewCoach() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI Interview Coach. I'll conduct a mock interview with you and provide feedback. What role are you preparing for? (e.g., Product Manager, Software Engineer, Designer)"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Feedback & Analytics states
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalSessions: 0,
    averageConfidence: 0,
    totalFillerWords: 0,
    commonWeaknesses: [],
    improvementTrend: []
  });

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Analyze for filler words and confidence
    const fillerWords = ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'literally'];
    const fillerCount = fillerWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return count + (userMessage.match(regex) || []).length;
    }, 0);
    
    const wordCount = userMessage.split(/\s+/).length;
    const confidenceScore = Math.max(0, Math.min(100, 100 - (fillerCount / wordCount * 100)));
    
    const userMsgWithAnalytics = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
      analytics: {
        fillerCount,
        wordCount,
        confidenceScore: confidenceScore.toFixed(1),
        responseTime: recordingTime || 0
      }
    };
    
    setMessages(prev => [...prev, userMsgWithAnalytics]);
    setIsLoading(true);

    try {
      // Build conversation history
      const conversationHistory = [
        {
          role: 'user',
          content: `You are an expert interview coach. Conduct a realistic mock interview for a ${role || 'professional'} position. Ask relevant behavioral and technical questions one at a time. After the candidate answers, provide constructive feedback on their response (strengths and areas for improvement), then ask the next question. Keep responses concise and professional. Make it feel like a real interview.`
        },
        ...messages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: 'user', content: userMessage }
      ];

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: conversationHistory
        })
      });

      const data = await response.json();
      const aiResponse = data.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse,
        timestamp: new Date().toISOString()
      }]);
      
      // Track role and questions
      if (!role && questionCount === 0) {
        setRole(userMessage);
        const sessionId = Date.now();
        setCurrentSessionId(sessionId);
      }
      setQuestionCount(prev => prev + 1);
      
      // Update analytics
      setAnalytics(prev => ({
        ...prev,
        totalFillerWords: prev.totalFillerWords + fillerCount
      }));
      
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
      setRecordingTime(0);
    }
  };

  // Voice Recording Functions with Web Speech API
  const [recognition, setRecognition] = React.useState(null);
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  
  React.useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const startRecording = async () => {
    try {
      // Start audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { 
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      // Start timer
      const startTime = Date.now();
      const timerInterval = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      
      // Store timer interval for cleanup
      recorder.timerInterval = timerInterval;
      
      // Start speech recognition
      if (recognition) {
        let interimTranscript = '';
        let finalTranscript = '';
        
        recognition.onresult = (event) => {
          interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          setInput(finalTranscript + interimTranscript);
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'no-speech') {
            console.log('No speech detected, continuing...');
          }
        };
        
        recognition.start();
        setIsTranscribing(true);
      }
      
    } catch (error) {
      console.error('Recording error:', error);
      if (error.name === 'NotAllowedError') {
        alert('Please allow microphone access to use voice recording. Check your browser settings.');
      } else if (error.name === 'NotFoundError') {
        alert('No microphone found. Please connect a microphone and try again.');
      } else {
        alert('Error starting recording: ' + error.message);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      // Stop timer
      if (mediaRecorder.timerInterval) {
        clearInterval(mediaRecorder.timerInterval);
      }
      
      // Stop recording
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Stop speech recognition
      if (recognition && isTranscribing) {
        recognition.stop();
        setIsTranscribing(false);
      }
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      setIsPlaying(true);
      audio.play();
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        alert('Error playing audio. Please try recording again.');
      };
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    if (!isRecording) {
      setInput('');
    }
  };

  const handleReset = () => {
    // Save current session before resetting
    if (messages.length > 1 && role) {
      const session = {
        id: currentSessionId || Date.now(),
        role,
        date: new Date().toISOString(),
        messages,
        analytics: {
          totalQuestions: Math.floor(questionCount / 2),
          averageConfidence: calculateAverageConfidence(),
          totalFillerWords: analytics.totalFillerWords,
          duration: messages.length > 0 ? 'Completed' : 'In Progress'
        }
      };
      
      setSessions(prev => [session, ...prev].slice(0, 10)); // Keep last 10 sessions
      
      // Update overall analytics
      setAnalytics(prev => ({
        totalSessions: prev.totalSessions + 1,
        averageConfidence: (prev.averageConfidence * prev.totalSessions + calculateAverageConfidence()) / (prev.totalSessions + 1),
        totalFillerWords: prev.totalFillerWords,
        commonWeaknesses: [...prev.commonWeaknesses],
        improvementTrend: [...prev.improvementTrend, { 
          date: new Date().toISOString(), 
          score: calculateAverageConfidence() 
        }]
      }));
    }
    
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm your AI Interview Coach. I'll conduct a mock interview with you and provide feedback. What role are you preparing for? (e.g., Product Manager, Software Engineer, Designer)"
      }
    ]);
    setInput('');
    setRole('');
    setQuestionCount(0);
    setCurrentSessionId(null);
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const calculateAverageConfidence = () => {
    const userMessages = messages.filter(msg => msg.role === 'user' && msg.analytics);
    if (userMessages.length === 0) return 0;
    const totalConfidence = userMessages.reduce((sum, msg) => sum + parseFloat(msg.analytics.confidenceScore), 0);
    return (totalConfidence / userMessages.length).toFixed(1);
  };

  const exportSessionReport = () => {
    const report = {
      role,
      date: new Date().toISOString(),
      questionsAsked: Math.floor(questionCount / 2),
      averageConfidence: calculateAverageConfidence(),
      totalFillerWords: analytics.totalFillerWords,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        analytics: m.analytics
      }))
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-session-${Date.now()}.json`;
    a.click();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    } p-4`}>
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${
          isDarkMode ? 'bg-purple-500' : 'bg-blue-400'
        }`} style={{ animationDuration: '4s' }}></div>
        <div className={`absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${
          isDarkMode ? 'bg-indigo-500' : 'bg-purple-400'
        }`} style={{ animationDuration: '6s' }}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 animate-pulse ${
          isDarkMode ? 'bg-pink-500' : 'bg-pink-300'
        }`} style={{ animationDuration: '5s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className={`rounded-t-2xl shadow-2xl p-6 border-b backdrop-blur-lg transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/90 border-gray-700' 
            : 'bg-white/90 border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-3 rounded-xl shadow-lg animate-pulse" style={{ animationDuration: '3s' }}>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  AI Interview Coach
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Practice interviews with real-time feedback
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={handleReset}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
          {role && (
            <div className="mt-4 flex gap-2 flex-wrap animate-fade-in">
              <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
                isDarkMode 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                Role: {role}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
                isDarkMode 
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                Questions: {Math.floor(questionCount / 2)}
              </span>
              {calculateAverageConfidence() > 0 && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-1 ${
                  isDarkMode 
                    ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  <Award className="w-3 h-3" />
                  Confidence: {calculateAverageConfidence()}%
                </span>
              )}
              {analytics.totalFillerWords > 0 && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
                  isDarkMode 
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-400/30' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  Fillers: {analytics.totalFillerWords}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Dashboard */}
        {showDashboard && (
          <div className={`shadow-2xl p-6 backdrop-blur-lg transition-all duration-300 animate-slide-in ${
            isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <TrendingUp className="w-5 h-5" />
                Performance Dashboard
              </h2>
              <button
                onClick={exportSessionReport}
                disabled={!role}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isDarkMode 
                    ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/30' 
                    : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                } disabled:opacity-50`}
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-xl border ${
                isDarkMode 
                  ? 'bg-blue-500/10 border-blue-400/20' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>Total Sessions</div>
                <div className={`text-3xl font-bold mt-1 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                  {analytics.totalSessions}
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${
                isDarkMode 
                  ? 'bg-green-500/10 border-green-400/20' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>Avg Confidence</div>
                <div className={`text-3xl font-bold mt-1 flex items-center gap-2 ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>
                  {analytics.averageConfidence.toFixed(1)}%
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${
                isDarkMode 
                  ? 'bg-orange-500/10 border-orange-400/20' 
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <div className={`text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`}>Current Session</div>
                <div className={`text-3xl font-bold mt-1 ${isDarkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                  {calculateAverageConfidence()}%
                </div>
              </div>
            </div>

            {sessions.length > 0 && (
              <div className="mt-6">
                <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Recent Sessions
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg border transition-all hover:scale-[1.01] ${
                        isDarkMode 
                          ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {session.role}
                          </div>
                          <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(session.date).toLocaleDateString()} • {session.analytics.totalQuestions} questions
                          </div>
                        </div>
                        <div className={`text-right`}>
                          <div className={`text-lg font-bold ${
                            session.analytics.averageConfidence >= 70 
                              ? isDarkMode ? 'text-green-300' : 'text-green-600'
                              : session.analytics.averageConfidence >= 50
                              ? isDarkMode ? 'text-yellow-300' : 'text-yellow-600'
                              : isDarkMode ? 'text-red-300' : 'text-red-600'
                          }`}>
                            {session.analytics.averageConfidence}%
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {session.analytics.totalFillerWords} fillers
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Area */}
        <div className={`shadow-2xl p-6 h-[500px] overflow-y-auto backdrop-blur-lg transition-all duration-300 ${
          isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
        }`}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700/80 text-gray-100 border border-gray-600'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.role === 'assistant' && (
                      <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0 opacity-70" />
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`rounded-2xl px-4 py-3 ${isDarkMode ? 'bg-gray-700/80' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-purple-400' : 'bg-gray-400'}`}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-purple-400' : 'bg-gray-400'}`} style={{ animationDelay: '0.1s' }}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-purple-400' : 'bg-gray-400'}`} style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className={`rounded-b-2xl shadow-2xl p-4 border-t backdrop-blur-lg transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/90 border-gray-700' 
            : 'bg-white/90 border-gray-100'
        }`}>
          {/* Voice Recording Controls */}
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30' 
                    : 'bg-red-100 hover:bg-red-200 text-red-700'
                }`}
              >
                <Mic className="w-4 h-4" />
                Start Voice Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                  isDarkMode 
                    ? 'bg-red-500/30 text-red-300 border border-red-400/50' 
                    : 'bg-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <MicOff className="w-4 h-4" />
                  Recording... {recordingTime}s
                </div>
              </button>
            )}

            {audioBlob && !isRecording && (
              <>
                <button
                  onClick={playRecording}
                  disabled={isPlaying}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium hover:scale-105 ${
                    isDarkMode 
                      ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-400/30' 
                      : 'bg-green-100 hover:bg-green-200 text-green-700'
                  } disabled:opacity-50`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Playing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Play Recording
                    </>
                  )}
                </button>

                <button
                  onClick={deleteRecording}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium hover:scale-105 ${
                    isDarkMode 
                      ? 'bg-gray-700/50 hover:bg-gray-600 text-gray-300 border border-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>

                <span className={`px-3 py-1 rounded-lg text-xs ${
                  isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                }`}>
                  ✓ Recording saved ({recordingTime}s)
                </span>
              </>
            )}

            {isTranscribing && (
              <span className={`px-3 py-1 rounded-lg text-xs flex items-center gap-2 ${
                isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
              }`}>
                <Sparkles className="w-3 h-3 animate-pulse" />
                Live transcription active...
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your answer here or use voice recording..."
              className={`flex-1 resize-none border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
              }`}
              rows="2"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-3 rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className={`text-xs mt-2 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Press Enter to send • Shift+Enter for new line • Use voice for realistic practice
          </p>
        </div>

        {/* Info Footer */}
        <div className={`mt-4 rounded-xl shadow-lg p-4 border backdrop-blur-lg transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/80 border-purple-500/30' 
            : 'bg-white/80 border-blue-100'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-500/20' : 'bg-blue-100'}`}>
              <Sparkles className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-blue-600'}`} />
            </div>
            <div className="text-sm">
              <p className={`font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                New Features:
              </p>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                🎤 <strong>Voice Recording:</strong> Practice speaking your answers aloud for realistic interview simulation
                <br />
                📊 <strong>Performance Dashboard:</strong> Track your progress, confidence scores, and filler word usage across sessions
                <br />
                💡 Real-time analytics detect filler words and calculate confidence scores to help you improve!
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}