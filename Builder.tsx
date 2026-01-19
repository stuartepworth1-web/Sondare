import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, AlertCircle, Eye, CheckCircle, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ProjectPreview } from '../components/ProjectPreview';
import { Auth } from '../components/Auth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface BuilderProps {
  onShowUpgrade: () => void;
  initialProjectId?: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
}

export function Builder({ onShowUpgrade, initialProjectId }: BuilderProps) {
  const { profile, refreshProfile, session, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: user
        ? "Hi! I'm your AI app builder. Describe the app you want to create, and I'll help bring it to life. What kind of app are you thinking of?"
        : "Hi! I'm your AI app builder. Sign up for a free account to start building your app with AI. No credit card required!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalCredits = (profile?.credits_remaining || 0) + (profile?.credits_purchased || 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialProjectId) {
      loadSpecificProject(initialProjectId);
    } else {
      loadActiveSession();
    }
  }, [user, initialProjectId]);

  const loadSpecificProject = async (projectId: string) => {
    if (!user) return;

    try {
      const { data: project } = await supabase
        .from('projects')
        .select('id, name, status')
        .eq('id', projectId)
        .maybeSingle();

      if (project) {
        await supabase
          .from('projects')
          .update({ is_active_session: true })
          .eq('id', projectId);

        setCurrentProject(project);

        const { data: conversationMessages } = await supabase
          .from('conversation_messages')
          .select('role, content, created_at')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true });

        if (conversationMessages && conversationMessages.length > 0) {
          const loadedMessages: Message[] = conversationMessages.map((msg, idx) => ({
            id: `${idx + 2}`,
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: new Date(msg.created_at),
          }));
          setMessages([messages[0], ...loadedMessages]);
        }
      }
    } catch (err) {
      console.error('Error loading specific project:', err);
    }
  };

  const loadActiveSession = async () => {
    if (!user) return;

    try {
      const { data: activeProject } = await supabase
        .from('projects')
        .select('id, name, status')
        .eq('user_id', user.id)
        .eq('is_active_session', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeProject) {
        setCurrentProject(activeProject);

        const { data: conversationMessages } = await supabase
          .from('conversation_messages')
          .select('role, content, created_at')
          .eq('project_id', activeProject.id)
          .order('created_at', { ascending: true });

        if (conversationMessages && conversationMessages.length > 0) {
          const loadedMessages: Message[] = conversationMessages.map((msg, idx) => ({
            id: `${idx + 2}`,
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: new Date(msg.created_at),
          }));
          setMessages([messages[0], ...loadedMessages]);
        }
      }
    } catch (err) {
      console.error('Error loading active session:', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (!user) {
      setError('Sign up for a free account to start building apps with AI.');
      setShowAuth(true);
      return;
    }

    if (totalCredits <= 0) {
      setError('No credits remaining. Please upgrade your plan to continue.');
      onShowUpgrade();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-builder`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            message: userMessage.content,
            projectId: currentProject?.id
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to chat with builder');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.projectId && !currentProject) {
        const { data: project } = await supabase
          .from('projects')
          .select('id, name, status')
          .eq('id', data.projectId)
          .single();

        if (project) {
          setCurrentProject(project);
        }
      }

      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const completeSession = async () => {
    if (!currentProject) return;

    try {
      await supabase
        .from('projects')
        .update({
          is_active_session: false,
          status: 'completed'
        })
        .eq('id', currentProject.id);

      setCurrentProject(null);
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "Hi! I'm your AI app builder. Describe the app you want to create, and I'll help bring it to life. What kind of app are you thinking of?",
        timestamp: new Date(),
      }]);
    } catch (err) {
      console.error('Error completing session:', err);
    }
  };

  return (
    <div className="h-screen flex flex-col pb-24">
      <div className="glass-card m-3 sm:m-4 mb-0 p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
          <span className="font-semibold text-sm sm:text-base">AI Builder</span>
          {currentProject && (
            <span className="text-xs text-white/60">• {currentProject.name}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentProject && (
            <>
              <button
                onClick={() => setShowPreview(true)}
                className="glass-button p-2"
                title="Preview"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={completeSession}
                className="glass-button p-2"
                title="Complete Project"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            </>
          )}
          {user ? (
            <div className="text-xs sm:text-sm flex-shrink-0">
              <span className="text-white/60">Credits: </span>
              <span className="font-semibold text-orange-500">{totalCredits}</span>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="accent-button px-3 py-1.5 text-xs sm:text-sm flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign Up Free</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-hide">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 sm:p-4 ${
                message.role === 'user'
                  ? 'bg-orange-500 text-white'
                  : 'glass-card'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm sm:text-base">{message.content}</p>
              <p
                className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-white/60' : 'text-white/40'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="glass-card p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-orange-500" />
              <span className="text-white/60 text-sm sm:text-base">Generating your app...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="mx-3 sm:mx-4 mb-2 flex items-center gap-2 p-2.5 sm:p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="p-3 sm:p-4 pt-0 flex-shrink-0">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your app idea..."
            className="input-field flex-1 resize-none text-sm sm:text-base"
            rows={3}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim() || (user && totalCredits <= 0)}
            className="accent-button px-4 sm:px-6 flex items-center justify-center disabled:opacity-50 flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-[10px] sm:text-xs text-white/40 mt-2 text-center">
          Questions are free • Actions use 1 credit
        </p>
      </div>

      {showPreview && currentProject && (
        <ProjectPreview
          projectId={currentProject.id}
          projectName={currentProject.name}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showAuth && (
        <Auth onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
}
