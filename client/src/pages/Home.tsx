import { Link } from 'react-router-dom';
import { useState } from 'react';
import GlassSurface from '@/components/GlassSurface';
import landingBeans from '@/assets/images/beans_landing.png';
import logo_barakollect from '@/assets/images/barakollect_logo.svg';
import testImg from '@/assets/images/test.jpeg';
import sample1 from '@/assets/images/test.jpeg';
import sample2 from '@/assets/images/test.jpeg';
import sample3 from '@/assets/images/test.jpeg';
import admin_dashboard from '@/assets/images/manual_imgs/admin_dashboard.png';
import admin_user_mgt from '@/assets/images/manual_imgs/admin_user_mgt.png';
import admin_gallery from '@/assets/images/manual_imgs/admin_gallery.png';
import admin_metadata from '@/assets/images/manual_imgs/admin_metadata.png';
import admin_farm_map from '@/assets/images/manual_imgs/admin_farm_map.png';
import admin_activity_logs from '@/assets/images/manual_imgs/admin_activity_logs.png';
import rschr_dashboard from '@/assets/images/manual_imgs/rschr_dashboard.png';
import rschr_gallery from '@/assets/images/manual_imgs/rschr_gallery.png';
import rschr_upload from '@/assets/images/manual_imgs/rschr_upload.png';
import rschr_annotation from '@/assets/images/manual_imgs/rschr_annotation.png';
import rschr_analytics from '@/assets/images/manual_imgs/rschr_analytics.png';
import rschr_farm_map from '@/assets/images/manual_imgs/rschr_map.png';
import frmr_dashboard from '@/assets/images/manual_imgs/frmr_dashboard.png';
import frmr_upload from '@/assets/images/manual_imgs/frmr_upload.png';
import frmr_gallery from '@/assets/images/manual_imgs/frmr_gallery.png';
import frmr_farm_map from '@/assets/images/manual_imgs/frmr_map.png';

import TargetCursor from '@/components/TargetCursor';
import BlurText from "@/components/BlurText";
import Aurora from '@/components/Aurora';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';


// ---------------- Modal Component ----------------
function ImageModal({ isOpen, onClose, imageSrc, title }: { 
  isOpen: boolean; 
  onClose: () => void; 
  imageSrc: string; 
  title: string; 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/30">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-2xl font-bold text-[#3c2715] pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="button-accent w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#4b2f1a] text-white hover:opacity-80 transition flex-shrink-0 text-sm sm:text-base"
          >
            ✕
          </button>
        </div>
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-auto rounded-xl sm:rounded-2xl border border-white/30"
        />
      </div>
    </div>
  );
}

// ---------------- Landing Section ----------------
function LandingSection({ onSwitch }: { onSwitch: () => void }) {
  return (
    <div className="cursor min-h-screen bg-gradient-to-b from-[#f6f0ea] to-[#e8ddd1] relative overflow-hidden">
      <div className="hidden md:block">
      <TargetCursor 
        spinDuration={8}
        hideDefaultCursor={window.innerWidth >= 768}
        parallaxOn={true}
      />
      </div>
      
      {/* Background beans blur */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-[#5a3821]/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-80 h-80 bg-[#d3b79f]/30 rounded-full blur-2xl" />
        <Aurora 
          colorStops={["#e1c7b2", "#fbe7cb", "#b99e7e"]}
          blend={0.175}
          amplitude={0.3}
          speed={1}
        />
      </div>

      {/* Glassmorphism Navbar */}
      <div className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-6xl z-51">
      <GlassSurface
        width="100%" 
        backgroundOpacity={0.7}
        borderRadius={16} 
        displace={5}
        redOffset={40}
        blueOffset={10}
        greenOffset={20}
        blur={20}
        brightness={50}
        saturation={1.3}
        distortionScale={-200}
      >
        <nav className="px-4 sm:px-8 py-3 sm:py-4 w-full">
        <div className="flex justify-between items-center w-full">
          <img src={logo_barakollect} alt="BaraKollect" className="h-8 sm:h-12" />
          <div className="flex gap-2 sm:gap-6 items-center">
          <button
            onClick={onSwitch}
            className="cursor-target button-accent text-[#3c2715] hover:text-[#6f4e37] font-medium transition-colors duration-300 text-xs sm:text-base px-2 sm:px-4"
          >
            User Manual
          </button>
          <Link
            to="/login"
            className="cursor-target button px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl bg-[#4b2f1a] text-white shadow-lg hover:opacity-90 hover:scale-105 transition-all duration-300 text-xs sm:text-base"
          >
            Login
          </Link>
          </div>
        </div>
        </nav>
      </GlassSurface>
      </div>

      {/* Full Screen Hero Section */}
      <div className="min-h-screen flex px-4 sm:px-8 pt-20 sm:pt-20 pb-8">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 sm:gap-12 items-center w-full">
        {/* Left side - Text */}
        <div className="z-50 flex flex-col space-y-5 sm:space-y-8 justify-center items-center md:items-start order-2 md:order-1">
        <h2 className="text-4xl !sm:text-s md:text-7xl font-extrabold text-[#3c2715] leading-tight text-center md:!text-left w-full">
          Brew Insights with 
          <span className="flex justify-center md:justify-start text-[#6f4e37] mt-2 text-5xl sm:text-6xl md:text-7xl">
          <BlurText
          text="BaraKollect"
          delay={150}
          animateBy="letters"
          direction="top"
          />
          </span>
        </h2>
        <p className="text-base sm:text-xl text-[#4b382a] leading-relaxed text-center md:text-left max-w-lg">
          Your all-in-one collaborative platform for coffee bean collection,
          analysis, and data-driven research — bridging <strong>farmers</strong>,{" "}
          <strong>researchers</strong>, and <strong>admins</strong> in one ecosystem.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 w-full sm:w-auto">
          <Link
          to="/login"
          className="cursor-target z-10 button px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 text-base sm:text-lg font-semibold text-center"
          >
          Get Started
          </Link>
          <button
          onClick={onSwitch}
          className="cursor-target button-secondary px-6 sm:px-8 py-3 sm:py-4 bg-white/30 border border-white/40 text-[#3c2715] backdrop-blur-md rounded-xl hover:opacity-90 hover:scale-105 transition-all duration-300 text-base sm:text-lg font-semibold"
          >
          View User Manual
          </button>
        </div>
        </div>

        {/* Right side - Image */}
        <div className="flex justify-center items-center order-1 md:order-2">
        <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-3xl overflow-hidden border border-white/30 shadow-2xl backdrop-blur-sm bg-white/20 hover:scale-105 transition-transform duration-500">
          <img
          src={landingBeans}
          alt="Coffee beans"
          className="cursor-target w-full h-full object-cover"
          />
        </div>
        </div>
      </div>
      </div>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
      <div className="h-px bg-gradient-to-r from-transparent via-[#4b2f1a]/30 to-transparent"></div>
      </div>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-20">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-4xl font-bold text-[#3c2715] mb-2 sm:mb-4">How It Works</h2>
        <p className="text-sm sm:text-lg text-[#4b382a] px-4">Discover what makes BaraKollect the perfect platform for coffee bean research</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 text-[#3c2715]">
        {[
      {
        title: "Capture",
        desc: "Upload coffee bean images using calibration frames for accurate analysis.",
      },
      {
        title: "Analyze",
        desc: "Detect coffee beans and extract precise morphological measurements.",
      },
      {
        title: "Explore",
        desc: "View interactive dashboards to understand patterns and gain data-driven insights.",
      },
        ].map((item, i) => (
      <div
        key={i}
        className="cursor-target p-5 sm:p-8 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
      >
        <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">{item.title}</h3>
        <p className="text-sm sm:text-base opacity-90">{item.desc}</p>
      </div>
        ))}
      </div>
      </section>



      {/* Footer */}
      <footer className="text-center text-xs sm:text-sm py-6 sm:py-8 text-[#4b382a] bg-white/10 backdrop-blur-md px-4">
      © {new Date().getFullYear()} BaraKollect — Crafted by Razberie ☕
      </footer>
    </div>
  );
}

// ---------------- User Manual Section ----------------
function UserManualSection({ onBack }: { onBack: () => void }) {
  const [isZipping, setIsZipping] = useState(false);
  const [modalImage, setModalImage] = useState<{ src: string; title: string } | null>(null);
  const sampleImages = [sample1, sample2, sample3];

  const handleZipDownload = async (images: string[], zipName: string) => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder("samples");
      const fetchAndAdd = images.map(async (src, idx) => {
        const res = await fetch(src);
        const blob = await res.blob();
        const name = `sample-${idx + 1}.jpg`;
        folder?.file(name, blob);
      });
      await Promise.all(fetchAndAdd);
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, zipName);
    } finally {
      setIsZipping(false);
    }
  };

  const adminRoutes = [
    {
      path: "/admin/dashboard",
      title: "Admin Dashboard",
      description: "Overview of system KPIs, user statistics, and app-wide data management.",
      useCases: ["Monitor system health", "View analytics", "Track user activity"],
      imgSrc: admin_dashboard
    },
    {
      path: "/admin/user-management",
      title: "User Management",
      description: "Add, edit, and manage user accounts across all roles.",
      useCases: ["Create new users", "Edit user permissions", "Deactivate accounts"],
      imgSrc: admin_user_mgt
    },
    {
      path: "/admin/gallery",
      title: "Admin Gallery",
      description: "Approve, export, and manage all bean data submissions.",
      useCases: ["Review submissions", "Export datasets", "Quality control"],
      imgSrc: admin_gallery
    },
    {
      path: "/admin/metadata",
      title: "Beans Metadata",
      description: "Bulk-edit and validate morphological data records.",
      useCases: ["Edit metadata", "Validate records", "Data cleanup"],
      imgSrc: admin_metadata
    },
    {
      path: "/admin/farm-map",
      title: "Admin Farm Map",
      description: "Geographic visualization of all farm locations and submissions.",
      useCases: ["View farm locations", "Analyze geographic data", "Regional insights"],
      imgSrc: admin_farm_map
    },
    {
      path: "/admin/monitoring",
      title: "System Monitoring",
      description: "Monitor system performance, server health, and resource usage.",
      useCases: ["Check server status", "Monitor performance", "Resource management"],
      imgSrc: admin_dashboard //to change
    },
    {
      path: "/admin/activity-logs",
      title: "Activity Logs",
      description: "Track all system activities and user actions for auditing.",
      useCases: ["Audit trails", "Security monitoring", "User behavior analysis"],
      imgSrc: admin_activity_logs
    },
    {
      path: "/admin/settings",
      title: "System Settings",
      description: "Configure system-wide settings and application parameters.",
      useCases: ["Update configurations", "Manage settings", "System maintenance"],
      imgSrc: admin_dashboard //to change
    }
  ];

  const researcherRoutes = [
    {
      path: "/researcher/dashboard",
      title: "Researcher Dashboard",
      description: "Access analytics, visualizations, and research insights.",
      useCases: ["View research data", "Access analytics", "Generate reports"],
      imgSrc: rschr_dashboard 
    },
    {
      path: "/researcher/gallery",
      title: "Beans Gallery",
      description: "Validate, annotate, and analyze coffee bean datasets.",
      useCases: ["Validate submissions", "Add annotations", "Research analysis"],
      imgSrc: rschr_gallery
    },
    {
      path: "/researcher/upload-image",
      title: "Upload Samples",
      description: "Upload coffee bean images for research purposes.",
      useCases: ["Upload research samples", "Add calibration data", "Submit annotations"],
      imgSrc: rschr_upload
    },
    {
      path: "/researcher/annotations",
      title: "Annotations",
      description: "Create and manage morphological annotations for bean samples.",
      useCases: ["Add annotations", "Edit measurements", "Research notes"],
      imgSrc: rschr_annotation
    },
    {
      path: "/researcher/analytics",
      title: "Analytics",
      description: "Generate morphological reports and statistical analysis.",
      useCases: ["Generate reports", "Statistical analysis", "Research insights"],
      imgSrc: rschr_analytics
    },
    {
      path: "/researcher/farm-map",
      title: "Farm Map",
      description: "Geographic visualization of farm locations and sample origins.",
      useCases: ["View sample origins", "Geographic analysis", "Location insights"],
      imgSrc: rschr_farm_map
    }
  ];

  const farmerRoutes = [
    {
      path: "/farmer/dashboard",
      title: "Farmer Dashboard",
      description: "View farm submissions summary and personal analytics.",
      useCases: ["Track submissions", "View personal stats", "Farm overview"],
      imgSrc: frmr_dashboard
    },
    {
      path: "/farmer/upload-image",
      title: "Upload Images",
      description: "Submit coffee bean photos with calibration frames.",
      useCases: ["Upload bean photos", "Add farm details", "Submit samples"],
      imgSrc: frmr_upload
    },
    {
      path: "/farmer/gallery",
      title: "Farmer Gallery",
      description: "Review and manage your uploaded coffee bean samples.",
      useCases: ["View submissions", "Edit details", "Track status"],
      imgSrc: frmr_gallery
    },
    {
      path: "/farmer/farm-map",
      title: "Farm Map",
      description: "View your farm location and submitted sample locations.",
      useCases: ["View farm location", "Track samples", "Geographic data"],
      imgSrc: frmr_farm_map
    }
  ];

  const RouteTable = ({ routes, title, bgColor }: { routes: any[], title: string, bgColor: string }) => (
    <div className={`bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-4 sm:p-8 shadow-lg space-y-4 sm:space-y-6`}>
      <h3 className="text-xl sm:text-3xl font-bold text-[#3c2715] mb-4 sm:mb-6">{title}</h3>
      <div className="space-y-3 sm:space-y-4">
        {routes.map((route, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 p-4 sm:p-6 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300">
            {/* Image */}
            <div className="md:col-span-1">
              <img
                src={route.imgSrc}
                alt={route.title}
                className="w-full h-24 sm:h-32 object-cover rounded-xl border border-white/30 cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => setModalImage({ src: route.imgSrc, title: route.title })}
              />
            </div>
            
            {/* Content */}
            <div className="md:col-span-2 space-y-2 sm:space-y-3">
              <div>
                <h4 className="text-base sm:text-xl font-semibold text-[#3c2715] mb-1 sm:mb-2">{route.title}</h4>
                <p className="text-xs sm:text-sm bg-[#4b2f1a]/20 px-2 sm:px-3 py-1 rounded-lg inline-block font-mono text-[#3c2715] break-all">
                  {route.path}
                </p>
              </div>
              
              <p className="text-sm sm:text-base text-[#4b382a] leading-relaxed">{route.description}</p>
              
              <div>
                <h5 className="font-semibold text-[#3c2715] mb-1 sm:mb-2 text-sm sm:text-base">Key Functions:</h5>
                <ul className="list-disc list-inside text-xs sm:text-sm text-[#4b382a] space-y-1">
                  {route.useCases.map((useCase: string, i: number) => (
                    <li key={i}>{useCase}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3ede6] to-[#e3d7c8] text-[#3c2715] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-20 w-72 h-72 bg-[#c7a27c]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-20 w-96 h-96 bg-[#7b4b2a]/30 rounded-full blur-3xl" />
      </div>

      {/* Glassmorphism Navbar */}
      <div className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-6xl z-40">
        <GlassSurface
          width="100%" 
          backgroundOpacity={0.5}
          borderRadius={16} 
          displace={5}
          redOffset={40}
          blueOffset={10}
          greenOffset={20}
          blur={20}
          brightness={50}
          saturation={1.3}
          distortionScale={-200}
        >
          <nav className="px-4 sm:px-8 py-3 sm:py-4 w-full">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 sm:gap-2">
                  <img src="/src/assets/images/barakollect_logo.svg" alt="BaraKollect" className="h-8 sm:h-12" />
                  <h1 className="text-base sm:text-2xl !font-normal text-[var(--gray)]">Manual</h1>
              </div>

              <button
                onClick={onBack}
                className="px-3 sm:px-6 py-1.5 sm:py-2 bg-[#4b2f1a] text-white rounded-xl shadow-lg hover:opacity-90 hover:scale-105 transition-all duration-300 text-xs sm:text-base"
              >
                Back to Home
              </button>
            </div>
          </nav>
        </GlassSurface>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-40 relative z-10 space-y-8 sm:space-y-12">
        <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-5xl font-bold text-[#3c2715] px-4">User Manual & Routes Guide</h2>
          <p className="text-sm sm:text-xl text-[#4b382a] max-w-3xl mx-auto px-4">
            Comprehensive guide to all available routes and functionalities for each user role in BaraKollect.
          </p>
        </div>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-[#4b2f1a]/30 to-transparent"></div>
      </div>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 text-[#3c2715]">
        {[
          {
            title: "Admin",
            desc: "Manage users and image submissions, monitor system, and oversee all platform activities.",
          },
          {
            title: "Researcher",
            desc: "Validate bean data, create annotations, generate analytics, and conduct morphological research.",
          },
          {
            title: "Farmer",
            desc: "Upload coffee bean images, track submissions, and view your farm's contribution to research.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="p-5 sm:p-8 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">{item.title}</h3>
            <p className="text-sm sm:text-base opacity-90">{item.desc}</p>
          </div>
        ))}
      </section>

        {/* Admin Section */}
        <RouteTable routes={adminRoutes} title="Admin Routes" bgColor="bg-red-100" />

        {/* Researcher Section */}
        <RouteTable routes={researcherRoutes} title="Researcher Routes" bgColor="bg-green-100" />

        {/* Farmer Section */}
        <RouteTable routes={farmerRoutes} title="Farmer Routes" bgColor="bg-blue-100" />

        {/* Sample Downloads */}
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-4 sm:p-8 shadow-lg space-y-4 sm:space-y-6">
          <h3 className="text-xl sm:text-3xl font-bold text-[#3c2715]">Sample Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 bg-white/30 backdrop-blur-sm rounded-2xl">
              <h4 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Farmer Sample Images</h4>
              <p className="text-xs sm:text-sm text-[#4b382a] mb-3 sm:mb-4">Download sample coffee bean images for testing upload functionality.</p>
              <button
                onClick={() => handleZipDownload(sampleImages, "farmer-sample.zip")}
                disabled={isZipping}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-[#6f4e37] text-white rounded-lg shadow hover:opacity-90 hover:scale-105 transition-all duration-300 disabled:opacity-50 text-sm sm:text-base"
              >
                {isZipping ? "Preparing..." : "Download Farmer Samples"}
              </button>
            </div>
            
            <div className="p-4 sm:p-6 bg-white/30 backdrop-blur-sm rounded-2xl">
              <h4 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Research Sample Images</h4>
              <p className="text-xs sm:text-sm text-[#4b382a] mb-3 sm:mb-4">Download research-grade samples for annotation and analysis testing.</p>
              <button
                onClick={() => handleZipDownload(sampleImages, "researcher-sample.zip")}
                disabled={isZipping}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-[#4a6b3f] text-white rounded-lg shadow hover:opacity-90 hover:scale-105 transition-all duration-300 disabled:opacity-50 text-sm sm:text-base"
              >
                {isZipping ? "Preparing..." : "Download Research Samples"}
              </button>
            </div>
          </div>
        </div>

        {/* Login Credentials */}
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-4 sm:p-8 shadow-lg">
          <h3 className="text-xl sm:text-3xl font-bold text-[#3c2715] mb-4 sm:mb-6">Login Credentials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {[
              { role: "Researcher", email: "bernableedimasangayunan@skirt.com", password: "damiungur" },
              { role: "Farmer", email: "johnrazecschool@gmail.com", password: "jrazec" }
            ].map((cred, idx) => (
              <div key={idx} className="p-4 sm:p-6 bg-white/30 backdrop-blur-sm rounded-2xl">
                <h4 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-[#3c2715]">{cred.role}</h4>
                <div className="space-y-2 font-mono text-xs sm:text-sm">
                  <div className="bg-[#4b2f1a]/20 px-2 sm:px-3 py-2 rounded break-all">
                    <strong>Email:</strong> {cred.email}
                  </div>
                  <div className="bg-[#4b2f1a]/20 px-2 sm:px-3 py-2 rounded">
                    <strong>Password:</strong> {cred.password}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={modalImage !== null}
        onClose={() => setModalImage(null)}
        imageSrc={modalImage?.src || ""}
        title={modalImage?.title || ""}
      />
    </div>
  );
}

// ---------------- Main Export ----------------
export default function Home() {
  const [showManual, setShowManual] = useState(false);

  return (
    <>
      

      {showManual ? (
        <UserManualSection onBack={() => setShowManual(false)} />
      ) : (
        <LandingSection onSwitch={() => setShowManual(true)} />
      )}
    </>
  );
}
