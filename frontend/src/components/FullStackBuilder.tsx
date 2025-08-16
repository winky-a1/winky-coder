import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, 
  Database, 
  Server, 
  Globe, 
  Smartphone, 
  Zap, 
  Play, 
  Download,
  Eye,
  Settings,
  FileText,
  GitBranch,
  Shield,
  Cloud,
  Monitor,
  Smartphone as Mobile,
  Palette,
  Users,
  ShoppingCart,
  BarChart3,
  MessageSquare,
  Calendar,
  MapPin,
  Camera,
  Music,
  Video,
  Gamepad2,
  BookOpen,
  GraduationCap,
  Briefcase,
  Heart,
  Star,
  TrendingUp,
  Target,
  Rocket,
  CheckCircle,
  ArrowRight,
  Plus,
  X,
  Clock as ClockIcon,
  ArrowLeft as ArrowLeftIcon
} from 'lucide-react';

interface AppTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  features: string[];
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    deployment: string[];
  };
  estimatedTime: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  price: string;
}

const APP_TEMPLATES: AppTemplate[] = [
  // E-commerce Apps
  {
    id: 'ecommerce-shopify',
    name: 'E-commerce Store',
    description: 'Complete online store with payment processing, inventory management, and admin dashboard',
    category: 'E-commerce',
    icon: <ShoppingCart className="w-6 h-6" />,
    features: ['Product catalog', 'Shopping cart', 'Payment processing', 'Order management', 'Admin dashboard', 'Inventory tracking', 'Customer reviews', 'Email notifications'],
    techStack: {
      frontend: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Stripe', 'Redux Toolkit'],
      backend: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'JWT', 'Multer'],
      database: ['PostgreSQL', 'Redis', 'Supabase'],
      deployment: ['Vercel', 'Railway', 'Stripe', 'SendGrid']
    },
    estimatedTime: '2-3 hours',
    complexity: 'Intermediate',
    price: 'Free'
  },
  {
    id: 'marketplace',
    name: 'Multi-Vendor Marketplace',
    description: 'Platform for multiple sellers to list and sell products with commission system',
    category: 'E-commerce',
    icon: <Users className="w-6 h-6" />,
    features: ['Vendor registration', 'Product listings', 'Commission system', 'Escrow payments', 'Dispute resolution', 'Analytics dashboard', 'Chat system', 'Review system'],
    techStack: {
      frontend: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Socket.io', 'Chart.js'],
      backend: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'Socket.io', 'Redis'],
      database: ['PostgreSQL', 'Redis', 'MongoDB'],
      deployment: ['Vercel', 'Railway', 'AWS S3', 'CloudFront']
    },
    estimatedTime: '4-6 hours',
    complexity: 'Advanced',
    price: 'Free'
  },

  // Social Media Apps
  {
    id: 'social-network',
    name: 'Social Network',
    description: 'Full-featured social platform with posts, comments, likes, and real-time chat',
    category: 'Social',
    icon: <Users className="w-6 h-6" />,
    features: ['User profiles', 'Posts & stories', 'Comments & likes', 'Real-time chat', 'Friend system', 'News feed', 'Notifications', 'Media sharing'],
    techStack: {
      frontend: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Socket.io', 'React Query'],
      backend: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'Socket.io', 'Redis'],
      database: ['PostgreSQL', 'Redis', 'AWS S3'],
      deployment: ['Vercel', 'Railway', 'AWS S3', 'CloudFront']
    },
    estimatedTime: '3-4 hours',
    complexity: 'Advanced',
    price: 'Free'
  },
  {
    id: 'dating-app',
    name: 'Dating App',
    description: 'Modern dating platform with matching algorithm, chat, and video calls',
    category: 'Social',
    icon: <Heart className="w-6 h-6" />,
    features: ['User profiles', 'Matching algorithm', 'Real-time chat', 'Video calls', 'Location-based matching', 'Photo verification', 'Blocking system', 'Premium features'],
    techStack: {
      frontend: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Socket.io', 'WebRTC'],
      backend: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'Socket.io', 'Redis'],
      database: ['PostgreSQL', 'Redis', 'AWS S3'],
      deployment: ['Vercel', 'Railway', 'Twilio', 'AWS S3']
    },
    estimatedTime: '5-7 hours',
    complexity: 'Advanced',
    price: 'Free'
  },

  // Business Apps
  {
    id: 'crm-system',
    name: 'CRM System',
    description: 'Customer relationship management with leads, deals, and analytics',
    category: 'Business',
    icon: <Target className="w-6 h-6" />,
    features: ['Lead management', 'Deal pipeline', 'Contact management', 'Email automation', 'Analytics dashboard', 'Task management', 'Calendar integration', 'Reporting'],
    techStack: {
      frontend: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Chart.js', 'React Query'],
      backend: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'Cron jobs', 'Redis'],
      database: ['PostgreSQL', 'Redis', 'SendGrid'],
      deployment: ['Vercel', 'Railway', 'SendGrid', 'Google Calendar API']
    },
    estimatedTime: '3-4 hours',
    complexity: 'Intermediate',
    price: 'Free'
  },
  {
    id: 'project-management',
    name: 'Project Management',
    description: 'Team collaboration platform with tasks, boards, and time tracking',
    category: 'Business',
    icon: <Briefcase className="w-6 h-6" />,
    features: ['Task management', 'Kanban boards', 'Time tracking', 'Team collaboration', 'File sharing', 'Gantt charts', 'Reporting', 'Integrations'],
    techStack: {
      frontend: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'DND Kit', 'Chart.js'],
      backend: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'Socket.io', 'Redis'],
      database: ['PostgreSQL', 'Redis', 'AWS S3'],
      deployment: ['Vercel', 'Railway', 'AWS S3', 'Slack API']
    },
    estimatedTime: '3-4 hours',
    complexity: 'Intermediate',
    price: 'Free'
  },

  // Content Apps
  {
    id: 'blog-platform',
    name: 'Blog Platform',
    description: 'Modern blogging platform with CMS, SEO, and monetization',
    category: 'Content',
    icon: <FileText className="w-6 h-6" />,
    features: ['Rich text editor', 'SEO optimization', 'Comment system', 'Newsletter', 'Analytics', 'Monetization', 'Multi-author', 'Categories'],
    techStack: {
      frontend: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'TipTap', 'React Query'],
      backend: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'Redis', 'Sharp'],
      database: ['PostgreSQL', 'Redis', 'AWS S3'],
      deployment: ['Vercel', 'Railway', 'SendGrid', 'Google Analytics']
    },
    estimatedTime: '2-3 hours',
    complexity: 'Intermediate',
    price: 'Free'
  },
  {
    id: 'video-streaming',
    name: 'Video Streaming Platform',
    description: 'YouTube-like platform with video upload, streaming, and monetization',
    category: 'Content',
    icon: <Video className="w-6 h-6" />,
    features: ['Video upload', 'Streaming', 'Comments & likes', 'Playlists', 'Monetization', 'Analytics', 'Live streaming', 'Subscriptions'],
    techStack: {
      frontend: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Video.js', 'Socket.io'],
      backend: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'FFmpeg', 'Redis'],
      database: ['PostgreSQL', 'Redis', 'AWS S3'],
      deployment: ['Vercel', 'Railway', 'AWS S3', 'CloudFront', 'Stripe']
    },
    estimatedTime: '6-8 hours',
    complexity: 'Advanced',
    price: 'Free'
  },

  // Education Apps
  {
    id: 'learning-platform',
    name: 'Learning Platform',
    description: 'Online education platform with courses, quizzes, and certificates',
    category: 'Education',
    icon: <GraduationCap className="w-6 h-6" />,
    features: ['Course creation', 'Video lessons', 'Quizzes', 'Progress tracking', 'Certificates', 'Discussion forums', 'Live classes', 'Payment system'],
    techStack: {
      frontend: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Video.js', 'Chart.js'],
      backend: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'Socket.io', 'Redis'],
      database: ['PostgreSQL', 'Redis', 'AWS S3'],
      deployment: ['Vercel', 'Railway', 'Stripe', 'SendGrid']
    },
    estimatedTime: '4-5 hours',
    complexity: 'Advanced',
    price: 'Free'
  },
  {
    id: 'tutoring-app',
    name: 'Tutoring App',
    description: 'Connect students with tutors for live online sessions',
    category: 'Education',
    icon: <BookOpen className="w-6 h-6" />,
    features: ['Tutor profiles', 'Booking system', 'Video calls', 'Payment processing', 'Review system', 'Scheduling', 'File sharing', 'Progress tracking'],
    techStack: {
      frontend: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'WebRTC', 'Calendar'],
      backend: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'Socket.io', 'Redis'],
      database: ['PostgreSQL', 'Redis', 'AWS S3'],
      deployment: ['Vercel', 'Railway', 'Stripe', 'Twilio']
    },
    estimatedTime: '4-5 hours',
    complexity: 'Advanced',
    price: 'Free'
  },

  // Health & Fitness Apps
  {
    id: 'fitness-tracker',
    name: 'Fitness Tracker',
    description: 'Complete fitness app with workouts, nutrition, and progress tracking',
    category: 'Health',
    icon: <Target className="w-6 h-6" />,
    features: ['Workout plans', 'Exercise library', 'Progress tracking', 'Nutrition tracking', 'Social features', 'Challenges', 'Wearable integration', 'Analytics'],
    techStack: {
      frontend: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Chart.js', 'PWA'],
      backend: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'Redis', 'Cron jobs'],
      database: ['PostgreSQL', 'Redis', 'AWS S3'],
      deployment: ['Vercel', 'Railway', 'AWS S3', 'Push notifications']
    },
    estimatedTime: '3-4 hours',
    complexity: 'Intermediate',
    price: 'Free'
  },
  {
    id: 'telemedicine',
    name: 'Telemedicine Platform',
    description: 'Healthcare platform for online consultations and prescriptions',
    category: 'Health',
    icon: <Heart className="w-6 h-6" />,
    features: ['Doctor profiles', 'Appointment booking', 'Video consultations', 'Prescriptions', 'Medical records', 'Payment processing', 'Insurance integration', 'Notifications'],
    techStack: {
      frontend: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'WebRTC', 'Chart.js'],
      backend: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'Socket.io', 'Redis'],
      database: ['PostgreSQL', 'Redis', 'AWS S3'],
      deployment: ['Vercel', 'Railway', 'Stripe', 'Twilio', 'HIPAA compliant']
    },
    estimatedTime: '5-6 hours',
    complexity: 'Advanced',
    price: 'Free'
  },

  // Entertainment Apps
  {
    id: 'music-streaming',
    name: 'Music Streaming',
    description: 'Spotify-like music streaming platform with playlists and recommendations',
    category: 'Entertainment',
    icon: <Music className="w-6 h-6" />,
    features: ['Music library', 'Playlists', 'Recommendations', 'Audio streaming', 'Offline mode', 'Social features', 'Lyrics', 'Podcasts'],
    techStack: {
      frontend: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Howler.js', 'PWA'],
      backend: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'Redis', 'FFmpeg'],
      database: ['PostgreSQL', 'Redis', 'AWS S3'],
      deployment: ['Vercel', 'Railway', 'AWS S3', 'CloudFront']
    },
    estimatedTime: '4-5 hours',
    complexity: 'Advanced',
    price: 'Free'
  },
  {
    id: 'gaming-platform',
    name: 'Gaming Platform',
    description: 'Multiplayer gaming platform with leaderboards and tournaments',
    category: 'Entertainment',
    icon: <Gamepad2 className="w-6 h-6" />,
    features: ['Game library', 'Multiplayer games', 'Leaderboards', 'Tournaments', 'Chat system', 'Achievements', 'Virtual currency', 'Friends system'],
    techStack: {
      frontend: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Socket.io', 'Canvas API'],
      backend: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'Socket.io', 'Redis'],
      database: ['PostgreSQL', 'Redis', 'AWS S3'],
      deployment: ['Vercel', 'Railway', 'AWS S3', 'Game servers']
    },
    estimatedTime: '5-7 hours',
    complexity: 'Advanced',
    price: 'Free'
  },

  // Travel Apps
  {
    id: 'travel-booking',
    name: 'Travel Booking Platform',
    description: 'Complete travel platform for flights, hotels, and activities',
    category: 'Travel',
    icon: <Globe className="w-6 h-6" />,
    features: ['Flight booking', 'Hotel booking', 'Activity tours', 'Payment processing', 'Reviews', 'Travel insurance', 'Itinerary planning', 'Mobile app'],
    techStack: {
      frontend: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Mapbox', 'React Query'],
      backend: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'Redis', 'External APIs'],
      database: ['PostgreSQL', 'Redis', 'AWS S3'],
      deployment: ['Vercel', 'Railway', 'Stripe', 'SendGrid']
    },
    estimatedTime: '5-6 hours',
    complexity: 'Advanced',
    price: 'Free'
  },
  {
    id: 'food-delivery',
    name: 'Food Delivery App',
    description: 'Uber Eats-like food delivery platform with restaurants and drivers',
    category: 'Food',
    icon: <ShoppingCart className="w-6 h-6" />,
    features: ['Restaurant listings', 'Menu management', 'Order tracking', 'Driver app', 'Payment processing', 'Reviews', 'Real-time tracking', 'Notifications'],
    techStack: {
      frontend: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Mapbox', 'Socket.io'],
      backend: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'Socket.io', 'Redis'],
      database: ['PostgreSQL', 'Redis', 'AWS S3'],
      deployment: ['Vercel', 'Railway', 'Stripe', 'Push notifications']
    },
    estimatedTime: '6-8 hours',
    complexity: 'Advanced',
    price: 'Free'
  }
];

interface FullStackBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onBuildApp: (template: AppTemplate) => void;
}

export const FullStackBuilder: React.FC<FullStackBuilderProps> = ({
  isOpen,
  onClose,
  onBuildApp
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<AppTemplate | null>(null);
  const [buildStep, setBuildStep] = useState<'select' | 'configure' | 'building' | 'complete'>('select');

  const categories = [
    { id: 'all', name: 'All Apps', icon: <Rocket className="w-4 h-4" /> },
    { id: 'E-commerce', name: 'E-commerce', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'Social', name: 'Social', icon: <Users className="w-4 h-4" /> },
    { id: 'Business', name: 'Business', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'Content', name: 'Content', icon: <FileText className="w-4 h-4" /> },
    { id: 'Education', name: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'Health', name: 'Health', icon: <Heart className="w-4 h-4" /> },
    { id: 'Entertainment', name: 'Entertainment', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'Travel', name: 'Travel', icon: <Globe className="w-4 h-4" /> }
  ];

  const filteredTemplates = APP_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBuildApp = async (template: AppTemplate) => {
    setSelectedTemplate(template);
    setBuildStep('configure');
  };

  const startBuilding = async () => {
    setBuildStep('building');
    // Simulate building process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setBuildStep('complete');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Rocket className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Full-Stack App Builder</h2>
              <p className="text-slate-400 text-sm">Build complete apps from frontend to backend</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {buildStep === 'select' && (
            <div className="h-full flex flex-col">
              {/* Search and Filters */}
              <div className="p-6 border-b border-slate-700">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search app templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {category.icon}
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer"
                      onClick={() => handleBuildApp(template)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          {template.icon}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            template.complexity === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                            template.complexity === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {template.complexity}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                      <p className="text-slate-400 text-sm mb-4">{template.description}</p>
                      
                      <div className="space-y-3">
                                                 <div className="flex items-center gap-2 text-sm text-slate-400">
                           <ClockIcon className="w-4 h-4" />
                           {template.estimatedTime}
                         </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {template.techStack.frontend.slice(0, 3).map((tech, index) => (
                            <span key={index} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                              {tech}
                            </span>
                          ))}
                          {template.techStack.frontend.length > 3 && (
                            <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                              +{template.techStack.frontend.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-green-400 font-semibold">{template.price}</span>
                          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-medium transition-colors">
                            Build App
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {buildStep === 'configure' && selectedTemplate && (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                                     <button
                     onClick={() => setBuildStep('select')}
                     className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                   >
                     <ArrowLeftIcon className="w-5 h-5 text-slate-400" />
                   </button>
                  <h3 className="text-lg font-semibold text-white">Configure {selectedTemplate.name}</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* App Configuration */}
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h4 className="text-lg font-semibold text-white mb-4">App Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">App Name</label>
                        <input
                          type="text"
                          placeholder="My Awesome App"
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Domain</label>
                        <input
                          type="text"
                          placeholder="myapp.com"
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h4 className="text-lg font-semibold text-white mb-4">Tech Stack</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-slate-300 mb-2">Frontend</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedTemplate.techStack.frontend.map((tech, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-slate-300 mb-2">Backend</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedTemplate.techStack.backend.map((tech, index) => (
                            <span key={index} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-slate-300 mb-2">Database</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedTemplate.techStack.database.map((tech, index) => (
                            <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h4 className="text-lg font-semibold text-white mb-4">Features</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedTemplate.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-slate-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Build Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={startBuilding}
                      className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold text-lg transition-all transform hover:scale-105"
                    >
                      <Rocket className="w-5 h-5" />
                      Build Full-Stack App
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {buildStep === 'building' && selectedTemplate && (
            <div className="h-full flex flex-col items-center justify-center p-6">
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <Rocket className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Building {selectedTemplate.name}</h3>
                  <p className="text-slate-400">Creating your full-stack application...</p>
                </div>
                <div className="space-y-2 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Setting up frontend with {selectedTemplate.techStack.frontend[0]}
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Configuring backend with {selectedTemplate.techStack.backend[0]}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Setting up database and deploying...
                  </div>
                </div>
              </div>
            </div>
          )}

          {buildStep === 'complete' && selectedTemplate && (
            <div className="h-full flex flex-col items-center justify-center p-6">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">App Built Successfully!</h3>
                  <p className="text-slate-400">Your {selectedTemplate.name} is ready to use</p>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors">
                      <Eye className="w-4 h-4" />
                      View App
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors">
                      <Download className="w-4 h-4" />
                      Download Code
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setBuildStep('select');
                      setSelectedTemplate(null);
                    }}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Build Another App
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};