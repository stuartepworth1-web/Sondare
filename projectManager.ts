import { supabase } from './supabase';
import { AppTemplate, Project, TemplateScreen, TemplateComponent } from '../types';

export class ProjectManager {
  static async createFromTemplate(
    userId: string,
    template: AppTemplate
  ): Promise<string | null> {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name: template.name,
          description: template.description,
          app_type: template.category,
          status: 'draft',
          editing_mode: 'visual',
        })
        .select()
        .single();

      if (error) throw error;
      if (!project) return null;

      await this.applyTemplate(project.id, template);
      return project.id;
    } catch (error) {
      console.error('Error creating project from template:', error);
      return null;
    }
  }

  static async createBlankProject(userId: string): Promise<string | null> {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name: 'New App',
          description: 'A new app created from scratch',
          app_type: 'custom',
          status: 'draft',
          editing_mode: 'visual',
        })
        .select()
        .single();

      if (error) throw error;
      return project?.id || null;
    } catch (error) {
      console.error('Error creating blank project:', error);
      return null;
    }
  }

  static async applyTemplate(
    projectId: string,
    template: AppTemplate
  ): Promise<void> {
    const templateData = template.template_data;

    if (!templateData.screens || templateData.screens.length === 0) {
      return;
    }

    for (let i = 0; i < templateData.screens.length; i++) {
      const screenData: TemplateScreen = templateData.screens[i];
      const { data: screen, error: screenError } = await supabase
        .from('app_screens')
        .insert({
          project_id: projectId,
          name: screenData.name,
          screen_type: screenData.type || 'custom',
          background_color:
            screenData.background_color ||
            templateData.backgroundColor ||
            '#000000',
          order_index: i,
          is_home_screen: i === 0,
        })
        .select()
        .single();

      if (screenError || !screen) {
        console.error('Error creating screen:', screenError);
        continue;
      }

      if (screenData.components && screenData.components.length > 0) {
        for (let j = 0; j < screenData.components.length; j++) {
          const comp: TemplateComponent = screenData.components[j];
          const { error: compError } = await supabase
            .from('app_components')
            .insert({
              screen_id: screen.id,
              component_type: comp.type,
              props: comp.props || {},
              styles: comp.styles || {},
              position_x:
                comp.position_x !== undefined ? comp.position_x : 20,
              position_y:
                comp.position_y !== undefined ? comp.position_y : 80 + j * 80,
              width: comp.width || 335,
              height: comp.height || 60,
              layer_order: j,
            });

          if (compError) {
            console.error('Error creating component:', compError);
          }
        }
      }
    }
  }

  static async getProjectById(projectId: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  }

  static async deleteProject(projectId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  static async updateProject(
    projectId: string,
    updates: Partial<Project>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      return false;
    }
  }
}
