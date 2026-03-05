import { supabase } from './supabase';
import { generateReactNativeCode, generatePackageJson, generateAppJson, generateReadme } from './codeExport';
import { Screen, Component } from '../types';

export async function exportAppCode(projectId: string): Promise<{ files: Record<string, string>; readme: string }> {
  const { data: project } = await supabase
    .from('projects')
    .select('name, description')
    .eq('id', projectId)
    .single();

  const { data: screens } = await supabase
    .from('app_screens')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index');

  if (!screens || screens.length === 0) {
    throw new Error('No screens found in project');
  }

  const screensWithComponents: Screen[] = await Promise.all(
    screens.map(async (screen) => {
      const { data: components } = await supabase
        .from('app_components')
        .select('*')
        .eq('screen_id', screen.id)
        .order('layer_order');
      return { ...screen, components: components || [] };
    })
  );

  const projectName = project?.name || 'MyApp';
  const files: Record<string, string> = {};
  files['App.js'] = generateReactNativeCode(screensWithComponents);
  files['package.json'] = generatePackageJson(projectName);
  files['app.json'] = generateAppJson(projectName);
  files['README.md'] = generateReadme(projectName);
  files['.gitignore'] = `node_modules/
.expo/
dist/
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
.env.local
.env.development.local
.env.test.local
.env.production.local`;

  return { files, readme: files['README.md'] };
}

export async function downloadProjectFiles(projectId: string, projectName: string) {
  const { files } = await exportAppCode(projectId);

  const zip = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm');
  const JSZip = zip.default;

  const zipFile = new JSZip();

  Object.entries(files).forEach(([filename, content]) => {
    zipFile.file(filename, content);
  });

  const blob = await zipFile.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
