import React from 'react';
import { HeartHandshake, ExternalLink } from 'lucide-react';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import SupportResourcesLayout from '../components/layout/SupportResourcesLayout';

const SupportResources = () => {
  const resources = [
    {
      title: 'MSWD Assistance',
      description: 'Social welfare programs and disaster relief assistance',
      contact: '(63) 910-122-8971'
    },
   ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 mt-16">
      <Header title="Support Resources" subtitle="Help & Information" showBack icon={HeartHandshake} />

      <main className="px-4 pt-4 pb-24 space-y-3">
        {resources.map((resource, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <h3 className="font-bold text-white mb-1">{resource.title}</h3>
            <p className="text-sm text-white/60 mb-3">{resource.description}</p>
            <a
              href={`tel:${resource.contact.replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-2 text-yellow-500 font-semibold"
            >
              {resource.contact}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ))}

        <SupportResourcesLayout />
      </main>

      <BottomNav />
    </div>
  );
};

export default SupportResources;
