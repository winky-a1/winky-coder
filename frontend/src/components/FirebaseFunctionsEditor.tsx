import React from 'react';
import { Code, Play, TestTube, Bot } from 'lucide-react';

interface FirebaseProject {
  id: string;
  name: string;
  projectId: string;
}

interface FirebaseFunctionsEditorProps {
  project: FirebaseProject;
}

export const FirebaseFunctionsEditor: React.FC<FirebaseFunctionsEditorProps> = ({ project }) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Code className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Cloud Functions Editor</h3>
        <p className="text-slate-400 mb-4">
          Create, edit, and test Cloud Functions with AI assistance
        </p>
        <div className="flex items-center gap-2 justify-center">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-600 rounded-lg text-white text-sm">
            <Bot className="w-4 h-4" />
            AI-Powered
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-600 rounded-lg text-white text-sm">
            <Play className="w-4 h-4" />
            Emulator Testing
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-600 rounded-lg text-white text-sm">
            <TestTube className="w-4 h-4" />
            Unit Tests
          </div>
        </div>
      </div>
    </div>
  );
};