import React, { useState, useEffect } from 'react';
import UploadBodySection from '../pages/researcher/UploadBodySection';
import PageHeader from '@/components/PageHeader';
import TabComponent from '@/components/TabComponent';
import { useAuth } from '@/contexts/AuthContext';
import { Download, HelpCircle, X, Camera, Upload, Send, Clock, CheckCircle } from 'lucide-react';

const UploadSamples: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Predict Image');
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const {user} = useAuth();

  // close modal on Escape for accessibility
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowWorkflowModal(false);
    };
    if (showWorkflowModal) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showWorkflowModal]);

  const handleFiles = (files: FileList) => {
    console.log('Selected files:', files);
  };

  const handleDownloadCalibration = () => {
    // Create a temporary link to download the AURCO PDF
    const link = document.createElement('a');
    link.href = '/src/assets/AURCO-Calibration-Tool.pdf';
    link.download = 'AURCO-Calibration-Tool.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // improved workflow content, first item uses bullets (Important Note)
  const workflowSteps = [
    {
      title: "Important — Calibration & Capture",
      bullets: [
        "Upload or capture images only with the AURCO calibration tool. Images captured without the calibration frame will not be processed.",
        "Flash is recommended for clearer morphological extraction but can affect color analysis — use as appropriate.",
        "Avoid strong shadows and intense backlighting; ensure even illumination.",
        "You may upload up to 5 images per submission."
      ],
      icon: <HelpCircle className="w-8 h-8 text-yellow-500" />,
      image: "https://images.unsplash.com/photo-1524594154906-6b5f6f3f0b6d?w=1200&q=60&auto=format&fit=crop"
    },
    {
      title: "Choose Upload Method",
      description: "Select images from your device or capture directly with your camera. When capturing, align the calibration frame carefully around the beans.",
      icon: <Upload className="w-8 h-8 text-blue-500" />,
      image: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=1200&q=60&auto=format&fit=crop"
    },
    {
      title: "Optional Comment",
      description: "Add notes about capture conditions (angle, distance, lighting) or observations that may help later analysis.",
      icon: <Camera className="w-8 h-8 text-green-500" />,
      image: "https://images.unsplash.com/photo-1526178615495-0970b2a1f43c?w=1200&q=60&auto=format&fit=crop"
    },
    {
      title: "Preview & Send",
      description: "Review the preview to ensure the calibration frame is visible and beans are centered. Then press 'Preview & Send'.",
      icon: <Send className="w-8 h-8 text-purple-500" />,
      image: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1200&q=60&auto=format&fit=crop"
    },
    {
      title: "Send for Processing",
      description: "Confirm and send. The system will queue the images for feature extraction and analysis.",
      icon: <Send className="w-8 h-8 text-orange-500" />,
      image: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=1200&q=60&auto=format&fit=crop"
    },
    {
      title: "Processing",
      description: "Processing may take a moment depending on queue and size. You'll be notified when predictions are ready.",
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=1200&q=60&auto=format&fit=crop"
    },
    {
      title: "Results & Next Steps",
      description: "When predictions are ready check the gallery for per-image details, download results, or run further analyses.",
      icon: <CheckCircle className="w-8 h-8 text-green-600" />,
      image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=60&auto=format&fit=crop"
    }
  ];

  return (
    <>
      <div className="w-full h-full max-w-6xl bg-white p-6">
        <div className="flex justify-between items-start mb-6">
          <PageHeader
            title="Upload Bean Images"
            subtitle="Upload coffee bean images for analysis and contribute to our research database"
          />
          <button
            onClick={handleDownloadCalibration}
            className="flex items-center gap-2 bg-[var(--arabica-brown)] text-[var(--parchment)] px-4 py-2 rounded-lg font-accent hover:bg-opacity-90 transition-colors shadow-lg"
          >
            <Download className="w-4 h-4" />
            Download Calibration Tool
          </button>
        </div>
        
        <TabComponent activeTab={activeTab} onTabChange={setActiveTab} tabs={['Predict Image','Find Largest Bean']} />
        <UploadBodySection activeTab={activeTab} onFilesSelected={handleFiles} />

        {/* Workflow Help Button */}
        <div className="mt-6 flex justify-start">
          <button
            onClick={() => setShowWorkflowModal(true)}
            className="flex items-center gap-2 bg-[var(--espresso-black)] text-[var(--parchment)] px-4 py-2 rounded-lg font-accent hover:bg-opacity-90 transition-colors shadow-lg"
          >
            <HelpCircle className="w-4 h-4" />
            View Upload Workflow
          </button>
        </div>
      </div>

      {/* Workflow Modal */}
      {showWorkflowModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Upload workflow guide"
          className="fixed inset-0 z-50 flex items-start justify-center p-6"
        >
          {/* Subtle glass backdrop */}
          <div
            className="absolute "
            onClick={() => setShowWorkflowModal(false)}
          />

          {/* Modal Content (glass card) */}
          <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/6 to-white/8 backdrop-blur-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-6 border-b border-white/8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Upload Workflow & Best Practices</h2>
                <p className="mt-1 text-sm text-gray-600 max-w-2xl">
                  Follow these steps to ensure accurate morphological extraction and reliable predictions using the AURCO calibration tool.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowWorkflowModal(false)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/40 hover:bg-white/50 border border-white/10"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-800" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(92vh-150px)]">
              <article className="prose prose-sm max-w-none mb-6">
                <h3 className="text-lg font-semibold">Quick Overview</h3>
                <p className="text-gray-700">
                  Use this guide as a quick reference when capturing or uploading beans. Proper capture is critical — the calibration frame must be visible in every image.
                </p>
              </article>

              <div className="space-y-6">
                {workflowSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-5 items-start bg-[var(--fadin-mocha)]/80 border border-[var(--fadin-mocha)] rounded-xl p-4 backdrop-blur-3xl">
                    <div className="flex flex-col items-center gap-3 w-16">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--mocha)] to-[var(--arabica-brown)] text-white font-semibold">
                        {idx + 1}
                      </div>
                      <div className="text-xs text-gray-500 text-center">{String(step.title).split(' ')[0]}</div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:gap-6">
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-800">{step.title}</h4>
                          {('bullets' in step && Array.isArray((step as any).bullets)) ? (
                            <ul className="mt-2 ml-4 list-disc text-gray-700 space-y-1">
                              {(step as any).bullets.map((b: string, i: number) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-2 text-gray-700">{(step as any).description}</p>
                          )}
                        </div>

                        <div className="w-[220px] flex-shrink-0">
                          <div className="h-40 rounded-lg overflow-hidden border border-white/8 bg-gray-100">
                            <img
                              src={(step as any).image as string}
                              alt={step.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer pro tips */}
              <div className="mt-6 p-4 rounded-lg bg-[var(--arabica-brown)]/50 border border-[var(--arabica-brown)]/80">
                <h5 className="font-semibold text-gray-800 mb-2">Pro Tips</h5>
                <ul className="list-disc ml-5 text-gray-700 space-y-1 text-sm">
                  <li>Ensure even lighting; avoid strong shadows or overexposure.</li>
                  <li>Use flash for sharper morphological features when appropriate.</li>
                  <li>Keep consistent distance and angle across images for better comparisons.</li>
                  <li>Preview images before sending to avoid re-submissions.</li>
                </ul>
              </div>
            </div>

 
          </div>
        </div>
      )}
    </>
  );
};

export default UploadSamples;