import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Helmet><title>Privacy Policy - FSMEC</title></Helmet>
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-black mb-3">1. Information Collection</h2>
          <p>When you sign up for FSMEC, we collect personal information such as your name, date of birth, email address, physical measurements, and location data. This information is necessary to provide scouting and recruitment services.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mb-3">2. How We Use Player Info</h2>
          <p>Your player information (including age, location, and stats) is used to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Match you with relevant recruiters, scouts, and coaches.</li>
            <li>Display on your public profile if you choose to make it public.</li>
            <li>Send you relevant promotional materials and offers from trusted sports partners.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mb-3">3. GDPR & Data Protection Compliance</h2>
          <p>We are fully compliant with the EU General Data Protection Regulation (GDPR) and other relevant data protection laws.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Right to Access:</strong> You may request a copy of all personal data we hold about you.</li>
            <li><strong>Right to Erasure (Right to be Forgotten):</strong> You can request that we delete all your personal data.</li>
            <li><strong>Data Portability:</strong> You have the right to receive your data in a structured, commonly used format.</li>
            <li><strong>Consent:</strong> We only process your data with your explicit consent, which you may withdraw at any time.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mb-3">4. Data Security</h2>
          <p>We implement strict technical and organizational measures to ensure your data is secure against unauthorized access, alteration, or destruction.</p>
        </section>
      </div>
    </div>
  );
}
