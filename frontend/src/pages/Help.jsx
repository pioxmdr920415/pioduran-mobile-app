import React, { useState } from 'react';
import { HelpCircle, BookOpen, AlertTriangle, Settings, MapPin, Camera, MessageSquare, Phone, FileText, ChevronRight, Search } from 'lucide-react';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import EmergencyFAQ from '../components/emergency/EmergencyFAQ';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const features = [
    {
      id: 'login',
      title: 'Login & Registration',
      icon: Settings,
      description: 'Access your account and manage your profile',
      steps: [
        'Tap the Login button from the home screen',
        'Enter your registered email and password',
        'For new users, select "Register" to create an account',
        'Complete the registration form with required information',
        'Verify your email if prompted'
      ],
      tips: 'Keep your password secure and update it regularly in Settings.'
    },
    {
      id: 'report-incident',
      title: 'Report Incident',
      icon: AlertTriangle,
      description: 'Submit emergency reports with location and details',
      steps: [
        'Navigate to the Report Incident page',
        'Select the type of incident from the dropdown',
        'Provide detailed description of the situation',
        'Attach photos if available using the camera feature',
        'Review and submit your report',
        'You will receive a confirmation with reference number'
      ],
      tips: 'Include as much detail as possible. Location is automatically detected.'
    },
    {
      id: 'map',
      title: 'Interactive Map',
      icon: MapPin,
      description: 'View emergency locations, evacuation routes, and real-time updates',
      steps: [
        'Open the Map page from the navigation',
        'Use zoom controls to navigate the area',
        'Tap markers to view incident details',
        'Switch between different map layers (satellite, terrain)',
        'Use the search function to find specific locations'
      ],
      tips: 'Enable location services for accurate positioning and real-time updates.'
    },
    {
      id: 'camera',
      title: 'GeoTag Camera',
      icon: Camera,
      description: 'Capture and geotag photos for incident reporting',
      steps: [
        'Access the Camera from the bottom navigation',
        'Allow camera permissions when prompted',
        'Frame your photo and tap the capture button',
        'Add description and location details',
        'Save or directly attach to incident reports'
      ],
      tips: 'Photos are automatically geotagged with your current location.'
    },
    {
      id: 'emergency-hotline',
      title: 'Emergency Hotline',
      icon: Phone,
      description: 'Quick access to emergency contact numbers',
      steps: [
        'Go to Emergency Hotline page',
        'Browse or search for specific emergency services',
        'Tap the call button to directly dial numbers',
        'Access additional contact information and addresses'
      ],
      tips: 'Numbers are regularly updated. Save important ones to your phone.'
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: BookOpen,
      description: 'Overview of alerts, recent incidents, and quick actions',
      steps: [
        'Open the Dashboard from bottom navigation',
        'View active alerts and weather warnings',
        'Check recent incident reports in your area',
        'Access quick action buttons for common tasks',
        'Monitor system status and connectivity'
      ],
      tips: 'Keep the app open for real-time notifications.'
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      description: 'Customize app preferences and manage your account',
      steps: [
        'Access Settings from the menu (hamburger icon)',
        'Update your profile information',
        'Configure notification preferences',
        'Manage privacy settings',
        'Check app version and storage usage'
      ],
      tips: 'Enable notifications for important alerts and updates.'
    }
  ];

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Go to the Login page and tap "Forgot Password". Enter your registered email address and follow the instructions sent to your email.'
    },
    {
      question: 'Why can\'t I access certain features?',
      answer: 'Some features require internet connection. Check your network status and try again. If the issue persists, contact support.'
    },
    {
      question: 'How accurate is the location tracking?',
      answer: 'Location accuracy depends on your device\'s GPS and network conditions. Ensure location services are enabled for best results.'
    },
    {
      question: 'Can I use the app offline?',
      answer: 'Basic features like viewing emergency contacts and guidelines work offline. Incident reporting requires internet connection.'
    },
    {
      question: 'How do I update the app?',
      answer: 'The app updates automatically through your device\'s app store. You can also check for updates manually in Settings.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, all data is encrypted and stored securely. We follow strict privacy policies and never share personal information without consent.'
    }
  ];

  const filteredFeatures = features.filter(feature =>
    feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header title="Help & Support" subtitle="User Guide & Resources" showBack={true} />

      <main className="pb-24 pt-20 px-6 max-w-md mx-auto" id="main-content">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="getting-started" className="text-xs py-3">Getting Started</TabsTrigger>
            <TabsTrigger value="features" className="text-xs py-3">Features</TabsTrigger>
            <TabsTrigger value="faqs" className="text-xs py-3">FAQs</TabsTrigger>
            <TabsTrigger value="emergency" className="text-xs py-3">Emergency</TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Welcome to MDRRMO Pio Duran App
                </CardTitle>
                <CardDescription>
                  Your comprehensive disaster management and emergency response tool
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Quick Start Guide</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Download and install the app from your app store</li>
                    <li>Create an account or login with existing credentials</li>
                    <li>Grant necessary permissions (location, camera, notifications)</li>
                    <li>Explore the dashboard for current alerts and information</li>
                    <li>Familiarize yourself with emergency features and contacts</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Key Features Overview</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {features.slice(0, 4).map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div key={feature.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Icon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium">{feature.title}</h4>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Enable notifications for real-time alerts</li>
                    <li>• Keep emergency contacts saved on your device</li>
                    <li>• Regularly check the dashboard for updates</li>
                    <li>• Test camera and location features before emergencies</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div className="space-y-4">
              {filteredFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-blue-600" />
                        {feature.title}
                      </CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium mb-2">How to use:</h4>
                          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 ml-4">
                            {feature.steps.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ol>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Tip:</strong> {feature.tips}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="faqs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>
                  Common questions about using the app
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting</CardTitle>
                <CardDescription>Common issues and solutions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">GPS Issues</Badge>
                    <div>
                      <p className="text-sm">If location isn't working, check:</p>
                      <ul className="text-xs text-gray-600 ml-4 mt-1">
                        <li>• Location services are enabled</li>
                        <li>• App has location permission</li>
                        <li>• You're in an open area</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">Camera Problems</Badge>
                    <div>
                      <p className="text-sm">For camera issues:</p>
                      <ul className="text-xs text-gray-600 ml-4 mt-1">
                        <li>• Grant camera permission</li>
                        <li>• Check storage space</li>
                        <li>• Restart the app</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">App Crashes</Badge>
                    <div>
                      <p className="text-sm">If app crashes:</p>
                      <ul className="text-xs text-gray-600 ml-4 mt-1">
                        <li>• Update to latest version</li>
                        <li>• Clear app cache</li>
                        <li>• Restart your device</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Emergency Information & Procedures
                </CardTitle>
                <CardDescription>
                  Critical emergency response guidelines and first aid information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmergencyFAQ isOnline={true} emergencyMode={false} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Support */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Need More Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="space-y-2">
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Contact Support
              </button>
              <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Report a Bug
              </button>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default Help;