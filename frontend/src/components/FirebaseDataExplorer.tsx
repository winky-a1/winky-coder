import React from 'react';
import { Database, Eye, Edit, Bot } from 'lucide-react';

interface FirebaseProject {
  id: string;
  name: string;
  projectId: string;
}

interface FirebaseDataExplorerProps {
  project: FirebaseProject;
}

export const FirebaseDataExplorer: React.FC<FirebaseDataExplorerProps> = ({ project }) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Database className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Database Explorer</h3>
        <p className="text-slate-400 mb-4">
          View and edit Firestore/RTDB data with AI-powered insights
        </p>
        <div className="flex items-center gap-2 justify-center">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-600 rounded-lg text-white text-sm">
            <Bot className="w-4 h-4" />
            AI Insights
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-600 rounded-lg text-white text-sm">
            <Eye className="w-4 h-4" />
            Real-time View
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-600 rounded-lg text-white text-sm">
            <Edit className="w-4 h-4" />
            Inline Edit
          </div>
        </div>
      </div>
    </div>
  );
};