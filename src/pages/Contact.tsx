import React from 'react';
import { Mail, MapPin, MessageSquare, Globe, Shield } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Contact Us | FSMEC Sports Network</title>
        <meta name="description" content="Get in touch with FSMEC (International Sports Transformation and Athletic ranking training unit) for sports recruitment, live scouting, support, or partnership inquiries." />
        
        {/* Open Graph / Webgraph SEO Meta Tags */}
        <meta property="og:title" content="Contact Us | FSMEC Sports Network" />
        <meta property="og:description" content="Get in touch with FSMEC (International Sports Transformation and Athletic ranking training unit) for sports recruitment, live scouting, support, or partnership inquiries." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://istartu.com/contact" />
        <meta property="og:image" content="/icon.svg" />
        <meta property="og:site_name" content="FSMEC Sports Network" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Contact Us | FSMEC Sports Network" />
        <meta name="twitter:description" content="Get in touch with FSMEC (International Sports Transformation and Athletic ranking training unit) for sports recruitment, live scouting, support, or partnership inquiries." />
        <meta name="twitter:image" content="/icon.svg" />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Shield className="w-3.5 h-3.5" /> 24/7 Global Scout Support
          </span>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Connect with FSMEC</h1>
          <p className="text-gray-600 max-w-xl mx-auto text-sm leading-relaxed">
            International Sports Transformation and Athletic ranking training unit. Reach out for technical help, recruiter onboarding, or sports marketing collaborations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Email Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-gray-900 tracking-tight border-b border-gray-100 pb-3 flex items-center gap-2">
              <Mail className="text-blue-500 w-5 h-5" /> Direct Email Desks
            </h2>
            
            <div className="space-y-4">
              <div className="group">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">General Support</span>
                <a href="mailto:support@istartu.com" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2">
                  support@istartu.com
                </a>
              </div>
              
              <div className="group">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">NFSMEC Rankings & Verification</span>
                <a href="mailto:support@nfsmec.com" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2">
                  support@nfsmec.com
                </a>
              </div>

              <div className="group">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Garexcell Athletic Media & Sponsorship</span>
                <a href="mailto:sports@garexecell.com" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2">
                  sports@garexecell.com
                </a>
              </div>
            </div>
          </div>

          {/* Socials & Locations Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight border-b border-gray-100 pb-3 flex items-center gap-2">
                <MessageSquare className="text-pink-500 w-5 h-5" /> Official Social Channels
              </h2>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <a 
                  href="https://instagram.com/Garexecell" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 hover:bg-pink-50 border border-gray-100 hover:border-pink-200 text-gray-700 hover:text-pink-600 transition-all text-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  <span className="text-[10px] font-black">Garexecell</span>
                </a>

                <a 
                  href="https://twitter.com/Garexcell" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 text-gray-700 hover:text-blue-500 transition-all text-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                  <span className="text-[10px] font-black">Garexcell</span>
                </a>

                <a 
                  href="https://tiktok.com/@garexcell" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 hover:bg-black hover:text-white border border-gray-100 hover:border-black transition-all text-center"
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-[10px] font-black">@garexcell</span>
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-3">Global Headquarters</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2 font-medium">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" /> Atlanta, Georgia, United States
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" /> London, United Kingdom
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" /> Dallas, Texas, United States
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
