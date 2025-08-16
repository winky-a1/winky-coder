import React from 'react';
import { Rocket, GitBranch, Settings, Eye } from 'lucide-react';

interface FirebaseProject {
  id: string;
  name: string;
  projectId: string;
}

interface FirebaseDeployProps {
  project: FirebaseProject;
}

export const FirebaseDeploy: React.FC<FirebaseDeployProps> = ({ project }) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Rocket className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Deployment Manager</h3>
        <p className="text-slate-400 mb-4">
          Deploy to staging and production with approval workflows
        </p>
        <div className="flex items-center gap-2 justify-center">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-600 rounded-lg text-white text-sm">
            <GitBranch className="w-4 h-4" />
            Staging
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-600 rounded-lg text-white text-sm">
            <Rocket className="w-4 h-4" />
            Production
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-600 rounded-lg text-white text-sm">
            <Eye className="w-4 h-4" />
            Monitor
          </div>
        </div>
      </div>
    </div>
  );
};