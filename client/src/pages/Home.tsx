import { Link } from 'react-router-dom';
import { useState } from 'react';
import GlassSurface from '@/components/GlassSurface';
// To change these badet
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-[#3c2715]">{title}</h3>
          <button
            onClick={onClose}
            className="button-accent w-10 h-10 rounded-full bg-[#4b2f1a] text-white hover:opacity-80 transition"
          >
            ✕
          </button>
        </div>
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-auto rounded-2xl border border-white/30"
        />
      </div>
    </div>
  );
}

// ---------------- Landing Section ----------------
function LandingSection({ onSwitch }: { onSwitch: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6f0ea] to-[#e8ddd1] relative overflow-hidden">
      {/* Background beans blur */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-[#5a3821]/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-80 h-80 bg-[#d3b79f]/30 rounded-full blur-2xl" />
      </div>

      {/* Glassmorphism Navbar */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-6xl z-50">
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
          <nav className="px-8 py-4 w-full">
            <div className="flex justify-between items-center w-full">
              <img src={logo_barakollect} alt="BaraKollect" className="h-12" />
              <div className="flex gap-6 items-center">
                <button
                  onClick={onSwitch}
                  className="button-accent text-[#3c2715] hover:text-[#6f4e37] font-medium transition-colors duration-300"
                >
                  User Manual
                </button>
                <Link
                  to="/login"
                  className="button px-6 py-2 rounded-xl bg-[#4b2f1a] text-white shadow-lg hover:opacity-90 hover:scale-105 transition-all duration-300"
                >
                  Login
                </Link>
              </div>
            </div>
          </nav>
        </GlassSurface>
      </div>

      {/* Full Screen Hero Section */}
      <div className="h-screen flex items-center justify-center px-8 pt-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Text */}
          <div className="space-y-8">
            <h2 className="text-6xl md:text-7xl font-extrabold text-[#3c2715] leading-tight">
              Brew Insights with 
              <span className="block text-[#6f4e37]">BaraKollect</span>
            </h2>
            <p className="text-xl text-[#4b382a] leading-relaxed">
              Your all-in-one collaborative platform for coffee bean collection,
              analysis, and data-driven research — bridging <strong>farmers</strong>,{" "}
              <strong>researchers</strong>, and <strong>admins</strong> in one ecosystem.
            </p>
            <div className="flex gap-6">
              <Link
                to="/login"
                className="z-10 button px-8 py-4  rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 text-lg font-semibold"
              >
                Get Started
              </Link>
              <button
                onClick={onSwitch}
                className="button-secondary px-8 py-4 bg-white/30 border border-white/40 text-[#3c2715] backdrop-blur-md rounded-xl hover:opacity-90 hover:scale-105 transition-all duration-300 text-lg font-semibold"
              >
                View User Manual
              </button>
            </div>
          </div>

          {/* Right side - Image */}
          <div className="flex justify-center">
            <div className="w-96 h-96 rounded-3xl overflow-hidden border border-white/30 shadow-2xl backdrop-blur-sm bg-white/20 hover:scale-105 transition-transform duration-500">
              <img
                src={"https://www.teofilocoffeecompany.com/wp-content/uploads/2025/04/COFFEEBEANS_GREENBEANS_8411b54e-c449-4525-990a-489941b9644a.jpg"}
                alt="Coffee cup"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>



      {/* Footer */}
      <footer className="text-center text-sm py-8 text-[#4b382a] bg-white/10 backdrop-blur-md">
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
    <div className={`bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-8 shadow-lg space-y-6`}>
      <h3 className="text-3xl font-bold text-[#3c2715] mb-6">{title}</h3>
      <div className="space-y-4">
        {routes.map((route, idx) => (
          <div key={idx} className="grid md:grid-cols-3 gap-6 p-6 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300">
            {/* Image */}
            <div className="md:col-span-1">
              <img
                src={route.imgSrc}
                alt={route.title}
                className="w-full h-32 object-cover rounded-xl border border-white/30 cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => setModalImage({ src: route.imgSrc, title: route.title })}
              />
            </div>
            
            {/* Content */}
            <div className="md:col-span-2 space-y-3">
              <div>
                <h4 className="text-xl font-semibold text-[#3c2715] mb-2">{route.title}</h4>
                <p className="text-sm bg-[#4b2f1a]/20 px-3 py-1 rounded-lg inline-block font-mono text-[#3c2715]">
                  {route.path}
                </p>
              </div>
              
              <p className="text-[#4b382a] leading-relaxed">{route.description}</p>
              
              <div>
                <h5 className="font-semibold text-[#3c2715] mb-2">Key Functions:</h5>
                <ul className="list-disc list-inside text-sm text-[#4b382a] space-y-1">
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
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-6xl z-40">
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
          <nav className="px-8 py-4 w-full">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                  <img src="/src/assets/images/barakollect_logo.svg" alt="BaraKollect" className="h-12" />
                  <h1 className="text-2xl !font-normal text-[var(--gray)]">Manual</h1>
              </div>

              <button
                onClick={onBack}
                className="px-6 py-2 bg-[#4b2f1a] text-white rounded-xl shadow-lg hover:opacity-90 hover:scale-105 transition-all duration-300"
              >
                Back to Home
              </button>
            </div>
          </nav>
        </GlassSurface>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-40 relative z-10 space-y-12">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-5xl font-bold text-[#3c2715]">User Manual & Routes Guide</h2>
          <p className="text-xl text-[#4b382a] max-w-3xl mx-auto">
            Comprehensive guide to all available routes and functionalities for each user role in BaraKollect.
          </p>
        </div>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-8 py-20 grid md:grid-cols-3 gap-8 text-[#3c2715]">
        {[
          {
            title: "Capture",
            desc: "Upload coffee bean images using calibration frames for accurate analysis.",
          },
          {
            title: "Analyze",
            desc: "Researchers can validate, annotate, and generate morphological insights.",
          },
          {
            title: "Manage",
            desc: "Admins oversee the system, datasets, and collaborative workflows.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="p-8 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
            <p className="text-base opacity-90">{item.desc}</p>
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
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-8 shadow-lg space-y-6">
          <h3 className="text-3xl font-bold text-[#3c2715]">Sample Resources</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white/30 backdrop-blur-sm rounded-2xl">
              <h4 className="text-xl font-semibold mb-3">Farmer Sample Images</h4>
              <p className="text-sm text-[#4b382a] mb-4">Download sample coffee bean images for testing upload functionality.</p>
              <button
                onClick={() => handleZipDownload(sampleImages, "farmer-sample.zip")}
                disabled={isZipping}
                className="px-6 py-3 bg-[#6f4e37] text-white rounded-lg shadow hover:opacity-90 hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                {isZipping ? "Preparing..." : "Download Farmer Samples"}
              </button>
            </div>
            
            <div className="p-6 bg-white/30 backdrop-blur-sm rounded-2xl">
              <h4 className="text-xl font-semibold mb-3">Research Sample Images</h4>
              <p className="text-sm text-[#4b382a] mb-4">Download research-grade samples for annotation and analysis testing.</p>
              <button
                onClick={() => handleZipDownload(sampleImages, "researcher-sample.zip")}
                disabled={isZipping}
                className="px-6 py-3 bg-[#4a6b3f] text-white rounded-lg shadow hover:opacity-90 hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                {isZipping ? "Preparing..." : "Download Research Samples"}
              </button>
            </div>
          </div>
        </div>

        {/* Login Credentials */}
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-8 shadow-lg">
          <h3 className="text-3xl font-bold text-[#3c2715] mb-6">Login Credentials</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { role: "Admin", email: "admin@example.com", password: "Admin123!" },
              { role: "Researcher", email: "researcher@example.com", password: "Research123!" },
              { role: "Farmer", email: "farmer@example.com", password: "Farmer123!" }
            ].map((cred, idx) => (
              <div key={idx} className="p-6 bg-white/30 backdrop-blur-sm rounded-2xl">
                <h4 className="text-xl font-semibold mb-3 text-[#3c2715]">{cred.role}</h4>
                <div className="space-y-2 font-mono text-sm">
                  <div className="bg-[#4b2f1a]/20 px-3 py-2 rounded">
                    <strong>Email:</strong> {cred.email}
                  </div>
                  <div className="bg-[#4b2f1a]/20 px-3 py-2 rounded">
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
  return showManual ? (
    <UserManualSection onBack={() => setShowManual(false)} />
  ) : (
    <LandingSection onSwitch={() => setShowManual(true)} />
  );
}
