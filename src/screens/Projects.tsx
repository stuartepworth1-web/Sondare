import { useState, useEffect } from 'react';
import { FolderOpen, Plus, Loader2, Eye, Download, Trash2, Edit, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ProjectPreview } from '../components/ProjectPreview';

interface Project {
  id: string;
  name: string;
  description: string;
  app_type: string;
  status: 'draft' | 'generating' | 'completed' | 'error';
  is_active_session: boolean;
  created_at: string;
}

interface ProjectsProps {
  onContinueEditing?: (projectId: string) => void;
  onExport?: (projectId: string, projectName: string) => void;
  onShowUpgrade?: () => void;
}

export function Projects({ onContinueEditing, onExport, onShowUpgrade }: ProjectsProps = {}) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProjects();
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-500 bg-green-500/20';
      case 'generating':
        return 'text-orange-500 bg-orange-500/20';
      case 'error':
        return 'text-red-500 bg-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold">My Projects</h1>
          <p className="text-white/60 text-xs sm:text-sm">{projects.length} total projects</p>
        </div>
        <div className="flex gap-2">
          {onShowUpgrade && (
            <button
              onClick={onShowUpgrade}
              className="glass-button p-3 flex-shrink-0"
            >
              <Zap className="w-5 h-5 text-orange-500" />
            </button>
          )}
          <button
            onClick={handleRefresh}
            className="glass-button p-3 flex-shrink-0"
            disabled={refreshing}
          >
            <Loader2
              className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-4 px-4">
          <div className="glass-card p-5 sm:p-6 rounded-full">
            <FolderOpen className="w-10 h-10 sm:w-12 sm:h-12 text-white/40" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-base sm:text-lg font-semibold">No Projects Yet</h3>
            <p className="text-white/60 text-xs sm:text-sm max-w-xs">
              Head to the Builder tab to create your first app with AI
            </p>
          </div>
          <button
            onClick={() => window.location.hash = '#design'}
            className="accent-button px-5 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Create First Project
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.id} className="glass-card p-4 sm:p-5 space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-base sm:text-lg flex-1 min-w-0">{project.name}</h3>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {project.is_active_session && (
                      <span className="text-[10px] sm:text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-500">
                        Active
                      </span>
                    )}
                    <span
                      className={`text-[10px] sm:text-xs px-2 py-1 rounded-full ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
                <p className="text-white/60 text-xs sm:text-sm line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-white/40">
                  <span className="capitalize">{project.app_type}</span>
                  <span>•</span>
                  <span>
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {onContinueEditing && (
                  <button
                    onClick={() => onContinueEditing(project.id)}
                    className="flex-1 glass-button py-2 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm active:scale-95"
                  >
                    <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Continue
                  </button>
                )}
                <button
                  onClick={() => setPreviewProject(project)}
                  className="flex-1 glass-button py-2 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Preview
                </button>
                {onExport && (
                  <button
                    onClick={() => onExport(project.id, project.name)}
                    className="flex-1 glass-button py-2 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Export
                  </button>
                )}
                <button
                  onClick={() => handleDelete(project.id)}
                  className="glass-button py-2 px-2.5 sm:px-3 text-red-500 hover:bg-red-500/10 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewProject && (
        <ProjectPreview
          projectId={previewProject.id}
          projectName={previewProject.name}
          onClose={() => setPreviewProject(null)}
        />
      )}
    </div>
  );
}
